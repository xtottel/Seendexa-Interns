// src/core/middleware.ts
// Middleware utilities for Bun

import { logger } from '../utils/logger';
import { parseCookies } from '../utils/cookies';
import { errorResponse } from '../utils/json';

// CORS middleware
export function withCORS(handler: (req: Request) => Promise<Response> | Response) {
  return async (req: Request): Promise<Response> => {
    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': getCORSOrigin(req),
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const response = await handler(req);

    // Add CORS headers
    const origin = getCORSOrigin(req);
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  };
}

function getCORSOrigin(req: Request): string | null {
  const origin = req.headers.get('origin');
  if (!origin) return null;

  if (origin === 'http://localhost:3000') return origin;

  try {
    const hostname = new URL(origin).hostname;
    if (/\.?sendexa\.co$/.test(hostname)) {
      return origin;
    }
  } catch {
    // Invalid origin
  }

  return null;
}

// Logging middleware
export function withLogging(handler: (req: Request) => Promise<Response> | Response) {
  return async (req: Request): Promise<Response> => {
    const start = Date.now();
    const url = new URL(req.url);

    logger.info('Incoming request', {
      method: req.method,
      path: url.pathname,
      userAgent: req.headers.get('user-agent'),
    });

    const response = await handler(req);

    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      path: url.pathname,
      status: response.status,
      duration: `${duration}ms`,
    });

    return response;
  };
}

// Body parsing middleware
export async function parseBody(req: Request): Promise<any> {
  const contentType = req.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    try {
      return await req.json();
    } catch {
      return {};
    }
  }

  if (contentType?.includes('application/x-www-form-urlencoded')) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const body: any = {};
    for (const [key, value] of params.entries()) {
      body[key] = value;
    }
    return body;
  }

  return {};
}

// Rate limiting (in-memory, simple version)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(handler: (req: Request) => Promise<Response> | Response, limit: number = 100, windowMs: number = 60000) {
  return async (req: Request): Promise<Response> => {
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const now = Date.now();

    let rateLimit = rateLimitMap.get(ip);

    if (!rateLimit || now > rateLimit.resetTime) {
      rateLimit = { count: 0, resetTime: now + windowMs };
      rateLimitMap.set(ip, rateLimit);
    }

    rateLimit.count++;

    if (rateLimit.count > limit) {
      return errorResponse('Too many requests. Slow down a bit.', 429);
    }

    return await handler(req);
  };
}

// Cookie parsing helper
export function getCookies(req: Request): Record<string, string> {
  const cookieHeader = req.headers.get('cookie');
  return parseCookies(cookieHeader);
}

