// ─── Upstash Rate Limiting ────────────────────────────────────────────────
// Persistent rate limiting that works across serverless instances.
// Falls back to in-memory when Redis is not configured.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let rateLimiters: Record<string, Ratelimit> | null = null;

function getRateLimiters(): Record<string, Ratelimit> | null {
  if (rateLimiters) return rateLimiters;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const redis = new Redis({ url, token });

  rateLimiters = {
    search: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      prefix: "rl:search",
    }),
    plan: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "rl:plan",
    }),
    general: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "rl:general",
    }),
    analytics: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, "1 m"),
      prefix: "rl:analytics",
    }),
  };

  return rateLimiters;
}

// Map API paths to rate limiter keys
function getLimiterKey(path: string): string {
  if (path.includes("/ai-planner") || path.includes("/generate-itinerary")) return "plan";
  if (path.includes("/flights") || path.includes("/hotels") || path.includes("/activities")) return "search";
  if (path.includes("/analytics")) return "analytics";
  return "general";
}

export async function checkUpstashRateLimit(
  ip: string,
  path: string
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const limiters = getRateLimiters();

  if (!limiters) {
    // No Redis configured — allow all (in-memory limiter in middleware handles this)
    return { allowed: true, remaining: 99, resetAt: Date.now() + 60000 };
  }

  const key = getLimiterKey(path);
  const limiter = limiters[key] || limiters.general;
  const { success, remaining, reset } = await limiter.limit(ip);

  return {
    allowed: success,
    remaining,
    resetAt: reset,
  };
}
