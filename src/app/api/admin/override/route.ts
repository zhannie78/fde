import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import { removeOverrideForDate, setOverrideForDate } from "@/lib/availability-store";
import { dateISOSchema, overrideSchema } from "@/lib/booking-schemas";

export async function POST(request: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = overrideSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid override." }, { status: 400 });
  }

  await setOverrideForDate(parsed.data.dateISO, parsed.data.times);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = dateISOSchema.safeParse(searchParams.get("dateISO"));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }

  await removeOverrideForDate(parsed.data);
  return NextResponse.json({ ok: true });
}
