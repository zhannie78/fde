import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetBookingByToken, mockSaveBookingRecord, mockFreeSlot } = vi.hoisted(() => ({
  mockGetBookingByToken: vi.fn(),
  mockSaveBookingRecord: vi.fn(),
  mockFreeSlot: vi.fn(),
}));

vi.mock("@/lib/booking-store", () => ({
  getBookingByToken: mockGetBookingByToken,
  saveBookingRecord: mockSaveBookingRecord,
  freeSlot: mockFreeSlot,
  isManageable: (record: { status: string; dateISO: string }) =>
    record.status === "confirmed" && record.dateISO >= "2000-01-01",
}));

const { mockSendBookingUpdateEmail } = vi.hoisted(() => ({
  mockSendBookingUpdateEmail: vi.fn(),
}));
vi.mock("@/lib/email", () => ({
  sendBookingUpdateEmail: mockSendBookingUpdateEmail,
}));

import { POST } from "./route";

const booking = {
  dateISO: "2026-08-10",
  time: "09:00",
  name: "Jane Doe",
  email: "jane@example.com",
  note: "Note",
  status: "confirmed" as const,
  createdAt: "2026-07-23T00:00:00.000Z",
};

function buildParams(token: string) {
  return { params: Promise.resolve({ token }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  process.env.TELEGRAM_BOT_TOKEN = "test-bot-token";
  process.env.TELEGRAM_CHAT_ID = "12345";
});

describe("POST /api/book/manage/[token]/cancel", () => {
  it("returns 404 for an unknown token", async () => {
    mockGetBookingByToken.mockResolvedValue(null);
    const res = await POST(new Request("http://localhost"), buildParams("missing"));
    expect(res.status).toBe(404);
  });

  it("cancels the booking, frees the slot, and emails the visitor", async () => {
    mockGetBookingByToken.mockResolvedValue(booking);
    const res = await POST(new Request("http://localhost"), buildParams("real-token"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(mockSaveBookingRecord).toHaveBeenCalledWith("real-token", { ...booking, status: "cancelled" });
    expect(mockFreeSlot).toHaveBeenCalledWith("2026-08-10", "09:00");
    expect(mockSendBookingUpdateEmail).toHaveBeenCalledWith({
      state: "cancelled",
      to: "jane@example.com",
      name: "Jane Doe",
      dateISO: "2026-08-10",
      time: "09:00",
      manageToken: "real-token",
    });
  });
});
