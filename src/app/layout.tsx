import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "InnerJ — Prompt engineering community",
    template: "%s | InnerJ"
  },
  description: "Share, customize, discuss, and collect high-quality AI prompts."
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  return (
    <html lang="en">
      <body>
        {user ? <AppShell user={user}>{children}</AppShell> : children}
      </body>
    </html>
  );
}
