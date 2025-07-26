import { NextRequest } from 'next/server';
import { ResponseHelper } from '@/lib/utils/response';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        'google-maps': 'available'
      }
    };

    return ResponseHelper.success(health);
  } catch (error) {
    return ResponseHelper.internalError('Health check failed');
  }
} 