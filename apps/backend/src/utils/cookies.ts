// src/utils/cookies.ts
// Cookie utilities for Bun

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
  domain?: string;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): string {
  const parts: string[] = [`${name}=${value}`];

  if (options.maxAge) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  } else {
    parts.push(`Path=/`);
  }

  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }

  if (options.httpOnly) {
    parts.push(`HttpOnly`);
  }

  if (options.secure) {
    parts.push(`Secure`);
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  return parts.join('; ');
}

export function clearCookie(name: string, options: CookieOptions = {}): string {
  return setCookie(name, '', {
    ...options,
    maxAge: 0,
    path: options.path || '/'
  });
}

export function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name) {
      cookies[name] = rest.join('=');
    }
  });

  return cookies;
}

