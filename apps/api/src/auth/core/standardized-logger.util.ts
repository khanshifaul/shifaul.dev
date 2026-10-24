// Standardized logging utility for consistent log levels across auth module
// Ensures proper log formatting, categorization, and appropriate log levels

import { Logger } from '@nestjs/common';

export enum AuthLogLevel {
  DEBUG = 'debug',
  INFO = 'info', 
  WARN = 'warn',
  ERROR = 'error',
}

export enum AuthLogCategory {
  AUTHENTICATION = 'AUTH',
  AUTHORIZATION = 'AUTHZ', 
  SESSION = 'SESSION',
  TOKEN = 'TOKEN',
  OAUTH = 'OAUTH',
  TWO_FACTOR = '2FA',
  USER_MANAGEMENT = 'USER',
  SECURITY = 'SEC',
  SYSTEM = 'SYS',
  DATABASE = 'DB',
}

export interface AuthLogContext {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  provider?: string;
  method?: string;
  endpoint?: string;
  duration?: number;
  errorCode?: string;
  additionalInfo?: Record<string, any>;
}

export class StandardizedLogger {
  constructor(
    private readonly logger: Logger,
    private readonly category: AuthLogCategory,
  ) {}

  /**
   * Security-focused logging with specific formatting
   */
  security(
    level: AuthLogLevel,
    message: string,
    context: AuthLogContext = {},
  ): void {
    const securityPrefix = '[SECURITY]';
    const formattedMessage = this.formatMessage(message, context);
    
    switch (level) {
      case AuthLogLevel.ERROR:
        this.logger.error(`${securityPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'security',
          ...this.sanitizeContext(context),
        });
        break;
      case AuthLogLevel.WARN:
        this.logger.warn(`${securityPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'security',
          ...this.sanitizeContext(context),
        });
        break;
      case AuthLogLevel.INFO:
      default:
        this.logger.log(`${securityPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'security',
          ...this.sanitizeContext(context),
        });
        break;
    }
  }

  /**
   * Authentication-specific logging
   */
  auth(
    level: AuthLogLevel,
    action: string,
    context: AuthLogContext = {},
  ): void {
    const authPrefix = '[AUTH]';
    const formattedMessage = this.formatMessage(`Authentication ${action}`, context);
    
    switch (level) {
      case AuthLogLevel.ERROR:
        this.logger.error(`${authPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'auth',
          ...this.sanitizeContext(context),
        });
        break;
      case AuthLogLevel.WARN:
        this.logger.warn(`${authPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'auth',
          ...this.sanitizeContext(context),
        });
        break;
      case AuthLogLevel.INFO:
        this.logger.log(`${authPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'auth',
          ...this.sanitizeContext(context),
        });
        break;
      case AuthLogLevel.DEBUG:
        this.logger.debug(`${authPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'auth',
          ...this.sanitizeContext(context),
        });
        break;
    }
  }

  /**
   * Session management logging
   */
  session(
    level: AuthLogLevel,
    action: string,
    context: AuthLogContext = {},
  ): void {
    const sessionPrefix = '[SESSION]';
    const formattedMessage = this.formatMessage(`Session ${action}`, context);
    
    switch (level) {
      case AuthLogLevel.ERROR:
        this.logger.error(`${sessionPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'session',
          ...this.sanitizeContext(context),
        });
        break;
      case AuthLogLevel.WARN:
        this.logger.warn(`${sessionPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'session',
          ...this.sanitizeContext(context),
        });
        break;
      case AuthLogLevel.INFO:
        this.logger.log(`${sessionPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'session',
          ...this.sanitizeContext(context),
        });
        break;
    }
  }

