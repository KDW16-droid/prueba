import { NextResponse } from "next/server";
import { authenticateDemo, createSession, SESSION_COOKIE } from "../../../../lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const account = authenticateDemo(email, password);

  if (!account) return NextResponse.json({ error: "Credenciales no válidas." }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSession(account), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: body?.remember ? 60 * 60 * 8 : undefined,
  });
  return response;
}
