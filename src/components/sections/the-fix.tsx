import { RoiCalculator } from "@/components/sections/roi-calculator";

/**
 * TheFix — the "fix" half of the 5-part message hierarchy (LAND-01),
 * ported from the Phase 6 sketch (sources/001-visual-system, variant B2):
 * explainer copy + worst-case line live in this section. Per user decision
 * 2026-07-21, the stat-row boxes (12hrs/3x/$4.2k) were replaced with the
 * real RoiCalculator (a Client Component rendered as a child of this
 * Server Component — no "use client" needed here).
 *
 * `thefix-section` on the root and `data-thefix-card` on the explainer
 * block are stable GSAP selector hooks consumed by the scroll-story
 * provider (plan 06) — do not rename or remove.
 */
export function TheFix() {
  return (
    <section
      id="fix"
      className="thefix-section mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <div data-thefix-card>
        <p className="section-label">The Fix</p>
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
      <RoiCalculator />
      <p
        className="mt-8 max-w-xl text-base leading-[1.75] font-bold text-foreground"
        style={{ borderLeft: "2px solid var(--lime)", paddingLeft: "16px" }}
      >
        Even in the worst case, you come out ahead.
      </p>
    </section>
  );
}
