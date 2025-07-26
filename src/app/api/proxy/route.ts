import { NextRequest } from 'next/server';
import { authMiddleware } from '@/lib/middleware/auth';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
import { GoogleMapsProxy } from '@/lib/proxy/google-maps';
import { ResponseHelper } from '@/lib/utils/response';
import { Logger } from '@/lib/utils/logger';
import { GenericProxyRequest } from '@/lib/types/api';

const services = {
  'google-maps': new GoogleMapsProxy()
};

async function handleProxyRequest(request: NextRequest, method: string) {
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

    // Parse request body for POST requests
    let requestData: GenericProxyRequest;
    if (method === 'GET') {
      const url = new URL(request.url);
      requestData = {
        service: url.searchParams.get('service') || '',
        endpoint: url.searchParams.get('endpoint') || '',
        method: 'GET',
        params: Object.fromEntries(url.searchParams.entries())
      };
    } else {
      try {
        requestData = await request.json();
      } catch {
        return ResponseHelper.error('BAD_REQUEST', 'Invalid JSON in request body');
      }
    }

    // Validate required fields
    if (!requestData.service || !requestData.endpoint) {
      return ResponseHelper.error('BAD_REQUEST', 'service and endpoint are required');
    }

    // Check if service is supported
    const proxyService = services[requestData.service as keyof typeof services];
    if (!proxyService) {
      return ResponseHelper.error('BAD_REQUEST', `Unsupported service: ${requestData.service}`);
    }

    // Rate limiting
    const rateLimitResult = await rateLimitMiddleware(apiKey!, config, requestData.endpoint);
    if (!rateLimitResult.allowed) {
      return ResponseHelper.tooManyRequests('Rate limit exceeded');
    }

    // Build proxy request
    const proxyRequest = {
      method: requestData.method || method,
      url: proxyService.buildUrl(requestData.endpoint, requestData.params),
      headers: requestData.headers || {},
      body: requestData.body
    };

    // Execute proxy request
    const proxyResponse = await proxyService.proxy(proxyRequest);

    // Log the request
    Logger.logRequest(method, `/api/proxy`, apiKey, proxyResponse.status);

    // Return response
    const contentType = proxyResponse.headers['content-type'] || 'application/json';
    
    return new Response(
      typeof proxyResponse.data === 'string' ? proxyResponse.data : JSON.stringify(proxyResponse.data),
      {
        status: proxyResponse.status,
        headers: {
          'Content-Type': contentType,
          ...proxyResponse.headers
        }
      }
    );

  } catch (error) {
    Logger.error(`Error in generic proxy (${method})`, error);
    return ResponseHelper.internalError('Proxy request failed');
  }
}

export async function GET(request: NextRequest) {
  return handleProxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleProxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleProxyRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return handleProxyRequest(request, 'DELETE');
} 