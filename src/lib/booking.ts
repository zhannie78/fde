/**
 * Isomorphic date/slot helpers shared by the client booking flow
 * (src/components/booking/booking-flow.tsx) and the server Route Handler
 * (src/app/api/book/route.ts). Plain module — no "use client", no zod
 * import — so both sides can import it without pulling in server- or
 * client-only code.
 *
 * All availability is a single fixed daily slot in America/New_York; "today"
 * is anchored using the America/New_York wall-clock date (DST-safe), but
 * every subsequent calendar day is then represented as a UTC-midnight
 * `Date.UTC(...)` epoch — a date-only value, not a real America/New_York
 * instant. Those date-only values are formatted with `timeZone: "UTC"`
 * (never "America/New_York"): formatting a UTC-midnight instant in the NY
 * zone would shift it back onto the previous calendar day (NY is behind
 * UTC), silently disagreeing with the `iso` value derived from the same
 * instant. Date arithmetic uses `Date.UTC(...)` only (never local-timezone
 * `new Date(y, m, d)` arithmetic) to avoid off-by-one drift near midnight
 * in whatever timezone the running process happens to be in.
 */

export const BOOKING_SLOT_LABEL = "4:00 – 4:30 PM ET";

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

function todayNyUtcEpoch(): number {
  // "en-CA" yields a yyyy-mm-dd string for the current date IN the
  // America/New_York zone, DST-safe.
  const [year, month, day] = NY_DATE_FORMATTER.format(new Date())
    .split("-")
    .map(Number);
  return Date.UTC(year, month - 1, day);
}

export function getAvailableDates(count = 21): { iso: string; label: string }[] {
  const startEpoch = todayNyUtcEpoch();
  const dates: { iso: string; label: string }[] = [];

  for (let i = 0; i < count; i++) {
    const dayEpoch = startEpoch + i * 24 * 60 * 60 * 1000;
    const dayDate = new Date(dayEpoch);
    const iso = dayDate.toISOString().slice(0, 10);
    dates.push({ iso, label: SHORT_DATE_FORMATTER.format(dayDate) });
  }

  return dates;
}

export function formatSlotLabel(dateISO: string): string {
  const [year, month, day] = dateISO.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return `${LONG_DATE_FORMATTER.format(date)} · ${BOOKING_SLOT_LABEL}`;
}
