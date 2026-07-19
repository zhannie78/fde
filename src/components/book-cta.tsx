import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BookCtaProps = {
  /**
   * "primary" — standard header/hero/footer CTA button.
   * "sticky" — full-width, 44px-min-height variant for the mobile sticky bar.
   */
  variant?: "primary" | "sticky";
  className?: string;
};

/**
 * The single reusable "Book Your Free Audit Call" CTA (D-02).
 * Every instance across the site — header, hero, footer, sticky mobile bar —
 * renders through this component so the copy and destination never drift.
 */
export function BookCta({ variant = "primary", className }: BookCtaProps) {
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
