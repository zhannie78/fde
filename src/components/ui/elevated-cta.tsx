import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type ElevatedCtaProps = {
  className?: string;
};

/**
 * Static dual-glow + shine-sweep final CTA button (Server Component — no
 * client JS, the glow/shine are pure CSS from globals.css's
 * `.glow-wrap-final`/`.btn-final` classes). Reserved for the LAST/most
 * important CTA on a page — the homepage FinalCta and the About page's
 * final CTA render the exact same markup so the two match exactly.
 *
 * Reads its label from `siteConfig.bookCtaLabel` rather than a hardcoded
 * string literal so it can never drift from `BookCta`'s own label.
 */
export function ElevatedCta({ className }: ElevatedCtaProps) {
  return (
    <div className="glow-wrap-final">
      <Link href="/book" className={cn("btn-final", className)}>
        {siteConfig.bookCtaLabel}
        <span className="arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </div>
  );
}
