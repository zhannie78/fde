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

export function resolveSlotsForWeekday(
  template: WeeklyTemplate,
  override: string[] | null,
  weekday: Weekday
): string[] {
  if (override !== null) return [...override].sort();
  return [...template[weekday]].sort();
}

export async function getSlotsForDate(dateISO: string): Promise<string[]> {
  const override = await getOverrideForDate(dateISO);
  if (override !== null) return [...override].sort();

  const template = await getWeeklyTemplate();
  return [...template[getWeekday(dateISO)]].sort();
}
