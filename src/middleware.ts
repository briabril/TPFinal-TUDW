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
  const rawPath = req.nextUrl.pathname;
  const path = normalize(rawPath);

  const requiresAdmin = pathMatchesAny(path, ADMIN_PATHS);
  const requiresAuth = pathMatchesAny(path, AUTH_PATHS);

  if (!requiresAdmin && !requiresAuth) return NextResponse.next();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ADMIN
  if (requiresAdmin) {
    try {
      const backendResp = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
        {
          headers: {
            Cookie: `token=${token}`,
          },
        }
      );

      if (!backendResp.ok) throw new Error("Unauthorized");

      const me = await backendResp.json();
      if (me.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}
