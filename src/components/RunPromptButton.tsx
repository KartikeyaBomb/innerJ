"use client";

import { ExternalLink, X } from "lucide-react";
import { useState } from "react";
import type { SessionUser } from "@/types";

const providers = {
  chatgpt: { label: "ChatGPT", url: "https://chatgpt.com/" },
  claude: { label: "Claude", url: "https://claude.ai/new" },
  gemini: { label: "Gemini", url: "https://gemini.google.com/app" },
  perplexity: { label: "Perplexity", url: "https://www.perplexity.ai/" }
} as const;

export function RunPromptButton({ prompt, provider = "chatgpt" }: { prompt: string; provider?: SessionUser["defaultProvider"] }) {
  const [copied, setCopied] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const target = providers[provider];
  const variablePattern = /\{\{\s*([^{}]+?)\s*\}\}/g;
  const variables = Array.from(prompt.matchAll(variablePattern), (match) => match[1].trim())
    .filter((name, index, names) => names.indexOf(name) === index);

  async function launch() {
    const customizedPrompt = prompt.replace(variablePattern, (placeholder, name: string) => values[name.trim()]?.trim() || placeholder);
    await navigator.clipboard.writeText(customizedPrompt);
    setCustomizing(false);
    setCopied(true);
    window.open(target.url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => setCopied(false), 3000);
  }

  return <>
    <button className="button button-primary" onClick={() => variables.length ? setCustomizing(true) : launch()}><ExternalLink size={14} /> {copied ? "Copied — paste it there" : `Run in ${target.label}`}</button>
    {customizing ? <div className="customize-overlay" role="presentation" onMouseDown={() => setCustomizing(false)}>
      <form className="customize-dialog" role="dialog" aria-modal="true" aria-label="Customize prompt" onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); void launch(); }}>
        <div className="customize-heading"><div><span className="eyebrow">Customize prompt</span><h2>Make it yours</h2></div><button type="button" className="icon-button" onClick={() => setCustomizing(false)} aria-label="Close"><X size={17} /></button></div>
        <p>Fill in the reusable parts before opening {target.label}.</p>
        <div className="customize-fields">{variables.map((name) => <label key={name}><code>{name}</code><textarea rows={2} required value={values[name] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} placeholder={`Replace “${name}” with…`} /></label>)}</div>
        <button className="button button-primary button-wide"><ExternalLink size={15} /> Copy and open {target.label}</button>
      </form>
    </div> : null}
  </>;
}
