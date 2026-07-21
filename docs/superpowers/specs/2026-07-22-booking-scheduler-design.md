# Booking Scheduler: Persistence, Conflict Prevention, Manage Flow

## Context

`/book` currently renders a native 5-step flow (date → time confirm → details → review → success) built in quick task `260721-b89`. It has no persistence: confirming a booking only sends a Telegram message to the founder via `/api/book`. This means:

- Two visitors can pick the same date and both get "confirmed" — no conflict prevention.
- The visitor gets no email record and no way to reschedule or cancel afterward.

This spec covers closing both gaps. The single-hardcoded-daily-slot availability model (`BOOKING_SLOT_LABEL`, one slot per calendar day) is unchanged — real multi-slot availability was explicitly out of scope for this round.

## Goals

1. Persist bookings so double-booking the same date is impossible, including under race conditions (two submissions within milliseconds).
2. Give visitors a confirmation email with a secret link to reschedule or cancel their booking, with no login required.
3. Keep the founder-facing Telegram notification as the reliable side channel; treat visitor email as best-effort.

## Non-goals

- Real multi-slot/multi-day availability (still one 30-minute slot per day).
- Calendar sync (Google/Outlook busy-time lookups).
- An admin UI — the founder inspects/edits bookings directly via the Supabase table editor if ever needed (mirrors CLAUDE.md's "no full auth provider for a one-user admin screen" guidance).

## Data Model

New Supabase table `bookings`:

| column | type | notes |
|---|---|---|
| `id` | `uuid`, PK, default `gen_random_uuid()` | |
| `date_iso` | `date` | the booking's single daily slot date |
| `name` | `text` | |
| `email` | `text` | |
| `note` | `text` | |
| `status` | `text` | `'confirmed'` \| `'cancelled'`, default `'confirmed'` |
| `manage_token` | `text`, unique | random (e.g. 24 random bytes, base64url), embedded in the confirmation email's manage link |
| `created_at` | `timestamptz` | default `now()` |

**Conflict prevention is enforced at the database level**, not just in application code:

```sql
create unique index bookings_date_confirmed_unique
  on bookings (date_iso)
  where status = 'confirmed';
```

This partial unique index means Postgres itself rejects a second `confirmed` row for the same date — including the reschedule path, which updates `date_iso` on an existing row. A pre-flight availability query (see below) is a UX nicety to grey out obviously-taken dates in the picker; the unique index is the actual source of truth and the only thing that's safe under concurrent submissions.

## Request Flow Changes

### Availability display (`/book`)

`app/book/page.tsx` (already a Server Component) queries Supabase server-side for all `date_iso` values with `status = 'confirmed'` in the candidate date range, and passes that list into `<BookingFlow taken={...} />` as a prop. The client component disables those dates in the picker grid. `lib/booking.ts`'s `getAvailableDates()` stays untouched — it remains a pure, framework-free candidate-date generator (per its existing isomorphic-module contract); the "which of these are taken" cross-reference lives in the page, not the lib.

### Confirming a booking (`POST /api/book`)

After the existing zod validation:

1. Generate a `manage_token`.
2. `INSERT` into `bookings` with `status = 'confirmed'`.
3. If the insert fails with Postgres unique-violation (`23505`), return `409` with `"That slot was just taken — please pick another date."` (the visitor's UI should return them to the date step).
4. On success: send the existing Telegram message (unchanged), then attempt a Resend confirmation email containing the booking details and the `/book/manage/[token]` link. Email failure is logged server-side and does **not** fail the request — the booking is already committed and Telegram-notified by this point.

### Managing a booking (`/book/manage/[token]`)

New Server Component route. Looks up the booking by `manage_token`.

- Not found, or `status = 'cancelled'`, or date in the past: render a generic **"This booking link is no longer valid."** message. Same message for all three cases — never reveal which one it was (avoids leaking whether a token ever existed).
- Otherwise: render booking details plus a `ManageBooking` Client Component (new, under `components/booking/`, reusing `BookingFlow`'s existing Button/date-picker primitives) offering **Cancel** and **Reschedule**.

Two new Route Handlers:

- `POST /api/book/manage/[token]/cancel` — sets `status = 'cancelled'`. Frees the date (the partial unique index only constrains confirmed rows). Sends a cancellation email to the visitor and a short Telegram note to the founder.
- `POST /api/book/manage/[token]/reschedule` — zod-validates a new `dateISO` (must be a valid candidate date per `getAvailableDates()`, i.e. today or later within the visible range). Updates `date_iso` on the same row — protected by the same unique index, so a race against another visitor booking that date is still caught. On success, sends an updated-confirmation email + Telegram note. On unique-violation, returns 409 the same way the initial booking flow does.

## Components / Files

**New:**
- `src/lib/supabase.ts` — server-only Supabase client factory using the service-role key. Never imported from a Client Component (mirrors the existing `TELEGRAM_BOT_TOKEN`-confined-to-Route-Handler pattern already established in `api/book/route.ts`).
- `src/app/book/manage/[token]/page.tsx` — Server Component lookup + invalid/valid states.
- `src/app/api/book/manage/[token]/cancel/route.ts`
- `src/app/api/book/manage/[token]/reschedule/route.ts`
- `src/components/booking/manage-booking.tsx` — Client Component (cancel/reschedule interactivity).
- `src/emails/booking-update-email.tsx` — one parameterized React Email template (state: `confirmed` | `cancelled` | `rescheduled`) rather than three near-duplicate templates.

**Modified:**
- `src/app/book/page.tsx` — fetch taken dates server-side, pass to `BookingFlow`.
- `src/components/booking/booking-flow.tsx` — accept a `taken: string[]` prop, disable those dates, handle the 409 response from `/api/book` by returning to the date step with an error message.
- `src/app/api/book/route.ts` — add the Supabase insert, manage-token generation, Resend email send, 409 handling.
- `.env.local.example` — document `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and the one-time step of verifying `aideployed.dev` in Resend (or using Resend's shared sandbox domain to defer DNS setup).

## Error Handling

- **Race-condition-safe conflict prevention**: enforced by the DB unique index, surfaced as an explicit 409 with a user-facing retry message — not just an app-level pre-check that could still race.
- **Invalid manage tokens**: uniform "no longer valid" message regardless of the underlying reason (not found / cancelled / past).
- **Email delivery failures**: logged server-side via `console.error` (matching the existing Telegram failure-logging convention), never block or roll back a booking/cancel/reschedule that already succeeded against Supabase + Telegram.
- **Reschedule to an invalid date**: zod rejects malformed input; a date outside the valid candidate range is rejected with `400` before any DB write is attempted.

## Testing

- Vitest: the new/extended zod schemas (reschedule payload validation), and the "is this a valid candidate date" check used by reschedule.
- Manual/UAT: submit the same date from two browser tabs to confirm the second one gets the 409 path (an actual concurrency check, not just a code read) per this project's targeted-testing convention (CLAUDE.md: tests where a silent bug costs real money — this is exactly that kind of spot).

## Setup Required (Founder)

Before this ships to production:
1. Create a Supabase project, run the `bookings` table + partial unique index migration, set `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`.
2. Create a Resend account, verify `aideployed.dev` (or defer via Resend's sandbox sending domain), set `RESEND_API_KEY`.

Both documented in `.env.local.example`, following the same pattern as the existing `TELEGRAM_BOT_TOKEN` setup section.
