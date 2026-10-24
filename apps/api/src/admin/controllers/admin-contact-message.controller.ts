import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { PermissionUtils } from '../../common/utils/permission.util';
import { AdminContactMessageQueryDto } from '../dto/admin-contact-message-query.dto';
import { AdminContactMessageService } from '../services/admin-contact-message.service';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  code?: string;
}

@ApiTags('Admin Contact Message Management')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles('admin', 'staff', 'support', 'developer')
@Controller('admin/contact-messages')
@UseInterceptors(LoggingInterceptor, ResponseInterceptor)
export class AdminContactMessageController {
  constructor(
    private readonly adminContactMessageService: AdminContactMessageService
  ) { }

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
    summary: 'List all contact messages with admin privileges',
    description:
      'Retrieve a paginated list of all contact messages with advanced filtering and admin overrides',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact messages retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Contact messages retrieved successfully',
        data: {
          messages: [
            {
              id: 'msg-123',
              name: 'John Doe',
              email: 'john@example.com',
              subject: 'Inquiry about services',
              message: 'Hello, I would like to inquire about your services...',
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
            },
          ],
          total: 150,
          hasMore: true,
          summary: {
            totalMessages: 150,
            messagesToday: 5,
            messagesThisWeek: 25,
          },
        },
      },
    },
  })
  async getAllContactMessages(
    @Query() query: AdminContactMessageQueryDto,
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const result = await this.adminContactMessageService.getAllContactMessages(query);

      return this.createSuccessResponse(
        'Contact messages retrieved successfully',
        result,
      );
    } catch (error) {
      return this.createErrorResponse(
        error.message || 'Failed to retrieve contact messages',
        'CONTACT_MESSAGE_RETRIEVAL_FAILED',
        error.name,
      );
    }
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get contact message statistics (Admin)',
    description: 'Get total, daily, and weekly contact message counts',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact message statistics retrieved successfully',
  })
  async getContactMessageStats(
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const stats = await this.adminContactMessageService.getContactMessageSummary();

      return this.createSuccessResponse(
        'Contact message statistics retrieved successfully',
        stats,
      );
    } catch (error) {
      return this.createErrorResponse(
        error.message || 'Failed to retrieve contact message statistics',
        'CONTACT_MESSAGE_STATS_FAILED',
        error.name,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get contact message details (Admin)',
    description:
      'Get detailed information about a specific contact message with full admin access',
  })
  @ApiParam({
    name: 'id',
    description: 'Contact message ID',
    example: 'msg-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact message details retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Contact message details retrieved successfully',
        data: {
          id: 'msg-123',
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Inquiry about services',
          message: 'Hello, I would like to inquire about your services...',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  async getContactMessageById(
    @Param('id') id: string,
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const message = await this.adminContactMessageService.getContactMessageById(id);

      return this.createSuccessResponse(
        'Contact message details retrieved successfully',
        message,
      );
    } catch (error) {
      return this.createErrorResponse(
        error.message || 'Failed to retrieve contact message details',
        'CONTACT_MESSAGE_DETAILS_FAILED',
        error.name,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete contact message (Admin)',
    description:
      'Permanently delete a contact message (use with caution)',
  })
  @ApiParam({
    name: 'id',
    description: 'Contact message ID to delete',
    example: 'msg-123',
  })
  @ApiBody({
    description: 'Deletion parameters',
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          example: 'Spam message',
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
    description: 'Contact message deleted successfully',
  })
  async deleteContactMessage(
    @Param('id') id: string,
    @Body() body: { reason: string; confirmDeletion: boolean },
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      if (!body.confirmDeletion) {
        throw new Error('Deletion must be confirmed');
      }

      // Use PermissionUtils for consistent role checking - only admin can delete
      PermissionUtils.requireAdmin(adminUser.roles);

      await this.adminContactMessageService.deleteContactMessage(
        id,
        adminUser.id,
        body.reason,
      );

      return this.createSuccessResponse(
        'Contact message deleted successfully',
        { id, deletedAt: new Date().toISOString() },
      );
    } catch (error) {
      return this.createErrorResponse(
        error.message || 'Failed to delete contact message',
        'CONTACT_MESSAGE_DELETION_FAILED',
        error.name,
      );
    }
  }



  @Get('analytics/overview')
  @ApiOperation({
    summary: 'Get contact message analytics (Admin)',
    description:
      'Get comprehensive contact message analytics and performance metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact message analytics retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Contact message analytics retrieved successfully',
        data: {
          overview: {
            totalMessages: 150,
          },
          trends: {
            messagesByMonth: [
              { month: '2024-01-01', count: 25 },
              { month: '2023-12-01', count: 20 },
            ],
          },
          recentActivity: [
            {
              id: 'msg-123',
              name: 'John Doe',
              email: 'john@example.com',
              subject: 'Inquiry about services',
              createdAt: '2024-01-15T10:30:00.000Z',
            },
          ],
        },
      },
    },
  })
  async getContactMessageAnalytics(
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const analytics = await this.adminContactMessageService.getContactMessageAnalytics();

      return this.createSuccessResponse(
        'Contact message analytics retrieved successfully',
        analytics,
      );
    } catch (error) {
      return this.createErrorResponse(
        error.message || 'Failed to retrieve contact message analytics',
        'CONTACT_MESSAGE_ANALYTICS_FAILED',
        error.name,
      );
    }
  }
}