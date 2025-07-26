import { NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types/api';

export class ResponseHelper {
  static success<T>(data: T, status: number = 200): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(response, { status });
  }

  static error(code: string, message: string, details?: string, status: number = 400): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details
      },
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(response, { status });
  }

  static unauthorized(message: string = 'Unauthorized'): NextResponse {
    return this.error('UNAUTHORIZED', message, undefined, 401);
  }

  static forbidden(message: string = 'Forbidden'): NextResponse {
    return this.error('FORBIDDEN', message, undefined, 403);
  }

  static notFound(message: string = 'Not Found'): NextResponse {
    return this.error('NOT_FOUND', message, undefined, 404);
  }

  static tooManyRequests(message: string = 'Too Many Requests'): NextResponse {
    return this.error('TOO_MANY_REQUESTS', message, undefined, 429);
  }

  static internalError(message: string = 'Internal Server Error'): NextResponse {
    return this.error('INTERNAL_ERROR', message, undefined, 500);
  }
} 