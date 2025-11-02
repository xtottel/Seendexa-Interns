// Entry point for the Sendexa Backend API
import { apiRoutes } from "./src/routes/api";

const server = Bun.serve({
  port: process.env.PORT || 5000,
  fetch(req) {
    return apiRoutes(req);
  },
});

console.log(`🚀 Sendexa API running on http://localhost:${server.port}`);