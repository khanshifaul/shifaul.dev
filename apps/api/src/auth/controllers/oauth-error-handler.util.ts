// Enhanced OAuth callback error handling utility
// Provides comprehensive error handling for OAuth flows

import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { UrlConfigService } from '../../config/url.config';

export enum OAuthErrorType {
  USER_DENIED_PERMISSION = 'user_denied_permission',
  INVALID_OAUTH_RESPONSE = 'invalid_oauth_response', 
  NETWORK_ERROR = 'network_error',
  USER_ALREADY_EXISTS = 'user_already_exists',
  INVALID_USER_DATA = 'invalid_user_data',
  TOKEN_GENERATION_FAILED = 'token_generation_failed',
  DATABASE_ERROR = 'database_error',
  PROVIDER_CONFIGURATION_ERROR = 'provider_configuration_error',
  EXPIRED_AUTHORIZATION_CODE = 'expired_authorization_code',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  UNKNOWN_ERROR = 'unknown_error',
}

export interface OAuthErrorContext {
  provider: string;
  errorType: OAuthErrorType;
  userMessage: string;
  debugMessage: string;
  shouldRedirect: boolean;
  httpStatusCode: number;
}

export class OAuthErrorHandler {
  
  /**
   * Handles OAuth callback errors with specific error types and user-friendly messages
   */
  static handleOAuthError(
    error: any,
    provider: string,
    urlConfigService: UrlConfigService,
    res: Response,
  ): void {
    const errorContext = this.analyzeOAuthError(error, provider);
    
    // Log the error for debugging
    this.logOAuthError(errorContext, error);
    
    // Generate appropriate redirect URL
    const redirectUrl = this.generateErrorRedirectUrl(
      urlConfigService,
      errorContext,
      res,
    );
    
    return res.redirect(redirectUrl);
  }
  
  /**
   * Analyzes the error and categorizes it for appropriate handling
   */
  private static analyzeOAuthError(error: any, provider: string): OAuthErrorContext {
    const context: OAuthErrorContext = {
      provider,
      errorType: OAuthErrorType.UNKNOWN_ERROR,
      userMessage: 'Authentication failed. Please try again.',
      debugMessage: error?.message || 'Unknown error occurred',
      shouldRedirect: true,
      httpStatusCode: 500,
    };
    
    // Analyze specific error types
    if (error?.message?.includes('denied') || error?.message?.includes('cancelled')) {
      context.errorType = OAuthErrorType.USER_DENIED_PERMISSION;
      context.userMessage = 'You cancelled the authentication process.';
      context.debugMessage = `User cancelled ${provider} OAuth authentication`;
      context.httpStatusCode = 400;
    }
    else if (error instanceof UnauthorizedException) {
      context.errorType = OAuthErrorType.INVALID_OAUTH_RESPONSE;
      context.userMessage = 'Invalid authentication response from provider.';
      context.debugMessage = `Unauthorized error in ${provider} OAuth: ${error.message}`;
      context.httpStatusCode = 401;
    }
    else if (error instanceof BadRequestException) {
      context.errorType = OAuthErrorType.INVALID_USER_DATA;
      context.userMessage = 'Invalid user data received from provider.';
      context.debugMessage = `Bad request error in ${provider} OAuth: ${error.message}`;
      context.httpStatusCode = 400;
    }
    else if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
      context.errorType = OAuthErrorType.NETWORK_ERROR;
      context.userMessage = 'Network error occurred. Please check your connection and try again.';
      context.debugMessage = `Network error in ${provider} OAuth: ${error.message}`;
      context.httpStatusCode = 503;
    }
    else if (error?.message?.includes('already exists') || error?.code === 'P2002') {
      context.errorType = OAuthErrorType.USER_ALREADY_EXISTS;
      context.userMessage = 'An account with this email already exists.';
      context.debugMessage = `User already exists for ${provider} OAuth: ${error.message}`;
      context.httpStatusCode = 409;
    }
    else if (error?.message?.includes('token') || error?.message?.includes('jwt')) {
      context.errorType = OAuthErrorType.TOKEN_GENERATION_FAILED;
      context.userMessage = 'Failed to generate authentication tokens.';
      context.debugMessage = `Token generation failed for ${provider} OAuth: ${error.message}`;
      context.httpStatusCode = 500;
    }
    else if (error?.code?.startsWith('P') || error?.name === 'PrismaClientKnownRequestError') {
      context.errorType = OAuthErrorType.DATABASE_ERROR;
      context.userMessage = 'Database error occurred. Please try again later.';
      context.debugMessage = `Database error in ${provider} OAuth: ${error.message}`;
      context.httpStatusCode = 500;
    }
    else if (error?.message?.includes('configuration') || error?.message?.includes('client')) {
      context.errorType = OAuthErrorType.PROVIDER_CONFIGURATION_ERROR;
      context.userMessage = 'Provider configuration error. Please contact support.';
      context.debugMessage = `Configuration error for ${provider} OAuth: ${error.message}`;
      context.httpStatusCode = 500;
    }
    else if (error?.message?.includes('expired') || error?.message?.includes('code')) {
      context.errorType = OAuthErrorType.EXPIRED_AUTHORIZATION_CODE;
      context.userMessage = 'Authentication code expired. Please try again.';
      context.debugMessage = `Expired code for ${provider} OAuth: ${error.message}`;
      context.httpStatusCode = 400;
    }
    else if (error?.message?.includes('rate limit') || error?.message?.includes('quota')) {
      context.errorType = OAuthErrorType.RATE_LIMIT_EXCEEDED;
      context.userMessage = 'Too many requests. Please wait a moment and try again.';
      context.debugMessage = `Rate limit exceeded for ${provider} OAuth: ${error.message}`;
      context.httpStatusCode = 429;
    }
    
