import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

export const corsPlugin = (app: Elysia) =>
  app.use(
    cors({
      origin: (req: Request) => {
        const origin = req.headers.get("origin");
        if (!origin) return false;

        if (origin === "http://localhost:3000") return true;

        const hostname = new URL(origin).hostname;
        return /\.?sendexa\.co$/.test(hostname);
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    })
  );
