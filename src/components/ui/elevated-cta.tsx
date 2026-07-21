import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type ElevatedCtaProps = {
  className?: string;
  /** Override the shared siteConfig.bookCtaLabel for this instance only. */
  label?: string;
};

/**
 * Static dual-glow + shine-sweep final CTA button (Server Component — no
 * client JS, the glow/shine are pure CSS from globals.css's
 * `.glow-wrap-final`/`.btn-final` classes). Reserved for the LAST/most
 * important CTA on a page — the homepage FinalCta and the About page's
 * final CTA render the exact same markup so the two match exactly.
 *
 * Reads its label from `siteConfig.bookCtaLabel` by default so it can never
 * drift from `BookCta`'s own label, unless a call site opts into `label`.
 */
export function ElevatedCta({ className, label }: ElevatedCtaProps) {
  return (
    <div className="glow-wrap-final">
      <Link href="/book" className={cn("btn-final", className)}>
        {label ?? siteConfig.bookCtaLabel}
        <span className="arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </div>
  );
}
