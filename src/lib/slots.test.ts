import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockListTakenSlots, mockGetSlotsForDate } = vi.hoisted(() => ({
  mockListTakenSlots: vi.fn(),
  mockGetSlotsForDate: vi.fn(),
}));

vi.mock("@/lib/booking-store", () => ({
  listTakenSlots: mockListTakenSlots,
}));

vi.mock("@/lib/availability-store", () => ({
  getSlotsForDate: mockGetSlotsForDate,
}));

import { listUpcomingSlots } from "./slots";
import { getTodayISO } from "@/lib/booking";

beforeEach(() => {
  vi.clearAllMocks();
  mockListTakenSlots.mockResolvedValue([]);
});

describe("listUpcomingSlots", () => {
  it("collects slots across days in chronological order until it reaches count", async () => {
    mockGetSlotsForDate.mockImplementation(() => {
      return Promise.resolve(["09:00", "14:00"]);
    });

    const result = await listUpcomingSlots(3);

    expect(result).toHaveLength(3);
    expect(result[0].time).toBe("09:00");
    expect(result[1].time).toBe("14:00");
    // Third slot comes from the following day, same times repeating.
    expect(result[2].dateISO).not.toBe(result[0].dateISO);
  });

  it("skips days with no configured slots", async () => {
    let callCount = 0;
    mockGetSlotsForDate.mockImplementation(() => {
      callCount += 1;
      // First two calls (days) are empty, third has one slot.
      return Promise.resolve(callCount <= 2 ? [] : ["09:00"]);
    });

    const result = await listUpcomingSlots(1);

    expect(result).toHaveLength(1);
    expect(result[0].time).toBe("09:00");
  });

  it("excludes already-taken slots", async () => {
    mockGetSlotsForDate.mockResolvedValue(["09:00"]);
    const today = getTodayISO();
    mockListTakenSlots.mockResolvedValue([{ dateISO: today, time: "09:00" }]);

    const result = await listUpcomingSlots(1, 5);

    expect(result).toHaveLength(1);
    expect(result[0].dateISO).not.toBe(today);
  });

  it("gives up after maxDaysToScan and returns fewer than count", async () => {
    mockGetSlotsForDate.mockResolvedValue([]);

    const result = await listUpcomingSlots(5, 10);

    expect(result).toHaveLength(0);
    expect(mockGetSlotsForDate).toHaveBeenCalledTimes(10);
  });
});
