import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSupabaseSession } from "@/utils/supabase/middleware";

export default async function middleware(request: NextRequest) {
  const supabaseResponse = await updateSupabaseSession(request);
  const isProtected = request.nextUrl.pathname.startsWith("/dashboard");
  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token") ||
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token");

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"]
};
