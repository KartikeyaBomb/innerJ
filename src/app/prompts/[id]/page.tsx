import Link from "next/link";
import { isSamplePrompt, samplePrompts } from "@/lib/sample-prompts";
import { MessageCircle, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { CommentForm } from "@/components/CommentForm";
import { CopyButton } from "@/components/CopyButton";
import { SaveButton } from "@/components/SaveButton";
import { RunPromptButton } from "@/components/RunPromptButton";
import { getComments, getPromptById } from "@/db/queries";
import { getSessionUser } from "@/lib/auth";
import { formatRelativeDate } from "@/lib/utils";

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionUser();
  const sample = isSamplePrompt(id);
  if (sample && !session) notFound();
  const [prompt, comments] = sample
    ? [samplePrompts.find((item) => item.id === id), []]
    : await Promise.all([
        getPromptById(id, session?.id),
        getComments(id)
      ]);
  if (!prompt) notFound();

  return (
    <div className="page-container prompt-detail-page">
      <article className="prompt-detail-card">
        <div className="detail-author-row">
          {sample ? <span className="author-line"><Avatar name={prompt.authorName} image={prompt.authorAvatarUrl} /><strong>{prompt.authorName}</strong></span> : (
            <Link href={`/profile/${prompt.authorUsername}`} className="author-line">
              <Avatar name={prompt.authorName} image={prompt.authorAvatarUrl} />
              <span><strong>{prompt.authorName}</strong><small>@{prompt.authorUsername}</small></span>
            </Link>
          )}
          <span className="muted">{sample ? "Sample prompt" : `Published ${formatRelativeDate(prompt.createdAt)}`}</span>
        </div>

        <div className="detail-title-row">
          <div>
            <div className="prompt-tags">
              {prompt.tags.map((tag) => <Link href={`/?tag=${tag}`} key={tag}>#{tag}</Link>)}
            </div>
            <h1>{prompt.title}</h1>
            <p>{prompt.description}</p>
          </div>
          {!sample ? <SaveButton promptId={prompt.id} initialSaved={prompt.isSaved} signedIn={Boolean(session)} /> : null}
        </div>

        <div className="prompt-code-block">
          <div className="prompt-code-header">
            <span><Sparkles size={15} /> {prompt.model}</span>
            <div className="prompt-code-actions"><CopyButton value={prompt.content} label="Copy prompt" /><RunPromptButton prompt={prompt.content} provider={session?.defaultProvider} /></div>
          </div>
          <pre>{prompt.content}</pre>
        </div>

        <div className="detail-stats-row">
          <span><MessageCircle size={17} /> {prompt.commentCount} comments</span>
        </div>
      </article>

      <section className="discussion" id="discussion">
        <div className="section-heading">
          <div><span className="eyebrow">Comments</span><h2>Discussion</h2></div>
          <MessageCircle size={21} />
        </div>
        {sample ? <p className="feed-notice">This is a sample prompt. Copy it or try it with your AI provider.</p> : session ? <CommentForm promptId={prompt.id} /> : <p className="feed-notice">Sign in to join the discussion.</p>}
        <div className="comment-list">
          {comments.map((comment) => (
            <article className="comment" key={comment.id}>
              <Avatar name={comment.authorName} image={comment.authorAvatarUrl} size="sm" />
              <div><div className="comment-meta"><strong>{comment.authorName}</strong><span>@{comment.authorUsername}</span><span>·</span><span>{formatRelativeDate(comment.createdAt)}</span></div><p>{comment.body}</p></div>
            </article>
          ))}
          {comments.length === 0 ? <div className="empty-discussion">No comments.</div> : null}
        </div>
      </section>
    </div>
  );
}
