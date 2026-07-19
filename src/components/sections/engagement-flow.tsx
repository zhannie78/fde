import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Free audit",
    body: "A self-serve questionnaire about how your business actually runs today — no cost, no obligation.",
  },
  {
    number: "02",
    title: "Scoped project",
    body: "We build the specific fix the audit uncovered, sized to prove value fast.",
  },
  {
    number: "03",
    title: "Ongoing retainer",
    body: "Once it's working, a monthly retainer keeps it maintained and adds new automations as you grow.",
  },
] as const;

/**
 * "How the engagement works" (D-09 #2): a numbered sequential flow — NOT a
 * uniform card grid (SITE-06 anti-pattern gate). Step 1 ("free") gets the
 * most visual width. Rendered on the ink-navy dark band per UI-SPEC Color,
 * links through to /services for full detail.
 */
export function EngagementFlow() {
  return (
    <section className="bg-secondary text-secondary-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="font-heading text-2xl leading-[1.2] font-semibold text-secondary-foreground sm:text-[1.75rem]">
          How the engagement works
        </h2>
        <ol className="flex flex-col gap-10 sm:flex-row sm:gap-8">
          {steps.map((step, index) => (
            <li
              key={step.number}
              className={
                index === 0
                  ? "flex flex-col gap-3 sm:w-[42%]"
                  : "flex flex-col gap-3 sm:w-[29%]"
              }
            >
              <span className="font-heading text-sm font-semibold text-primary">
                {step.number}
              </span>
              <p className="font-heading text-xl leading-[1.2] font-semibold text-secondary-foreground">
                {step.title}
              </p>
              <p className="text-base leading-[1.6] text-secondary-foreground/90">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
        <div>
          <Link
            href="/services"
            className="text-base font-semibold text-primary underline decoration-2 underline-offset-4 hover:text-secondary-foreground"
          >
            See how the full engagement works &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
