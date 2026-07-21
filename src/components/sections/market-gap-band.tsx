/**
 * "The Access Gap" — dark full-bleed band between Hero and TheFix, ported
 * verbatim from the Phase 6 sketch (sources/001-visual-system, variant B2).
 * Reuses ProcessTransparency's dark-ink-band treatment (bg-secondary /
 * text-secondary-foreground) — the only two sections on this page that use
 * the dark surface.
 */
export function MarketGapBand() {
  return (
    <section className="dark-band-glow bg-secondary text-secondary-foreground">
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="section-label on-dark">The Access Gap</p>
        <h2 className="mt-4 max-w-3xl font-heading text-3xl leading-[1.2] font-bold text-secondary-foreground sm:text-4xl">
          Enterprises pay a premium to embed AI-native engineers like this.
          Now small businesses can too.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-[1.75] text-secondary-foreground/80">
          Palantir, OpenAI, and Anthropic pioneered the forward-deployed
          engineer model for their biggest enterprise clients — AI-native
          engineers who modernize businesses for the AI era by building
          around their real-world workflows. That same caliber of
          engineering, priced for a small business, not a Fortune 500.
        </p>
      </div>
    </section>
  );
}
