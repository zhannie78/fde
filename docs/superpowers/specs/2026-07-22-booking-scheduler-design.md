# Booking Scheduler: Persistence, Conflict Prevention, Manage Flow

## Context

`/book` currently renders a native 5-step flow (date → time confirm → details → review → success) built in quick task `260721-b89`. It has no persistence: confirming a booking only sends a Telegram message to the founder via `/api/book`. This means:

- Two visitors can pick the same date and both get "confirmed" — no conflict prevention.
- The visitor gets no email record and no way to reschedule or cancel afterward.

This spec covers closing both gaps. The single-hardcoded-daily-slot availability model (`BOOKING_SLOT_LABEL`, one slot per calendar day) is unchanged — real multi-slot availability was explicitly out of scope for this round.

**Revision note (2026-07-23):** the original draft of this spec used Supabase for storage. Swapped to **Netlify Blobs** instead — it ships free on every Netlify plan (including the Free plan this site already runs on), requires no new account/signup, and has no inactivity auto-pause risk the way Supabase's free tier does. Resend remains the email provider (its free tier — 100/day, 3,000/month — comfortably and permanently covers this site's booking volume with no expiry).

## Goals

1. Persist bookings so double-booking the same date is impossible, including under race conditions (two submissions within milliseconds).
2. Give visitors a confirmation email with a secret link to reschedule or cancel their booking, with no login required.
3. Keep the founder-facing Telegram notification as the reliable side channel; treat visitor email as best-effort.
4. Add no new paid or account-requiring dependency beyond Resend (the one piece that's structurally unavoidable — no email can be sent to a visitor without some email-sending service).

## Non-goals

- Real multi-slot/multi-day availability (still one 30-minute slot per day).
- Calendar sync (Google/Outlook busy-time lookups).
- An admin UI — for a single-founder operation, inspecting the handful of active bookings via a small authenticated debug endpoint or the Netlify Blobs CLI (`netlify blobs:list` / `netlify blobs:get`) is enough; no dashboard is built (mirrors CLAUDE.md's "no full auth provider for a one-user admin screen" guidance).

## Data Model (Netlify Blobs)

One Netlify Blobs store, `bookings`, holding two logical key namespaces distinguished by prefix:

| key pattern | value | purpose |
|---|---|---|
| `date:<YYYY-MM-DD>` | the booking's `manage_token` (string) | existence of this key = that date is taken. This is both the conflict-prevention lock **and** the source of truth for "which dates are taken" (no separate status field needed — a cancelled booking simply has its `date:*` key deleted, freeing the date). |
| `token:<manage_token>` | JSON: `{ dateISO, name, email, note, status, createdAt }` | the actual booking record, looked up directly by the visitor's manage link. `status` is `'confirmed'` or `'cancelled'`, kept here for the manage page's "already cancelled" check and for audit purposes even after the date is freed. |

**Conflict prevention is enforced atomically at write time**, not via a separate check-then-write in application code: creating a `date:<iso>` key uses Netlify Blobs' conditional write ("only set if this key does not already exist" — the current `@netlify/blobs` SDK exposes this as a `set(..., { onlyIfNew: true })` option; **confirm the exact option name against the `@netlify/blobs` docs at implementation time**, since SDK surface can shift between versions). If the conditional write reports the key already existed, that date was just taken by someone else — this is the equivalent of Postgres's unique-index rejection in the original draft, just expressed through Blobs' primitive instead of a DB constraint.

Listing all `date:*` keys (via the store's `list({ prefix: "date:" })`) gives the full set of currently-taken dates for greying out the picker — this listing is only a UX nicety (may be very-briefly eventually-consistent); the conditional write above is what actually prevents a double-booking from being created.

## Request Flow Changes

### Availability display (`/book`)

`app/book/page.tsx` (already a Server Component) lists `date:*` keys from the `bookings` store server-side and passes the taken-dates array into `<BookingFlow taken={...} />` as a prop. The client component disables those dates in the picker grid. `lib/booking.ts`'s `getAvailableDates()` stays untouched — it remains a pure, framework-free candidate-date generator (per its existing isomorphic-module contract); the "which of these are taken" cross-reference lives in the page, not the lib.

### Confirming a booking (`POST /api/book`)

After the existing zod validation:

1. Generate a `manage_token` (random, e.g. 24 random bytes, base64url-encoded).
2. Conditionally write `date:<dateISO>` → `manage_token` ("only if new"). If this reports the key already exists, return `409` with `"That slot was just taken — please pick another date."` — no further writes happen.
3. If the conditional write succeeds, write `token:<manage_token>` → the full booking JSON (`status: "confirmed"`).
4. Send the existing Telegram message (unchanged), then attempt a Resend confirmation email containing the booking details and the `/book/manage/[token]` link. Email failure is logged server-side and does **not** fail the request — the booking is already committed to Blobs and Telegram-notified by this point.

### Managing a booking (`/book/manage/[token]`)

New Server Component route. Reads `token:<token>` from the store.

- Not found, or `status = 'cancelled'`, or `dateISO` in the past: render a generic **"This booking link is no longer valid."** message. Same message for all three cases — never reveal which one it was (avoids leaking whether a token ever existed).
- Otherwise: render booking details plus a `ManageBooking` Client Component (new, under `components/booking/`, reusing `BookingFlow`'s existing Button/date-picker primitives) offering **Cancel** and **Reschedule**.

Two new Route Handlers:

- `POST /api/book/manage/[token]/cancel` — sets `status: "cancelled"` on the `token:<token>` record, deletes the `date:<dateISO>` key (freeing the date). Sends a cancellation email to the visitor and a short Telegram note to the founder.
- `POST /api/book/manage/[token]/reschedule` — zod-validates a new `dateISO` (must be a valid candidate date per `getAvailableDates()`, i.e. today or later within the visible range). Conditionally writes `date:<newDateISO>` → the same token ("only if new"); if that fails (409, same message as the initial booking flow), nothing else changes. If it succeeds, deletes the old `date:<oldDateISO>` key and updates `dateISO` on the `token:<token>` record. Sends an updated-confirmation email + Telegram note.
  - Edge case: if the new-date write succeeds but the subsequent delete of the old key fails (rare — a transient Blobs error), the old date is left spuriously "taken." This is logged server-side as an error for manual cleanup; it fails toward *fewer* available slots, never toward a silent double-booking.

## Components / Files

**New:**
- `src/lib/booking-store.ts` — server-only helper wrapping `@netlify/blobs`' `getStore("bookings")`: `reserveDate(dateISO, token)`, `freeDate(dateISO)`, `getBookingByToken(token)`, `saveBooking(token, record)`, `listTakenDates()`. Keeps all Blobs-specific code in one place, same isolation principle as the existing Telegram-only `api/book/route.ts`.
- `src/app/book/manage/[token]/page.tsx` — Server Component lookup + invalid/valid states.
- `src/app/api/book/manage/[token]/cancel/route.ts`
- `src/app/api/book/manage/[token]/reschedule/route.ts`
- `src/components/booking/manage-booking.tsx` — Client Component (cancel/reschedule interactivity).
- `src/emails/booking-update-email.tsx` — one parameterized React Email template (state: `confirmed` | `cancelled` | `rescheduled`) rather than three near-duplicate templates.

**Modified:**
- `src/app/book/page.tsx` — fetch taken dates server-side, pass to `BookingFlow`.
- `src/components/booking/booking-flow.tsx` — accept a `taken: string[]` prop, disable those dates, handle the 409 response from `/api/book` by returning to the date step with an error message.
- `src/app/api/book/route.ts` — add the reserve-then-record Blobs writes, manage-token generation, Resend email send, 409 handling.
- `.env.local.example` — document `RESEND_API_KEY` and the one-time step of verifying `aideployed.dev` in Resend (or using Resend's shared sandbox domain to defer DNS setup). No new Blobs-specific env vars are needed for production (Netlify injects Blobs access automatically for deployed sites); local development needs `netlify dev` (rather than plain `next dev`) so the Blobs client has a context to connect to — document this requirement here too.

## Error Handling

- **Race-condition-safe conflict prevention**: enforced by Blobs' conditional ("only if new") write, surfaced as an explicit 409 with a user-facing retry message — not just an app-level pre-check that could still race.
- **Invalid manage tokens**: uniform "no longer valid" message regardless of the underlying reason (not found / cancelled / past).
- **Email delivery failures**: logged server-side via `console.error` (matching the existing Telegram failure-logging convention), never block or roll back a booking/cancel/reschedule that already succeeded against Blobs + Telegram.
- **Reschedule to an invalid date**: zod rejects malformed input; a date outside the valid candidate range is rejected with `400` before any store write is attempted.
- **Partial-failure cleanup (reschedule)**: if freeing the old date fails after the new date is successfully reserved, log it distinctly (e.g. `"orphaned date lock"`) so it's easy to grep for and manually free via the Netlify Blobs CLI if it ever happens.

## Testing

- Vitest: the new/extended zod schemas (reschedule payload validation), and the "is this a valid candidate date" check used by reschedule.
- Manual/UAT: submit the same date from two browser tabs to confirm the second one gets the 409 path (an actual concurrency check, not just a code read) per this project's targeted-testing convention (CLAUDE.md: tests where a silent bug costs real money — this is exactly that kind of spot). Also manually verify local dev via `netlify dev` can read/write Blobs before assuming this works the same as production.

## Setup Required (Founder)

Before this ships to production:
1. Create a Resend account, verify `aideployed.dev` (or defer via Resend's sandbox sending domain), set `RESEND_API_KEY` in both `.env.local` and Netlify's site environment variables.
2. No Blobs-specific account setup is needed — it's automatically available on this site's existing Netlify deployment. For local development, use `netlify dev` instead of `next dev` so Blobs calls have a store to connect to (confirm this workflow during implementation).

Documented in `.env.local.example`, following the same pattern as the existing `TELEGRAM_BOT_TOKEN` setup section.
