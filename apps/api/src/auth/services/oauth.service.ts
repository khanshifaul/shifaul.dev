import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { LoggerService } from 'src/utils/logger/logger.service';
import { DatabaseService } from '../../database/database.service';
import { mapStringToProviderEnum } from '../shared/types/provider.types';
import { OAuthUtils } from '../utils/oauth.utils';
import { AuthCoreService } from './auth-core.service';

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: DatabaseService,
    private readonly loggerService: LoggerService,
    private readonly usersService: UsersService,
    private readonly authCoreService: AuthCoreService,
  ) {}

  // GTM functionality removed - no longer needed

  async getGoogleTokens(userId: string) {
    const provider = await this.prisma.authProvider.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: 'GOOGLE',
        },
      },
    });

    if (!provider || !provider.accessToken) {
      throw new UnauthorizedException(
        'Google OAuth tokens not found. Please authenticate with Google first.',
      );
    }

    // Return only the access token since the auth module handles token refresh
    return {
      accessToken: provider.accessToken,
    };
  }

  async getUserProviders(userId: string): Promise<any[]> {
    return this.prisma.authProvider.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        email: true,
        isPrimary: true,
        linkedAt: true,
        lastUsedAt: true,
      },
      orderBy: { linkedAt: 'asc' },
    });
  }

  async unlinkProvider(userId: string, provider: string): Promise<void> {
    const providerEnum = mapStringToProviderEnum(provider);

    const providerRecord = await this.prisma.authProvider.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: providerEnum,
        },
      },
    });

    if (!providerRecord) {
      throw new NotFoundException(
        `Provider ${provider} is not linked to this account`,
      );
    }

    // Don't allow unlinking if it's the only provider and user has no password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    if (!user?.password) {
      const providerCount = await this.prisma.authProvider.count({
        where: { userId },
      });

      if (providerCount <= 1) {
        throw new BadRequestException(
          'Cannot unlink the only authentication provider without a password set. Please set a password first.',
        );
      }
    }

    await this.prisma.authProvider.delete({
      where: { id: providerRecord.id },
    });

    // If the unlinked provider was primary, set another one as primary
    if (providerRecord.isPrimary) {
      const remainingProvider = await this.prisma.authProvider.findFirst({
        where: { userId },
        orderBy: { linkedAt: 'asc' },
      });

      if (remainingProvider) {
        await this.authCoreService.setPrimaryProvider(
          userId,
          remainingProvider.provider,
        );
      }
    }
  }

  async setPrimaryProvider(userId: string, provider: string): Promise<void> {
    const providerEnum = mapStringToProviderEnum(provider);
    await this.authCoreService.setPrimaryProvider(userId, providerEnum);
  }

  async getOAuthConfig(provider: string): Promise<any> {
    return OAuthUtils.getOAuthConfig(provider, this.configService);
  }

  async refreshOAuthToken(userId: string, provider: string): Promise<void> {
    try {
      const providerEnum = mapStringToProviderEnum(provider);

      const providerRecord = await this.prisma.authProvider.findUnique({
        where: {
          userId_provider: {
            userId,
            provider: providerEnum,
          },
        },
      });

      if (!providerRecord) {
        throw new NotFoundException(`Provider ${provider} not found for user`);
      }

      if (!providerRecord.refreshToken) {
        throw new BadRequestException(
          `No refresh token available for ${provider}`,
        );
      }

      // Token refresh for OAuth providers is handled by passport strategies
      // This method is no longer needed for basic OAuth flows
      throw new BadRequestException(
        `Token refresh not implemented for ${provider}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to refresh ${provider} token for user ${userId}:`,
        error.message,
      );
      throw error;
    }
  }

  // GTM functionality removed - refreshGoogleToken method deleted

  async validateOAuthProvider(
    userId: string,
    provider: string,
  ): Promise<boolean> {
    const providerEnum = mapStringToProviderEnum(provider);

    const providerRecord = await this.prisma.authProvider.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: providerEnum,
        },
      },
    });

    if (!providerRecord) {
      return false;
    }

    // Check if token is expired
    if (
      providerRecord.tokenExpiresAt &&
      providerRecord.tokenExpiresAt < new Date()
    ) {
      // Try to refresh the token
      try {
        await this.refreshOAuthToken(userId, provider);
        return true;
      } catch (error) {
        this.logger.warn(
          `Failed to refresh expired token for ${provider}:`,
          error.message,
        );
        return false;
      }
    }

    return true;
  }

  async validateOAuthUser(oauthUser: {
    email: string;
    name: string;
    avatar?: string;
    provider: string;
    providerId: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    providerData?: any;
  }) {
    try {
      const providerEnum = mapStringToProviderEnum(oauthUser.provider);

      // Find existing user by email
      let existingUser = await this.usersService.findByEmail(
        oauthUser.email.toLowerCase().trim(),
      );

      if (!existingUser) {
        // Create new user if they don't exist
        existingUser = await this.usersService.create({
          email: oauthUser.email.toLowerCase().trim(),
          name: oauthUser.name.trim(),
          avatar: oauthUser.avatar,
          provider: oauthUser.provider, // Keep for backward compatibility
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          verificationToken: null,
        });
      } else if (!existingUser.isEmailVerified) {
        await this.usersService.markEmailAsVerified(existingUser.id);
      }

      // Check if this provider is already linked to the user
      const existingProvider = await this.prisma.authProvider.findUnique({
        where: {
          userId_provider: {
            userId: existingUser.id,
            provider: providerEnum,
          },
        },
      });

      if (!existingProvider) {
        // Link the new provider to the user
        await this.prisma.authProvider.create({
          data: {
            userId: existingUser.id,
            provider: providerEnum,
            providerId: oauthUser.providerId,
            email: oauthUser.email,
            accessToken: oauthUser.accessToken,
            refreshToken: oauthUser.refreshToken,
            tokenExpiresAt: oauthUser.tokenExpiresAt,
            providerData: oauthUser.providerData || {},
            isPrimary: false, // Will be set to true if this is the first provider
          },
        });

        // If user has no primary provider, make this one primary
        const primaryProviderCount = await this.prisma.authProvider.count({
          where: { userId: existingUser.id, isPrimary: true },
        });

        if (primaryProviderCount === 0) {
          await this.setPrimaryProvider(existingUser.id, providerEnum);
        }
      } else {
        // Update existing provider data
        await this.prisma.authProvider.update({
          where: { id: existingProvider.id },
          data: {
            accessToken: oauthUser.accessToken,
            refreshToken: oauthUser.refreshToken,
            tokenExpiresAt: oauthUser.tokenExpiresAt,
            providerData:
              oauthUser.providerData || existingProvider.providerData,
            lastUsedAt: new Date(),
          },
        });
      }

      return existingUser;
    } catch (error) {
      this.logger.error('OAuth user validation failed:', error.message);
      throw new InternalServerErrorException('OAuth authentication failed');
    }
  }
}
