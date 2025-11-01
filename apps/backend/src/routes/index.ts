import { Elysia } from "elysia";
import { authRoutes } from "./auth";
import { userRoutes } from "./user";
import { v1Routes } from "./v1";

export const routes = new Elysia()
  // define routes
  .use(authRoutes)
  .use(userRoutes)
  .use(v1Routes);
// .get("/", () => "Welcome to the API");
