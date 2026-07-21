import { createClient, type RedisClientType } from "redis";

let redis: RedisClientType | null = null;
let attempted = false;

async function client(): Promise<RedisClientType | null> {
  if (!process.env.REDIS_URL) return null;
  if (redis?.isReady) return redis;
  if (attempted && !redis) return null;

  attempted = true;
  try {
    redis = createClient({ url: process.env.REDIS_URL });
    redis.on("error", (error) => console.error("Redis error", error));
    await redis.connect();
    return redis;
  } catch (error) {
    console.warn("Redis unavailable; continuing without cache", error);
    redis = null;
    return null;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const connected = await client();
    const value = await connected?.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  try {
    const connected = await client();
    await connected?.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch {
  }
}

export async function getContentVersion(): Promise<number> {
  try {
    const connected = await client();
    if (!connected) return 0;
    const current = await connected.get("innerj:content-version");
    return Number(current ?? 0);
  } catch {
    return 0;
  }
}

export async function bumpContentVersion(): Promise<void> {
  try {
    const connected = await client();
    await connected?.incr("innerj:content-version");
  } catch {
  }
}
