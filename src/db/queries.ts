import { sql } from "@/db";
import type { CollectionItem, PromptComment, PromptFeedItem, SessionUser } from "@/types";

export type FeedMode = "for-you" | "all";

type UserRow = {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  defaultProvider: SessionUser["defaultProvider"];
};

type CountRow = { count: number };

type PromptRow = Omit<PromptFeedItem, "tags"> & { tags: string[] | null };

export async function getCommunities(): Promise<string[]> {
  const rows = await sql<Array<{ community: string }>>`
    SELECT community
    FROM prompts
    WHERE visibility = 'public'
    GROUP BY community
    ORDER BY COUNT(*) DESC, community ASC
  `;
  return rows.map((row) => row.community);
}

export async function getCommunityStats(limit = 8): Promise<Array<{ name: string; promptCount: number }>> {
  return sql<Array<{ name: string; promptCount: number }>>`
    SELECT community AS name, COUNT(*)::int AS prompt_count
    FROM prompts
    WHERE visibility = 'public'
    GROUP BY community
    ORDER BY prompt_count DESC, community ASC
    LIMIT ${Math.min(20, Math.max(1, limit))}
  `;
}

export async function findOrCreateUser(
  email: string,
  preferredName?: string,
  avatarUrl?: string | null
): Promise<SessionUser> {
  const existing = await sql<UserRow[]>`
    SELECT id, email, username, name, avatar_url, default_provider
    FROM users
    WHERE email = ${email.toLowerCase()}
    LIMIT 1
  `;
  if (existing[0]) {
    const updated = await sql<UserRow[]>`
      UPDATE users
      SET
        name = COALESCE(NULLIF(${preferredName?.trim() ?? ""}, ''), name),
        avatar_url = COALESCE(${avatarUrl ?? null}, avatar_url),
        updated_at = NOW()
      WHERE id = ${existing[0].id}::uuid
      RETURNING id, email, username, name, avatar_url, default_provider
    `;
    return updated[0] ?? existing[0];
  }

  const localPart = email.split("@")[0] ?? "member";
  const base = localPart
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28) || "member";

  let username = base;
  for (let suffix = 1; suffix < 100; suffix += 1) {
    const rows = await sql<CountRow[]>`
      SELECT COUNT(*)::int AS count FROM users WHERE username = ${username}
    `;
    if (rows[0]?.count === 0) break;
    username = `${base}-${suffix + 1}`;
  }

  const name = preferredName?.trim() || localPart.replace(/[._-]+/g, " ");
  const inserted = await sql<UserRow[]>`
    INSERT INTO users (email, username, name, avatar_url)
    VALUES (${email.toLowerCase()}, ${username}, ${name}, ${avatarUrl ?? null})
    RETURNING id, email, username, name, avatar_url, default_provider
  `;

  if (!inserted[0]) throw new Error("Unable to create user");
  return inserted[0];
}

export async function setDefaultProvider(userId: string, provider: SessionUser["defaultProvider"]): Promise<SessionUser> {
  const rows = await sql<UserRow[]>`
    UPDATE users SET default_provider = ${provider}, updated_at = NOW()
    WHERE id = ${userId}::uuid
    RETURNING id, email, username, name, avatar_url, default_provider
  `;
  if (!rows[0]) throw new Error("User not found");
  return rows[0];
}

