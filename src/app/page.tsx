import Link from "next/link";
import { SearchX } from "lucide-react";
import { PromptCard } from "@/components/PromptCard";
import { getFeed } from "@/db/queries";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; tag?: string; community?: string; page?: string }>;
}) {
  const params = await searchParams;
  const session = await getSessionUser();
  const mode = "all" as const;
  const query = params.q?.trim() ?? "";
  const tag = params.tag?.trim() ?? "";
  const community = params.community?.trim() ?? "";
  const page = Math.max(1, Number(params.page ?? 1));
  const prompts = await getFeed({ mode, viewerId: session?.id, query, tag, community, page });

  return (
    <div className="page-container feed-page">
      <section className="feed-panel">
        <div className="feed-header">
          <div>
            <span className="eyebrow">Prompts</span>
            <h2>{query ? `Results for “${query}”` : tag ? `#${tag}` : community || "All prompts"}</h2>
          </div>
        </div>

        <div className="prompt-list">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} signedIn={Boolean(session)} provider={session?.defaultProvider} />
          ))}
        </div>

        {prompts.length === 0 ? (
          <div className="empty-state">
            <SearchX size={34} />
            <h3>No prompts found</h3>
          </div>
        ) : null}

        <div className="pagination">
          {page > 1 ? (
            <Link className="button button-secondary" href={`/?q=${encodeURIComponent(query)}&tag=${encodeURIComponent(tag)}&community=${encodeURIComponent(community)}&page=${page - 1}`}>
              Previous
            </Link>
          ) : <span />}
          {prompts.length === 12 ? (
            <Link className="button button-secondary" href={`/?q=${encodeURIComponent(query)}&tag=${encodeURIComponent(tag)}&community=${encodeURIComponent(community)}&page=${page + 1}`}>
              Next
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
