import { NextResponse } from "next/server";

import { listUpcomingSlots } from "@/lib/slots";

export async function GET() {
  const slots = await listUpcomingSlots(21);
  return NextResponse.json({ slots });
}
