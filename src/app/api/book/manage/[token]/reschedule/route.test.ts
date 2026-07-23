import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetBookingByToken, mockSaveBookingRecord, mockFreeSlot, mockReserveSlot } = vi.hoisted(() => ({
  mockGetBookingByToken: vi.fn(),
  mockSaveBookingRecord: vi.fn(),
  mockFreeSlot: vi.fn(),
  mockReserveSlot: vi.fn(),
}));

vi.mock("@/lib/booking-store", () => ({
  getBookingByToken: mockGetBookingByToken,
  saveBookingRecord: mockSaveBookingRecord,
  freeSlot: mockFreeSlot,
  reserveSlot: mockReserveSlot,
  isManageable: (record: { status: string; dateISO: string }) =>
    record.status === "confirmed" && record.dateISO >= "2000-01-01",
}));

const { mockGetSlotsForDate } = vi.hoisted(() => ({
  mockGetSlotsForDate: vi.fn(),
}));
vi.mock("@/lib/availability-store", () => ({
  getSlotsForDate: mockGetSlotsForDate,
}));

const { mockSendBookingUpdateEmail } = vi.hoisted(() => ({
  mockSendBookingUpdateEmail: vi.fn(),
}));
vi.mock("@/lib/email", () => ({
  sendBookingUpdateEmail: mockSendBookingUpdateEmail,
}));

import { POST } from "./route";

const booking = {
  dateISO: "2000-01-01",
  time: "09:00",
  name: "Jane Doe",
  email: "jane@example.com",
  note: "Note",
  status: "confirmed" as const,
  createdAt: "2026-07-23T00:00:00.000Z",
};

function buildRequest(body: unknown) {
  return new Request("http://localhost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function buildParams(token: string) {
  return { params: Promise.resolve({ token }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  process.env.TELEGRAM_BOT_TOKEN = "test-bot-token";
  process.env.TELEGRAM_CHAT_ID = "12345";
  mockGetSlotsForDate.mockResolvedValue(["14:00"]);
});

describe("POST /api/book/manage/[token]/reschedule", () => {
  it("returns 400 for a malformed date", async () => {
    const res = await POST(buildRequest({ dateISO: "not-a-date", time: "14:00" }), buildParams("real-token"));
    expect(res.status).toBe(400);
  });

  it("returns 400 when the requested time isn't actually offered that day", async () => {
    mockGetSlotsForDate.mockResolvedValue(["10:00"]); // 14:00 not in the list
    const res = await POST(buildRequest({ dateISO: "2026-08-15", time: "14:00" }), buildParams("real-token"));
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown token", async () => {
    mockGetBookingByToken.mockResolvedValue(null);
    const res = await POST(buildRequest({ dateISO: "2026-08-15", time: "14:00" }), buildParams("missing"));
    expect(res.status).toBe(404);
  });

  it("returns 409 when the new slot is already taken, leaving the old slot untouched", async () => {
    mockGetBookingByToken.mockResolvedValue(booking);
    mockReserveSlot.mockResolvedValue(false);

    const res = await POST(buildRequest({ dateISO: "2026-08-15", time: "14:00" }), buildParams("real-token"));

    expect(res.status).toBe(409);
    expect(mockFreeSlot).not.toHaveBeenCalled();
    expect(mockSaveBookingRecord).not.toHaveBeenCalled();
  });

  it("moves the booking to the new slot and emails the visitor", async () => {
    mockGetBookingByToken.mockResolvedValue(booking);
    mockReserveSlot.mockResolvedValue(true);
    mockSaveBookingRecord.mockResolvedValue(undefined);

    const res = await POST(buildRequest({ dateISO: "2026-08-15", time: "14:00" }), buildParams("real-token"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(mockReserveSlot).toHaveBeenCalledWith("2026-08-15", "14:00", "real-token");
    expect(mockSaveBookingRecord).toHaveBeenCalledWith("real-token", {
      ...booking,
      dateISO: "2026-08-15",
      time: "14:00",
    });
    expect(mockFreeSlot).toHaveBeenCalledWith("2000-01-01", "09:00");
    expect(mockSendBookingUpdateEmail).toHaveBeenCalledWith({
      state: "rescheduled",
      to: "jane@example.com",
      name: "Jane Doe",
      dateISO: "2026-08-15",
      time: "14:00",
      manageToken: "real-token",
    });
  });

  it("returns 500 and frees the newly-reserved slot (not the old one) if saving the record fails", async () => {
    mockGetBookingByToken.mockResolvedValue(booking);
    mockReserveSlot.mockResolvedValue(true);
    mockSaveBookingRecord.mockRejectedValue(new Error("blobs down"));

    const res = await POST(buildRequest({ dateISO: "2026-08-15", time: "14:00" }), buildParams("real-token"));

    expect(res.status).toBe(500);
    expect(mockFreeSlot).toHaveBeenCalledWith("2026-08-15", "14:00");
    expect(mockFreeSlot).not.toHaveBeenCalledWith("2000-01-01", "09:00");
  });

  it("returns the same response for an already-cancelled booking as for an unknown token", async () => {
    mockGetBookingByToken.mockResolvedValue({ ...booking, status: "cancelled" as const });
    const res = await POST(buildRequest({ dateISO: "2026-08-15", time: "14:00" }), buildParams("real-token"));
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body).toEqual({ error: "This booking link is no longer valid." });
  });

  it("returns the same response for a past-date booking as for an unknown token", async () => {
    mockGetBookingByToken.mockResolvedValue({ ...booking, dateISO: "1999-01-01" });
    const res = await POST(buildRequest({ dateISO: "2026-08-15", time: "14:00" }), buildParams("real-token"));
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body).toEqual({ error: "This booking link is no longer valid." });
  });

  it("still succeeds even if the Telegram notification fails", async () => {
    mockGetBookingByToken.mockResolvedValue(booking);
    mockReserveSlot.mockResolvedValue(true);
    mockSaveBookingRecord.mockResolvedValue(undefined);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const res = await POST(buildRequest({ dateISO: "2026-08-15", time: "14:00" }), buildParams("real-token"));

    expect(res.status).toBe(200);
  });
});
