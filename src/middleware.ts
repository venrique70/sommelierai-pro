import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  if (url.pathname.startsWith("/admin/vendedores")) {
    url.pathname = url.pathname.replace("/admin/vendedores", "/admin/vendors");
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/vendedores/:path*"],
};
