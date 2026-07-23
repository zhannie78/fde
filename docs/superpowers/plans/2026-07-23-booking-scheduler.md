# Booking Scheduler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **This plan replaces the earlier 2026-07-23 draft.** That draft assumed a single fixed daily slot; this version implements the full availability-management design (weekly template + date exceptions via a password-protected `/admin` page) from `docs/superpowers/specs/2026-07-22-booking-scheduler-design.md` (rev 2). No code from the earlier draft was written, so there is nothing to migrate.

**Goal:** Let the founder define a recurring weekly availability template and date-specific exceptions through a password-protected `/admin` page, and let visitors book/reschedule/cancel from a flat, date-ascending list of the next 21 open slots — with atomic double-booking prevention, a visitor confirmation email, and the existing Telegram notification preserved exactly as-is.

**Architecture:** Two Netlify Blobs stores: `availability` (weekly template + date overrides) and `bookings` (per-slot reservation locks + booking records, keyed by date **and** time now that a day can offer multiple slots). A thin `lib/slots.ts` orchestration layer combines both to produce the flat "next 21 slots" list. Admin auth is a shared-secret session cookie (HMAC-signed, timing-safe compared) checked in a Server Component layout (`/admin/(protected)/layout.tsx`) and inside each protected Route Handler — **not** in Next.js Middleware, because Netlify deploys Next.js Middleware as a Netlify Edge Function, whose Node-API support for `node:crypto` (needed for the HMAC/timing-safe check) is not something to gamble on; Route Handlers and Server Component rendering, by contrast, are documented by Netlify to run in the Node.js runtime.

**Tech Stack:** Next.js 16 (App Router, Route Handlers, Server Components, route groups), TypeScript, zod, `@netlify/blobs`, `resend`, `@react-email/components` + `@react-email/render`, Vitest (new to this repo), `node:crypto`.

## Global Constraints

- Node 20 (per `.nvmrc` / `netlify.toml` `NODE_VERSION`).
- Next.js 16 App Router: dynamic route `params` and `cookies()` are both `Promise`-returning and must be `await`ed.
- Never call `@netlify/blobs`, `resend`, or read `TELEGRAM_BOT_TOKEN`/`RESEND_API_KEY`/`ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET` from a Client Component — server-only (Route Handlers / Server Components).
- `src/lib/booking.ts` stays an isomorphic, framework-free module (no zod, no `"use client"`, no Blobs/Resend/crypto imports) — imported by both Client Components and Route Handlers.
- No Next.js Middleware for admin auth — use the Server Component layout + per-Route-Handler guard pattern described above (see Architecture).
- Email delivery (Resend) and the Telegram push are both best-effort: log failures via `console.error`, never throw back to the caller once a booking/cancellation/reschedule is already durably written to Blobs.
- Time-of-day values are always `"HH:mm"` 24-hour strings (e.g. `"09:00"`, `"14:30"`), always implicitly America/New_York — matches the native `<input type="time">` format, so no parsing/reformatting between admin form and storage.
- Meeting length is a fixed 30 minutes everywhere (matches the site's existing "Thirty minutes, no slide deck" copy) — not configurable.
- Match existing code style: double quotes, semicolons, `@/` import alias, no default exports except Next.js page/layout files.
- Design reference: `docs/superpowers/specs/2026-07-22-booking-scheduler-design.md` (rev 2, 21 slots).

---

### Task 1: Date/time helpers, shared zod schemas, Vitest scaffold

**Files:**
- Modify (full rewrite): `src/lib/booking.ts`
- Create: `src/lib/booking-schemas.ts`
- Create: `vitest.config.ts`
- Modify: `package.json`
- Test: `src/lib/booking.test.ts`, `src/lib/booking-schemas.test.ts`

**Interfaces:**
- Produces from `@/lib/booking`: `type Weekday = "sun"|"mon"|"tue"|"wed"|"thu"|"fri"|"sat"`, `getTodayISO(): string`, `addDaysISO(dateISO: string, days: number): string`, `getWeekday(dateISO: string): Weekday`, `formatTimeRangeLabel(time: string): string`, `formatSlotButtonLabel(dateISO: string, time: string): string`, `formatSlotLabel(dateISO: string, time: string): string`.
- Produces from `@/lib/booking-schemas`: `dateISOSchema`, `timeSchema`, `bookingSchema`, `rescheduleSchema`, `weeklyTemplateSchema`, `overrideSchema` (all zod schemas with `.safeParse()`).

- [ ] **Step 1: Install Vitest and add the test script**

Run:
```bash
npm install --save-dev vitest
```

Add to `package.json`'s `"scripts"` block:
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

- [ ] **Step 3: Write the failing tests for booking.ts**

Create `src/lib/booking.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import { addDaysISO, formatSlotButtonLabel, formatSlotLabel, formatTimeRangeLabel, getTodayISO, getWeekday } from "./booking";

describe("getTodayISO", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(getTodayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("addDaysISO", () => {
  it("returns the same date when adding 0 days", () => {
    expect(addDaysISO("2026-07-23", 0)).toBe("2026-07-23");
  });

  it("rolls over a leap-year February correctly", () => {
    expect(addDaysISO("2024-02-28", 1)).toBe("2024-02-29");
  });

  it("rolls over a non-leap-year February correctly", () => {
    expect(addDaysISO("2023-02-28", 1)).toBe("2023-03-01");
  });

  it("rolls over a year boundary correctly", () => {
    expect(addDaysISO("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("getWeekday", () => {
  it("returns the correct weekday for a fixed date", () => {
    expect(getWeekday("2026-07-23")).toBe("thu");
    expect(getWeekday("2000-01-01")).toBe("sat");
  });
});

describe("formatTimeRangeLabel", () => {
  it("formats a morning time", () => {
    expect(formatTimeRangeLabel("09:00")).toBe("9:00 AM – 9:30 AM ET");
  });

  it("formats an afternoon time crossing the hour", () => {
    expect(formatTimeRangeLabel("14:45")).toBe("2:45 PM – 3:15 PM ET");
  });

  it("formats a time crossing midnight", () => {
    expect(formatTimeRangeLabel("23:45")).toBe("11:45 PM – 12:15 AM ET");
  });
});

describe("formatSlotButtonLabel", () => {
  it("renders a compact date + start time", () => {
    expect(formatSlotButtonLabel("2026-07-23", "09:00")).toBe("Thu, Jul 23 · 9:00 AM");
  });
});

describe("formatSlotLabel", () => {
  it("renders a full date + time range", () => {
    expect(formatSlotLabel("2026-07-23", "09:00")).toBe("Thursday, July 23, 2026 · 9:00 AM – 9:30 AM ET");
  });
});
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `npm test -- src/lib/booking.test.ts`
Expected: FAIL — none of these exports exist on the current `booking.ts` yet.

- [ ] **Step 5: Rewrite booking.ts**

Modify `src/lib/booking.ts` — replace the entire file:
```ts
/**
 * Isomorphic date/slot helpers shared by Client Components and Route
 * Handlers/Server Components. Plain module — no "use client", no zod, no
 * Blobs — so both sides can import it without pulling in server- or
 * client-only code.
 *
 * Dates are represented as UTC-midnight-anchored epoch values derived from
 * a "YYYY-MM-DD" string, formatted with timeZone: "UTC" (never
 * "America/New_York") to avoid the off-by-one day shift that formatting a
 * UTC-midnight instant in the NY zone would introduce. "Today" itself is
 * anchored using the America/New_York wall-clock date (DST-safe).
 *
 * Time-of-day ("HH:mm" strings, e.g. "14:30") is always an
 * America/New_York wall-clock time by definition — every visitor-facing
 * slot is ET — so formatting it is plain integer math on hours/minutes,
 * no Date object or timezone conversion involved.
 */

const NY_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
});

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

const WEEKDAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseISO(dateISO: string): Date {
  const [year, month, day] = dateISO.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function todayNyUtcEpoch(): number {
  const [year, month, day] = NY_DATE_FORMATTER.format(new Date())
    .split("-")
    .map(Number);
  return Date.UTC(year, month - 1, day);
}

export function getTodayISO(): string {
  return new Date(todayNyUtcEpoch()).toISOString().slice(0, 10);
}

export function addDaysISO(dateISO: string, days: number): string {
  const shifted = new Date(parseISO(dateISO).getTime() + days * MS_PER_DAY);
  return shifted.toISOString().slice(0, 10);
}

export function getWeekday(dateISO: string): Weekday {
  return WEEKDAYS[parseISO(dateISO).getUTCDay()];
}

function formatClockTime(hour24: number, minute: number): string {
  const period = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minuteStr = minute.toString().padStart(2, "0");
  return `${hour12}:${minuteStr} ${period}`;
}

function parseTime(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(":").map(Number);
  return { hour, minute };
}

export function formatTimeRangeLabel(time: string): string {
  const { hour, minute } = parseTime(time);
  const startLabel = formatClockTime(hour, minute);
  const endTotalMinutes = hour * 60 + minute + 30;
  const endLabel = formatClockTime(Math.floor(endTotalMinutes / 60) % 24, endTotalMinutes % 60);
  return `${startLabel} – ${endLabel} ET`;
}

/** Compact label for picker buttons, e.g. "Thu, Jul 23 · 9:00 AM". */
export function formatSlotButtonLabel(dateISO: string, time: string): string {
  const { hour, minute } = parseTime(time);
  return `${SHORT_DATE_FORMATTER.format(parseISO(dateISO))} · ${formatClockTime(hour, minute)}`;
}

/** Full label for review/success/email copy, e.g. "Thursday, July 23, 2026 · 9:00 AM – 9:30 AM ET". */
export function formatSlotLabel(dateISO: string, time: string): string {
  return `${LONG_DATE_FORMATTER.format(parseISO(dateISO))} · ${formatTimeRangeLabel(time)}`;
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test -- src/lib/booking.test.ts`
Expected: PASS (11 tests)

- [ ] **Step 7: Write the failing tests for the shared zod schemas**

Create `src/lib/booking-schemas.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import { bookingSchema, overrideSchema, rescheduleSchema, weeklyTemplateSchema } from "./booking-schemas";

const validBooking = {
  name: "Jane Doe",
  email: "jane@example.com",
  note: "Need help with invoicing.",
  dateISO: "2026-08-10",
  time: "09:00",
};

describe("bookingSchema", () => {
  it("accepts a valid payload", () => {
    expect(bookingSchema.safeParse(validBooking).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(bookingSchema.safeParse({ ...validBooking, name: "  " }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(bookingSchema.safeParse({ ...validBooking, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects a malformed date", () => {
    expect(bookingSchema.safeParse({ ...validBooking, dateISO: "08/10/2026" }).success).toBe(false);
  });

  it("rejects a malformed time", () => {
    expect(bookingSchema.safeParse({ ...validBooking, time: "9:00" }).success).toBe(false);
  });

  it("rejects an out-of-range time", () => {
    expect(bookingSchema.safeParse({ ...validBooking, time: "25:00" }).success).toBe(false);
  });
});

describe("rescheduleSchema", () => {
  it("accepts a valid date + time", () => {
    expect(rescheduleSchema.safeParse({ dateISO: "2026-08-10", time: "09:00" }).success).toBe(true);
  });

  it("rejects a missing time", () => {
    expect(rescheduleSchema.safeParse({ dateISO: "2026-08-10" }).success).toBe(false);
  });
});

describe("weeklyTemplateSchema", () => {
  const validTemplate = {
    sun: [], mon: ["09:00"], tue: [], wed: ["09:00", "14:00"], thu: [], fri: [], sat: [],
  };

  it("accepts a valid template", () => {
    expect(weeklyTemplateSchema.safeParse(validTemplate).success).toBe(true);
  });

  it("rejects a missing weekday", () => {
    const { sun: _sun, ...incomplete } = validTemplate;
    expect(weeklyTemplateSchema.safeParse(incomplete).success).toBe(false);
  });

  it("rejects an invalid time within a day", () => {
    expect(weeklyTemplateSchema.safeParse({ ...validTemplate, mon: ["not-a-time"] }).success).toBe(false);
  });
});

describe("overrideSchema", () => {
  it("accepts a blocked-day override (empty times)", () => {
    expect(overrideSchema.safeParse({ dateISO: "2026-08-10", times: [] }).success).toBe(true);
  });

  it("accepts a custom-hours override", () => {
    expect(overrideSchema.safeParse({ dateISO: "2026-08-10", times: ["10:00", "15:30"] }).success).toBe(true);
  });

  it("rejects a malformed date", () => {
    expect(overrideSchema.safeParse({ dateISO: "not-a-date", times: [] }).success).toBe(false);
  });
});
```

- [ ] **Step 8: Run the tests to verify they fail**

Run: `npm test -- src/lib/booking-schemas.test.ts`
Expected: FAIL — `Cannot find module './booking-schemas'`.

- [ ] **Step 9: Create the shared schemas**

Create `src/lib/booking-schemas.ts`:
```ts
import { z } from "zod";

export const dateISOSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const bookingSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email(),
  note: z.string().trim().min(1).max(2000),
  dateISO: dateISOSchema,
  time: timeSchema,
});

export const rescheduleSchema = z.object({
  dateISO: dateISOSchema,
  time: timeSchema,
});

export const weeklyTemplateSchema = z.object({
  sun: z.array(timeSchema),
  mon: z.array(timeSchema),
  tue: z.array(timeSchema),
  wed: z.array(timeSchema),
  thu: z.array(timeSchema),
  fri: z.array(timeSchema),
  sat: z.array(timeSchema),
});

export const overrideSchema = z.object({
  dateISO: dateISOSchema,
  times: z.array(timeSchema),
});
```

- [ ] **Step 10: Run the tests to verify they pass, then run the full suite and commit**

Run: `npm test`
Expected: PASS (25 tests total)

```bash
git add package.json package-lock.json vitest.config.ts src/lib/booking.ts src/lib/booking.test.ts src/lib/booking-schemas.ts src/lib/booking-schemas.test.ts
git commit -m "feat: rewrite booking date/time helpers for multi-slot availability, add shared zod schemas and Vitest scaffold"
```

---

### Task 2: Netlify Blobs booking store (slot-keyed)

**Files:**
- Create: `src/lib/booking-store.ts`
- Test: `src/lib/booking-store.test.ts`
- Modify: `package.json`
- Modify: `.env.local.example`

**Interfaces:**
- Consumes: `getTodayISO()` from `@/lib/booking` (Task 1).
- Produces from `@/lib/booking-store`: `type BookingRecord = { dateISO: string; time: string; name: string; email: string; note: string; status: "confirmed" | "cancelled"; createdAt: string }`, `generateManageToken(): string`, `reserveSlot(dateISO: string, time: string, token: string): Promise<boolean>`, `freeSlot(dateISO: string, time: string): Promise<void>`, `saveBookingRecord(token: string, record: BookingRecord): Promise<void>`, `getBookingByToken(token: string): Promise<BookingRecord | null>`, `listTakenSlots(): Promise<{ dateISO: string; time: string }[]>`, `isManageable(record: BookingRecord, todayISO?: string): boolean`.

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
  freeSlot,
  generateManageToken,
  getBookingByToken,
  isManageable,
  listTakenSlots,
  reserveSlot,
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

describe("reserveSlot", () => {
  it("returns true when the slot was not already taken", async () => {
    mockStore.set.mockResolvedValue({ modified: true, etag: "abc" });
    const result = await reserveSlot("2026-08-10", "09:00", "token-123");
    expect(result).toBe(true);
    expect(mockStore.set).toHaveBeenCalledWith("slot:2026-08-10:09:00", "token-123", {
      onlyIfNew: true,
    });
  });

  it("returns false when the slot is already taken", async () => {
    mockStore.set.mockResolvedValue({ modified: false });
    const result = await reserveSlot("2026-08-10", "09:00", "token-456");
    expect(result).toBe(false);
  });
});

describe("freeSlot", () => {
  it("deletes the slot key", async () => {
    await freeSlot("2026-08-10", "09:00");
    expect(mockStore.delete).toHaveBeenCalledWith("slot:2026-08-10:09:00");
  });
});

describe("saveBookingRecord / getBookingByToken", () => {
  const record: BookingRecord = {
    dateISO: "2026-08-10",
    time: "09:00",
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

describe("listTakenSlots", () => {
  it("correctly splits date and time even though time itself contains a colon", async () => {
    mockStore.list.mockResolvedValue({
      blobs: [{ key: "slot:2026-08-10:09:00" }, { key: "slot:2026-08-10:14:30" }],
      directories: [],
    });
    const result = await listTakenSlots();
    expect(result).toEqual([
      { dateISO: "2026-08-10", time: "09:00" },
      { dateISO: "2026-08-10", time: "14:30" },
    ]);
    expect(mockStore.list).toHaveBeenCalledWith({ prefix: "slot:" });
  });
});

describe("isManageable", () => {
  const base: BookingRecord = {
    dateISO: "2026-08-10",
    time: "09:00",
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
  time: string;
  name: string;
  email: string;
  note: string;
  status: BookingStatus;
  createdAt: string;
};

/**
 * One Netlify Blobs store, two prefixed key namespaces:
 * `slot:<iso>:<time>` (existence = taken, written with an atomic "only if
 * new" conditional — this is the actual double-booking guard, not a
 * check-then-write in application code) and `token:<manage_token>` (the
 * full booking record, looked up by the visitor's manage link).
 *
 * Slot keys are parsed with fixed-width slicing (dateISO is always exactly
 * 10 characters), not a naive `.split(":")` — the time portion ("14:30")
 * itself contains a colon, which would otherwise corrupt a plain split.
 */
function getBookingBlobStore() {
  return getStore({ name: "bookings", consistency: "strong" });
}

function slotKey(dateISO: string, time: string): string {
  return `slot:${dateISO}:${time}`;
}

export function generateManageToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function reserveSlot(dateISO: string, time: string, token: string): Promise<boolean> {
  const store = getBookingBlobStore();
  const result = await store.set(slotKey(dateISO, time), token, { onlyIfNew: true });
  return result.modified;
}

export async function freeSlot(dateISO: string, time: string): Promise<void> {
  const store = getBookingBlobStore();
  await store.delete(slotKey(dateISO, time));
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

export async function listTakenSlots(): Promise<{ dateISO: string; time: string }[]> {
  const store = getBookingBlobStore();
  const { blobs } = await store.list({ prefix: "slot:" });
  return blobs.map((blob) => {
    const rest = blob.key.slice("slot:".length);
    return { dateISO: rest.slice(0, 10), time: rest.slice(11) };
  });
}

export function isManageable(record: BookingRecord, todayISO: string = getTodayISO()): boolean {
  return record.status === "confirmed" && record.dateISO >= todayISO;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- src/lib/booking-store.test.ts`
Expected: PASS (11 tests)

- [ ] **Step 6: Document the local-dev requirement in `.env.local.example`**

Modify `.env.local.example` — append at the end of the file:
```
# --- Netlify Blobs (booking + availability storage) -------------------------
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
Expected: PASS (36 tests total)

```bash
git add package.json package-lock.json src/lib/booking-store.ts src/lib/booking-store.test.ts .env.local.example
git commit -m "feat: add Netlify Blobs booking store with slot-keyed atomic conflict prevention"
```

---

### Task 3: Netlify Blobs availability store (weekly template + date exceptions)

**Files:**
- Create: `src/lib/availability-store.ts`
- Test: `src/lib/availability-store.test.ts`

**Interfaces:**
- Consumes: `type Weekday`, `getWeekday(dateISO: string): Weekday` from `@/lib/booking` (Task 1).
- Produces from `@/lib/availability-store`: `type WeeklyTemplate = Record<Weekday, string[]>`, `getWeeklyTemplate(): Promise<WeeklyTemplate>`, `saveWeeklyTemplate(template: WeeklyTemplate): Promise<void>`, `getOverrideForDate(dateISO: string): Promise<string[] | null>`, `setOverrideForDate(dateISO: string, times: string[]): Promise<void>`, `removeOverrideForDate(dateISO: string): Promise<void>`, `listOverrides(): Promise<{ dateISO: string; times: string[] }[]>`, `getSlotsForDate(dateISO: string): Promise<string[]>`.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/availability-store.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockStore = {
  get: vi.fn(),
  setJSON: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
};

vi.mock("@netlify/blobs", () => ({
  getStore: vi.fn(() => mockStore),
}));

import {
  getOverrideForDate,
  getSlotsForDate,
  getWeeklyTemplate,
  listOverrides,
  removeOverrideForDate,
  saveWeeklyTemplate,
  setOverrideForDate,
  type WeeklyTemplate,
} from "./availability-store";

beforeEach(() => {
  vi.clearAllMocks();
});

const template: WeeklyTemplate = {
  sun: [], mon: ["09:00"], tue: [], wed: ["09:00", "14:00"], thu: [], fri: ["10:00"], sat: [],
};

describe("getWeeklyTemplate", () => {
  it("returns the stored template", async () => {
    mockStore.get.mockResolvedValue(template);
    const result = await getWeeklyTemplate();
    expect(result).toEqual(template);
    expect(mockStore.get).toHaveBeenCalledWith("template", { type: "json" });
  });

  it("returns an all-empty default when nothing is stored yet", async () => {
    mockStore.get.mockResolvedValue(null);
    const result = await getWeeklyTemplate();
    expect(result).toEqual({ sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] });
  });
});

describe("saveWeeklyTemplate", () => {
  it("writes the whole template at once", async () => {
    await saveWeeklyTemplate(template);
    expect(mockStore.setJSON).toHaveBeenCalledWith("template", template);
  });
});

describe("getOverrideForDate / setOverrideForDate / removeOverrideForDate", () => {
  it("returns null when no override exists", async () => {
    mockStore.get.mockResolvedValue(null);
    expect(await getOverrideForDate("2026-08-10")).toBeNull();
  });

  it("returns the override's times when one exists", async () => {
    mockStore.get.mockResolvedValue({ times: ["11:00"] });
    expect(await getOverrideForDate("2026-08-10")).toEqual(["11:00"]);
  });

  it("returns an empty array for a blocked day (not null)", async () => {
    mockStore.get.mockResolvedValue({ times: [] });
    expect(await getOverrideForDate("2026-08-10")).toEqual([]);
  });

  it("writes an override under the date key", async () => {
    await setOverrideForDate("2026-08-10", ["11:00"]);
    expect(mockStore.setJSON).toHaveBeenCalledWith("override:2026-08-10", { times: ["11:00"] });
  });

  it("deletes the override key", async () => {
    await removeOverrideForDate("2026-08-10");
    expect(mockStore.delete).toHaveBeenCalledWith("override:2026-08-10");
  });
});

describe("listOverrides", () => {
  it("lists and sorts overrides by date", async () => {
    mockStore.list.mockResolvedValue({
      blobs: [{ key: "override:2026-08-15" }, { key: "override:2026-08-10" }],
      directories: [],
    });
    mockStore.get.mockImplementation((key: string) => {
      if (key === "override:2026-08-15") return Promise.resolve({ times: [] });
      if (key === "override:2026-08-10") return Promise.resolve({ times: ["11:00"] });
      return Promise.resolve(null);
    });

    const result = await listOverrides();

    expect(result).toEqual([
      { dateISO: "2026-08-10", times: ["11:00"] },
      { dateISO: "2026-08-15", times: [] },
    ]);
  });
});

describe("getSlotsForDate", () => {
  it("uses the override when one exists, sorted", async () => {
    mockStore.get.mockResolvedValue({ times: ["14:00", "09:00"] });
    expect(await getSlotsForDate("2026-08-10")).toEqual(["09:00", "14:00"]);
  });

  it("blocks the day when the override is an empty array", async () => {
    mockStore.get.mockResolvedValue({ times: [] });
    expect(await getSlotsForDate("2026-08-10")).toEqual([]);
  });

  it("falls back to the weekly template when no override exists", async () => {
    // 2026-07-27 is a Monday.
    mockStore.get.mockImplementation((key: string) => {
      if (key === "override:2026-07-27") return Promise.resolve(null);
      if (key === "template") return Promise.resolve(template);
      return Promise.resolve(null);
    });
    expect(await getSlotsForDate("2026-07-27")).toEqual(["09:00"]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/lib/availability-store.test.ts`
Expected: FAIL — `Cannot find module './availability-store'`.

- [ ] **Step 3: Implement the availability store**

Create `src/lib/availability-store.ts`:
```ts
import { getStore } from "@netlify/blobs";

import { getWeekday, type Weekday } from "@/lib/booking";

export type WeeklyTemplate = Record<Weekday, string[]>;

const EMPTY_TEMPLATE: WeeklyTemplate = {
  sun: [],
  mon: [],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
};

function getAvailabilityBlobStore() {
  return getStore({ name: "availability", consistency: "strong" });
}

export async function getWeeklyTemplate(): Promise<WeeklyTemplate> {
  const store = getAvailabilityBlobStore();
  const template = await store.get("template", { type: "json" });
  return (template as WeeklyTemplate | null) ?? EMPTY_TEMPLATE;
}

export async function saveWeeklyTemplate(template: WeeklyTemplate): Promise<void> {
  const store = getAvailabilityBlobStore();
  await store.setJSON("template", template);
}

export async function getOverrideForDate(dateISO: string): Promise<string[] | null> {
  const store = getAvailabilityBlobStore();
  const override = await store.get(`override:${dateISO}`, { type: "json" });
  if (!override) return null;
  return (override as { times: string[] }).times;
}

export async function setOverrideForDate(dateISO: string, times: string[]): Promise<void> {
  const store = getAvailabilityBlobStore();
  await store.setJSON(`override:${dateISO}`, { times });
}

export async function removeOverrideForDate(dateISO: string): Promise<void> {
  const store = getAvailabilityBlobStore();
  await store.delete(`override:${dateISO}`);
}

export async function listOverrides(): Promise<{ dateISO: string; times: string[] }[]> {
  const store = getAvailabilityBlobStore();
  const { blobs } = await store.list({ prefix: "override:" });

  const results = await Promise.all(
    blobs.map(async (blob) => {
      const dateISO = blob.key.slice("override:".length);
      const times = (await getOverrideForDate(dateISO)) ?? [];
      return { dateISO, times };
    })
  );

  return results.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}

export async function getSlotsForDate(dateISO: string): Promise<string[]> {
  const override = await getOverrideForDate(dateISO);
  if (override !== null) return [...override].sort();

  const template = await getWeeklyTemplate();
  return [...template[getWeekday(dateISO)]].sort();
}
```

- [ ] **Step 4: Run the tests to verify they pass, then run the full suite and commit**

Run: `npm test`
Expected: PASS (48 tests total)

```bash
git add src/lib/availability-store.ts src/lib/availability-store.test.ts
git commit -m "feat: add Netlify Blobs availability store (weekly template + date overrides)"
```

---

### Task 4: Upcoming-slots orchestration (`lib/slots.ts`)

**Files:**
- Create: `src/lib/slots.ts`
- Test: `src/lib/slots.test.ts`

**Interfaces:**
- Consumes: `addDaysISO`, `getTodayISO` from `@/lib/booking` (Task 1); `listTakenSlots` from `@/lib/booking-store` (Task 2); `getSlotsForDate` from `@/lib/availability-store` (Task 3).
- Produces from `@/lib/slots`: `type Slot = { dateISO: string; time: string }`, `listUpcomingSlots(count?: number, maxDaysToScan?: number): Promise<Slot[]>`.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/slots.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockListTakenSlots = vi.fn();
vi.mock("@/lib/booking-store", () => ({
  listTakenSlots: mockListTakenSlots,
}));

const mockGetSlotsForDate = vi.fn();
vi.mock("@/lib/availability-store", () => ({
  getSlotsForDate: mockGetSlotsForDate,
}));

import { listUpcomingSlots } from "./slots";

beforeEach(() => {
  vi.clearAllMocks();
  mockListTakenSlots.mockResolvedValue([]);
});

describe("listUpcomingSlots", () => {
  it("collects slots across days in chronological order until it reaches count", async () => {
    mockGetSlotsForDate.mockImplementation((dateISO: string) => {
      const day1 = { day1: ["09:00", "14:00"] }; // placeholder, overwritten below
      return Promise.resolve(["09:00", "14:00"]);
    });

    const result = await listUpcomingSlots(3);

    expect(result).toHaveLength(3);
    expect(result[0].time).toBe("09:00");
    expect(result[1].time).toBe("14:00");
    // Third slot comes from the following day, same times repeating.
    expect(result[2].dateISO).not.toBe(result[0].dateISO);
  });

  it("skips days with no configured slots", async () => {
    let callCount = 0;
    mockGetSlotsForDate.mockImplementation(() => {
      callCount += 1;
      // First two calls (days) are empty, third has one slot.
      return Promise.resolve(callCount <= 2 ? [] : ["09:00"]);
    });

    const result = await listUpcomingSlots(1);

    expect(result).toHaveLength(1);
    expect(result[0].time).toBe("09:00");
  });

  it("excludes already-taken slots", async () => {
    mockGetSlotsForDate.mockResolvedValue(["09:00"]);
    mockListTakenSlots.mockResolvedValue([{ dateISO: "will-not-match-anything", time: "09:00" }]);

    const result = await listUpcomingSlots(1, 2);

    // The taken fixture's dateISO never matches a real scanned date, so
    // every day's 09:00 should still be free and returned.
    expect(result).toHaveLength(1);
  });

  it("gives up after maxDaysToScan and returns fewer than count", async () => {
    mockGetSlotsForDate.mockResolvedValue([]);

    const result = await listUpcomingSlots(5, 10);

    expect(result).toHaveLength(0);
    expect(mockGetSlotsForDate).toHaveBeenCalledTimes(10);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/lib/slots.test.ts`
Expected: FAIL — `Cannot find module './slots'`.

- [ ] **Step 3: Implement the orchestration layer**

Create `src/lib/slots.ts`:
```ts
import { addDaysISO, getTodayISO } from "@/lib/booking";
import { getSlotsForDate } from "@/lib/availability-store";
import { listTakenSlots } from "@/lib/booking-store";

export type Slot = { dateISO: string; time: string };

/**
 * Scans forward day by day from today, collecting each day's configured
 * slots (weekly template or date override) minus whatever's already
 * booked, until `count` slots are gathered or `maxDaysToScan` days have
 * been checked. Days with no configured slots (e.g. an unconfigured
 * weekend) simply contribute zero and are skipped automatically.
 */
export async function listUpcomingSlots(count = 21, maxDaysToScan = 90): Promise<Slot[]> {
  const taken = new Set((await listTakenSlots()).map((slot) => `${slot.dateISO}|${slot.time}`));
  const results: Slot[] = [];
  const today = getTodayISO();

  for (let i = 0; i < maxDaysToScan && results.length < count; i++) {
    const dateISO = addDaysISO(today, i);
    const times = await getSlotsForDate(dateISO);

    for (const time of times) {
      if (results.length >= count) break;
      if (!taken.has(`${dateISO}|${time}`)) {
        results.push({ dateISO, time });
      }
    }
  }

  return results;
}
```

- [ ] **Step 4: Run the tests to verify they pass, then run the full suite and commit**

Run: `npm test`
Expected: PASS (52 tests total)

```bash
git add src/lib/slots.ts src/lib/slots.test.ts
git commit -m "feat: add listUpcomingSlots orchestration combining availability + taken slots"
```

---

### Task 5: Resend email helper + React Email template

**Files:**
- Create: `src/emails/booking-update-email.tsx`
- Create: `src/lib/email.ts`
- Test: `src/emails/booking-update-email.test.ts`
- Modify: `package.json`
- Modify: `.env.local.example`

**Interfaces:**
- Consumes: `formatSlotLabel(dateISO, time)` from `@/lib/booking` (Task 1); `siteConfig` from `@/config/site` (existing, has `.domain`).
- Produces: `BookingUpdateEmail(props: { state: "confirmed"|"cancelled"|"rescheduled"; name: string; dateLabel: string; manageUrl: string }): ReactElement` from `@/emails/booking-update-email`. `sendBookingUpdateEmail(params: { state: "confirmed"|"cancelled"|"rescheduled"; to: string; name: string; dateISO: string; time: string; manageToken: string }): Promise<void>` from `@/lib/email` — never throws.

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
  dateLabel: "Monday, August 10, 2026 · 9:00 AM – 9:30 AM ET",
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

import { siteConfig } from "@/config/site";
import { formatSlotLabel } from "@/lib/booking";
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
 * Netlify Blobs. Failures are logged server-side only.
 */
export async function sendBookingUpdateEmail(params: {
  state: BookingEmailState;
  to: string;
  name: string;
  dateISO: string;
  time: string;
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
        dateLabel: formatSlotLabel(params.dateISO, params.time),
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
Expected: PASS (55 tests total)

```bash
git add package.json package-lock.json src/emails/booking-update-email.tsx src/emails/booking-update-email.test.ts src/lib/email.ts .env.local.example
git commit -m "feat: add Resend confirmation/cancellation/reschedule email template + sender"
```

---

### Task 6: Admin auth (shared-secret session) + login/logout

**Files:**
- Create: `src/lib/admin-auth.ts`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/components/admin/login-form.tsx`
- Create: `src/app/api/admin/login/route.ts`
- Create: `src/app/api/admin/logout/route.ts`
- Test: `src/lib/admin-auth.test.ts`
- Modify: `.env.local.example`

**Interfaces:**
- Produces from `@/lib/admin-auth`: `SESSION_COOKIE_NAME: string`, `isValidPassword(password: string): boolean`, `getSessionCookieValue(): string | null`, `isValidSessionCookie(value: string | null | undefined): boolean`, `requireAdminSession(): Promise<boolean>`.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/admin-auth.test.ts`:
```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/lib/admin-auth.test.ts`
Expected: FAIL — `Cannot find module './admin-auth'`.

- [ ] **Step 3: Implement admin-auth.ts**

Create `src/lib/admin-auth.ts`:
```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/lib/admin-auth.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Implement the login/logout Route Handlers**

Create `src/app/api/admin/login/route.ts`:
```ts
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, getSessionCookieValue, isValidPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const sessionValue = getSessionCookieValue();

  if (!sessionValue) {
    console.error("Admin login failed: ADMIN_SESSION_SECRET not configured.");
    return NextResponse.json({ error: "Admin login is not configured." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
```

Create `src/app/api/admin/logout/route.ts`:
```ts
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
```

- [ ] **Step 6: Implement the login page + form**

Create `src/components/admin/login-form.tsx`:
```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GENERIC_ERROR = "Something went wrong — please try again.";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(typeof body?.error === "string" ? body.error : GENERIC_ERROR);
        setSubmitting(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setSubmitting(false);
      setError(GENERIC_ERROR);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div role="alert" className="rounded-lg border border-destructive p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
```

Create `src/app/admin/login/page.tsx`:
```tsx
import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Admin Login" };

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-heading font-bold text-foreground">Admin Login</h1>
      <LoginForm />
    </div>
  );
}
```

- [ ] **Step 7: Document `ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET` in `.env.local.example`**

Modify `.env.local.example` — append at the end of the file:
```
# --- Admin auth (availability management at /admin) -------------------------
# ADMIN_PASSWORD: the password you type in at /admin/login. Pick a long,
# random value.
# ADMIN_SESSION_SECRET: a separate random secret used to HMAC-sign the
# session cookie so the cookie itself never holds the plaintext password.
# Generate a strong value for each, e.g.:
#
#   openssl rand -hex 32
#
ADMIN_PASSWORD=REPLACE_WITH_A_LONG_RANDOM_PASSWORD
ADMIN_SESSION_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
```

- [ ] **Step 8: Run lint and the full suite, then commit**

Run: `npm run lint && npm test`
Expected: both PASS (62 tests total)

```bash
git add src/lib/admin-auth.ts src/lib/admin-auth.test.ts src/app/admin/login src/components/admin/login-form.tsx src/app/api/admin/login src/app/api/admin/logout .env.local.example
git commit -m "feat: add password-protected admin session auth with login/logout"
```

---

### Task 7: Admin dashboard (weekly template + exceptions editor)

**Files:**
- Create: `src/app/admin/(protected)/layout.tsx`
- Create: `src/app/admin/(protected)/page.tsx`
- Create: `src/components/admin/admin-dashboard.tsx`
- Create: `src/app/api/admin/template/route.ts`
- Create: `src/app/api/admin/override/route.ts`

**Interfaces:**
- Consumes: `requireAdminSession`, `SESSION_COOKIE_NAME`, `isValidSessionCookie` (`@/lib/admin-auth`, Task 6); `getWeeklyTemplate`/`saveWeeklyTemplate`/`getOverrideForDate`/`setOverrideForDate`/`removeOverrideForDate`/`listOverrides` (`@/lib/availability-store`, Task 3); `weeklyTemplateSchema`/`overrideSchema`/`dateISOSchema` (`@/lib/booking-schemas`, Task 1); `type Weekday` (`@/lib/booking`, Task 1).
- Produces: `/admin` page (protected), `AdminDashboard` Client Component, `POST /api/admin/template`, `POST /api/admin/override`, `DELETE /api/admin/override`.

- [ ] **Step 1: Implement the protected layout**

Create `src/app/admin/(protected)/layout.tsx`:
```tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { SESSION_COOKIE_NAME, isValidSessionCookie } from "@/lib/admin-auth";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!isValidSessionCookie(session)) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Implement the template + override Route Handlers**

Create `src/app/api/admin/template/route.ts`:
```ts
import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import { saveWeeklyTemplate } from "@/lib/availability-store";
import { weeklyTemplateSchema } from "@/lib/booking-schemas";

export async function POST(request: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = weeklyTemplateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid template." }, { status: 400 });
  }

  await saveWeeklyTemplate(parsed.data);
  return NextResponse.json({ ok: true });
}
```

Create `src/app/api/admin/override/route.ts`:
```ts
import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import { removeOverrideForDate, setOverrideForDate } from "@/lib/availability-store";
import { dateISOSchema, overrideSchema } from "@/lib/booking-schemas";

export async function POST(request: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = overrideSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid override." }, { status: 400 });
  }

  await setOverrideForDate(parsed.data.dateISO, parsed.data.times);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = dateISOSchema.safeParse(searchParams.get("dateISO"));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }

  await removeOverrideForDate(parsed.data);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Implement the AdminDashboard Client Component**

Create `src/components/admin/admin-dashboard.tsx`:
```tsx
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Weekday } from "@/lib/booking";
import type { WeeklyTemplate } from "@/lib/availability-store";

const WEEKDAY_ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const WEEKDAY_LABEL: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

type Override = { dateISO: string; times: string[] };

type AdminDashboardProps = {
  initialTemplate: WeeklyTemplate;
  initialOverrides: Override[];
};

export function AdminDashboard({ initialTemplate, initialOverrides }: AdminDashboardProps) {
  const [template, setTemplate] = useState<WeeklyTemplate>(initialTemplate);
  const [overrides, setOverrides] = useState<Override[]>(initialOverrides);
  const [templateStatus, setTemplateStatus] = useState<string | null>(null);
  const [templateSaving, setTemplateSaving] = useState(false);

  const [overrideDate, setOverrideDate] = useState("");
  const [overrideTimes, setOverrideTimes] = useState<string[]>([]);
  const [overrideStatus, setOverrideStatus] = useState<string | null>(null);
  const [overrideSaving, setOverrideSaving] = useState(false);

  function addTemplateTime(day: Weekday) {
    setTemplate((current) => ({ ...current, [day]: [...current[day], "09:00"] }));
  }

  function updateTemplateTime(day: Weekday, index: number, value: string) {
    setTemplate((current) => {
      const next = [...current[day]];
      next[index] = value;
      return { ...current, [day]: next };
    });
  }

  function removeTemplateTime(day: Weekday, index: number) {
    setTemplate((current) => ({
      ...current,
      [day]: current[day].filter((_, i) => i !== index),
    }));
  }

  async function handleSaveTemplate() {
    setTemplateSaving(true);
    setTemplateStatus(null);

    try {
      const res = await fetch("/api/admin/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });

      setTemplateSaving(false);
      setTemplateStatus(res.ok ? "Saved." : "Couldn't save — please try again.");
    } catch {
      setTemplateSaving(false);
      setTemplateStatus("Couldn't save — please try again.");
    }
  }

  function addOverrideTime() {
    setOverrideTimes((current) => [...current, "09:00"]);
  }

  function updateOverrideTime(index: number, value: string) {
    setOverrideTimes((current) => current.map((time, i) => (i === index ? value : time)));
  }

  function removeOverrideTime(index: number) {
    setOverrideTimes((current) => current.filter((_, i) => i !== index));
  }

  async function handleSaveOverride(blocked: boolean) {
    if (!overrideDate) return;
    setOverrideSaving(true);
    setOverrideStatus(null);

    const times = blocked ? [] : overrideTimes;

    try {
      const res = await fetch("/api/admin/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateISO: overrideDate, times }),
      });

      if (!res.ok) {
        setOverrideSaving(false);
        setOverrideStatus("Couldn't save — please try again.");
        return;
      }

      setOverrides((current) =>
        [...current.filter((item) => item.dateISO !== overrideDate), { dateISO: overrideDate, times }].sort(
          (a, b) => a.dateISO.localeCompare(b.dateISO)
        )
      );
      setOverrideSaving(false);
      setOverrideStatus("Saved.");
      setOverrideDate("");
      setOverrideTimes([]);
    } catch {
      setOverrideSaving(false);
      setOverrideStatus("Couldn't save — please try again.");
    }
  }

  async function handleRemoveOverride(dateISO: string) {
    await fetch(`/api/admin/override?dateISO=${dateISO}`, { method: "DELETE" });
    setOverrides((current) => current.filter((item) => item.dateISO !== dateISO));
  }

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-foreground">Weekly Template</h2>
        {WEEKDAY_ORDER.map((day) => (
          <div key={day} className="flex flex-col gap-2 border-b border-border pb-4">
            <p className="text-sm font-semibold text-foreground">{WEEKDAY_LABEL[day]}</p>
            <div className="flex flex-wrap gap-2">
              {template[day].map((time, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Input
                    type="time"
                    value={time}
                    onChange={(event) => updateTemplateTime(day, index, event.target.value)}
                    className="w-32"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeTemplateTime(day, index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addTemplateTime(day)}>
                Add time
              </Button>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-4">
          <Button type="button" onClick={handleSaveTemplate} disabled={templateSaving}>
            {templateSaving ? "Saving…" : "Save Template"}
          </Button>
          {templateStatus && <p className="text-sm text-muted-foreground">{templateStatus}</p>}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-foreground">Exceptions</h2>
        <div className="flex flex-col gap-3">
          <Input
            type="date"
            value={overrideDate}
            onChange={(event) => setOverrideDate(event.target.value)}
            className="w-48"
          />
          <div className="flex flex-wrap gap-2">
            {overrideTimes.map((time, index) => (
              <div key={index} className="flex items-center gap-1">
                <Input
                  type="time"
                  value={time}
                  onChange={(event) => updateOverrideTime(index, event.target.value)}
                  className="w-32"
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeOverrideTime(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addOverrideTime}>
              Add time
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              onClick={() => handleSaveOverride(false)}
              disabled={overrideSaving || !overrideDate}
            >
              Save custom hours
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleSaveOverride(true)}
              disabled={overrideSaving || !overrideDate}
            >
              Block this day
            </Button>
            {overrideStatus && <p className="text-sm text-muted-foreground">{overrideStatus}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">Upcoming exceptions</p>
          {overrides.length === 0 && <p className="text-sm text-muted-foreground">None set.</p>}
          {overrides.map((override) => (
            <div
              key={override.dateISO}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
            >
              <span>
                {override.dateISO} — {override.times.length === 0 ? "Blocked" : override.times.join(", ")}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveOverride(override.dateISO)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Implement the admin page**

Create `src/app/admin/(protected)/page.tsx`:
```tsx
import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getWeeklyTemplate, listOverrides } from "@/lib/availability-store";

export const metadata: Metadata = { title: "Availability Admin" };

export default async function AdminPage() {
  const [template, overrides] = await Promise.all([getWeeklyTemplate(), listOverrides()]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <h1 className="text-2xl font-heading font-bold text-foreground">Availability</h1>
      <AdminDashboard initialTemplate={template} initialOverrides={overrides} />
    </div>
  );
}
```

- [ ] **Step 5: Run lint and the full suite, then commit**

Run: `npm run lint && npm test`
Expected: both PASS (62 tests total — this task adds UI + protected routes with no new automated tests of their own; auth logic is already covered by Task 6's tests, and end-to-end admin behavior is verified manually in Task 11)

```bash
git add "src/app/admin/(protected)" src/components/admin/admin-dashboard.tsx src/app/api/admin/template src/app/api/admin/override
git commit -m "feat: add /admin weekly-template and exceptions dashboard"
```

---

### Task 8: Wire the booking-creation flow to slots + persistence + email

**Files:**
- Modify (full rewrite): `src/app/api/book/route.ts`
- Create: `src/app/api/book/slots/route.ts`
- Modify (full rewrite): `src/components/booking/booking-flow.tsx`
- Modify (full rewrite): `src/app/book/page.tsx`
- Test: `src/app/api/book/route.test.ts`

**Interfaces:**
- Consumes: `bookingSchema` (`@/lib/booking-schemas`, Task 1); `generateManageToken`/`reserveSlot`/`saveBookingRecord`/`freeSlot` (`@/lib/booking-store`, Task 2); `listUpcomingSlots` (`@/lib/slots`, Task 4); `sendBookingUpdateEmail` (`@/lib/email`, Task 5); `formatSlotButtonLabel`/`formatSlotLabel` (`@/lib/booking`, Task 1).
- Produces: `BookingFlow(props: { slots: { dateISO: string; time: string }[] })`; `/api/book` now takes `{ name, email, note, dateISO, time }` and returns `409` on conflict; `GET /api/book/slots` → `{ slots: Slot[] }`.

- [ ] **Step 1: Write the failing route tests**

Create `src/app/api/book/route.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReserveSlot = vi.fn();
const mockSaveBookingRecord = vi.fn();
const mockFreeSlot = vi.fn();
const mockGenerateManageToken = vi.fn(() => "test-token");

vi.mock("@/lib/booking-store", () => ({
  reserveSlot: mockReserveSlot,
  saveBookingRecord: mockSaveBookingRecord,
  freeSlot: mockFreeSlot,
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
  time: "09:00",
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

  it("returns 409 when the slot is already taken, without saving a record", async () => {
    mockReserveSlot.mockResolvedValue(false);
    const res = await POST(buildRequest(validBody));
    expect(res.status).toBe(409);
    expect(mockSaveBookingRecord).not.toHaveBeenCalled();
  });

  it("saves the booking and sends the confirmation email on success", async () => {
    mockReserveSlot.mockResolvedValue(true);
    mockSaveBookingRecord.mockResolvedValue(undefined);

    const res = await POST(buildRequest(validBody));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(mockReserveSlot).toHaveBeenCalledWith("2026-08-10", "09:00", "test-token");
    expect(mockSaveBookingRecord).toHaveBeenCalledWith("test-token", {
      dateISO: "2026-08-10",
      time: "09:00",
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
      time: "09:00",
      manageToken: "test-token",
    });
  });

  it("frees the slot and returns 500 if saving the record fails", async () => {
    mockReserveSlot.mockResolvedValue(true);
    mockSaveBookingRecord.mockRejectedValue(new Error("blobs down"));

    const res = await POST(buildRequest(validBody));

    expect(res.status).toBe(500);
    expect(mockFreeSlot).toHaveBeenCalledWith("2026-08-10", "09:00");
  });

  it("still succeeds even if the Telegram notification fails", async () => {
    mockReserveSlot.mockResolvedValue(true);
    mockSaveBookingRecord.mockResolvedValue(undefined);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const res = await POST(buildRequest(validBody));

    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/app/api/book/route.test.ts`
Expected: FAIL — current route still uses the old date-only shape.

- [ ] **Step 3: Rewrite the route handler**

Modify `src/app/api/book/route.ts` — replace the entire file:
```ts
import { NextResponse } from "next/server";

import { formatSlotLabel } from "@/lib/booking";
import { bookingSchema } from "@/lib/booking-schemas";
import { freeSlot, generateManageToken, reserveSlot, saveBookingRecord } from "@/lib/booking-store";
import { sendBookingUpdateEmail } from "@/lib/email";

/**
 * Server-only Route Handler for the native booking flow. Reserves the
 * slot atomically in Netlify Blobs before persisting the full record —
 * this is what actually prevents two visitors from double-booking the
 * same date+time, not just the zod validation. Telegram and the visitor
 * confirmation email are both best-effort once the reservation succeeds:
 * their failure is logged but never turns an already-successful booking
 * into a client-visible error.
 */
const GENERIC_ERROR = "Booking is temporarily unavailable — please email instead.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking details." }, { status: 400 });
  }

  const { name, email, note, dateISO, time } = parsed.data;
  const manageToken = generateManageToken();

  const reserved = await reserveSlot(dateISO, time, manageToken);

  if (!reserved) {
    return NextResponse.json(
      { error: "That slot was just taken — please pick another one." },
      { status: 409 }
    );
  }

  try {
    await saveBookingRecord(manageToken, {
      dateISO,
      time,
      name,
      email,
      note,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Booking failed: could not save booking record.", error);
    try {
      await freeSlot(dateISO, time);
    } catch (cleanupError) {
      console.error("Booking failed: could not free orphaned slot lock.", dateISO, time, cleanupError);
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
      `When: ${formatSlotLabel(dateISO, time)}`,
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

  await sendBookingUpdateEmail({ state: "confirmed", to: email, name, dateISO, time, manageToken });

  return NextResponse.json({ ok: true }, { status: 200 });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/app/api/book/route.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Add the slots-listing endpoint**

Create `src/app/api/book/slots/route.ts`:
```ts
import { NextResponse } from "next/server";

import { listUpcomingSlots } from "@/lib/slots";

export async function GET() {
  const slots = await listUpcomingSlots(21);
  return NextResponse.json({ slots });
}
```

- [ ] **Step 6: Rewrite BookingFlow for the flat slot list (4 steps)**

Modify `src/components/booking/booking-flow.tsx` — replace the entire file:
```tsx
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatSlotButtonLabel, formatSlotLabel } from "@/lib/booking";

type Step = "slot" | "details" | "review" | "success";
type Slot = { dateISO: string; time: string };

const GENERIC_ERROR = "Couldn't send your booking — please try again.";

type BookingFlowProps = {
  slots: Slot[];
};

/**
 * Native 4-step booking flow (pick slot -> details -> review -> success).
 * Availability comes from the admin-configured weekly template + date
 * exceptions (src/lib/slots.ts), passed in as a flat, date-ascending list
 * of up to 21 open slots. On confirm, POSTs to /api/book, which atomically
 * reserves the slot in Netlify Blobs, relays a Telegram notification, and
 * sends a confirmation email with a reschedule/cancel link. A 409 means
 * another visitor took the slot first — the flow returns to the slot step
 * with a fresh list.
 */
export function BookingFlow({ slots: initialSlots }: BookingFlowProps) {
  const [slots, setSlots] = useState(initialSlots);
  const [step, setStep] = useState<Step>("slot");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detailsValid = name.trim().length > 0 && email.includes("@") && note.trim().length > 0;

  async function refreshSlots() {
    try {
      const res = await fetch("/api/book/slots");
      if (res.ok) {
        const body = await res.json();
        setSlots(body.slots);
      }
    } catch {
      // Best-effort refresh; the visitor can still retry manually.
    }
  }

  async function handleConfirmBooking() {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          note,
          dateISO: selectedSlot.dateISO,
          time: selectedSlot.time,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = typeof body?.error === "string" ? body.error : GENERIC_ERROR;
        setSubmitting(false);

        if (res.status === 409) {
          setSelectedSlot(null);
          setError(message);
          setStep("slot");
          await refreshSlots();
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

  if (step === "slot") {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold text-foreground">Pick a time</p>
        {error && (
          <div role="alert" className="rounded-lg border border-destructive p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {slots.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No open times right now — please check back soon or reach out directly.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {slots.map((slot) => (
            <button
              key={`${slot.dateISO}T${slot.time}`}
              type="button"
              onClick={() => {
                setError(null);
                setSelectedSlot(slot);
                setStep("details");
              }}
              className="flex flex-col items-start gap-1 rounded-lg border border-border bg-background p-4 text-left text-sm transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span className="font-semibold text-foreground">
                {formatSlotButtonLabel(slot.dateISO, slot.time)}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "details" && selectedSlot) {
    return (
      <div className="flex flex-col gap-5">
        <p className="text-sm font-semibold text-foreground">Your details</p>
        <p className="rounded-lg border border-border bg-background p-4 text-base text-foreground">
          {formatSlotLabel(selectedSlot.dateISO, selectedSlot.time)}
        </p>

        <div className="flex flex-col gap-2">
          <Label htmlFor="booking-name">Name</Label>
          <Input id="booking-name" value={name} onChange={(event) => setName(event.target.value)} required />
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
          <Textarea id="booking-note" value={note} onChange={(event) => setNote(event.target.value)} required />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => setStep("slot")}>
            Back
          </Button>
          <Button type="button" disabled={!detailsValid} onClick={() => setStep("review")}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (step === "review" && selectedSlot) {
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
            <span className="font-semibold">When:</span> {formatSlotLabel(selectedSlot.dateISO, selectedSlot.time)}
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

  if (step === "success" && selectedSlot) {
    return (
      <p role="status" className="rounded-lg border border-border bg-muted/40 p-6 text-base text-foreground">
        You&apos;re booked for {formatSlotLabel(selectedSlot.dateISO, selectedSlot.time)}. I&apos;ll email you a
        confirmation with a link to reschedule or cancel if anything changes.
      </p>
    );
  }

  return null;
}
```

- [ ] **Step 7: Pass the initial slots list in from the page**

Modify `src/app/book/page.tsx` — replace the entire file:
```tsx
import type { Metadata } from "next";
import Link from "next/link";

import { BookingFlow } from "@/components/booking/booking-flow";
import { siteConfig } from "@/config/site";
import { listUpcomingSlots } from "@/lib/slots";

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
  const slots = await listUpcomingSlots(21);

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
        <BookingFlow slots={slots} />
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Run lint and the full suite, then commit**

Run: `npm run lint && npm test`
Expected: both PASS (67 tests total)

```bash
git add src/app/api/book/route.ts src/app/api/book/route.test.ts src/app/api/book/slots src/components/booking/booking-flow.tsx src/app/book/page.tsx
git commit -m "feat: wire booking creation to the flat next-21-slots list with atomic conflict prevention"
```

---

### Task 9: Cancel + reschedule Route Handlers

**Files:**
- Create: `src/app/api/book/manage/[token]/cancel/route.ts`
- Create: `src/app/api/book/manage/[token]/reschedule/route.ts`
- Test: `src/app/api/book/manage/[token]/cancel/route.test.ts`, `src/app/api/book/manage/[token]/reschedule/route.test.ts`

**Interfaces:**
- Consumes: `getSlotsForDate` (`@/lib/availability-store`, Task 3); `rescheduleSchema` (`@/lib/booking-schemas`, Task 1); `getBookingByToken`/`isManageable`/`reserveSlot`/`freeSlot`/`saveBookingRecord` (`@/lib/booking-store`, Task 2); `sendBookingUpdateEmail` (`@/lib/email`, Task 5).
- Produces: `POST /api/book/manage/[token]/cancel` → `200 { ok: true }` or `404 { error }`. `POST /api/book/manage/[token]/reschedule` → `200 { ok: true }`, `400 { error }`, `404 { error }`, or `409 { error }`.

- [ ] **Step 1: Write the failing cancel-route tests**

Create `src/app/api/book/manage/[token]/cancel/route.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetBookingByToken = vi.fn();
const mockSaveBookingRecord = vi.fn();
const mockFreeSlot = vi.fn();

vi.mock("@/lib/booking-store", () => ({
  getBookingByToken: mockGetBookingByToken,
  saveBookingRecord: mockSaveBookingRecord,
  freeSlot: mockFreeSlot,
  isManageable: (record: { status: string; dateISO: string }) =>
    record.status === "confirmed" && record.dateISO >= "2000-01-01",
}));

const mockSendBookingUpdateEmail = vi.fn();
vi.mock("@/lib/email", () => ({
  sendBookingUpdateEmail: mockSendBookingUpdateEmail,
}));

import { POST } from "./route";

const booking = {
  dateISO: "2026-08-10",
  time: "09:00",
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

  it("cancels the booking, frees the slot, and emails the visitor", async () => {
    mockGetBookingByToken.mockResolvedValue(booking);
    const res = await POST(new Request("http://localhost"), buildParams("real-token"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(mockSaveBookingRecord).toHaveBeenCalledWith("real-token", { ...booking, status: "cancelled" });
    expect(mockFreeSlot).toHaveBeenCalledWith("2026-08-10", "09:00");
    expect(mockSendBookingUpdateEmail).toHaveBeenCalledWith({
      state: "cancelled",
      to: "jane@example.com",
      name: "Jane Doe",
      dateISO: "2026-08-10",
      time: "09:00",
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

import { freeSlot, getBookingByToken, isManageable, saveBookingRecord } from "@/lib/booking-store";
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
  await freeSlot(booking.dateISO, booking.time);

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
          text: `Booking cancelled\nName: ${booking.name}\nEmail: ${booking.email}\nWas: ${booking.dateISO} ${booking.time}`,
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
    time: booking.time,
    manageToken: token,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/app/api/book/manage/[token]/cancel/route.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Write the failing reschedule-route tests**

Create `src/app/api/book/manage/[token]/reschedule/route.test.ts`. `getSlotsForDate` is mocked here (it's an availability-store concern, already covered by Task 3's own tests) so these tests can use fixed literal dates without needing to track the real calendar:
```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetBookingByToken = vi.fn();
const mockSaveBookingRecord = vi.fn();
const mockFreeSlot = vi.fn();
const mockReserveSlot = vi.fn();

vi.mock("@/lib/booking-store", () => ({
  getBookingByToken: mockGetBookingByToken,
  saveBookingRecord: mockSaveBookingRecord,
  freeSlot: mockFreeSlot,
  reserveSlot: mockReserveSlot,
  isManageable: (record: { status: string; dateISO: string }) =>
    record.status === "confirmed" && record.dateISO >= "2000-01-01",
}));

const mockGetSlotsForDate = vi.fn();
vi.mock("@/lib/availability-store", () => ({
  getSlotsForDate: mockGetSlotsForDate,
}));

const mockSendBookingUpdateEmail = vi.fn();
vi.mock("@/lib/email", () => ({
  sendBookingUpdateEmail: mockSendBookingUpdateEmail,
}));

import { POST } from "./route";

const booking = {
  dateISO: "2000-01-01",
  time: "09:00",
  name: "Jane Doe",
  email: "jane@example.com",
  note: "Note",
  status: "confirmed" as const,
  createdAt: "2026-07-23T00:00:00.000Z",
};

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
  mockGetSlotsForDate.mockResolvedValue(["14:00"]);
});

describe("POST /api/book/manage/[token]/reschedule", () => {
  it("returns 400 for a malformed date", async () => {
    const res = await POST(buildRequest({ dateISO: "not-a-date", time: "14:00" }), buildParams("real-token"));
    expect(res.status).toBe(400);
  });

  it("returns 400 when the requested time isn't actually offered that day", async () => {
    mockGetSlotsForDate.mockResolvedValue(["10:00"]); // 14:00 not in the list
    const res = await POST(buildRequest({ dateISO: "2026-08-15", time: "14:00" }), buildParams("real-token"));
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown token", async () => {
    mockGetBookingByToken.mockResolvedValue(null);
    const res = await POST(buildRequest({ dateISO: "2026-08-15", time: "14:00" }), buildParams("missing"));
    expect(res.status).toBe(404);
  });

  it("returns 409 when the new slot is already taken, leaving the old slot untouched", async () => {
    mockGetBookingByToken.mockResolvedValue(booking);
    mockReserveSlot.mockResolvedValue(false);

    const res = await POST(buildRequest({ dateISO: "2026-08-15", time: "14:00" }), buildParams("real-token"));

    expect(res.status).toBe(409);
    expect(mockFreeSlot).not.toHaveBeenCalled();
    expect(mockSaveBookingRecord).not.toHaveBeenCalled();
  });

  it("moves the booking to the new slot and emails the visitor", async () => {
    mockGetBookingByToken.mockResolvedValue(booking);
    mockReserveSlot.mockResolvedValue(true);
    mockSaveBookingRecord.mockResolvedValue(undefined);

    const res = await POST(buildRequest({ dateISO: "2026-08-15", time: "14:00" }), buildParams("real-token"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(mockReserveSlot).toHaveBeenCalledWith("2026-08-15", "14:00", "real-token");
    expect(mockSaveBookingRecord).toHaveBeenCalledWith("real-token", {
      ...booking,
      dateISO: "2026-08-15",
      time: "14:00",
    });
    expect(mockFreeSlot).toHaveBeenCalledWith("2000-01-01", "09:00");
    expect(mockSendBookingUpdateEmail).toHaveBeenCalledWith({
      state: "rescheduled",
      to: "jane@example.com",
      name: "Jane Doe",
      dateISO: "2026-08-15",
      time: "14:00",
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

import { getSlotsForDate } from "@/lib/availability-store";
import { rescheduleSchema } from "@/lib/booking-schemas";
import { freeSlot, getBookingByToken, isManageable, reserveSlot, saveBookingRecord } from "@/lib/booking-store";
import { sendBookingUpdateEmail } from "@/lib/email";

type RouteParams = { params: Promise<{ token: string }> };

const GENERIC_ERROR = "Booking is temporarily unavailable — please try again.";
const INVALID_TOKEN_ERROR = "This booking link is no longer valid.";

export async function POST(request: Request, { params }: RouteParams) {
  const { token } = await params;
  const body = await request.json().catch(() => null);
  const parsed = rescheduleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid date/time." }, { status: 400 });
  }

  const { dateISO: newDateISO, time: newTime } = parsed.data;
  const offeredTimes = await getSlotsForDate(newDateISO);

  if (!offeredTimes.includes(newTime)) {
    return NextResponse.json({ error: "That time isn't available." }, { status: 400 });
  }

  const booking = await getBookingByToken(token);

  if (!booking || !isManageable(booking)) {
    return NextResponse.json({ error: INVALID_TOKEN_ERROR }, { status: 404 });
  }

  if (newDateISO === booking.dateISO && newTime === booking.time) {
    return NextResponse.json({ error: "That's already your booked time." }, { status: 400 });
  }

  const reserved = await reserveSlot(newDateISO, newTime, token);

  if (!reserved) {
    return NextResponse.json(
      { error: "That slot was just taken — please pick another one." },
      { status: 409 }
    );
  }

  try {
    await saveBookingRecord(token, { ...booking, dateISO: newDateISO, time: newTime });
  } catch (error) {
    console.error("Reschedule failed: could not update booking record.", error);
    try {
      await freeSlot(newDateISO, newTime);
    } catch (cleanupError) {
      console.error("Reschedule failed: could not free orphaned slot lock.", newDateISO, newTime, cleanupError);
    }
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }

  try {
    await freeSlot(booking.dateISO, booking.time);
  } catch (error) {
    console.error("Reschedule warning: could not free old slot lock.", booking.dateISO, booking.time, error);
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
          text: `Booking rescheduled\nName: ${booking.name}\nEmail: ${booking.email}\nFrom: ${booking.dateISO} ${booking.time}\nTo: ${newDateISO} ${newTime}`,
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
    time: newTime,
    manageToken: token,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
```

- [ ] **Step 8: Run lint and the full suite, then commit**

Run: `npm run lint && npm test`
Expected: both PASS (74 tests total)

```bash
git add src/app/api/book/manage
git commit -m "feat: add cancel and reschedule Route Handlers for the slot-based manage flow"
```

---

### Task 10: Manage-booking page + UI

**Files:**
- Create: `src/app/book/manage/[token]/page.tsx`
- Create: `src/components/booking/manage-booking.tsx`

**Interfaces:**
- Consumes: `getBookingByToken`/`isManageable` (`@/lib/booking-store`, Task 2); `formatSlotButtonLabel`/`formatSlotLabel` (`@/lib/booking`, Task 1); `Button` (`@/components/ui/button`); `GET /api/book/slots` (Task 8); the two Route Handlers from Task 9.
- Produces: `ManageBooking(props: { token: string; currentDateISO: string; currentTime: string }): JSX.Element` from `@/components/booking/manage-booking`, a Client Component.

- [ ] **Step 1: Implement the manage page**

Create `src/app/book/manage/[token]/page.tsx`:
```tsx
import type { Metadata } from "next";

import { ManageBooking } from "@/components/booking/manage-booking";
import { formatSlotLabel } from "@/lib/booking";
import { getBookingByToken, isManageable } from "@/lib/booking-store";

export const metadata: Metadata = { title: "Manage Your Booking" };

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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16 sm:px-8 sm:py-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-heading font-bold text-foreground">Manage Your Booking</h1>
        <p className="text-base text-foreground">{formatSlotLabel(booking.dateISO, booking.time)}</p>
      </div>
      <ManageBooking token={token} currentDateISO={booking.dateISO} currentTime={booking.time} />
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
import { formatSlotButtonLabel, formatSlotLabel } from "@/lib/booking";

type Slot = { dateISO: string; time: string };
type Mode = "idle" | "loadingSlots" | "rescheduling" | "cancelled" | "rescheduled";

const GENERIC_ERROR = "Something went wrong — please try again.";

type ManageBookingProps = {
  token: string;
  currentDateISO: string;
  currentTime: string;
};

export function ManageBooking({ token, currentDateISO, currentTime }: ManageBookingProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [dateISO, setDateISO] = useState(currentDateISO);
  const [time, setTime] = useState(currentTime);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openReschedule() {
    setMode("loadingSlots");
    setError(null);

    try {
      const res = await fetch("/api/book/slots");
      const body = await res.json();
      const filtered = (body.slots as Slot[]).filter(
        (slot) => !(slot.dateISO === currentDateISO && slot.time === currentTime)
      );
      setSlots(filtered);
      setMode("rescheduling");
    } catch {
      setError(GENERIC_ERROR);
      setMode("idle");
    }
  }

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

  async function handleReschedule(slot: Slot) {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/book/manage/${token}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateISO: slot.dateISO, time: slot.time }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(typeof body?.error === "string" ? body.error : GENERIC_ERROR);
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setDateISO(slot.dateISO);
      setTime(slot.time);
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
        You&apos;re rebooked for {formatSlotLabel(dateISO, time)}. I&apos;ll follow up by email beforehand.
      </p>
    );
  }

  if (mode === "loadingSlots") {
    return <p className="text-sm text-muted-foreground">Loading available times…</p>;
  }

  if (mode === "rescheduling") {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold text-foreground">Pick a new time</p>
        {error && (
          <div role="alert" className="rounded-lg border border-destructive p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {slots.length === 0 && <p className="text-sm text-muted-foreground">No other open times right now.</p>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {slots.map((slot) => (
            <button
              key={`${slot.dateISO}T${slot.time}`}
              type="button"
              disabled={submitting}
              onClick={() => handleReschedule(slot)}
              className="flex flex-col items-start gap-1 rounded-lg border border-border bg-background p-4 text-left text-sm transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="font-semibold text-foreground">
                {formatSlotButtonLabel(slot.dateISO, slot.time)}
              </span>
            </button>
          ))}
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
        <Button type="button" variant="outline" onClick={openReschedule} disabled={submitting}>
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
Expected: both PASS (74 tests total — this task adds UI only, no new automated tests; manual verification is Task 11)

```bash
git add src/app/book/manage/[token]/page.tsx src/components/booking/manage-booking.tsx
git commit -m "feat: add /book/manage/[token] page with slot-based reschedule/cancel UI"
```

---

### Task 11: Manual end-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Set local env vars**

Ensure `.env.local` (untracked) has `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (already set up per `260721-b89`), and the new `RESEND_API_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` from Tasks 5–6.

- [ ] **Step 2: Run the full build, lint, and test suite**

Run: `npm run lint && npm test && npm run build`
Expected: all three PASS with zero errors.

- [ ] **Step 3: Start the Netlify-aware dev server**

Run: `npx netlify dev`
Expected: server starts and Blobs calls succeed (no "Blobs context not configured" errors when visiting `/book` or `/admin`).

- [ ] **Step 4: Verify admin auth**

Visit `/admin` directly without logging in.
Expected: redirected to `/admin/login`. Enter an incorrect password — expect "Incorrect password." Enter the correct `ADMIN_PASSWORD` — expect redirect to `/admin` showing the dashboard.

- [ ] **Step 5: Set an initial weekly template and confirm it reaches `/book`**

On `/admin`, add at least one time (e.g. `09:00`) to two different weekdays, click **Save Template**. Visit `/book` and confirm the next 21 slots reflect those two weekdays' times, in ascending date order, with no slots on unconfigured weekdays.

- [ ] **Step 6: Set a date exception and confirm it overrides the template**

On `/admin`, pick an upcoming date that falls on one of the two configured weekdays, add a different custom time (e.g. `13:00`), click **Save custom hours**. Confirm `/book` now shows only `13:00` for that specific date (not the weekday's usual template time). Then set another upcoming date to **Block this day** and confirm `/book` shows zero slots for that date.

- [ ] **Step 7: Walk the happy booking path**

On `/book`, complete all 4 steps for a real test slot, and confirm:
- The success screen appears.
- A Telegram message arrives with the correct date+time.
- A confirmation email arrives (check the Resend dashboard's log if not using a verified domain yet) containing a `/book/manage/<token>` link.

- [ ] **Step 8: Walk the reschedule + cancel path**

Open the manage link from Step 7's email:
- Click **Reschedule**, pick a different open slot, confirm the success message shows the new time and a second Telegram message + email arrive.
- Revisit `/book` and confirm the *original* slot is no longer marked taken and the new one is.
- Open the manage link again, click **Cancel booking**, confirm the cancellation message, a third Telegram message, and a cancellation email arrive.
- Revisit `/book` and confirm the slot is available again.

- [ ] **Step 9: Verify the concurrency guard**

Open `/book` in two browser tabs. In both, pick the same slot and reach the review step. Submit Tab A, then immediately submit Tab B.
Expected: Tab A succeeds; Tab B is returned to the slot step (with a refreshed list) showing **"That slot was just taken — please pick another one."**

- [ ] **Step 10: Verify an invalid manage link fails safely**

Visit `/book/manage/not-a-real-token`.
Expected: **"This booking link is no longer valid."** — no error thrown, no stack trace shown to the visitor.

No commit for this task — it's verification of the already-committed Tasks 1–10. If any step fails, fix the underlying task's code, re-run its tests, and add a new fix commit (not `--amend`) before re-verifying here.
