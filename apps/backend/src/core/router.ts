// src/core/router.ts
// Centralized router for Bun

export type RouteHandler = (req: Request, params?: Record<string, string>) => Promise<Response> | Response;
export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';

export interface Route {
  path: string;
  method: Method;
  handler: RouteHandler;
  middleware?: RouteHandler[];
}

class APIRouter {
  private routes: Route[] = [];

  register(path: string, method: Method, handler: RouteHandler, middleware?: RouteHandler[]): void {
    this.routes.push({ path, method, handler, middleware });
  }

  get(path: string, handler: RouteHandler, middleware?: RouteHandler[]): void {
    this.register(path, 'GET', handler, middleware);
  }

  post(path: string, handler: RouteHandler, middleware?: RouteHandler[]): void {
    this.register(path, 'POST', handler, middleware);
  }

  put(path: string, handler: RouteHandler, middleware?: RouteHandler[]): void {
    this.register(path, 'PUT', handler, middleware);
  }

  delete(path: string, handler: RouteHandler, middleware?: RouteHandler[]): void {
    this.register(path, 'DELETE', handler, middleware);
  }

  patch(path: string, handler: RouteHandler, middleware?: RouteHandler[]): void {
    this.register(path, 'PATCH', handler, middleware);
  }

  private matchPath(routePath: string, requestPath: string): { matched: boolean; params: Record<string, string> } {
    const routeParts = routePath.split('/').filter(Boolean);
    const requestParts = requestPath.split('/').filter(Boolean);

    if (routeParts.length !== requestParts.length) {
      return { matched: false, params: {} };
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const requestPart = requestParts[i];

      if (routePart.startsWith(':')) {
        params[routePart.slice(1)] = requestPart;
      } else if (routePart !== requestPart) {
        return { matched: false, params: {} };
      }
    }

    return { matched: true, params };
  }

  async handle(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method as Method;

    // Try exact match first
    let route = this.routes.find(
      (r) => {
        const match = this.matchPath(r.path, pathname);
        return match.matched && r.method === method;
      }
    );

    // If no exact match, try prefix match
    if (!route) {
      const matchingRoutes = this.routes
        .filter((r) => {
          if (r.method !== method) return false;
          return pathname.startsWith(r.path) || r.path.endsWith('*');
        })
        .sort((a, b) => b.path.length - a.path.length);

      route = matchingRoutes[0];
    }

    // If still no match, try parameterized routes
    if (!route) {
      for (const r of this.routes) {
        if (r.method !== method) continue;
        const match = this.matchPath(r.path, pathname);
        if (match.matched) {
          route = r;
          // Store params in request (we'll need to modify this)
          break;
        }
      }
    }

    if (!route) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Endpoint not found',
          path: pathname,
          method,
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      // Extract params
      const match = this.matchPath(route.path, pathname);
      const params = match.params || {};

      // Apply middleware
      let handler: RouteHandler = route.handler;
      if (route.middleware && route.middleware.length > 0) {
        for (const middleware of route.middleware.reverse()) {
          const next = handler;
          handler = async (req: Request, params?: Record<string, string>) => {
            const result = await middleware(req, params);
            // If middleware returns a non-200 response, stop chain
            if (result instanceof Response && result.status !== 200) {
              return result;
            }
            // Continue to next handler (even if status is 200, pass through)
            return next(req, params);
          };
        }
      }

      return await handler(req, params);
    } catch (error) {
      console.error('Route handler error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Internal server error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
}

export const router = new APIRouter();

