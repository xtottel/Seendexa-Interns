// controllers/auth/refresh.controller.ts
import { prisma } from "@/utils/prisma";

export const refresh = async ({ jwt, cookie, set }: any) => {
  const refreshToken = cookie.refresh;

  if (!refreshToken) {
    set.status = 401;
    return { message: "Missing refresh token" };
  }

  try {
    // Verify refresh token
    const payload = await jwt.verify(refreshToken);
    if (!payload || payload.type !== "refresh") {
      throw new Error("Invalid refresh token");
    }

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Clean up expired token
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      set.status = 403;
      return { message: "Refresh token expired" };
    }

    // Create new access token
    const newAccessToken = await jwt.sign({
      id: storedToken.user.id,
      phone: storedToken.user.phone,
      role: storedToken.user.role,
      type: "access"
    });

    set.status = 200;
    return {
      message: "Token refreshed",
      token: newAccessToken,
    };
  } catch {
    set.status = 403;
    return { message: "Invalid refresh token" };
  }
};