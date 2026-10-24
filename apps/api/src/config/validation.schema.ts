// src/config/validation.schema.ts (Updated)
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('production'),

  PORT: Joi.number().default(4000),

  // Swagger Configuration
  SWAGGER_ENABLED: Joi.string().valid('true', 'false').default('true'),

  // Logging Configuration
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),

  // Database Configuration
  DATABASE_URL: Joi.string().required(),
  DATABASE_CLEANING_ENABLED: Joi.string().valid('true', 'false').default('false'),

  // URLs Configuration
  FRONTEND_URL: Joi.string().uri().default('http://localhost:4173'),
  BACKEND_URL: Joi.string().uri().default('http://localhost:4000'),
  CORS_ORIGIN: Joi.string().default('http://localhost:4173'),

  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().optional(),

  // GitHub OAuth Configuration
  GITHUB_CLIENT_ID: Joi.string().optional(),
  GITHUB_CLIENT_SECRET: Joi.string().optional(),
  GITHUB_CALLBACK_URL: Joi.string().uri().optional(),

  // Facebook OAuth Configuration
  FACEBOOK_APP_ID: Joi.string().optional(),
  FACEBOOK_APP_SECRET: Joi.string().optional(),
  FACEBOOK_CALLBACK_URL: Joi.string().uri().optional(),

  // JWT Configuration - Updated to match actual env variables
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET must be at least 32 characters long',
    'any.required': 'JWT_SECRET is required',
  }),
  JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string()
    .pattern(/^(?:\d+)(?:s|m|h|d)$/)
    .default('1d'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string()
    .pattern(/^(?:\d+)(?:s|m|h|d)$/)
    .default('7d'),
  JWT_REFRESH_TOKEN_REMEMBER_ME_EXPIRES_IN: Joi.string()
    .pattern(/^(?:\d+)(?:s|m|h|d)$/)
    .default('30d'),
  JWT_EMAIL_VERIFICATION_TOKEN_EXPIRES_IN: Joi.string()
    .pattern(/^(?:\d+)(?:s|m|h|d)$/)
    .default('1d'),
  JWT_PASSWORD_RESET_TOKEN_EXPIRES_IN: Joi.string()
    .pattern(/^(?:\d+)(?:s|m|h|d)$/)
    .default('1h'),

  // SMTP Configuration
  SMTP_HOST: Joi.string().default('smtp.gmail.com'),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().email().optional(),
  SMTP_PASS: Joi.string().optional(),

  // Rate limiting
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),

  // Cloudflare R2 Configuration
  R2_ACCESS_KEY_ID: Joi.string().optional(),
  R2_SECRET_ACCESS_KEY: Joi.string().optional(),
  R2_BUCKET_NAME: Joi.string().optional(),
  R2_ACCOUNT_ID: Joi.string().optional(),
  R2_PUBLIC_URL: Joi.string().uri().optional(),
});
