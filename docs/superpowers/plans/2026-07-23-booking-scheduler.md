# Booking Scheduler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistence-backed double-booking prevention and a visitor-facing confirmation-email + reschedule/cancel flow to the existing native `/book` scheduler.

**Architecture:** Netlify Blobs (`@netlify/blobs`) stores bookings as two prefixed key namespaces in one store — `date:<iso>` (existence = taken, written with an atomic "only if new" conditional to prevent race-condition double-booking) and `token:<manage_token>` (the full booking record, looked up by the visitor's secret manage link). Resend + React Email send best-effort confirmation/cancellation/reschedule emails; the existing Telegram notification stays as the reliable founder-facing channel, now also best-effort so a Telegram outage never blocks a client-visible success once the booking is durably reserved.

**Tech Stack:** Next.js 16 (App Router, Route Handlers, Server Components), TypeScript, zod, `@netlify/blobs`, `resend`, `@react-email/components` + `@react-email/render`, Vitest (new to this repo).

## Global Constraints

- Node 20 (per `.nvmrc` / `netlify.toml` `NODE_VERSION`).
- Next.js 16 App Router: dynamic route `params` are `Promise<{...}>` and must be `await`ed — no existing precedent in this repo, this plan establishes it.
- Never call `@netlify/blobs`, `resend`, or read `TELEGRAM_BOT_TOKEN`/`RESEND_API_KEY` from a Client Component — server-only (Route Handlers / Server Components), matching the existing Telegram integration's secret-handling convention.
- `src/lib/booking.ts` stays an isomorphic, framework-free module (no zod, no `"use client"`, no Blobs/Resend imports) — it's imported by both Client Components and Route Handlers today; don't break that.
- Email delivery (Resend) and the Telegram push are both best-effort: log failures server-side via `console.error`, never throw back to the caller once the booking itself is durably written to Blobs.
- Match existing code style: double quotes, semicolons, `@/` import alias, no default exports for anything except Next.js page/layout files (matches every existing file read during planning).
- No admin UI, no auth provider, no calendar sync, no multi-slot availability — out of scope per the design spec.
- Design reference: `docs/superpowers/specs/2026-07-22-booking-scheduler-design.md`.

---

### Task 1: Shared booking validation schema + candidate-date helper + Vitest scaffold

**Files:**
- Create: `src/lib/booking-schemas.ts`
- Modify: `src/lib/booking.ts`
- Create: `vitest.config.ts`
- Modify: `package.json`
- Test: `src/lib/booking-schemas.test.ts`, `src/lib/booking.test.ts`

**Interfaces:**
- Produces: `bookingSchema: z.ZodObject` and `rescheduleSchema: z.ZodObject` from `@/lib/booking-schemas`, each with a `.safeParse()` method returning zod's standard `{ success: true, data }` / `{ success: false, error }` shape.
- Produces: `isCandidateDate(dateISO: string, count?: number): boolean` and `getTodayISO(): string` from `@/lib/booking`, alongside the existing `BOOKING_SLOT_LABEL`, `getAvailableDates`, `formatSlotLabel` exports (unchanged).

- [ ] **Step 1: Install Vitest and add the test script**

Run:
```bash
npm install --save-dev vitest
```

Add to `package.json`'s `"scripts"` block (alongside the existing `dev`/`build`/`start`/`lint`):
```json
"test": "vitest run"
```

- [ ] **Step 2: Add the Vitest config**

Create `vitest.config.ts`:
```ts
import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Write the failing tests for the shared zod schemas**

Create `src/lib/booking-schemas.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import { bookingSchema, rescheduleSchema } from "./booking-schemas";

describe("bookingSchema", () => {
  const valid = {
    name: "Jane Doe",
    email: "jane@example.com",
    note: "Need help with invoicing.",
    dateISO: "2026-08-10",
  };

  it("accepts a valid booking payload", () => {
    expect(bookingSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(bookingSchema.safeParse({ ...valid, name: "  " }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(bookingSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects a malformed date", () => {
    expect(bookingSchema.safeParse({ ...valid, dateISO: "08/10/2026" }).success).toBe(false);
  });
});

describe("rescheduleSchema", () => {
  it("accepts a valid ISO date", () => {
    expect(rescheduleSchema.safeParse({ dateISO: "2026-08-10" }).success).toBe(true);
  });

  it("rejects a malformed date", () => {
    expect(rescheduleSchema.safeParse({ dateISO: "not-a-date" }).success).toBe(false);
  });
});
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `npm test -- src/lib/booking-schemas.test.ts`
Expected: FAIL — `Cannot find module './booking-schemas'` (file doesn't exist yet).

- [ ] **Step 5: Create the shared schemas**

Create `src/lib/booking-schemas.ts`:
```ts
import { z } from "zod";

/**
 * Shared validation contracts for every booking-related Route Handler
 * (create, cancel, reschedule) so the shape of a booking payload is
 * defined once, not duplicated per route.
 */
export const bookingSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email(),
  note: z.string().trim().min(1).max(2000),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const rescheduleSchema = z.object({
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test -- src/lib/booking-schemas.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 7: Write the failing tests for the new booking.ts helpers**

Create `src/lib/booking.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import { getAvailableDates, getTodayISO, isCandidateDate } from "./booking";

describe("getTodayISO", () => {
  it("returns a YYYY-MM-DD string matching the first candidate date", () => {
    const today = getTodayISO();
    const [firstCandidate] = getAvailableDates(1);
    expect(today).toBe(firstCandidate.iso);
  });
});

describe("isCandidateDate", () => {
  it("returns true for a date within the visible range", () => {
    const [firstCandidate] = getAvailableDates(1);
    expect(isCandidateDate(firstCandidate.iso)).toBe(true);
  });

  it("returns false for a date far outside the visible range", () => {
    expect(isCandidateDate("2099-01-01")).toBe(false);
  });

  it("returns false for a malformed-but-parseable string", () => {
    expect(isCandidateDate("not-a-date")).toBe(false);
  });
});
```

- [ ] **Step 8: Run the tests to verify they fail**

Run: `npm test -- src/lib/booking.test.ts`
Expected: FAIL — `getTodayISO`/`isCandidateDate` are not exported yet.

- [ ] **Step 9: Add the two helpers to booking.ts**

Modify `src/lib/booking.ts` — append after the existing `formatSlotLabel` function (after the current line 69, keeping every existing export untouched):
```ts

export function getTodayISO(): string {
  return new Date(todayNyUtcEpoch()).toISOString().slice(0, 10);
}

export function isCandidateDate(dateISO: string, count = 21): boolean {
  return getAvailableDates(count).some((date) => date.iso === dateISO);
}
```

- [ ] **Step 10: Run the tests to verify they pass**

Run: `npm test -- src/lib/booking.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 11: Run the full test suite and commit**

Run: `npm test`
Expected: PASS (10 tests total)

```bash
git add package.json package-lock.json vitest.config.ts src/lib/booking-schemas.ts src/lib/booking-schemas.test.ts src/lib/booking.ts src/lib/booking.test.ts
git commit -m "feat: add shared booking zod schemas, candidate-date helper, Vitest scaffold"
```

---

### Task 2: Netlify Blobs booking store wrapper

**Files:**
- Create: `src/lib/booking-store.ts`
- Test: `src/lib/booking-store.test.ts`
- Modify: `package.json`
- Modify: `.env.local.example`

**Interfaces:**
- Consumes: `getTodayISO()` from `@/lib/booking` (Task 1).
- Produces: `BookingRecord` type `{ dateISO: string; name: string; email: string; note: string; status: "confirmed" | "cancelled"; createdAt: string }`, `generateManageToken(): string`, `reserveDate(dateISO: string, token: string): Promise<boolean>`, `freeDate(dateISO: string): Promise<void>`, `saveBookingRecord(token: string, record: BookingRecord): Promise<void>`, `getBookingByToken(token: string): Promise<BookingRecord | null>`, `listTakenDates(): Promise<string[]>`, `isManageable(record: BookingRecord, todayISO?: string): boolean` — all from `@/lib/booking-store`.

- [ ] **Step 1: Install dependencies**

Run:
```bash
npm install @netlify/blobs
npm install --save-dev netlify-cli
```

- [ ] **Step 2: Write the failing tests**

Create `src/lib/booking-store.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockStore = {
  set: vi.fn(),
  get: vi.fn(),
  setJSON: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
};

vi.mock("@netlify/blobs", () => ({
  getStore: vi.fn(() => mockStore),
}));

import {
  freeDate,
  generateManageToken,
  getBookingByToken,
  isManageable,
  listTakenDates,
  reserveDate,
  saveBookingRecord,
  type BookingRecord,
} from "./booking-store";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("generateManageToken", () => {
  it("generates unique, non-trivial tokens", () => {
    const a = generateManageToken();
    const b = generateManageToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(20);
  });
});

describe("reserveDate", () => {
  it("returns true when the date was not already taken", async () => {
    mockStore.set.mockResolvedValue({ modified: true, etag: "abc" });
    const result = await reserveDate("2026-08-10", "token-123");
    expect(result).toBe(true);
    expect(mockStore.set).toHaveBeenCalledWith("date:2026-08-10", "token-123", {
      onlyIfNew: true,
    });
  });

  it("returns false when the date is already taken", async () => {
    mockStore.set.mockResolvedValue({ modified: false });
    const result = await reserveDate("2026-08-10", "token-456");
    expect(result).toBe(false);
  });
});

describe("freeDate", () => {
  it("deletes the date key", async () => {
    await freeDate("2026-08-10");
    expect(mockStore.delete).toHaveBeenCalledWith("date:2026-08-10");
  });
});

describe("saveBookingRecord / getBookingByToken", () => {
  const record: BookingRecord = {
    dateISO: "2026-08-10",
    name: "Jane Doe",
    email: "jane@example.com",
    note: "Need help with invoicing.",
    status: "confirmed",
    createdAt: "2026-07-23T00:00:00.000Z",
  };

  it("writes the record under the token key", async () => {
    await saveBookingRecord("token-123", record);
    expect(mockStore.setJSON).toHaveBeenCalledWith("token:token-123", record);
  });

  it("reads the record back by token", async () => {
    mockStore.get.mockResolvedValue(record);
    const result = await getBookingByToken("token-123");
    expect(result).toEqual(record);
    expect(mockStore.get).toHaveBeenCalledWith("token:token-123", { type: "json" });
  });

  it("returns null when the token doesn't exist", async () => {
    mockStore.get.mockResolvedValue(null);
    const result = await getBookingByToken("missing-token");
    expect(result).toBeNull();
  });
});

describe("listTakenDates", () => {
  it("strips the date: prefix from each key", async () => {
    mockStore.list.mockResolvedValue({
      blobs: [{ key: "date:2026-08-10" }, { key: "date:2026-08-11" }],
      directories: [],
    });
    const result = await listTakenDates();
    expect(result).toEqual(["2026-08-10", "2026-08-11"]);
    expect(mockStore.list).toHaveBeenCalledWith({ prefix: "date:" });
  });
});

describe("isManageable", () => {
  const base: BookingRecord = {
    dateISO: "2026-08-10",
    name: "Jane Doe",
    email: "jane@example.com",
    note: "Note",
    status: "confirmed",
    createdAt: "2026-07-23T00:00:00.000Z",
  };

  it("is manageable when confirmed and today or later", () => {
    expect(isManageable(base, "2026-08-01")).toBe(true);
    expect(isManageable(base, "2026-08-10")).toBe(true);
  });

  it("is not manageable when cancelled", () => {
    expect(isManageable({ ...base, status: "cancelled" }, "2026-08-01")).toBe(false);
  });

  it("is not manageable once the date has passed", () => {
    expect(isManageable(base, "2026-08-11")).toBe(false);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test -- src/lib/booking-store.test.ts`
Expected: FAIL — `Cannot find module './booking-store'`.

- [ ] **Step 4: Implement the booking store**

Create `src/lib/booking-store.ts`:
```ts
import { randomBytes } from "node:crypto";

import { getStore } from "@netlify/blobs";

import { getTodayISO } from "@/lib/booking";

export type BookingStatus = "confirmed" | "cancelled";

export type BookingRecord = {
  dateISO: string;
  name: string;
  email: string;
  note: string;
  status: BookingStatus;
  createdAt: string;
};

/**
 * One Netlify Blobs store, two prefixed key namespaces:
 * `date:<iso>` (existence = taken, written with an atomic "only if new"
 * conditional — this is the actual double-booking guard, not a
 * check-then-write in application code) and `token:<manage_token>` (the
 * full booking record, looked up by the visitor's manage link).
 */
function getBookingBlobStore() {
  return getStore({ name: "bookings", consistency: "strong" });
}

export function generateManageToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function reserveDate(dateISO: string, token: string): Promise<boolean> {
  const store = getBookingBlobStore();
  const result = await store.set(`date:${dateISO}`, token, { onlyIfNew: true });
  return result.modified;
}

export async function freeDate(dateISO: string): Promise<void> {
  const store = getBookingBlobStore();
  await store.delete(`date:${dateISO}`);
}

export async function saveBookingRecord(token: string, record: BookingRecord): Promise<void> {
  const store = getBookingBlobStore();
  await store.setJSON(`token:${token}`, record);
}

export async function getBookingByToken(token: string): Promise<BookingRecord | null> {
  const store = getBookingBlobStore();
  const record = await store.get(`token:${token}`, { type: "json" });
  return (record as BookingRecord | null) ?? null;
}

export async function listTakenDates(): Promise<string[]> {
  const store = getBookingBlobStore();
  const { blobs } = await store.list({ prefix: "date:" });
  return blobs.map((blob) => blob.key.slice("date:".length));
}

export function isManageable(record: BookingRecord, todayISO: string = getTodayISO()): boolean {
  return record.status === "confirmed" && record.dateISO >= todayISO;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- src/lib/booking-store.test.ts`
Expected: PASS (10 tests)

- [ ] **Step 6: Document the local-dev requirement in `.env.local.example`**

Modify `.env.local.example` — append at the end of the file:
```
# --- Netlify Blobs (booking storage) ----------------------------------------
# No env vars needed here — Netlify injects Blobs access automatically for
# deployed sites. Locally, Blobs is ONLY reachable when running through the
# Netlify CLI's dev server (it provides a sandboxed local store), not plain
# `next dev`:
#
#   npx netlify dev
#
# `npx netlify link` (one-time, requires a free Netlify account + this site
# already existing on Netlify) may be needed first so the CLI knows which
# site's dev environment to emulate.
```

- [ ] **Step 7: Run the full suite and commit**

Run: `npm test`
Expected: PASS (20 tests total)

```bash
git add package.json package-lock.json src/lib/booking-store.ts src/lib/booking-store.test.ts .env.local.example
git commit -m "feat: add Netlify Blobs booking store with atomic conflict prevention"
```

---

### Task 3: Resend email helper + React Email template

**Files:**
- Create: `src/emails/booking-update-email.tsx`
- Create: `src/lib/email.ts`
- Test: `src/emails/booking-update-email.test.ts`
- Modify: `package.json`
- Modify: `.env.local.example`

**Interfaces:**
- Consumes: `formatSlotLabel(dateISO: string): string` from `@/lib/booking` (existing), `siteConfig` from `@/config/site` (existing, has `.domain`).
- Produces: `BookingUpdateEmail(props: { state: "confirmed" | "cancelled" | "rescheduled"; name: string; dateLabel: string; manageUrl: string }): ReactElement` from `@/emails/booking-update-email`. Produces `sendBookingUpdateEmail(params: { state: "confirmed" | "cancelled" | "rescheduled"; to: string; name: string; dateISO: string; manageToken: string }): Promise<void>` from `@/lib/email` — never throws, resolves once best-effort delivery is attempted.

- [ ] **Step 1: Install dependencies**

Run:
```bash
npm install resend @react-email/components @react-email/render
```

- [ ] **Step 2: Write the failing template tests**

Create `src/emails/booking-update-email.test.ts`:
```ts
import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";

import { BookingUpdateEmail } from "./booking-update-email";

const baseProps = {
  name: "Jane Doe",
  dateLabel: "Monday, August 10, 2026 · 4:00 – 4:30 PM ET",
  manageUrl: "https://aideployed.dev/book/manage/abc123",
};

describe("BookingUpdateEmail", () => {
  it("renders the confirmation state with the manage link", async () => {
    const html = await render(BookingUpdateEmail({ state: "confirmed", ...baseProps }));
    expect(html).toContain("Your call is booked");
    expect(html).toContain(baseProps.dateLabel);
    expect(html).toContain(baseProps.manageUrl);
  });

  it("renders the rescheduled state with the manage link", async () => {
    const html = await render(BookingUpdateEmail({ state: "rescheduled", ...baseProps }));
    expect(html).toContain("rescheduled");
    expect(html).toContain(baseProps.manageUrl);
  });

  it("renders the cancelled state without a manage link", async () => {
    const html = await render(BookingUpdateEmail({ state: "cancelled", ...baseProps }));
    expect(html).toContain("cancelled");
    expect(html).not.toContain(baseProps.manageUrl);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test -- src/emails/booking-update-email.test.ts`
Expected: FAIL — `Cannot find module './booking-update-email'`.

- [ ] **Step 4: Implement the template**

Create `src/emails/booking-update-email.tsx`:
```tsx
import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components";

type BookingEmailState = "confirmed" | "cancelled" | "rescheduled";

type BookingUpdateEmailProps = {
  state: BookingEmailState;
  name: string;
  dateLabel: string;
  manageUrl: string;
};

const HEADLINE: Record<BookingEmailState, string> = {
  confirmed: "Your call is booked",
  cancelled: "Your call has been cancelled",
  rescheduled: "Your call has been rescheduled",
};

export function BookingUpdateEmail({ state, name, dateLabel, manageUrl }: BookingUpdateEmailProps) {
  const headline = HEADLINE[state];

  return (
    <Html>
      <Head />
      <Preview>{headline}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f5f5f5", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px" }}>
          <Heading as="h1" style={{ fontSize: "20px" }}>
            {headline}
          </Heading>
          <Text>Hi {name},</Text>
          {state === "cancelled" ? (
            <Text>
              Your booking has been cancelled. If this wasn&apos;t you, just reply to this email.
            </Text>
          ) : (
            <Text>
              Your call is scheduled for <strong>{dateLabel}</strong>.
            </Text>
          )}
          {state !== "cancelled" && (
            <Text>
              Need to make a change? <Link href={manageUrl}>Reschedule or cancel here</Link>.
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- src/emails/booking-update-email.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 6: Implement the send helper**

Create `src/lib/email.ts`:
```ts
import { render } from "@react-email/render";
import { Resend } from "resend";

import { formatSlotLabel } from "@/lib/booking";
import { siteConfig } from "@/config/site";
import { BookingUpdateEmail } from "@/emails/booking-update-email";

type BookingEmailState = "confirmed" | "cancelled" | "rescheduled";

const FROM_ADDRESS = `AI Deployed Bookings <bookings@${siteConfig.domain}>`;

const SUBJECT: Record<BookingEmailState, string> = {
  confirmed: "You're booked with AI Deployed",
  cancelled: "Your AI Deployed booking was cancelled",
  rescheduled: "Your AI Deployed booking was rescheduled",
};

/**
 * Best-effort visitor-facing email. Never throws — a Resend outage must
 * never block or roll back a booking that's already durably reserved in
 * Netlify Blobs (see src/lib/booking-store.ts). Failures are logged
 * server-side only.
 */
export async function sendBookingUpdateEmail(params: {
  state: BookingEmailState;
  to: string;
  name: string;
  dateISO: string;
  manageToken: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("Booking email skipped: RESEND_API_KEY not configured.");
    return;
  }

  const manageUrl = `https://${siteConfig.domain}/book/manage/${params.manageToken}`;

  try {
    const html = await render(
      BookingUpdateEmail({
        state: params.state,
        name: params.name,
        dateLabel: formatSlotLabel(params.dateISO),
        manageUrl,
      })
    );

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [params.to],
      subject: SUBJECT[params.state],
      html,
    });

    if (error) {
      console.error("Booking email failed:", error);
    }
  } catch (error) {
    console.error("Booking email threw:", error);
  }
}
```

- [ ] **Step 7: Document `RESEND_API_KEY` in `.env.local.example`**

Modify `.env.local.example` — append at the end of the file:
```
# --- Resend (booking confirmation/cancellation/reschedule emails) ----------
# 1. Sign up free at https://resend.com.
# 2. Domains -> Add Domain -> aideployed.dev -> add the SPF/DKIM DNS records
#    Resend shows you at whatever host manages aideployed.dev's DNS.
#    Verification can take a few minutes to a few hours depending on DNS
#    propagation. Until verified, you can send test emails from Resend's
#    shared sandbox sender, but production visitor-facing sends require the
#    verified domain.
# 3. API Keys -> Create API Key (sending access) -> copy the value
#    immediately, it's only shown once.
RESEND_API_KEY=re_REPLACE_WITH_YOUR_RESEND_API_KEY
```

- [ ] **Step 8: Run the full suite and commit**

Run: `npm test`
Expected: PASS (23 tests total)

```bash
git add package.json package-lock.json src/emails/booking-update-email.tsx src/emails/booking-update-email.test.ts src/lib/email.ts .env.local.example
git commit -m "feat: add Resend confirmation/cancellation/reschedule email template + sender"
```

---

### Task 4: Wire persistence + conflict prevention + email into the booking-creation flow

**Files:**
- Modify: `src/app/api/book/route.ts`
- Modify: `src/components/booking/booking-flow.tsx`
- Modify: `src/app/book/page.tsx`
- Test: `src/app/api/book/route.test.ts`

**Interfaces:**
- Consumes (all from earlier tasks): `bookingSchema` (`@/lib/booking-schemas`), `generateManageToken`/`reserveDate`/`saveBookingRecord`/`freeDate`/`listTakenDates` (`@/lib/booking-store`), `sendBookingUpdateEmail` (`@/lib/email`), `formatSlotLabel` (`@/lib/booking`).
- Produces: `BookingFlow` now accepts an optional `taken?: string[]` prop (dates rendered disabled in the picker); `/api/book` now returns `409` (not just `400`/`500`/`502`) when the requested date is already taken.

- [ ] **Step 1: Write the failing route tests**

Create `src/app/api/book/route.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReserveDate = vi.fn();
const mockSaveBookingRecord = vi.fn();
const mockFreeDate = vi.fn();
const mockGenerateManageToken = vi.fn(() => "test-token");

vi.mock("@/lib/booking-store", () => ({
  reserveDate: mockReserveDate,
  saveBookingRecord: mockSaveBookingRecord,
  freeDate: mockFreeDate,
  generateManageToken: mockGenerateManageToken,
}));

const mockSendBookingUpdateEmail = vi.fn();
vi.mock("@/lib/email", () => ({
  sendBookingUpdateEmail: mockSendBookingUpdateEmail,
}));

import { POST } from "./route";

const validBody = {
  name: "Jane Doe",
  email: "jane@example.com",
  note: "Need help with invoicing.",
  dateISO: "2026-08-10",
};

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  process.env.TELEGRAM_BOT_TOKEN = "test-bot-token";
  process.env.TELEGRAM_CHAT_ID = "12345";
});

describe("POST /api/book", () => {
  it("returns 400 for invalid input", async () => {
    const res = await POST(buildRequest({ name: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 when the date is already taken, without saving a record", async () => {
    mockReserveDate.mockResolvedValue(false);
    const res = await POST(buildRequest(validBody));
    expect(res.status).toBe(409);
    expect(mockSaveBookingRecord).not.toHaveBeenCalled();
  });

  it("saves the booking and sends the confirmation email on success", async () => {
    mockReserveDate.mockResolvedValue(true);
    mockSaveBookingRecord.mockResolvedValue(undefined);

    const res = await POST(buildRequest(validBody));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(mockSaveBookingRecord).toHaveBeenCalledWith("test-token", {
      dateISO: "2026-08-10",
      name: "Jane Doe",
      email: "jane@example.com",
      note: "Need help with invoicing.",
      status: "confirmed",
      createdAt: expect.any(String),
    });
    expect(mockSendBookingUpdateEmail).toHaveBeenCalledWith({
      state: "confirmed",
      to: "jane@example.com",
      name: "Jane Doe",
      dateISO: "2026-08-10",
      manageToken: "test-token",
    });
  });

  it("frees the date and returns 500 if saving the record fails", async () => {
    mockReserveDate.mockResolvedValue(true);
    mockSaveBookingRecord.mockRejectedValue(new Error("blobs down"));

    const res = await POST(buildRequest(validBody));

    expect(res.status).toBe(500);
    expect(mockFreeDate).toHaveBeenCalledWith("2026-08-10");
  });

  it("still succeeds even if the Telegram notification fails", async () => {
    mockReserveDate.mockResolvedValue(true);
    mockSaveBookingRecord.mockResolvedValue(undefined);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const res = await POST(buildRequest(validBody));

    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/app/api/book/route.test.ts`
Expected: FAIL — current route has no 409 path and doesn't call the (not-yet-imported) store/email mocks.

- [ ] **Step 3: Rewrite the route handler**

Modify `src/app/api/book/route.ts` — replace the entire file:
```ts
import { NextResponse } from "next/server";

import { formatSlotLabel } from "@/lib/booking";
import { bookingSchema } from "@/lib/booking-schemas";
import { freeDate, generateManageToken, reserveDate, saveBookingRecord } from "@/lib/booking-store";
import { sendBookingUpdateEmail } from "@/lib/email";

/**
 * Server-only Route Handler for the native booking flow. Reserves the date
 * atomically in Netlify Blobs before persisting the full record — this is
 * what actually prevents two visitors from double-booking the same date,
 * not just the zod validation. Telegram and the visitor confirmation email
 * are both best-effort once the reservation succeeds: their failure is
 * logged but never turns an already-successful booking into a client-visible
 * error.
 */
const GENERIC_ERROR = "Booking is temporarily unavailable — please email instead.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking details." }, { status: 400 });
  }

  const { name, email, note, dateISO } = parsed.data;
  const manageToken = generateManageToken();

  const reserved = await reserveDate(dateISO, manageToken);

  if (!reserved) {
    return NextResponse.json(
      { error: "That slot was just taken — please pick another date." },
      { status: 409 }
    );
  }

  try {
    await saveBookingRecord(manageToken, {
      dateISO,
      name,
      email,
      note,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Booking failed: could not save booking record.", error);
    try {
      await freeDate(dateISO);
    } catch (cleanupError) {
      console.error("Booking failed: could not free orphaned date lock.", dateISO, cleanupError);
    }
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Booking notification skipped: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not configured.");
  } else {
    const message = [
      "New booking request",
      `Name: ${name}`,
      `Email: ${email}`,
      `When: ${formatSlotLabel(dateISO)}`,
      `Note: ${note}`,
    ].join("\n");

    try {
      const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message }),
      });

      if (!telegramRes.ok) {
        console.error("Booking notification failed: Telegram responded with", telegramRes.status);
      }
    } catch (error) {
      console.error("Booking notification failed: Telegram request threw.", error);
    }
  }

  await sendBookingUpdateEmail({ state: "confirmed", to: email, name, dateISO, manageToken });

  return NextResponse.json({ ok: true }, { status: 200 });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/app/api/book/route.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Add the `taken` prop to `BookingFlow` and handle 409**

Modify `src/components/booking/booking-flow.tsx` — replace the entire file:
```tsx
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BOOKING_SLOT_LABEL, formatSlotLabel, getAvailableDates } from "@/lib/booking";

type Step = "date" | "time" | "details" | "review" | "success";

const GENERIC_ERROR = "Couldn't send your booking — please try again.";

type BookingFlowProps = {
  /** ISO dates (YYYY-MM-DD) already booked — rendered disabled in the picker. */
  taken?: string[];
};

/**
 * Native 5-step booking flow (date -> time confirm -> details -> review ->
 * success). Hardcoded single-daily-slot availability (src/lib/booking.ts).
 * On confirm, POSTs to /api/book, which atomically reserves the date in
 * Netlify Blobs, relays a Telegram notification, and sends a confirmation
 * email with a reschedule/cancel link. A 409 response means another visitor
 * took the date first — the flow returns to the date step with an error.
 */
export function BookingFlow({ taken = [] }: BookingFlowProps) {
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takenSet = new Set(taken);
  const detailsValid = name.trim().length > 0 && email.includes("@") && note.trim().length > 0;

  async function handleConfirmBooking() {
    if (!selectedDate) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, note, dateISO: selectedDate }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = typeof body?.error === "string" ? body.error : GENERIC_ERROR;
        setSubmitting(false);

        if (res.status === 409) {
          setSelectedDate(null);
          setError(message);
          setStep("date");
          return;
        }

        setError(message);
        return;
      }

      setSubmitting(false);
      setStep("success");
    } catch {
      setSubmitting(false);
      setError(GENERIC_ERROR);
    }
  }

  if (step === "date") {
    const dates = getAvailableDates(21);
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold text-foreground">Pick a date</p>
        {error && (
          <div role="alert" className="rounded-lg border border-destructive p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {dates.map((date) => {
            const isTaken = takenSet.has(date.iso);
            return (
              <button
                key={date.iso}
                type="button"
                disabled={isTaken}
                onClick={() => {
                  setError(null);
                  setSelectedDate(date.iso);
                  setStep("time");
                }}
                className="flex flex-col items-start gap-1 rounded-lg border border-border bg-background p-4 text-left text-sm transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border"
              >
                <span className="font-semibold text-foreground">{date.label}</span>
                <span className="text-xs text-muted-foreground">
                  {isTaken ? "Taken" : BOOKING_SLOT_LABEL}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (step === "time" && selectedDate) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold text-foreground">Confirm time</p>
        <p className="rounded-lg border border-border bg-background p-4 text-base text-foreground">
          {formatSlotLabel(selectedDate)}
        </p>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => setStep("date")}>
            Back
          </Button>
          <Button type="button" onClick={() => setStep("details")}>
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  if (step === "details") {
    return (
      <div className="flex flex-col gap-5">
        <p className="text-sm font-semibold text-foreground">Your details</p>

        <div className="flex flex-col gap-2">
          <Label htmlFor="booking-name">Name</Label>
          <Input
            id="booking-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="booking-email">Email</Label>
          <Input
            id="booking-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="booking-note">What&apos;s going on?</Label>
          <Textarea
            id="booking-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            required
          />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => setStep("time")}>
            Back
          </Button>
          <Button type="button" disabled={!detailsValid} onClick={() => setStep("review")}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (step === "review" && selectedDate) {
    return (
      <div className="flex flex-col gap-5">
        <p className="text-sm font-semibold text-foreground">Review &amp; confirm</p>

        {error && (
          <div role="alert" className="rounded-lg border border-destructive p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4 text-sm text-foreground">
          <p>
            <span className="font-semibold">When:</span> {formatSlotLabel(selectedDate)}
          </p>
          <p>
            <span className="font-semibold">Name:</span> {name}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {email}
          </p>
          <p>
            <span className="font-semibold">Note:</span> {note}
          </p>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => setStep("details")} disabled={submitting}>
            Back
          </Button>
          <Button type="button" onClick={handleConfirmBooking} disabled={submitting}>
            {submitting ? "Booking…" : "Confirm Booking"}
          </Button>
        </div>
      </div>
    );
  }

  if (step === "success" && selectedDate) {
    return (
      <p
        role="status"
        className="rounded-lg border border-border bg-muted/40 p-6 text-base text-foreground"
      >
        You&apos;re booked for {formatSlotLabel(selectedDate)}. I&apos;ll email you a
        confirmation with a link to reschedule or cancel if anything changes.
      </p>
    );
  }

  return null;
}
```

- [ ] **Step 6: Pass taken dates in from the page**

Modify `src/app/book/page.tsx` — replace the entire file:
```tsx
import type { Metadata } from "next";
import Link from "next/link";

import { BookingFlow } from "@/components/booking/booking-flow";
import { siteConfig } from "@/config/site";
import { listTakenDates } from "@/lib/booking-store";

export const metadata: Metadata = {
  title: "Book Your Free Audit Call",
  description:
    "Grab 30 minutes for a plain conversation about where your business is losing time and money to manual work — no pitch.",
};

/**
 * /book — the single place the site's persistent CTA points (D-02).
 * Native, Cal.com-free multi-step booking flow: only <BookingFlow /> is a
 * Client Component; this page itself stays a Server Component so the
 * surrounding copy ships with zero extra client JS.
 */
export default async function BookPage() {
  const taken = await listTakenDates();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16 sm:px-8 sm:py-24">
      <div className="flex flex-col gap-4 text-center sm:text-left">
        <h1 className="text-[1.75rem] leading-[1.2] font-heading font-bold text-foreground">
          Book Your <span className="text-primary">Free Audit Call</span> with{" "}
          <Link
            href="/about"
            className="underline hover:text-primary transition-colors"
          >
            {siteConfig.founderName}
          </Link>
        </h1>
        <p className="text-base leading-[1.6] text-foreground">
          Thirty minutes, no slide deck — just a plain conversation about
          where your business is losing hours and dollars to manual
          busywork and workflows that don&apos;t run themselves.
          We&apos;ll figure out together whether there&apos;s a fast,
          worthwhile fix, and if there is, what it would take to build it.
        </p>
      </div>
      <div className="w-full">
        <BookingFlow taken={taken} />
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Run lint and the full suite, then commit**

Run: `npm run lint && npm test`
Expected: both PASS (28 tests total)

```bash
git add src/app/api/book/route.ts src/app/api/book/route.test.ts src/components/booking/booking-flow.tsx src/app/book/page.tsx
git commit -m "feat: persist bookings with atomic conflict prevention, disable taken dates, send confirmation email"
```

---

### Task 5: Cancel + reschedule Route Handlers

**Files:**
- Create: `src/app/api/book/manage/[token]/cancel/route.ts`
- Create: `src/app/api/book/manage/[token]/reschedule/route.ts`
- Test: `src/app/api/book/manage/[token]/cancel/route.test.ts`, `src/app/api/book/manage/[token]/reschedule/route.test.ts`

**Interfaces:**
- Consumes: `isCandidateDate` (`@/lib/booking`), `rescheduleSchema` (`@/lib/booking-schemas`), `getBookingByToken`/`isManageable`/`reserveDate`/`freeDate`/`saveBookingRecord` (`@/lib/booking-store`), `sendBookingUpdateEmail` (`@/lib/email`).
- Produces: `POST /api/book/manage/[token]/cancel` → `200 { ok: true }` or `404 { error }`. `POST /api/book/manage/[token]/reschedule` → `200 { ok: true }`, `400 { error }`, `404 { error }`, or `409 { error }`.

- [ ] **Step 1: Write the failing cancel-route tests**

Create `src/app/api/book/manage/[token]/cancel/route.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetBookingByToken = vi.fn();
const mockSaveBookingRecord = vi.fn();
const mockFreeDate = vi.fn();

vi.mock("@/lib/booking-store", () => ({
  getBookingByToken: mockGetBookingByToken,
  saveBookingRecord: mockSaveBookingRecord,
  freeDate: mockFreeDate,
  isManageable: (record: { status: string; dateISO: string }) =>
    record.status === "confirmed" && record.dateISO >= "2026-07-23",
}));

const mockSendBookingUpdateEmail = vi.fn();
vi.mock("@/lib/email", () => ({
  sendBookingUpdateEmail: mockSendBookingUpdateEmail,
}));

import { POST } from "./route";

const booking = {
  dateISO: "2026-08-10",
  name: "Jane Doe",
  email: "jane@example.com",
  note: "Note",
  status: "confirmed" as const,
  createdAt: "2026-07-23T00:00:00.000Z",
};

function buildParams(token: string) {
  return { params: Promise.resolve({ token }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  process.env.TELEGRAM_BOT_TOKEN = "test-bot-token";
  process.env.TELEGRAM_CHAT_ID = "12345";
});

describe("POST /api/book/manage/[token]/cancel", () => {
  it("returns 404 for an unknown token", async () => {
    mockGetBookingByToken.mockResolvedValue(null);
    const res = await POST(new Request("http://localhost"), buildParams("missing"));
    expect(res.status).toBe(404);
  });

  it("cancels the booking, frees the date, and emails the visitor", async () => {
    mockGetBookingByToken.mockResolvedValue(booking);
    const res = await POST(new Request("http://localhost"), buildParams("real-token"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(mockSaveBookingRecord).toHaveBeenCalledWith("real-token", {
      ...booking,
      status: "cancelled",
    });
    expect(mockFreeDate).toHaveBeenCalledWith("2026-08-10");
    expect(mockSendBookingUpdateEmail).toHaveBeenCalledWith({
      state: "cancelled",
      to: "jane@example.com",
      name: "Jane Doe",
      dateISO: "2026-08-10",
      manageToken: "real-token",
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/app/api/book/manage/[token]/cancel/route.test.ts`
Expected: FAIL — route file doesn't exist yet.

- [ ] **Step 3: Implement the cancel route**

Create `src/app/api/book/manage/[token]/cancel/route.ts`:
```ts
import { NextResponse } from "next/server";

import { freeDate, getBookingByToken, isManageable, saveBookingRecord } from "@/lib/booking-store";
import { sendBookingUpdateEmail } from "@/lib/email";

type RouteParams = { params: Promise<{ token: string }> };

const INVALID_TOKEN_ERROR = "This booking link is no longer valid.";

export async function POST(_request: Request, { params }: RouteParams) {
  const { token } = await params;
  const booking = await getBookingByToken(token);

  if (!booking || !isManageable(booking)) {
    return NextResponse.json({ error: INVALID_TOKEN_ERROR }, { status: 404 });
  }

  await saveBookingRecord(token, { ...booking, status: "cancelled" });
  await freeDate(booking.dateISO);

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Cancellation notification skipped: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not configured.");
  } else {
    try {
      const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Booking cancelled\nName: ${booking.name}\nEmail: ${booking.email}\nWas: ${booking.dateISO}`,
        }),
      });

      if (!telegramRes.ok) {
        console.error("Cancellation notification failed: Telegram responded with", telegramRes.status);
      }
    } catch (error) {
      console.error("Cancellation notification failed: Telegram request threw.", error);
    }
  }

  await sendBookingUpdateEmail({
    state: "cancelled",
    to: booking.email,
    name: booking.name,
    dateISO: booking.dateISO,
    manageToken: token,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/app/api/book/manage/[token]/cancel/route.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Write the failing reschedule-route tests**

Create `src/app/api/book/manage/[token]/reschedule/route.test.ts`. Note: `isCandidateDate` is deliberately left **unmocked** (real implementation from `@/lib/booking`) so the route's date-range gate is genuinely exercised — which means the "new date" used in these tests must be derived from the real `getAvailableDates()` at test-run time, not a hardcoded literal (a hardcoded future date drifts out of the 21-day visible window as real time passes and would start failing):
```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAvailableDates } from "@/lib/booking";

const mockGetBookingByToken = vi.fn();
const mockSaveBookingRecord = vi.fn();
const mockFreeDate = vi.fn();
const mockReserveDate = vi.fn();

vi.mock("@/lib/booking-store", () => ({
  getBookingByToken: mockGetBookingByToken,
  saveBookingRecord: mockSaveBookingRecord,
  freeDate: mockFreeDate,
  reserveDate: mockReserveDate,
  isManageable: (record: { status: string; dateISO: string }) =>
    record.status === "confirmed" && record.dateISO >= "2000-01-01",
}));

const mockSendBookingUpdateEmail = vi.fn();
vi.mock("@/lib/email", () => ({
  sendBookingUpdateEmail: mockSendBookingUpdateEmail,
}));

import { POST } from "./route";

// A fixed, always-in-the-past "current" booking date. It's never checked
// against isCandidateDate (only the *new* requested date is), so it can
// safely stay a fixed literal forever — unlike the new date below.
const booking = {
  dateISO: "2000-01-01",
  name: "Jane Doe",
  email: "jane@example.com",
  note: "Note",
  status: "confirmed" as const,
  createdAt: "2026-07-23T00:00:00.000Z",
};

const newDateISO = getAvailableDates(1)[0].iso;

function buildRequest(body: unknown) {
  return new Request("http://localhost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function buildParams(token: string) {
  return { params: Promise.resolve({ token }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  process.env.TELEGRAM_BOT_TOKEN = "test-bot-token";
  process.env.TELEGRAM_CHAT_ID = "12345";
});

describe("POST /api/book/manage/[token]/reschedule", () => {
  it("returns 400 for a malformed date", async () => {
    const res = await POST(buildRequest({ dateISO: "not-a-date" }), buildParams("real-token"));
    expect(res.status).toBe(400);
  });

  it("returns 400 for a date outside the visible candidate range", async () => {
    const res = await POST(buildRequest({ dateISO: "2099-01-01" }), buildParams("real-token"));
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown token", async () => {
    mockGetBookingByToken.mockResolvedValue(null);
    const res = await POST(buildRequest({ dateISO: newDateISO }), buildParams("missing"));
    expect(res.status).toBe(404);
  });

  it("returns 409 when the new date is already taken, leaving the old date untouched", async () => {
    mockGetBookingByToken.mockResolvedValue(booking);
    mockReserveDate.mockResolvedValue(false);

    const res = await POST(buildRequest({ dateISO: newDateISO }), buildParams("real-token"));

    expect(res.status).toBe(409);
    expect(mockFreeDate).not.toHaveBeenCalled();
    expect(mockSaveBookingRecord).not.toHaveBeenCalled();
  });

  it("moves the booking to the new date and emails the visitor", async () => {
    mockGetBookingByToken.mockResolvedValue(booking);
    mockReserveDate.mockResolvedValue(true);
    mockSaveBookingRecord.mockResolvedValue(undefined);

    const res = await POST(buildRequest({ dateISO: newDateISO }), buildParams("real-token"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(mockReserveDate).toHaveBeenCalledWith(newDateISO, "real-token");
    expect(mockSaveBookingRecord).toHaveBeenCalledWith("real-token", { ...booking, dateISO: newDateISO });
    expect(mockFreeDate).toHaveBeenCalledWith("2000-01-01");
    expect(mockSendBookingUpdateEmail).toHaveBeenCalledWith({
      state: "rescheduled",
      to: "jane@example.com",
      name: "Jane Doe",
      dateISO: newDateISO,
      manageToken: "real-token",
    });
  });
});
```

- [ ] **Step 6: Run the tests to verify they fail**

Run: `npm test -- src/app/api/book/manage/[token]/reschedule/route.test.ts`
Expected: FAIL — route file doesn't exist yet.

- [ ] **Step 7: Implement the reschedule route**

Create `src/app/api/book/manage/[token]/reschedule/route.ts`:
```ts
import { NextResponse } from "next/server";

import { isCandidateDate } from "@/lib/booking";
import { rescheduleSchema } from "@/lib/booking-schemas";
import { freeDate, getBookingByToken, isManageable, reserveDate, saveBookingRecord } from "@/lib/booking-store";
import { sendBookingUpdateEmail } from "@/lib/email";

type RouteParams = { params: Promise<{ token: string }> };

const GENERIC_ERROR = "Booking is temporarily unavailable — please try again.";
const INVALID_TOKEN_ERROR = "This booking link is no longer valid.";

export async function POST(request: Request, { params }: RouteParams) {
  const { token } = await params;
  const body = await request.json().catch(() => null);
  const parsed = rescheduleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }

  const { dateISO: newDateISO } = parsed.data;

  if (!isCandidateDate(newDateISO)) {
    return NextResponse.json({ error: "That date isn't available." }, { status: 400 });
  }

  const booking = await getBookingByToken(token);

  if (!booking || !isManageable(booking)) {
    return NextResponse.json({ error: INVALID_TOKEN_ERROR }, { status: 404 });
  }

  if (newDateISO === booking.dateISO) {
    return NextResponse.json({ error: "That's already your booked date." }, { status: 400 });
  }

  const reserved = await reserveDate(newDateISO, token);

  if (!reserved) {
    return NextResponse.json(
      { error: "That slot was just taken — please pick another date." },
      { status: 409 }
    );
  }

  try {
    await saveBookingRecord(token, { ...booking, dateISO: newDateISO });
  } catch (error) {
    console.error("Reschedule failed: could not update booking record.", error);
    try {
      await freeDate(newDateISO);
    } catch (cleanupError) {
      console.error("Reschedule failed: could not free orphaned date lock.", newDateISO, cleanupError);
    }
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }

  try {
    await freeDate(booking.dateISO);
  } catch (error) {
    console.error("Reschedule warning: could not free old date lock.", booking.dateISO, error);
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Reschedule notification skipped: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not configured.");
  } else {
    try {
      const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Booking rescheduled\nName: ${booking.name}\nEmail: ${booking.email}\nFrom: ${booking.dateISO}\nTo: ${newDateISO}`,
        }),
      });

      if (!telegramRes.ok) {
        console.error("Reschedule notification failed: Telegram responded with", telegramRes.status);
      }
    } catch (error) {
      console.error("Reschedule notification failed: Telegram request threw.", error);
    }
  }

  await sendBookingUpdateEmail({
    state: "rescheduled",
    to: booking.email,
    name: booking.name,
    dateISO: newDateISO,
    manageToken: token,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
```

- [ ] **Step 8: Run lint and the full suite, then commit**

Run: `npm run lint && npm test`
Expected: both PASS (35 tests total)

```bash
git add src/app/api/book/manage
git commit -m "feat: add cancel and reschedule Route Handlers for the manage-booking flow"
```

---

### Task 6: Manage-booking page + UI

**Files:**
- Create: `src/app/book/manage/[token]/page.tsx`
- Create: `src/components/booking/manage-booking.tsx`

**Interfaces:**
- Consumes: `getBookingByToken`/`isManageable`/`listTakenDates` (`@/lib/booking-store`), `formatSlotLabel`/`getAvailableDates`/`BOOKING_SLOT_LABEL` (`@/lib/booking`), `Button` (`@/components/ui/button`), the two Route Handlers from Task 5 (`/api/book/manage/[token]/cancel`, `/api/book/manage/[token]/reschedule`).
- Produces: `ManageBooking(props: { token: string; currentDateISO: string; taken: string[] }): JSX.Element` from `@/components/booking/manage-booking`, a Client Component.

- [ ] **Step 1: Implement the manage page**

Create `src/app/book/manage/[token]/page.tsx`:
```tsx
import type { Metadata } from "next";

import { ManageBooking } from "@/components/booking/manage-booking";
import { formatSlotLabel } from "@/lib/booking";
import { getBookingByToken, isManageable, listTakenDates } from "@/lib/booking-store";

export const metadata: Metadata = {
  title: "Manage Your Booking",
};

type ManageBookingPageProps = {
  params: Promise<{ token: string }>;
};

export default async function ManageBookingPage({ params }: ManageBookingPageProps) {
  const { token } = await params;
  const booking = await getBookingByToken(token);

  if (!booking || !isManageable(booking)) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16 text-center sm:px-8 sm:py-24">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          This booking link is no longer valid.
        </h1>
        <p className="text-base text-muted-foreground">
          If you still need to book or change a call, head back to the{" "}
          <a href="/book" className="underline hover:text-primary">
            booking page
          </a>
          .
        </p>
      </div>
    );
  }

  const taken = await listTakenDates();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16 sm:px-8 sm:py-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-heading font-bold text-foreground">Manage Your Booking</h1>
        <p className="text-base text-foreground">{formatSlotLabel(booking.dateISO)}</p>
      </div>
      <ManageBooking token={token} currentDateISO={booking.dateISO} taken={taken} />
    </div>
  );
}
```

- [ ] **Step 2: Implement the ManageBooking Client Component**

Create `src/components/booking/manage-booking.tsx`:
```tsx
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { BOOKING_SLOT_LABEL, formatSlotLabel, getAvailableDates } from "@/lib/booking";

type Mode = "idle" | "rescheduling" | "cancelled" | "rescheduled";

const GENERIC_ERROR = "Something went wrong — please try again.";

type ManageBookingProps = {
  token: string;
  currentDateISO: string;
  taken: string[];
};

export function ManageBooking({ token, currentDateISO, taken }: ManageBookingProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [dateISO, setDateISO] = useState(currentDateISO);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takenSet = new Set(taken.filter((iso) => iso !== currentDateISO));

  async function handleCancel() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/book/manage/${token}/cancel`, { method: "POST" });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(typeof body?.error === "string" ? body.error : GENERIC_ERROR);
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setMode("cancelled");
    } catch {
      setSubmitting(false);
      setError(GENERIC_ERROR);
    }
  }

  async function handleReschedule(newDateISO: string) {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/book/manage/${token}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateISO: newDateISO }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(typeof body?.error === "string" ? body.error : GENERIC_ERROR);
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setDateISO(newDateISO);
      setMode("rescheduled");
    } catch {
      setSubmitting(false);
      setError(GENERIC_ERROR);
    }
  }

  if (mode === "cancelled") {
    return (
      <p role="status" className="rounded-lg border border-border bg-muted/40 p-6 text-base text-foreground">
        Your booking has been cancelled. Head back to{" "}
        <a href="/book" className="underline hover:text-primary">
          /book
        </a>{" "}
        anytime to pick a new time.
      </p>
    );
  }

  if (mode === "rescheduled") {
    return (
      <p role="status" className="rounded-lg border border-border bg-muted/40 p-6 text-base text-foreground">
        You&apos;re rebooked for {formatSlotLabel(dateISO)}. I&apos;ll follow up by email
        beforehand.
      </p>
    );
  }

  if (mode === "rescheduling") {
    const dates = getAvailableDates(21);
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold text-foreground">Pick a new date</p>
        {error && (
          <div role="alert" className="rounded-lg border border-destructive p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {dates.map((date) => {
            const isTaken = takenSet.has(date.iso);
            return (
              <button
                key={date.iso}
                type="button"
                disabled={isTaken || submitting}
                onClick={() => handleReschedule(date.iso)}
                className="flex flex-col items-start gap-1 rounded-lg border border-border bg-background p-4 text-left text-sm transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border"
              >
                <span className="font-semibold text-foreground">{date.label}</span>
                <span className="text-xs text-muted-foreground">
                  {isTaken ? "Taken" : BOOKING_SLOT_LABEL}
                </span>
              </button>
            );
          })}
        </div>
        <Button type="button" variant="outline" onClick={() => setMode("idle")} disabled={submitting}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div role="alert" className="rounded-lg border border-destructive p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => setMode("rescheduling")} disabled={submitting}>
          Reschedule
        </Button>
        <Button type="button" variant="destructive" onClick={handleCancel} disabled={submitting}>
          {submitting ? "Cancelling…" : "Cancel booking"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run lint and the full suite, then commit**

Run: `npm run lint && npm test`
Expected: both PASS (35 tests total — this task adds UI only, no new automated tests; manual verification is Task 7)

```bash
git add src/app/book/manage/[token]/page.tsx src/components/booking/manage-booking.tsx
git commit -m "feat: add /book/manage/[token] page with reschedule/cancel UI"
```

---

### Task 7: Manual end-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Set local env vars**

Ensure `.env.local` (untracked) has `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (already set up per `260721-b89`), and the new `RESEND_API_KEY` from Task 3.

- [ ] **Step 2: Run the full build, lint, and test suite**

Run: `npm run lint && npm test && npm run build`
Expected: all three PASS with zero errors.

- [ ] **Step 3: Start the Netlify-aware dev server**

Run: `npx netlify dev`
Expected: server starts and Blobs calls succeed (no "Blobs context not configured" errors when visiting `/book`).

- [ ] **Step 4: Walk the happy path**

In a browser, visit `/book`, complete all 5 steps for a real test date, and confirm:
- The success screen appears.
- A Telegram message arrives.
- A confirmation email arrives (check the Resend dashboard's log if not using a verified domain yet) containing a `/book/manage/<token>` link.

- [ ] **Step 5: Walk the reschedule + cancel path**

Open the manage link from Step 4's email:
- Click **Reschedule**, pick a different date, confirm the success message shows the new date and a second Telegram message + email arrive.
- Revisit `/book` and confirm the *original* date is no longer marked "Taken" and the new date is.
- Open the manage link again, click **Cancel booking**, confirm the cancellation message, a third Telegram message, and a cancellation email arrive.
- Revisit `/book` and confirm the date is available again.

- [ ] **Step 6: Verify the concurrency guard**

Open `/book` in two browser tabs. In both, pick the same date and reach the review step. Submit Tab A, then immediately submit Tab B.
Expected: Tab A succeeds; Tab B is returned to the date step with **"That slot was just taken — please pick another date."**

- [ ] **Step 7: Verify an invalid manage link fails safely**

Visit `/book/manage/not-a-real-token`.
Expected: **"This booking link is no longer valid."** — no error thrown, no stack trace shown to the visitor.

No commit for this task — it's verification of the already-committed Tasks 1–6. If any step fails, fix the underlying task's code, re-run its tests, and amend that task's commit history with a new fix commit (not `--amend`) before re-verifying here.
