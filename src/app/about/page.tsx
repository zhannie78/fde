import type { Metadata } from "next";

import { BookCta } from "@/components/book-cta";
import { FounderBlock } from "@/components/founder-block";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `${siteConfig.name} is built and run by a former forward-deployed engineer — here's the story behind the company.`,
};

/**
 * About route (SITE-02): the company-first credibility layer. Leads with
 * AI Deployed as the brand, then introduces the founder's FDE story as the
 * human trust layer behind it (D-12) — not a personal-blog framing.
 */
export default function AboutPage() {
  return (
    <>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-16">
        <h1
          className="font-heading leading-[1.2] font-semibold text-foreground"
          style={{ fontSize: "28px" }}
        >
          AI Deployed, and the person who deploys it
        </h1>
        <p className="max-w-xl text-base leading-[1.6] text-foreground">
          AI Deployed builds custom, white-glove AI tools for small
          businesses — the kind of fix a forward-deployed engineer would
          have built for an enterprise client, sized and priced for a
          business with one owner instead of a procurement committee.
        </p>
      </section>

      <FounderBlock />

      <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="font-heading text-2xl leading-[1.2] font-semibold text-foreground sm:text-[1.75rem]">
          Why it works the same way for you
        </h2>
        <p className="max-w-xl text-base leading-[1.6] text-foreground">
          Enterprise clients don&apos;t pay a forward-deployed engineer for
          more technology — they pay for someone who sits with the actual
          work, finds the bottleneck nobody had quite named, and ships a
          fix that sticks. That&apos;s the whole model here too: a free
          audit to find what&apos;s actually costing you time and money,
          then a scoped build to fix it.
        </p>
        <BookCta />
      </section>
    </>
  );
}
