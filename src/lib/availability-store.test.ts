import { beforeEach, describe, expect, it, vi } from "vitest";

const mockStore = {
  get: vi.fn(),
  setJSON: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
};

vi.mock("@netlify/blobs", () => ({
  getStore: vi.fn(() => mockStore),
}));

import {
  getOverrideForDate,
  getSlotsForDate,
  getWeeklyTemplate,
  listOverrides,
  removeOverrideForDate,
  saveWeeklyTemplate,
  setOverrideForDate,
  type WeeklyTemplate,
} from "./availability-store";

beforeEach(() => {
  vi.clearAllMocks();
});

const template: WeeklyTemplate = {
  sun: [], mon: ["09:00"], tue: [], wed: ["09:00", "14:00"], thu: [], fri: ["10:00"], sat: [],
};

describe("getWeeklyTemplate", () => {
  it("returns the stored template", async () => {
    mockStore.get.mockResolvedValue(template);
    const result = await getWeeklyTemplate();
    expect(result).toEqual(template);
    expect(mockStore.get).toHaveBeenCalledWith("template", { type: "json" });
  });

  it("returns an all-empty default when nothing is stored yet", async () => {
    mockStore.get.mockResolvedValue(null);
    const result = await getWeeklyTemplate();
    expect(result).toEqual({ sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] });
  });
});

describe("saveWeeklyTemplate", () => {
  it("writes the whole template at once", async () => {
    await saveWeeklyTemplate(template);
    expect(mockStore.setJSON).toHaveBeenCalledWith("template", template);
  });
});

describe("getOverrideForDate / setOverrideForDate / removeOverrideForDate", () => {
  it("returns null when no override exists", async () => {
    mockStore.get.mockResolvedValue(null);
    expect(await getOverrideForDate("2026-08-10")).toBeNull();
  });

  it("returns the override's times when one exists", async () => {
    mockStore.get.mockResolvedValue({ times: ["11:00"] });
    expect(await getOverrideForDate("2026-08-10")).toEqual(["11:00"]);
  });

  it("returns an empty array for a blocked day (not null)", async () => {
    mockStore.get.mockResolvedValue({ times: [] });
    expect(await getOverrideForDate("2026-08-10")).toEqual([]);
  });

  it("writes an override under the date key", async () => {
    await setOverrideForDate("2026-08-10", ["11:00"]);
    expect(mockStore.setJSON).toHaveBeenCalledWith("override:2026-08-10", { times: ["11:00"] });
  });

  it("deletes the override key", async () => {
    await removeOverrideForDate("2026-08-10");
    expect(mockStore.delete).toHaveBeenCalledWith("override:2026-08-10");
  });
});

describe("listOverrides", () => {
  it("lists and sorts overrides by date", async () => {
    mockStore.list.mockResolvedValue({
      blobs: [{ key: "override:2026-08-15" }, { key: "override:2026-08-10" }],
      directories: [],
    });
    mockStore.get.mockImplementation((key: string) => {
      if (key === "override:2026-08-15") return Promise.resolve({ times: [] });
      if (key === "override:2026-08-10") return Promise.resolve({ times: ["11:00"] });
      return Promise.resolve(null);
    });

    const result = await listOverrides();

    expect(result).toEqual([
      { dateISO: "2026-08-10", times: ["11:00"] },
      { dateISO: "2026-08-15", times: [] },
    ]);
  });
});

describe("getSlotsForDate", () => {
  it("uses the override when one exists, sorted", async () => {
    mockStore.get.mockResolvedValue({ times: ["14:00", "09:00"] });
    expect(await getSlotsForDate("2026-08-10")).toEqual(["09:00", "14:00"]);
  });

  it("blocks the day when the override is an empty array", async () => {
    mockStore.get.mockResolvedValue({ times: [] });
    expect(await getSlotsForDate("2026-08-10")).toEqual([]);
  });

  it("falls back to the weekly template when no override exists", async () => {
    // 2026-07-27 is a Monday.
    mockStore.get.mockImplementation((key: string) => {
      if (key === "override:2026-07-27") return Promise.resolve(null);
      if (key === "template") return Promise.resolve(template);
      return Promise.resolve(null);
    });
    expect(await getSlotsForDate("2026-07-27")).toEqual(["09:00"]);
  });
});
