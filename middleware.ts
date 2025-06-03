import { type NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes that don't need auth
  const { pathname } = request.nextUrl;

  // Skip for static assets, public files, and public API routes
  if (pathname.startsWith("/_next/") || pathname.includes(".") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // Apply session management for all other routes
  try {
    return await updateSession(request);
  } catch (error) {
    console.error("Middleware error:", error);

    // For API routes, return JSON error
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ data: null, error: "Authentication middleware failed" }, { status: 500 });
    }

    // For pages, redirect to error page
    return NextResponse.redirect(new URL("/error", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml (public files)
     * - Static assets (.svg, .png, .jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
