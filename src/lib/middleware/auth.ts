import { NextRequest } from 'next/server';
import { AuthResult } from '@/lib/types/auth';
import { ApiKeyAuth } from '@/lib/auth/api-key';

export async function authMiddleware(req: NextRequest): Promise<AuthResult> {
  console.log('[DEBUG] authMiddleware called');
  
  // Try multiple auth methods
  const authHeader = req.headers.get('Authorization');
  const authToken = req.nextUrl.searchParams.get('auth_token');
  const apiKey = req.nextUrl.searchParams.get('api_key');
  
  console.log('[DEBUG] Auth sources:', {
    hasAuthHeader: !!authHeader,
    hasAuthToken: !!authToken,
    hasApiKey: !!apiKey
  });

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
    console.log('[DEBUG] No token found in any source');
    return {
      success: false,
      error: 'No authentication token provided. Use Authorization header, auth_token, or api_key parameter.'
    };
  }
  
  console.log('[DEBUG] Token found:', token.substring(0, 8) + '...');
  const result = ApiKeyAuth.validateApiKey(token);
  console.log('[DEBUG] Validation result:', { success: result.success, error: result.error });
  
  return result;
} 