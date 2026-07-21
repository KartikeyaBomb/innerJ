"use client";

import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import type { SessionUser } from "@/types";

export function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState(user.defaultProvider);

  async function changeProvider(value: SessionUser["defaultProvider"]) {
    setProvider(value);
    await fetch("/api/auth/session", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ defaultProvider: value }) });
    router.refresh();
  }

  async function logout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="user-menu">
      <button
        className="avatar-button account-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open profile menu"
        aria-expanded={open}
      >
        <Avatar name={user.name} image={user.avatarUrl} size="sm" />
        <span className="account-trigger-copy">
          <strong>{user.name}</strong>
          <small>@{user.username}</small>
        </span>
        <ChevronDown className="account-chevron" size={14} />
      </button>
      {open ? (
        <div className="user-popover">
          <div className="user-popover-header">
            <strong>{user.name}</strong>
            <span>@{user.username}</span>
          </div>
          <a href={`/profile/${user.username}`}><UserRound size={15} /> View profile</a>
          <label className="provider-setting">Run prompts with
            <select value={provider} onChange={(event) => changeProvider(event.target.value as SessionUser["defaultProvider"])}>
              <option value="chatgpt">ChatGPT</option><option value="claude">Claude</option><option value="gemini">Gemini</option><option value="perplexity">Perplexity</option>
            </select>
          </label>
          <button onClick={logout}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
