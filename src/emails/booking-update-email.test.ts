import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";

import { BookingUpdateEmail } from "./booking-update-email";

const baseProps = {
  name: "Jane Doe",
  dateLabel: "Monday, August 10, 2026 · 9:00 AM – 9:30 AM ET",
  manageUrl: "https://aideployed.dev/book/manage/abc123",
};

describe("BookingUpdateEmail", () => {
  it("renders the confirmation state with the manage link", async () => {
    const html = await render(BookingUpdateEmail({ state: "confirmed", ...baseProps }));
    expect(html).toContain("Your call is booked");
    expect(html).toContain(baseProps.dateLabel);
    expect(html).toContain(baseProps.manageUrl);
  });

  it("renders the rescheduled state with the manage link", async () => {
    const html = await render(BookingUpdateEmail({ state: "rescheduled", ...baseProps }));
    expect(html).toContain("rescheduled");
    expect(html).toContain(baseProps.manageUrl);
  });

  it("renders the cancelled state without a manage link", async () => {
    const html = await render(BookingUpdateEmail({ state: "cancelled", ...baseProps }));
    expect(html).toContain("cancelled");
    expect(html).not.toContain(baseProps.manageUrl);
  });
});
