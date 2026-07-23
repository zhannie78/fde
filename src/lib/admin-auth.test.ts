import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getSessionCookieValue, isValidPassword, isValidSessionCookie } from "./admin-auth";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.ADMIN_PASSWORD = "correct-horse-battery-staple";
  process.env.ADMIN_SESSION_SECRET = "test-session-secret";
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("isValidPassword", () => {
  it("accepts the correct password", () => {
    expect(isValidPassword("correct-horse-battery-staple")).toBe(true);
  });

  it("rejects an incorrect password", () => {
    expect(isValidPassword("wrong-password")).toBe(false);
  });

  it("rejects when ADMIN_PASSWORD is not configured", () => {
    delete process.env.ADMIN_PASSWORD;
    expect(isValidPassword("anything")).toBe(false);
  });
});

describe("getSessionCookieValue / isValidSessionCookie", () => {
  it("produces a value that isValidSessionCookie accepts", () => {
    const value = getSessionCookieValue();
    expect(value).not.toBeNull();
    expect(isValidSessionCookie(value ?? undefined)).toBe(true);
  });

  it("rejects an incorrect cookie value", () => {
    expect(isValidSessionCookie("not-the-right-value")).toBe(false);
  });

  it("rejects a missing cookie value", () => {
    expect(isValidSessionCookie(undefined)).toBe(false);
  });

  it("returns null when ADMIN_SESSION_SECRET is not configured", () => {
    delete process.env.ADMIN_SESSION_SECRET;
    expect(getSessionCookieValue()).toBeNull();
  });
});
