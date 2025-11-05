// src/routes/sender-ids/index.ts
import { Elysia, t } from "elysia";
import { senderIdsController } from "../controllers/sender-ids";

export const senderIdsRoutes = new Elysia({ prefix: "/api/sender-ids" })
  // Stats overview
  .get("/stats/overview", (ctx) => senderIdsController.getStats(ctx))
  
  // Get all sender IDs with pagination and filters
  .get("/", (ctx) => senderIdsController.getAll(ctx), {
    query: t.Object({
      status: t.Optional(t.String()),
      search: t.Optional(t.String()),
      page: t.Optional(t.Numeric({ default: 1 })),
      limit: t.Optional(t.Numeric({ default: 10 }))
    })
  })
  
  // Get specific sender ID
  .get("/:id", (ctx) => senderIdsController.getById(ctx), {
    params: t.Object({
      id: t.String()
    })
  })
  
  // Approve sender ID
  .post("/:id/approve", (ctx) => senderIdsController.approve(ctx), {
    params: t.Object({
      id: t.String()
    })
  })
  
  // Reject sender ID
  .post("/:id/reject", (ctx) => senderIdsController.reject(ctx), {
    params: t.Object({
      id: t.String()
    })
  });