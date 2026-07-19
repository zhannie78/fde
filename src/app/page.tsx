import type { Metadata } from "next";

import { EngagementFlow } from "@/components/sections/engagement-flow";
import { FinalCta } from "@/components/sections/final-cta";
import { FounderStrip } from "@/components/sections/founder-strip";
import { Hero } from "@/components/sections/hero";
import { Outcomes } from "@/components/sections/outcomes";
import { VerticalsTeaser } from "@/components/sections/verticals-teaser";

export const metadata: Metadata = {
  title: "Recover the time and money your business is losing",
  description:
    "Free workflow audits and custom-built tools that catch missed calls, slow follow-ups, and manual busywork — so you recover real hours and real dollars.",
};

/**
 * Home route (D-09 section order): Hero (headline + demo-placeholder focal
 * point), Outcomes, EngagementFlow, VerticalsTeaser, FounderStrip, FinalCta.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Outcomes />
      <EngagementFlow />
      <VerticalsTeaser />
      <FounderStrip />
      <FinalCta />
    </>
  );
}
