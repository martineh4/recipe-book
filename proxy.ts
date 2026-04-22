import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/favorites"];

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (!protectedRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Better Auth stores the session token in this cookie
  const sessionToken = req.cookies.get("better-auth.session_token")?.value;
  if (!sessionToken) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
