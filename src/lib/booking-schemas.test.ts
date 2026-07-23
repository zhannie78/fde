import { describe, expect, it } from "vitest";

import { bookingSchema, overrideSchema, rescheduleSchema, weeklyTemplateSchema } from "./booking-schemas";

const validBooking = {
  name: "Jane Doe",
  email: "jane@example.com",
  note: "Need help with invoicing.",
  dateISO: "2026-08-10",
  time: "09:00",
};

describe("bookingSchema", () => {
  it("accepts a valid payload", () => {
    expect(bookingSchema.safeParse(validBooking).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(bookingSchema.safeParse({ ...validBooking, name: "  " }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(bookingSchema.safeParse({ ...validBooking, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects a malformed date", () => {
    expect(bookingSchema.safeParse({ ...validBooking, dateISO: "08/10/2026" }).success).toBe(false);
  });

  it("rejects a malformed time", () => {
    expect(bookingSchema.safeParse({ ...validBooking, time: "9:00" }).success).toBe(false);
  });

  it("rejects an out-of-range time", () => {
    expect(bookingSchema.safeParse({ ...validBooking, time: "25:00" }).success).toBe(false);
  });
});

describe("rescheduleSchema", () => {
  it("accepts a valid date + time", () => {
    expect(rescheduleSchema.safeParse({ dateISO: "2026-08-10", time: "09:00" }).success).toBe(true);
  });

  it("rejects a missing time", () => {
    expect(rescheduleSchema.safeParse({ dateISO: "2026-08-10" }).success).toBe(false);
  });
});

describe("weeklyTemplateSchema", () => {
  const validTemplate = {
    sun: [], mon: ["09:00"], tue: [], wed: ["09:00", "14:00"], thu: [], fri: [], sat: [],
  };

  it("accepts a valid template", () => {
    expect(weeklyTemplateSchema.safeParse(validTemplate).success).toBe(true);
  });

  it("rejects a missing weekday", () => {
    const { sun: _sun, ...incomplete } = validTemplate;
    expect(weeklyTemplateSchema.safeParse(incomplete).success).toBe(false);
  });

  it("rejects an invalid time within a day", () => {
    expect(weeklyTemplateSchema.safeParse({ ...validTemplate, mon: ["not-a-time"] }).success).toBe(false);
  });
});

describe("overrideSchema", () => {
  it("accepts a blocked-day override (empty times)", () => {
    expect(overrideSchema.safeParse({ dateISO: "2026-08-10", times: [] }).success).toBe(true);
  });

  it("accepts a custom-hours override", () => {
    expect(overrideSchema.safeParse({ dateISO: "2026-08-10", times: ["10:00", "15:30"] }).success).toBe(true);
  });

  it("rejects a malformed date", () => {
    expect(overrideSchema.safeParse({ dateISO: "not-a-date", times: [] }).success).toBe(false);
  });
});
