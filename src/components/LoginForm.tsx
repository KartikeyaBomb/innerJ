"use client";

import { useSearchParams } from "next/navigation";

export function LoginForm() {
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next");
  const destination = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";
  const error = searchParams.get("error");
  const errorMessages: Record<string, string> = {
    config: "Google sign-in has not been configured on this server.",
    state: "The sign-in request expired or its security check failed. Please try again.",
    token: "Google rejected the callback. Check the client secret and authorized redirect URI.",
    identity: "Google did not return a verified email address for this account.",
    callback: "Google sign-in could not be verified. Check the server log for details."
  };

  return (
    <div className="auth-form">
      {error ? <p className="form-error">{errorMessages[error] ?? "Google sign-in did not complete. Please try again."}</p> : null}
      <a className="button google-button button-wide" href={`/api/auth/google?next=${encodeURIComponent(destination)}`}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.3h5.4a4.6 4.6 0 0 1-2 3v2.8h3.3c1.9-1.8 2.9-4.4 2.9-7.9Z" />
          <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.7c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.8A10.1 10.1 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.5 13.8A6 6 0 0 1 6.2 12c0-.6.1-1.2.3-1.8V7.4H3.1A10 10 0 0 0 2 12c0 1.7.4 3.2 1.1 4.6l3.4-2.8Z" />
          <path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.8 9.8 0 0 0 12 2a10.1 10.1 0 0 0-8.9 5.4l3.4 2.8A5.9 5.9 0 0 1 12 6.1Z" />
        </svg>
        Continue with Google
      </a>
    </div>
  );
}
