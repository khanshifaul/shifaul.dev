import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class KeepAliveService {
  private readonly logger = new Logger(KeepAliveService.name);
  private readonly backendUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Fallback to the production backend URL if not defined
    this.backendUrl = this.configService.get<string>(
      'BACKEND_URL',
      'https://backend.shifaul.dev',
    );
  }

  // Ping every 14 minutes to prevent Render's 15-minute inactivity spin-down
  @Cron('0 */14 * * * *')
  async handleCron() {
    this.logger.log(`Self-pinging to prevent Render spin-down: ${this.backendUrl}/api/health`);
    
    try {
      await firstValueFrom(
        this.httpService.get(`${this.backendUrl}/api/health`).pipe(
          catchError((error) => {
            this.logger.error(`Self-ping failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      this.logger.log('Self-ping successful - instance kept alive.');
    } catch (_error) {
      // Error is caught and logged, preventing application crash
    }
  }
}
