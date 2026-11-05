import { ConfigService } from '@nestjs/config';
import { GeoLookupService } from './geo-lookup.service';

const LOOKUP_URL =
  'https://ipwho.is/8.8.8.8?fields=success,city,region,country,country_code,connection.isp,timezone.id';

function makeConfig(geoipUrl?: string): ConfigService {
  return { get: jest.fn(() => geoipUrl) } as unknown as ConfigService;
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('GeoLookupService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('resolves and maps an ipwho.is response', async () => {
    const fetchMock = jest.fn<
      Promise<Response>,
      [RequestInfo | URL, RequestInit?]
    >();
    fetchMock.mockResolvedValue(
      jsonResponse({
        success: true,
        city: 'San Jose',
        region: 'California',
        country: 'United States',
        country_code: 'US',
        connection: { isp: 'Google LLC' },
        timezone: { id: 'America/Los_Angeles' },
      }),
    );
    global.fetch = fetchMock;

    const service = new GeoLookupService(makeConfig());
    const location = await service.lookup('8.8.8.8');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [input] = fetchMock.mock.calls[0];
    expect(input).toBe(LOOKUP_URL);
    expect(location).toEqual({
      city: 'San Jose',
      region: 'California',
      country: 'United States',
      countryCode: 'US',
      isp: 'Google LLC',
      timezone: 'America/Los_Angeles',
    });
  });

  it('skips private, loopback and unknown addresses without calling the provider', async () => {
    const fetchMock = jest.fn<
      Promise<Response>,
      [RequestInfo | URL, RequestInit?]
    >();
    global.fetch = fetchMock;

    const service = new GeoLookupService(makeConfig());

    for (const ip of [
      '10.0.0.1',
      '172.16.0.1',
      '192.168.1.5',
      '127.0.0.1',
      '169.254.1.1',
      '100.64.0.1',
      '::1',
      'fe80::1',
      'fd00::1',
      '::ffff:192.168.1.5',
      'unknown',
      '',
    ]) {
      await expect(service.lookup(ip)).resolves.toBeNull();
    }

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('caches a lookup per IP for 24h', async () => {
    const fetchMock = jest.fn<
      Promise<Response>,
      [RequestInfo | URL, RequestInit?]
    >();
    fetchMock.mockResolvedValue(
      jsonResponse({ success: true, city: 'San Jose' }),
    );
    global.fetch = fetchMock;

    const service = new GeoLookupService(makeConfig());
    await service.lookup('8.8.8.8');
    await service.lookup('8.8.8.8');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns null instead of throwing when the provider fails', async () => {
    const fetchMock = jest.fn<
      Promise<Response>,
      [RequestInfo | URL, RequestInit?]
    >();
    fetchMock.mockRejectedValue(new Error('network down'));
    global.fetch = fetchMock;

    const service = new GeoLookupService(makeConfig());
    await expect(service.lookup('8.8.8.8')).resolves.toBeNull();
  });

  it('returns null when the provider reports success=false', async () => {
    const fetchMock = jest.fn<
      Promise<Response>,
      [RequestInfo | URL, RequestInit?]
    >();
    fetchMock.mockResolvedValue(jsonResponse({ success: false }));
    global.fetch = fetchMock;

    const service = new GeoLookupService(makeConfig());
    await expect(service.lookup('8.8.8.8')).resolves.toBeNull();
  });

  it('disables lookups when GEOIP_URL is blank', async () => {
    const fetchMock = jest.fn<
      Promise<Response>,
      [RequestInfo | URL, RequestInit?]
    >();
    global.fetch = fetchMock;

    const service = new GeoLookupService(makeConfig(''));
    await expect(service.lookup('8.8.8.8')).resolves.toBeNull();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('honours a GEOIP_URL override', async () => {
    const fetchMock = jest.fn<
      Promise<Response>,
      [RequestInfo | URL, RequestInit?]
    >();
    fetchMock.mockResolvedValue(
      jsonResponse({ success: true, city: 'Berlin' }),
    );
    global.fetch = fetchMock;

    const service = new GeoLookupService(
      makeConfig('https://geo.example.test/'),
    );
    await service.lookup('1.1.1.1');

    const [input] = fetchMock.mock.calls[0];
    expect(input).toBe(
      'https://geo.example.test/1.1.1.1?fields=success,city,region,country,country_code,connection.isp,timezone.id',
    );
  });
});
