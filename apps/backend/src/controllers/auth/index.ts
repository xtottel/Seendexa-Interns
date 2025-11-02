// controllers/auth/index.ts
import { login } from "./login.controller";
import { refresh } from "./refresh.controller";
import { logout, logoutAllSessions, logoutSession } from "./logout.controller";


export const authController = {
  login,
  refresh,
  logout,
  logoutAllSessions,
  logoutSession,
};