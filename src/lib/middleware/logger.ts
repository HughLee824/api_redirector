import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '@/lib/utils/logger';

export async function loggerMiddleware(
  req: NextRequest,
  res: NextResponse,
  apiKey?: string
): Promise<void> {
  const method = req.method;
  const url = req.url;
  const status = res.status;
  
  Logger.logRequest(method, url, apiKey, status);
} 