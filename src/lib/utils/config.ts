import { ApiKeyConfig } from '@/lib/types/auth';

export class Config {
  static getGoogleMapsApiKey(): string {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
      throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set');
    }
    return key;
  }

  static getApiKeys(): ApiKeyConfig[] {
    const apiKeysEnv = process.env.API_KEYS || '';
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
          requests: parseInt(process.env.DEFAULT_RATE_LIMIT || '100'),
          window: parseInt(process.env.DEFAULT_RATE_WINDOW || '3600')
        }
      };
    });
  }

  static getLogLevel(): string {
    return process.env.LOG_LEVEL || 'info';
  }

  static isRequestLoggingEnabled(): boolean {
    return process.env.ENABLE_REQUEST_LOGGING === 'true';
  }
} 