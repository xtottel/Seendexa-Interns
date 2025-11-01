import { Elysia } from "elysia";

export const smsRoutes = new Elysia({ prefix: "/sms" })
  .post("/send", "Send SMS")
  .post("/verify", "Verify SMS")
  .post("/resend", "Resend SMS");
