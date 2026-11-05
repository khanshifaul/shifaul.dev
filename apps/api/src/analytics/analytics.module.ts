import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { GeoLookupService } from './geo-lookup.service';
import { DatabaseModule } from '../database/database.module';
import { TelegramService } from '../notifier/telegram.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, TelegramService, GeoLookupService],
})
export class AnalyticsModule {}