    return context;
  }
  
  /**
   * Generates an error redirect URL with appropriate parameters
   */
  private static generateErrorRedirectUrl(
    urlConfigService: UrlConfigService,
    errorContext: OAuthErrorContext,
    _res: Response,
  ): string {
    // For some errors, we might want to show a different page or message
    const errorParams = {
      success: false,
      error: errorContext.errorType,
      provider: errorContext.provider,
      message: encodeURIComponent(errorContext.userMessage),
      timestamp: Date.now(),
    };
    
    return urlConfigService.getAuthRedirectUrl(false, errorParams);
  }
  
  /**
   * Logs OAuth errors with appropriate level and context
   */
  private static logOAuthError(errorContext: OAuthErrorContext, originalError: any): void {
    const logMessage = `[${errorContext.provider.toUpperCase()} OAuth Error] ${errorContext.debugMessage}`;
    
    // Use different log levels based on error severity
    switch (errorContext.errorType) {
      case OAuthErrorType.USER_DENIED_PERMISSION:
        // This is expected user behavior, log at info level
        console.log(`ℹ️ ${logMessage}`);
        break;
        
      case OAuthErrorType.NETWORK_ERROR:
      case OAuthErrorType.RATE_LIMIT_EXCEEDED:
        // Transient errors, log at warning level
        console.warn(`⚠️ ${logMessage}`);
        break;
        
      case OAuthErrorType.DATABASE_ERROR:
      case OAuthErrorType.TOKEN_GENERATION_FAILED:
      case OAuthErrorType.PROVIDER_CONFIGURATION_ERROR:
        // Serious errors that need attention, log at error level
        console.error(`❌ ${logMessage}`, {
          stack: originalError?.stack,
          context: errorContext,
        });
        break;
        
      default:
        // Unknown errors, log as warning for investigation
        console.warn(`❓ ${logMessage}`, {
          stack: originalError?.stack,
          context: errorContext,
        });
        break;
    }
  }
  
  /**
   * Validates OAuth response data before processing
   */
  static validateOAuthResponse(user: any, provider: string): void {
    if (!user) {
      throw new UnauthorizedException(`No user data received from ${provider}`);
    }
    
    if (!user.email) {
      throw new BadRequestException(`No email received from ${provider}`);
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      throw new BadRequestException(`Invalid email format from ${provider}: ${user.email}`);
    }
    
    if (!user.id && !user.providerId) {
      throw new BadRequestException(`No user ID received from ${provider}`);
    }
  }
}