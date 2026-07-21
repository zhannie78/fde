import { GlowBox } from "@/components/ui/glow-box";

const outcomes = [
  {
    label: "Time Recovered / Week",
    stat: "12hrs",
    countupTo: "12",
  },
  {
    label: "Efficiency Gain",
    stat: "3x",
    countupTo: "3",
  },
  {
    label: "Profit Recovered / Mo",
    stat: "$4.2k",
    countupTo: null,
  },
] as const;

/**
 * TheFix — the "fix" half of the 5-part message hierarchy (LAND-01),
 * ported verbatim from the Phase 6 sketch (sources/001-visual-system,
 * variant B2): explainer copy + the TIME/EFFICIENCY/PROFIT stat row +
 * worst-case line all live in this ONE section, not split across TheFix
 * and a separate Outcomes section (Phase 5's original split).
 *
 * `thefix-section` on the root and `data-thefix-card` on the explainer
 * block are stable GSAP selector hooks consumed by the scroll-story
 * provider (plan 06) — do not rename or remove. `data-outcome-card` on
 * each stat card and `data-countup`/`data-countup-to` on the two
 * clean-integer stats (12hrs, 3x) drive the count-up tween; "$4.2k" is
 * static since the generic count-up regex expects a leading digit, not a
 * leading currency symbol.
 */
export function TheFix() {
  return (
    <section
      id="fix"
      className="thefix-section mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <div data-thefix-card>
        <p className="text-sm font-bold tracking-[0.02em] text-primary uppercase">
          The Fix
        </p>
        <p className="mt-2 font-heading text-2xl leading-[1.2] font-bold text-foreground sm:text-[1.75rem]">
          Off-the-shelf tools don&apos;t fit your workflow. Forward-deployed
          engineering does.
        </p>
        <p className="mt-4 max-w-2xl text-base leading-[1.75] text-foreground">
          I actually audit your business&apos; specific workflows first
          before building the automation and AI that actually fits — not a
          generic SaaS product bolt-on.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {outcomes.map((outcome) => (
          <GlowBox key={outcome.label} data-outcome-card>
            <div className="p-8">
              <p
                className="stat-numeral font-heading text-3xl leading-[1.2] font-bold text-foreground"
                {...(outcome.countupTo
                  ? { "data-countup": true, "data-countup-to": outcome.countupTo }
                  : {})}
              >
                {outcome.stat}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{outcome.label}</p>
            </div>
          </GlowBox>
        ))}
      </div>
      <p
        className="mt-8 max-w-xl text-base leading-[1.75] font-bold text-foreground"
        style={{ borderLeft: "2px solid var(--lime)", paddingLeft: "16px" }}
      >
        Even in the worst case, you come out ahead.
      </p>
    </section>
  );
}
