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
