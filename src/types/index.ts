export type SessionUser = {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  defaultProvider: "chatgpt" | "claude" | "gemini" | "perplexity";
};

export type PromptFeedItem = {
  id: string;
  title: string;
  description: string;
  content: string;
  community: string;
  model: string;
  useCount: number;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  score: number;
  commentCount: number;
  userVote: number;
  isSaved: boolean;
  tags: string[];
};

export type PromptComment = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
};

export type CollectionItem = {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  promptCount: number;
  createdAt: string;
};
