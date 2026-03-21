/**
 * In-memory sliding-window rate limiter.
 * For multi-instance deployments, replace with Redis-based implementation.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 600_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 300_000);

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key (e.g. IP, userId, etc.)
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= config.limit) {
    const oldest = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldest + windowMs,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.limit - entry.timestamps.length,
    resetAt: now + windowMs,
  };
}

// Pre-defined rate limit configs
export const RATE_LIMITS = {
  /** Auth endpoints: 10 req / 60s */
  auth: { limit: 10, windowSeconds: 60 } as RateLimitConfig,
  /** Send verification code: 3 req / 120s */
  sendCode: { limit: 3, windowSeconds: 120 } as RateLimitConfig,
  /** General API: 60 req / 60s */
  api: { limit: 60, windowSeconds: 60 } as RateLimitConfig,
  /** Payment: 5 req / 60s */
  payment: { limit: 5, windowSeconds: 60 } as RateLimitConfig,
};

/**
 * Extract client IP from Next.js request
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
