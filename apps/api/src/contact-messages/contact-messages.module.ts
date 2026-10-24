import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ContactMessagesController } from './contact-messages.controller';
import { ContactMessagesService } from './contact-messages.service';
import { LoggerService } from '../utils/logger/logger.service';
import { TelegramService } from '../notifier/telegram.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ContactMessagesController],
  providers: [ContactMessagesService, LoggerService, TelegramService],
  exports: [ContactMessagesService],
})
export class ContactMessagesModule {}