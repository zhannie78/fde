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
