import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // Redirect root page to auth for unauthenticated users
  if (request.nextUrl.pathname === "/") {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Check if user is trying to access protected routes
  if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/onboarding")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith("/auth") && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/auth/:path*",
  ],
};
