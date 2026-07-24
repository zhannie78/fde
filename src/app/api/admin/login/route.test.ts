import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockIsValidPassword, mockGetSessionCookieValue } = vi.hoisted(() => ({
  mockIsValidPassword: vi.fn(),
  mockGetSessionCookieValue: vi.fn(),
}));

vi.mock("@/lib/admin-auth", () => ({
  SESSION_COOKIE_NAME: "admin_session",
  isValidPassword: mockIsValidPassword,
  getSessionCookieValue: mockGetSessionCookieValue,
}));

const { mockCheckAdminLoginRateLimit } = vi.hoisted(() => ({
  mockCheckAdminLoginRateLimit: vi.fn(),
}));
vi.mock("@/lib/rate-limit", () => ({
  checkAdminLoginRateLimit: mockCheckAdminLoginRateLimit,
  getClientIp: vi.fn(() => "1.2.3.4"),
}));

import { POST } from "./route";

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckAdminLoginRateLimit.mockResolvedValue(true);
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("POST /api/admin/login", () => {
  it("returns 429 when the rate limit is exceeded, without checking the password", async () => {
    mockCheckAdminLoginRateLimit.mockResolvedValue(false);
    const res = await POST(buildRequest({ password: "anything" }));
    expect(res.status).toBe(429);
    expect(mockIsValidPassword).not.toHaveBeenCalled();
  });

  it("returns 401 for an incorrect password", async () => {
    mockIsValidPassword.mockReturnValue(false);
    const res = await POST(buildRequest({ password: "wrong" }));
    expect(res.status).toBe(401);
  });

  it("returns 500 when the session secret isn't configured", async () => {
    mockIsValidPassword.mockReturnValue(true);
    mockGetSessionCookieValue.mockReturnValue(null);
    const res = await POST(buildRequest({ password: "correct" }));
    expect(res.status).toBe(500);
  });

  it("sets the session cookie and returns 200 on success", async () => {
    mockIsValidPassword.mockReturnValue(true);
    mockGetSessionCookieValue.mockReturnValue("signed-session-value");

    const res = await POST(buildRequest({ password: "correct" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("admin_session=signed-session-value");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=lax");
  });
});
