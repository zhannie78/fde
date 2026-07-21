import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GlowButton } from "@/components/ui/glow";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type BookCtaProps = {
  /**
   * "primary" — standard header/hero/footer CTA button.
   * "sticky" — full-width, 44px-min-height variant for the mobile sticky bar.
   */
  variant?: "primary" | "sticky";
  className?: string;
  /**
   * Opt in to the animated green-duotone glow effect (highest-impact
   * placements only — Hero and FinalCta). Defaults to false/off so every
   * other call site renders the plain Button unchanged.
   */
  glow?: boolean;
  /**
   * Override the shared siteConfig.bookCtaLabel for this instance only
   * (e.g. header/footer "Contact" vs. the default "Book a Free Call Now").
   */
  label?: string;
  /**
   * Override the shared `/book` destination for a single call site — e.g.
   * the footer's `/contact` link — every other call site is unaffected and
   * keeps linking to `/book` since this defaults to `"/book"` when omitted.
   */
  href?: string;
};

/**
 * The single reusable CTA rendering the shared label from site config (D-02)
 * by default. Every instance across the site — header, hero, footer, sticky
 * mobile bar — renders through this component so the copy and destination
 * never drift, unless a call site explicitly opts into a different `label`.
 */
export function BookCta({ variant = "primary", className, glow, label, href }: BookCtaProps) {
  const displayLabel = label ?? siteConfig.bookCtaLabel;
  const destination = href ?? "/book";

  if (glow) {
    return (
      <GlowButton
        asChild
        size={variant === "sticky" ? "lg" : "default"}
        className={cn(variant === "sticky" && "h-11 w-full text-base", className)}
      >
        <Link href={destination}>{displayLabel}</Link>
      </GlowButton>
    );
  }

  return (
    <Button
      asChild
      size={variant === "sticky" ? "lg" : "default"}
      className={cn(variant === "sticky" && "h-11 w-full text-base", className)}
    >
      <Link href={destination}>{displayLabel}</Link>
    </Button>
  );
}
