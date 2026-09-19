# InnerJ

InnerJ is a place to share AI prompts, find useful ones, and discuss how to make them better.

You can post prompts in communities, browse by tag, and save favorites in collections. Prompts can also have variables you fill in before sending them to your preferred AI provider.

Built with Next.js, TypeScript, PostgreSQL, and Redis.

## Run locally

You'll need Node.js, npm, and Docker.

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

Open [localhost:3000](http://localhost:3000).

## Set up Google sign-in

InnerJ uses Google for sign-in. Create an OAuth 2.0 Web application in Google Cloud Console and add this authorized redirect URI:

```text
http://localhost:3000/api/auth/google/callback
```

Add your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local`, and replace `AUTH_SECRET` with a long random string. Restart the app after changing these values.

Your first sign-in creates a profile using your Google name, email, and profile image.

## How it works

The feed shows the newest prompts first. PostgreSQL stores the data and handles search. Redis caches feed and search results, and content changes invalidate those caches. If Redis is unavailable, the app reads directly from PostgreSQL.

## API routes

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

## Deployment

The repo includes a production Dockerfile. Before deploying:

- Set a strong `AUTH_SECRET` and configure Google sign-in for your production URL.
- Use a pooled PostgreSQL connection string for serverless deployments.
- Add rate limits for sign-in, comments, and publishing.
