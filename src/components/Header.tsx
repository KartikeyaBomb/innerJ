import Link from "next/link";
import { Plus, Search } from "lucide-react";
import type { SessionUser } from "@/types";
import { UserMenu } from "@/components/UserMenu";

export function Header({ user }: { user: SessionUser | null }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="InnerJ home">
          <span className="brand-mark">ij</span>
          <span>innerj<span className="brand-dot">.</span></span>
        </Link>

        <form className="global-search" action="/" method="GET">
          <Search size={17} />
          <input name="q"  aria-label="Search prompts" />
        </form>

        <nav className="header-actions" aria-label="Account">
          <Link href={user ? "/new" : "/login"} className="button button-primary header-create">
            <Plus size={17} />
            <span>post</span>
          </Link>
          {user ? <UserMenu user={user} /> : <Link href="/login" className="button button-ghost">Sign in</Link>}
        </nav>
      </div>
    </header>
  );
}
