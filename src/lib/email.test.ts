import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockSend = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

const { mockHeaders } = vi.hoisted(() => ({
  mockHeaders: vi.fn(),
}));
vi.mock("next/headers", () => ({
  headers: mockHeaders,
}));

import { resolveBaseUrl, sendBookingUpdateEmail } from "./email";

const ORIGINAL_ENV = { ...process.env };

const baseParams = {
  state: "confirmed" as const,
  to: "jane@example.com",
  name: "Jane Doe",
  dateISO: "2026-08-10",
  time: "09:00",
  manageToken: "abc123",
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.RESEND_API_KEY = "test-api-key";
  mockHeaders.mockResolvedValue(new Map([["host", "aideployed.dev"]]));
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("sendBookingUpdateEmail", () => {
  it("does nothing and does not throw when RESEND_API_KEY is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    await expect(sendBookingUpdateEmail(baseParams)).resolves.toBeUndefined();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("sends via Resend with the correct fields on success", async () => {
    mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });

    await sendBookingUpdateEmail(baseParams);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const call = mockSend.mock.calls[0][0];
    expect(call.to).toEqual(["jane@example.com"]);
    expect(call.subject).toBe("You're booked with AI Deployed");
    expect(call.html).toContain("Jane Doe");
    expect(typeof call.from).toBe("string");
  });

  it("builds the manage link from the actual request host, not a hardcoded domain", async () => {
    mockHeaders.mockResolvedValue(new Map([["host", "localhost:8888"]]));
    mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });

    await sendBookingUpdateEmail(baseParams);

    const call = mockSend.mock.calls[0][0];
    expect(call.html).toContain("http://localhost:8888/book/manage/abc123");
  });

  it("does not throw when Resend resolves with an error field", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "bad request" } });
    await expect(sendBookingUpdateEmail(baseParams)).resolves.toBeUndefined();
  });

  it("does not throw when the Resend call rejects", async () => {
    mockSend.mockRejectedValue(new Error("network down"));
    await expect(sendBookingUpdateEmail(baseParams)).resolves.toBeUndefined();
  });
});

describe("resolveBaseUrl", () => {
  it("uses http for localhost", () => {
    expect(resolveBaseUrl("localhost:8888", null)).toBe("http://localhost:8888");
  });

  it("uses http for a 127.x loopback address", () => {
    expect(resolveBaseUrl("127.0.0.1:3000", null)).toBe("http://127.0.0.1:3000");
  });

  it("uses https for a real host", () => {
    expect(resolveBaseUrl("aideployed.dev", null)).toBe("https://aideployed.dev");
  });

  it("prefers x-forwarded-proto when present", () => {
    expect(resolveBaseUrl("localhost:8888", "https")).toBe("https://localhost:8888");
  });

  it("falls back to the configured domain when the host header is missing", () => {
    expect(resolveBaseUrl(null, null)).toBe("https://aideployed.dev");
  });
});
