import { NextResponse } from "next/server";

import { formatSlotLabel, getTodayISO } from "@/lib/booking";
import { getSlotsForDate } from "@/lib/availability-store";
import { bookingSchema } from "@/lib/booking-schemas";
import { freeSlot, generateManageToken, reserveSlot, saveBookingRecord } from "@/lib/booking-store";
import { sendBookingUpdateEmail } from "@/lib/email";
import { checkBookingRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Server-only Route Handler for the native booking flow. Reserves the
 * slot atomically in Netlify Blobs before persisting the full record —
 * this is what actually prevents two visitors from double-booking the
 * same date+time, not just the zod validation. Telegram and the visitor
 * confirmation email are both best-effort once the reservation succeeds:
 * their failure is logged but never turns an already-successful booking
 * into a client-visible error.
 */
const GENERIC_ERROR = "Booking is temporarily unavailable — please email instead.";

export async function POST(request: Request) {
  const allowed = await checkBookingRateLimit(getClientIp(request));

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many booking attempts — please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking details." }, { status: 400 });
  }

  const { name, email, note, dateISO, time } = parsed.data;

  if (dateISO < getTodayISO()) {
    return NextResponse.json({ error: "That date has already passed." }, { status: 400 });
  }

  const offeredTimes = await getSlotsForDate(dateISO);

  if (!offeredTimes.includes(time)) {
    return NextResponse.json({ error: "That time isn't available." }, { status: 400 });
  }

  const manageToken = generateManageToken();

  const reserved = await reserveSlot(dateISO, time, manageToken);

  if (!reserved) {
    return NextResponse.json(
      { error: "That slot was just taken — please pick another one." },
      { status: 409 }
    );
  }

  try {
    await saveBookingRecord(manageToken, {
      dateISO,
      time,
      name,
      email,
      note,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Booking failed: could not save booking record.", error);
    try {
      await freeSlot(dateISO, time);
    } catch (cleanupError) {
      console.error("Booking failed: could not free orphaned slot lock.", dateISO, time, cleanupError);
    }
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Booking notification skipped: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not configured.");
  } else {
    const message = [
      "New booking request",
      `Name: ${name}`,
      `Email: ${email}`,
      `When: ${formatSlotLabel(dateISO, time)}`,
      `Note: ${note}`,
    ].join("\n");

    try {
      const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message }),
      });

      if (!telegramRes.ok) {
        console.error("Booking notification failed: Telegram responded with", telegramRes.status);
      }
    } catch (error) {
      console.error("Booking notification failed: Telegram request threw.", error);
    }
  }

  await sendBookingUpdateEmail({ state: "confirmed", to: email, name, dateISO, time, manageToken });

  return NextResponse.json({ ok: true }, { status: 200 });
}
