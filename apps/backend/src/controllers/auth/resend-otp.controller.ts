// controllers/auth/resend-otp.controller.ts
import { OTPService } from "../../lib/otp-service";

export const resendOTP = async ({ body, set }: any) => {
  const { phone } = body;

  if (!phone) {
    set.status = 400;
    return { message: "Phone number is required" };
  }

  try {
    const result = await OTPService.resendOTP(phone);
    
    set.status = 200;
    return {
      success: true,
      message: "OTP resent successfully",
      data: result.data
    };
  } catch (error: any) {
    console.error("OTP Resend Error:", error);
    
    if (error.message.includes("wait before requesting")) {
      set.status = 429;
      return { 
        message: "Please wait before requesting a new code",
        errorType: "RESEND_COOLDOWN"
      };
    }
    
    set.status = 500;
    return { 
      message: error.message || "Failed to resend OTP",
      errorType: "RESEND_FAILED"
    };
  }
};