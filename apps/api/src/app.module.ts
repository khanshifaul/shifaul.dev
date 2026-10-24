import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import {
  ThrottlerGuard,
  ThrottlerModule,
  getOptionsToken,
  getStorageToken,
} from '@nestjs/throttler';
import { join } from 'path';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AccessTokenGuard } from './common/guards/access-token.guard';
import { ImpersonationGuard } from './common/guards/impersonation.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';
import { UrlConfigService } from './config/url.config';
import { validationSchema } from './config/validation.schema';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';
import { NotifierModule } from './notifier/notifier.module';
import { SupportTicketsModule } from './support-tickets/support-tickets.module';
import { UsersModule } from './users/users.module';
import { BlogPostsModule } from './blog-posts/blog-posts.module';
import { ProjectsModule } from './projects/projects.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { NewsletterSubscribersModule } from './newsletter-subscribers/newsletter-subscribers.module';
import { StorageModule } from './storage/storage.module';
import { LoggerService } from './utils/logger/logger.service';
import { KeepAliveModule } from './keep-alive/keep-alive.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => require('./config/app.config').appConfig()],
      validationSchema,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    {
      module: class { },
      providers: [UrlConfigService],
      exports: [UrlConfigService],
      global: true,
    },
    // FIX: Corrected ThrottlerModule configuration - must use 'throttlers' array
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL', 60000),
            limit: config.get<number>('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Static file serving for uploads folder
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/files',
      serveStaticOptions: {
        index: false, // Don't serve index.html
        setHeaders: (res, _path) => {
          // Set cache headers for static files
          res.setHeader('Cache-Control', 'public, max-age=3600');
        },
      },
    }),

    HttpModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    MailModule,
    NotifierModule,
    AdminModule,
    SupportTicketsModule,
    BlogPostsModule,
    ProjectsModule,
    ContactMessagesModule,
    NewsletterSubscribersModule,
    StorageModule,
    KeepAliveModule,
    AnalyticsModule,
    AiAssistantModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoggerService,
    Reflector,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useFactory: (
        options: ConstructorParameters<typeof ThrottlerGuard>[0],
        storage: ConstructorParameters<typeof ThrottlerGuard>[1],
        reflector: Reflector,
      ) => new ThrottlerGuard(options, storage, reflector),
      inject: [getOptionsToken(), getStorageToken(), Reflector],
    },
    ImpersonationGuard,
    CsrfMiddleware,
  ],
})
export class AppModule { }
