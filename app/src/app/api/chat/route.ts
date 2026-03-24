import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization") || "";

    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "Backend request failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      message: data.message,
      agent: data.agent,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to reach backend";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
