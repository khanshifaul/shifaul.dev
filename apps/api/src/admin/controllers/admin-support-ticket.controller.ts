import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { AdminSupportTicketService } from '../services/admin-support-ticket.service';
import { PermissionUtils } from '../../common/utils/permission.util';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  code?: string;
}

@ApiTags('Admin Support Ticket Management')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles('admin', 'staff', 'support', 'developer')
@Controller('admin/support-tickets')
@UseInterceptors(LoggingInterceptor, ResponseInterceptor)
export class AdminSupportTicketController {
  private readonly logger = new Logger(AdminSupportTicketController.name);

  constructor(
    private readonly adminSupportTicketService: AdminSupportTicketService
  ) {
    // AdminSupportTicketService properly injected and ready to use
  }

  private createSuccessResponse<T>(message: string, data?: T): ApiResponse<T> {
    return { success: true, message, data };
  }

  private createErrorResponse(
    message: string,
    code?: string,
    error?: string,
  ): ApiResponse {
    return { success: false, message, error, code };
  }

  @Get()
  @ApiOperation({
    summary: 'List all support tickets with admin privileges',
    description:
      'Retrieve a paginated list of all support tickets with advanced filtering and admin overrides',
  })
  @ApiResponse({
    status: 200,
    description: 'Support tickets retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Support tickets retrieved successfully',
        data: {
          tickets: [
            {
              id: 'ticket-123',
              title: 'Login issue',
              status: 'OPEN',
              priority: 'HIGH',
              userId: 'user-456',
              userEmail: 'user@example.com',
              assignedTo: null,
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
              replyCount: 3,
            },
          ],
          total: 150,
          hasMore: true,
          summary: {
            totalTickets: 150,
            openTickets: 45,
            inProgressTickets: 23,
            resolvedTickets: 67,
            closedTickets: 15,
            urgentPriority: 12,
          },
        },
      },
    },
  })
  async getAllTickets(
    @Query() query: any,
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const result = await this.adminSupportTicketService.getAllTickets(query);

      return this.createSuccessResponse(
        'Support tickets retrieved successfully',
        result,
      );
    } catch (error) {
      this.logger.error('Support ticket retrieval failed:', error);
      return this.createErrorResponse(
        error.message || 'Failed to retrieve support tickets',
        'TICKET_RETRIEVAL_FAILED',
        error.name,
      );
    }
  }

  @Get(':ticketId')
  @ApiOperation({
    summary: 'Get support ticket details (Admin)',
    description:
      'Get detailed information about a specific support ticket with full admin access',
  })
  @ApiParam({
    name: 'ticketId',
    description: 'Support ticket ID',
    example: 'ticket-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Support ticket details retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Support ticket details retrieved successfully',
        data: {
          id: 'ticket-123',
          title: 'Login issue with 2FA',
          description: 'Cannot access account after enabling 2FA',
          status: 'OPEN',
          priority: 'HIGH',
          userId: 'user-456',
          userEmail: 'user@example.com',
          userName: 'John Doe',
          assignedTo: null,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          replies: [
            {
              id: 'reply-123',
              content: 'Please check your authenticator app...',
              isInternal: false,
              authorId: 'staff-789',
              authorEmail: 'support@example.com',
              createdAt: '2024-01-15T10:35:00.000Z',
            },
          ],
          attachments: [],
          metadata: {
            browser: 'Chrome',
            os: 'Windows 11',
            ipAddress: '192.168.1.1',
          },
        },
      },
    },
  })
  async getTicketById(
    @Param('ticketId') ticketId: string,
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const ticket = await this.adminSupportTicketService.getTicketById(ticketId);

      return this.createSuccessResponse(
        'Support ticket details retrieved successfully',
        ticket,
      );
    } catch (error) {
      this.logger.error(
        'Support ticket details retrieval failed:',
        error,
      );
      return this.createErrorResponse(
        error.message || 'Failed to retrieve support ticket details',
        'TICKET_DETAILS_FAILED',
        error.name,
      );
    }
  }

  @Put(':ticketId/assign')
  @ApiOperation({
    summary: 'Assign ticket to staff member (Admin)',
    description:
      'Assign or reassign a support ticket to a specific staff member',
  })
  @ApiParam({
    name: 'ticketId',
    description: 'Support ticket ID',
    example: 'ticket-123',
  })
  @ApiBody({
    description: 'Assignment parameters',
    schema: {
      type: 'object',
      properties: {
        assigneeId: {
          type: 'string',
          format: 'uuid',
          description:
            'Staff member ID to assign the ticket to (null to unassign)',
          example: 'staff-789',
        },
        reason: {
          type: 'string',
          example: 'Assigning to senior support specialist',
        },
      },
      required: ['assigneeId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket assigned successfully',
    schema: {
      example: {
        success: true,
        message: 'Ticket assigned successfully',
        data: {
          ticketId: 'ticket-123',
          oldAssigneeId: null,
          newAssigneeId: 'staff-789',
          assignedAt: '2024-01-15T10:30:00.000Z',
          reason: 'Assigning to senior support specialist',
        },
      },
    },
  })
  async assignTicket(
    @Param('ticketId') ticketId: string,
    @Body() body: { assigneeId: string | null; reason?: string },
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const result = await this.adminSupportTicketService.assignTicket(
        ticketId,
        body.assigneeId,
        adminUser.id,
        body.reason,
      );

      return this.createSuccessResponse('Ticket assigned successfully', result);
    } catch (error) {
      this.logger.error('Ticket assignment failed:', error);
      return this.createErrorResponse(
        error.message || 'Failed to assign ticket',
        'TICKET_ASSIGNMENT_FAILED',
        error.name,
      );
    }
  }

  @Put(':ticketId/status')
  @ApiOperation({
    summary: 'Update ticket status (Admin)',
    description:
      'Update support ticket status with admin privileges, including priority changes',
  })
  @ApiParam({
    name: 'ticketId',
    description: 'Support ticket ID',
    example: 'ticket-123',
  })
  @ApiBody({
    description: 'Status update parameters',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
          example: 'IN_PROGRESS',
        },
        priority: {
          type: 'string',
          enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
          example: 'HIGH',
        },
        reason: {
          type: 'string',
          example: 'Escalating priority due to customer impact',
        },
        internalNotes: {
          type: 'string',
          example: 'Customer is a premium user, prioritize resolution',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket status updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Ticket status updated successfully',
        data: {
          ticketId: 'ticket-123',
          oldStatus: 'OPEN',
          newStatus: 'IN_PROGRESS',
          oldPriority: 'NORMAL',
          newPriority: 'HIGH',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  async updateTicketStatus(
    @Param('ticketId') ticketId: string,
    @Body()
    body: {
      status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
      priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
      reason?: string;
      internalNotes?: string;
    },
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const result = await this.adminSupportTicketService.updateTicketStatus(
        ticketId,
        body.status || 'OPEN',
        adminUser.id,
        body.priority,
        body.reason,
        body.internalNotes,
      );

      return this.createSuccessResponse(
        'Ticket status updated successfully',
        result,
      );
    } catch (error) {
      this.logger.error('Ticket status update failed:', error);
      return this.createErrorResponse(
        error.message || 'Failed to update ticket status',
        'TICKET_STATUS_UPDATE_FAILED',
        error.name,
      );
    }
  }

  @Post('bulk-assign')
  @ApiOperation({
    summary: 'Bulk assign tickets (Admin)',
    description: 'Assign multiple tickets to staff members simultaneously',
  })
  @ApiBody({
    description: 'Bulk assignment parameters',
    schema: {
      type: 'object',
      properties: {
        ticketIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['ticket-1', 'ticket-2', 'ticket-3'],
        },
        assigneeId: {
          type: 'string',
          format: 'uuid',
          example: 'staff-789',
        },
        reason: {
          type: 'string',
          example: 'Bulk assignment for team workload balancing',
        },
      },
      required: ['ticketIds', 'assigneeId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk assignment completed successfully',
    schema: {
      example: {
        success: true,
        message: 'Bulk assignment completed successfully',
        data: {
          operationId: 'bulk-assign-1234567890-abc123',
          totalTickets: 3,
          successful: 3,
          failed: 0,
          results: [
            { ticketId: 'ticket-1', success: true },
            { ticketId: 'ticket-2', success: true },
            { ticketId: 'ticket-3', success: true },
          ],
        },
      },
    },
  })
  async bulkAssignTickets(
    @Body()
    body: {
      ticketIds: string[];
      assigneeId: string;
      reason?: string;
    },
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const result = await this.adminSupportTicketService.bulkAssignTickets(
        body.ticketIds,
        body.assigneeId,
        adminUser.id,
        body.reason,
      );

      return this.createSuccessResponse(
        'Bulk assignment completed successfully',
        result,
      );
    } catch (error) {
      this.logger.error('Bulk assignment failed:', error);
      return this.createErrorResponse(
        error.message || 'Failed to execute bulk assignment',
        'BULK_ASSIGNMENT_FAILED',
        error.name,
      );
    }
  }

  @Post('bulk-status-update')
  @ApiOperation({
    summary: 'Bulk update ticket status (Admin)',
    description: 'Update status for multiple tickets simultaneously',
  })
  @ApiBody({
    description: 'Bulk status update parameters',
    schema: {
      type: 'object',
      properties: {
        ticketIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['ticket-1', 'ticket-2'],
        },
        status: {
          type: 'string',
          enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
          example: 'CLOSED',
        },
        priority: {
          type: 'string',
          enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
          example: 'NORMAL',
        },
        reason: {
          type: 'string',
          example: 'Bulk closure of resolved tickets',
        },
      },
      required: ['ticketIds', 'status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk status update completed successfully',
  })
  async bulkUpdateStatus(
    @Body()
    body: {
      ticketIds: string[];
      status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
      priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
      reason?: string;
    },
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const result = await this.adminSupportTicketService.bulkUpdateStatus(
        body.ticketIds,
        body.status,
        adminUser.id,
        body.priority,
        body.reason,
      );

      return this.createSuccessResponse(
        'Bulk status update completed successfully',
        result,
      );
    } catch (error) {
      this.logger.error('Bulk status update failed:', error);
      return this.createErrorResponse(
        error.message || 'Failed to execute bulk status update',
        'BULK_STATUS_UPDATE_FAILED',
        error.name,
      );
    }
  }

  @Post(':ticketId/internal-note')
  @ApiOperation({
    summary: 'Add internal note to ticket (Admin)',
    description:
      'Add internal notes to a support ticket (visible only to staff)',
  })
  @ApiParam({
    name: 'ticketId',
    description: 'Support ticket ID',
    example: 'ticket-123',
  })
  @ApiBody({
    description: 'Internal note parameters',
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          example:
            'Customer is a VIP user, prioritize resolution within 2 hours',
        },
        noteType: {
          type: 'string',
          enum: ['GENERAL', 'ESCALATION', 'RESOLUTION', 'FOLLOW_UP'],
          example: 'ESCALATION',
        },
      },
      required: ['content'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Internal note added successfully',
  })
  async addInternalNote(
    @Param('ticketId') ticketId: string,
    @Body() body: { content: string; noteType?: string },
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const result = await this.adminSupportTicketService.addInternalNote(
        ticketId,
        body.content,
        adminUser.id,
        body.noteType,
      );

      return this.createSuccessResponse(
        'Internal note added successfully',
        result,
      );
    } catch (error) {
      this.logger.error('Internal note addition failed:', error);
      return this.createErrorResponse(
        error.message || 'Failed to add internal note',
        'INTERNAL_NOTE_FAILED',
        error.name,
      );
    }
  }

  @Get('analytics/overview')
  @ApiOperation({
    summary: 'Get support ticket analytics (Admin)',
    description:
      'Get comprehensive support ticket analytics and performance metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Support ticket analytics retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Support ticket analytics retrieved successfully',
        data: {
          overview: {
            totalTickets: 150,
            openTickets: 45,
            averageResolutionTime: 1440, // minutes
            customerSatisfaction: 4.2,
            firstResponseTime: 180, // minutes
          },
          trends: {
            ticketsThisMonth: 67,
            ticketsLastMonth: 58,
            growthRate: 15.5,
            resolutionRate: 85.3,
          },
          byPriority: [
            { priority: 'LOW', count: 45, averageResolutionTime: 2880 },
            { priority: 'NORMAL', count: 67, averageResolutionTime: 1440 },
            { priority: 'HIGH', count: 23, averageResolutionTime: 720 },
            { priority: 'URGENT', count: 15, averageResolutionTime: 180 },
          ],
          byAssignee: [
            {
              assigneeId: 'staff-123',
              assigneeName: 'John Support',
              ticketCount: 25,
              averageResolutionTime: 1200,
            },
          ],
        },
      },
    },
  })
  async getTicketAnalytics(
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const analytics = await this.adminSupportTicketService.getTicketAnalytics();

      return this.createSuccessResponse(
        'Support ticket analytics retrieved successfully',
        analytics,
      );
    } catch (error) {
      this.logger.error(
        'Support ticket analytics retrieval failed:',
        error,
      );
      return this.createErrorResponse(
        error.message || 'Failed to retrieve support ticket analytics',
        'TICKET_ANALYTICS_FAILED',
        error.name,
      );
    }
  }

  @Put('reopen-requests/:requestId/process')
  @ApiOperation({
    summary: 'Process reopen request (Admin)',
    description:
      'Approve or deny a ticket reopen request with admin privileges',
  })
  @ApiParam({
    name: 'requestId',
    description: 'Reopen request ID',
    example: 'request-123',
  })
  @ApiBody({
    description: 'Process reopen request parameters',
    schema: {
      type: 'object',
      properties: {
        approve: {
          type: 'boolean',
          example: true,
        },
        reason: {
          type: 'string',
          example:
            'Issue was not fully resolved, reopening for further investigation',
        },
      },
      required: ['approve'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reopen request processed successfully',
  })
  async processReopenRequest(
    @Param('requestId') requestId: string,
    @Body() body: { approve: boolean; reason?: string },
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const result = await this.adminSupportTicketService.processReopenRequest(
        requestId,
        body.approve,
        adminUser.id,
        body.reason,
      );

      return this.createSuccessResponse(
        'Reopen request processed successfully',
        result,
      );
    } catch (error) {
      this.logger.error('Reopen request processing failed:', error);
      return this.createErrorResponse(
        error.message || 'Failed to process reopen request',
        'REOPEN_REQUEST_FAILED',
        error.name,
      );
    }
  }

  @Delete(':ticketId')
  @ApiOperation({
    summary: 'Delete support ticket (Admin only)',
    description:
      'Permanently delete a support ticket (use with extreme caution)',
  })
  @ApiParam({
    name: 'ticketId',
    description: 'Support ticket ID to delete',
    example: 'ticket-123',
  })
  @ApiBody({
    description: 'Deletion parameters',
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          example: 'Data cleanup - spam ticket',
        },
        confirmDeletion: {
          type: 'boolean',
          example: true,
        },
      },
      required: ['reason', 'confirmDeletion'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Support ticket deleted successfully',
  })
  async deleteTicket(
    @Param('ticketId') ticketId: string,
    @Body() body: { reason: string; confirmDeletion: boolean },
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      if (!body.confirmDeletion) {
        throw new Error('Deletion must be confirmed');
      }

      // Use PermissionUtils for consistent role checking - only admin can delete
      PermissionUtils.requireAdmin(adminUser.roles);

      await this.adminSupportTicketService.deleteTicket(
        ticketId,
        adminUser.id,
        body.reason,
      );

      return this.createSuccessResponse(
        'Support ticket deleted successfully',
        { ticketId, deletedAt: new Date().toISOString() },
      );
    } catch (error) {
      this.logger.error('Support ticket deletion failed:', error);
      return this.createErrorResponse(
        error.message || 'Failed to delete support ticket',
        'TICKET_DELETION_FAILED',
        error.name,
      );
    }
  }
}
