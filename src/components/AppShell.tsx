import type { ReactNode } from "react";
import type { SessionUser } from "@/types";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { getCommunityStats } from "@/db/queries";

export async function AppShell({ user, children }: { user: SessionUser | null; children: ReactNode }) {
  const communities = await getCommunityStats();
  return (
    <>
      <Header user={user} />
      <div className="shell">
        <Sidebar user={user} communities={communities} />
        <main className="main-content">{children}</main>
      </div>
    </>
  );
}
