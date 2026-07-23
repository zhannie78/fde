import { NextResponse } from "next/server";

import { freeSlot, getBookingByToken, isManageable, saveBookingRecord } from "@/lib/booking-store";
import { sendBookingUpdateEmail } from "@/lib/email";

type RouteParams = { params: Promise<{ token: string }> };

const INVALID_TOKEN_ERROR = "This booking link is no longer valid.";

export async function POST(_request: Request, { params }: RouteParams) {
  const { token } = await params;
  const booking = await getBookingByToken(token);

  if (!booking || !isManageable(booking)) {
    return NextResponse.json({ error: INVALID_TOKEN_ERROR }, { status: 404 });
  }

  await saveBookingRecord(token, { ...booking, status: "cancelled" });
  await freeSlot(booking.dateISO, booking.time);

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Cancellation notification skipped: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not configured.");
  } else {
    try {
      const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Booking cancelled\nName: ${booking.name}\nEmail: ${booking.email}\nWas: ${booking.dateISO} ${booking.time}`,
        }),
      });

      if (!telegramRes.ok) {
        console.error("Cancellation notification failed: Telegram responded with", telegramRes.status);
      }
    } catch (error) {
      console.error("Cancellation notification failed: Telegram request threw.", error);
    }
  }

  await sendBookingUpdateEmail({
    state: "cancelled",
    to: booking.email,
    name: booking.name,
    dateISO: booking.dateISO,
    time: booking.time,
    manageToken: token,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
