import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { findOrCreateUser } from "@/db/queries";
import { createSessionToken, sessionCookie } from "@/lib/auth";

const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const temporaryCookies = [
  "innerj_oauth_state",
  "innerj_oauth_nonce",
  "innerj_oauth_verifier",
  "innerj_oauth_next"
];

function finish(response: NextResponse) {
  for (const name of temporaryCookies) response.cookies.delete(name);
  return response;
}

function loginError(request: NextRequest, reason: string) {
  const loginUrl = new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin);
  loginUrl.searchParams.set("error", reason);
  return finish(NextResponse.redirect(loginUrl));
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");
  const state = request.cookies.get("innerj_oauth_state")?.value;
  const nonce = request.cookies.get("innerj_oauth_nonce")?.value;
  const verifier = request.cookies.get("innerj_oauth_verifier")?.value;
  const destination = request.cookies.get("innerj_oauth_next")?.value ?? "/";

  if (!clientId || !clientSecret || !code || !state || returnedState !== state || !nonce || !verifier) {
    return loginError(request, !clientId || !clientSecret ? "config" : "state");
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const callbackUrl = new URL("/api/auth/google/callback", appUrl).toString();
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
        code_verifier: verifier
      }),
      cache: "no-store"
    });
    if (!tokenResponse.ok) {
      const googleError = await tokenResponse.text();
      console.error("Google token exchange failed", tokenResponse.status, googleError);
      return loginError(request, "token");
    }

    const tokens = (await tokenResponse.json()) as { id_token?: string };
    if (!tokens.id_token) return loginError(request, "token");
    const { payload } = await jwtVerify(tokens.id_token, googleKeys, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId
    });

    if (
      payload.nonce !== nonce ||
      payload.email_verified !== true ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string"
    ) {
      return loginError(request, "identity");
    }

    const user = await findOrCreateUser(
      payload.email,
      payload.name,
      typeof payload.picture === "string" ? payload.picture : null
    );
    const session = await createSessionToken(user);
    const safeDestination = destination.startsWith("/") && !destination.startsWith("//") ? destination : "/";
    const response = NextResponse.redirect(new URL(safeDestination, appUrl));
    response.cookies.set(sessionCookie(session));
    return finish(response);
  } catch (error) {
    console.error("Google OAuth callback failed", error);
    return loginError(request, "callback");
  }
}
