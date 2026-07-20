import { GlowBox } from "@/components/ui/glow-box";

/**
 * TheFix — the "fix" half of the 5-part message hierarchy (LAND-01):
 * forward-deployed engineering explained in plain terms. Structural analog:
 * outcomes.tsx's asymmetric static-explainer shape and accent eyebrow-label
 * idiom. No icon grid — the codebase's established anti-pattern gate favors
 * numbered text/plain copy over icon grids for explainer sections.
 *
 * `thefix-section` on the root and `data-thefix-card` on each animated
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
        <p className="text-sm font-bold tracking-[0.02em] text-primary uppercase">
          The Fix
        </p>
        <p className="mt-2 font-heading text-2xl leading-[1.2] font-bold text-foreground sm:text-[1.75rem]">
          A forward-deployed engineer, embedded in how your business actually
          runs.
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        <GlowBox data-thefix-card className="flex-1">
          <div className="p-8">
            <p className="text-base leading-[1.75] text-foreground">
              Forward-deployed engineering means the person building your AI
              system doesn&apos;t work from a spec handed off at a distance —
              they embed directly in your real workflows, learn where the
              friction actually lives, and build the automation and AI
              agents to fit it. No off-the-shelf tool bolted on and hoped
              for.
            </p>
          </div>
        </GlowBox>
        <GlowBox data-thefix-card className="flex-1">
          <div className="p-8">
            <p className="text-base leading-[1.75] text-foreground">
              And the engagement doesn&apos;t end at handoff. Your engineer
              owns the system end-to-end — still on the hook when something
              breaks, still tuning it as your business changes. That
              white-glove ownership is what turns an AI pilot that stalls
              into one that actually ships.
            </p>
          </div>
        </GlowBox>
      </div>
    </section>
  );
}
