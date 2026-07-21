import { redirect } from "next/navigation";
import { PromptComposer } from "@/components/PromptComposer";
import { getSessionUser } from "@/lib/auth";
import { getCommunities } from "@/db/queries";

export const metadata = { title: "Share a prompt" };

export default async function NewPromptPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login?next=/new");
  const communities = await getCommunities();

  return (
    <div className="page-container narrow-page">
      <section className="page-heading">
        <span className="eyebrow">Create</span>
        <h1>Share a reusable prompt</h1>
        <p>Give the community enough context to understand where it works, how to use it, and what to improve.</p>
      </section>
      <PromptComposer communities={communities} />
    </div>
  );
}
