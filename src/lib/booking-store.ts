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
