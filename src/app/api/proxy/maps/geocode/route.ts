import { NextRequest } from 'next/server';
import { authMiddleware } from '@/lib/middleware/auth';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
import { GoogleMapsProxy } from '@/lib/proxy/google-maps';
import { ResponseHelper } from '@/lib/utils/response';
import { Logger } from '@/lib/utils/logger';

const googleMapsProxy = new GoogleMapsProxy();

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return ResponseHelper.unauthorized(authResult.error);
    }

    const { apiKey, config } = authResult;
    if (!config) {
      return ResponseHelper.unauthorized('Invalid configuration');
    }

    // Rate limiting
    const rateLimitResult = await rateLimitMiddleware(apiKey!, config, 'geocode');
    if (!rateLimitResult.allowed) {
      return ResponseHelper.tooManyRequests('Rate limit exceeded');
    }

    // Extract parameters
    const url = new URL(request.url);
    const address = url.searchParams.get('address');
    const latlng = url.searchParams.get('latlng');

    if (!address && !latlng) {
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

    // Call Google Maps API
    let proxyResponse;
    if (address) {
      proxyResponse = await googleMapsProxy.geocode(address, additionalParams);
    } else {
      const [lat, lng] = latlng!.split(',').map(Number);
      proxyResponse = await googleMapsProxy.reverseGeocode(lat, lng, additionalParams);
    }

    // Log the request
    Logger.logRequest('GET', `/api/proxy/maps/geocode`, apiKey, proxyResponse.status);

    // Return proxied response
    return new Response(proxyResponse.data, {
      status: proxyResponse.status,
      headers: {
        'Content-Type': 'application/xml',
        ...proxyResponse.headers
      }
    });

  } catch (error) {
    Logger.error('Error in Google Maps geocode proxy', error);
    return ResponseHelper.internalError('Proxy request failed');
  }
} 