const steps = [
  {
    number: "01",
    title: "Free Audit",
    price: "$0",
    body: "A self-serve questionnaire about how your business actually runs today — where calls get missed, where follow-ups slip, where busywork piles up. No cost, no obligation, no sales pitch. You get a personalized findings report, reviewed by a real person before it reaches you, showing exactly where time and money are leaking.",
  },
  {
    number: "02",
    title: "Fixed-Scope Project",
    price: "One-time",
    body: "We build the specific fix your audit uncovered, scoped and priced up front so there are no surprises — sized to prove real value fast, not a months-long build.",
  },
  {
    number: "03",
    title: "Monthly Retainer",
    price: "Ongoing",
    body: "Once it's working, a monthly retainer keeps it maintained and adds new automations as your business grows — like having a fractional AI engineer on call.",
  },
] as const;

/**
 * The audit → project → retainer engagement model (SITE-03), rendered as a
 * deliberate sequential/numbered flow (RESEARCH Pattern 3) — NOT a uniform
 * 3-card grid (explicit SITE-06 anti-pattern gate). Step 1 ("free") gets an
 * asymmetric wider column and the most copy; no per-step icons/emoji. The
 * accent color is reserved for the step-1 price numeral only.
 */
export function ServiceSequence() {
  return (
    <ol className="flex flex-col gap-12 md:grid md:grid-cols-[1.6fr_1fr_1fr] md:items-start md:gap-8">
      {steps.map((step, index) => (
        <li key={step.number} className="flex flex-col gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-sm font-semibold text-muted-foreground">
              {step.number}
            </span>
            <span
              className={
                index === 0
                  ? "font-heading text-lg font-semibold text-primary"
                  : "font-heading text-lg font-semibold text-foreground"
              }
            >
              {step.price}
            </span>
          </div>
          <h3
            className={
              index === 0
                ? "font-heading leading-[1.2] font-semibold text-foreground"
                : "font-heading text-xl leading-[1.2] font-semibold text-foreground"
            }
            style={index === 0 ? { fontSize: "28px" } : undefined}
          >
            {step.title}
          </h3>
          <p className="max-w-md text-base leading-[1.6] text-foreground/90">
            {step.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
