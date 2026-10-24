import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AnalyticsService {
  constructor(private databaseService: DatabaseService) {}

  async trackEvent(data: {
    event: string;
    url: string;
    referrer?: string;
    userAgent?: string;
    metadata?: any;
  }) {
    return this.databaseService.visitorEvent.create({
      data,
    });
  }
}
