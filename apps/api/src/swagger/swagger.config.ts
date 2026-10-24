// src/swagger/swagger.config.ts
import { DocumentBuilder } from '@nestjs/swagger';

export const SWAGGER_CONFIG = {
  title: 'Shifaul.dev API',
  description:
    'A robust backend API with authentication, command execution, and real-time updates',
  version: '1.0.0',
  tags: [
    {
      name: 'Application',
      description: 'General application endpoints',
    },
    {
      name: 'Authentication',
      description: 'User authentication and authorization',
    },
    {
      name: 'OAuth Authentication',
      description: 'OAuth-based authentication methods',
    },
    {
      name: 'Two-Factor Authentication',
      description: 'Two-factor authentication operations',
    },
    {
      name: 'Session Management',
      description: 'Session handling and management',
    },
    { name: 'Users', description: 'User management' },
    {
      name: 'Support Tickets',
      description: 'Support ticket management',
    },
    {
      name: 'Admin User Management',
      description: 'Admin user management',
    },

  ],
  // Force tag order with OpenAPI extensions
  'x-tagGroups': [
    {
      name: 'Core Application',
      tags: ['Application'],
    },
    {
      name: 'Authentication',
      tags: [
        'Authentication',
        'OAuth Authentication',
        'Two-Factor Authentication',
        'Session Management',
      ],
    },
    {
      name: 'User Management',
      tags: ['Users'],
    },
    {
      name: 'Support',
      tags: ['Support Tickets'],
    },
    {
      name: 'Admin Management',
      tags: [
        'Admin User Management',
        'Admin Support Tickets',
        'Admin Analytics',
      ],
    },

  ],
};

export function createSwaggerConfig(baseUrl: string) {
  const config = new DocumentBuilder()
    .setTitle(SWAGGER_CONFIG.title)
    .setDescription(SWAGGER_CONFIG.description)
    .setVersion(SWAGGER_CONFIG.version)

    // ✅ Main JWT Auth (for access tokens)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your **access token**',
      },
      'access-token',
    )

    // ✅ Refresh Token Scheme (critical for /refresh)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your **refresh token**',
      },
      'refresh-token',
    )

    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Enter your **permission token** (obtained from /api/auth/google-gtm/permission-token)',
      },
      'permission-token',
    )

    // Add tag groups to force order in Swagger UI
    .addServer(baseUrl)
    // .addServer('http://192.168.0.180:4000')
    // .addServer('http://backend.shifaul.dev')
    .setExternalDoc('API Documentation', `${baseUrl}/api/docs`);

  return config;
}
