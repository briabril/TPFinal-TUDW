import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  const hasCookie = req.cookies.get("token");
  if (!hasCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const backendResp = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Cookie: req.cookies.toString(), 
        },
      }
    );

    if (!backendResp.ok) throw new Error("Unauthorized");

    const me = await backendResp.json();

    if (requiresAdmin && me.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
