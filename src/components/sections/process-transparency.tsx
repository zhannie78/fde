const steps = [
  {
    number: "01",
    title: "Free Audit",
    body: "A focused look at how your business actually runs today — where manual work is costing you time and where automation could recover it. No cost, no obligation. You get a personalized findings report, reviewed by a real person, before it ever reaches you.",
  },
  {
    number: "02",
    title: "Build & Deploy",
    body: "We build the specific fix your audit uncovered — a fixed-scope, fixed-price project sized to prove real value fast, not a months-long build.",
  },
  {
    number: "03",
    title: "Ongoing Retainer",
    body: "Once it's live, a monthly retainer keeps it maintained, monitored, and growing — new automations added as your business needs them.",
  },
] as const;

/**
 * "How the engagement works" (LAND-04): a numbered sequential flow — NOT a
 * uniform card grid (SITE-06 anti-pattern gate). Step 1 ("free") gets the
 * most visual width. Rendered on the ink-navy dark trust band per UI-SPEC
 * Color. Adapted from the former `engagement-flow.tsx`, merged with the
 * richer step copy from `service-sequence.tsx`. No `/services` link — that
 * route is deleted; the full detail now lives in this section.
 */
export function ProcessTransparency() {
  return (
    <section id="process" className="bg-secondary text-secondary-foreground">
      <div className="process-section mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="font-heading text-2xl leading-[1.75] font-bold text-secondary-foreground sm:text-[1.75rem]">
          How the engagement works
        </h2>
        <div
          className="process-progress-line"
          aria-hidden="true"
          style={{
            position: "relative",
            height: "2px",
            width: "100%",
            background: "var(--border)",
            overflow: "hidden",
          }}
        />
        <ol className="flex flex-col gap-10 sm:flex-row sm:gap-8">
          {steps.map((step, index) => (
            <li
              key={step.number}
              data-process-step
              className={
                index === 0
                  ? "flex flex-col gap-3 sm:w-[42%]"
                  : "flex flex-col gap-3 sm:w-[29%]"
              }
            >
              <span className="font-heading text-sm font-bold" style={{ color: "var(--lime)" }}>
                {step.number}
              </span>
              <p className="font-heading text-xl leading-[1.75] font-bold text-secondary-foreground">
                {step.title}
              </p>
              <p className="text-base leading-[1.75] text-secondary-foreground/90">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
