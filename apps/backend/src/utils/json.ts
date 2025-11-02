// src/utils/json.ts
// JSON response utilities for Bun

export function jsonResponse(data: any, status: number = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

export function errorResponse(message: string, status: number = 400, error?: any): Response {
  return jsonResponse(
    {
      success: false,
      message,
      ...(error && { error }),
    },
    status
  );
}

export function successResponse(data: any, message?: string, status: number = 200): Response {
  return jsonResponse(
    {
      success: true,
      ...(message && { message }),
      ...(typeof data === 'object' && !Array.isArray(data) ? data : { data }),
    },
    status
  );
}

