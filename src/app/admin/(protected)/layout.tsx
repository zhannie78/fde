import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { SESSION_COOKIE_NAME, isValidSessionCookie } from "@/lib/admin-auth";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!isValidSessionCookie(session)) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
