import { NextResponse } from "next/server";

import { getSlotsForDate } from "@/lib/availability-store";
import { rescheduleSchema } from "@/lib/booking-schemas";
import { freeSlot, getBookingByToken, isManageable, reserveSlot, saveBookingRecord } from "@/lib/booking-store";
import { sendBookingUpdateEmail } from "@/lib/email";

type RouteParams = { params: Promise<{ token: string }> };

const GENERIC_ERROR = "Booking is temporarily unavailable — please try again.";
const INVALID_TOKEN_ERROR = "This booking link is no longer valid.";

export async function POST(request: Request, { params }: RouteParams) {
  const { token } = await params;
  const body = await request.json().catch(() => null);
  const parsed = rescheduleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid date/time." }, { status: 400 });
  }

  const { dateISO: newDateISO, time: newTime } = parsed.data;
  const offeredTimes = await getSlotsForDate(newDateISO);

  if (!offeredTimes.includes(newTime)) {
    return NextResponse.json({ error: "That time isn't available." }, { status: 400 });
  }

  const booking = await getBookingByToken(token);

  if (!booking || !isManageable(booking)) {
    return NextResponse.json({ error: INVALID_TOKEN_ERROR }, { status: 404 });
  }

  if (newDateISO === booking.dateISO && newTime === booking.time) {
    return NextResponse.json({ error: "That's already your booked time." }, { status: 400 });
  }

  const reserved = await reserveSlot(newDateISO, newTime, token);

  if (!reserved) {
    return NextResponse.json(
      { error: "That slot was just taken — please pick another one." },
      { status: 409 }
    );
  }

  try {
    await saveBookingRecord(token, { ...booking, dateISO: newDateISO, time: newTime });
  } catch (error) {
    console.error("Reschedule failed: could not update booking record.", error);
    try {
      await freeSlot(newDateISO, newTime);
    } catch (cleanupError) {
      console.error("Reschedule failed: could not free orphaned slot lock.", newDateISO, newTime, cleanupError);
    }
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }

  try {
    await freeSlot(booking.dateISO, booking.time);
  } catch (error) {
    console.error("Reschedule warning: could not free old slot lock.", booking.dateISO, booking.time, error);
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Reschedule notification skipped: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not configured.");
  } else {
    try {
      const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Booking rescheduled\nName: ${booking.name}\nEmail: ${booking.email}\nFrom: ${booking.dateISO} ${booking.time}\nTo: ${newDateISO} ${newTime}`,
        }),
      });

      if (!telegramRes.ok) {
        console.error("Reschedule notification failed: Telegram responded with", telegramRes.status);
      }
    } catch (error) {
      console.error("Reschedule notification failed: Telegram request threw.", error);
    }
  }

  await sendBookingUpdateEmail({
    state: "rescheduled",
    to: booking.email,
    name: booking.name,
    dateISO: newDateISO,
    time: newTime,
    manageToken: token,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
