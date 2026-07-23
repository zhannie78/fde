import { z } from "zod";

export const dateISOSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const bookingSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email(),
  note: z.string().trim().min(1).max(2000),
  dateISO: dateISOSchema,
  time: timeSchema,
});

export const rescheduleSchema = z.object({
  dateISO: dateISOSchema,
  time: timeSchema,
});

export const weeklyTemplateSchema = z.object({
  sun: z.array(timeSchema),
  mon: z.array(timeSchema),
  tue: z.array(timeSchema),
  wed: z.array(timeSchema),
  thu: z.array(timeSchema),
  fri: z.array(timeSchema),
  sat: z.array(timeSchema),
});

export const overrideSchema = z.object({
  dateISO: dateISOSchema,
  times: z.array(timeSchema),
});
