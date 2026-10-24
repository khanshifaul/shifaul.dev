import { Controller, Post, Body, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TelegramService } from '../notifier/telegram.service';
import type { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';

/**
 * Short-lived dedupe cache for visitor notifications.
 * Keyed by sha256(ip + UA). TTL: 24h (per process — restart resets).
 * In a multi-instance prod setup, replace with Redis.
 */
const recentVisitors = new Map<string, number>();
const DEDUPE_TTL_MS = 24 * 60 * 60 * 1000;

function makeFingerprint(ip: string, ua: string): string {
  // Quick hash; crypto would be overkill for in-process dedupe
  let hash = 0;
  const input = `${ip}|${ua}`;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly telegram: TelegramService,
  ) {}

  @Public()
  @Post('collect')
  async collectEvent(
    @Body() data: {
      event: string;
      url: string;
      referrer?: string;
      metadata?: any;
    },
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    const ip = data.metadata?.ip || req.headers['x-forwarded-for'] || req.ip;

    return this.analyticsService.trackEvent({
      ...data,
      userAgent,
      metadata: {
        ...data.metadata,
        ip,
      },
    });
  }

  /**
   * Hit on every page load. Records the analytics event AND fires a
   * Telegram notification when this looks like a fresh visitor (not seen
   * from this IP+UA in the last 24h on this process).
   */
  @Public()
  @Post('visit')
  async visit(
    @Body()
    body: {
      path: string;
      referrer?: string;
      isReturning?: boolean;
      country?: string;
      city?: string;
    },
    @Req() req: Request,
  ) {
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      'unknown';
    const fp = makeFingerprint(ip, userAgent);

    // Always record the event (for analytics dashboards)
    const event = await this.analyticsService.trackEvent({
      event: 'page_view',
      url: body.path,
      referrer: body.referrer,
      userAgent,
      metadata: { ip, country: body.country, city: body.city, fingerprint: fp },
    });

    // Dedupe Telegram notifications
    const lastSeen = recentVisitors.get(fp);
    const now = Date.now();
    const isNew = !lastSeen || now - lastSeen > DEDUPE_TTL_MS;

    if (isNew) {
      recentVisitors.set(fp, now);
      // Evict old entries periodically
      if (recentVisitors.size > 1000) {
        for (const [k, t] of recentVisitors) {
          if (now - t > DEDUPE_TTL_MS) recentVisitors.delete(k);
        }
      }
      // Fire-and-forget
      this.telegram
        .sendVisitorVisit({
          path: body.path,
          referrer: body.referrer ?? null,
          userAgent,
          country: body.country ?? null,
          city: body.city ?? null,
          isReturning: body.isReturning ?? false,
        })
        .catch(() => {
          // Already logged inside the service
        });
    }

    return { recorded: true, eventId: event ? (event as any).id : null, isNew };
  }
}
