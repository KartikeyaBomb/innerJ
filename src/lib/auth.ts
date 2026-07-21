import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/types";

const COOKIE_NAME = "innerj_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "innerj-development-secret-change-me"
);

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    username: user.username,
    name: user.name,
    avatarUrl: user.avatarUrl
    ,defaultProvider: user.defaultProvider
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret);
}

export async function readSessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub || !payload.email || !payload.username || !payload.name) {
      return null;
    }

    return {
      id: payload.sub,
      email: String(payload.email),
      username: String(payload.username),
      name: String(payload.name),
      avatarUrl: payload.avatarUrl ? String(payload.avatarUrl) : null
      ,defaultProvider: (["chatgpt", "claude", "gemini", "perplexity"].includes(String(payload.defaultProvider))
        ? String(payload.defaultProvider)
        : "chatgpt") as SessionUser["defaultProvider"]
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return token ? readSessionToken(token) : null;
}

export function sessionCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  };
}

export function expiredSessionCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  };
}
