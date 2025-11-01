import { Elysia } from "elysia";
import { corsPlugin } from "./src/plugins/cors.plugin";
import { rateLimitPlugin } from "./src/plugins/rateLimit.plugin";
import { authPlugin } from "./src/plugins/auth.plugin";
import { routes } from "./src/routes";
import { logger } from "./src/utils/logger";
import { cookie } from "@elysiajs/cookie";

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

  // Show index.html on root path
  app.get("/", () => {
    return Bun.file("./index.html");
  });

app.listen(Number(Bun.env.PORT) || 5000);
const PORT = Number(Bun.env.PORT) || 5000;
logger.info("Server started");

console.log(`🚀 Sendexa API running on http://localhost:${PORT}`);
