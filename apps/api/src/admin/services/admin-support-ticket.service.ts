import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AdminSupportTicketService {
  private readonly logger = new Logger(AdminSupportTicketService.name);

  constructor(private readonly prisma: DatabaseService) {}

  // TODO: Implement complete support ticket management service

  async getAllTickets(query: any): Promise<any> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        priority,
        search,
        sortBy,
        sortOrder,
      } = query;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (priority) {
        where.priority = priority;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { createdBy: { email: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const orderBy: any = {};
      if (sortBy) {
        orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      const offset = (page - 1) * limit;

      const tickets = await this.prisma.supportTicket.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, email: true, name: true },
          },
          assignedTo: {
            select: { id: true, email: true, name: true },
          },
          _count: {
            select: { replies: true },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      });

      const total = await this.prisma.supportTicket.count({ where });

      return {
        tickets: tickets.map((ticket) => ({
          id: ticket.id,
          title: ticket.title,
          status: ticket.status,
          priority: ticket.priority,
          userId: ticket.createdById,
          userEmail: ticket.createdBy?.email,
          assignedTo: ticket.assignedTo?.email,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          replyCount: ticket._count.replies,
        })),
        total,
        hasMore: total > offset + tickets.length,
        summary: await this.getTicketSummary(),
      };
    } catch (error) {
      this.logger.error('Failed to fetch support tickets:', error);
      throw error;
    }
  }

  async getTicketById(ticketId: string): Promise<any> {
    try {
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          createdBy: {
            select: { id: true, email: true, name: true },
          },
          assignedTo: {
            select: { id: true, email: true, name: true },
          },
          replies: {
            include: {
              author: {
                select: { id: true, email: true, name: true },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
          reopenRequests: {
            include: {
              requestedBy: {
                select: { id: true, email: true, name: true },
              },
              reviewedBy: {
                select: { id: true, email: true, name: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!ticket) {
        throw new NotFoundException('Support ticket not found');
      }

      return {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        type: ticket.type,
        userId: ticket.createdById,
        userEmail: ticket.createdBy?.email,
        userName: ticket.createdBy?.name,
        assignedTo: ticket.assignedTo?.email,
        assignedToName: ticket.assignedTo?.name,
        assignedAt: ticket.assignedAt,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        closedAt: ticket.closedAt,
        replies: ticket.replies.map((reply) => ({
          id: reply.id,
          content: reply.content,
          isInternal: reply.isInternal,
          authorId: reply.authorId,
          authorEmail: reply.author?.email,
          authorName: reply.author?.name,
          createdAt: reply.createdAt,
          updatedAt: reply.updatedAt,
          fileUrls: reply.fileUrls,
        })),
        reopenRequests: ticket.reopenRequests.map((request) => ({
          id: request.id,
          reason: request.reason,
          status: request.status,
          requestedByEmail: request.requestedBy?.email,
          requestedByName: request.requestedBy?.name,
          reviewedByEmail: request.reviewedBy?.email,
          reviewedByName: request.reviewedBy?.name,
          reviewedAt: request.reviewedAt,
          createdAt: request.createdAt,
        })),
        attachments: ticket.fileUrls,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch support ticket ${ticketId}:`, error);
      throw error;
    }
  }

  async assignTicket(
    ticketId: string,
    assigneeId: string | null,
    adminUserId: string,
    reason?: string,
  ): Promise<any> {
    try {
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        throw new NotFoundException('Support ticket not found');
      }

      const oldAssigneeId = ticket.assignedToId;

      const updatedTicket = await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          assignedToId: assigneeId,
          assignedAt: assigneeId ? new Date() : null,
          updatedAt: new Date(),
        },
        include: {
          assignedTo: {
            select: { id: true, email: true, name: true },
          },
        },
      });

      // Log admin action
      await this.logAdminAction(adminUserId, 'TICKET_ASSIGNMENT', ticketId, {
        oldAssigneeId,
        newAssigneeId: assigneeId,
        reason,
      });

      this.logger.log(
        `Ticket ${ticketId} assigned to ${assigneeId} by admin ${adminUserId}`,
      );

      return {
        id: updatedTicket.id,
        assignedTo: updatedTicket.assignedTo?.email,
        assignedToName: updatedTicket.assignedTo?.name,
        assignedAt: updatedTicket.assignedAt,
        updatedAt: updatedTicket.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to assign ticket ${ticketId}:`, error);
      throw error;
    }
  }

  async updateTicketStatus(
    ticketId: string,
    status: string,
    adminUserId: string,
    priority?: string,
    reason?: string,
    internalNotes?: string,
  ): Promise<any> {
    try {
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        throw new NotFoundException('Support ticket not found');
      }

      const oldStatus = ticket.status;
      const oldPriority = ticket.priority;

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (status) {
        updateData.status = status;
        if (status === 'CLOSED') {
          updateData.closedAt = new Date();
        } else if (status === 'OPEN' && ticket.closedAt) {
          updateData.closedAt = null;
        }
      }

      if (priority) {
        updateData.priority = priority;
      }

      const updatedTicket = await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: updateData,
        include: {
          createdBy: {
            select: { id: true, email: true, name: true },
          },
          assignedTo: {
            select: { id: true, email: true, name: true },
          },
        },
      });

      // Add internal note if provided
      if (internalNotes) {
        await this.addInternalNote(ticketId, internalNotes, adminUserId);
      }

      // Log admin action
      await this.logAdminAction(adminUserId, 'TICKET_STATUS_UPDATE', ticketId, {
        oldStatus,
        newStatus: status,
        oldPriority,
        newPriority: priority,
        reason,
      });

      this.logger.log(
        `Ticket ${ticketId} status updated by admin ${adminUserId}`,
      );

      return {
        id: updatedTicket.id,
        status: updatedTicket.status,
        priority: updatedTicket.priority,
        updatedAt: updatedTicket.updatedAt,
        closedAt: updatedTicket.closedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to update ticket ${ticketId} status:`, error);
      throw error;
    }
  }

  async bulkAssignTickets(
    ticketIds: string[],
    assigneeId: string,
    adminUserId: string,
    reason?: string,
  ): Promise<any> {
    try {
      const results: any[] = [];

      for (const ticketId of ticketIds) {
        try {
          const result = await this.assignTicket(
            ticketId,
            assigneeId,
            adminUserId,
            reason,
          );
          results.push({ ticketId, success: true, result });
        } catch (error: any) {
          results.push({ ticketId, success: false, error: error.message });
        }
      }

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      // Log bulk operation
      await this.logAdminAction(
        adminUserId,
        'BULK_TICKET_ASSIGNMENT',
        `bulk-${Date.now()}`,
        {
          ticketIds,
          assigneeId,
          reason,
          successful,
          failed,
        },
      );

      this.logger.log(
        `Bulk assignment completed by admin ${adminUserId}: ${successful} successful, ${failed} failed`,
      );

      return {
        operationId: `bulk-assign-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        totalTickets: ticketIds.length,
        successful,
        failed,
        results,
      };
    } catch (error) {
      this.logger.error('Bulk assignment failed:', error);
      throw error;
    }
  }

  async bulkUpdateStatus(
    ticketIds: string[],
    status: string,
    adminUserId: string,
    priority?: string,
    reason?: string,
  ): Promise<any> {
    try {
      const results: any[] = [];

      for (const ticketId of ticketIds) {
        try {
          const result = await this.updateTicketStatus(
            ticketId,
            status,
            adminUserId,
            priority,
            reason,
            undefined,
          );
          results.push({ ticketId, success: true, result });
        } catch (error: any) {
          results.push({ ticketId, success: false, error: error.message });
        }
      }

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      // Log bulk operation
      await this.logAdminAction(
        adminUserId,
        'BULK_TICKET_STATUS_UPDATE',
        `bulk-${Date.now()}`,
        {
          ticketIds,
          status,
          priority,
          reason,
          successful,
          failed,
        },
      );

      this.logger.log(
        `Bulk status update completed by admin ${adminUserId}: ${successful} successful, ${failed} failed`,
      );

      return {
        operationId: `bulk-status-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        totalTickets: ticketIds.length,
        successful,
        failed,
        results,
      };
    } catch (error) {
      this.logger.error('Bulk status update failed:', error);
      throw error;
    }
  }

  async addInternalNote(
    ticketId: string,
    content: string,
    adminUserId: string,
    noteType: string = 'GENERAL',
  ): Promise<any> {
    try {
      // Create a reply marked as internal
      const reply = await this.prisma.ticketReply.create({
        data: {
          ticketId,
          authorId: adminUserId,
          content: `[INTERNAL NOTE - ${noteType}] ${content}`,
          isInternal: true,
        },
        include: {
          author: {
            select: { id: true, email: true, name: true },
          },
        },
      });

      this.logger.log(
        `Internal note added to ticket ${ticketId} by admin ${adminUserId}`,
      );

      return {
        id: reply.id,
        content: reply.content,
        isInternal: reply.isInternal,
        authorId: reply.authorId,
        authorEmail: reply.author?.email,
        authorName: reply.author?.name,
        createdAt: reply.createdAt,
        noteType,
      };
    } catch (error) {
      this.logger.error(
        `Failed to add internal note to ticket ${ticketId}:`,
        error,
      );
      throw error;
    }
  }

  async getTicketAnalytics(): Promise<any> {
    try {
      const totalTickets = await this.prisma.supportTicket.count();

      const ticketsByStatus = await this.prisma.supportTicket.groupBy({
        by: ['status'],
        _count: { id: true },
      });

      const ticketsByPriority = await this.prisma.supportTicket.groupBy({
        by: ['priority'],
        _count: { id: true },
      });

      // Calculate resolution time (simplified)
      const resolvedTickets = await this.prisma.supportTicket.findMany({
        where: { status: 'RESOLVED' },
        select: { createdAt: true, updatedAt: true },
      });

      const avgResolutionTime =
        resolvedTickets.length > 0
          ? resolvedTickets.reduce((sum, ticket) => {
              const resolutionTime =
                ticket.updatedAt.getTime() - ticket.createdAt.getTime();
              return sum + resolutionTime;
            }, 0) /
            resolvedTickets.length /
            (1000 * 60 * 60) // Convert to hours
          : 0;

      // Get assignee performance
      const assigneeStats = await this.prisma.supportTicket.groupBy({
        by: ['assignedToId'],
        where: { assignedToId: { not: null } },
        _count: { id: true },
      });

      const assigneePerformance = await Promise.all(
        assigneeStats.map(async (stat) => {
          if (!stat.assignedToId) return null;

          const user = await this.prisma.user.findUnique({
            where: { id: stat.assignedToId },
            select: { id: true, email: true, name: true },
          });

          // Get average resolution time for this assignee
          const assigneeTickets = await this.prisma.supportTicket.findMany({
            where: {
              assignedToId: stat.assignedToId,
              status: 'RESOLVED',
            },
            select: { createdAt: true, updatedAt: true },
          });

          const avgTime =
            assigneeTickets.length > 0
              ? assigneeTickets.reduce((sum, ticket) => {
                  return (
                    sum +
                    (ticket.updatedAt.getTime() - ticket.createdAt.getTime())
                  );
                }, 0) /
                assigneeTickets.length /
                (1000 * 60 * 60) // hours
              : 0;

          return {
            assigneeId: stat.assignedToId,
            assigneeName: user?.name || 'Unknown',
            assigneeEmail: user?.email || 'unknown@example.com',
            ticketCount: stat._count.id,
            averageResolutionTime: Math.round(avgTime * 100) / 100,
          };
        }),
      );

      return {
        overview: {
          totalTickets,
          openTickets:
            ticketsByStatus.find((s) => s.status === 'OPEN')?._count.id || 0,
          inProgressTickets:
            ticketsByStatus.find((s) => s.status === 'IN_PROGRESS')?._count
              .id || 0,
          resolvedTickets:
            ticketsByStatus.find((s) => s.status === 'RESOLVED')?._count.id ||
            0,
          closedTickets:
            ticketsByStatus.find((s) => s.status === 'CLOSED')?._count.id || 0,
          averageResolutionTime: Math.round(avgResolutionTime * 100) / 100,
          customerSatisfaction: 0, // TODO: Implement customer satisfaction tracking
          firstResponseTime: 0, // TODO: Implement first response time tracking
        },
        trends: {
          ticketsThisMonth: 0, // TODO: Implement monthly trends
          ticketsLastMonth: 0,
          growthRate: 0,
          resolutionRate:
            totalTickets > 0
              ? ((ticketsByStatus.find((s) => s.status === 'RESOLVED')?._count
                  .id || 0) /
                  totalTickets) *
                100
              : 0,
        },
        byPriority: ticketsByPriority.map((p) => ({
          priority: p.priority,
          count: p._count.id,
          averageResolutionTime: 0, // TODO: Calculate per priority
        })),
        byAssignee: assigneePerformance.filter(Boolean),
      };
    } catch (error) {
      this.logger.error('Failed to get ticket analytics:', error);
      throw error;
    }
  }

  async processReopenRequest(
    requestId: string,
    approve: boolean,
    adminUserId: string,
    reason?: string,
  ): Promise<any> {
    try {
      const request = await this.prisma.ticketReopenRequest.findUnique({
        where: { id: requestId },
        include: {
          ticket: true,
        },
      });

      if (!request) {
        throw new NotFoundException('Reopen request not found');
      }

      const newStatus = approve ? 'APPROVED' : 'REJECTED';

      const updatedRequest = await this.prisma.ticketReopenRequest.update({
        where: { id: requestId },
        data: {
          status: newStatus,
          reviewedById: adminUserId,
          reviewedAt: new Date(),
        },
        include: {
          requestedBy: {
            select: { id: true, email: true, name: true },
          },
          reviewedBy: {
            select: { id: true, email: true, name: true },
          },
          ticket: {
            select: { id: true, title: true },
          },
        },
      });

      // If approved, reopen the ticket
      if (approve) {
        await this.prisma.supportTicket.update({
          where: { id: request.ticketId },
          data: {
            status: 'OPEN',
            closedAt: null,
            updatedAt: new Date(),
          },
        });
      }

      // Log admin action
      await this.logAdminAction(
        adminUserId,
        'REOPEN_REQUEST_PROCESS',
        requestId,
        {
          ticketId: request.ticketId,
          approved: approve,
          reason,
        },
      );

      this.logger.log(
        `Reopen request ${requestId} ${newStatus.toLowerCase()} by admin ${adminUserId}`,
      );

      return {
        id: updatedRequest.id,
        ticketId: updatedRequest.ticketId,
        ticketTitle: updatedRequest.ticket.title,
        status: updatedRequest.status,
        approve,
        requestedByEmail: updatedRequest.requestedBy?.email,
        reviewedByEmail: updatedRequest.reviewedBy?.email,
        reviewedAt: updatedRequest.reviewedAt,
      };
    } catch (error) {
      this.logger.error(
        `Failed to process reopen request ${requestId}:`,
        error,
      );
      throw error;
    }
  }

  async deleteTicket(
    ticketId: string,
    adminUserId: string,
    reason: string,
  ): Promise<void> {
    try {
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        throw new NotFoundException('Support ticket not found');
      }

      // Soft delete by updating status
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Log admin action
      await this.logAdminAction(adminUserId, 'TICKET_DELETED', ticketId, {
        reason,
      });

      this.logger.log(
        `Support ticket ${ticketId} deleted by admin ${adminUserId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to delete support ticket ${ticketId}:`, error);
      throw error;
    }
  }

  private async getTicketSummary(): Promise<any> {
    const totalTickets = await this.prisma.supportTicket.count();

    const ticketsByStatus = await this.prisma.supportTicket.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const urgentPriority = await this.prisma.supportTicket.count({
      where: { priority: 'URGENT' },
    });

    return {
      totalTickets,
      openTickets:
        ticketsByStatus.find((s) => s.status === 'OPEN')?._count.id || 0,
      inProgressTickets:
        ticketsByStatus.find((s) => s.status === 'IN_PROGRESS')?._count.id || 0,
      resolvedTickets:
        ticketsByStatus.find((s) => s.status === 'RESOLVED')?._count.id || 0,
      closedTickets:
        ticketsByStatus.find((s) => s.status === 'CLOSED')?._count.id || 0,
      urgentPriority,
    };
  }

  private async logAdminAction(
    adminUserId: string,
    action: string,
    resourceId: string,
    changes: any,
  ): Promise<void> {
    try {
      // TODO: Implement audit logging
      this.logger.log(
        `Admin action: ${action} on resource ${resourceId} by admin ${adminUserId}`,
        changes,
      );
    } catch (error) {
      this.logger.error('Failed to log admin action:', error);
    }
  }
}
