import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockLimit, MockRatelimit } = vi.hoisted(() => {
  const mockLimit = vi.fn();
  class MockRatelimitClass {
    limit = mockLimit;
    static slidingWindow = vi.fn((tokens: number, window: string) => ({ tokens, window }));
  }
  return { mockLimit, MockRatelimit: MockRatelimitClass };
});

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: MockRatelimit,
}));

vi.mock("@upstash/redis", () => ({
  Redis: class {},
}));

import { checkAdminLoginRateLimit, checkBookingRateLimit, getClientIp } from "./rate-limit";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("checkBookingRateLimit", () => {
  it("allows the request when under the limit", async () => {
    mockLimit.mockResolvedValue({ success: true });
    const allowed = await checkBookingRateLimit("1.2.3.4");
    expect(allowed).toBe(true);
    expect(mockLimit).toHaveBeenCalledWith("1.2.3.4");
  });

  it("denies the request when over the limit", async () => {
    mockLimit.mockResolvedValue({ success: false });
    const allowed = await checkBookingRateLimit("1.2.3.4");
    expect(allowed).toBe(false);
  });

  it("fails open (allows) when Upstash env vars are not configured", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const allowed = await checkBookingRateLimit("1.2.3.4");
    expect(allowed).toBe(true);
    expect(mockLimit).not.toHaveBeenCalled();
  });

  it("fails open (allows) when the Upstash call throws", async () => {
    mockLimit.mockRejectedValue(new Error("network down"));
    const allowed = await checkBookingRateLimit("1.2.3.4");
    expect(allowed).toBe(true);
  });
});

describe("checkAdminLoginRateLimit", () => {
  it("allows the request when under the limit", async () => {
    mockLimit.mockResolvedValue({ success: true });
    const allowed = await checkAdminLoginRateLimit("1.2.3.4");
    expect(allowed).toBe(true);
  });

  it("denies the request when over the limit", async () => {
    mockLimit.mockResolvedValue({ success: false });
    const allowed = await checkAdminLoginRateLimit("1.2.3.4");
    expect(allowed).toBe(false);
  });

  it("fails open when Upstash env vars are not configured", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const allowed = await checkAdminLoginRateLimit("1.2.3.4");
    expect(allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("prefers the Netlify client-connection-ip header", () => {
    const request = new Request("http://localhost", {
      headers: {
        "x-nf-client-connection-ip": "9.9.9.9",
        "x-forwarded-for": "1.1.1.1, 2.2.2.2",
      },
    });
    expect(getClientIp(request)).toBe("9.9.9.9");
  });

  it("falls back to the first x-forwarded-for entry", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2" },
    });
    expect(getClientIp(request)).toBe("1.1.1.1");
  });

  it("falls back to 'unknown' when no IP header is present", () => {
    const request = new Request("http://localhost");
    expect(getClientIp(request)).toBe("unknown");
  });
});
