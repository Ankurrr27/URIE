import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_PATHS = ["/dashboard", "/editor", "/latex", "/ats", "/settings"];

// Routes accessible only when NOT authenticated
const AUTH_PATHS = ["/login", "/signup"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname.startsWith(p));
}

function isAuthPage(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname.startsWith(p));
}

function hasSession(req: NextRequest): boolean {
  return (
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token") ||
    // legacy next-auth cookie names (keep for cookie migration period)
    req.cookies.has("next-auth.session-token") ||
    req.cookies.has("__Secure-next-auth.session-token")
  );
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authenticated = hasSession(req);

  // Redirect unauthenticated users away from protected pages
  if (isProtected(pathname) && !authenticated) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/signup
  if (isAuthPage(pathname) && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public assets (png, svg, jpg, …)
     * - API routes handled by their own auth checks
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
