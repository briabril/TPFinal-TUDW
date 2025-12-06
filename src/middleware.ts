import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export const config = {
  matcher: [
    "/feed/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/dashboard/:path*",
    "/reports/:path*",
    "/users/:path*",
  ]
};

const ADMIN_PATHS = ["/dashboard", "/reports", "/users"];
const AUTH_PATHS = ["/feed", "/profile", "/settings"];

function normalize(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

function pathMatchesAny(path: string, list: string[]) {
  return list.some((p) => path === p || path.startsWith(`${p}/`));
}

export default async function middleware(req: NextRequest) {
  const path = normalize(req.nextUrl.pathname);

  const requiresAdmin = pathMatchesAny(path, ADMIN_PATHS);
  const requiresAuth = pathMatchesAny(path, AUTH_PATHS);

  if (!requiresAdmin && !requiresAuth) return NextResponse.next();

  const token = req.cookies.get("token");
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    //  Internal fetch compatible con Vercel Edge
    const url = req.nextUrl.clone();
    url.pathname = "/api/auth/me-proxy";

    const backendResp = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: req.cookies.toString(),
      },
      cache: "no-store",
    });

    if (!backendResp.ok) throw new Error("Unauthorized");

    const me = await backendResp.json();

    if (requiresAdmin && me.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}



