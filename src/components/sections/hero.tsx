import { BookCta } from "@/components/book-cta";

/**
 * Hero — the "gap" half of the 5-part message hierarchy (LAND-01). Carries
 * the only Display-size text on the page (UI-SPEC Typography: "Display is
 * reserved for the Hero H1 only... every section below is visually
 * subordinate"). Single-column: the v1 right-column demo slot is removed —
 * this phase has no reassigned use for it (the live-demo concept it held
 * was scrapped by the v2 pivot).
 */
export function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
      <h1
        className="font-heading leading-[1.1] font-semibold text-foreground"
        style={{ fontSize: "clamp(32px, 8vw, 44px)" }}
      >
        A powerful AI model is not the same thing as a working system.
      </h1>
      <p className="max-w-xl text-base leading-[1.6] text-foreground">
        Most businesses adopting AI agents and automation never see the
        payoff — not because the models are weak, but because nobody embeds
        deep enough in the real workflow to make them stick.
      </p>
      <p className="text-sm text-muted-foreground">
        95% of enterprise generative-AI pilots fail to show measurable ROI
        (MIT NANDA, 2025).
      </p>
      <p className="max-w-xl text-base leading-[1.6] text-foreground">
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
