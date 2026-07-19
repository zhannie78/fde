import type { Metadata } from "next";

import { BookCta } from "@/components/book-cta";
import { ServiceSequence } from "@/components/service-sequence";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Services",
  description: `${siteConfig.name}'s white-glove engagement model: a free audit, a fixed-scope project, and an ongoing retainer.`,
};

/**
 * Services route (SITE-03): the white-glove engagement model explained in
 * plain language (D-11/D-12, no AI jargon), rendered via ServiceSequence as
 * a deliberate numbered flow — not a templated card grid.
 */
export default function ServicesPage() {
  return (
    <>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-16">
        <h1
          className="font-heading leading-[1.2] font-semibold text-foreground"
          style={{ fontSize: "28px" }}
        >
          How the engagement works
        </h1>
        <p className="max-w-xl text-base leading-[1.6] text-foreground">
          No retainer up front, no long sales process. You start with a free
          look at where your business is losing time and money, then we
          build the fix — only once you&apos;ve seen exactly what it is and
          what it&apos;s worth.
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <ServiceSequence />
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="font-heading text-2xl leading-[1.2] font-semibold text-foreground sm:text-[1.75rem]">
          Ready to see what&apos;s slipping through?
        </h2>
        <BookCta />
      </section>
    </>
  );
}
