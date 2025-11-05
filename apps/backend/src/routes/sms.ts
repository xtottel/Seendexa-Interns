// src/routes/sms/index.ts
import { Elysia, t } from "elysia";
import { smsController } from "../controllers/sms";

export const smsRoutes = new Elysia({ prefix: "/api/sms" })
  // SMS History endpoints
  .get("/history", (ctx) => smsController.getSmsHistory(ctx), {
    query: t.Object({
      search: t.Optional(t.String()),
      status: t.Optional(t.String({ default: "all" })),
      type: t.Optional(t.String({ default: "all" })),
      page: t.Optional(t.Numeric({ default: 1 })),
      limit: t.Optional(t.Numeric({ default: 15 }))
    })
  })
  .get("/history/stats", (ctx) => smsController.getSmsStats(ctx))
  
  // Bulk Sends endpoints
  .get("/bulk-sends", (ctx) => smsController.getBulkSends(ctx), {
    query: t.Object({
      search: t.Optional(t.String()),
      status: t.Optional(t.String({ default: "all" })),
      page: t.Optional(t.Numeric({ default: 1 })),
      limit: t.Optional(t.Numeric({ default: 10 }))
    })
  })
  .get("/bulk-sends/stats", (ctx) => smsController.getBulkSendStats(ctx))
  
  // Analytics endpoints
  .get("/analytics/overview", (ctx) => smsController.getSmsOverview(ctx), {
    query: t.Object({
      range: t.Optional(t.String({ default: "month" }))
    })
  })
  .get("/analytics/network-distribution", (ctx) => smsController.getNetworkDistribution(ctx), {
    query: t.Object({
      range: t.Optional(t.String({ default: "month" }))
    })
  });