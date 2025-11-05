// src/routes/finance/index.ts - UPDATED
import { Elysia, t } from "elysia";
import { financeController } from "../controllers/finance";

export const financeRoutes = new Elysia({ prefix: "/api/finance" })
  // Overview endpoints
  .get("/overview", (ctx) => financeController.getFinanceOverview(ctx), {
    query: t.Object({
      range: t.Optional(t.String({ default: "month" }))
    })
  })
  .get("/recent-transactions", (ctx) => financeController.getRecentTransactions(ctx), {
    query: t.Object({
      limit: t.Optional(t.Numeric({ default: 5 }))
    })
  })
  .get("/top-clients", (ctx) => financeController.getTopClients(ctx), {
    query: t.Object({
      limit: t.Optional(t.Numeric({ default: 5 }))
    })
  })
  
  // Invoices endpoints
  .get("/invoices", (ctx) => financeController.getInvoices(ctx), {
    query: t.Object({
      search: t.Optional(t.String()),
      status: t.Optional(t.String({ default: "all" })),
      page: t.Optional(t.Numeric({ default: 1 })),
      limit: t.Optional(t.Numeric({ default: 10 }))
    })
  })
  .get("/invoices/stats", (ctx) => financeController.getInvoiceStats(ctx))
  .patch("/invoices/:id/cancel", (ctx) => financeController.cancelInvoice(ctx), {
    params: t.Object({
      id: t.String()
    })
  })
  
  // Transactions endpoints
  .get("/transactions", (ctx) => financeController.getTransactions(ctx), {
    query: t.Object({
      search: t.Optional(t.String()),
      type: t.Optional(t.String({ default: "all" })),
      status: t.Optional(t.String({ default: "all" })),
      page: t.Optional(t.Numeric({ default: 1 })),
      limit: t.Optional(t.Numeric({ default: 15 }))
    })
  })
  .get("/transactions/stats", (ctx) => financeController.getTransactionStats(ctx))
  
  // Client Balances endpoints
  .get("/balances", (ctx) => financeController.getClientBalances(ctx), {
    query: t.Object({
      search: t.Optional(t.String()),
      status: t.Optional(t.String({ default: "all" })),
      balance: t.Optional(t.String({ default: "all" })),
      page: t.Optional(t.Numeric({ default: 1 })),
      limit: t.Optional(t.Numeric({ default: 10 }))
    })
  })
  .get("/balances/stats", (ctx) => financeController.getBalanceStats(ctx));