// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { getCookies, parseBody } from '../core/middleware';
import { errorResponse, successResponse } from '../utils/json';
import { setCookie } from '../utils/cookies';
import type { RouteHandler } from '../core/router';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

// Extend Request with user and session (for Bun)
declare global {
  interface Request {
    user?: any;
    session?: any;
  }
}

export const authenticateToken: RouteHandler = async (req: Request) => {
  try {
    const authHeader = req.headers.get('authorization');
    const cookies = getCookies(req);
    const url = new URL(req.url);
    
    // Check for token in multiple locations
    let token = authHeader?.split(' ')[1] || 
                cookies.sessionToken || 
                url.searchParams.get('token');

    if (!token) {
      return errorResponse('Access token required', 401);
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return errorResponse('Invalid or expired token', 403);
    }

    if (typeof decoded === 'string' || decoded.type !== 'access_token') {
      return errorResponse('Invalid token type', 401);
    }

    // Check session in database
    const session = await prisma.authSession.findFirst({
      where: {
        sessionToken: token,
        revokedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          include: {
            business: true,
            role: true
          }
        }
      }
    });

    if (!session) {
      return errorResponse('Session expired or invalid', 401);
    }

    // Check if user is active
    if (!session.user.isActive || !session.user.business.isActive) {
      return errorResponse('Account deactivated', 401);
    }

    // Add user and session to request
    req.user = session.user;
    req.session = session;

    // Continue to next handler (return null to indicate continuation)
    // In our router, we'll handle this by checking if response is a pass-through
    return new Response(null, { status: 200 }); // Pass-through signal
  } catch (error) {
    console.error('Authentication error:', error);
    return errorResponse('Invalid or expired token', 403);
  }
};

export const authenticateRefreshToken: RouteHandler = async (req: Request) => {
  try {
    const cookies = getCookies(req);
    const body = await parseBody(req);
    
    const refreshToken = cookies.refreshToken || body.refreshToken;

    if (!refreshToken) {
      return errorResponse('Refresh token required', 401);
    }

    // Verify refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (error) {
      return errorResponse('Invalid refresh token', 403);
    }

    if (typeof decoded === 'string' || decoded.type !== 'refresh_token') {
      return errorResponse('Invalid token type', 401);
    }

    // Check session in database
    const session = await prisma.authSession.findFirst({
      where: {
        refreshToken,
        revokedAt: null
      },
      include: {
        user: {
          include: {
            business: true,
            role: true
          }
        }
      }
    });

    if (!session) {
      return errorResponse('Invalid refresh token', 401);
    }

    if (session.expiresAt < new Date()) {
      return errorResponse('Refresh token expired', 401);
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: session.user.id,
        businessId: session.user.businessId,
        email: session.user.email,
        role: session.user.role.name,
        permissions: session.user.role.permissions,
        type: 'access_token'
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Update session with new token
    await prisma.authSession.update({
      where: { id: session.id },
      data: {
        sessionToken: newAccessToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      }
    });

    // Create response with cookie
    const response = successResponse({
      accessToken: newAccessToken,
      sessionId: session.id
    });

    const cookieHeader = setCookie('sessionToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    response.headers.set('Set-Cookie', cookieHeader);

    req.user = session.user;
    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse('Invalid refresh token', 403);
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string[]): RouteHandler => {
  return async (req: Request) => {
    if (!req.user) {
      return errorResponse('Authentication required', 401);
    }

    if (!roles.includes(req.user.role.name)) {
      return errorResponse('Insufficient permissions', 403);
    }

    return new Response(null, { status: 200 }); // Pass-through
  };
};

// Permission-based authorization middleware
export const requirePermission = (permission: string): RouteHandler => {
  return async (req: Request) => {
    if (!req.user) {
      return errorResponse('Authentication required', 401);
    }

    const userPermissions = req.user.role.permissions || [];
    
    if (!userPermissions.includes(permission) && !userPermissions.includes('*')) {
      return errorResponse('Insufficient permissions', 403);
    }

    return new Response(null, { status: 200 }); // Pass-through
  };
};
