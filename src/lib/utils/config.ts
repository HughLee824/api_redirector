import { ApiKeyConfig } from '@/lib/types/auth';

// Safe environment variable access with runtime checks
function safeGetEnv(key: string, defaultValue: string = ''): string {
  if (typeof window !== 'undefined') {
    // Client-side - return empty string
    return defaultValue;
  }
  
  try {
    return process.env[key] || defaultValue;
  } catch {
    // Fallback during build time or any access issues
    return defaultValue;
  }
}

export class Config {
  static getGoogleMapsApiKey(): string {
    const key = safeGetEnv('GOOGLE_MAPS_API_KEY');
    if (!key) {
      throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set');
    }
    return key;
  }

  static getApiKeys(): ApiKeyConfig[] {
    const apiKeysEnv = safeGetEnv('API_KEYS');
    if (!apiKeysEnv) {
      return [];
    }

    return apiKeysEnv.split(';').map(keyEntry => {
      const [key, name, permissions] = keyEntry.split(':');
      return {
        key,
        name,
        permissions: permissions ? permissions.split(',') : [],
        rateLimit: {
          requests: parseInt(safeGetEnv('DEFAULT_RATE_LIMIT', '100')),
          window: parseInt(safeGetEnv('DEFAULT_RATE_WINDOW', '3600'))
        }
      };
    });
  }

  static getLogLevel(): string {
    return safeGetEnv('LOG_LEVEL', 'info');
  }

  static isRequestLoggingEnabled(): boolean {
    return safeGetEnv('ENABLE_REQUEST_LOGGING') === 'true';
  }
} 