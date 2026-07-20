import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GlowButton } from "@/components/ui/glow";
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
};

/**
 * The single reusable "Book Your Free Audit Call" CTA (D-02).
 * Every instance across the site — header, hero, footer, sticky mobile bar —
 * renders through this component so the copy and destination never drift.
 */
export function BookCta({ variant = "primary", className, glow }: BookCtaProps) {
  if (glow) {
    return (
      <GlowButton
        asChild
        size={variant === "sticky" ? "lg" : "default"}
        className={cn(variant === "sticky" && "h-11 w-full text-base", className)}
      >
        <Link href="/book">Book Your Free Audit Call</Link>
      </GlowButton>
    );
  }

  return (
    <Button
      asChild
      size={variant === "sticky" ? "lg" : "default"}
      className={cn(variant === "sticky" && "h-11 w-full text-base", className)}
    >
      <Link href="/book">Book Your Free Audit Call</Link>
    </Button>
  );
}
