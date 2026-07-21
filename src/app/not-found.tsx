import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty-state standalone-empty">
      <span className="eyebrow">404</span>
      <h1>That prompt is not here.</h1>
      <p>It may be private, deleted, or the link may be incomplete.</p>
      <Link className="button button-primary" href="/">Return to the feed</Link>
    </div>
  );
}
