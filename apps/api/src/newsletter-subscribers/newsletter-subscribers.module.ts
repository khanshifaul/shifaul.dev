import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { NewsletterSubscribersController } from './newsletter-subscribers.controller';
import { NewsletterSubscribersService } from './newsletter-subscribers.service';
import { LoggerService } from '../utils/logger/logger.service';

@Module({
  imports: [DatabaseModule],
  controllers: [NewsletterSubscribersController],
  providers: [NewsletterSubscribersService, LoggerService],
  exports: [NewsletterSubscribersService],
})
export class NewsletterSubscribersModule {}