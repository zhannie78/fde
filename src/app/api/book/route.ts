import { NextResponse } from "next/server";
import { z } from "zod";

import { formatSlotLabel } from "@/lib/booking";

/**
 * Server-only Route Handler for the native booking flow. This is the ONLY
 * place TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID are read — never expose them to
 * client code, mirroring CLAUDE.md's "never call the Anthropic SDK from a
 * Client Component" rule. Untrusted request body is zod-validated before
 * any use (T-b89-01); the Telegram sendMessage call omits `parse_mode`
 * entirely so user-controlled name/note can never inject Telegram
 * HTML/Markdown formatting entities (T-b89-03).
 */
const bookingSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email(),
  note: z.string().trim().min(1).max(2000),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking details." }, { status: 400 });
  }

  const { name, email, note, dateISO } = parsed.data;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Booking failed: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not configured.");
    return NextResponse.json(
      { error: "Booking is temporarily unavailable — please email instead." },
      { status: 500 }
    );
  }

  const message = [
    "New booking request",
    `Name: ${name}`,
    `Email: ${email}`,
    `When: ${formatSlotLabel(dateISO)}`,
    `Note: ${note}`,
  ].join("\n");

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });

    if (!telegramRes.ok) {
      return NextResponse.json(
        { error: "Couldn't send your booking — please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Booking failed: Telegram request threw.", error);
    return NextResponse.json(
      { error: "Couldn't send your booking — please try again." },
      { status: 500 }
    );
  }
}
