import type { PromptFeedItem } from "@/types";

const examples = [
  {
    slug: "a-kind-message", community: "Everyday Life", title: "Find the words for a kind message",
    description: "For when you know what you feel, but not quite how to say it.",
    content: "Help me write a short, thoughtful message to {{person}} about {{situation}}. Keep it warm and natural, like something I would actually send. Please avoid making it overly formal or dramatic.",
    tags: ["relationships", "writing"], model: "ChatGPT"
  },
  {
    slug: "learn-something-new", community: "Learning", title: "Explain it like we’re having a conversation",
    description: "A friendly starting point for something you have always wondered about.",
    content: "I want to understand {{topic}}. Explain it in plain language with one example from everyday life. Then ask me a simple question so we can talk through it together.",
    tags: ["learning", "curiosity"], model: "ChatGPT"
  },
  {
    slug: "a-calmer-day", community: "Everyday Life", title: "Make a little room in my day",
    description: "A gentle plan for a day that feels a bit too full.",
    content: "Here is what I have on my mind today: {{tasks}}. Help me pick a few things that matter most and make a realistic plan. Include time to eat, take breaks, and leave something for tomorrow if needed.",
    tags: ["planning", "balance"], model: "ChatGPT"
  },
  {
    slug: "tell-a-small-story", community: "Writing", title: "Turn a small memory into a story",
    description: "You do not need a big adventure to have a story worth telling.",
    content: "Help me turn this memory into a short personal story: {{memory}}. Keep the details honest and the language simple. Ask me about anything you need rather than inventing what happened.",
    tags: ["writing", "storytelling"], model: "Claude"
  },
  {
    slug: "something-to-make", community: "Creativity", title: "Make something just for the fun of it",
    description: "A few small ideas for an afternoon without a big project.",
    content: "I have {{time}} and these things available: {{materials}}. Suggest three easy creative things I could make or try. Keep them playful, inexpensive, and doable without being an expert.",
    tags: ["creativity", "hobbies"], model: "ChatGPT"
  },
  {
    slug: "a-small-coding-step", community: "Coding", title: "Help me take the next small step",
    description: "A patient coding partner when you are not sure where to start.",
    content: "I am trying to build {{idea}}, and I know {{experience}}. Help me choose one small thing to do first. Explain it simply, show a short example, and let me try before moving on.",
    tags: ["coding", "beginners"], model: "Claude"
  }
];

export const samplePrompts: PromptFeedItem[] = examples.map((example) => ({
  ...example,
  id: `sample-${example.slug}`,
  createdAt: "2026-10-04T12:00:00.000Z",
  authorId: "sample-innerj",
  authorName: "InnerJ Examples",
  authorUsername: "innerj-examples",
  authorAvatarUrl: null,
  useCount: 0, score: 0, commentCount: 0, userVote: 0, isSaved: false
}));

export function isSamplePrompt(id: string) {
  return id.startsWith("sample-");
}

export function getSampleFeed({ query = "", tag = "", community = "", page = 1 }: {
  query?: string; tag?: string; community?: string; page?: number;
} = {}) {
  if (page !== 1) return [];
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return samplePrompts.filter((prompt) =>
    (!community || prompt.community.toLowerCase() === community.toLowerCase()) &&
    (!tag || prompt.tags.includes(tag.toLowerCase())) &&
    terms.every((term) => `${prompt.title} ${prompt.description} ${prompt.content} ${prompt.tags.join(" ")}`.toLowerCase().includes(term))
  );
}

export function withSampleCommunities(communities: Array<{ name: string; promptCount: number }>) {
  const merged = new Map(communities.map((community) => [community.name.toLowerCase(), { ...community }]));
  for (const prompt of samplePrompts) {
    const key = prompt.community.toLowerCase();
    const existing = merged.get(key);
    if (existing) existing.promptCount += 1;
    else merged.set(key, { name: prompt.community, promptCount: 1 });
  }
  return Array.from(merged.values());
}
