"use client";

import { Braces } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

export function PromptComposer({ communities }: { communities: string[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  function detectSelection() {
    const editor = editorRef.current;
    if (!editor || editor.selectionStart === editor.selectionEnd) {
      setSelection(null);
      return;
    }
    const selected = editor.value.slice(editor.selectionStart, editor.selectionEnd).trim();
    setSelection(selected && !selected.includes("{{") && !selected.includes("}}")
      ? { start: editor.selectionStart, end: editor.selectionEnd }
      : null);
  }

  function makeCustomizable() {
    if (!selection) return;
    const selectedText = content.slice(selection.start, selection.end);
    const leading = selectedText.match(/^\s*/)?.[0] ?? "";
    const trailing = selectedText.match(/\s*$/)?.[0] ?? "";
    const name = selectedText.trim();
    const replacement = `${leading}{{${name}}}${trailing}`;
    setContent(`${content.slice(0, selection.start)}${replacement}${content.slice(selection.end)}`);
    setSelection(null);
    requestAnimationFrame(() => editorRef.current?.focus());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const tags = String(form.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const response = await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        content: form.get("content"),
        community: form.get("community"),
        model: form.get("model"),
        tags
      })
    });
    setPending(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Unable to publish prompt.");
      return;
    }

    const data = (await response.json()) as { id: string };
    router.push(`/prompts/${data.id}`);
    router.refresh();
  }

  return (
    <form className="composer" onSubmit={submit}>
      <div className="form-grid two-column">
        <label>
          Title
          <input name="title" minLength={5} maxLength={120} required placeholder="Prompt title" />
        </label>
        <label>
          Model used
          <select name="model" required>
            <option>Model agnostic</option>
            <optgroup label="OpenAI"><option>GPT-5.4</option><option>GPT-5.4 mini</option><option>GPT-5.4 nano</option></optgroup>
            <optgroup label="Anthropic"><option>Claude Opus 4.6</option><option>Claude Sonnet 4.6</option><option>Claude Haiku 4.5</option></optgroup>
            <optgroup label="Google"><option>Gemini 3.1 Pro</option><option>Gemini 3.5 Flash</option><option>Gemini 3.1 Flash-Lite</option></optgroup>
          </select>
        </label>
      </div>

      <label>
        Description
        <textarea name="description" minLength={10} maxLength={320} required rows={3} placeholder="What does this prompt do?" />
      </label>

      <label>
        Prompt
        <div className="prompt-editor-wrap">
          <textarea ref={editorRef} className="prompt-editor" name="content" minLength={20} required rows={15} value={content} onChange={(event) => { setContent(event.target.value); setSelection(null); }} onSelect={detectSelection} onMouseUp={detectSelection} onKeyUp={detectSelection} placeholder="Write the complete prompt, then highlight anything people should customize." />
          {selection ? <button type="button" className="selection-action" onMouseDown={(event) => event.preventDefault()} onClick={makeCustomizable}><Braces size={14} /> Make customizable</button> : null}
        </div>
        <span className="field-help">Highlight a word or phrase and choose <strong>Make customizable</strong>. InnerJ marks it as a variable and asks each user for their own value when they click Run.</span>
      </label>

      <div className="form-grid two-column">
        <label>
          Community
          <input name="community" list="community-options" required minLength={2} maxLength={48} placeholder="Choose or enter a community" />
          <datalist id="community-options">{communities.map((community) => <option value={community} key={community} />)}</datalist>
          <span className="field-help">Select a community or enter a new one.</span>
        </label>
        <label>
          Tags <span className="muted">(comma separated)</span>
          <input name="tags" placeholder="typescript, debugging, code-review" />
        </label>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      <div className="composer-actions">
        <button className="button button-primary" disabled={pending}>
          {pending ? "Publishing…" : "Publish prompt"}
        </button>
      </div>
    </form>
  );
}
