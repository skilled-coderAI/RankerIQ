import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

async function proxyAuth(request: NextRequest, path: string[]) {
  const endpoint = path.join("/");
  const authHeader = request.headers.get("authorization") || "";
  const contentType = request.headers.get("content-type") || "";

  const headers: Record<string, string> = {
    "Content-Type": contentType || "application/json",
  };
  if (authHeader) headers["Authorization"] = authHeader;

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/${endpoint}`, init);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to reach backend";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyAuth(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyAuth(request, path);
}
