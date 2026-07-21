import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "InnerJ",
    template: "%s | InnerJ"
  },
  description: "Publish, customize, and save prompts."
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
