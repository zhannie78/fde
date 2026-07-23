import type { Metadata } from "next";
import Link from "next/link";

import { BookingFlow } from "@/components/booking/booking-flow";
import { siteConfig } from "@/config/site";
import { listUpcomingSlots } from "@/lib/slots";

export const metadata: Metadata = {
  title: "Book Your Free Audit Call",
  description:
    "Grab 30 minutes for a plain conversation about where your business is losing time and money to manual work — no pitch.",
};

// Reads live availability from Netlify Blobs on every request — Blobs has
// no build-time context, so this page must never be statically prerendered.
export const dynamic = "force-dynamic";

/**
 * /book — the single place the site's persistent CTA points (D-02).
 * Native, Cal.com-free multi-step booking flow: only <BookingFlow /> is a
 * Client Component; this page itself stays a Server Component so the
 * surrounding copy ships with zero extra client JS.
 */
export default async function BookPage() {
  const slots = await listUpcomingSlots(21);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16 sm:px-8 sm:py-24">
      <div className="flex flex-col gap-4 text-center sm:text-left">
        <h1 className="text-[1.75rem] leading-[1.2] font-heading font-bold text-foreground">
          Book Your <span className="text-primary">Free Audit Call</span> with{" "}
          <Link
            href="/about"
            className="underline hover:text-primary transition-colors"
          >
            {siteConfig.founderName}
          </Link>
        </h1>
        <p className="text-base leading-[1.6] text-foreground">
          Thirty minutes, no slide deck — just a plain conversation about
          where your business is losing hours and dollars to manual
          busywork and workflows that don&apos;t run themselves.
          We&apos;ll figure out together whether there&apos;s a fast,
          worthwhile fix, and if there is, what it would take to build it.
        </p>
      </div>
      <div className="w-full">
        <BookingFlow slots={slots} />
      </div>
    </div>
  );
}
