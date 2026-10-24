import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { PermissionUtils } from '../../common/utils/permission.util';
import { AdminNewsletterSubscriberService } from '../services/admin-newsletter-subscriber.service';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  code?: string;
}

@ApiTags('Admin Newsletter Subscriber Management')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles('admin', 'staff', 'support', 'developer')
@Controller('admin/newsletter-subscribers')
@UseInterceptors(LoggingInterceptor, ResponseInterceptor)
export class AdminNewsletterSubscriberController {
  constructor(
    private readonly adminNewsletterSubscriberService: AdminNewsletterSubscriberService
  ) {}

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
    summary: 'List all newsletter subscribers with admin privileges',
    description:
      'Retrieve a paginated list of all newsletter subscribers with advanced filtering and admin overrides',
  })
  @ApiResponse({
    status: 200,
    description: 'Newsletter subscribers retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Newsletter subscribers retrieved successfully',
        data: {
          subscribers: [
            {
              id: 'sub-123',
              email: 'user@example.com',
              subscribedAt: '2024-01-15T10:30:00.000Z',
            },
          ],
          total: 150,
          hasMore: true,
          summary: {
            totalSubscribers: 150,
            subscribersToday: 5,
            subscribersThisWeek: 25,
          },
        },
      },
    },
  })
  async getAllNewsletterSubscribers(
    @Query() query: any,
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const result = await this.adminNewsletterSubscriberService.getAllNewsletterSubscribers(query);

      return this.createSuccessResponse(
        'Newsletter subscribers retrieved successfully',
        result,
      );
    } catch (error) {
      return this.createErrorResponse(
        error.message || 'Failed to retrieve newsletter subscribers',
        'NEWSLETTER_SUBSCRIBER_RETRIEVAL_FAILED',
        error.name,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get newsletter subscriber details (Admin)',
    description:
      'Get detailed information about a specific newsletter subscriber with full admin access',
  })
  @ApiParam({
    name: 'id',
    description: 'Newsletter subscriber ID',
    example: 'sub-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Newsletter subscriber details retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Newsletter subscriber details retrieved successfully',
        data: {
          id: 'sub-123',
          email: 'user@example.com',
          subscribedAt: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  async getNewsletterSubscriberById(
    @Param('id') id: string,
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const subscriber = await this.adminNewsletterSubscriberService.getNewsletterSubscriberById(id);

      return this.createSuccessResponse(
        'Newsletter subscriber details retrieved successfully',
        subscriber,
      );
    } catch (error) {
      return this.createErrorResponse(
        error.message || 'Failed to retrieve newsletter subscriber details',
        'NEWSLETTER_SUBSCRIBER_DETAILS_FAILED',
        error.name,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete newsletter subscriber (Admin)',
    description:
      'Remove a newsletter subscriber from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Newsletter subscriber ID to delete',
    example: 'sub-123',
  })
  @ApiBody({
    description: 'Deletion parameters',
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          example: 'User request',
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
    description: 'Newsletter subscriber deleted successfully',
  })
  async deleteNewsletterSubscriber(
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

      await this.adminNewsletterSubscriberService.deleteNewsletterSubscriber(
        id,
        adminUser.id,
        body.reason,
      );

      return this.createSuccessResponse(
        'Newsletter subscriber deleted successfully',
        { id, deletedAt: new Date().toISOString() },
      );
    } catch (error) {
      return this.createErrorResponse(
        error.message || 'Failed to delete newsletter subscriber',
        'NEWSLETTER_SUBSCRIBER_DELETION_FAILED',
        error.name,
      );
    }
  }

  @Post('bulk-unsubscribe')
  @ApiOperation({
    summary: 'Bulk unsubscribe users from newsletter (Admin)',
    description:
      'Remove multiple email addresses from newsletter subscription simultaneously',
  })
  @ApiBody({
    description: 'Bulk unsubscribe parameters',
    schema: {
      type: 'object',
      properties: {
        emails: {
          type: 'array',
          items: { type: 'string' },
          example: ['user1@example.com', 'user2@example.com'],
        },
        reason: {
          type: 'string',
          example: 'Bulk cleanup operation',
        },
      },
      required: ['emails'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk unsubscribe completed successfully',
    schema: {
      example: {
        success: true,
        message: 'Bulk unsubscribe completed successfully',
        data: {
          operationId: 'bulk-unsubscribe-1234567890-abc123',
          totalEmails: 2,
          successful: 2,
          failed: 0,
          results: [
            { email: 'user1@example.com', success: true },
            { email: 'user2@example.com', success: true },
          ],
        },
      },
    },
  })
  async bulkUnsubscribe(
    @Body() body: { emails: string[]; reason?: string },
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireAdmin(adminUser.roles);

      const result = await this.adminNewsletterSubscriberService.bulkUnsubscribe(
        body.emails,
        adminUser.id,
        body.reason,
      );

      return this.createSuccessResponse(
        'Bulk unsubscribe completed successfully',
        result,
      );
    } catch (error) {
      return this.createErrorResponse(
        error.message || 'Failed to execute bulk unsubscribe',
        'BULK_UNSUBSCRIBE_FAILED',
        error.name,
      );
    }
  }

  @Get('analytics/overview')
  @ApiOperation({
    summary: 'Get newsletter subscriber analytics (Admin)',
    description:
      'Get comprehensive newsletter subscriber analytics and performance metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Newsletter subscriber analytics retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Newsletter subscriber analytics retrieved successfully',
        data: {
          overview: {
            totalSubscribers: 150,
          },
          trends: {
            subscribersByMonth: [
              { month: '2024-01-01', count: 25 },
              { month: '2023-12-01', count: 20 },
            ],
          },
          recentActivity: [
            {
              id: 'sub-123',
              email: 'user@example.com',
              subscribedAt: '2024-01-15T10:30:00.000Z',
            },
          ],
          growth: {
            currentMonth: 25,
            lastMonth: 20,
            growthRate: 25.0,
          },
        },
      },
    },
  })
  async getNewsletterSubscriberAnalytics(
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireStaff(adminUser.roles);

      const analytics = await this.adminNewsletterSubscriberService.getNewsletterSubscriberAnalytics();

      return this.createSuccessResponse(
        'Newsletter subscriber analytics retrieved successfully',
        analytics,
      );
    } catch (error) {
      return this.createErrorResponse(
        error.message || 'Failed to retrieve newsletter subscriber analytics',
        'NEWSLETTER_SUBSCRIBER_ANALYTICS_FAILED',
        error.name,
      );
    }
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export newsletter subscribers (Admin)',
    description:
      'Export newsletter subscribers in JSON or CSV format',
  })
  @ApiQuery({ 
    name: 'format', 
    required: false, 
    enum: ['json', 'csv'],
    description: 'Export format (default: json)'
  })
  @ApiResponse({
    status: 200,
    description: 'Newsletter subscribers exported successfully',
  })
  async exportSubscribers(
    @Query('format') format: 'json' | 'csv' = 'json',
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      // Use PermissionUtils for consistent role checking
      PermissionUtils.requireAdmin(adminUser.roles);

      const data = await this.adminNewsletterSubscriberService.exportSubscribers(format);

      return this.createSuccessResponse(
        'Newsletter subscribers exported successfully',
        { format, data },
      );
    } catch (error) {
      return this.createErrorResponse(
        error.message || 'Failed to export newsletter subscribers',
        'NEWSLETTER_EXPORT_FAILED',
        error.name,
      );
    }
  }
}