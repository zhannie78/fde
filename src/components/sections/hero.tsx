import Link from "next/link";

import { BookCta } from "@/components/book-cta";
import { siteConfig } from "@/config/site";

/**
 * Hero — the "gap" half of the 5-part message hierarchy (LAND-01). Carries
 * the only Display-size text on the page (UI-SPEC Typography: "Display is
 * reserved for the Hero H1 only... every section below is visually
 * subordinate"). Single-column: the v1 right-column demo slot is removed —
 * this phase has no reassigned use for it (the live-demo concept it held
 * was scrapped by the v2 pivot).
 *
 * DSGN-05 anonymity reversal: the "Hello, I'm Annie —" line links to /about,
 * reversing the earlier anonymous-FDE framing per the sketch-findings-fde
 * skill's explicit, confirmed user override.
 *
 * `hero-section` on the root and `hero-lede` on the scrub-parallax
 * paragraphs are stable GSAP selector hooks consumed by the scroll-story
 * provider (plan 06) — do not rename or remove.
 */
export function Hero() {
  return (
    <section className="hero-section mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
      <p className="text-lg text-foreground">
        Hello, I&apos;m{" "}
        <Link
          href="/about"
          className="font-bold text-foreground"
          style={{ boxShadow: "inset 0 -2px 0 0 var(--accent)" }}
        >
          {siteConfig.founderName}
        </Link>{" "}
        —
      </p>
      <h1
        className="font-heading font-bold text-foreground"
        style={{
          fontSize: "clamp(2.75rem, 6.4vw, 5rem)",
          lineHeight: 1,
          letterSpacing: "-0.035em",
        }}
      >
        A powerful AI model is not the same thing as a working system.
      </h1>
      <p className="hero-lede max-w-xl text-base leading-[1.75] text-foreground">
        Most businesses adopting AI agents and automation never see the
        payoff — not because the models are weak, but because nobody embeds
        deep enough in the real workflow to make them stick.
      </p>
      <p className="hero-lede text-sm text-muted-foreground">
        95% of enterprise generative-AI pilots fail to show measurable ROI
        (MIT NANDA, 2025).
      </p>
      <p className="hero-lede max-w-xl text-base leading-[1.75] text-foreground">
        Small and medium businesses face the same brittle-workflow problem —
        worse, because they can&apos;t afford the forward-deployed
        engineering enterprises use to close it. That&apos;s the gap this
        practice exists to close.
      </p>
      <div>
        <BookCta glow />
      </div>
    </section>
  );
}
