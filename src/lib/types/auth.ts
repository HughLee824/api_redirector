export interface ApiKeyConfig {
  key: string;
  name: string;
  permissions: string[];
  rateLimit: {
    requests: number;
    window: number; // seconds
  };
}

export interface AuthResult {
  success: boolean;
  error?: string;
  apiKey?: string;
  config?: ApiKeyConfig;
}

export interface RateLimitResult {
  allowed: boolean;
  resetTime?: number;
  remaining?: number;
} 