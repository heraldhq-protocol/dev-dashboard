import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/invite", "/api/auth"];
const ONBOARDING_PATH = "/onboarding";

const isPublicAsset = (pathname: string) => 
  pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|json|woff2?|css|js)$/);

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow public paths, static assets, and images
    if (
      isPublicAsset(pathname) ||
      PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon")
    ) {
      return NextResponse.next();
    }

    // Authenticated but no protocolId → redirect to onboarding
    // (unless they're already on the onboarding page)
    if (!token?.protocolId && pathname !== ONBOARDING_PATH) {
      return NextResponse.redirect(new URL(ONBOARDING_PATH, req.url));
    }

    // Has protocolId but trying to access onboarding → redirect to dashboard
    if (token?.protocolId && pathname === ONBOARDING_PATH) {
      return NextResponse.redirect(new URL("/overview", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        // Public routes explicitly bypass token requirement
        if (
          isPublicAsset(pathname) ||
          PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon")
        ) {
          return true;
        }
        // Protect all other routes
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
