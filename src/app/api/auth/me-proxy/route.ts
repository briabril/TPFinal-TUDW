import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const envBackend = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
    const originFallback = req.nextUrl.origin;
    const backendBase = envBackend || originFallback;
    const backendUrl = `${backendBase.replace(/\/$/, "")}/api/auth/me`;

    const backendResp = await fetch(backendUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: req.cookies.toString(),
      },
    });

    const contentType = backendResp.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await backendResp.json();
      return NextResponse.json(data, { status: backendResp.status });
    }

    const text = await backendResp.text();
    return new NextResponse(text, {
      status: backendResp.status,
      headers: { "content-type": contentType || "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Proxy failure" }, { status: 500 });
  }
}
