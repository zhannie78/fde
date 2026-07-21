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
 * "Outcomes" — the three ROI stat cards, ported verbatim from the Phase 6
 * sketch (sources/001-visual-system, variant B2) as a symmetric 3-card
 * stat-row rather than Phase 5's asymmetric layout.
 *
 * `outcomes-section` on the root and `data-outcome-card` on each card are
 * stable GSAP selector hooks consumed by the scroll-story provider (plan
 * 06) — do not rename or remove. `data-countup`/`data-countup-to` drive the
 * count-up tween on the two clean-integer stats (12hrs, 3x); "$4.2k" is a
 * static value since the generic count-up regex expects a leading digit,
 * not a leading currency symbol.
 */
export function Outcomes() {
  return (
    <section
      id="outcomes"
      className="outcomes-section mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="grid gap-4 sm:grid-cols-3">
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
      <p className="mt-10 text-base leading-[1.75] font-bold text-foreground">
        Even in the worst case, you come out ahead.
      </p>
    </section>
  );
}
