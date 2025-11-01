// controllers/auth/verify-otp.controller.ts
import { prisma } from "@/utils/prisma";
import { OTPService } from "../../lib/otp-service";

export const verifyOTP = async ({ body, jwt, set, cookie }: any) => {
  const { phone, otp } = body;

  if (!phone || !otp) {
    set.status = 400;
    return { message: "Phone and OTP are required" };
  }

  try {
    // Verify OTP with Sendexa Enhanced API
    const result = await OTPService.verifyOTP(phone, otp);

    if (!result.success) {
      set.status = 400;
      return { 
        message: result.message,
        errorType: "OTP_VERIFICATION_FAILED"
      };
    }

    // Get user data
    const user = await prisma.teamMember.findUnique({
      where: { phone },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      set.status = 404;
      return { message: "User not found" };
    }

    // Create access token
    const accessToken = await jwt.sign({
      id: user.id,
      phone: user.phone,
      role: user.role,
      department: user.department.name,
      type: "access"
    });

    // Create refresh token
    const refreshToken = await jwt.sign({
      id: user.id,
      type: "refresh",
    });

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Set refresh token as HTTP-only cookie
    cookie.refresh.set({
      value: refreshToken,
      httpOnly: true,
      secure: Bun.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "strict",
    });

    set.status = 200;
    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      token: accessToken,
    };
  } catch (error: any) {
    console.error("OTP Verification Error:", error);
    
    // Handle specific verification errors
    if (error.message.includes("Invalid OTP")) {
      set.status = 400;
      return { 
        message: "Invalid verification code",
        errorType: "INVALID_OTP"
      };
    }
    
    if (error.message.includes("expired")) {
      set.status = 400;
      return { 
        message: "Verification code has expired",
        errorType: "EXPIRED_OTP"
      };
    }
    
    if (error.message.includes("Maximum validation attempts")) {
      set.status = 400;
      return { 
        message: "Too many failed attempts. Please request a new code.",
        errorType: "MAX_ATTEMPTS_EXCEEDED"
      };
    }

    set.status = 400;
    return { 
      message: error.message || "OTP verification failed",
      errorType: "VERIFICATION_FAILED"
    };
  }
};