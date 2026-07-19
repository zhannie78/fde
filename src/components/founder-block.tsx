import Image from "next/image";

import { siteConfig } from "@/config/site";

/**
 * Founder credibility block (About page, SITE-02): a deliberate custom
 * treatment of the D-07 temporary founder-photo placeholder — NOT a generic
 * centered avatar+name+role bio-card. The photo runs large in its own
 * column against an ink-navy band; the FDE narrative sits alongside it,
 * company-first per D-12 ("AI Deployed, and here's the person who deploys
 * it," not a personal blog).
 *
 * Biographical specifics are clearly-bracketed NEEDS-FOUNDER placeholders
 * (D-13) — no invented biography facts, ever.
 */
export function FounderBlock() {
  return (
    <section className="bg-secondary text-secondary-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.4fr] lg:items-start lg:gap-16">
        <div className="flex flex-col gap-4">
          <Image
            src="/founder-placeholder.svg"
            alt={`${siteConfig.founderName}, founder of ${siteConfig.name}`}
            width={480}
            height={480}
            className="w-full max-w-sm rounded-xl ring-1 ring-secondary-foreground/20"
          />
          <p className="text-sm font-semibold tracking-[0.02em] text-secondary-foreground/70 uppercase">
            {siteConfig.founderName} &middot; [{siteConfig.region}]
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-sm font-semibold tracking-[0.02em] text-primary uppercase">
            Who&apos;s behind AI Deployed
          </p>
          <p className="text-base leading-[1.6] text-secondary-foreground/90">
            Before AI Deployed, {siteConfig.founderName} worked as a
            forward-deployed engineer — embedded directly inside{" "}
            <span>
              [FDE work-history beat — client sector/scale — NEEDS-FOUNDER]
            </span>
            , sitting with the people actually doing the work until the real
            bottleneck surfaced, then shipping the fix herself instead of
            handing off a slide deck.
          </p>
          <p className="text-base leading-[1.6] text-secondary-foreground/90">
            That job was{" "}
            <span>
              [specific FDE engagement or outcome — NEEDS-FOUNDER]
            </span>
            . The pattern was always the same: the business already knew
            something was slow, but not exactly where the time and money
            were leaking — and the fix, once built, felt obvious in
            hindsight.
          </p>
          <p className="text-base leading-[1.6] text-secondary-foreground/90">
            AI Deployed is that same job, aimed at businesses in{" "}
            [{siteConfig.region}] instead of enterprise deployments: embed,
            find the actual pain, build the tool that fixes it. I embedded
            with enterprise clients — now I embed AI in your business.
          </p>
          <p className="text-sm text-secondary-foreground/70">
            <span>
              [Full name-as-presented, years of FDE experience, and specific
              past employers/clients — NEEDS-FOUNDER, per D-13. No
              biographical fact ships here until confirmed.]
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
