// plugins/auth.plugin.ts
import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authPlugin = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET!,
      exp: "2d", // Access token expiry
    })
  )
  .use(
    jwt({
      name: "refreshJwt",
      secret: Bun.env.JWT_SECRET!, // Use same secret for simplicity
      exp: "7d", // Refresh token expiry
    })
  )
  .derive(async (ctx) => {
    const token = ctx.request.headers
      .get("Authorization")
      ?.replace("Bearer ", "");
    
    let user = null;
    if (token) {
      try {
        user = await ctx.jwt.verify(token);
      } catch (error) {
        // Token is invalid or expired, user remains null
        user = null;
      }
    }

    return {
      user,
    };
  });
