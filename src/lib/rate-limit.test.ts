import { beforeEach, describe, expect, it, vi } from "vitest";

const mockStore = {
  getWithMetadata: vi.fn(),
  set: vi.fn(),
};

vi.mock("@netlify/blobs", () => ({
  getStore: vi.fn(() => mockStore),
}));

import { checkAdminLoginRateLimit, checkBookingRateLimit, getClientIp } from "./rate-limit";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkBookingRateLimit", () => {
  it("allows the first request for a new window (no existing entry)", async () => {
    mockStore.getWithMetadata.mockResolvedValue(null);
    mockStore.set.mockResolvedValue({ modified: true, etag: "etag-1" });

    const allowed = await checkBookingRateLimit("1.2.3.4");

    expect(allowed).toBe(true);
    expect(mockStore.set).toHaveBeenCalledWith(expect.stringContaining("book:1.2.3.4:"), "1", {
      onlyIfNew: true,
    });
  });

  it("allows and increments when under the limit", async () => {
    mockStore.getWithMetadata.mockResolvedValue({ data: "2", etag: "etag-2" });
    mockStore.set.mockResolvedValue({ modified: true, etag: "etag-3" });

    const allowed = await checkBookingRateLimit("1.2.3.4");

    expect(allowed).toBe(true);
    expect(mockStore.set).toHaveBeenCalledWith(expect.stringContaining("book:1.2.3.4:"), "3", {
      onlyIfMatch: "etag-2",
    });
  });

  it("denies once the count reaches the limit (5), without writing", async () => {
    mockStore.getWithMetadata.mockResolvedValue({ data: "5", etag: "etag-5" });

    const allowed = await checkBookingRateLimit("1.2.3.4");

    expect(allowed).toBe(false);
    expect(mockStore.set).not.toHaveBeenCalled();
  });

  it("retries on a concurrent write conflict and succeeds", async () => {
    mockStore.getWithMetadata
      .mockResolvedValueOnce({ data: "1", etag: "stale-etag" })
      .mockResolvedValueOnce({ data: "2", etag: "fresh-etag" });
    mockStore.set
      .mockResolvedValueOnce({ modified: false }) // first attempt: someone else won the race
      .mockResolvedValueOnce({ modified: true, etag: "etag-final" }); // retry succeeds

    const allowed = await checkBookingRateLimit("1.2.3.4");

    expect(allowed).toBe(true);
    expect(mockStore.getWithMetadata).toHaveBeenCalledTimes(2);
  });

  it("fails open (allows) after exhausting retries under sustained contention", async () => {
    mockStore.getWithMetadata.mockResolvedValue({ data: "1", etag: "always-stale" });
    mockStore.set.mockResolvedValue({ modified: false });

    const allowed = await checkBookingRateLimit("1.2.3.4");

    expect(allowed).toBe(true);
  });

  it("fails open (allows) when a Blobs call throws", async () => {
    mockStore.getWithMetadata.mockRejectedValue(new Error("blobs down"));

    const allowed = await checkBookingRateLimit("1.2.3.4");

    expect(allowed).toBe(true);
  });
});

describe("checkAdminLoginRateLimit", () => {
  it("uses a limit of 10 and a distinct key prefix from booking", async () => {
    mockStore.getWithMetadata.mockResolvedValue({ data: "9", etag: "etag-9" });
    mockStore.set.mockResolvedValue({ modified: true, etag: "etag-10" });

    const allowed = await checkAdminLoginRateLimit("1.2.3.4");

    expect(allowed).toBe(true);
    expect(mockStore.set).toHaveBeenCalledWith(expect.stringContaining("admin-login:1.2.3.4:"), "10", {
      onlyIfMatch: "etag-9",
    });
  });

  it("denies once the count reaches the limit (10)", async () => {
    mockStore.getWithMetadata.mockResolvedValue({ data: "10", etag: "etag-10" });

    const allowed = await checkAdminLoginRateLimit("1.2.3.4");

    expect(allowed).toBe(false);
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
