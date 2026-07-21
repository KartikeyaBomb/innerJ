import { FolderOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { CollectionForm } from "@/components/CollectionForm";
import { PromptCard } from "@/components/PromptCard";
import { getCollectionPrompts } from "@/db/queries";
import { getSessionUser } from "@/lib/auth";

export const metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login?next=/collections");
  const collections = await getCollectionPrompts(session.id);

  return (
    <div className="page-container">
      <section className="page-heading heading-with-action">
        <div><span className="eyebrow">Library</span><h1>Your collections</h1><p>Organize prompts by project, role, workflow, or experiment.</p></div>
        <CollectionForm />
      </section>

      <div className="collection-list">
        {collections.map((collection) => (
          <section className="collection-section" key={collection.id}>
            <div className="collection-heading">
              <div><h2>{collection.name}</h2><p>{collection.description || "No description"}</p></div>
              <span>{collection.promptCount} prompts · {collection.isPublic ? "Public" : "Private"}</span>
            </div>
            <div className="prompt-list compact-list">
              {collection.prompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} signedIn provider={session.defaultProvider} />)}
            </div>
            {collection.prompts.length === 0 ? <div className="collection-empty"><FolderOpen size={24} /> Save a prompt to add it here.</div> : null}
          </section>
        ))}
      </div>

      {collections.length === 0 ? (
        <div className="empty-state"><FolderOpen size={34} /><h3>No collections yet</h3></div>
      ) : null}
    </div>
  );
}
