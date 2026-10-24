import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse as ApiResponseDecorator,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../../common/decorators/user.decorator';
import { UrlConfigService } from '../../config/url.config';
import { BaseController } from '../base/base.controller';
import { AuthCoreService } from '../services/auth-core.service';
import { OAuthService } from '../services/oauth.service';
import { SessionService } from '../services/session.service';
import { TokenService } from '../services/token.service';
import { ApiResponse } from '../shared/interfaces/api-response.interface';

@ApiTags('OAuth Authentication')
@Controller('auth')
export class OAuthController extends BaseController {
  constructor(
    private readonly authCoreService: AuthCoreService,
    private readonly oauthService: OAuthService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly urlConfigService: UrlConfigService,
  ) {
    super();
  }

  // ========== GOOGLE OAUTH ==========
  @Public()
  @Get('google')
  @ApiOperation({
    summary: 'Initiate Google OAuth login',
  })
  @ApiResponseDecorator({
    status: 302,
    description: 'Redirect to Google OAuth',
  })
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport handles redirect automatically
  }

  @Public()
  @Get('google/callback')
  @ApiOperation({
    summary: 'Google OAuth callback handler',
  })
  @ApiResponseDecorator({
    status: 302,
    description: 'Redirect to frontend with tokens',
  })
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.authCoreService.googleLogin(req.user);

      this.logger.log(`✅ Google OAuth successful for: ${result.user.email}`);

      const redirectUrl = this.urlConfigService.getAuthRedirectUrl(true, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: JSON.stringify(result.user),
      });
      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('Google OAuth callback error:', error.message);

      const redirectUrl = this.urlConfigService.getAuthRedirectUrl(false, {
        error: 'oauth_failed',
        message: encodeURIComponent(error.message),
      });
      return res.redirect(redirectUrl);
    }
  }

  @Public()
  @Get('google/config')
  @ApiOperation({
    summary: 'Get Google OAuth configuration',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Google OAuth configuration',
    schema: {
      example: {
        success: true,
        message: 'Google OAuth configuration retrieved',
        data: {
          clientId: 'google-client-id',
          callbackUrl: 'http://localhost:4000/api/auth/google/callback',
          authUrl: 'http://localhost:4000/api/auth/google',
        },
      },
    },
  })
  async getGoogleConfig(): Promise<ApiResponse> {
    try {
      const config = await this.oauthService.getOAuthConfig('google');
      return this.createSuccessResponse(
        'Google OAuth configuration retrieved',
        config,
      );
    } catch (error) {
      return this.handleServiceError(
        'getGoogleConfig',
        error,
        'Failed to get Google OAuth configuration',
      );
    }
  }

  // ========== FACEBOOK OAUTH ==========
  @Public()
  @Get('facebook')
  @ApiOperation({
    summary: 'Initiate Facebook OAuth login',
  })
  @ApiResponseDecorator({
    status: 302,
    description: 'Redirect to Facebook OAuth',
  })
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    // Passport handles redirect automatically
  }

  @Public()
  @Get('facebook/callback')
  @ApiOperation({
    summary: 'Facebook OAuth callback handler',
  })
  @ApiResponseDecorator({
    status: 302,
    description: 'Redirect to frontend with tokens',
  })
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.authCoreService.facebookLogin(req.user);

      this.logger.log(`✅ Facebook OAuth successful for: ${result.user.email}`);

      const redirectUrl = this.urlConfigService.getAuthRedirectUrl(true, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: JSON.stringify(result.user),
      });
      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('Facebook OAuth callback error:', error.message);

      const redirectUrl = this.urlConfigService.getAuthRedirectUrl(false, {
        error: 'oauth_failed',
        message: encodeURIComponent(error.message),
      });
      return res.redirect(redirectUrl);
    }
  }

  @Public()
  @Get('facebook/config')
  @ApiOperation({
    summary: 'Get Facebook OAuth configuration',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Facebook OAuth configuration',
    schema: {
      example: {
        success: true,
        message: 'Facebook OAuth configuration retrieved',
        data: {
          appId: 'facebook-app-id',
          callbackUrl: 'http://localhost:4000/api/auth/facebook/callback',
          authUrl: 'http://localhost:4000/api/auth/facebook',
        },
      },
    },
  })
  async getFacebookConfig(): Promise<ApiResponse> {
    try {
      const config = await this.oauthService.getOAuthConfig('facebook');
      return this.createSuccessResponse(
        'Facebook OAuth configuration retrieved',
        config,
      );
    } catch (error) {
      return this.handleServiceError(
        'getFacebookConfig',
        error,
        'Failed to get Facebook OAuth configuration',
      );
    }
  }

  // ========== GITHUB OAUTH ==========
  @Public()
  @Get('github')
  @ApiOperation({
    summary: 'Initiate GitHub OAuth login',
  })
  @ApiResponseDecorator({
    status: 302,
    description: 'Redirect to GitHub OAuth',
  })
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Passport handles redirect automatically
  }

  @Public()
  @Get('github/callback')
  @ApiOperation({
    summary: 'GitHub OAuth callback handler',
  })
  @ApiResponseDecorator({
    status: 302,
    description: 'Redirect to frontend with tokens',
  })
  @UseGuards(AuthGuard('github'))
  async githubAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.authCoreService.githubLogin(req.user);

      this.logger.log(`✅ GitHub OAuth successful for: ${result.user.email}`);

      const redirectUrl = this.urlConfigService.getAuthRedirectUrl(true, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: JSON.stringify(result.user),
      });
      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('GitHub OAuth callback error:', error.message);

      const redirectUrl = this.urlConfigService.getAuthRedirectUrl(false, {
        error: 'oauth_failed',
        message: encodeURIComponent(error.message),
      });
      return res.redirect(redirectUrl);
    }
  }

  @Public()
  @Get('github/config')
  @ApiOperation({
    summary: 'Get GitHub OAuth configuration',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'GitHub OAuth configuration',
    schema: {
      example: {
        success: true,
        message: 'GitHub OAuth configuration retrieved',
        data: {
          clientId: 'github-client-id',
          callbackUrl: 'http://localhost:4000/api/auth/github/callback',
          authUrl: 'http://localhost:4000/api/auth/github',
        },
      },
    },
  })
  async getGithubConfig(): Promise<ApiResponse> {
    try {
      const config = await this.oauthService.getOAuthConfig('github');
      return this.createSuccessResponse(
        'GitHub OAuth configuration retrieved',
        config,
      );
    } catch (error) {
      return this.handleServiceError(
        'getGithubConfig',
        error,
        'Failed to get GitHub OAuth configuration',
      );
    }
  }

  // ========== PROVIDER MANAGEMENT ==========
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @Get('providers')
  @ApiOperation({
    summary: 'Get all linked authentication providers for current user',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Providers retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Providers retrieved successfully',
        data: [
          {
            id: 'provider-id',
            provider: 'GOOGLE',
            email: 'user@gmail.com',
            isPrimary: true,
            linkedAt: '2023-01-01T00:00:00.000Z',
            lastUsedAt: '2023-01-01T00:00:00.000Z',
          },
        ],
      },
    },
  })
  async getUserProviders(@User('id') userId: string): Promise<ApiResponse> {
    try {
      const providers = await this.oauthService.getUserProviders(userId);
      return this.createSuccessResponse(
        'Providers retrieved successfully',
        providers,
      );
    } catch (error) {
      return this.handleServiceError(
        'getUserProviders',
        error,
        'Failed to get providers',
      );
    }
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @Post('providers/unlink')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink an authentication provider' })
  @ApiBody({
    schema: {
      example: {
        provider: 'google',
      },
    },
  })
  async unlinkProvider(
    @User('id') userId: string,
    @Req() req: Request,
  ): Promise<ApiResponse> {
    try {
      const { provider } = req.body;
      await this.oauthService.unlinkProvider(userId, provider);

      return this.createSuccessResponse('Provider unlinked successfully');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Keep not found errors as HttpExceptions
      }

      if (error instanceof BadRequestException) {
        throw error; // Keep input validation errors as HttpExceptions
      }

      return this.handleServiceError(
        'unlinkProvider',
        error,
        'Failed to unlink provider',
      );
    }
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @Post('providers/set-primary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set primary authentication provider' })
  @ApiBody({
    schema: {
      example: {
        provider: 'google',
      },
    },
  })
  async setPrimaryProvider(
    @User('id') userId: string,
    @Req() req: Request,
  ): Promise<ApiResponse> {
    try {
      const { provider } = req.body;
      await this.oauthService.setPrimaryProvider(userId, provider);

      return this.createSuccessResponse('Primary provider set successfully');
    } catch (error) {
      return this.handleServiceError(
        'setPrimaryProvider',
        error,
        'Failed to set primary provider',
      );
    }
  }

}
