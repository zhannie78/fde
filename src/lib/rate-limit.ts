import { getStore } from "@netlify/blobs";

/**
 * Per-IP rate limiting for the site's only two public write/auth
 * endpoints (POST /api/book, POST /api/admin/login) — Netlify Function
 * invocations and Blobs operations are otherwise uncapped, and this is
 * the site's only defense against casual scripted abuse.
 *
 * Backed by Netlify Blobs (no new external service — reuses the storage
 * already used for bookings/availability) rather than a dedicated rate-
 * limiting service. This is a deliberate simplicity tradeoff: Blobs has
 * no native atomic increment or key expiry, so this is a fixed-window
 * (not sliding-window) counter using optimistic concurrency (etag
 * compare-and-swap) to increment correctly under concurrent requests,
 * with a small bounded retry count. Less precise than a dedicated
 * rate-limiting service, but sufficient to stop casual abuse at this
 * site's traffic level, with zero new accounts to manage.
 *
 * Fails OPEN (allows the request) on any Blobs error or after exhausting
 * retries under contention — this is abuse/cost protection, not an auth
 * boundary, so an infra hiccup must never block a real visitor's booking.
 */
function getRateLimitStore() {
  return getStore({ name: "rate-limits", consistency: "strong" });
}

/** Truncates to the current hour, e.g. "2026-07-24T04" — a natural fixed window that needs no explicit expiry. */
function currentHourBucket(): string {
  return new Date().toISOString().slice(0, 13);
}

const MAX_RETRIES = 3;

async function checkLimit(prefix: string, identifier: string, limit: number): Promise<boolean> {
  const store = getRateLimitStore();
  const key = `${prefix}:${identifier}:${currentHourBucket()}`;

  try {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const existing = await store.getWithMetadata(key, { type: "text" });

      if (!existing) {
        const result = await store.set(key, "1", { onlyIfNew: true });
        if (result.modified) return true;
        continue;
      }

      const count = Number(existing.data) || 0;

      if (count >= limit) return false;

      const result = await store.set(key, String(count + 1), { onlyIfMatch: existing.etag });
      if (result.modified) return true;
    }

    console.error(`Rate limit check exhausted retries under contention (${prefix}), failing open.`);
    return true;
  } catch (error) {
    console.error(`Rate limit check threw (${prefix}), failing open.`, error);
    return true;
  }
}

export async function checkBookingRateLimit(identifier: string): Promise<boolean> {
  return checkLimit("book", identifier, 5);
}

export async function checkAdminLoginRateLimit(identifier: string): Promise<boolean> {
  return checkLimit("admin-login", identifier, 10);
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
