import { ApiKeyConfig, AuthResult, RateLimitResult } from '@/lib/types/auth';
import { Config } from '@/lib/utils/config';
import { Logger } from '@/lib/utils/logger';

export class ApiKeyAuth {
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  static validateApiKey(key: string): AuthResult {
    try {
      const apiKeys = Config.getApiKeys();
      const config = apiKeys.find(k => k.key === key);
      
      if (!config) {
        Logger.warn('Invalid API key attempted', { key: key.substring(0, 8) + '...' });
        return { success: false, error: 'Invalid API key' };
      }

      return { success: true, apiKey: key, config };
    } catch (error) {
      Logger.error('Error validating API key', error);
      return { success: false, error: 'Authentication error' };
    }
  }

  static checkRateLimit(key: string, config: ApiKeyConfig): RateLimitResult {
    const now = Date.now();
    const windowMs = config.rateLimit.window * 1000;
    const keyData = this.rateLimitStore.get(key);

    if (!keyData || now > keyData.resetTime) {
      // Reset or first request
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return { allowed: true, remaining: config.rateLimit.requests - 1 };
    }

    if (keyData.count >= config.rateLimit.requests) {
      return { 
        allowed: false, 
        resetTime: keyData.resetTime,
        remaining: 0 
      };
    }

    keyData.count++;
    return { 
      allowed: true, 
      remaining: config.rateLimit.requests - keyData.count 
    };
  }

  static logRequest(key: string, endpoint: string, status: number): void {
    if (Config.isRequestLoggingEnabled()) {
      Logger.logRequest('API', endpoint, key, status);
    }
  }
} 