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
        <span className="eyebrow">New prompt</span>
        <h1>Create a prompt</h1>
      </section>
      <PromptComposer communities={communities} />
    </div>
  );
}
