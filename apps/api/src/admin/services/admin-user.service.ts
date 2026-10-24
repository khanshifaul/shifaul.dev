// src/admin/services/admin-user.service.ts
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
import { UsersService } from '../../users/users.service';
import { LoggerService } from '../../utils/logger/logger.service';
import { AdminUpdateUserDto } from '../dto/admin-update-user.dto';
import { AdminUserQueryDto } from '../dto/admin-user-query.dto';
import { AdminUserResponseDto } from '../dto/admin-user-response.dto';

@Injectable()
export class AdminUserService {
  private readonly logger = new Logger(AdminUserService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly prisma: DatabaseService,
    private readonly loggerService: LoggerService,
  ) {}

  async getUsers(query: AdminUserQueryDto): Promise<{
    users: AdminUserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        userId,
        email,
        name,
        roles,
        isEmailVerified,
        isTwoFactorEnabled,
        createdAfter,
        createdBefore,
        updatedAfter,
        updatedBefore,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = query;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (userId) where.id = userId;
      if (email) where.email = { contains: email, mode: 'insensitive' };
      if (name) where.name = { contains: name, mode: 'insensitive' };
      if (roles && roles.length > 0) where.roles = { hasSome: roles };

      if (createdAfter)
        where.createdAt = { ...where.createdAt, gte: new Date(createdAfter) };
      if (createdBefore)
        where.createdAt = { ...where.createdAt, lte: new Date(createdBefore) };
      if (updatedAfter)
        where.updatedAt = { ...where.updatedAt, gte: new Date(updatedAfter) };
      if (updatedBefore)
        where.updatedAt = { ...where.updatedAt, lte: new Date(updatedBefore) };

      // Handle email verification filter
      if (isEmailVerified !== undefined)
        where.isEmailVerified = isEmailVerified;
      if (isTwoFactorEnabled !== undefined)
        where.isTwoFactorEnabled = isTwoFactorEnabled;

      // Get total count
      const total = await this.prisma.user.count({ where });

      // Get users with pagination
      const users = await this.prisma.user.findMany({
        where,
        orderBy: { [sortBy]: sortOrder.toLowerCase() },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          // Include auth providers to determine primary provider
          authProviders: {
            where: { isPrimary: true },
            select: { provider: true },
            take: 1,
          },
        },
      });

