const steps = [
  {
    number: "01",
    title: "Free Audit",
    body: "I map your workflows and find the highest-leverage automation opportunities.",
  },
  {
    number: "02",
    title: "Build & Deploy",
    body: "I build the custom solution, embedded in how you already work.",
    // "Deploy" is typed out letter-by-letter (GSAP TextPlugin,
    // scroll-story-provider.tsx Act 5) once this step fades into view —
    // "Build & " stays static, only the word that follows animates.
    typewriter: true,
    typewriterWord: "Deploy",
  },
  {
    number: "03",
    title: "Retainer",
    body: "Ongoing iteration, monitoring, and support as your business changes.",
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
    <section id="process" className="dark-band-glow bg-secondary text-secondary-foreground">
      <div className="process-section relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-20">
        <div>
          <p className="section-label on-dark">How It Works</p>
          <h2 className="mt-2 font-heading text-3xl leading-[1.2] font-bold text-secondary-foreground sm:text-4xl">
            Three steps. No black box.
          </h2>
        </div>
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
                {"typewriter" in step && step.typewriter ? (
                  <>
                    {step.title.slice(0, step.title.length - step.typewriterWord.length)}
                    <span data-typewriter>{step.typewriterWord}</span>
                    <span className="typewriter-cursor on-dark" aria-hidden="true" />
                  </>
                ) : (
                  step.title
                )}
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
