import { ApiKeyConfig, RateLimitResult } from '@/lib/types/auth';
import { ApiKeyAuth } from '@/lib/auth/api-key';

export async function rateLimitMiddleware(
  apiKey: string,
  config: ApiKeyConfig,
  endpoint: string
): Promise<RateLimitResult> {
  return ApiKeyAuth.checkRateLimit(apiKey, config);
} 