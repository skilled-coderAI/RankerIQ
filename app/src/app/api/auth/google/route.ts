import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ error: "Missing credential" }, { status: 400 });
    }

    const tokenInfoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );

    if (!tokenInfoRes.ok) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
    }

    const tokenInfo = await tokenInfoRes.json();
    const { email, name, sub } = tokenInfo as {
      email?: string;
      name?: string;
      sub?: string;
    };

    if (!email || !sub) {
      return NextResponse.json({ error: "Missing token fields" }, { status: 401 });
    }

    const derivedPassword = `gauth_${sub}`;
    const displayName = name || email.split("@")[0];

    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: derivedPassword }),
    }).catch(() => null);

    if (loginRes && loginRes.ok) {
      const data = await loginRes.json();
      return NextResponse.json(data);
    }

    const signupRes = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: displayName,
        email,
        password: derivedPassword,
        role: "student",
        grade: 9,
        board: "CBSE",
      }),
    }).catch(() => null);

    if (signupRes && signupRes.ok) {
      const data = await signupRes.json();
      return NextResponse.json(data);
    }

    const syntheticUser = {
      id: `google_${sub}`,
      name: displayName,
      email,
      role: "student",
      grade: 9,
      board: "CBSE",
      avatar_initials: displayName[0].toUpperCase(),
    };

    const tokenPayload = Buffer.from(JSON.stringify(syntheticUser)).toString("base64");
    const syntheticToken = `google.${tokenPayload}.v1`;

    return NextResponse.json({ user: syntheticUser, token: syntheticToken });
  } catch (err) {
    console.error("Google auth error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
