// routes/auth/index.ts
import { Elysia, t } from "elysia";
import { authController } from "../controllers/auth";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  // OTP Login routes
  .post("/request-otp", (ctx) => authController.requestOTP(ctx), {
    body: t.Object({
      phone: t.String({ minLength: 10 }),
    }),
  })
  .post("/verify-otp", (ctx) => authController.verifyOTP(ctx), {
    body: t.Object({
      phone: t.String({ minLength: 10 }),
      otp: t.String({ minLength: 4, maxLength: 10 }),
    }),
  })
  .post("/resend-otp", (ctx) => authController.resendOTP(ctx), {
    body: t.Object({
      phone: t.String({ minLength: 10 }),
    }),
  })
  // Token management
  .get("/refresh", (ctx) => authController.refresh(ctx))
  .post("/logout", (ctx) => authController.logout(ctx))
  // Token validation
  .post("/validate", (ctx) => authController.validate(ctx));