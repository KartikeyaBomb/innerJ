"use client";

import { FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CollectionForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    const response = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        description: data.get("description"),
        isPublic: data.get("isPublic") === "on"
      })
    });
    setPending(false);
    if (!response.ok) return;
    form.reset();
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return <button className="button button-primary" onClick={() => setOpen(true)}><FolderPlus size={17} /> New collection</button>;
  }

  return (
    <form className="inline-collection-form" onSubmit={submit}>
      <input name="name" placeholder="Collection name" minLength={2} required />
      <input name="description" placeholder="Optional description" />
      <label className="checkbox-label"><input type="checkbox" name="isPublic" /> Public</label>
      <button className="button button-primary" disabled={pending}>{pending ? "Saving…" : "Create"}</button>
      <button type="button" className="button button-ghost" onClick={() => setOpen(false)}>Cancel</button>
    </form>
  );
}
