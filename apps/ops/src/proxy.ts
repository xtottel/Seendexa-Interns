// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/home", "/profile", "/settings", "/api/protected"];
const authRoutes = ["/login"];
const publicRoutes = ["/about", "/contact"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("🔍 Proxy processing:", pathname);

  // ✅ Allow static & image requests
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") // skip files
  ) {
    console.log("📁 Static file request, skipping proxy");
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.includes(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);

  console.log("📊 Route analysis:", {
    pathname,
    isProtectedRoute,
    isAuthRoute,
    isPublicRoute,
  });

  // ✅ Get token from cookies (matching the working example)
  const token =
    request.cookies.get("token")?.value ||
    request.cookies.get("auth_token")?.value;

  console.log("🍪 Token from cookies:", token ? "Present" : "Missing");

  // ✅ For protected routes, verify with backend
  if (isProtectedRoute) {
    console.log("🛡️ Protected route detected, verifying auth...");
    const isAuthenticated = await verifyAuth(token);
    console.log("🔐 Auth verification result:", isAuthenticated);

    if (!isAuthenticated) {
      console.log("❌ Not authenticated, redirecting to login");
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    } else {
      console.log("✅ Authenticated, allowing access to:", pathname);
    }
  }

  // ✅ Prevent logged-in users from visiting login/signup
  if (isAuthRoute && token) {
    console.log("🚫 Auth route detected with token, checking if valid...");
    const isAuthenticated = await verifyAuth(token);
    console.log("🔐 Auth verification result for auth route:", isAuthenticated);

    if (isAuthenticated) {
      console.log("✅ Already authenticated, redirecting to ops");
      return NextResponse.redirect(new URL("/ops", request.url));
    } else {
      console.log("❌ Invalid token, allowing access to auth route");
      // Clear invalid tokens
      const response = NextResponse.next();
      response.cookies.delete("token");
      response.cookies.delete("auth_token");
      return response;
    }
  }

  // ✅ Handle root path - redirect to ops if authenticated, login if not
  if (pathname === "/") {
    console.log("🏠 Root path detected");
    if (token) {
      const isAuthenticated = await verifyAuth(token);
      if (isAuthenticated) {
        console.log("✅ Authenticated at root, redirecting to ops");
        return NextResponse.redirect(new URL("/home", request.url));
      }
    }
    console.log("❌ Not authenticated at root, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ Public routes - always allow
  if (isPublicRoute) {
    console.log("🌐 Public route, allowing access");
    return NextResponse.next();
  }

  console.log("➡️ Allowing request to proceed");
  return NextResponse.next();
}

// 🔒 Verify token with Bun backend
async function verifyAuth(token: string | undefined): Promise<boolean> {
  if (!token) {
    console.log("❌ No token provided for verification");
    return false;
  }

  try {
    console.log("🔐 Verifying token with Bun backend...");
    const bunBackendUrl = process.env.BUN_BACKEND_URL || "http://localhost:5000";
    
    const verifyRes = await fetch(`${bunBackendUrl}/api/auth/validate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📨 Verification response:", {
      status: verifyRes.status,
      statusText: verifyRes.statusText,
      ok: verifyRes.ok,
    });

    if (verifyRes.ok) {
      console.log("✅ Token valid");
      return true;
    } else {
      console.log("❌ Token verification failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Auth verification error:", error);
    return false;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};