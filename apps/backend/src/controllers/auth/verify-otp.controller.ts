// controllers/auth/verify-otp.controller.ts
import { prisma } from "@/utils/prisma";
import { OTPService } from "../../lib/otp-service";
// In your verify-otp.controller.ts - add debug logs
export const verifyOTP = async ({ body, jwt, set, cookie }: any) => {
  const { phone, otp } = body;

  console.log("🔐 OTP Verification Request:", { phone, otp });

  if (!phone || !otp) {
    set.status = 400;
    return { message: "Phone and OTP are required" };
  }

  try {
    // Verify OTP with Sendexa Enhanced API
    const result = await OTPService.verifyOTP(phone, otp);
    console.log("📞 OTP Service Result:", result);

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

    console.log("👤 User found:", user);

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

    console.log("🎫 Access Token Created:", accessToken ? "Yes" : "No");

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

    console.log("✅ Login successful, returning response");

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
      token: accessToken, // Make sure this is included!
    };
  } catch (error: any) {
    console.error("❌ OTP Verification Error:", error);
    // ... rest of your error handling
  }
};