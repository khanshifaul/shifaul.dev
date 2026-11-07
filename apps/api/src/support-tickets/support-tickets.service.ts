import { BadRequestException, ForbiddenException, HttpException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Priority, ReopenStatus, TicketStatus } from "prisma/generated/client";
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../utils/logger/logger.service';
import { PermissionUtils } from '../common/utils/permission.util';
import { StorageService } from '../storage/storage.service';
import { CreateReopenRequestDto } from './dto/create-reopen-request.dto';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { CreateTicketReplyDto } from './dto/create-ticket-reply.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { FileMetadata } from './interfaces/file-metadata.interface';

/**
 * Enhanced error handling utility class
 */
export class SupportTicketErrorHandler {
    static handlePermissionError(error: Error, action: string): never {
        throw new ForbiddenException(`Permission denied for ${action}: ${error.message}`);
    }

    static handleNotFoundError(error: Error, resourceType: string): never {
        throw new NotFoundException(`${resourceType} not found: ${error.message}`);
    }

    static handleValidationError(error: Error): never {
        throw new BadRequestException(`Validation failed: ${error.message}`);
    }
}

@Injectable()
export class SupportTicketsService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly logger: LoggerService,
        private readonly storageService: StorageService,
    ) {
        this.logger.info('SupportTicketsService constructor called');
    }

    /**
     * Upload files to external storage API with enhanced security
     * @param files - Array of multer files
     * @returns Promise<FileMetadata[]> - Array of uploaded file metadata
     */
    private async uploadFilesToExternalAPI(files: Express.Multer.File[]): Promise<FileMetadata[]> {
        if (!this.storageService.isConfigured()) {
            this.logger.error('Cannot upload support ticket attachments: R2 storage is not configured');
            throw new ServiceUnavailableException(
                'File storage is not configured; attachments cannot be uploaded',
            );
        }

        try {
            const uploadedFiles = await Promise.all(
                files.map(file =>
                    this.storageService.uploadFile(
                        file.buffer,
                        file.originalname,
                        file.mimetype,
                        'support-tickets',
                    ),
                ),
            );

            this.logger.info(`Uploaded ${uploadedFiles.length} files to R2`);

            return uploadedFiles.map((uploaded, index) => ({
                id: uploaded.key,
                url: uploaded.fileUrl,
                name: files[index].originalname,
                size: files[index].size,
                mimeType: files[index].mimetype,
            }));
        } catch (error) {
            this.logger.error('Failed to upload files to R2', error.message);
            throw error;
        }
    }

    async createTicket(userId: string, dto: CreateSupportTicketDto, files?: Express.Multer.File[]) {
        try {
            // Upload first: a failed upload must not leave a ticket row behind.
            let fileUrls: string[] = [];
            if (files && files.length > 0) {
                const uploadedFileMetadata = await this.uploadFilesToExternalAPI(files);
                fileUrls = uploadedFileMetadata.map(file => file.url);
            }

            const ticket = await this.prisma.supportTicket.create({
                data: {
                    title: dto.title,
                    description: dto.description,
                    priority: dto.priority || Priority.NORMAL,
                    createdById: userId,
                    fileUrls,
                },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                    replies: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    email: true,
                                    name: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
            });

            this.logger.info(`Support ticket created: ${ticket.id} by user ${userId}`);

            return ticket;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Failed to create support ticket for user ${userId}`, error.message);
            SupportTicketErrorHandler.handleValidationError(error);
        }
    }

    async getTickets(userId: string, query: TicketQueryDto, userRoles: string[] = []) {
        try {
            const { page = 1, limit = 10, status, priority, search, sortBy = 'createdAt', sortOrder = 'desc', assigneeId, creatorId } = query;

            // Build where clause
            const where: any = {};

            // Use PermissionUtils for consistent role checking
            if (!PermissionUtils.isStaff(userRoles)) {
                where.createdById = userId;
            } else {
                // Staff can see all tickets, but can filter by status
                if (status) {
                    where.status = status;
                }
            }

            if (assigneeId) {
                if (!PermissionUtils.isStaff(userRoles) && assigneeId !== userId) {
                    throw new ForbiddenException('You can only filter tickets assigned to yourself');
                }
                where.assignedToId = assigneeId;
            }

            if (creatorId) {
                if (!PermissionUtils.isStaff(userRoles) && creatorId !== userId) {
                    throw new ForbiddenException('You can only filter tickets created by yourself');
                }
                where.createdById = creatorId;
            }

            if (priority) {
                where.priority = priority;
            }

            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ];
            }

            // Get total count for pagination
            const total = await this.prisma.supportTicket.count({ where });

            // Get tickets with pagination
            const tickets = await this.prisma.supportTicket.findMany({
                where,
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                    assignedTo: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                    replies: {
                        take: 1, // Include only the latest reply for preview
                        orderBy: {
                            createdAt: 'desc',
                        },
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    email: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            replies: true,
                        },
                    },
                },
                orderBy: {
                    [sortBy]: sortOrder,
                },
                skip: (page - 1) * limit,
                take: limit,
            });

            return {
                tickets,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            this.logger.error(`Failed to get tickets for user ${userId}`, error.message);
            if (error instanceof ForbiddenException || error instanceof BadRequestException) {
                throw error;
            }
            throw error;
        }
    }

    async getTicketById(ticketId: string, userId: string, userRoles: string[] = []) {
        try {
            const ticket = await this.prisma.supportTicket.findUnique({
                where: { id: ticketId },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                    assignedTo: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                    replies: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    email: true,
                                    name: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                    reopenRequests: {
                        include: {
                            requestedBy: {
                                select: {
                                    id: true,
                                    email: true,
                                    name: true,
                                },
                            },
                            reviewedBy: {
                                select: {
                                    id: true,
                                    email: true,
                                    name: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    },
                },
            });

            if (!ticket) {
                throw new NotFoundException('Ticket not found');
            }

            // Use PermissionUtils for consistent role checking
            if (!PermissionUtils.isStaff(userRoles) && ticket.createdById !== userId) {
                throw new ForbiddenException('You can only view your own tickets');
            }

            return ticket;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            this.logger.error(`Failed to get ticket ${ticketId} for user ${userId}`, error.message);
            throw error;
        }
    }

    async updateTicket(ticketId: string, dto: UpdateSupportTicketDto, userId: string, userRoles: string[] = []) {
        try {
            // Check if ticket exists and user has permission
            const ticket = await this.getTicketById(ticketId, userId, userRoles);

            // Use PermissionUtils for consistent role checking
            PermissionUtils.requireStaff(userRoles);

            const updateData: any = {};

            if (dto.title !== undefined) updateData.title = dto.title;
            if (dto.description !== undefined) updateData.description = dto.description;
            if (dto.priority !== undefined) updateData.priority = dto.priority;
            if (dto.status !== undefined) {
                updateData.status = dto.status;
                // Set closedAt when status changes to CLOSED or RESOLVED
                if (dto.status === TicketStatus.CLOSED || dto.status === TicketStatus.RESOLVED) {
                    updateData.closedAt = new Date();
                } else if (ticket.status === TicketStatus.CLOSED || ticket.status === TicketStatus.RESOLVED) {
                    updateData.closedAt = null;
                }
            }

            const updatedTicket = await this.prisma.supportTicket.update({
                where: { id: ticketId },
                data: updateData,
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                    assignedTo: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            });

            this.logger.info(`Ticket ${ticketId} updated by user ${userId}`);

            return updatedTicket;
        } catch (error) {
            if (error instanceof ForbiddenException || error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Failed to update ticket ${ticketId} for user ${userId}`, error.message);
            throw error;
        }
    }

    async assignTicket(ticketId: string, assigneeId: string | null, userId: string, userRoles: string[] = []) {
        try {
            // Use PermissionUtils for consistent role checking
            PermissionUtils.requireStaff(userRoles);

            // Check if ticket exists
            const ticket = await this.prisma.supportTicket.findUnique({
                where: { id: ticketId },
            });

            if (!ticket) {
                throw new NotFoundException('Ticket not found');
            }

            // Check if assignee exists and has staff role
            if (assigneeId) {
                const assignee = await this.prisma.user.findUnique({
                    where: { id: assigneeId },
                });

                if (!assignee) {
                    throw new NotFoundException('Assignee not found');
                }

                // Use PermissionUtils for role checking
                if (!PermissionUtils.isStaff(assignee.roles)) {
                    throw new BadRequestException('Assignee must be a staff member');
                }
            }

            const updatedTicket = await this.prisma.supportTicket.update({
                where: { id: ticketId },
                data: {
                    assignedToId: assigneeId || null,
                    status: assigneeId ? TicketStatus.IN_PROGRESS : TicketStatus.OPEN,
                },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                    assignedTo: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            });

            this.logger.info(`Ticket ${ticketId} assigned to ${assigneeId || 'nobody'} by user ${userId}`);

            return updatedTicket;
        } catch (error) {
            if (error instanceof ForbiddenException || error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to assign ticket ${ticketId} for user ${userId}`, error.message);
            throw error;
        }
    }

    async createReply(ticketId: string, userId: string, dto: CreateTicketReplyDto, userRoles: string[] = [], files?: Express.Multer.File[]) {
        try {
            // Check if ticket exists and user has permission
            const ticket = await this.getTicketById(ticketId, userId, userRoles);

            // Use PermissionUtils for consistent role checking
            const isStaff = PermissionUtils.isStaff(userRoles);
            const isTicketOwner = ticket.createdById === userId;
            const isAssignedStaff = isStaff && ticket.assignedToId === userId;

            // Internal replies can only be made by assigned staff
            if (dto.isInternal && !isAssignedStaff) {
                throw new ForbiddenException('Only assigned staff members can create internal replies');
            }

            // Non-internal replies can be made by ticket owner or assigned staff
            if (!dto.isInternal && !isTicketOwner && !isAssignedStaff) {
                throw new ForbiddenException('You can only reply to your own tickets or tickets assigned to you');
            }

            // Upload first: a failed upload must not leave a reply row behind.
            let fileUrls: string[] = [];
            if (files && files.length > 0) {
                const uploadedFileMetadata = await this.uploadFilesToExternalAPI(files);
                fileUrls = uploadedFileMetadata.map(file => file.url);
            }

            const reply = await this.prisma.ticketReply.create({
                data: {
                    ticketId,
                    authorId: userId,
                    content: dto.content,
                    isInternal: dto.isInternal || false,
                    fileUrls,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            });

            // Update ticket's updatedAt timestamp
            await this.prisma.supportTicket.update({
                where: { id: ticketId },
                data: { updatedAt: new Date() },
            });

            this.logger.info(`Reply created for ticket ${ticketId} by user ${userId}`);

            return reply;
        } catch (error) {
            if (error instanceof ForbiddenException || error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Failed to create reply for ticket ${ticketId} by user ${userId}`, error.message);
            throw error;
        }
    }

    async createReopenRequest(ticketId: string, userId: string, dto: CreateReopenRequestDto) {
        try {
            // Check if ticket exists and user has permission
            const ticket = await this.getTicketById(ticketId, userId);

            // Only ticket owner can create reopen requests
            if (ticket.createdById !== userId) {
                throw new ForbiddenException('You can only reopen your own tickets');
            }

            // Check if ticket is closed
            if (ticket.status !== TicketStatus.CLOSED) {
                throw new BadRequestException('Only closed tickets can be reopened');
            }

            // Check if there's already a pending reopen request
            const existingRequest = await this.prisma.ticketReopenRequest.findFirst({
                where: {
                    ticketId,
                    status: ReopenStatus.PENDING,
                },
            });

            if (existingRequest) {
                throw new BadRequestException('A reopen request is already pending for this ticket');
            }

            const reopenRequest = await this.prisma.ticketReopenRequest.create({
                data: {
                    ticketId,
                    requestedById: userId,
                    reason: dto.reason,
                },
                include: {
                    requestedBy: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            });

            this.logger.info(`Reopen request created for ticket ${ticketId} by user ${userId}`);

            return reopenRequest;
        } catch (error) {
            if (error instanceof ForbiddenException || error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to create reopen request for ticket ${ticketId} by user ${userId}`, error.message);
            throw error;
        }
    }

    async processReopenRequest(requestId: string, approve: boolean, userId: string, userRoles: string[] = []) {
        try {
            // Use PermissionUtils for consistent role checking
            PermissionUtils.requireStaff(userRoles);

            // Get the reopen request
            const reopenRequest = await this.prisma.ticketReopenRequest.findUnique({
                where: { id: requestId },
                include: {
                    ticket: true,
                },
            });

            if (!reopenRequest) {
                throw new NotFoundException('Reopen request not found');
            }

            if (reopenRequest.status !== ReopenStatus.PENDING) {
                throw new BadRequestException('This reopen request has already been processed');
            }

            const newStatus = approve ? ReopenStatus.APPROVED : ReopenStatus.REJECTED;

            // Update the reopen request
            const updatedRequest = await this.prisma.ticketReopenRequest.update({
                where: { id: requestId },
                data: {
                    status: newStatus,
                    reviewedById: userId,
                    reviewedAt: new Date(),
                },
                include: {
                    ticket: true,
                    requestedBy: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                    reviewedBy: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            });

            // If approved, reopen the ticket
            if (approve) {
                await this.prisma.supportTicket.update({
                    where: { id: reopenRequest.ticketId },
                    data: {
                        status: TicketStatus.OPEN,
                        closedAt: null,
                    },
                });

                this.logger.info(`Ticket ${reopenRequest.ticketId} reopened via request ${requestId}`);
            } else {
                this.logger.info(`Reopen request ${requestId} rejected`);
            }

            return updatedRequest;
        } catch (error) {
            if (error instanceof ForbiddenException || error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to process reopen request ${requestId} for user ${userId}`, error.message);
            throw error;
        }
    }

    async getStats(userId: string, userRoles: string[] = []) {
        try {
            const baseWhere = PermissionUtils.isStaff(userRoles) ? {} : { createdById: userId };

            const [totalTickets, openTickets, inProgressTickets, resolvedTickets, closedTickets] = await Promise.all([
                this.prisma.supportTicket.count({ where: baseWhere }),
                this.prisma.supportTicket.count({ where: { ...baseWhere, status: TicketStatus.OPEN } }),
                this.prisma.supportTicket.count({ where: { ...baseWhere, status: TicketStatus.IN_PROGRESS } }),
                this.prisma.supportTicket.count({ where: { ...baseWhere, status: TicketStatus.RESOLVED } }),
                this.prisma.supportTicket.count({ where: { ...baseWhere, status: TicketStatus.CLOSED } }),
            ]);

            return {
                total: totalTickets,
                open: openTickets,
                inProgress: inProgressTickets,
                resolved: resolvedTickets,
                closed: closedTickets,
            };
        } catch (error) {
            this.logger.error(`Failed to get ticket stats for user ${userId}`, error.message);
            throw error;
        }
    }

    /**
     * Remove file from ticket
     * Note: Since we now use external storage, this method simply removes the file URL from the ticket
     * The actual file deletion should be handled by the external storage API if needed
     * @param ticketId - Ticket ID
     * @param fileUrl - File URL to remove
     * @param userId - User ID for validation
     */
    async removeFileFromTicket(ticketId: string, fileUrl: string, userId: string, userRoles: string[] = []) {
        try {
            // Validate ticket exists and user has access
            const ticket = await this.getTicketById(ticketId, userId, userRoles);

            // Check if file is attached to this ticket using fileUrls array
            if (!ticket.fileUrls || !ticket.fileUrls.includes(fileUrl)) {
                throw new BadRequestException('File is not attached to this ticket');
            }

            // Remove file URL from ticket's fileUrls array
            const updatedFileUrls = ticket.fileUrls.filter(url => url !== fileUrl);
            await this.prisma.supportTicket.update({
                where: { id: ticketId },
                data: {
                    fileUrls: updatedFileUrls,
                },
            });

            this.logger.info(`Removed file ${fileUrl} from ticket ${ticketId}`);
        } catch (error) {
            this.logger.error(`Failed to remove file ${fileUrl} from ticket ${ticketId}`, error.message);
            throw error;
        }
    }

    /**
     * Remove file from reply
     * Note: Since we now use external storage, this method simply removes the file URL from the reply
     * The actual file deletion should be handled by the external storage API if needed
     * @param ticketId - Ticket ID
     * @param replyId - Reply ID
     * @param fileUrl - File URL to remove
     * @param userId - User ID for validation
     * @param userRoles - User roles
     */
    async removeFileFromReply(ticketId: string, replyId: string, fileUrl: string, userId: string, userRoles: string[] = []) {
        try {
            // Validate ticket and reply exist and user has access
            const ticket = await this.getTicketById(ticketId, userId, userRoles);
            const reply = ticket.replies.find(r => r.id === replyId);
            if (!reply) {
                throw new NotFoundException('Reply not found');
            }

            // Check if file is attached to this reply using fileUrls array
            if (!reply.fileUrls || !reply.fileUrls.includes(fileUrl)) {
                throw new BadRequestException('File is not attached to this reply');
            }

            // Remove file URL from reply's fileUrls array
            const updatedFileUrls = reply.fileUrls.filter(url => url !== fileUrl);
            await this.prisma.ticketReply.update({
                where: { id: replyId },
                data: {
                    fileUrls: updatedFileUrls,
                },
            });

            this.logger.info(`Removed file ${fileUrl} from reply ${replyId}`);
        } catch (error) {
            this.logger.error(`Failed to remove file ${fileUrl} from reply ${replyId}`, error.message);
            throw error;
        }
    }

    /**
     * Enhanced analytics with improved data integrity
     */
    async getEnhancedAnalytics(userId: string, userRoles: string[] = []) {
        try {
            // Use PermissionUtils for consistent role checking
            const baseWhere = PermissionUtils.isStaff(userRoles) ? {} : { createdById: userId };

            const currentDate = new Date();
            const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

            // Enhanced analytics with more comprehensive data
            const [
                totalTickets,
                ticketsByStatus,
                ticketsByPriority,
                ticketsThisMonth,
                ticketsLastMonth,
                resolvedTickets,
                firstStaffReplies
            ] = await Promise.all([
                this.prisma.supportTicket.count({ where: baseWhere }),
                this.prisma.supportTicket.groupBy({
                    by: ['status'],
                    _count: { id: true },
                    where: baseWhere,
                }),
                this.prisma.supportTicket.groupBy({
                    by: ['priority'],
                    _count: { id: true },
                    where: baseWhere,
                }),
                this.prisma.supportTicket.count({
                    where: { ...baseWhere, createdAt: { gte: thisMonth } }
                }),
                this.prisma.supportTicket.count({
                    where: { 
                        ...baseWhere, 
                        createdAt: { gte: lastMonth, lt: thisMonth } 
                    }
                }),
                this.prisma.supportTicket.findMany({
                    where: { 
                        ...baseWhere, 
                        status: TicketStatus.RESOLVED,
                        closedAt: { not: null }
                    },
                    select: { createdAt: true, closedAt: true, priority: true }
                }),
                // A non-internal reply from staff is a first response.
                this.prisma.ticketReply.findMany({
                    where: {
                        isInternal: false,
                        author: { is: { roles: { hasSome: PermissionUtils.STAFF_ROLES } } },
                        ticket: baseWhere,
                    },
                    select: {
                        ticketId: true,
                        createdAt: true,
                        ticket: { select: { createdAt: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                }),
            ]);

            // Calculate average resolution time in hours, overall and per
            // priority, from the closedAt - createdAt proxy.
            let totalResolutionTime = 0;
            const resolutionByPriority = new Map<string, { total: number; count: number }>();
            for (const ticket of resolvedTickets) {
                if (!ticket.closedAt) continue;
                const resolutionTime = ticket.closedAt.getTime() - ticket.createdAt.getTime();
                totalResolutionTime += resolutionTime;
                const bucket = resolutionByPriority.get(ticket.priority) ?? { total: 0, count: 0 };
                bucket.total += resolutionTime;
                bucket.count += 1;
                resolutionByPriority.set(ticket.priority, bucket);
            }

            const avgResolutionTime = resolvedTickets.length > 0 
                ? (totalResolutionTime / resolvedTickets.length) / (1000 * 60 * 60) // Convert to hours
                : null;

            // First response: the earliest non-internal staff reply on each
            // ticket, measured from the ticket's creation, in minutes.
            const repliedTicketIds = new Set<string>();
            const firstResponseTimes: number[] = [];
            for (const reply of firstStaffReplies) {
                if (repliedTicketIds.has(reply.ticketId)) continue;
                repliedTicketIds.add(reply.ticketId);
                firstResponseTimes.push(reply.createdAt.getTime() - reply.ticket.createdAt.getTime());
            }

            const avgFirstResponseTime = firstResponseTimes.length > 0
                ? firstResponseTimes.reduce((sum, time) => sum + time, 0) / firstResponseTimes.length / (1000 * 60) // Convert to minutes
                : null;

            // Calculate growth rate
            const growthRate = ticketsLastMonth > 0 
                ? ((ticketsThisMonth - ticketsLastMonth) / ticketsLastMonth) * 100 
                : 0;

            // Calculate resolution rate
            const resolutionRate = totalTickets > 0 
                ? (resolvedTickets.length / totalTickets) * 100 
                : 0;

            return {
                overview: {
                    totalTickets,
                    openTickets: ticketsByStatus.find(s => s.status === TicketStatus.OPEN)?._count.id || 0,
                    inProgressTickets: ticketsByStatus.find(s => s.status === TicketStatus.IN_PROGRESS)?._count.id || 0,
                    resolvedTickets: ticketsByStatus.find(s => s.status === TicketStatus.RESOLVED)?._count.id || 0,
                    closedTickets: ticketsByStatus.find(s => s.status === TicketStatus.CLOSED)?._count.id || 0,
                    averageResolutionTime: avgResolutionTime === null
                        ? null
                        : Math.round(avgResolutionTime * 100) / 100, // Round to 2 decimal places
                    // SupportTicket has no rating column: null is "not measured".
                    customerSatisfaction: null,
                    firstResponseTime: avgFirstResponseTime === null
                        ? null
                        : Math.round(avgFirstResponseTime * 100) / 100, // Round to 2 decimal places
                },
                trends: {
                    ticketsThisMonth,
                    ticketsLastMonth,
                    growthRate: Math.round(growthRate * 100) / 100, // Round to 2 decimal places
                    resolutionRate: Math.round(resolutionRate * 100) / 100, // Round to 2 decimal places
                },
                byPriority: ticketsByPriority.map(p => {
                    const bucket = resolutionByPriority.get(p.priority);

                    return {
                        priority: p.priority,
                        count: p._count.id || 0,
                        averageResolutionTime: bucket
                            ? Math.round((bucket.total / bucket.count / (1000 * 60 * 60)) * 100) / 100
                            : null,
                    };
                }),
                byAssignee: [], // TODO: Implement assignee analytics
            };
        } catch (error) {
            this.logger.error('Failed to get enhanced ticket analytics', error.message);
            throw error;
        }
    }
}