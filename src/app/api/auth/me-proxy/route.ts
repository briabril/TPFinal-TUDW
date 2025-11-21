import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`;

    const backendResp = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
      },
    });

    const data = await backendResp.json();

    return NextResponse.json(data, { status: backendResp.status });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Proxy failure" }, { status: 500 });
  }
}
