import { NextResponse } from "next/server";
import { createPrompt, getFeed, type FeedMode } from "@/db/queries";
import { getSessionUser } from "@/lib/auth";
import { bumpContentVersion, cacheGet, cacheSet, getContentVersion } from "@/lib/cache";
import { normalizeTags } from "@/lib/utils";
import { createPromptSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const session = await getSessionUser();
  const safeMode: FeedMode = "all";
  const query = url.searchParams.get("q") ?? "";
  const tag = url.searchParams.get("tag") ?? "";
  const community = url.searchParams.get("community") ?? "";
  const page = Number(url.searchParams.get("page") ?? 1);
  const version = await getContentVersion();
  const cacheKey = `innerj:v${version}:feed:${safeMode}:${session?.id ?? "guest"}:${query}:${tag}:${community}:${page}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  const prompts = await getFeed({
    mode: safeMode,
    viewerId: session?.id,
    query,
    tag,
    community,
    page
  });
  const payload = { prompts, page, hasMore: prompts.length === 12 };
  await cacheSet(cacheKey, payload, 45);
  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const parsed = createPromptSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Prompt validation failed.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const suppliedTags = normalizeTags(parsed.data.tags);
  const tags = normalizeTags(suppliedTags);

  const promptId = await createPrompt({
    authorId: session.id,
    title: parsed.data.title,
    description: parsed.data.description,
    content: parsed.data.content,
    community: parsed.data.community,
    model: parsed.data.model,
    tags
  });

  await bumpContentVersion();
  return NextResponse.json({ id: promptId }, { status: 201 });
}
