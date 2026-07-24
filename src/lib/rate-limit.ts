import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Per-IP rate limiting for the site's only two public write/auth
 * endpoints (POST /api/book, POST /api/admin/login) — Netlify Function
 * invocations, Netlify Blobs operations, and Resend email volume are all
 * uncapped otherwise, and this project's own stack guidance already flags
 * "public route + paid/limited upstream service, no per-visitor throttle"
 * as a required-not-optional risk.
 *
 * Fails OPEN (allows the request) whenever Upstash isn't configured or a
 * check throws — this is cost/abuse protection, not an auth boundary, so
 * a transient Upstash outage must never block a real visitor from booking.
 */
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function checkLimit(
  name: string,
  identifier: string,
  build: (redis: Redis) => Ratelimit
): Promise<boolean> {
  const redis = getRedis();

  if (!redis) {
    console.error(
      `Rate limiting skipped (${name}): UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not configured.`
    );
    return true;
  }

  try {
    const ratelimit = build(redis);
    const { success } = await ratelimit.limit(identifier);
    return success;
  } catch (error) {
    console.error(`Rate limit check threw (${name}), failing open.`, error);
    return true;
  }
}

export async function checkBookingRateLimit(identifier: string): Promise<boolean> {
  return checkLimit(
    "book",
    identifier,
    (redis) =>
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 h"),
        prefix: "ratelimit:book",
      })
  );
}

export async function checkAdminLoginRateLimit(identifier: string): Promise<boolean> {
  return checkLimit(
    "admin-login",
    identifier,
    (redis) =>
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        prefix: "ratelimit:admin-login",
      })
  );
}

/**
 * Netlify sets x-nf-client-connection-ip to the actual connecting client's
 * IP (more reliable than x-forwarded-for, which can carry a spoofed or
 * multi-hop chain). Falls back to the first x-forwarded-for entry for
 * other environments, then "unknown" (which just shares one rate-limit
 * bucket across all such requests — acceptable degradation, not a security
 * hole, since this only affects environments without either header).
 */
export function getClientIp(request: Request): string {
  const nfIp = request.headers.get("x-nf-client-connection-ip");
  if (nfIp) return nfIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return "unknown";
}
