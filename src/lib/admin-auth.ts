import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "admin_session";

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

function computeExpectedSessionValue(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update("admin-session").digest("hex");
}

export function isValidPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeStringEqual(password, expected);
}

export function getSessionCookieValue(): string | null {
  return computeExpectedSessionValue();
}

export function isValidSessionCookie(value: string | null | undefined): boolean {
  const expected = computeExpectedSessionValue();
  if (!expected || !value) return false;
  return timingSafeStringEqual(value, expected);
}

/**
 * Reads the session cookie from the current request (Route Handler or
 * Server Component context) and checks it. Deliberately NOT implemented
 * via Next.js Middleware: Netlify deploys Middleware as a Netlify Edge
 * Function, and full `node:crypto` support there is not something to rely
 * on, whereas Route Handlers/Server Components are documented to run in
 * the Node.js runtime on Netlify.
 */
export async function requireAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}
