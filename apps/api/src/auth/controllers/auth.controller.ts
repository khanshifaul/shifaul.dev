import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse as ApiResponseDecorator,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { UrlConfigService } from 'src/config/url.config';
import { DatabaseService } from 'src/database/database.service';
import { UsersService } from 'src/users/users.service';
import { BaseController } from '../base/base.controller';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ResendVerificationEmailDto } from '../dto/resend-verification-email.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '../dto/reset-password.dto';
import { AuthCoreService } from '../services/auth-core.service';
import { SessionService } from '../services/session.service';
import { TokenService } from '../services/token.service';
import { ApiResponse } from '../shared/interfaces/api-response.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController extends BaseController {
  constructor(
    private readonly authCoreService: AuthCoreService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
    private readonly prisma: DatabaseService,
    private readonly configService: ConfigService,
    private readonly urlConfigService: UrlConfigService,
  ) {
    super();
  }


  // ========== REGISTER ==========
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user with email and password' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'name', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
        },
        name: {
          type: 'string',
          example: 'John Doe',
        },
        password: {
          type: 'string',
          minLength: 8,
          example: 'password123',
        },
        avatar: {
          type: 'string',
          example: 'https://example.com/avatar.jpg',
        },
      },
    },
  })
  @ApiResponseDecorator({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        success: true,
        message:
          'Registration successful. Please check your email for verification.',
        data: {
          user: {
            id: 'uuid',
            email: 'user@example.com',
            name: 'John Doe',
            avatar: 'https://example.com/avatar.jpg',
            provider: 'local',
            isEmailVerified: false,
            isTwoFactorEnabled: false,
          },
        },
      },
    },
  })
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponse> {
    try {
      const result = await this.authCoreService.register(registerDto);
      return this.createSuccessResponse(
        'Registration successful. Please check your email for verification.',
        result,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // Keep input validation errors as HttpExceptions
      }

      if (error instanceof ConflictException) {
        throw error; // Keep business logic conflicts as HttpExceptions
      }

      return this.handleServiceError(
        'register',
        error,
        'Registration failed. Please try again.',
      );
    }
  }

  // ========== LOGIN ==========
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards() // Local strategy guard will be applied at service level
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
        },
        password: {
          type: 'string',
          example: 'password123',
        },
        rememberMe: {
          type: 'boolean',
          example: true,
          description: 'Remember user session for extended period',
        },
      },
    },
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Login successful' },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'cmgtoxaai0000pzooulf0bnt4' },
                email: { type: 'string', example: 'user@example.com' },
                name: { type: 'string', example: 'John Doe' },
                avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
                provider: { type: 'string', example: 'LOCAL' },
                isEmailVerified: { type: 'boolean', example: true },
                isTwoFactorEnabled: { type: 'boolean', example: false },
              },
            },
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'JWT access token for API authentication (expires in 15 minutes)'
            },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'JWT refresh token for obtaining new access tokens (expires in 7-30 days)'
            },
          },
        },
      },
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<ApiResponse> {
    try {
      // First validate user credentials
      const user = await this.authCoreService.validateUser(
        loginDto.email,
        loginDto.password,
      );

      this.logger.log(
        `🔐 Login attempt for user: ${loginDto.email}, IP: ${req.ip}`,
      );


      const result = await this.authCoreService.login(
        user,
        loginDto.rememberMe,
        req.ip,
        req.get('User-Agent'),
      );

      if ('requiresTwoFactor' in result) {
        this.logger.log(
          `🔑 2FA required for user: ${loginDto.email}, tempToken generated`,
        );
        return this.createSuccessResponse(
          'Two-factor authentication required',
          result,
        );
      }

      this.logger.log(`✅ Login successful for user: ${loginDto.email}`);
      return this.createSuccessResponse('Login successful', result);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        // Log failed login attempt
        try {
          // We need to get user ID for logging, but we don't have it if validation failed
          // So we'll log with minimal info
          this.logger.warn(`❌ Login failed for email: ${loginDto.email}, IP: ${req.ip}`);
        } catch (_logError) {
          // Don't let logging errors break the response
        }
        throw error; // Keep authentication errors as HttpExceptions
      }

      return this.handleServiceError(
        'login',
        error,
        'Login failed. Please try again.',
      );
    }
  }


  // ========== VERIFY EMAIL ==========
  @Public()
  @Get('verify-email')
  @ApiOperation({
    summary: 'Verify user email using token',
  })
  @ApiQuery({
    name: 'token',
    description: 'Email verification token sent to user email',
    required: true,
    type: String,
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Email verification successful',
    schema: {
      example: {
        success: true,
        message: 'Email verified successfully',
        data: {
          user: {
            id: 'uuid',
            email: 'user@example.com',
            isEmailVerified: true,
          },
          alreadyVerified: false,
        },
      },
    },
  })
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      if (!token) {
        throw new BadRequestException('Token is required');
      }

      // Use the new enhanced token verification method
      const { email: _email, user, tokenValid } =
        await this.usersService.verifyEmailToken(token);

      if (!tokenValid) {
        throw new BadRequestException('Invalid or expired verification token');
      }

      // If token is valid but no user found (possible with old tokens), reject
      if (!user) {
        throw new BadRequestException('User not found or token has expired');
      }

      const { user: updatedUser, wasAlreadyVerified } =
        await this.usersService.markEmailAsVerified(user.id);

      if (wasAlreadyVerified) {
        this.logger.log(
          `📧 Email already verified for user: ${updatedUser.email}`,
        );

        const response = this.createSuccessResponse(
          'Email is already verified',
          {
            user: {
              id: updatedUser.id,
              email: updatedUser.email,
              isEmailVerified: updatedUser.isEmailVerified,
            },
            alreadyVerified: true,
          },
        );

        return res.json(response);
      } else {
        this.logger.log(`✅ Email verified for user: ${updatedUser.email}`);

        const response = this.createSuccessResponse(
          'Email verified successfully',
          {
            user: {
              id: updatedUser.id,
              email: updatedUser.email,
              isEmailVerified: updatedUser.isEmailVerified,
            },
            alreadyVerified: false,
          },
        );

        return res.json(response);
      }
    } catch (error) {
      this.logger.error('Email verification error:', error.message);

      const errorResponse = this.createErrorResponse(
        error.message,
        'VERIFICATION_FAILED',
        'INVALID_TOKEN',
      );

      return res.status(400).json(errorResponse);
    }
  }

  // ========== RESEND VERIFICATION EMAIL ==========
  @Public()
  @Post('resend-verification-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 86400000 } })
  @ApiOperation({ summary: 'Resend verification email with new token' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
        },
      },
    },
  })
  async resendVerificationEmail(
    @Body() dto: ResendVerificationEmailDto,
  ): Promise<ApiResponse> {
    try {
      await this.authCoreService.resendVerificationEmail(dto.email);
      return this.createSuccessResponse('Verification email sent successfully');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Keep not found errors as HttpExceptions
      }

      if (error instanceof BadRequestException) {
        throw error; // Keep input validation errors as HttpExceptions
      }

      return this.handleServiceError(
        'resendVerificationEmail',
        error,
        'Failed to send verification email',
      );
    }
  }

  // ========== LOGOUT ==========
  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Logout current user and invalidate current session',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: {
        success: true,
        message: 'Logged out successfully',
        data: null,
      },
    },
  })
  async logout(@User() user: any): Promise<ApiResponse> {
    try {
      // Extract current session ID from JWT payload
      const currentSessionId = user.sessionId;


      this.logger.log(
        `User logged out: ${user.email} (Session: ${currentSessionId || 'unknown'})`,
      );
      return this.createSuccessResponse('Logged out successfully');
    } catch (error) {
      return this.handleServiceError('logout', error, 'Failed to logout');
    }
  }

  // ========== PASSWORD RESET ==========
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Request password reset email' })
  async forgotPassword(
    @Body() { email }: ForgotPasswordDto,
    @Req() req: Request,
  ): Promise<ApiResponse> {
    try {
      await this.authCoreService.requestPasswordReset(email);

      // Log password reset request (without revealing if user exists)
      this.logger.log(`Password reset requested for email: ${email}, IP: ${req.ip}`);

      return this.createSuccessResponse(
        'If an account with this email exists, a password reset link has been sent.',
      );
    } catch (error) {
      this.logger.error('Password reset request failed:', error.message);
      // Don't reveal if email exists or not for security
      return this.createSuccessResponse(
        'If an account with this email exists, a password reset link has been sent.',
      );
    }
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() req: Request,
  ): Promise<ApiResponse> {
    try {
      await this.authCoreService.resetPassword(
        resetPasswordDto.token,
        resetPasswordDto.password,
      );

      this.logger.log(`✅ Password reset successful, IP: ${req.ip}`);
      return this.createSuccessResponse('Password reset successfully');
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.warn(`❌ Password reset failed - invalid token, IP: ${req.ip}`);
      }
      return this.handleServiceError(
        'resetPassword',
        error,
        'Password reset failed',
      );
    }
  }

  // ========== REFRESH TOKEN ==========
  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({
    summary: 'Refresh access token using refresh token',
    description: 'Exchange a valid refresh token for a new access token and refresh token pair'
  })
  @ApiBearerAuth('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token',
    description: `
    Refreshes an expired access token using a valid refresh token.

    **Authentication:** Send the refresh token in the Authorization header as a Bearer token.
    **Security:** Refresh tokens are single-use and will be invalidated after successful refresh.
    **Token Rotation:** New access and refresh tokens are generated on each successful refresh.

    **Flow:**
    1. Client sends refresh token in Authorization header
    2. Server validates refresh token against database session
    3. Server generates new access + refresh token pair
    4. Old refresh token is invalidated (one-time use)
    5. New tokens returned to client
    `,
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Tokens refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Tokens refreshed successfully' },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'cmgtoxaai0000pzooulf0bnt4' },
                email: { type: 'string', example: 'user@example.com' },
                name: { type: 'string', example: 'John Doe' },
                avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
                provider: { type: 'string', example: 'LOCAL' },
                isEmailVerified: { type: 'boolean', example: true },
                isTwoFactorEnabled: { type: 'boolean', example: false },
              },
            },
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'New JWT access token (expires in 15 minutes)'
            },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'New JWT refresh token (expires in 7-30 days based on rememberMe)'
            },
          },
        },
      },
    },
  })
  @ApiResponseDecorator({
    status: 401,
    description: 'Unauthorized - Invalid or expired refresh token',
    schema: {
      example: {
        success: false,
        statusCode: 401,
        message: 'Session not found or expired',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponseDecorator({
    status: 400,
    description: 'Bad Request - Missing or malformed refresh token',
    schema: {
      example: {
        success: false,
        statusCode: 400,
        message: 'Refresh token is required in Authorization header',
        error: 'Bad Request',
      },
    },
  })
  async refresh(
    @Req() req: Request,
    @User() user: any, // This will be populated by RefreshTokenGuard
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`🔄 Token refresh attempt from IP: ${req.ip} for user: ${user?.email}`);

      // If we reach here, the RefreshTokenGuard has already validated the token
      // and populated the user object with session information

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Find the existing session using sessionId from the validated refresh token
      const existingSession = await this.prisma.userSession.findUnique({
        where: {
          sessionId: user.sessionId,
          userId: user.id,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
      });

      if (!existingSession) {
        throw new UnauthorizedException('Session not found or expired');
      }

      this.logger.log(`🔄 Refreshing tokens for existing session ${existingSession.sessionId}`);

      // Fetch complete user data to ensure all fields are available for response
      const completeUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isEmailVerified: true,
          isTwoFactorEnabled: true,
        },
      });

      if (!completeUser) {
        throw new NotFoundException('User not found');
      }

      // Use the new method that reuses the existing session instead of creating a new one
      const tokens = await this.tokenService.refreshTokensWithExistingSession(
        existingSession,
        completeUser.id,
        completeUser.email,
        user.roles || [],
        user.rememberMe || false,
        req.ip,
        req.get('User-Agent'),
      );

      this.logger.log(`🔄 Generated new tokens - AccessToken length: ${tokens.accessToken.length}, RefreshToken length: ${tokens.refreshToken.length}`);

      // Get primary provider
      const primaryProvider = await this.prisma.authProvider.findFirst({
        where: { userId: completeUser.id, isPrimary: true },
        select: { provider: true },
      });

      const userResult = completeUser;

      this.logger.log(`✅ Tokens refreshed successfully for user: ${user.email} (Session: ${user.sessionId})`);

      return this.createSuccessResponse('Tokens refreshed successfully', {
        user: {
          id: userResult.id,
          email: userResult.email,
          name: userResult.name,
          avatar: userResult.avatar,
          provider: primaryProvider?.provider || 'local',
          isEmailVerified: userResult.isEmailVerified,
          isTwoFactorEnabled: userResult.isTwoFactorEnabled,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error; // Keep authentication errors as HttpExceptions
      }

      this.logger.error(`❌ Token refresh failed for user ${user?.email}: ${error.message}`);

      // If refresh fails, provide clear error message
      return this.handleServiceError(
        'refresh',
        error,
        'Token refresh failed. Please login again.',
      );
    }
  }

  // ========== CHANGE PASSWORD ==========
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @User('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() _req: Request,
  ): Promise<ApiResponse> {
    try {
      await this.authCoreService.changePassword(
        userId,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );

      this.logger.log(`✅ Password changed successfully for user: ${userId}`);
      return this.createSuccessResponse('Password changed successfully');
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.warn(`❌ Password change failed - invalid current password for user: ${userId}`);
      }
      return this.handleServiceError(
        'changePassword',
        error,
        'Password change failed',
      );
    }
  }
}
