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
import { AdminUpdateUserDto } from '../dto/admin-update-user.dto';
import { AdminUserQueryDto } from '../dto/admin-user-query.dto';
import { AdminUserResponseDto } from '../dto/admin-user-response.dto';
import { AdminUserService } from '../services/admin-user.service';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  code?: string;
}

@ApiTags('Admin User Management')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles('admin')
@Controller('admin/users')
@UseInterceptors(LoggingInterceptor, ResponseInterceptor)
export class AdminUserController {
  private readonly logger = new Logger(AdminUserController.name);

  constructor(private readonly adminUserService: AdminUserService) {}

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
    summary: 'List users with admin filtering',
    description:
      'Get all users with advanced filtering options for administrators',
  })
  //   @ApiQuery({ type: AdminUserQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              email: 'user@example.com',
              name: 'John Doe',
              provider: 'local',
              isEmailVerified: true,
              isTwoFactorEnabled: false,
              roles: ['user'],
              createdAt: '2024-01-15T10:30:00Z',
              totalRevenue: 299.99,
            },
          ],
          total: 150,
          page: 1,
          limit: 10,
          totalPages: 15,
          hasMore: true,
          summary: {
            totalUsers: 150,
            activeUsers: 140,
            verifiedUsers: 135,
            twoFactorEnabled: 45,
          },
        },
      },
    },
  })
  async getUsers(@Query() query: AdminUserQueryDto): Promise<ApiResponse<any>> {
    try {
      const result = await this.adminUserService.getUsers(query);
      const totalPages = Math.ceil(result.total / result.limit);
      const hasMore = result.page < totalPages;

      // Calculate summary from actual data
      const verifiedUsers = result.users.filter(
        (user) => user.isEmailVerified,
      ).length;
      const twoFactorEnabled = result.users.filter(
        (user) => user.isTwoFactorEnabled,
      ).length;
      const activeUsers = result.users.filter(
        (user) => user.status === 'ACTIVE',
      ).length;

      const summary = {
        totalUsers: result.total,
        activeUsers,
        verifiedUsers,
        twoFactorEnabled,
      };

      const response = {
        users: result.users,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages,
        hasMore,
        summary,
      };

      return this.createSuccessResponse(
        'Users retrieved successfully',
        response,
      );
    } catch (error) {
      this.logger.error('User retrieval failed:', error.message);
      return this.createErrorResponse(
        error.message || 'Failed to retrieve users',
        'USER_RETRIEVAL_FAILED',
        error.name || 'UNKNOWN_ERROR',
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user details (Admin)',
    description:
      'Get detailed information about a specific user including account status and subscription metrics',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'User details retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'user@example.com',
          name: 'John Doe',
          avatar: 'https://gravatar.com/avatar/...jpg',
          provider: 'local',
          isEmailVerified: true,
          emailVerifiedAt: '2024-01-15T10:30:00Z',
          isTwoFactorEnabled: false,
          roles: ['user'],
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          lastLoginAt: '2024-01-15T10:30:00Z',
          subscriptionCount: 3,
          totalRevenue: 299.99,
          activeSubscriptionCount: 2,
          status: 'active',
          metadata: {
            signupSource: 'website',
            referralCode: 'REF123',
          },
        },
      },
    },
  })
  async getUserById(
    @Param('id') id: string,
  ): Promise<ApiResponse<AdminUserResponseDto>> {
    try {
      const user = await this.adminUserService.getUserById(id);

      return this.createSuccessResponse(
        'User details retrieved successfully',
        user,
      );
    } catch (error) {
      this.logger.error('User details retrieval failed:', error.message);
      return this.createErrorResponse(
        error.message || 'Failed to retrieve user details',
        'USER_DETAILS_FAILED',
        error.name || 'UNKNOWN_ERROR',
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update user information (Admin)',
    description:
      'Update user details with admin privileges. Supports updating user profile information, roles, verification status, and account settings.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: AdminUpdateUserDto,
    description: 'User update data',
    examples: {
      'Update profile': {
        summary: 'Update user profile information',
        value: {
          name: 'John Doe Updated',
          email: 'john.doe.updated@example.com',
          updateReason: 'User requested profile update',
        },
      },
      'Update roles': {
        summary: 'Update user roles and permissions',
        value: {
          roles: ['user'],
          updateReason: 'Role upgrade for premium features',
        },
      },
      'Update verification status': {
        summary: 'Update email verification and 2FA status',
        value: {
          isEmailVerified: true,
          isTwoFactorEnabled: true,
          updateReason: 'Account verification completed',
        },
      },
      'Suspend user': {
        summary: 'Suspend user account',
        value: {
          status: 'SUSPENDED',
          suspensionReason: 'Violation of terms of service',
          updateReason: 'Account suspension due to policy violation',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      example: {
        success: true,
        message: 'User updated successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'updated@example.com',
          name: 'Updated Name',
          provider: 'local',
          isEmailVerified: true,
          isTwoFactorEnabled: false,
          roles: ['user'],
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:35:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      example: {
        success: false,
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        code: 'USER_UPDATE_VALIDATION_FAILED',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        success: false,
        message: 'User not found',
        error: 'NOT_FOUND',
        code: 'USER_NOT_FOUND',
      },
    },
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: AdminUpdateUserDto,
    @User() adminUser: any,
  ): Promise<ApiResponse<AdminUserResponseDto>> {
    try {
      const updatedUser = await this.adminUserService.updateUser(
        id,
        updateData,
        adminUser.id,
      );

      this.logger.log(`User ${id} updated by admin ${adminUser.id}`);
      return this.createSuccessResponse(
        'User updated successfully',
        updatedUser,
      );
    } catch (error) {
      this.logger.error('User update failed:', error.message);
      return this.createErrorResponse(
        error.message || 'Failed to update user',
        'USER_UPDATE_FAILED',
        error.name || 'UNKNOWN_ERROR',
      );
    }
  }

  @Post(':id/suspend')
  @ApiOperation({
    summary: 'Suspend user account (Admin)',
    description: 'Suspend a user account with admin override capabilities',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User account suspended successfully',
    schema: {
      example: {
        success: true,
        message: 'User account suspended successfully',
        data: {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          suspendedAt: '2024-01-15T10:30:00Z',
          reason: 'Violation of terms of service',
        },
      },
    },
  })
  async suspendUser(
    @Param('id') id: string,
    @Body() suspendData: { reason: string },
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      await this.adminUserService.suspendUser(
        id,
        suspendData.reason,
        adminUser.id,
      );

      const result = {
        userId: id,
        suspendedAt: new Date().toISOString(),
        reason: suspendData.reason,
        suspendedBy: adminUser.id,
      };

      this.logger.log(`User ${id} suspended by admin ${adminUser.id}`);
      return this.createSuccessResponse(
        'User account suspended successfully',
        result,
      );
    } catch (error) {
      this.logger.error('User suspension failed:', error.message);
      return this.createErrorResponse(
        error.message || 'Failed to suspend user account',
        'USER_SUSPENSION_FAILED',
        error.name || 'UNKNOWN_ERROR',
      );
    }
  }

  @Post(':id/reactivate')
  @ApiOperation({
    summary: 'Reactivate suspended user account',
    description: 'Reactivate a suspended user account',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User account reactivated successfully',
    schema: {
      example: {
        success: true,
        message: 'User account reactivated successfully',
        data: {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          reactivatedAt: '2024-01-15T10:30:00Z',
        },
      },
    },
  })
  async reactivateUser(
    @Param('id') id: string,
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      await this.adminUserService.reactivateUser(id, adminUser.id);

      const result = {
        userId: id,
        reactivatedAt: new Date().toISOString(),
        reactivatedBy: adminUser.id,
      };

      this.logger.log(`User ${id} reactivated by admin ${adminUser.id}`);
      return this.createSuccessResponse(
        'User account reactivated successfully',
        result,
      );
    } catch (error) {
      this.logger.error('User reactivation failed:', error.message);
      return this.createErrorResponse(
        error.message || 'Failed to reactivate user account',
        'USER_REACTIVATION_FAILED',
        error.name || 'UNKNOWN_ERROR',
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user account (Admin)',
    description: 'Delete a user account with admin privileges',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User account deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'User account deleted successfully',
        data: {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          deletedAt: '2024-01-15T10:30:00Z',
        },
      },
    },
  })
  async deleteUser(
    @Param('id') id: string,
    @User() adminUser: any,
  ): Promise<ApiResponse<any>> {
    try {
      await this.adminUserService.deleteUser(id, adminUser.id);

      const result = {
        userId: id,
        deletedAt: new Date().toISOString(),
        deletedBy: adminUser.id,
      };

      this.logger.log(`User ${id} deleted by admin ${adminUser.id}`);
      return this.createSuccessResponse(
        'User account deleted successfully',
        result,
      );
    } catch (error) {
      this.logger.error('User deletion failed:', error.message);
      return this.createErrorResponse(
        error.message || 'Failed to delete user account',
        'USER_DELETION_FAILED',
        error.name || 'UNKNOWN_ERROR',
      );
    }
  }
}
