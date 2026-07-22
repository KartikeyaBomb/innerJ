import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  "postgres://innerj:innerj@localhost:5432/innerj";

const globalForSql = globalThis as unknown as {
  innerjSql?: ReturnType<typeof postgres>;
};

export const sql =
  globalForSql.innerjSql ??
  postgres(connectionString, {
    max: process.env.NODE_ENV === "production" ? 10 : 4,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: process.env.NODE_ENV !== "production",
    transform: postgres.camel
  });

if (process.env.NODE_ENV !== "production") {
  globalForSql.innerjSql = sql;
}
