import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import { saveWeeklyTemplate } from "@/lib/availability-store";
import { weeklyTemplateSchema } from "@/lib/booking-schemas";

export async function POST(request: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = weeklyTemplateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid template." }, { status: 400 });
  }

  await saveWeeklyTemplate(parsed.data);
  return NextResponse.json({ ok: true });
}
