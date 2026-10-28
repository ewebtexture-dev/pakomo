import { NextResponse } from "next/server";

export function middleware(request) {
  const adminCookie = request.cookies.get("pakmoo_session");

  if (!adminCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // The admin layout and every admin API validate the session in the database.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
