// server.ts
import { Elysia } from "elysia";
import { corsPlugin } from "./src/plugins/cors.plugin";
import { rateLimitPlugin } from "./src/plugins/rateLimit.plugin";
import { authPlugin } from "./src/plugins/auth.plugin";
import { routes } from "./src/routes";
import { logger } from "./src/utils/logger";
import { cookie } from "@elysiajs/cookie";

// Create the app with proper plugin structure
const app = new Elysia()
  .use(rateLimitPlugin)
  .use(corsPlugin)
  .use(
    cookie({
      secret: Bun.env.COOKIE_SECRET,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  )
  .use(authPlugin)
  .use(routes);

// Add route logging
app.on("request", ({ request }) => {
  console.log(`➡️  ${request.method} ${request.url}`);
});

// Show index.html on root path
app.get("/", () => {
  return Bun.file("./index.html");
});

// Health check at root level (bypasses all plugins)
app.get("/health", () => {
  return {
    success: true,
    message: "Root level health check - SERVER IS RUNNING",
    timestamp: new Date().toISOString(),
  };
});


app.get("*", () => {
  return Bun.file("./404.html");
});

logger.info("Server Started");

// Get the actual port
const port = Number(Bun.env.PORT) || 5000;

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📍 Health check URLs:`);
  console.log(`   http://localhost:${port}/health (root level)`);
  console.log(`   http://localhost:${port}/api/health (API level)`);
});
