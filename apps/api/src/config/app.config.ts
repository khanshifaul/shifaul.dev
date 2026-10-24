// src/config/app.config.ts

/**
 * Parse time string to seconds
 * Supports formats like: "15s", "30m", "1h", "7d", "30d"
 */
const parseTimeToSeconds = (timeStr: string): number => {
  const match = timeStr.match(/^(\d+)([smhd])$/i);
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}. Expected format: number + unit (s/m/h/d)`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default: throw new Error(`Unsupported time unit: ${unit}`);
  }
};

/**
 * Configuration factory function that validates environment variables
 * and returns the application configuration.
 *
 * @returns The application configuration object
 * @throws Error if required environment variables are missing or invalid
 */
export const appConfig = () => {
  // Validate required environment variables
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure these variables are set.',
    );
  }

  // Validate JWT secret length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  return {
    // Server configuration
    port: parseInt(process.env.PORT ?? '4000', 10),
    environment: process.env.NODE_ENV ?? 'production',
    swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',
    logLevel: process.env.LOG_LEVEL ?? 'info',

    // Database configuration
    database: {
      url: process.env.DATABASE_URL,
      cleaningEnabled: process.env.DATABASE_CLEANING_ENABLED === 'true',
    },

    // JWT configuration
    jwt: {
      secret: process.env.JWT_SECRET,
      accessTokenExpiresInSeconds: parseTimeToSeconds(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? '1d'),
      refreshTokenExpiresInSeconds: parseTimeToSeconds(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ?? '7d'),
      refreshTokenRememberMeExpiresInSeconds: parseTimeToSeconds(process.env.JWT_REFRESH_TOKEN_REMEMBER_ME_EXPIRES_IN ?? '30d'),
      emailVerificationTokenExpiresInSeconds: parseTimeToSeconds(process.env.JWT_EMAIL_VERIFICATION_TOKEN_EXPIRES_IN ?? '1d'),
      passwordResetTokenExpiresInSeconds: parseTimeToSeconds(process.env.JWT_PASSWORD_RESET_TOKEN_EXPIRES_IN ?? '1h'),
    },

    // OAuth configuration
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      callbackUrl: process.env.GITHUB_CALLBACK_URL ?? '',
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID ?? '',
      appSecret: process.env.FACEBOOK_APP_SECRET ?? '',
      callbackUrl: process.env.FACEBOOK_CALLBACK_URL ?? '',
    },

    // URLs configuration
    frontend: {
      url: process.env.FRONTEND_URL ?? 'http://localhost:4173',
    },
    backend: {
      url: process.env.BACKEND_URL ?? 'http://localhost:4000',
    },

    // CORS configuration
    cors: {
      origin: process.env.CORS_ORIGIN ?? process.env.FRONTEND_URL ?? 'http://localhost:4173',
      credentials: true,
    },

    // Rate limiting configuration
    throttle: {
      ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
      limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
    },

    // SMTP configuration
    smtp: {
      host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT ?? '587', 10),
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
    },

    // Cloudflare R2 configuration
    r2: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
      bucketName: process.env.R2_BUCKET_NAME ?? '',
      accountId: process.env.R2_ACCOUNT_ID ?? '',
      publicUrl: process.env.R2_PUBLIC_URL ?? '',
    },
  };
};
