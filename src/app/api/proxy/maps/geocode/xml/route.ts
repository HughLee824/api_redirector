import { NextRequest } from 'next/server';
import { authMiddleware } from '@/lib/middleware/auth';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
import { GoogleMapsProxy } from '@/lib/proxy/google-maps';
import { ResponseHelper } from '@/lib/utils/response';
import { Logger } from '@/lib/utils/logger';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Lazy load proxy to avoid build-time environment variable access
function getGoogleMapsProxy() {
  return new GoogleMapsProxy();
}

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] Google Maps geocode XML route called');
    console.log('[DEBUG] Request URL:', request.url);
    console.log('[DEBUG] Request method:', request.method);
    console.log('[DEBUG] Headers:', Object.fromEntries(request.headers.entries()));
    
    // Authentication
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      console.log('[DEBUG] Auth failed:', authResult.error);
      return ResponseHelper.unauthorized(authResult.error);
    }

    const { apiKey, config } = authResult;
    console.log('[DEBUG] Auth successful, API key:', '***REDACTED***');
    
    if (!config) {
      console.log('[DEBUG] No config found for API key');
      return ResponseHelper.unauthorized('Invalid configuration');
    }
    
    console.log('[DEBUG] Config found:', { name: config.name, permissions: config.permissions });

    // Rate limiting
    const rateLimitResult = await rateLimitMiddleware(apiKey!, config, 'geocode');
    if (!rateLimitResult.allowed) {
      return ResponseHelper.tooManyRequests('Rate limit exceeded');
    }

    // Extract parameters
    const url = new URL(request.url);
    const address = url.searchParams.get('address');
    const latlng = url.searchParams.get('latlng');
    
    console.log('[DEBUG] Extracted parameters:', { address, latlng });

    if (!address && !latlng) {
      console.log('[DEBUG] Missing required parameters');
      return ResponseHelper.error('BAD_REQUEST', 'Either address or latlng parameter is required');
    }

    // Additional parameters
    const additionalParams: Record<string, any> = {};
    const allowedParams = ['language', 'region', 'components', 'bounds', 'result_type', 'location_type'];
    
    allowedParams.forEach(param => {
      const value = url.searchParams.get(param);
      if (value) {
        additionalParams[param] = value;
      }
    });

    // Call Google Maps API with XML format
    console.log('[DEBUG] Creating Google Maps proxy...');
    const googleMapsProxy = getGoogleMapsProxy();
    console.log('[DEBUG] Google Maps proxy created successfully');
    
    let proxyResponse;
    if (address) {
      console.log('[DEBUG] Calling geocode with address (XML format):', address);
      proxyResponse = await googleMapsProxy.geocode(address, 'xml', additionalParams);
    } else {
      const [lat, lng] = latlng!.split(',').map(Number);
      console.log('[DEBUG] Calling reverse geocode with coords (XML format):', lat, lng);
      proxyResponse = await googleMapsProxy.reverseGeocode(lat, lng, 'xml', additionalParams);
    }
    
    console.log('[DEBUG] Proxy response status:', proxyResponse.status);

    // Log the request
    Logger.logRequest('GET', `/api/proxy/maps/geocode/xml`, apiKey, proxyResponse.status);

    // Return proxied response
    console.log('[DEBUG] Returning successful XML response with status:', proxyResponse.status);
    
    // Ensure we don't have content-type conflicts
    const cleanHeaders = { ...proxyResponse.headers };
    delete cleanHeaders['content-type'];
    delete cleanHeaders['Content-Type'];
    
    return new Response(
      typeof proxyResponse.data === 'string' ? proxyResponse.data : JSON.stringify(proxyResponse.data),
      {
        status: proxyResponse.status,
        headers: {
          'Content-Type': 'application/xml',
          ...cleanHeaders
        }
      }
    );

  } catch (error) {
    console.log('[DEBUG] Error in geocode XML route:', error);
    Logger.error('Error in Google Maps geocode XML proxy', error);
    return ResponseHelper.internalError('Proxy request failed');
  }
} 