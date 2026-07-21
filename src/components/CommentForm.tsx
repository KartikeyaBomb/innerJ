"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CommentForm({ promptId }: { promptId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setError("");
    const response = await fetch(`/api/prompts/${promptId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: data.get("body") })
    });
    setPending(false);
    if (!response.ok) {
      setError("Unable to post comment.");
      return;
    }
    form.reset();
    router.refresh();
  }

  return (
    <form className="comment-form" onSubmit={submit}>
      <textarea name="body" minLength={2} maxLength={2000} required rows={3} placeholder="Share an improvement, use case, or result…" />
      <div className="comment-form-footer">
        {error ? <span className="form-error">{error}</span> : <span />}
        <button className="button button-primary" disabled={pending}>{pending ? "Posting…" : <><Send size={15} /> Post</>}</button>
      </div>
    </form>
  );
}
