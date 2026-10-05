import type { PromptFeedItem } from "@/types";

const examples = [
  {
    slug: "a-kind-message", authorName: "Maya Chen", authorUsername: "maya-c", community: "Everyday Life", title: "Find the words for a kind message",
    description: "For when you know what you feel, but not quite how to say it.",
    content: "Help me write a short, thoughtful message to {{person}} about {{situation}}. Keep it warm and natural, like something I would actually send. Please avoid making it overly formal or dramatic.",
    tags: ["relationships", "writing"], model: "ChatGPT"
  },
  {
    slug: "learn-something-new", authorName: "Leo Martin", authorUsername: "leo-m", community: "Learning", title: "Explain it like we’re having a conversation",
    description: "A friendly starting point for something you have always wondered about.",
    content: "I want to understand {{topic}}. Explain it in plain language with one example from everyday life. Then ask me a simple question so we can talk through it together.",
    tags: ["learning", "curiosity"], model: "ChatGPT"
  },
  {
    slug: "a-calmer-day", authorName: "Aisha Patel", authorUsername: "aisha-p", community: "Everyday Life", title: "Make a little room in my day",
    description: "A gentle plan for a day that feels a bit too full.",
    content: "Here is what I have on my mind today: {{tasks}}. Help me pick a few things that matter most and make a realistic plan. Include time to eat, take breaks, and leave something for tomorrow if needed.",
    tags: ["planning", "balance"], model: "ChatGPT"
  },
  {
    slug: "tell-a-small-story", authorName: "Sam Rivera", authorUsername: "sam-r", community: "Writing", title: "Turn a small memory into a story",
    description: "You do not need a big adventure to have a story worth telling.",
    content: "Help me turn this memory into a short personal story: {{memory}}. Keep the details honest and the language simple. Ask me about anything you need rather than inventing what happened.",
    tags: ["writing", "storytelling"], model: "Claude"
  },
  {
    slug: "something-to-make", authorName: "Nora Kim", authorUsername: "nora-k", community: "Creativity", title: "Make something just for the fun of it",
    description: "A few small ideas for an afternoon without a big project.",
    content: "I have {{time}} and these things available: {{materials}}. Suggest three easy creative things I could make or try. Keep them playful, inexpensive, and doable without being an expert.",
    tags: ["creativity", "hobbies"], model: "ChatGPT"
  },
  {
    slug: "a-small-coding-step", authorName: "Eli Brooks", authorUsername: "eli-b", community: "Coding", title: "Help me take the next small step",
    description: "A patient coding partner when you are not sure where to start.",
    content: "I am trying to build {{idea}}, and I know {{experience}}. Help me choose one small thing to do first. Explain it simply, show a short example, and let me try before moving on.",
    tags: ["coding", "beginners"], model: "Claude"
  },
  {
    "slug": "easy-dinner",
    "authorName": "Owen Reed",
    "authorUsername": "owen-r",
    "community": "Everyday Life",
    "title": "Figure out dinner with what I have",
    "description": "A little help for the end of a long day.",
    "content": "I have {{ingredients}} and about {{time}} to cook. Suggest two simple dinners using mostly what I already have. Include clear steps and ask about dietary needs before suggesting a recipe.",
    "tags": [
      "cooking",
      "everyday"
    ],
    "model": "ChatGPT"
  },
  {
    "slug": "catch-up",
    "authorName": "Zoe Ellis",
    "authorUsername": "zoe-e",
    "community": "Everyday Life",
    "title": "Reach out to an old friend",
    "description": "Start a conversation without making it awkward.",
    "content": "Help me write a casual message to a friend I have not spoken to in {{time}}. We used to {{shared_memory}}. Keep it short and warm, without putting pressure on them to reply.",
    "tags": [
      "friendship",
      "writing"
    ],
    "model": "ChatGPT"
  },
  {
    "slug": "weekend-outside",
    "authorName": "Finn Hayes",
    "authorUsername": "finn-h",
    "community": "Everyday Life",
    "title": "Plan a low-key weekend",
    "description": "A few ideas that leave room to do nothing.",
    "content": "Help me plan a relaxed weekend around {{place}}. I enjoy {{interests}} and want to spend about {{budget}}. Suggest a mix of time outside, something enjoyable, and rest. Ask before assuming opening hours or travel details.",
    "tags": [
      "weekend",
      "planning"
    ],
    "model": "ChatGPT"
  },
  {
    "slug": "tidy-a-corner",
    "authorName": "Lena Park",
    "authorUsername": "lena-p",
    "community": "Everyday Life",
    "title": "Start with one messy corner",
    "description": "Make tidying feel a little less overwhelming.",
    "content": "I want to tidy {{space}}, but I only have {{minutes}} minutes. Give me three small steps to get started. Keep it manageable and do not suggest buying storage supplies.",
    "tags": [
      "home",
      "small-steps"
    ],
    "model": "ChatGPT"
  },
  {
    "slug": "end-of-day",
    "authorName": "Aria West",
    "authorUsername": "aria-w",
    "community": "Everyday Life",
    "title": "Look back on today",
    "description": "A quiet moment to notice the good and the hard.",
    "content": "Help me reflect on my day. Ask me one gentle question at a time about what went well, what felt difficult, and what I want to carry into tomorrow. Do not rush to give advice.",
    "tags": [
      "reflection",
      "journaling"
    ],
    "model": "ChatGPT"
  },
  {
    "slug": "practice-a-language",
    "authorName": "Mateo Cruz",
    "authorUsername": "mateo-c",
    "community": "Learning",
    "title": "Practice a few words in another language",
    "description": "A short conversation at your own pace.",
    "content": "Have a simple conversation with me in {{language}} about {{topic}}. I am a beginner. Use short sentences, explain unfamiliar words, and gently correct one mistake at a time. Wait for my reply after each question.",
    "tags": [
      "languages",
      "practice"
    ],
    "model": "ChatGPT"
  },
  {
    "slug": "reading-companion",
    "authorName": "Iris Bell",
    "authorUsername": "iris-b",
    "community": "Learning",
    "title": "Think a little more about what I read",
    "description": "Talk through a passage without feeling tested.",
    "content": "Here is a passage I just read: {{passage}}. Help me understand the main idea in plain language. Then ask one open question about what I think. Keep our conversation focused on the passage.",
    "tags": [
      "reading",
      "curiosity"
    ],
    "model": "ChatGPT"
  },
  {
    "slug": "small-study-session",
    "authorName": "Theo Lane",
    "authorUsername": "theo-l",
    "community": "Learning",
    "title": "Study for twenty minutes",
    "description": "A small session is still a good start.",
    "content": "Help me spend twenty minutes learning {{topic}}. Break the time into a short explanation, a small practice task, and a quick recap. Keep it suited to my level: {{level}}.",
    "tags": [
      "study",
      "learning"
    ],
    "model": "ChatGPT"
  },
  {
    "slug": "say-thank-you",
    "authorName": "Ruby Stone",
    "authorUsername": "ruby-s",
    "community": "Writing",
    "title": "Write a thank-you that feels like me",
    "description": "Name the little things that meant something.",
    "content": "Help me write a thank-you note to {{person}} for {{what_they_did}}. What meant most to me was {{detail}}. Keep it sincere, specific, and short.",
    "tags": [
      "gratitude",
      "writing"
    ],
    "model": "ChatGPT"
  },
  {
    "slug": "clearer-email",
    "authorName": "Jules Hart",
    "authorUsername": "jules-h",
    "community": "Writing",
    "title": "Make this email easier to read",
    "description": "Say what you need without sounding stiff.",
    "content": "Help me make this email clear and friendly: {{draft}}. Keep my meaning, shorten it where helpful, and make the next step easy to understand. Do not add promises or facts I have not included.",
    "tags": [
      "email",
      "editing"
    ],
    "model": "ChatGPT"
  },
  {
    "slug": "first-journal-page",
    "authorName": "Amara Cole",
    "authorUsername": "amara-c",
    "community": "Writing",
    "title": "Start a journal entry",
    "description": "You can begin with a few honest sentences.",
    "content": "I want to write in my journal about {{topic}}, but I am not sure how to begin. Offer three simple opening questions. Let me choose one, then help me explore my own thoughts without writing the entry for me.",
    "tags": [
      "journaling",
      "reflection"
    ],
    "model": "ChatGPT"
  },
  {
    "slug": "little-photo-walk",
    "authorName": "Kai Morgan",
    "authorUsername": "kai-m",
    "community": "Creativity",
    "title": "Take a small photo walk",
    "description": "Notice something new in a familiar place.",
    "content": "Suggest five things I could look for and photograph on a walk around {{place}}. I am using my phone. Focus on noticing light, colors, and everyday details rather than special equipment.",
    "tags": [
      "photography",
      "creativity"
    ],
    "model": "ChatGPT"
  },
  {
    "slug": "draw-for-ten-minutes",
    "authorName": "Hazel Fox",
    "authorUsername": "hazel-f",
    "community": "Creativity",
    "title": "Draw something imperfect",
    "description": "A tiny creative break with no pressure to be good.",
    "content": "Give me three easy drawing ideas based on {{things_around_me}}. I have ten minutes and {{materials}}. Help me enjoy the process without worrying about making a polished picture.",
    "tags": [
      "drawing",
      "hobbies"
    ],
    "model": "ChatGPT"
  },
  {
    "slug": "understand-a-snippet",
    "authorName": "Noah Quinn",
    "authorUsername": "noah-q",
    "community": "Coding",
    "title": "Walk me through this little bit of code",
    "description": "Understand what is happening, one step at a time.",
    "content": "Explain this code in plain language: {{code}}. I am still learning {{language}}. Tell me what it does, walk through a small example, and ask one question to check my understanding.",
    "tags": [
      "coding",
      "beginners"
    ],
    "model": "ChatGPT"
  }
];

export const samplePrompts: PromptFeedItem[] = examples.map((example) => ({
  ...example,
  id: `sample-${example.slug}`,
  createdAt: "2026-10-04T12:00:00.000Z",
  authorId: `sample-user-${example.authorUsername}`,
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
