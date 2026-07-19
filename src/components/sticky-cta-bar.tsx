"use client";

import { BookCta } from "@/components/book-cta";

/**
 * Bottom-anchored, mobile-only CTA bar. 56px tall (h-14, on-grid) so the
 * header's persistent CTA has a mobile equivalent that never scrolls away.
 * Hidden at the desktop breakpoint where the header CTA already persists.
 */
export function StickyCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center border-t border-border bg-background px-4 md:hidden">
      <BookCta variant="sticky" />
    </div>
  );
}
