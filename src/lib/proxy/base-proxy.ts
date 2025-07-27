import { ProxyRequest, ProxyResponse, ProxyService } from '@/lib/types/proxy';
import { Logger } from '@/lib/utils/logger';

export abstract class BaseProxy implements ProxyService {
  abstract name: string;
  abstract baseUrl: string;

  abstract transformRequest(req: ProxyRequest): ProxyRequest;
  abstract transformResponse(res: ProxyResponse): ProxyResponse;

  async proxy(req: ProxyRequest): Promise<ProxyResponse> {
    try {
      // Transform the request
      const transformedReq = this.transformRequest(req);
      
      Logger.debug(`Proxying request to ${this.name}`, {
        method: transformedReq.method,
        url: transformedReq.url
      });

      // Make the actual request
      const fetchOptions: RequestInit = {
        method: transformedReq.method,
        headers: transformedReq.headers,
      };

      // Only add body for non-GET requests
      if (transformedReq.method !== 'GET' && transformedReq.body) {
        fetchOptions.body = JSON.stringify(transformedReq.body);
      }

      const response = await fetch(transformedReq.url, fetchOptions);

      // Read response
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      const proxyResponse: ProxyResponse = {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      };

      // Transform the response
      return this.transformResponse(proxyResponse);
      
    } catch (error) {
      Logger.error(`Error proxying request to ${this.name}`, {
        url: req.url,
        method: req.method,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }
} 