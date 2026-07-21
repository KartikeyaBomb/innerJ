"use client";

import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SaveButton({ promptId, initialSaved, signedIn }: { promptId: string; initialSaved: boolean; signedIn: boolean }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (!signedIn) {
      router.push("/login");
      return;
    }
    if (pending) return;
    setPending(true);
    const response = await fetch(`/api/prompts/${promptId}/save`, { method: "POST" });
    setPending(false);
    if (!response.ok) return;
    const data = (await response.json()) as { saved: boolean };
    setSaved(data.saved);
    router.refresh();
  }

  return (
    <button className={`icon-button ${saved ? "saved" : ""}`} onClick={toggle} disabled={pending} aria-label={saved ? "Remove from saved" : "Save prompt"}>
      <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
