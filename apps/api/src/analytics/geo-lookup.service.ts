import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isIP } from 'net';
import type { VisitorLocation } from '../notifier/visitor-location';

const DEFAULT_GEOIP_URL = 'https://ipwho.is';
const LOOKUP_FIELDS =
  'success,city,region,country,country_code,connection.isp,timezone.id';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const LOOKUP_TIMEOUT_MS = 2_000;
const MAX_CACHE_ENTRIES = 1_000;

interface IpWhoIsResponse {
  success?: boolean;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  connection?: { isp?: string };
  timezone?: { id?: string };
}

interface CacheEntry {
  expires: number;
  value: VisitorLocation | null;
}

/**
 * Resolves a visitor's IP to a location server-side.
 *
 * Provider: ipwho.is (free, no key). `GEOIP_URL` overrides the base; a blank
 * value disables lookups entirely so the notifier still works offline.
 *
 * Never throws and never blocks on a slow network: each lookup is bounded to
 * 2s and every outcome, including failure, is cached per IP for 24h.
 */
@Injectable()
export class GeoLookupService {
  private readonly logger = new Logger(GeoLookupService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly baseUrl: string | null;

  constructor(private readonly config: ConfigService) {
    const configured = this.config.get<string>('GEOIP_URL');
    const base =
      configured === undefined ? DEFAULT_GEOIP_URL : configured.trim();
    this.baseUrl = base ? base.replace(/\/+$/, '') : null;

    if (!this.baseUrl) {
      this.logger.log('GEOIP_URL is blank — visitor geo lookups disabled');
    }
  }

  async lookup(ip: string | null | undefined): Promise<VisitorLocation | null> {
    const address = (ip ?? '').split(',')[0]?.trim() ?? '';
    if (!this.baseUrl || !isLookupableIp(address)) return null;

    const now = Date.now();
    const cached = this.cache.get(address);
    if (cached && cached.expires > now) return cached.value;

    const value = await this.fetchLocation(address);
    this.remember(address, value, now);
    return value;
  }

  private async fetchLocation(ip: string): Promise<VisitorLocation | null> {
    const url = `${this.baseUrl}/${encodeURIComponent(ip)}?fields=${LOOKUP_FIELDS}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        this.logger.warn(
          `Geo lookup for ${ip} returned HTTP ${response.status}`,
        );
        return null;
      }

      const data = (await response.json()) as IpWhoIsResponse | null;
      if (!data?.success) return null;

      return {
        city: data.city ?? null,
        region: data.region ?? null,
        country: data.country ?? null,
        countryCode: data.country_code ?? null,
        isp: data.connection?.isp ?? null,
        timezone: data.timezone?.id ?? null,
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Geo lookup for ${ip} failed: ${reason}`);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  private remember(
    ip: string,
    value: VisitorLocation | null,
    now: number,
  ): void {
    if (this.cache.size >= MAX_CACHE_ENTRIES) {
      const oldest = this.cache.keys().next();
      if (!oldest.done) this.cache.delete(oldest.value);
    }
    this.cache.set(ip, { expires: now + CACHE_TTL_MS, value });
  }
}

/** Private, loopback, link-local, multicast and `unknown` addresses are not looked up. */
function isLookupableIp(ip: string): boolean {
  const version = isIP(ip);

  if (version === 4) {
    const [a, b] = ip.split('.').map(Number);
    if (a === 0 || a === 10 || a === 127) return false;
    if (a === 100 && b >= 64 && b <= 127) return false; // CGNAT
    if (a === 169 && b === 254) return false; // link-local
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a >= 224) return false; // multicast and reserved
    return true;
  }

  if (version === 6) {
    const address = ip.toLowerCase();
    if (address === '::' || address === '::1') return false;
    if (address.startsWith('fe8') || address.startsWith('fe9')) return false; // fe80::/10
    if (address.startsWith('fea') || address.startsWith('feb')) return false;
    if (address.startsWith('fc') || address.startsWith('fd')) return false; // ULA
    if (address.startsWith('ff')) return false; // multicast

    const mapped = address.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
    if (mapped) return isLookupableIp(mapped[1]);
    return true;
  }

  return false;
}
