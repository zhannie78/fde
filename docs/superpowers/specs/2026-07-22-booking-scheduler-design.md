# Booking Scheduler: Availability Management, Persistence, Conflict Prevention, Manage Flow

## Context

`/book` currently renders a native 5-step flow (date → time confirm → details → review → success) built in quick task `260721-b89`. Availability is a single hardcoded constant (`BOOKING_SLOT_LABEL = "4:00 – 4:30 PM ET"`) applied to every day, and nothing is persisted — confirming a booking only sends a Telegram message to the founder via `/api/book`.

**Revision history:**
- **2026-07-22 (original):** Supabase-backed persistence + Resend confirmation/cancel/reschedule, single fixed daily slot unchanged.
- **2026-07-23 (rev 1):** Storage swapped from Supabase to Netlify Blobs (free on the existing Netlify plan, no new account, no inactivity auto-pause).
- **2026-07-23 (rev 2 — this version):** Added full **availability management** — the founder can now define a recurring weekly schedule and date-specific exceptions (block days, add one-off times) through a password-protected `/admin` page, instead of availability being a hardcoded constant. This changes the booking data model from date-only to date+time slots throughout, and simplifies the visitor-facing picker to a flat, chronologically-sorted list of the next 15 open slots.

## Goals

1. The founder can define a recurring weekly availability template (which weekdays, which times) and per-date exceptions (block a day entirely, or override a day's times) via a simple password-protected admin page — no code edits or redeploys required to change the schedule.
2. Visitors see a flat, date-ascending list of the next 15 open slots (not a 21-day grid) and book directly from it.
3. Persist bookings so double-booking the same date+time is impossible, including under race conditions.
4. Give visitors a confirmation email with a secret link to reschedule or cancel their booking, with no login required.
5. Keep the founder-facing Telegram notification exactly as it works today for every booking, cancellation, and reschedule — unchanged mechanism, best-effort so an outage never blocks a client-visible success once a booking is durably reserved.
6. Add no new paid or account-requiring dependency beyond Resend (email) — Netlify Blobs and the admin auth need no new accounts.

## Non-goals

- Calendar sync (Google/Outlook busy-time lookups) — availability is entirely self-declared by the founder through `/admin`.
- Multiple meeting lengths — every slot is still a fixed 30 minutes (matches the site's existing "Thirty minutes, no slide deck" copy); only which days/times are offered is configurable, not the duration.
- Multi-user admin accounts, invites, or roles — one shared password for the one founder, per CLAUDE.md's documented "no full auth provider for a one-user admin screen" guidance.
- Per-slot editing within an otherwise-templated day (e.g. "remove just the 2pm slot on this one Tuesday, keep the rest") — an exception always replaces *all* of that date's slots; if the founder wants "everything except 2pm" on one date, they re-enter that date's full custom time list as an override. Keeps the override model to one simple rule instead of a merge/diff UI.

## Data Model

Two Netlify Blobs stores.

### `availability` store

| key | value | purpose |
|---|---|---|
| `template` | JSON: `{ mon: string[], tue: string[], wed: string[], thu: string[], fri: string[], sat: string[], sun: string[] }` | The recurring weekly default. Each string is a 24-hour `"HH:mm"` start time (e.g. `"10:00"`, `"14:30"`), matching the native `<input type="time">` format the admin UI uses directly — no parsing/reformatting needed between form and storage. |
| `override:<YYYY-MM-DD>` | JSON: `{ times: string[] }` | A date-specific override that **replaces** the template's times for that date entirely. `times: []` blocks the day completely (e.g. vacation). Absence of this key means "use the weekly template's default for that weekday." |

### `bookings` store (unchanged store name, revised key shape)

| key | value | purpose |
|---|---|---|
| `slot:<YYYY-MM-DD>:<HH:mm>` | the booking's `manage_token` (string) | existence of this key = that specific date+time is taken. Written with Netlify Blobs' "only if new" conditional — this is the atomic conflict-prevention guard, not a check-then-write in application code. |
| `token:<manage_token>` | JSON: `{ dateISO, time, name, email, note, status, createdAt }` | the full booking record, looked up directly by the visitor's manage link. `status` is `'confirmed'` or `'cancelled'`. |

Conflict prevention: creating a `slot:<iso>:<time>` key uses `store.set(key, token, { onlyIfNew: true })` (confirmed against current Netlify Blobs docs — the SDK's own return shape is `{ modified: boolean, etag? }`; `modified: false` means the slot was already taken). This is the same mechanism as the prior date-only design, just keyed one level deeper (date **and** time) now that a day can offer more than one slot.

## New Subsystem: Availability Management

### Computing a date's slots

```
getSlotsForDate(dateISO):
  override = availability-store.getOverrideForDate(dateISO)
  if override is not null: return sorted(override.times)
  weekday = booking.getWeekday(dateISO)   // "mon".."sun", UTC-anchored, DST-safe
  return sorted(template[weekday])
```

### The visitor-facing "next 15 slots" list

```
listUpcomingSlots(count = 15, maxDaysToScan = 90):
  taken = bookingStore.listTakenSlots()  // Set of "dateISO|time"
  results = []
  for i in 0..maxDaysToScan:
    dateISO = addDaysISO(getTodayISO(), i)
    for time in getSlotsForDate(dateISO):
      if results.length >= count: break outer loop
      if "dateISO|time" not in taken: results.push({ dateISO, time })
  return results
```

Days with no template entry and no override (e.g. a weekend the founder never configured) simply contribute zero slots and are skipped automatically — no special-casing needed. `maxDaysToScan` is a safety bound (not a business rule) so a mostly-empty template can't cause an unbounded scan; if fewer than 15 slots exist within 90 days, the visitor just sees fewer than 15.

### Admin access

- New env vars: `ADMIN_PASSWORD` (the password typed into `/admin/login`) and `ADMIN_SESSION_SECRET` (a random string used to HMAC-sign the session cookie, so the cookie itself never contains the plaintext password).
- `src/middleware.ts` matches `/admin` and `/admin/:path*` (excluding `/admin/login`): checks a cookie against the expected HMAC value (timing-safe comparison via `crypto.timingSafeEqual`); redirects to `/admin/login` if missing or invalid.
- `/admin/login` — a simple password form POSTing to `/api/admin/login`, which compares the submitted password to `ADMIN_PASSWORD` (timing-safe) and, on success, sets an `httpOnly`, `Secure`, `SameSite=Lax` cookie holding `HMAC-SHA256(ADMIN_SESSION_SECRET, "admin-session")`.
- `/api/admin/logout` clears the cookie.
- No rate-limiting or lockout on login attempts — this is a single-founder internal tool behind a password only the founder knows, not a public attack surface; over-building this would contradict CLAUDE.md's explicit "don't overinvest in a one-user admin screen" guidance.

### Admin page (`/admin`)

Two sections on one page:

1. **Weekly Template** — 7 rows (Mon–Sun), each showing its current list of `<input type="time">` fields with add/remove buttons. A single "Save Template" button submits the full 7-day object to `POST /api/admin/template` (zod-validated, writes the whole `template` blob at once — simpler than per-day patch endpoints).
2. **Exceptions** — an `<input type="date">` plus the same add/remove time-list UI (or a "Block this day" toggle that submits `times: []`), submitting to `POST /api/admin/override`. Below it, a list of existing upcoming overrides (from `listOverrides()`, filtered to today-forward, sorted ascending) each with a "Remove" button hitting `DELETE /api/admin/override` to revert that date back to the template default.

## Revised Booking Flow

### Visitor-facing picker (`/book`)

`app/book/page.tsx` (Server Component) calls `listUpcomingSlots(15)` and passes the array into `<BookingFlow slots={...} />`. The flow simplifies from 5 steps to **4**: `slot` (pick one of the up-to-15 flat, date-ascending options, each rendered via the new `formatSlotLabel(dateISO, time)`) → `details` → `review` → `success`. The old separate "confirm time" step is gone — picking a slot now picks date *and* time in one action.

If `POST /api/book` returns `409` (another visitor took that exact slot first), the flow shows the error and re-fetches a fresh list via a new `GET /api/book/slots` endpoint (same `listUpcomingSlots(15)` under the hood) rather than forcing a full page reload.

### Confirming a booking (`POST /api/book`)

Body is now `{ name, email, note, dateISO, time }`. After validation:
1. Generate a `manage_token`.
2. `reserveSlot(dateISO, time, token)` — conditional "only if new" write to `slot:<dateISO>:<time>`. `409` on failure, no further writes.
3. `saveBookingRecord(token, { dateISO, time, name, email, note, status: "confirmed", createdAt })`. On failure, free the slot lock (`freeSlot`) and return `500` — a booking record must never be missing while its slot lock still exists (that would silently block the slot forever with no way to look it up).
4. Send the existing Telegram message (unchanged mechanism; now includes the specific time), best-effort.
5. Send the Resend confirmation email (unchanged from rev 1 of this spec) with a manage link, best-effort.

### Managing a booking (`/book/manage/[token]`)

Unchanged shape from rev 1 (generic "no longer valid" message for not-found/cancelled/past bookings; Cancel and Reschedule actions). Reschedule now:
- Validates the new `{ dateISO, time }` against `getSlotsForDate(dateISO)` (must actually be one of that date's configured slots — replaces the old `isCandidateDate` check, which no longer makes sense once availability is admin-configurable rather than a fixed 21-day rolling window).
- Uses the same flat "next 15 slots" list (fetched client-side via `GET /api/book/slots` when the visitor opens the reschedule picker) instead of a per-day grid.
- Same atomic `reserveSlot`/`freeSlot` sequencing as the original booking flow, including the orphaned-lock cleanup/logging on partial failure.

## Error Handling

- **Race-condition-safe conflict prevention**: enforced by Blobs' conditional write on `slot:<iso>:<time>`, surfaced as an explicit `409`.
- **Invalid manage tokens**: uniform "no longer valid" message regardless of reason (not found / cancelled / past).
- **Email delivery failures**: logged, never block or roll back an already-successful booking/cancel/reschedule.
- **Telegram failures**: logged, never block or roll back an already-successful booking/cancel/reschedule (this is unchanged in spirit from rev 1 — the reservation in Blobs is the real source of truth, Telegram is a best-effort side channel).
- **Admin auth failures**: wrong password → generic "Incorrect password" on the login form; missing/invalid session cookie on any `/admin/*` route → redirect to `/admin/login`, no partial page render.
- **Reschedule/override validation**: a `{ dateISO, time }` combination not present in `getSlotsForDate(dateISO)` is rejected with `400` before any store write.

## Testing

- Vitest: zod schemas (booking, reschedule, admin template, admin override payloads); `getSlotsForDate` (template vs. override precedence, blocked-day case); `listUpcomingSlots` (skips fully-booked/unconfigured days, stops at `count`, respects `maxDaysToScan`); the Blobs-touching store functions via a mocked `@netlify/blobs`.
- Manual/UAT: submit the same slot from two browser tabs to confirm the second gets the `409` path; set a weekly template and a date override in `/admin` and confirm `/book` reflects both correctly; confirm an unauthenticated `/admin` request redirects to `/admin/login`.

## Setup Required (Founder)

1. Resend account + `aideployed.dev` domain verification (or sandbox sender as a stopgap), `RESEND_API_KEY` — unchanged from rev 1.
2. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` (any long random string — e.g. generated via `openssl rand -hex 32`) in `.env.local` and Netlify's site environment variables.
3. No Netlify Blobs account setup needed (automatic on the existing Netlify deployment). Local development requires `netlify dev` instead of plain `next dev`.
4. After first deploy, visit `/admin/login`, log in, and set an initial weekly template — until one is set, every day has zero slots and `/book` shows an empty list (fails toward "no bookings possible" rather than a wrong/misleading default schedule).

All documented in `.env.local.example`, following the existing `TELEGRAM_BOT_TOKEN` setup section's pattern.
