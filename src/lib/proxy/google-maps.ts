import { ProxyRequest, ProxyResponse, OutputFormat } from '@/lib/types/proxy';
import { BaseProxy } from './base-proxy';
import { Config } from '@/lib/utils/config';

export class GoogleMapsProxy extends BaseProxy {
  name = 'google-maps';
  baseUrl = 'https://maps.googleapis.com/';

  transformRequest(req: ProxyRequest): ProxyRequest {
    console.log('[DEBUG] GoogleMapsProxy.transformRequest called');
    console.log('[DEBUG] Original request URL:', req.url);
    
    // Add Google Maps API key to the request
    const url = new URL(req.url);
    const apiKey = Config.getGoogleMapsApiKey();
    console.log('[DEBUG] Google Maps API key loaded:', apiKey ? '***REDACTED***' : 'NOT FOUND');
    
    url.searchParams.set('key', apiKey);

    const transformedRequest = {
      ...req,
      url: url.toString(),
      headers: {
        ...req.headers,
        'User-Agent': 'API-Redirector/1.0'
      }
    };
    
    // Mask API key in URL for security
    const maskedUrl = transformedRequest.url.replace(/key=[^&]+/, 'key=***REDACTED***');
    console.log('[DEBUG] Transformed request URL:', maskedUrl);
    return transformedRequest;
  }

  transformResponse(res: ProxyResponse): ProxyResponse {
    // Clean up Google-specific headers that shouldn't be passed through
    const cleanHeaders = { ...res.headers };
    delete cleanHeaders['server'];
    delete cleanHeaders['x-content-type-options'];
    delete cleanHeaders['x-frame-options'];
    delete cleanHeaders['x-xss-protection'];

    // Determine format from content-type
    const contentType = res.headers['content-type'] || '';
    const format = contentType.includes('xml') ? 'xml' : 'json';

    return {
      ...res,
      headers: {
        ...cleanHeaders,
        'X-Proxy-Service': 'google-maps',
        'X-Proxy-Timestamp': new Date().toISOString(),
        'X-Response-Format': format
      }
    };
  }

  async geocode(address: string, format: OutputFormat = 'xml', params?: Record<string, any>): Promise<ProxyResponse> {
    const geocodeParams = {
      address,
      ...params
    };

    const endpoint = `maps/api/geocode/${format}`;

    const request: ProxyRequest = {
      method: 'GET',
      url: this.buildUrl(endpoint, geocodeParams),
      headers: {}
    };

    return this.proxy(request);
  }

  async reverseGeocode(lat: number, lng: number, format: OutputFormat = 'xml', params?: Record<string, any>): Promise<ProxyResponse> {
    const geocodeParams = {
      latlng: `${lat},${lng}`,
      ...params
    };

    const endpoint = `maps/api/geocode/${format}`;

    const request: ProxyRequest = {
      method: 'GET',
      url: this.buildUrl(endpoint, geocodeParams),
      headers: {}
    };

    return this.proxy(request);
  }
} 