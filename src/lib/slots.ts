import { addDaysISO, getTodayISO, getWeekday } from "@/lib/booking";
import { getWeeklyTemplate, listOverrides, resolveSlotsForWeekday } from "@/lib/availability-store";
import { listTakenSlots } from "@/lib/booking-store";

export type Slot = { dateISO: string; time: string };

/**
 * Scans forward day by day from today, collecting each day's configured
 * slots (weekly template or date override) minus whatever's already
 * booked, until `count` slots are gathered or `maxDaysToScan` days have
 * been checked. Days with no configured slots (e.g. an unconfigured
 * weekend) simply contribute zero and are skipped automatically.
 *
 * Reads the weekly template and all overrides ONCE up front (in parallel
 * with the taken-slots list) rather than once per scanned day — with
 * maxDaysToScan defaulting to 90, a naive per-day read would mean up to
 * ~180 sequential Blobs round-trips on every /book render.
 */
export async function listUpcomingSlots(count = 21, maxDaysToScan = 90): Promise<Slot[]> {
  const [takenSlots, template, overrides] = await Promise.all([
    listTakenSlots(),
    getWeeklyTemplate(),
    listOverrides(),
  ]);

  const taken = new Set(takenSlots.map((slot) => `${slot.dateISO}|${slot.time}`));
  const overrideByDate = new Map(overrides.map((override) => [override.dateISO, override.times]));

  const results: Slot[] = [];
  const today = getTodayISO();

  for (let i = 0; i < maxDaysToScan && results.length < count; i++) {
    const dateISO = addDaysISO(today, i);
    const override = overrideByDate.get(dateISO) ?? null;
    const times = resolveSlotsForWeekday(template, override, getWeekday(dateISO));

    for (const time of times) {
      if (results.length >= count) break;
      if (!taken.has(`${dateISO}|${time}`)) {
        results.push({ dateISO, time });
      }
    }
  }

  return results;
}
