import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockListTakenSlots } = vi.hoisted(() => ({
  mockListTakenSlots: vi.fn(),
}));
vi.mock("@/lib/booking-store", () => ({
  listTakenSlots: mockListTakenSlots,
}));

const { mockGetWeeklyTemplate, mockListOverrides } = vi.hoisted(() => ({
  mockGetWeeklyTemplate: vi.fn(),
  mockListOverrides: vi.fn(),
}));
vi.mock("@/lib/availability-store", async () => {
  const actual = await vi.importActual<typeof import("@/lib/availability-store")>("@/lib/availability-store");
  return {
    ...actual,
    getWeeklyTemplate: mockGetWeeklyTemplate,
    listOverrides: mockListOverrides,
  };
});

import { addDaysISO, getTodayISO } from "@/lib/booking";
import { listUpcomingSlots } from "./slots";

const EMPTY_TEMPLATE = { sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] };

function templateWithAllDays(times: string[]) {
  return { sun: times, mon: times, tue: times, wed: times, thu: times, fri: times, sat: times };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockListTakenSlots.mockResolvedValue([]);
  mockListOverrides.mockResolvedValue([]);
});

describe("listUpcomingSlots", () => {
  it("collects slots across days in chronological order until it reaches count", async () => {
    mockGetWeeklyTemplate.mockResolvedValue(templateWithAllDays(["09:00", "14:00"]));

    const result = await listUpcomingSlots(3);

    expect(result).toHaveLength(3);
    expect(result[0].time).toBe("09:00");
    expect(result[1].time).toBe("14:00");
    expect(result[2].dateISO).not.toBe(result[0].dateISO);
  });

  it("skips days with no configured slots", async () => {
    mockGetWeeklyTemplate.mockResolvedValue(EMPTY_TEMPLATE);
    const targetDate = addDaysISO(getTodayISO(), 2);
    mockListOverrides.mockResolvedValue([{ dateISO: targetDate, times: ["09:00"] }]);

    const result = await listUpcomingSlots(1);

    expect(result).toHaveLength(1);
    expect(result[0].time).toBe("09:00");
    expect(result[0].dateISO).toBe(targetDate);
  });

  it("excludes already-taken slots", async () => {
    mockGetWeeklyTemplate.mockResolvedValue(templateWithAllDays(["09:00"]));
    const today = getTodayISO();
    mockListTakenSlots.mockResolvedValue([{ dateISO: today, time: "09:00" }]);

    const result = await listUpcomingSlots(1, 5);

    expect(result).toHaveLength(1);
    expect(result[0].dateISO).not.toBe(today);
  });

  it("gives up after maxDaysToScan and returns fewer than count", async () => {
    mockGetWeeklyTemplate.mockResolvedValue(EMPTY_TEMPLATE);

    const result = await listUpcomingSlots(5, 10);

    expect(result).toHaveLength(0);
  });

  it("reads the template and overrides exactly once regardless of maxDaysToScan", async () => {
    mockGetWeeklyTemplate.mockResolvedValue(EMPTY_TEMPLATE);

    await listUpcomingSlots(5, 90);

    expect(mockGetWeeklyTemplate).toHaveBeenCalledTimes(1);
    expect(mockListOverrides).toHaveBeenCalledTimes(1);
  });
});
