import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getWeeklyTemplate, listOverrides } from "@/lib/availability-store";

export const metadata: Metadata = { title: "Availability Admin" };

// Reads the live weekly template/overrides from Netlify Blobs on every
// request — Blobs has no build-time context, so this page must never be
// statically prerendered.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [template, overrides] = await Promise.all([getWeeklyTemplate(), listOverrides()]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <h1 className="text-2xl font-heading font-bold text-foreground">Availability</h1>
      <AdminDashboard initialTemplate={template} initialOverrides={overrides} />
    </div>
  );
}
