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

  // Público
  if (!requiresAdmin && !requiresAuth) return NextResponse.next();

  const token = req.cookies.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // App Router internal API 
    const proxyUrl = `${req.nextUrl.origin}/api/auth/me-proxy`;

    const backendResp = await fetch(proxyUrl, {
      method: "GET",
      headers: {
        Cookie: req.cookies.toString(),
      },
    });

    if (!backendResp.ok) {
      let bodyText = "";
      try {
        const ct = backendResp.headers.get("content-type") || "";
        bodyText = ct.includes("application/json") ? JSON.stringify(await backendResp.json()) : await backendResp.text();
      } catch (e) {
        bodyText = "(failed to read body)";
      }
      console.warn("Auth proxy returned non-ok:", backendResp.status, bodyText);
      throw new Error("Unauthorized");
    }

    const me = await backendResp.json();

    if (requiresAdmin && me.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}


