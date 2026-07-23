import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockReserveSlot, mockSaveBookingRecord, mockFreeSlot, mockGenerateManageToken } = vi.hoisted(() => ({
  mockReserveSlot: vi.fn(),
  mockSaveBookingRecord: vi.fn(),
  mockFreeSlot: vi.fn(),
  mockGenerateManageToken: vi.fn(() => "test-token"),
}));

vi.mock("@/lib/booking-store", () => ({
  reserveSlot: mockReserveSlot,
  saveBookingRecord: mockSaveBookingRecord,
  freeSlot: mockFreeSlot,
  generateManageToken: mockGenerateManageToken,
}));

const { mockSendBookingUpdateEmail } = vi.hoisted(() => ({
  mockSendBookingUpdateEmail: vi.fn(),
}));
vi.mock("@/lib/email", () => ({
  sendBookingUpdateEmail: mockSendBookingUpdateEmail,
}));

import { POST } from "./route";

const validBody = {
  name: "Jane Doe",
  email: "jane@example.com",
  note: "Need help with invoicing.",
  dateISO: "2026-08-10",
  time: "09:00",
};

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  process.env.TELEGRAM_BOT_TOKEN = "test-bot-token";
  process.env.TELEGRAM_CHAT_ID = "12345";
});

describe("POST /api/book", () => {
  it("returns 400 for invalid input", async () => {
    const res = await POST(buildRequest({ name: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 when the slot is already taken, without saving a record", async () => {
    mockReserveSlot.mockResolvedValue(false);
    const res = await POST(buildRequest(validBody));
    expect(res.status).toBe(409);
    expect(mockSaveBookingRecord).not.toHaveBeenCalled();
  });

  it("saves the booking and sends the confirmation email on success", async () => {
    mockReserveSlot.mockResolvedValue(true);
    mockSaveBookingRecord.mockResolvedValue(undefined);

    const res = await POST(buildRequest(validBody));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(mockReserveSlot).toHaveBeenCalledWith("2026-08-10", "09:00", "test-token");
    expect(mockSaveBookingRecord).toHaveBeenCalledWith("test-token", {
      dateISO: "2026-08-10",
      time: "09:00",
      name: "Jane Doe",
      email: "jane@example.com",
      note: "Need help with invoicing.",
      status: "confirmed",
      createdAt: expect.any(String),
    });
    expect(mockSendBookingUpdateEmail).toHaveBeenCalledWith({
      state: "confirmed",
      to: "jane@example.com",
      name: "Jane Doe",
      dateISO: "2026-08-10",
      time: "09:00",
      manageToken: "test-token",
    });
  });

  it("frees the slot and returns 500 if saving the record fails", async () => {
    mockReserveSlot.mockResolvedValue(true);
    mockSaveBookingRecord.mockRejectedValue(new Error("blobs down"));

    const res = await POST(buildRequest(validBody));

    expect(res.status).toBe(500);
    expect(mockFreeSlot).toHaveBeenCalledWith("2026-08-10", "09:00");
  });

  it("still succeeds even if the Telegram notification fails", async () => {
    mockReserveSlot.mockResolvedValue(true);
    mockSaveBookingRecord.mockResolvedValue(undefined);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const res = await POST(buildRequest(validBody));

    expect(res.status).toBe(200);
  });
});
