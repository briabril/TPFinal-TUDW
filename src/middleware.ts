// frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import api from "./api/index"
import jwt from "jsonwebtoken";
const ADMIN_PATHS = [
  "/dashboard",
  "/reports",
  "/users",
]

const AUTH_PATHS = [
  "/feed",
  "/profile",
  "/settings"
]

function normalize(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/"
}

function pathMatchesAny(path: string, list: string[]) {
  return list.some((p) => path === p || path.startsWith(`${p}/`))
}

export default function middleware(req: NextRequest) {
  const rawPath = req.nextUrl.pathname;
  const path = normalize(rawPath);

  const requiresAdmin = pathMatchesAny(path, ADMIN_PATHS)
  const requiresAuth = pathMatchesAny(path, AUTH_PATHS)

  if (!requiresAdmin && !requiresAuth) return NextResponse.next();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Si querés validación de rol, podés decodificar JWT directamente:
  if (requiresAdmin) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "");
      if (decoded.role !== "ADMIN") {
        const unauth = req.nextUrl.clone();
        unauth.pathname = "/unauthorized";
        return NextResponse.redirect(unauth);
      }
    } catch {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}
