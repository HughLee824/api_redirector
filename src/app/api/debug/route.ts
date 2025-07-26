import { NextRequest } from 'next/server';
import { ResponseHelper } from '@/lib/utils/response';
import { Config } from '@/lib/utils/config';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] Debug endpoint called');
    
    // Mask sensitive headers
    const safeHeaders = Object.fromEntries(
      Object.entries(request.headers).map(([key, value]) => [
        key,
        key.toLowerCase().includes('auth') || key.toLowerCase().includes('key') 
          ? '***REDACTED***' 
          : value
      ])
    );

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasGoogleMapsKey: !!process.env.GOOGLE_MAPS_API_KEY,
        hasApiKeys: !!process.env.API_KEYS,
        googleMapsKeyLength: process.env.GOOGLE_MAPS_API_KEY?.length || 0,
        apiKeysLength: process.env.API_KEYS?.length || 0
      },
      request: {
        url: request.url.replace(/[?&](auth_token|api_key|key)=[^&]+/g, '$1=***REDACTED***'),
        method: request.method,
        headers: safeHeaders
      },
      config: {
        canLoadGoogleMapsKey: false,
        canLoadApiKeys: false,
        apiKeysCount: 0
      }
    };

    // Test config loading
    try {
      Config.getGoogleMapsApiKey();
      debugInfo.config.canLoadGoogleMapsKey = true;
    } catch (error) {
      console.log('[DEBUG] Cannot load Google Maps key:', error);
    }

    try {
      const apiKeys = Config.getApiKeys();
      debugInfo.config.canLoadApiKeys = true;
      debugInfo.config.apiKeysCount = apiKeys.length;
    } catch (error) {
      console.log('[DEBUG] Cannot load API keys:', error);
    }

    console.log('[DEBUG] Debug info:', debugInfo);
    
    return ResponseHelper.success(debugInfo);
  } catch (error) {
    console.log('[DEBUG] Error in debug endpoint:', error);
    return ResponseHelper.internalError('Debug endpoint failed');
  }
} 