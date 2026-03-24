import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");
  const isDashboardPage =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/provider") ||
    nextUrl.pathname.startsWith("/requester") ||
    nextUrl.pathname.startsWith("/squad") ||
    nextUrl.pathname.startsWith("/settings") ||
    nextUrl.pathname.startsWith("/reviews") ||
    nextUrl.pathname.startsWith("/notifications");
  const isAdminPage = nextUrl.pathname.startsWith("/admin");

  if (isAdminPage && (!isLoggedIn || session?.user?.role !== "ADMIN")) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isDashboardPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
