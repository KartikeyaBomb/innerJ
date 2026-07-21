import { NextResponse } from "next/server";
import { createSessionToken, expiredSessionCookie, getSessionUser, sessionCookie } from "@/lib/auth";
import { setDefaultProvider } from "@/db/queries";

export async function GET() {
  return NextResponse.json({ user: await getSessionUser() });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(expiredSessionCookie());
  return response;
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = (await request.json()) as { defaultProvider?: string };
  if (!body.defaultProvider || !["chatgpt", "claude", "gemini", "perplexity"].includes(body.defaultProvider)) {
    return NextResponse.json({ error: "Invalid provider." }, { status: 400 });
  }
  const user = await setDefaultProvider(session.id, body.defaultProvider as typeof session.defaultProvider);
  const response = NextResponse.json({ user });
  response.cookies.set(sessionCookie(await createSessionToken(user)));
  return response;
}
