// src/admin/admin.module.ts
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../users/users.module';
import { LoggerService } from '../utils/logger/logger.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { AdminSupportTicketController } from './controllers/admin-support-ticket.controller';
import { AdminUserGrowthController } from './controllers/admin-user-growth.controller';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminContactMessageController } from './controllers/admin-contact-message.controller';
import { AdminNewsletterSubscriberController } from './controllers/admin-newsletter-subscriber.controller';
import { AdminAuditLogService } from './services/admin-audit-log.service';

import { AdminSupportTicketService } from './services/admin-support-ticket.service';
import { AdminUserGrowthService } from './services/admin-user-growth.service';
import { AdminUserService } from './services/admin-user.service';
import { AdminContactMessageService } from './services/admin-contact-message.service';
import { AdminNewsletterSubscriberService } from './services/admin-newsletter-subscriber.service';


@Module({
  imports: [
    ConfigModule,
    HttpModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AdminController,
    AdminSupportTicketController,
    AdminUserController,
    AdminUserGrowthController,
    AdminContactMessageController,
    AdminNewsletterSubscriberController,
  ],
  providers: [
    AdminService,
    AdminAuditLogService,
    AdminSupportTicketService,
    AdminUserService,
    AdminUserGrowthService,
    AdminContactMessageService,
    AdminNewsletterSubscriberService,
    LoggerService,
  ],
  exports: [AdminService],
})
export class AdminModule {}
