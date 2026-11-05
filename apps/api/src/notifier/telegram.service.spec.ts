import { ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { formatVisitorLocalTime } from './visitor-location';

function makeService(): TelegramService {
  const config = {
    get: jest.fn((key: string) => {
      if (key === 'TELEGRAM_BOT_TOKEN') return '123:test-token';
      if (key === 'TELEGRAM_CHAT_ID') return '424242';
      return undefined;
    }),
  } as unknown as ConfigService;

  return new TelegramService(config);
}

describe('TelegramService.sendVisitorVisit', () => {
  it('renders IP, location, ISP and local time when the lookup resolved', async () => {
    const service = makeService();
    const send = jest.spyOn(service, 'sendText').mockResolvedValue(true);

    await service.sendVisitorVisit({
      path: '/',
      referrer: 'https://www.facebook.com/',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/139.0.0.0',
      ip: '8.8.8.8',
      location: {
        city: 'San Jose',
        region: 'California',
        country: 'United States',
        countryCode: 'US',
        isp: 'Google LLC',
        timezone: 'America/Los_Angeles',
      },
    });

    expect(send).toHaveBeenCalledTimes(1);
    const message = send.mock.calls[0][0];

    expect(message).toContain('<b>IP:</b> <code>8.8.8.8</code>');
    expect(message).toContain('<b>Location:</b> San Jose, California, US');
    expect(message).toContain('<b>ISP:</b> Google LLC');
    expect(message).toMatch(
      /<b>Local time:<\/b> \d{4}-\d{2}-\d{2} \d{2}:\d{2} \(America\/Los_Angeles\)/,
    );
  });

  it('escapes IP and location values that reach the message', async () => {
    const service = makeService();
    const send = jest.spyOn(service, 'sendText').mockResolvedValue(true);

    await service.sendVisitorVisit({
      path: '/',
      ip: '1.2.3.4<b>',
      location: {
        city: 'A&B',
        region: 'C<D',
        countryCode: 'X>Y',
        isp: '<script>',
      },
    });

    const message = send.mock.calls[0][0];
    expect(message).toContain('<b>IP:</b> <code>1.2.3.4&lt;b&gt;</code>');
    expect(message).toContain('<b>Location:</b> A&amp;B, C&lt;D, X&gt;Y');
    expect(message).toContain('<b>ISP:</b> &lt;script&gt;');
  });

  it('omits Location, ISP and Local time when the lookup did not resolve', async () => {
    const service = makeService();
    const send = jest.spyOn(service, 'sendText').mockResolvedValue(true);

    await service.sendVisitorVisit({
      path: '/',
      userAgent: 'Mozilla/5.0',
      ip: '8.8.8.8',
      location: null,
    });

    const message = send.mock.calls[0][0];
    expect(message).toContain('<b>IP:</b> <code>8.8.8.8</code>');
    expect(message).not.toContain('Location:');
    expect(message).not.toContain('ISP:');
    expect(message).not.toContain('Local time:');
  });

  it('omits Location, ISP and Local time when the location object is empty', async () => {
    const service = makeService();
    const send = jest.spyOn(service, 'sendText').mockResolvedValue(true);

    await service.sendVisitorVisit({
      path: '/',
      ip: '8.8.8.8',
      location: {},
    });

    const message = send.mock.calls[0][0];
    expect(message).not.toContain('Location:');
    expect(message).not.toContain('ISP:');
    expect(message).not.toContain('Local time:');
  });
});

describe('formatVisitorLocalTime', () => {
  it('formats the visitor clock in the resolved timezone', () => {
    expect(
      formatVisitorLocalTime(
        'America/Los_Angeles',
        new Date('2026-11-05T06:15:00.000Z'),
      ),
    ).toBe('2026-11-04 22:15 (America/Los_Angeles)');
  });

  it('returns null for a missing or unknown timezone', () => {
    expect(formatVisitorLocalTime(null)).toBeNull();
    expect(formatVisitorLocalTime('Not/AZone')).toBeNull();
  });
});
