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
