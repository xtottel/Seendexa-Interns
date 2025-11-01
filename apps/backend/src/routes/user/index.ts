// routes/user.routes.ts
import { Elysia, t } from "elysia";
import { authPlugin } from "@/plugins/auth.plugin";
import { getProfile } from "@/controllers/user/profile.controller";
import { updateProfile } from "@/controllers/user/profile.controller";
import { updatePassword } from "@/controllers/user/password.controller";

export const userRoutes = new Elysia({ prefix: "/api/user" })
  .use(authPlugin) // ✅ Apply auth middleware
  .get("/profile", getProfile)
  .put("/profile", updateProfile)
  .put("/change-password", updatePassword, {
    body: t.Object({
      oldPassword: t.String(),
      newPassword: t.String(),
    }),
  });
