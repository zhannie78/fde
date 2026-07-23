import { describe, expect, it } from "vitest";

import { addDaysISO, formatSlotButtonLabel, formatSlotLabel, formatTimeRangeLabel, getTodayISO, getWeekday } from "./booking";

describe("getTodayISO", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(getTodayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("addDaysISO", () => {
  it("returns the same date when adding 0 days", () => {
    expect(addDaysISO("2026-07-23", 0)).toBe("2026-07-23");
  });

  it("rolls over a leap-year February correctly", () => {
    expect(addDaysISO("2024-02-28", 1)).toBe("2024-02-29");
  });

  it("rolls over a non-leap-year February correctly", () => {
    expect(addDaysISO("2023-02-28", 1)).toBe("2023-03-01");
  });

  it("rolls over a year boundary correctly", () => {
    expect(addDaysISO("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("getWeekday", () => {
  it("returns the correct weekday for a fixed date", () => {
    expect(getWeekday("2026-07-23")).toBe("thu");
    expect(getWeekday("2000-01-01")).toBe("sat");
  });
});

describe("formatTimeRangeLabel", () => {
  it("formats a morning time", () => {
    expect(formatTimeRangeLabel("09:00")).toBe("9:00 AM – 9:30 AM ET");
  });

  it("formats an afternoon time crossing the hour", () => {
    expect(formatTimeRangeLabel("14:45")).toBe("2:45 PM – 3:15 PM ET");
  });

  it("formats a time crossing midnight", () => {
    expect(formatTimeRangeLabel("23:45")).toBe("11:45 PM – 12:15 AM ET");
  });
});

describe("formatSlotButtonLabel", () => {
  it("renders a compact date + start time", () => {
    expect(formatSlotButtonLabel("2026-07-23", "09:00")).toBe("Thu, Jul 23 · 9:00 AM");
  });
});

describe("formatSlotLabel", () => {
  it("renders a full date + time range", () => {
    expect(formatSlotLabel("2026-07-23", "09:00")).toBe("Thursday, July 23, 2026 · 9:00 AM – 9:30 AM ET");
  });
});
