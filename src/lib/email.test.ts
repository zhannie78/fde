import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockSend = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

import { sendBookingUpdateEmail } from "./email";

const ORIGINAL_ENV = { ...process.env };

const baseParams = {
  state: "confirmed" as const,
  to: "jane@example.com",
  name: "Jane Doe",
  dateISO: "2026-08-10",
  time: "09:00",
  manageToken: "abc123",
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.RESEND_API_KEY = "test-api-key";
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("sendBookingUpdateEmail", () => {
  it("does nothing and does not throw when RESEND_API_KEY is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    await expect(sendBookingUpdateEmail(baseParams)).resolves.toBeUndefined();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("sends via Resend with the correct fields on success", async () => {
    mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });

    await sendBookingUpdateEmail(baseParams);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const call = mockSend.mock.calls[0][0];
    expect(call.to).toEqual(["jane@example.com"]);
    expect(call.subject).toBe("You're booked with AI Deployed");
    expect(call.html).toContain("Jane Doe");
    expect(typeof call.from).toBe("string");
  });

  it("does not throw when Resend resolves with an error field", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "bad request" } });
    await expect(sendBookingUpdateEmail(baseParams)).resolves.toBeUndefined();
  });

  it("does not throw when the Resend call rejects", async () => {
    mockSend.mockRejectedValue(new Error("network down"));
    await expect(sendBookingUpdateEmail(baseParams)).resolves.toBeUndefined();
  });
});
