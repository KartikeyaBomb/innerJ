import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ?? "postgres://innerj:innerj@localhost:5432/innerj";

const sql = postgres(connectionString, { transform: postgres.camel });

async function main() {
  const rows = await sql<Array<{ users: number; prompts: number; evaluations: number }>>`
    SELECT
      (SELECT COUNT(*)::int FROM users) AS users,
      (SELECT COUNT(*)::int FROM prompts) AS prompts,
      (SELECT COUNT(*)::int FROM evaluations) AS evaluations
  `;
  const counts = rows[0];
  console.log(
    `InnerJ database ready: ${counts?.users ?? 0} users, ${counts?.prompts ?? 0} prompts, ${counts?.evaluations ?? 0} evaluations`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
