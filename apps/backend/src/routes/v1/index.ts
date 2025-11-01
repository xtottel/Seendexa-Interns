import { Elysia } from "elysia";
import { smsRoutes } from "./sms";
import { otpRoutes } from "./opt";

export const v1Routes = new Elysia({ prefix: "/api/v1" })
  // define routes
  .use(smsRoutes)
  .use(otpRoutes);
