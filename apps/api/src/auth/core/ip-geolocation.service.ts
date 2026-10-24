import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GeolocationResult {
  latitude?: number;
  longitude?: number;
  timezone?: string;
  location?: string;
  countryCode?: string;
  countryName?: string;
  city?: string;
  region?: string;
}

@Injectable()
export class IpGeolocationService {
  private readonly logger = new Logger(IpGeolocationService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Detect geolocation from IP address
   */
  async detectGeolocation(ipAddress: string): Promise<GeolocationResult> {
    try {
      // Skip geolocation for private/local IPs
      if (this.isPrivateIP(ipAddress)) {
        return { location: 'Local Network' };
      }

      // Try multiple geolocation services for better accuracy
      const results = await Promise.allSettled([
        this.getGeolocationFromIPApi(ipAddress),
        this.getGeolocationFromIPGeolocation(ipAddress),
        this.getGeolocationFromIPWhois(ipAddress),
      ]);

      // Use the first successful result
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          const location = result.value;
          this.logger.debug(`Geolocation detected for IP ${ipAddress}: ${JSON.stringify(location)}`);
          return location;
        }
      }

      // Fallback: try to infer from IP ranges (basic implementation)
      return this.inferLocationFromIP(ipAddress);
    } catch (error) {
      this.logger.warn(
        `Failed to detect geolocation for IP ${ipAddress}: ${error.message}`,
      );
      return {};
    }
  }

  /**
   * Check if IP is private/local
   */
  private isPrivateIP(ip: string): boolean {
    if (!ip || ip === 'unknown' || ip === '::1' || ip === 'localhost') {
      return true;
    }

    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/,
      /^169\.254\./, // Link-local addresses
    ];

    return privateRanges.some((range) => range.test(ip));
  }

  /**
   * Get geolocation from IP-API.com (free tier available)
   */
  private async getGeolocationFromIPApi(ip: string): Promise<GeolocationResult | null> {
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,city,lat,lon,timezone,query`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        return {
          latitude: data.lat,
          longitude: data.lon,
          timezone: data.timezone,
          location: `${data.city}, ${data.region}, ${data.countryCode}`,
          countryCode: data.countryCode,
          countryName: data.country,
          city: data.city,
          region: data.region,
        };
      }
      
      return null;
    } catch (error) {
      this.logger.debug(`IP-API geolocation failed for ${ip}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get geolocation from IPGeolocation API (requires API key)
   */
  private async getGeolocationFromIPGeolocation(ip: string): Promise<GeolocationResult | null> {
    const apiKey = this.configService.get<string>('IP_GEOLOCATION_API_KEY');
    if (!apiKey) {
      return null;
    }

    try {
      const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        timezone: data.time_zone?.name,
        location: `${data.city}, ${data.state_prov}, ${data.country_code2}`,
        countryCode: data.country_code2,
        countryName: data.country_name,
        city: data.city,
        region: data.state_prov,
      };
    } catch (error) {
      this.logger.debug(`IPGeolocation API failed for ${ip}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get geolocation from IPWhois API
   */
  private async getGeolocationFromIPWhois(ip: string): Promise<GeolocationResult | null> {
    try {
      const response = await fetch(`http://ipwhois.app/json/${ip}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          timezone: data.timezone?.id,
          location: `${data.city}, ${data.region}, ${data.country_code}`,
          countryCode: data.country_code,
          countryName: data.country,
          city: data.city,
          region: data.region,
        };
      }
      
      return null;
    } catch (error) {
      this.logger.debug(`IPWhois geolocation failed for ${ip}: ${error.message}`);
      return null;
    }
  }

  /**
   * Infer location from IP ranges (basic fallback)
   */
  private inferLocationFromIP(ip: string): GeolocationResult {
    // Basic IP range mappings (very approximate)
    const ipRangeMappings: Array<{
      range: string;
      timezone: string;
      location: string;
      countryCode: string;
    }> = [
      {
        range: '1.0.0.0',
        timezone: 'Australia/Sydney',
        location: 'Australia',
        countryCode: 'AU',
      },
      {
        range: '14.0.0.0',
        timezone: 'Asia/Bangkok',
        location: 'Thailand',
        countryCode: 'TH',
      },
      {
        range: '23.0.0.0',
        timezone: 'America/New_York',
        location: 'United States (East)',
        countryCode: 'US',
      },
      {
        range: '31.0.0.0',
        timezone: 'Europe/Moscow',
        location: 'Russia',
        countryCode: 'RU',
      },
      {
        range: '36.0.0.0',
        timezone: 'Asia/Shanghai',
        location: 'China',
        countryCode: 'CN',
      },
      {
        range: '49.0.0.0',
        timezone: 'Europe/Berlin',
        location: 'Germany',
        countryCode: 'DE',
      },
      {
        range: '58.0.0.0',
        timezone: 'Asia/Yangon',
        location: 'Myanmar',
        countryCode: 'MM',
      },
      {
        range: '61.0.0.0',
        timezone: 'Australia/Sydney',
        location: 'Australia',
        countryCode: 'AU',
      },
      {
        range: '91.0.0.0',
        timezone: 'Asia/Kolkata',
        location: 'India',
        countryCode: 'IN',
      },
      {
        range: '103.0.0.0',
        timezone: 'Asia/Singapore',
        location: 'Singapore',
        countryCode: 'SG',
      },
      {
        range: '110.0.0.0',
        timezone: 'Asia/Jakarta',
        location: 'Indonesia',
        countryCode: 'ID',
      },
      {
        range: '113.0.0.0',
        timezone: 'Asia/Shanghai',
        location: 'China',
        countryCode: 'CN',
      },
      {
        range: '114.0.0.0',
        timezone: 'Asia/Shanghai',
        location: 'China',
        countryCode: 'CN',
      },
      {
        range: '115.0.0.0',
        timezone: 'Asia/Shanghai',
        location: 'China',
        countryCode: 'CN',
      },
      {
        range: '116.0.0.0',
        timezone: 'Asia/Shanghai',
        location: 'China',
        countryCode: 'CN',
      },
      {
        range: '117.0.0.0',
        timezone: 'Asia/Shanghai',
        location: 'China',
        countryCode: 'CN',
      },
      {
        range: '118.0.0.0',
        timezone: 'Asia/Shanghai',
        location: 'China',
        countryCode: 'CN',
      },
      {
        range: '119.0.0.0',
        timezone: 'Asia/Shanghai',
        location: 'China',
        countryCode: 'CN',
      },
      {
        range: '120.0.0.0',
        timezone: 'Asia/Shanghai',
        location: 'China',
        countryCode: 'CN',
      },
      {
        range: '121.0.0.0',
        timezone: 'Asia/Shanghai',
        location: 'China',
        countryCode: 'CN',
      },
      {
        range: '122.0.0.0',
        timezone: 'Asia/Shanghai',
        location: 'China',
        countryCode: 'CN',
      },
      {
        range: '123.0.0.0',
        timezone: 'Asia/Shanghai',
        location: 'China',
        countryCode: 'CN',
      },
      {
        range: '124.0.0.0',
        timezone: 'Asia/Seoul',
        location: 'South Korea',
        countryCode: 'KR',
      },
      {
        range: '125.0.0.0',
        timezone: 'Asia/Shanghai',
        location: 'China',
        countryCode: 'CN',
      },
      {
        range: '126.0.0.0',
        timezone: 'Asia/Tokyo',
        location: 'Japan',
        countryCode: 'JP',
      },
      {
        range: '133.0.0.0',
        timezone: 'Asia/Tokyo',
        location: 'Japan',
        countryCode: 'JP',
      },
      {
        range: '134.0.0.0',
        timezone: 'America/New_York',
        location: 'United States',
        countryCode: 'US',
      },
      {
        range: '136.0.0.0',
        timezone: 'America/Chicago',
        location: 'United States (Central)',
        countryCode: 'US',
      },
      {
        range: '138.0.0.0',
        timezone: 'America/New_York',
        location: 'United States (East)',
        countryCode: 'US',
      },
      {
        range: '139.0.0.0',
        timezone: 'Asia/Shanghai',
        location: 'China',
        countryCode: 'CN',
      },
      {
        range: '140.0.0.0',
        timezone: 'America/New_York',
        location: 'United States (East)',
        countryCode: 'US',
      },
      {
        range: '142.0.0.0',
        timezone: 'Asia/Tokyo',
        location: 'Japan',
        countryCode: 'JP',
      },
      {
        range: '144.0.0.0',
        timezone: 'America/New_York',
        location: 'United States (East)',
        countryCode: 'US',
      },
      {
        range: '150.0.0.0',
        timezone: 'Asia/Bangkok',
        location: 'Thailand',
        countryCode: 'TH',
      },
      {
        range: '151.0.0.0',
        timezone: 'Europe/Moscow',
        location: 'Russia',
        countryCode: 'RU',
      },
      {
        range: '152.0.0.0',
        timezone: 'America/Phoenix',
        location: 'United States (Mountain)',
        countryCode: 'US',
      },
      {
        range: '154.0.0.0',
        timezone: 'Europe/London',
        location: 'United Kingdom',
        countryCode: 'GB',
      },
      {
        range: '155.0.0.0',
        timezone: 'America/Chicago',
        location: 'United States (Central)',
        countryCode: 'US',
      },
      {
        range: '156.0.0.0',
        timezone: 'America/New_York',
        location: 'United States (East)',
        countryCode: 'US',
      },
      {
        range: '157.0.0.0',
        timezone: 'America/Los_Angeles',
        location: 'United States (West)',
        countryCode: 'US',
      },
      {
        range: '158.0.0.0',
        timezone: 'America/Los_Angeles',
        location: 'United States (West)',
        countryCode: 'US',
      },
      {
        range: '159.0.0.0',
        timezone: 'America/New_York',
        location: 'United States (East)',
        countryCode: 'US',
      },
      {
        range: '160.0.0.0',
        timezone: 'America/Los_Angeles',
        location: 'United States (West)',
        countryCode: 'US',
      },
      {
        range: '161.0.0.0',
        timezone: 'America/New_York',
        location: 'United States (East)',
        countryCode: 'US',
      },
      {
        range: '162.0.0.0',
        timezone: 'America/New_York',
        location: 'United States (East)',
        countryCode: 'US',
      },
      {
        range: '163.0.0.0',
        timezone: 'Asia/Seoul',
        location: 'South Korea',
        countryCode: 'KR',
      },
      {
        range: '164.0.0.0',
        timezone: 'America/Los_Angeles',
        location: 'United States (West)',
        countryCode: 'US',
      },
      {
        range: '165.0.0.0',
        timezone: 'America/New_York',
        location: 'United States (East)',
        countryCode: 'US',
      },
      {
        range: '166.0.0.0',
        timezone: 'America/Los_Angeles',
        location: 'United States (West)',
        countryCode: 'US',
      },
      {
        range: '167.0.0.0',
        timezone: 'America/New_York',
        location: 'United States (East)',
        countryCode: 'US',
      },
      {
        range: '168.0.0.0',
        timezone: 'America/New_York',
        location: 'United States (East)',
        countryCode: 'US',
      },
      {
        range: '169.0.0.0',
        timezone: 'America/Los_Angeles',
        location: 'United States (West)',
        countryCode: 'US',
      },
      {
        range: '170.0.0.0',
        timezone: 'America/Los_Angeles',
        location: 'United States (West)',
        countryCode: 'US',
      },
      {
        range: '171.0.0.0',
        timezone: 'Asia/Bangkok',
        location: 'Thailand',
        countryCode: 'TH',
      },
      {
        range: '172.0.0.0',
        timezone: 'Asia/Seoul',
        location: 'South Korea',
        countryCode: 'KR',
      },
      {
        range: '173.0.0.0',
        timezone: 'America/Los_Angeles',
        location: 'United States (West)',
        countryCode: 'US',
      },
      {
        range: '174.0.0.0',
        timezone: 'America/New_York',
        location: 'United States (East)',
        countryCode: 'US',
      },
      {
        range: '175.0.0.0',
        timezone: 'Asia/Bangkok',
        location: 'Thailand',
        countryCode: 'TH',
      },
      {
        range: '176.0.0.0',
        timezone: 'America/New_York',
        location: 'United States (East)',
        countryCode: 'US',
      },
      {
        range: '177.0.0.0',
        timezone: 'America/Los_Angeles',
        location: 'United States (West)',
        countryCode: 'US',
      },
      {
        range: '178.0.0.0',
        timezone: 'Europe/Moscow',
        location: 'Russia',
        countryCode: 'RU',
      },
      {
        range: '179.0.0.0',
        timezone: 'America/Sao_Paulo',
        location: 'Brazil',
        countryCode: 'BR',
      },
      {
        range: '180.0.0.0',
        timezone: 'America/Lima',
        location: 'Peru',
        countryCode: 'PE',
      },
      {
        range: '181.0.0.0',
        timezone: 'America/Mexico_City',
        location: 'Mexico',
        countryCode: 'MX',
      },
      {
        range: '182.0.0.0',
        timezone: 'Europe/Moscow',
        location: 'Russia',
        countryCode: 'RU',
      },
      {
        range: '183.0.0.0',
        timezone: 'Asia/Shanghai',
        location: 'China',
        countryCode: 'CN',
      },
      {
        range: '184.0.0.0',
        timezone: 'America/Los_Angeles',
        location: 'United States (West)',
        countryCode: 'US',
      },
      {
        range: '185.0.0.0',
        timezone: 'Europe/London',
        location: 'United Kingdom',
        countryCode: 'GB',
      },
      {
        range: '186.0.0.0',
        timezone: 'America/Sao_Paulo',
        location: 'Brazil',
        countryCode: 'BR',
      },
      {
        range: '187.0.0.0',
        timezone: 'America/Sao_Paulo',
        location: 'Brazil',
        countryCode: 'BR',
      },
      {
        range: '188.0.0.0',
        timezone: 'Europe/Berlin',
        location: 'Germany',
        countryCode: 'DE',
      },
      {
        range: '189.0.0.0',
        timezone: 'America/Sao_Paulo',
        location: 'Brazil',
        countryCode: 'BR',
      },
      {
        range: '190.0.0.0',
        timezone: 'America/Argentina/Buenos_Aires',
        location: 'Argentina',
        countryCode: 'AR',
      },
      {
        range: '191.0.0.0',
        timezone: 'America/Sao_Paulo',
        location: 'Brazil',
        countryCode: 'BR',
      },
      {
        range: '192.0.0.0',
        timezone: 'America/New_York',
        location: 'United States (East)',
        countryCode: 'US',
      },
    ];

    try {
      const ipNum = this.ipToNumber(ip);
      for (const mapping of ipRangeMappings) {
        const rangeNum = this.ipToNumber(mapping.range);
        if (ipNum >= rangeNum && ipNum < rangeNum + 16777216) { // /8 range
          return {
            timezone: mapping.timezone,
            location: mapping.location,
            countryCode: mapping.countryCode,
          };
        }
      }

      // Fallback to UTC if no match found
      return {
        timezone: 'UTC',
        location: 'Unknown',
      };
    } catch (error) {
      this.logger.warn(`Failed to infer location from IP ${ip}: ${error.message}`);
      return {
        timezone: 'UTC',
        location: 'Unknown',
      };
    }
  }

  /**
   * Convert IP string to number for comparison
   */
  private ipToNumber(ip: string): number {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(part => isNaN(part) || part < 0 || part > 255)) {
      throw new Error(`Invalid IP address: ${ip}`);
    }
    return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
  }
}