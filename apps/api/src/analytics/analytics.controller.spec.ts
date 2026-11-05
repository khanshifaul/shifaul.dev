import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { GeoLookupService } from './geo-lookup.service';
import { TelegramService } from '../notifier/telegram.service';
import type { VisitorLocation } from '../notifier/visitor-location';
import type { Request } from 'express';
import { setImmediate as flush } from 'node:timers/promises';

function request(headers: Record<string, string>): Request {
  return { headers } as unknown as Request;
}

function makeController(lookup: jest.Mock, sendVisitorVisit: jest.Mock) {
  return new AnalyticsController(
    {
      trackEvent: jest.fn().mockResolvedValue({ id: 'evt-1' }),
    } as unknown as AnalyticsService,
    { sendVisitorVisit } as unknown as TelegramService,
    { lookup } as unknown as GeoLookupService,
  );
}

describe('AnalyticsController.visit', () => {
  it('notifies with the header IP and the resolved location without waiting for the lookup', async () => {
    let resolveLookup: ((value: VisitorLocation | null) => void) | undefined;
    const lookup = jest.fn(
      () =>
        new Promise<VisitorLocation | null>((resolve) => {
          resolveLookup = resolve;
        }),
    );
    const sendVisitorVisit = jest.fn().mockResolvedValue(true);
    const controller = makeController(lookup, sendVisitorVisit);

    const result = await controller.visit(
      { path: '/', country: 'XX', city: 'Fakeville' },
      request({
        'x-forwarded-for': '8.8.8.8, 10.0.0.1',
        'user-agent': 'unit-ua',
      }),
    );

    expect(result).toMatchObject({ recorded: true, isNew: true });
    expect(lookup).toHaveBeenCalledWith('8.8.8.8');
    // The lookup is still pending: the response did not wait on it.
    expect(sendVisitorVisit).not.toHaveBeenCalled();

    const location: VisitorLocation = {
      city: 'San Jose',
      region: 'California',
      countryCode: 'US',
      isp: 'Google LLC',
      timezone: 'America/Los_Angeles',
    };
    resolveLookup?.(location);
    await flush();

    expect(sendVisitorVisit).toHaveBeenCalledWith({
      path: '/',
      referrer: null,
      userAgent: 'unit-ua',
      ip: '8.8.8.8',
      isReturning: false,
      location,
    });
  });

  it('falls back to req.ip when no x-forwarded-for hop is present', async () => {
    const lookup = jest.fn().mockResolvedValue(null);
    const sendVisitorVisit = jest.fn().mockResolvedValue(true);
    const controller = makeController(lookup, sendVisitorVisit);

    await controller.visit({ path: '/fallback' }, {
      headers: { 'user-agent': 'fallback-ua' },
      ip: '203.0.113.9',
    } as unknown as Request);
    await flush();

    expect(lookup).toHaveBeenCalledWith('203.0.113.9');
    expect(sendVisitorVisit).toHaveBeenCalledWith(
      expect.objectContaining({ ip: '203.0.113.9', location: null }),
    );
  });

  it('still dedupes repeated visits from the same IP and user agent', async () => {
    const lookup = jest.fn().mockResolvedValue(null);
    const sendVisitorVisit = jest.fn().mockResolvedValue(true);
    const controller = makeController(lookup, sendVisitorVisit);
    const req = request({
      'x-forwarded-for': '198.51.100.7',
      'user-agent': 'dedupe-ua',
    });

    const first = await controller.visit({ path: '/' }, req);
    const second = await controller.visit({ path: '/about' }, req);
    await flush();

    expect(first.isNew).toBe(true);
    expect(second.isNew).toBe(false);
    expect(sendVisitorVisit).toHaveBeenCalledTimes(1);
  });
});
