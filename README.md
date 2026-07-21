# InnerJ

A full-stack prompt engineering community built with Next.js, TypeScript, PostgreSQL, and Redis.

InnerJ lets people publish reusable prompts to communities, add tags, discuss improvements, save prompts into collections, and hand customized prompts off to their preferred AI provider.

## Included

- Next.js App Router with React Server Components and Route Handlers
- TypeScript across UI, server routes, database access, and scripts
- PostgreSQL schema with full-text search and indexes for feed retrieval
- Redis feed/search caching with version-based invalidation and graceful fallback
- Google OAuth with signed, HTTP-only application sessions
- Chronological community feed with community and tag filtering
- User-selected communities and user-written tags
- Customizable prompt variables with handoff to the user's preferred AI provider
- Discussions, profiles, saves, and collections
- Responsive interface with no external UI framework
- Docker Compose for local PostgreSQL and Redis
- Seed data, health endpoint, and production Dockerfile

## Local setup

1. Copy the environment file:

```bash
cp .env.example .env.local
```

2. Start PostgreSQL and Redis:

```bash
docker compose up -d
```

The PostgreSQL container applies `db/init.sql` on its first startup.

3. Install dependencies and verify the database:

```bash
npm install
npm run db:check
```

4. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Google authentication

InnerJ only accepts Google sign-in. Create an OAuth 2.0 Web application in Google Cloud Console and add this authorized redirect URI for local development:

```text
http://localhost:3000/api/auth/google/callback
```

Then set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`. The authorization-code flow uses state, nonce, and PKCE validation. A user record is created from Google's verified email, name, and profile image on first sign-in.

## Feed retrieval

The public feed is chronological. PostgreSQL indexes cover community/recency, author retrieval, tag joins, comments, collections, and full-text search.

## Redis behavior

Feed cache keys include a global content version. Mutations increment that version, invalidating old feed and search results without wildcard key deletion. If Redis is absent or temporarily unavailable, requests continue directly against PostgreSQL.

## API map

| Route | Purpose |
|---|---|
| `GET/DELETE /api/auth/session` | Read or clear a session |
| `GET /api/auth/google` | Begin Google OAuth sign-in |
| `GET /api/auth/google/callback` | Validate Google OAuth and create the session |
| `GET/POST /api/prompts` | Retrieve a feed or publish a prompt |
| `GET/POST /api/prompts/:id/comments` | Read or add discussion comments |
| `POST /api/prompts/:id/save` | Toggle the default saved collection |
| `GET/POST /api/collections` | Read or create collections |
| `DELETE /api/collections/:id/prompts/:promptId` | Remove a saved prompt |
| `GET /api/health` | Verify PostgreSQL connectivity |

## Production notes

- Set a strong `AUTH_SECRET`.
- Use a pooled PostgreSQL connection string in serverless deployments.
- Put rate limits and abuse controls in front of login, comments, and publishing routes.
- Add email/OAuth verification before treating accounts as verified identities.

## Resume metrics

The repository implements the functionality described by the project bullets, but user counts, processed-prompt counts, and latency improvements must come from an actual deployment and measured analytics. Do not claim `100+ users`, `1,000+ prompts`, or a `58%` performance improvement until those figures are observed and documented.