export async function getFeed(options: {
  mode: FeedMode;
  viewerId?: string | null;
  query?: string;
  tag?: string;
  community?: string;
  page?: number;
  limit?: number;
}): Promise<PromptFeedItem[]> {
  const mode = options.mode;
  const viewerId = options.viewerId ?? null;
  const query = options.query?.trim() ?? "";
  const tag = options.tag?.trim().toLowerCase() ?? "";
  const community = options.community?.trim() ?? "";
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(30, Math.max(1, options.limit ?? 12));
  const offset = (page - 1) * limit;

  const orderBy = mode === "all"
    ? sql`p.created_at DESC`
    : sql`personal_score DESC, p.created_at DESC`;

  const rows = await sql<PromptRow[]>`
    WITH interests AS (
      SELECT pt.tag_id, COUNT(*)::int AS weight
      FROM collection_prompts cp
      JOIN collections saved_collection ON saved_collection.id = cp.collection_id
      JOIN prompt_tags pt ON pt.prompt_id = cp.prompt_id
      WHERE saved_collection.owner_id = ${viewerId}::uuid
      GROUP BY pt.tag_id
    )
    SELECT
      p.id,
      p.title,
      p.description,
      p.content,
      p.community,
      p.model,
      p.use_count,
      p.created_at,
      u.id AS author_id,
      u.name AS author_name,
      u.username AS author_username,
      u.avatar_url AS author_avatar_url,
      0::int AS score,
      comment_totals.comment_count,
      0::int AS user_vote,
      EXISTS (
        SELECT 1
        FROM collection_prompts cp
        JOIN collections c ON c.id = cp.collection_id
        WHERE cp.prompt_id = p.id AND c.owner_id = ${viewerId}::uuid
      ) AS is_saved,
      tag_totals.tags,
      (
        COALESCE(tag_affinity.affinity, 0) * 4
        + CASE WHEN followed.following_id IS NOT NULL THEN 8 ELSE 0 END
        + GREATEST(0, 10 - EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 86400)
      ) AS personal_score
    FROM prompts p
    JOIN users u ON u.id = p.author_id
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS comment_count
      FROM comments
      WHERE prompt_id = p.id
    ) comment_totals ON TRUE
    LEFT JOIN LATERAL (
      SELECT COALESCE(ARRAY_AGG(t.slug ORDER BY t.slug), ARRAY[]::text[]) AS tags
      FROM prompt_tags pt
      JOIN tags t ON t.id = pt.tag_id
      WHERE pt.prompt_id = p.id
    ) tag_totals ON TRUE
    LEFT JOIN LATERAL (
      SELECT COALESCE(SUM(i.weight), 0)::int AS affinity
      FROM prompt_tags pt
      JOIN interests i ON i.tag_id = pt.tag_id
      WHERE pt.prompt_id = p.id
    ) tag_affinity ON TRUE
    LEFT JOIN follows followed
      ON followed.follower_id = ${viewerId}::uuid AND followed.following_id = p.author_id
    WHERE p.visibility = 'public'
      AND (${community} = '' OR LOWER(p.community) = LOWER(${community}))
      AND (
        ${query} = '' OR
        to_tsvector('english', p.title || ' ' || p.description || ' ' || p.content)
          @@ websearch_to_tsquery('english', ${query})
      )
      AND (
        ${tag} = '' OR EXISTS (
          SELECT 1
          FROM prompt_tags filtered_pt
          JOIN tags filtered_tag ON filtered_tag.id = filtered_pt.tag_id
          WHERE filtered_pt.prompt_id = p.id AND filtered_tag.slug = ${tag}
        )
      )
    ORDER BY ${orderBy}
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return rows.map((row) => ({ ...row, tags: row.tags ?? [] }));
}

export async function getPromptById(id: string, viewerId?: string | null): Promise<PromptFeedItem | null> {
  const rows = await getFeedById(id, viewerId ?? null);
  return rows[0] ?? null;
}

async function getFeedById(id: string, viewerId: string | null): Promise<PromptFeedItem[]> {
  const rows = await sql<PromptRow[]>`
    SELECT
      p.id,
      p.title,
      p.description,
      p.content,
      p.community,
      p.model,
      p.use_count,
      p.created_at,
      u.id AS author_id,
      u.name AS author_name,
      u.username AS author_username,
      u.avatar_url AS author_avatar_url,
      COALESCE((SELECT SUM(value) FROM votes WHERE prompt_id = p.id), 0)::int AS score,
      (SELECT COUNT(*) FROM comments WHERE prompt_id = p.id)::int AS comment_count,
      COALESCE((SELECT value FROM votes WHERE prompt_id = p.id AND user_id = ${viewerId}::uuid), 0)::int AS user_vote,
      EXISTS (
        SELECT 1 FROM collection_prompts cp
        JOIN collections c ON c.id = cp.collection_id
        WHERE cp.prompt_id = p.id AND c.owner_id = ${viewerId}::uuid
      ) AS is_saved,
      COALESCE((
        SELECT ARRAY_AGG(t.slug ORDER BY t.slug)
        FROM prompt_tags pt JOIN tags t ON t.id = pt.tag_id
        WHERE pt.prompt_id = p.id
      ), ARRAY[]::text[]) AS tags
    FROM prompts p
    JOIN users u ON u.id = p.author_id
    WHERE p.id = ${id}::uuid AND (p.visibility = 'public' OR p.author_id = ${viewerId}::uuid)
    LIMIT 1
  `;
  return rows.map((row) => ({ ...row, tags: row.tags ?? [] }));
}

export async function getComments(promptId: string): Promise<PromptComment[]> {
  return sql<PromptComment[]>`
    SELECT
      c.id,
      c.body,
      c.created_at,
      u.name AS author_name,
      u.username AS author_username,
      u.avatar_url AS author_avatar_url
    FROM comments c
    JOIN users u ON u.id = c.author_id
    WHERE c.prompt_id = ${promptId}::uuid
    ORDER BY c.created_at ASC
  `;
}

export async function createPrompt(input: {
  authorId: string;
  title: string;
  description: string;
  content: string;
  community: string;
  model: string;
  tags: string[];
}): Promise<string> {
  return sql.begin(async (transaction) => {
    const inserted = await transaction<{ id: string }[]>`
      INSERT INTO prompts (author_id, title, description, content, community, model)
      VALUES (
        ${input.authorId}::uuid,
        ${input.title},
        ${input.description},
        ${input.content},
        ${input.community},
        ${input.model}
      )
      RETURNING id
    `;
    const promptId = inserted[0]?.id;
    if (!promptId) throw new Error("Prompt insert failed");

    for (const tag of input.tags) {
      const tagRows = await transaction<{ id: string }[]>`
        INSERT INTO tags (name, slug)
        VALUES (${tag.replace(/-/g, " ")}, ${tag})
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `;
      const tagId = tagRows[0]?.id;
      if (tagId) {
        await transaction`
          INSERT INTO prompt_tags (prompt_id, tag_id)
          VALUES (${promptId}::uuid, ${tagId}::uuid)
          ON CONFLICT DO NOTHING
        `;
      }
    }

    return promptId;
  });
}

export async function setVote(promptId: string, userId: string, value: -1 | 0 | 1): Promise<number> {
  await sql.begin(async (transaction) => {
    if (value === 0) {
      await transaction`
        DELETE FROM votes WHERE prompt_id = ${promptId}::uuid AND user_id = ${userId}::uuid
      `;
    } else {
      await transaction`
        INSERT INTO votes (prompt_id, user_id, value)
        VALUES (${promptId}::uuid, ${userId}::uuid, ${value})
        ON CONFLICT (prompt_id, user_id)
        DO UPDATE SET value = EXCLUDED.value, created_at = NOW()
      `;
    }
  });

  const totals = await sql<{ score: number }[]>`
    SELECT COALESCE(SUM(value), 0)::int AS score FROM votes WHERE prompt_id = ${promptId}::uuid
  `;
  return totals[0]?.score ?? 0;
}

export async function addComment(promptId: string, authorId: string, body: string): Promise<void> {
  await sql`
    INSERT INTO comments (prompt_id, author_id, body)
    VALUES (${promptId}::uuid, ${authorId}::uuid, ${body})
  `;
}

export async function toggleSavedPrompt(promptId: string, ownerId: string): Promise<boolean> {
  return sql.begin(async (transaction) => {
    const collectionRows = await transaction<{ id: string }[]>`
      INSERT INTO collections (owner_id, name, description)
      VALUES (${ownerId}::uuid, 'Saved prompts', 'Your default InnerJ collection')
      ON CONFLICT (owner_id, name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
    const collectionId = collectionRows[0]?.id;
    if (!collectionId) throw new Error("Collection lookup failed");

    const existing = await transaction<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM collection_prompts
        WHERE collection_id = ${collectionId}::uuid AND prompt_id = ${promptId}::uuid
      ) AS exists
    `;

    if (existing[0]?.exists) {
      await transaction`
        DELETE FROM collection_prompts
        WHERE collection_id = ${collectionId}::uuid AND prompt_id = ${promptId}::uuid
      `;
      return false;
    }

    await transaction`
      INSERT INTO collection_prompts (collection_id, prompt_id)
      VALUES (${collectionId}::uuid, ${promptId}::uuid)
      ON CONFLICT DO NOTHING
    `;
    return true;
  });
}

export async function getCollections(ownerId: string): Promise<CollectionItem[]> {
  return sql<CollectionItem[]>`
    SELECT
      c.id,
      c.name,
      c.description,
      c.is_public,
      c.created_at,
      COUNT(cp.prompt_id)::int AS prompt_count
    FROM collections c
    LEFT JOIN collection_prompts cp ON cp.collection_id = c.id
    WHERE c.owner_id = ${ownerId}::uuid
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `;
}

export async function createCollection(input: {
  ownerId: string;
  name: string;
  description: string;
  isPublic: boolean;
}): Promise<string> {
  const rows = await sql<{ id: string }[]>`
    INSERT INTO collections (owner_id, name, description, is_public)
    VALUES (${input.ownerId}::uuid, ${input.name}, ${input.description}, ${input.isPublic})
    ON CONFLICT (owner_id, name)
    DO UPDATE SET description = EXCLUDED.description, is_public = EXCLUDED.is_public
    RETURNING id
  `;
  if (!rows[0]) throw new Error("Collection creation failed");
  return rows[0].id;
}

export async function removeFromCollection(collectionId: string, promptId: string, ownerId: string) {
  await sql`
    DELETE FROM collection_prompts cp
    USING collections c
    WHERE cp.collection_id = c.id
      AND c.id = ${collectionId}::uuid
      AND c.owner_id = ${ownerId}::uuid
      AND cp.prompt_id = ${promptId}::uuid
  `;
}

export async function getCollectionPrompts(ownerId: string): Promise<Array<CollectionItem & { prompts: PromptFeedItem[] }>> {
  const collections = await getCollections(ownerId);
  return Promise.all(
    collections.map(async (collection) => {
      const rows = await sql<PromptRow[]>`
        SELECT
          p.id,
          p.title,
          p.description,
          p.content,
          p.community,
          p.model,
          p.use_count,
          p.created_at,
          u.id AS author_id,
          u.name AS author_name,
          u.username AS author_username,
          u.avatar_url AS author_avatar_url,
          COALESCE((SELECT SUM(value) FROM votes WHERE prompt_id = p.id), 0)::int AS score,
          (SELECT COUNT(*) FROM comments WHERE prompt_id = p.id)::int AS comment_count,
          COALESCE((SELECT value FROM votes WHERE prompt_id = p.id AND user_id = ${ownerId}::uuid), 0)::int AS user_vote,
          TRUE AS is_saved,
          COALESCE((
            SELECT ARRAY_AGG(t.slug ORDER BY t.slug)
            FROM prompt_tags pt JOIN tags t ON t.id = pt.tag_id
            WHERE pt.prompt_id = p.id
          ), ARRAY[]::text[]) AS tags
        FROM collection_prompts cp
        JOIN prompts p ON p.id = cp.prompt_id
        JOIN users u ON u.id = p.author_id
        WHERE cp.collection_id = ${collection.id}::uuid
        ORDER BY cp.added_at DESC
      `;
      return { ...collection, prompts: rows.map((row) => ({ ...row, tags: row.tags ?? [] })) };
    })
  );
}

export async function recordEvaluation(input: {
  promptId: string;
  userId: string;
  testInput: string;
  output: string;
  model: string;
  latencyMs: number;
}) {
  await sql.begin(async (transaction) => {
    await transaction`
      INSERT INTO evaluations (prompt_id, user_id, input, output, model, latency_ms)
      VALUES (
        ${input.promptId}::uuid,
        ${input.userId}::uuid,
        ${input.testInput},
        ${input.output},
        ${input.model},
        ${input.latencyMs}
      )
    `;
    await transaction`
      UPDATE prompts SET use_count = use_count + 1 WHERE id = ${input.promptId}::uuid
    `;
  });
}

export async function getProfile(username: string) {
  const users = await sql<
    Array<UserRow & { bio: string; createdAt: string; promptCount: number; totalScore: number }>
  >`
    SELECT
      u.id,
      u.email,
      u.username,
      u.name,
      u.bio,
      u.avatar_url,
      u.created_at,
      COUNT(DISTINCT p.id)::int AS prompt_count,
      COALESCE(SUM(v.value), 0)::int AS total_score
    FROM users u
    LEFT JOIN prompts p ON p.author_id = u.id AND p.visibility = 'public'
    LEFT JOIN votes v ON v.prompt_id = p.id
    WHERE u.username = ${username}
    GROUP BY u.id
    LIMIT 1
  `;
  if (!users[0]) return null;

  const prompts = await sql<PromptRow[]>`
    SELECT
      p.id,
      p.title,
      p.description,
      p.content,
      p.community,
      p.model,
      p.use_count,
      p.created_at,
      u.id AS author_id,
      u.name AS author_name,
      u.username AS author_username,
      u.avatar_url AS author_avatar_url,
      COALESCE((SELECT SUM(value) FROM votes WHERE prompt_id = p.id), 0)::int AS score,
      (SELECT COUNT(*) FROM comments WHERE prompt_id = p.id)::int AS comment_count,
      0 AS user_vote,
      FALSE AS is_saved,
      COALESCE((
        SELECT ARRAY_AGG(t.slug ORDER BY t.slug)
        FROM prompt_tags pt JOIN tags t ON t.id = pt.tag_id
        WHERE pt.prompt_id = p.id
      ), ARRAY[]::text[]) AS tags
    FROM prompts p
    JOIN users u ON u.id = p.author_id
    WHERE p.author_id = ${users[0].id}::uuid AND p.visibility = 'public'
    ORDER BY p.created_at DESC
  `;

  return {
    user: users[0],
    prompts: prompts.map((row) => ({ ...row, tags: row.tags ?? [] }))
  };
}
