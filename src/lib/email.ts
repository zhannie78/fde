import { headers } from "next/headers";
import { render } from "@react-email/render";
import { Resend } from "resend";

import { siteConfig } from "@/config/site";
import { formatSlotLabel } from "@/lib/booking";
import { BookingUpdateEmail } from "@/emails/booking-update-email";

type BookingEmailState = "confirmed" | "cancelled" | "rescheduled";

const FROM_ADDRESS = `AI Deployed Bookings <bookings@${siteConfig.domain}>`;

const SUBJECT: Record<BookingEmailState, string> = {
  confirmed: "You're booked with AI Deployed",
  cancelled: "Your AI Deployed booking was cancelled",
  rescheduled: "Your AI Deployed booking was rescheduled",
};

/**
 * Derives the manage-link base URL from the actual incoming request's Host
 * header rather than a hardcoded production domain — so the link correctly
 * points at localhost during local dev, a preview deploy, or the real
 * production domain, with no manual config to remember or forget.
 */
export function resolveBaseUrl(
  host: string | null | undefined,
  forwardedProto: string | null | undefined
): string {
  if (!host) return `https://${siteConfig.domain}`;
  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.");
  const protocol = forwardedProto ?? (isLocalhost ? "http" : "https");
  return `${protocol}://${host}`;
}

/**
 * Best-effort visitor-facing email. Never throws — a Resend outage must
 * never block or roll back a booking that's already durably reserved in
 * Netlify Blobs. Failures are logged server-side only.
 */
export async function sendBookingUpdateEmail(params: {
  state: BookingEmailState;
  to: string;
  name: string;
  dateISO: string;
  time: string;
  manageToken: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("Booking email skipped: RESEND_API_KEY not configured.");
    return;
  }

  const headersList = await headers();
  const baseUrl = resolveBaseUrl(headersList.get("host"), headersList.get("x-forwarded-proto"));
  const manageUrl = `${baseUrl}/book/manage/${params.manageToken}`;

  try {
    const html = await render(
      BookingUpdateEmail({
        state: params.state,
        name: params.name,
        dateLabel: formatSlotLabel(params.dateISO, params.time),
        manageUrl,
      })
    );

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [params.to],
      subject: SUBJECT[params.state],
      html,
    });

    if (error) {
      console.error("Booking email failed:", error);
    }
  } catch (error) {
    console.error("Booking email threw:", error);
  }
}
