// controllers/auth/login.controller.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import crypto from 'crypto';
import { sendMail } from "../../utils/mailer";
import OTPEmail from "../../emails/OTPEmail";
import { parseBody } from '../../core/middleware';
import { errorResponse, successResponse } from '../../utils/json';
import { setCookie } from '../../utils/cookies';
import type { RouteHandler } from '../../core/router';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

export const login: RouteHandler = async (req: Request) => {
  try {
    const body = await parseBody(req);
    const { email, password, deviceInfo } = body;
    
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Validate input
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // Track login attempt
    await prisma.loginAttempt.create({
      data: {
        email,
        ipAddress,
        userAgent,
        success: false
      }
    });

    // Check rate limiting
    const recentAttempts = await prisma.loginAttempt.count({
      where: {
        ipAddress,
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
        },
        success: false
      }
    });

    if (recentAttempts >= 10) {
      return errorResponse('Too many failed attempts. Please try again later.', 429);
    }

    // Find user with business information
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        business: {
          include: {
            settings: true
          }
        },
        role: true,
        mfaSettings: true,
        loginAttempts: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    });

    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse('Account is deactivated. Please contact support.', 401);
    }

    // Check if business is active
    if (!user.business.isActive) {
      return errorResponse('Business account is deactivated. Please contact support.', 401);
    }

    // Check failed login attempts
    const failedAttempts = user.loginAttempts.filter(attempt => !attempt.success);
    const maxAttempts = user.business.settings?.maxLoginAttempts || 5;
    
    if (failedAttempts.length >= maxAttempts) {
      return errorResponse('Account locked due to too many failed attempts. Please reset your password or contact support.', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Update login attempt
      await prisma.loginAttempt.updateMany({
        where: { email, success: false },
        data: { userId: user.id }
      });

      return errorResponse('Invalid credentials', 401);
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return errorResponse('Please verify your email before logging in', 401);
    }

    // Check if MFA is required
    const businessRequiresMFA = user.business.settings?.mfaRequired || false;
    const userHasMFA = user.mfaSettings?.isEnabled || false;

    if (businessRequiresMFA || userHasMFA) {
      // Generate OTP for MFA
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.oTP.upsert({
        where: { 
          email_type: {
            email,
            type: 'LOGIN_2FA'
          }
        },
        update: {
          otp,
          expiresAt: otpExpiry
        },
        create: {
          email,
          otp,
          type: 'LOGIN_2FA',
          expiresAt: otpExpiry
        }
      });

      // Send OTP via email
      const name = `${user.firstName} ${user.lastName}`;
      await sendMail({
        to: email,
        subject: 'Your Login Verification Code',
        react: OTPEmail({ name, otp, type: 'login' }),
      });

      // Create temporary auth token for MFA flow
      const mfaToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          purpose: 'mfa_verification'
        },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      return successResponse({
        requiresMFA: true,
        mfaToken,
        mfaMethod: user.mfaSettings?.method || 'EMAIL'
      }, 'MFA required');
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Create auth session
    const session = await prisma.authSession.create({
      data: {
        userId: user.id,
        sessionToken: accessToken,
        refreshToken,
        deviceInfo,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      }
    });

    // Update login attempt as successful
    await prisma.loginAttempt.updateMany({
      where: { email, success: false },
      data: { 
        userId: user.id,
        success: true 
      }
    });

    // Update user's last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    // Create response with cookies
    const response = successResponse({
      accessToken,
      refreshToken: session.refreshToken,
      sessionId: session.id,
      user: userWithoutPassword
    }, 'Login successful');

    // Set cookies
    const refreshCookie = setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const sessionCookie = setCookie('sessionToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    // Set multiple cookies (Bun supports multiple Set-Cookie headers)
    response.headers.set('Set-Cookie', [refreshCookie, sessionCookie].join(', '));

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
};

// MFA Verification Controller
export const verifyMFA: RouteHandler = async (req: Request) => {
  try {
    const body = await parseBody(req);
    const { mfaToken, otp, deviceInfo } = body;
    
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    if (!mfaToken || !otp) {
      return errorResponse('MFA token and OTP are required', 400);
    }

    // Verify MFA token
    let decoded: any;
    try {
      decoded = jwt.verify(mfaToken, JWT_SECRET);
    } catch (jwtError) {
      return errorResponse('Invalid MFA token', 401);
    }

    if (typeof decoded === 'string' || decoded.purpose !== 'mfa_verification') {
      return errorResponse('Invalid MFA token', 401);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        business: true,
        role: true,
        mfaSettings: true
      }
    });

    if (!user) {
      return errorResponse('User not found', 401);
    }

    // Verify OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email: user.email,
        type: 'LOGIN_2FA',
        otp
      }
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return errorResponse('Invalid or expired OTP', 401);
    }

    // Clean up used OTP
    await prisma.oTP.delete({
      where: { id: otpRecord.id }
    });

    // Generate final tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Create auth session
    const session = await prisma.authSession.create({
      data: {
        userId: user.id,
        sessionToken: accessToken,
        refreshToken,
        deviceInfo,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      }
    });

    // Update user's last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const { password: _, ...userWithoutPassword } = user;

    const response = successResponse({
      accessToken,
      refreshToken: session.refreshToken,
      sessionId: session.id,
      user: userWithoutPassword
    }, 'MFA verification successful');

    // Set cookies
    const refreshCookie = setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const sessionCookie = setCookie('sessionToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    response.headers.set('Set-Cookie', [refreshCookie, sessionCookie].join(', '));

    return response;

  } catch (error) {
    console.error('MFA verification error:', error);
    return errorResponse('Internal server error', 500);
  }
};

// Token generation helpers
function generateAccessToken(user: any) {
  return jwt.sign(
    {
      userId: user.id,
      businessId: user.businessId,
      email: user.email,
      role: user.role?.name || 'User',
      permissions: user.role?.permissions || [],
      type: 'access_token'
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function generateRefreshToken(user: any) {
  return jwt.sign(
    {
      userId: user.id,
      type: 'refresh_token'
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}
