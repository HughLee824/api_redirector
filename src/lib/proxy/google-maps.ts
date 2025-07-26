import { ProxyRequest, ProxyResponse } from '@/lib/types/proxy';
import { BaseProxy } from './base-proxy';
import { Config } from '@/lib/utils/config';

export class GoogleMapsProxy extends BaseProxy {
  name = 'google-maps';
  baseUrl = 'https://maps.googleapis.com/maps/api';

  transformRequest(req: ProxyRequest): ProxyRequest {
    // Add Google Maps API key to the request
    const url = new URL(req.url);
    url.searchParams.set('key', Config.getGoogleMapsApiKey());

    return {
      ...req,
      url: url.toString(),
      headers: {
        ...req.headers,
        'User-Agent': 'API-Redirector/1.0'
      }
    };
  }

  transformResponse(res: ProxyResponse): ProxyResponse {
    // Clean up Google-specific headers that shouldn't be passed through
    const cleanHeaders = { ...res.headers };
    delete cleanHeaders['server'];
    delete cleanHeaders['x-content-type-options'];
    delete cleanHeaders['x-frame-options'];
    delete cleanHeaders['x-xss-protection'];

    return {
      ...res,
      headers: {
        ...cleanHeaders,
        'X-Proxy-Service': 'google-maps',
        'X-Proxy-Timestamp': new Date().toISOString()
      }
    };
  }

  async geocode(address: string, params?: Record<string, any>): Promise<ProxyResponse> {
    const geocodeParams = {
      address,
      ...params
    };

    const request: ProxyRequest = {
      method: 'GET',
      url: this.buildUrl('/geocode/xml', geocodeParams),
      headers: {}
    };

    return this.proxy(request);
  }

  async reverseGeocode(lat: number, lng: number, params?: Record<string, any>): Promise<ProxyResponse> {
    const geocodeParams = {
      latlng: `${lat},${lng}`,
      ...params
    };

    const request: ProxyRequest = {
      method: 'GET',
      url: this.buildUrl('/geocode/xml', geocodeParams),
      headers: {}
    };

    return this.proxy(request);
  }
} 