// controllers/auth/index.ts
import { requestOTP } from "./request-otp.controller";
import { verifyOTP } from "./verify-otp.controller";
import { resendOTP } from "./resend-otp.controller";
import { refresh } from "./refresh.controller";
import { logout } from "./logout.controller";

export const authController = {
  requestOTP,
  verifyOTP,
  resendOTP,
  refresh,
  logout,
};