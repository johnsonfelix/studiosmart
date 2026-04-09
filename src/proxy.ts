import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const protectedRoutes = {
  admin: "/admin",
  studio: "/studio",
};

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth checking
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/selections") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/gallery") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Auth pages redirect to dashboard if already logged in
  if (pathname === "/login" || pathname === "/register") {
    if (session) {
      const redirectUrl = session.user.role === "ADMIN" ? "/admin" : "/studio";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // Unauthenticated users trying to access protected routes
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access control
  if (pathname.startsWith(protectedRoutes.admin) && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/studio", request.url));
  }

  if (pathname.startsWith(protectedRoutes.studio) && session.user.role !== "STUDIO") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
