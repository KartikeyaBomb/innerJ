import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "innerj-development-secret-change-me"
);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("innerj_session")?.value;
  let signedIn = false;

  if (token) {
    try {
      await jwtVerify(token, secret);
      signedIn = true;
    } catch {
      signedIn = false;
    }
  }

  if (signedIn) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  const destination = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (destination !== "/") loginUrl.searchParams.set("next", destination);
  const response = NextResponse.redirect(loginUrl);
  if (token) response.cookies.delete("innerj_session");
  return response;
}

export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|icon.svg|favicon.ico).*)"]
};
