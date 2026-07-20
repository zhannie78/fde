/**
 * TheFix — the "fix" half of the 5-part message hierarchy (LAND-01):
 * forward-deployed engineering explained in plain terms. Structural analog:
 * outcomes.tsx's asymmetric static-explainer shape and accent eyebrow-label
 * idiom. No icon grid — the codebase's established anti-pattern gate favors
 * numbered text/plain copy over icon grids for explainer sections.
 */
export function TheFix() {
  return (
    <section
      id="fix"
      className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <p className="text-sm font-semibold tracking-[0.02em] text-primary uppercase">
        The Fix
      </p>
      <p className="mt-2 font-heading text-2xl leading-[1.2] font-semibold text-foreground sm:text-[1.75rem]">
        A forward-deployed engineer, embedded in how your business actually
        runs.
      </p>
      <p className="mt-4 max-w-xl text-base leading-[1.6] text-foreground">
        Forward-deployed engineering means the person building your AI
        system doesn&apos;t work from a spec handed off at a distance — they
        embed directly in your real workflows, learn where the friction
        actually lives, and build the automation and AI agents to fit it.
        No off-the-shelf tool bolted on and hoped for.
      </p>
      <p className="mt-4 max-w-xl text-base leading-[1.6] text-foreground">
        And the engagement doesn&apos;t end at handoff. Your engineer owns
        the system end-to-end — still on the hook when something breaks,
        still tuning it as your business changes. That white-glove ownership
        is what turns an AI pilot that stalls into one that actually ships.
      </p>
    </section>
  );
}
