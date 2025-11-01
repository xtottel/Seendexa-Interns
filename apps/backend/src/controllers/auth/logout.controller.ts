// controllers/auth/logout.controller.ts
import { prisma } from "@/utils/prisma";

export const logout = async ({ cookie, set }: any) => {
  const refreshToken = cookie.refresh;

  // Delete refresh token from database
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  // Clear refresh token cookie
  cookie.refresh.set({
    value: "",
    httpOnly: true,
    secure: Bun.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // Expire immediately
    sameSite: "strict",
  });

  set.status = 200;
  return { message: "Logged out successfully" };
};