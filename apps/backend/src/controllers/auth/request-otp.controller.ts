// controllers/auth/request-otp.controller.ts
import { prisma } from "@/utils/prisma";
import { OTPService } from "../../lib/otp-service";

export const requestOTP = async ({ body, set }: any) => {
  const { phone } = body;

  if (!phone) {
    set.status = 400;
    return { message: "Phone number is required" };
  }

  try {
    // Check if user exists
    const user = await prisma.teamMember.findUnique({
      where: { phone },
      select: { 
        id: true, 
        isActive: true, 
        fullName: true,
        phone: true,
        role: true 
      },
    });

    if (!user) {
      set.status = 404;
      return { message: "No account found with this phone number" };
    }

    if (!user.isActive) {
      set.status = 403;
      return { message: "Account is deactivated" };
    }

    // Send OTP via Sendexa Enhanced API
    const result = await OTPService.sendOTP(phone, {
      userId: user.id,
      userRole: user.role,
      userName: user.fullName
    });

    set.status = 200;
    return {
      success: true,
      message: "OTP sent successfully",
      data: result.data
    };
  } catch (error: any) {
    console.error("OTP Request Error:", error);
    
    // Handle specific Sendexa errors
    if (error.message.includes("active OTP already exists")) {
      set.status = 429;
      return { 
        message: "An OTP was recently sent. Please wait before requesting a new one.",
        errorType: "OTP_ALREADY_ACTIVE"
      };
    }
    
    if (error.message.includes("Sender ID")) {
      set.status = 400;
      return { 
        message: "Service configuration error. Please contact support.",
        errorType: "SENDER_ID_ERROR"
      };
    }

    set.status = 500;
    return { 
      message: error.message || "Failed to send OTP",
      errorType: "SEND_OTP_FAILED"
    };
  }
};