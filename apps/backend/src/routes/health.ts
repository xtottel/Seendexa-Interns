// src/routes/health.ts
import { Elysia } from "elysia";
import { healthCheck } from "../controllers/health/health.controller";

export const healthRoutes = new Elysia({ prefix: "/api/health" })
  .get("/", (ctx) => healthCheck(ctx))
  .get("/live", (ctx) => healthCheck(ctx))
  .get("/ready", (ctx) => healthCheck(ctx));