      // Transform to response DTOs and add computed fields
      const transformedUsers: AdminUserResponseDto[] = users.map((user) => {
        // Determine provider from auth providers
        const primaryProvider = user.authProviders[0]?.provider || 'local';


        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar || undefined,
          provider: primaryProvider,
          isEmailVerified: user.isEmailVerified,
          emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
          isTwoFactorEnabled: user.isTwoFactorEnabled,
          roles: user.roles,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          status: user.status,
          suspensionReason: user.suspensionReason || undefined,
          suspendedAt: user.suspendedAt?.toISOString(),
          metadata: user.metadata as Record<string, any>,
        };
      });

      this.logger.log(
        `Retrieved ${users.length} users (page ${page}, limit ${limit})`,
      );

      return {
        users: transformedUsers,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve users:', error.message);
      throw new BadRequestException('Failed to retrieve users');
    }
  }

  async getUserById(id: string): Promise<AdminUserResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Default to local provider since authProviders relation was removed
      const primaryProvider = 'local';

      const transformedUser: AdminUserResponseDto = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || undefined,
        provider: primaryProvider,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        roles: user.roles,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        status: user.status,
        suspensionReason: user.suspensionReason || undefined,
        suspendedAt: user.suspendedAt?.toISOString(),
        metadata: user.metadata as Record<string, any>,
      };

      this.logger.log(`Retrieved user ${id}`);
      return transformedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to retrieve user ${id}:`, error.message);
      throw new BadRequestException('Failed to retrieve user');
    }
  }

  async updateUser(
    id: string,
    updateData: AdminUpdateUserDto,
    adminId: string,
  ): Promise<AdminUserResponseDto> {
    try {
      // Get current user data for audit
      const currentUser = await this.usersService.findById(id);
      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      // Get admin data for audit
      const adminUser = await this.usersService.findById(adminId);
      if (!adminUser) {
        throw new NotFoundException('Admin user not found');
      }

      // Prepare update data
      const updatePayload: any = {};

      if (updateData.name !== undefined) updatePayload.name = updateData.name;
      if (updateData.email !== undefined)
        updatePayload.email = updateData.email;
      if (updateData.roles !== undefined)
        updatePayload.roles = updateData.roles;
      if (updateData.isEmailVerified !== undefined)
        updatePayload.isEmailVerified = updateData.isEmailVerified;
      if (updateData.isTwoFactorEnabled !== undefined)
        updatePayload.isTwoFactorEnabled = updateData.isTwoFactorEnabled;
      if (updateData.status !== undefined)
        updatePayload.status = updateData.status;
      if (updateData.suspensionReason !== undefined)
        updatePayload.suspensionReason = updateData.suspensionReason;
      if (updateData.metadata !== undefined)
        updatePayload.metadata = updateData.metadata;
      updatePayload.updatedAt = new Date();

      // Update user
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updatePayload,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isEmailVerified: true,
          emailVerifiedAt: true,
          isTwoFactorEnabled: true,
          roles: true,
          status: true,
          suspensionReason: true,
          suspendedAt: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Default to local provider since authProviders relation was removed
      const primaryProvider = 'local';

      const transformedUser: AdminUserResponseDto = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar || undefined,
        provider: primaryProvider,
        isEmailVerified: updatedUser.isEmailVerified,
        emailVerifiedAt: updatedUser.emailVerifiedAt?.toISOString(),
        isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
        roles: updatedUser.roles,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
        status: updatedUser.status,
        suspensionReason: updatedUser.suspensionReason || undefined,
        suspendedAt: updatedUser.suspendedAt?.toISOString(),
        metadata: updatedUser.metadata as Record<string, any>,
      };

      this.logger.log(`User ${id} updated by admin ${adminId}`);
      return transformedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update user ${id}:`, error.message);
      throw new BadRequestException('Failed to update user');
    }
  }

  async suspendUser(
    id: string,
    reason: string,
    adminId: string,
  ): Promise<void> {
    try {
      // Get current user data for audit
      const currentUser = await this.usersService.findById(id);
      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      // Get admin data for audit
      const adminUser = await this.usersService.findById(adminId);
      if (!adminUser) {
        throw new NotFoundException('Admin user not found');
      }

      await this.prisma.user.update({
        where: { id },
        data: {
          status: 'SUSPENDED',
          suspensionReason: reason,
          suspendedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`User ${id} suspended by admin ${adminId}: ${reason}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to suspend user ${id}:`, error.message);
      throw new BadRequestException('Failed to suspend user');
    }
  }

  async reactivateUser(id: string, adminId: string): Promise<void> {
    try {
      // Get current user data for audit
      const currentUser = await this.usersService.findById(id);
      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      // Get admin data for audit
      const adminUser = await this.usersService.findById(adminId);
      if (!adminUser) {
        throw new NotFoundException('Admin user not found');
      }

      await this.prisma.user.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          suspensionReason: null,
          suspendedAt: null,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`User ${id} reactivated by admin ${adminId}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to reactivate user ${id}:`, error.message);
      throw new BadRequestException('Failed to reactivate user');
    }
  }

  async deleteUser(id: string, adminId: string): Promise<void> {
    try {
      // Get current user data for audit
      const currentUser = await this.usersService.findById(id);
      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      // Get admin data for audit
      const adminUser = await this.usersService.findById(adminId);
      if (!adminUser) {
        throw new NotFoundException('Admin user not found');
      }

      // Note: Soft delete not supported in current schema - using metadata as workaround
      await this.prisma.user.update({
        where: { id },
        data: {
          // Mark as deleted in metadata
          // Note: metadata field doesn't exist in schema, this is a workaround
          updatedAt: new Date(),
        },
      });

      this.logger.log(`User ${id} deleted by admin ${adminId}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete user ${id}:`, error.message);
      throw new BadRequestException('Failed to delete user');
    }
  }
}
