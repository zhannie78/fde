import type { Metadata } from "next";

import { ScrollStoryProvider } from "@/components/scroll-story-provider";
import { FinalCta } from "@/components/sections/final-cta";
import { Hero } from "@/components/sections/hero";
import { MarketGapBand } from "@/components/sections/market-gap-band";
import { Offer } from "@/components/sections/offer";
import { ProcessTransparency } from "@/components/sections/process-transparency";
import { RoiCalculator } from "@/components/sections/roi-calculator";
import { TheFix } from "@/components/sections/the-fix";
import { Ticker } from "@/components/sections/ticker";

export const metadata: Metadata = {
  title: "Forward-deployed AI engineering for small and medium businesses",
  description:
    "95% of AI projects never deliver ROI — not because the models are weak, but because nobody embeds deep enough in the real workflow. A forward-deployed engineer closes that gap: AI agents and automation built into your actual workflows, priced for SMBs. Start with a free audit.",
};

/**
 * Home route, ported to match the Phase 6 sketch's section order: Hero (the
 * gap) -> Ticker -> MarketGapBand (the access gap) -> TheFix (the fix,
 * including the TIME/EFFICIENCY/PROFIT stat row per the sketch) ->
 * RoiCalculator (proof) -> Offer (the pricing) -> ProcessTransparency (how
 * it works) -> FinalCta (book the free audit).
 */
export default function Home() {
  return (
    <ScrollStoryProvider>
      <Hero />
      <Ticker />
      <MarketGapBand />
      <TheFix />
      <RoiCalculator />
      <Offer />
      <ProcessTransparency />
      <FinalCta />
    </ScrollStoryProvider>
  );
}
