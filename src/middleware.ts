// ─── Rate Limiting Middleware ─────────────────────────────────────────────
// In-memory sliding-window rate limiter for API routes.
// Firebase Auth is client-side (no session cookies to refresh).

import { NextRequest, NextResponse } from "next/server";

// ─── Rate limit store (in-memory, resets on deploy) ────────────────────────
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries every 60s
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitStore) {
      if (val.resetAt < now) rateLimitStore.delete(key);
    }
  }, 60_000);
}

interface RateLimitConfig {
  windowMs: number;   // Time window in ms
  maxRequests: number; // Max requests per window
}

// Route-specific limits
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "/api/flight-prices":{ windowMs: 60_000, maxRequests: 60 },
  "/api/flights/search": { windowMs: 60_000, maxRequests: 30 },
  "/api/hotels/search": { windowMs: 60_000, maxRequests: 30 },
  "/api/activities/search": { windowMs: 60_000, maxRequests: 45 },
  "/api/analytics": { windowMs: 60_000, maxRequests: 200 },
  "/api/ai-planner": { windowMs: 60_000, maxRequests: 10 },
  "/api/trips": { windowMs: 60_000, maxRequests: 30 },
};

const DEFAULT_LIMIT: RateLimitConfig = { windowMs: 60_000, maxRequests: 100 };

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string, path: string): { allowed: boolean; remaining: number; resetAt: number } {
  let config = DEFAULT_LIMIT;
  for (const [route, conf] of Object.entries(RATE_LIMITS)) {
    if (path.startsWith(route)) {
      config = conf;
      break;
    }
  }

  const key = `${ip}:${path.split("/").slice(0, 4).join("/")}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  if (entry.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining, resetAt: entry.resetAt };
}

// ─── Middleware ─────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate-limit API routes
  if (pathname.startsWith("/api/")) {
    const ip = getClientIP(req);
    const { allowed, remaining, resetAt } = checkRateLimit(ip, pathname);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
    return response;
  }

  // Non-API routes — pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
