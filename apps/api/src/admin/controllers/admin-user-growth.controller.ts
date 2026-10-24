import {
  Controller,
  Get,
  Logger,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { AdminUserGrowthQueryDto } from '../dto/admin-user-growth-query.dto';
import { AdminUserGrowthResponseDto } from '../dto/admin-user-growth-response.dto';
import { AdminUserGrowthService } from '../services/admin-user-growth.service';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  code?: string;
}

@ApiTags('Admin Analytics')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles('admin')
@Controller('admin/analytics')
@UseInterceptors(LoggingInterceptor, ResponseInterceptor)
export class AdminUserGrowthController {
  private readonly logger = new Logger(AdminUserGrowthController.name);

  constructor(
    private readonly adminUserGrowthService: AdminUserGrowthService,
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

  @Get('user-growth')
  @ApiOperation({
    summary: 'Get user growth analytics',
    description:
      'Retrieve detailed user growth analytics with various time ranges, grouping options, and filters. Provides insights into user acquisition trends and growth patterns.',
  })
  // @ApiQuery({ type: AdminUserGrowthQueryDto })
  @ApiResponse({
    status: 200,
    description: 'User growth analytics retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'User growth analytics retrieved successfully',
        data: {
          timeRange: 'this_month',
          groupBy: 'day',
          timezone: 'Asia/Dhaka',
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-31T23:59:59.999Z',
          data: [
            {
              period: '2024-01-01',
              totalUsers: 120,
              newUsers: 5,
              growthPercentage: 0,
              cumulativeGrowth: 0,
            },
            {
              period: '2024-01-02',
              totalUsers: 128,
              newUsers: 8,
              growthPercentage: 60.0,
              cumulativeGrowth: 6.67,
            },
          ],
          summary: {
            initialUsers: 115,
            finalUsers: 150,
            totalNewUsers: 35,
            averageGrowthRate: 7.2,
            peakGrowthRate: 15.8,
            overallGrowthPercentage: 30.43,
          },
          totalPoints: 31,
          filters: {
            userStatus: ['ACTIVE'],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid query parameters',
    schema: {
      example: {
        success: false,
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        code: 'INVALID_QUERY_PARAMS',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized access',
        error: 'UNAUTHORIZED',
        code: 'ADMIN_ACCESS_REQUIRED',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to retrieve user growth analytics',
        error: 'INTERNAL_ERROR',
        code: 'ANALYTICS_SERVICE_ERROR',
      },
    },
  })
  async getUserGrowthAnalytics(
    @Query() query: AdminUserGrowthQueryDto,
  ): Promise<ApiResponse<AdminUserGrowthResponseDto>> {
    try {
      this.logger.log(
        `User growth analytics requested with params: ${JSON.stringify(query)}`,
      );

      const result =
        await this.adminUserGrowthService.getUserGrowthAnalytics(query);

      return this.createSuccessResponse(
        'User growth analytics retrieved successfully',
        result,
      );
    } catch (error) {
      this.logger.error('User growth analytics failed:', error.message);

      let errorCode = 'ANALYTICS_SERVICE_ERROR';
      if (error.message.includes('startDate and endDate are required')) {
        errorCode = 'MISSING_CUSTOM_DATE_RANGE';
      } else if (error.message.includes('Validation')) {
        errorCode = 'INVALID_QUERY_PARAMS';
      }

      return this.createErrorResponse(
        error.message || 'Failed to retrieve user growth analytics',
        errorCode,
        error.name || 'UNKNOWN_ERROR',
      );
    }
  }

  @Get('visitor-stats')
  @ApiOperation({
    summary: 'Get visitor stats',
    description: 'Retrieve visitor stats (views and engagement) grouped by day or month.',
  })
  @ApiResponse({
    status: 200,
    description: 'Visitor stats retrieved successfully',
  })
  async getVisitorStats(@Query('timeRange') timeRange?: string): Promise<ApiResponse> {
    try {
      const result = await this.adminUserGrowthService.getVisitorStats(timeRange);
      return this.createSuccessResponse(
        'Visitor stats retrieved successfully',
        result,
      );
    } catch (error) {
      this.logger.error('Failed to retrieve visitor stats:', error.message);
      return this.createErrorResponse(
        error.message || 'Failed to retrieve visitor stats',
        'VISITOR_STATS_ERROR',
        error.name || 'UNKNOWN_ERROR',
      );
    }
  }

  @Get('active-visitors')
  @ApiOperation({
    summary: 'Get active visitors count',
    description: 'Retrieve the number of unique sessions in the last 5 minutes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active visitors retrieved successfully',
  })
  async getActiveVisitors(): Promise<ApiResponse> {
    try {
      const result = await this.adminUserGrowthService.getActiveVisitors();
      return this.createSuccessResponse(
        'Active visitors retrieved successfully',
        result,
      );
    } catch (error) {
      this.logger.error('Failed to retrieve active visitors:', error.message);
      return this.createErrorResponse(
        error.message || 'Failed to retrieve active visitors',
        'ACTIVE_VISITORS_ERROR',
        error.name || 'UNKNOWN_ERROR',
      );
    }
  }
}