  /**
   * Token-related logging
   */
  token(
    level: AuthLogLevel,
    action: string,
    context: AuthLogContext = {},
  ): void {
    const tokenPrefix = '[TOKEN]';
    const formattedMessage = this.formatMessage(`Token ${action}`, context);
    
    // Never log actual token values for security
    const safeContext = {
      ...this.sanitizeContext(context),
      tokenPreview: context.additionalInfo?.token ? 
        `${context.additionalInfo.token.substring(0, 10)}...` : undefined,
    };
    
    switch (level) {
      case AuthLogLevel.ERROR:
        this.logger.error(`${tokenPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'token',
          ...safeContext,
        });
        break;
      case AuthLogLevel.WARN:
        this.logger.warn(`${tokenPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'token',
          ...safeContext,
        });
        break;
      case AuthLogLevel.INFO:
        this.logger.log(`${tokenPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'token',
          ...safeContext,
        });
        break;
    }
  }

  /**
   * OAuth-specific logging
   */
  oauth(
    level: AuthLogLevel,
    provider: string,
    action: string,
    context: AuthLogContext = {},
  ): void {
    const oauthPrefix = `[OAUTH:${provider.toUpperCase()}]`;
    const formattedMessage = this.formatMessage(`OAuth ${action}`, {
      ...context,
      provider,
    });
    
    switch (level) {
      case AuthLogLevel.ERROR:
        this.logger.error(`${oauthPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'oauth',
          provider,
          ...this.sanitizeContext(context),
        });
        break;
      case AuthLogLevel.WARN:
        this.logger.warn(`${oauthPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'oauth',
          provider,
          ...this.sanitizeContext(context),
        });
        break;
      case AuthLogLevel.INFO:
        this.logger.log(`${oauthPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'oauth',
          provider,
          ...this.sanitizeContext(context),
        });
        break;
      case AuthLogLevel.DEBUG:
        this.logger.debug(`${oauthPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'oauth',
          provider,
          ...this.sanitizeContext(context),
        });
        break;
    }
  }

  /**
   * Database operation logging
   */
  database(
    level: AuthLogLevel,
    operation: string,
    context: AuthLogContext = {},
  ): void {
    const dbPrefix = '[DB]';
    const formattedMessage = this.formatMessage(`Database ${operation}`, context);
    
    switch (level) {
      case AuthLogLevel.ERROR:
        this.logger.error(`${dbPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'database',
          operation,
          ...this.sanitizeContext(context),
        });
        break;
      case AuthLogLevel.WARN:
        this.logger.warn(`${dbPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'database',
          operation,
          ...this.sanitizeContext(context),
        });
        break;
      case AuthLogLevel.DEBUG:
        this.logger.debug(`${dbPrefix} ${formattedMessage}`, {
          category: this.category,
          level: 'database',
          operation,
          ...this.sanitizeContext(context),
        });
        break;
    }
  }

  /**
   * Success logging with consistent formatting
   */
  success(
    action: string,
    context: AuthLogContext = {},
  ): void {
    const successMessage = `✅ ${action}`;
    this.logger.log(successMessage, {
      category: this.category,
      level: 'success',
      ...this.sanitizeContext(context),
    });
  }

  /**
   * Failure logging with error details
   */
  failure(
    action: string,
    error: Error | string,
    context: AuthLogContext = {},
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const failureMessage = `❌ ${action}: ${errorMessage}`;
    
    this.logger.error(failureMessage, {
      category: this.category,
      level: 'failure',
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
      ...this.sanitizeContext(context),
    });
  }

  /**
   * Performance logging
   */
  performance(
    action: string,
    duration: number,
    context: AuthLogContext = {},
  ): void {
    const performanceMessage = `⏱️ ${action} completed in ${duration}ms`;
    
    this.logger.debug(performanceMessage, {
      category: this.category,
      level: 'performance',
      duration,
      ...this.sanitizeContext(context),
    });
  }

  /**
   * Formats message with context information
   */
  private formatMessage(message: string, context: AuthLogContext): string {
    const contextParts: string[] = [];
    
    if (context.userId) {
      contextParts.push(`User: ${context.userId}`);
    }
    
    if (context.sessionId) {
      contextParts.push(`Session: ${context.sessionId.substring(0, 8)}...`);
    }
    
    if (context.ipAddress) {
      contextParts.push(`IP: ${context.ipAddress}`);
    }
    
    if (context.provider) {
      contextParts.push(`Provider: ${context.provider}`);
    }
    
    const contextSuffix = contextParts.length > 0 ? ` [${contextParts.join(', ')}]` : '';
    return `${message}${contextSuffix}`;
  }

  /**
   * Sanitizes context to remove sensitive information
   */
  private sanitizeContext(context: AuthLogContext): AuthLogContext {
    const sanitized: AuthLogContext = { ...context };
    
    // Remove or mask sensitive fields
    if (sanitized.userAgent) {
      // Keep only browser type and version for debugging
      sanitized.userAgent = sanitized.userAgent.substring(0, 100);
    }
    
    // Mask partial IP addresses for privacy (keep last octet)
    if (sanitized.ipAddress && sanitized.ipAddress.includes('.')) {
      const parts = sanitized.ipAddress.split('.');
      if (parts.length === 4) {
        sanitized.ipAddress = `${parts[0]}.${parts[1]}.${parts[2]}.***`;
      }
    }
    
    // Remove additional info that might contain sensitive data
    if (sanitized.additionalInfo) {
      const { password: _password, token: _token, secret: _secret, ...safeInfo } = sanitized.additionalInfo;
      sanitized.additionalInfo = safeInfo;
    }
    
    return sanitized;
  }
}

/**
 * Factory function to create standardized logger instances
 */
export function createAuthLogger(
  logger: Logger,
  category: AuthLogCategory,
): StandardizedLogger {
  return new StandardizedLogger(logger, category);
}

/**
 * Logging level recommendations for different scenarios
 */
export const LoggingRecommendations = {
  // Security events should always be logged
  SECURITY_EVENTS: {
    failed_logins: AuthLogLevel.WARN,
    successful_logins: AuthLogLevel.INFO,
    password_changes: AuthLogLevel.INFO,
    two_factor_events: AuthLogLevel.INFO,
    session_invalidations: AuthLogLevel.INFO,
    suspicious_activity: AuthLogLevel.WARN,
    security_breaches: AuthLogLevel.ERROR,
  },

  // Performance logging should be debug level
  PERFORMANCE: {
    api_response_times: AuthLogLevel.DEBUG,
    database_queries: AuthLogLevel.DEBUG,
    cache_operations: AuthLogLevel.DEBUG,
  },

  // Business logic logging
  BUSINESS_LOGIC: {
    user_registrations: AuthLogLevel.INFO,
    oauth_flows: AuthLogLevel.INFO,
    session_creation: AuthLogLevel.DEBUG,
    token_refresh: AuthLogLevel.DEBUG,
  },

  // Error handling
  ERRORS: {
    validation_errors: AuthLogLevel.WARN,
    system_errors: AuthLogLevel.ERROR,
    external_service_failures: AuthLogLevel.WARN,
    configuration_errors: AuthLogLevel.ERROR,
  },
} as const;