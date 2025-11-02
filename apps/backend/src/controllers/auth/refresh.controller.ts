import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { getCookies } from '../../core/middleware';
import { errorResponse, successResponse } from '../../utils/json';
import { setCookie } from '../../utils/cookies';
import type { RouteHandler } from '../../core/router';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const refresh: RouteHandler = async (req: Request) => {
  try {
    const cookies = getCookies(req);
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      return errorResponse('Refresh token not found', 401);
    }

    // Verify refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
    } catch (error) {
      return errorResponse('Invalid refresh token', 401);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        business: true,
        role: true
      }
    });

    if (!user || !user.isActive) {
      return errorResponse('Invalid user', 401);
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        businessId: user.businessId,
        email: user.email,
        role: user.role.name,
        type: 'access_token'
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const response = successResponse({
      token: newAccessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        business: user.business,
        role: user.role
      }
    });

    // Set new session token cookie
    const sessionCookie = setCookie('sessionToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    response.headers.set('Set-Cookie', sessionCookie);

    return response;

  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse('Invalid refresh token', 401);
  }
};
