import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/invite", "/api/auth", "/onboarding", "/api/og"];
const ONBOARDING_PATH = "/onboarding";

const isPublicAsset = (pathname: string) =>
  pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|json|woff2?|css|js)$/);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (
    isPublicAsset(pathname) ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", encodeURI(req.url));
    return NextResponse.redirect(loginUrl);
  }

  if (!session.user.protocolId && pathname !== ONBOARDING_PATH) {
    return NextResponse.redirect(new URL(ONBOARDING_PATH, req.url));
  }

  if (session.user.protocolId && pathname === ONBOARDING_PATH) {
    return NextResponse.redirect(new URL("/overview", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};