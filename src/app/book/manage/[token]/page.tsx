import type { Metadata } from "next";

import { ManageBooking } from "@/components/booking/manage-booking";
import { formatSlotLabel } from "@/lib/booking";
import { getBookingByToken, isManageable } from "@/lib/booking-store";

export const metadata: Metadata = { title: "Manage Your Booking" };

// Looks up a specific booking from Netlify Blobs on every request — Blobs
// has no build-time context, so this page must never be statically
// prerendered (and every token's page must reflect the current record).
export const dynamic = "force-dynamic";

type ManageBookingPageProps = {
  params: Promise<{ token: string }>;
};

export default async function ManageBookingPage({ params }: ManageBookingPageProps) {
  const { token } = await params;
  const booking = await getBookingByToken(token);

  if (!booking || !isManageable(booking)) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16 text-center sm:px-8 sm:py-24">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          This booking link is no longer valid.
        </h1>
        <p className="text-base text-muted-foreground">
          If you still need to book or change a call, head back to the{" "}
          <a href="/book" className="underline hover:text-primary">
            booking page
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16 sm:px-8 sm:py-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-heading font-bold text-foreground">Manage Your Booking</h1>
        <p className="text-base text-foreground">{formatSlotLabel(booking.dateISO, booking.time)}</p>
      </div>
      <ManageBooking token={token} currentDateISO={booking.dateISO} currentTime={booking.time} />
    </div>
  );
}
