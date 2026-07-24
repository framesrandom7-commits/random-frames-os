import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/auth";

const publicRoutes = ["/login", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, api webhooks, and next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.includes(".") // Catch-all for files (e.g. .css, .js, .png)
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const session = await verifySession();

  // Redirect to login if not authenticated and trying to access a protected route
  if (!isPublicRoute && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect to home if authenticated and trying to access login
  if (isPublicRoute && session) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard"; // Redirect to a known protected route
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/webhooks (webhook routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api/webhooks|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
