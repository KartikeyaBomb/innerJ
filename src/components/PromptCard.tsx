import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";
import type { PromptFeedItem, SessionUser } from "@/types";
import { Avatar } from "@/components/Avatar";
import { RunPromptButton } from "@/components/RunPromptButton";
import { SaveButton } from "@/components/SaveButton";
import { formatRelativeDate } from "@/lib/utils";

export function PromptCard({
  prompt,
  signedIn,
  provider
}: {
  prompt: PromptFeedItem;
  signedIn: boolean;
  provider?: SessionUser["defaultProvider"];
}) {
  return (
    <article className="prompt-card">
      <div className="prompt-card-body">
        <div className="prompt-meta">
          <Link href={`/profile/${prompt.authorUsername}`} className="author-line">
            <Avatar name={prompt.authorName} image={prompt.authorAvatarUrl} size="sm" />
            <span>{prompt.authorName}</span>
          </Link>
          <span>·</span>
          <span>{formatRelativeDate(prompt.createdAt)}</span>
          <span>in {prompt.community}</span>
        </div>

        <Link href={`/prompts/${prompt.id}`} className="prompt-title-link">
          <h2>{prompt.title}</h2>
        </Link>
        <p className="prompt-description">{prompt.description}</p>
        <pre className="prompt-preview">{prompt.content}</pre>

        <div className="prompt-tags">
          {prompt.tags.map((tag) => (
            <Link key={tag} href={`/?tag=${tag}`}>#{tag}</Link>
          ))}
        </div>

        <div className="prompt-card-footer">
          <div className="prompt-stats">
            <Link href={`/prompts/${prompt.id}#discussion`}><MessageCircle size={16} /> {prompt.commentCount}</Link>
            <RunPromptButton prompt={prompt.content} provider={provider} />
            <span><Sparkles size={15} /> {prompt.model}</span>
          </div>
          <SaveButton promptId={prompt.id} initialSaved={prompt.isSaved} signedIn={signedIn} />
        </div>
      </div>
    </article>
  );
}
