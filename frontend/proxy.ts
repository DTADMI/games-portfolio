import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Migrated from legacy middleware.ts. This proxy runs early at the edge and
// enforces an auth-first flow while allowing public assets and auth endpoints.
// See: https://nextjs.org/docs/messages/middleware-to-proxy

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth",
  "/api/stripe",
  "/_next",
  "/favicon.ico",
  "/images",
  "/sounds",
  "/public",
];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Read NextAuth cookies (dev and secure variants)
  const hasSession = Boolean(
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value,
  );

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/health|_next/static|_next/image|favicon.ico|assets).*)"],
};
