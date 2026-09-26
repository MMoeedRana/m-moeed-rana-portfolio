import { NextResponse, type NextRequest } from "next/server";
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname !== "/admin/login" && !req.cookies.get("admin_session"))
    return NextResponse.redirect(new URL("/admin/login", req.url));
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
