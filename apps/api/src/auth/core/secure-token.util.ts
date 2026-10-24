// Secure token utilities for hash operations
// This replaces the insecure use of bcrypt for token storage

import * as crypto from 'crypto';

export class SecureTokenUtil {
  /**
   * Hashes a refresh token using SHA-256 for secure storage
   * Note: SHA-256 is appropriate for token hashing as tokens are already cryptographically random
   * bcrypt is specifically designed for passwords and adds unnecessary computational overhead
   */
  static hashRefreshToken(refreshToken: string): string {
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new Error('Refresh token must be a non-empty string');
    }
    
    return crypto.createHash('sha256').update(refreshToken).digest('hex');
  }

  /**
   * Verifies a refresh token against its hash
   */
  static verifyRefreshToken(refreshToken: string, tokenHash: string): boolean {
    if (!refreshToken || !tokenHash) {
      return false;
    }
    
    const computedHash = this.hashRefreshToken(refreshToken);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, 'hex'),
      Buffer.from(tokenHash, 'hex')
    );
  }

  /**
   * Generates a cryptographically secure session ID
   */
  static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generates a cryptographically secure token family ID for token rotation
   */
  static generateTokenFamily(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generates a secure browser fingerprint hash
   */
  static generateBrowserFingerprint(userAgent: string, additionalHeaders?: Record<string, string>): string {
    const fingerprintData = {
      userAgent: userAgent || '',
      acceptLanguage: additionalHeaders?.['accept-language'] || '',
      acceptEncoding: additionalHeaders?.['accept-encoding'] || '',
      accept: additionalHeaders?.['accept'] || '',
      dnt: additionalHeaders?.['dnt'] || '',
      secChUa: additionalHeaders?.['sec-ch-ua'] || '',
      secChUaMobile: additionalHeaders?.['sec-ch-ua-mobile'] || '',
      secChUaPlatform: additionalHeaders?.['sec-ch-ua-platform'] || '',
    };

    const fingerprintString = JSON.stringify(
      fingerprintData,
      Object.keys(fingerprintData).sort(),
    );
    
    return crypto.createHash('sha256').update(fingerprintString).digest('hex');
  }

  /**
   * Validates token format and entropy
   */
  static validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // JWT tokens should have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Each part should be valid base64
    return parts.every(part => {
      try {
        // Check if it's valid base64url
        const base64Regex = /^[A-Za-z0-9_-]+$/;
        return base64Regex.test(part);
      } catch {
        return false;
      }
    });
  }
}