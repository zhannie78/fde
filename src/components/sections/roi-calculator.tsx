"use client";

import { useState } from "react";

// Conservative — excludes ~2 weeks holiday/slow periods, reinforcing the
// worst-case/conservative framing requirement (LAND-05) inside the
// calculator's own output, not just the worst-case line.
const WEEKS_PER_YEAR = 50;

/**
 * "RoiCalculator" (PROOF-02/PROOF-03): an isolated `"use client"` island —
 * two numeric inputs, plain-arithmetic derivation, zero network calls, zero
 * persistence. Keeps the same small-client-boundary discipline as the
 * site's other Client Components (e.g. ContactForm, BookingFlow).
 *
 * Embedded directly inside TheFix's section (per user decision 2026-07-21 —
 * replaces the stat-row boxes there), not its own top-level section, so no
 * outer `<section>`/padding/CTA here — `#calculator` is a plain anchor
 * target and TheFix (a Server Component) renders this as a child.
 *
 * `roi-calculator-section` is the stable GSAP selector hook the
 * scroll-story provider (plan 06) uses for a one-shot container fade/scale-in
 * — no logic changes, no count-up tween on the reactive result numerals
 * (those are keystroke-driven, a tween would fight React state).
 */
export function RoiCalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [hourlyCost, setHourlyCost] = useState(35);

  const annualHours = hoursPerWeek * WEEKS_PER_YEAR;
  const annualDollars = annualHours * hourlyCost;

  return (
    <div id="calculator" className="roi-calculator-section calculator-box mt-12">
      <p className="section-label">See it for yourself</p>
      <h2 className="mt-2 font-heading text-2xl leading-[1.2] font-bold text-foreground sm:text-3xl">
        What&apos;s manual work actually costing you?
      </h2>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-8">
        <div>
          <label
            htmlFor="hours-per-week"
            className="text-sm font-bold tracking-[0.02em] text-foreground uppercase"
          >
            Hours/week lost to manual work
          </label>
          <input
            id="hours-per-week"
            type="number"
            min={0}
            value={hoursPerWeek}
            onChange={(e) =>
              setHoursPerWeek(Math.max(0, Number(e.target.value) || 0))
            }
            className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-4 text-base text-foreground"
          />
        </div>
        <div>
          <label
            htmlFor="hourly-cost"
            className="text-sm font-bold tracking-[0.02em] text-foreground uppercase"
          >
            Your team&apos;s hourly cost
          </label>
          <input
            id="hourly-cost"
            type="number"
            min={0}
            value={hourlyCost}
            onChange={(e) =>
              setHourlyCost(Math.max(0, Number(e.target.value) || 0))
            }
            className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-4 text-base text-foreground"
          />
        </div>
      </div>

      <div className="mt-8">
        {hoursPerWeek === 0 ? (
          <div>
            <p className="font-heading text-xl leading-[1.2] font-bold text-foreground">
              See what you&apos;re leaving on the table
            </p>
            <p className="mt-2 max-w-xl text-base leading-[1.75] text-foreground">
              Enter your team&apos;s hours and hourly cost above — we&apos;ll
              show you the time and money a forward-deployed engineer could
              recover.
            </p>
          </div>
        ) : (
          <p className="max-w-xl text-base leading-[1.75] text-foreground">
            That&apos;s{" "}
            <strong className="text-primary">
              {annualHours.toLocaleString()} hours/year
            </strong>{" "}
            back — roughly{" "}
            <strong className="text-primary">
              ${annualDollars.toLocaleString()}
            </strong>{" "}
            in recovered time, even before counting the efficiency gains
            from work that no longer needs a person at all.
          </p>
        )}
      </div>
    </div>
  );
}
