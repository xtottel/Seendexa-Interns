// src/routes/clients/index.ts
import { Elysia, t } from "elysia";
import { clientsController } from "../controllers/clients";

export const clientsRoutes = new Elysia({ prefix: "/api/clients" })
  // Get client statistics
  .get("/stats", (ctx) => clientsController.getStats(ctx))
  
  // Get all clients with pagination and filters
  .get("/", (ctx) => clientsController.getAll(ctx), {
    query: t.Object({
      search: t.Optional(t.String()),
      status: t.Optional(t.String({ default: "all" })),
      page: t.Optional(t.Numeric({ default: 1 })),
      limit: t.Optional(t.Numeric({ default: 10 }))
    })
  })
  
  // Get specific client by ID
  .get("/:id", (ctx) => clientsController.getById(ctx), {
    params: t.Object({
      id: t.String()
    })
  })
  
  // Update client status (only isActive since no status field)
  .patch("/:id/status", (ctx) => clientsController.updateStatus(ctx), {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      isActive: t.Optional(t.Boolean())
    })
  })
  
  // Get client transactions with pagination
  .get("/:id/transactions", (ctx) => clientsController.getTransactions(ctx), {
    params: t.Object({
      id: t.String()
    }),
    query: t.Object({
      page: t.Optional(t.Numeric({ default: 1 })),
      limit: t.Optional(t.Numeric({ default: 15 }))
    })
  });