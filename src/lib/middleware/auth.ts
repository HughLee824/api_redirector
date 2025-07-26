import { NextRequest } from 'next/server';
import { AuthResult } from '@/lib/types/auth';
import { ApiKeyAuth } from '@/lib/auth/api-key';

export async function authMiddleware(req: NextRequest): Promise<AuthResult> {
  // Try multiple auth methods
  const authHeader = req.headers.get('Authorization');
  const authToken = req.nextUrl.searchParams.get('auth_token');
  const apiKey = req.nextUrl.searchParams.get('api_key');

  let token: string | null = null;

  // Extract token from different sources
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (authToken) {
    token = authToken;
  } else if (apiKey) {
    token = apiKey;
  }

  if (!token) {
    return {
      success: false,
      error: 'No authentication token provided. Use Authorization header, auth_token, or api_key parameter.'
    };
  }

  return ApiKeyAuth.validateApiKey(token);
} 