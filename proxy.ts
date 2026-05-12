import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/app/lib/session";

const PUBLIC_ROUTES = ["/", "/login"];
const AUTH_ROUTES = ["/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r);
  const isOnboarding = pathname === "/onboarding";

  // Allow static files and Next internals through unconditionally
  const token = req.cookies.get("orp_session")?.value;
  const session = await decrypt(token);
  const isLoggedIn = !!session?.userId;

  // Already logged-in users hitting login/onboarding → send to dashboard
  if (isLoggedIn && (isAuthRoute || isOnboarding)) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Unauthenticated users hitting protected routes → send to login
  if (!isLoggedIn && !isPublic && !isOnboarding) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:ico|png|svg|jpg|jpeg|webp)$).*)"],
};
