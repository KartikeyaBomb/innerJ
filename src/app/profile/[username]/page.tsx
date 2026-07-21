import { CalendarDays, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { PromptCard } from "@/components/PromptCard";
import { getProfile } from "@/db/queries";
import { getSessionUser } from "@/lib/auth";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [profile, session] = await Promise.all([getProfile(username), getSessionUser()]);
  if (!profile) notFound();

  return (
    <div className="page-container">
      <section className="profile-header">
        <Avatar name={profile.user.name} image={profile.user.avatarUrl} size="lg" />
        <div className="profile-copy">
          <span className="eyebrow">Creator profile</span>
          <h1>{profile.user.name}</h1>
          <span className="profile-username">@{profile.user.username}</span>
          <p>{profile.user.bio || "Building reusable AI workflows on InnerJ."}</p>
          <div className="profile-stats">
            <span><FileText size={16} /> {profile.user.promptCount} prompts</span>
            <span><CalendarDays size={16} /> Joined {new Date(profile.user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
          </div>
        </div>
      </section>

      <section className="feed-panel profile-prompts">
        <div className="feed-header"><div><span className="eyebrow">Published work</span><h2>Prompts</h2></div></div>
        <div className="prompt-list">
          {profile.prompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} signedIn={Boolean(session)} provider={session?.defaultProvider} />)}
        </div>
      </section>
    </div>
  );
}
