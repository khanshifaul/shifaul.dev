// Centralized provider enum mapping utility
// This resolves the inconsistency between different provider mapping approaches

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  GITHUB = 'GITHUB',
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
  MICROSOFT = 'MICROSOFT',
  APPLE = 'APPLE',
}

export const PROVIDER_MAPPING: Record<string, AuthProvider> = {
  local: AuthProvider.LOCAL,
  google: AuthProvider.GOOGLE,
  facebook: AuthProvider.FACEBOOK,
  github: AuthProvider.GITHUB,
  twitter: AuthProvider.TWITTER,
  linkedin: AuthProvider.LINKEDIN,
  microsoft: AuthProvider.MICROSOFT,
  apple: AuthProvider.APPLE,
};

export const REVERSE_PROVIDER_MAPPING: Record<AuthProvider, string> = {
  [AuthProvider.LOCAL]: 'local',
  [AuthProvider.GOOGLE]: 'google',
  [AuthProvider.FACEBOOK]: 'facebook',
  [AuthProvider.GITHUB]: 'github',
  [AuthProvider.TWITTER]: 'twitter',
  [AuthProvider.LINKEDIN]: 'linkedin',
  [AuthProvider.MICROSOFT]: 'microsoft',
  [AuthProvider.APPLE]: 'apple',
};

/**
 * Maps a string provider name to the corresponding AuthProvider enum
 * @param providerString - String representation of the provider
 * @returns The corresponding AuthProvider enum
 * @throws Error if the provider is not supported
 */
export function mapStringToProviderEnum(providerString: string): AuthProvider {
  const normalizedProvider = providerString.toLowerCase().trim();
  const enumValue = PROVIDER_MAPPING[normalizedProvider];
  
  if (!enumValue) {
    throw new Error(`Unsupported provider: ${providerString}. Supported providers: ${Object.keys(PROVIDER_MAPPING).join(', ')}`);
  }
  
  return enumValue;
}

/**
 * Maps an AuthProvider enum to its string representation
 * @param provider - AuthProvider enum value
 * @returns String representation of the provider
 */
export function mapProviderEnumToString(provider: AuthProvider): string {
  const stringValue = REVERSE_PROVIDER_MAPPING[provider];
  
  if (!stringValue) {
    throw new Error(`Invalid AuthProvider enum: ${provider}`);
  }
  
  return stringValue;
}

/**
 * Validates if a provider string is supported
 * @param providerString - String representation of the provider
 * @returns true if supported, false otherwise
 */
export function isSupportedProvider(providerString: string): boolean {
  try {
    mapStringToProviderEnum(providerString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets all supported provider strings
 * @returns Array of supported provider strings
 */
export function getSupportedProviders(): string[] {
  return Object.keys(PROVIDER_MAPPING);
}

/**
 * Gets all supported AuthProvider enum values
 * @returns Array of AuthProvider enum values
 */
export function getSupportedProviderEnums(): AuthProvider[] {
  return Object.values(AuthProvider);
}
