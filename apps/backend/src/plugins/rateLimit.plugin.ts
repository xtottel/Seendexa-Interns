import { Elysia } from "elysia";
import { rateLimit } from "elysia-rate-limit";

export const rateLimitPlugin = (app: Elysia) =>
  app.use(
    rateLimit({
      duration: 60_000, // 1 minute
      max: 100, // 100 requests per IP
      errorResponse: "Too many requests. Slow down a bit.",
    })
  );
