import Link from "next/link";
import { Bookmark, Compass, Library, Sparkles } from "lucide-react";
import type { SessionUser } from "@/types";

export function Sidebar({
  user,
  communities
}: {
  user: SessionUser | null;
  communities: Array<{ name: string; promptCount: number }>;
}) {
  return (
    <aside className="sidebar">
      <nav className="side-nav" aria-label="Primary">
        <Link href="/"><Compass size={18} /> All prompts</Link>
        <Link href={user ? "/collections" : "/login"}><Library size={18} /> Collections</Link>
        <Link href={user ? `/profile/${user.username}` : "/login"}><Bookmark size={18} /> My prompts</Link>
      </nav>

      <div className="sidebar-section">
        <div className="sidebar-label"><Sparkles size={14} /> communities</div>
        <div className="tag-stack">
          {communities.map((community) => (
            <Link href={`/?community=${encodeURIComponent(community.name)}`} key={community.name}>
              <span>{community.name}</span><small>{community.promptCount}</small>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
