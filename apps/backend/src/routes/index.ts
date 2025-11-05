// src/routes/index.ts
import { Elysia } from "elysia";
import { authRoutes } from "./auth";
import { userRoutes } from "./user";
import { senderIdsRoutes } from "./sender-ids"; // Make sure this import exists
import { healthRoutes } from "./health"; // Add this import
import { clientsRoutes } from "./clients"; // Ensure clientsRoutes is imported

export const routes = new Elysia()
  .use(authRoutes)
  .use(userRoutes) 
  .use(senderIdsRoutes) // Make sure this line is present
  .use(healthRoutes) // Add this line
  .use(clientsRoutes) // Ensure clientsRoutes is used
