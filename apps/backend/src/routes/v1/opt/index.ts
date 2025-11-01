import { Elysia } from "elysia";

export const otpRoutes = new Elysia({ prefix: "/otp" })
  .post("/send", "Send OTP")
  .post("/verify", "Verify OTP");
