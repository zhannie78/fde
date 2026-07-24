import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, getSessionCookieValue, isValidPassword } from "@/lib/admin-auth";
import { checkAdminLoginRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const allowed = await checkAdminLoginRateLimit(getClientIp(request));

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts — please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const sessionValue = getSessionCookieValue();

  if (!sessionValue) {
    console.error("Admin login failed: ADMIN_SESSION_SECRET not configured.");
    return NextResponse.json({ error: "Admin login is not configured." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
