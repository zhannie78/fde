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
    <section className="hero-section mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
      <span className="status-pill w-fit">
        <span className="ping" /> Available for new engagements
      </span>
      <p className="text-2xl font-normal text-foreground sm:text-[1.75rem]">
        Hello, I&apos;m{" "}
        <Link
          href="/about"
          className="font-normal text-foreground"
          style={{ boxShadow: "inset 0 -2px 0 0 var(--accent)" }}
        >
          {siteConfig.founderName}
        </Link>{" "}
        —
      </p>
      <h1
        className="font-heading font-extrabold text-foreground"
        style={{
          fontSize: "clamp(2.75rem, 6.4vw, 5rem)",
          lineHeight: 1,
          letterSpacing: "-0.035em",
        }}
      >
        A{" "}
        <span className="text-primary">
          <Link href="/about" className="text-inherit no-underline">
            Forward Deployed Engineer
          </Link>
        </span>{" "}
        &amp;{" "}
        <Link href="/about" className="text-inherit no-underline">
          AI Consultant
        </Link>
      </h1>
      <p className="hero-lede max-w-xl text-base leading-[1.75] text-foreground">
        95% of enterprise AI pilots fail to show measurable ROI, a failure
        rate rooted not in flawed models but in poor integration. I help
        close that gap for small businesses — workflow-first, white-glove
        implementation to{" "}
        <strong className="lede-highlight">
          <Link href="/about" className="text-inherit no-underline">
            save time
          </Link>
        </strong>{" "}
        and{" "}
        <strong className="lede-highlight">
          <Link href="/about" className="text-inherit no-underline">
            increase profit
          </Link>
        </strong>
        .
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <BookCta glow />
        <Link
          href="/#process"
          className="rounded-[8px] border border-border px-[29px] py-[14px] text-base font-semibold text-foreground transition-transform hover:-translate-y-0.5 hover:border-foreground"
        >
          See Process
        </Link>
      </div>
    </section>
  );
}
