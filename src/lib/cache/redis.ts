// ─── Upstash Redis Cache ──────────────────────────────────────────────────
// Persistent cache that survives deploys. Drop-in replacement for serverCache.

import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("[Cache] UPSTASH_REDIS_REST_URL or TOKEN not set — using in-memory fallback");
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

// ─── In-memory fallback (for local dev without Redis) ─────────────────────
const memoryCache = new Map<string, { data: unknown; expiresAt: number }>();

// ─── Generic cache wrapper ────────────────────────────────────────────────

export async function withRedisCache<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>
): Promise<T> {
  const r = getRedis();

  // Try Redis first
  if (r) {
    try {
      const cached = await r.get<T>(key);
      if (cached !== null && cached !== undefined) {
        return cached;
      }
    } catch (e) {
      console.warn("[Cache] Redis get error:", e);
    }
  } else {
    // In-memory fallback
    const entry = memoryCache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data as T;
    }
  }

  // Compute fresh value
  const result = await compute();

  // Store in cache
  if (r) {
    try {
      await r.set(key, result, { ex: ttlSeconds });
    } catch (e) {
      console.warn("[Cache] Redis set error:", e);
    }
  } else {
    memoryCache.set(key, { data: result, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  return result;
}

// ─── Cache-Control header helper ──────────────────────────────────────────

export function buildCacheControlHeader(maxAgeSec: number, staleWhileRevalidateSec?: number): string {
  let header = `public, s-maxage=${maxAgeSec}`;
  if (staleWhileRevalidateSec) {
    header += `, stale-while-revalidate=${staleWhileRevalidateSec}`;
  }
  return header;
}

// ─── Direct Redis access for advanced use ─────────────────────────────────

export { getRedis };
