// frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export default async function middleware(req: NextRequest) {
  const apiUrl = process.env.API_URL || "http://localhost:4000/api";
  const rawPath = req.nextUrl.pathname;
  const path = normalize(rawPath);

  const requiresAdmin = pathMatchesAny(path, ADMIN_PATHS)
  const requiresAuth = pathMatchesAny(path, AUTH_PATHS)

  // si la ruta no requiere auth/admin no se hace la validacion
  if (!requiresAdmin && !requiresAuth) {
    return NextResponse.next();
  }
  // si no hay token redirige al login
  const token = req.cookies.get("token")?.value || null;
  if (!token) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = "/login"
    return NextResponse.redirect(loginUrl)
  }

  // si hay token se consulta al backend por el usuario
  try {
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })

    if (!res.ok) {
      //token invalido/expirado -> redirige al login
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = "/login"
      return NextResponse.redirect(loginUrl)
    }

    const user = await res.json()

    //si el usuario no tiene rol ADMIN, redirige a unauthorized
    if (requiresAdmin && user.role !== "ADMIN") {
      const unauth = req.nextUrl.clone();
      unauth.pathname = "/unauthorized";
      return NextResponse.redirect(unauth);
    }
  } catch (err) {
    // error en fetch -> redirigir al home
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/reports/:path*",
    "/users/:path*",
    "/auth/:path*",
    "/feed/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
}