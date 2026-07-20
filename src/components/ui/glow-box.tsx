import * as React from "react";

import { cn } from "@/lib/utils";

type GlowBoxProps = React.ComponentProps<"div">;

/**
 * Pure-CSS two-layer hover-backlight card wrapper (Server Component — no
 * client JS, the effect is entirely `.glow-box`/`.glow-box-inner` CSS from
 * globals.css). Used by stat cards, offer cards, process-step cards, and
 * About-page portfolio case cards.
 *
 * Content MUST be rendered inside `.glow-box-inner`, never directly in
 * `.glow-box` — the glow bleeds -11px beyond the card and a parent with
 * `overflow: hidden` will clip it.
 */
export function GlowBox({ className, children, ...props }: GlowBoxProps) {
  return (
    <div className={cn("glow-box", className)} {...props}>
      <div className="glow-box-inner">{children}</div>
    </div>
  );
}
