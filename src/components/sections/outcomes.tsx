const outcomes = [
  {
    label: "Time",
    stat: "15+ hrs/week",
    body: "Manual busywork — the follow-ups, the data entry, the copy-paste between tools — gets handled automatically, giving your team back hours every week to spend on the work only they can do.",
  },
  {
    label: "Efficiency",
    stat: "Workflows that run themselves",
    body: "The processes that used to depend on someone remembering to do them now run on their own — built around how your business actually operates, not a generic template.",
  },
  {
    label: "Profit",
    stat: "$4k–$12k/mo",
    body: "Money that was leaking out through missed steps, slow handoffs, and dropped follow-ups gets recovered — plus new revenue from work your team now has capacity to take on.",
  },
] as const;

/**
 * "Outcomes" (D-09 #1): the three ROI outcomes rendered ASYMMETRICALLY — an
 * explicit SITE-06 anti-pattern gate against a uniform 3-card grid. Time
 * leads with the most visual weight; Efficiency and Profit sit as a
 * secondary stacked pair, differentiated by scale rather than icons.
 */
export function Outcomes() {
  const [lead, ...rest] = outcomes;

  return (
    <section id="outcomes" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <p className="text-sm font-semibold tracking-[0.02em] text-primary uppercase">
            {lead.label}
          </p>
          <p className="mt-2 font-heading text-3xl leading-[1.2] font-semibold text-foreground sm:text-4xl">
            <span className="text-primary">{lead.stat}</span> back in your
            week
          </p>
          <p className="mt-4 max-w-xl text-base leading-[1.6] text-foreground">
            {lead.body}
          </p>
        </div>
        <div className="flex flex-col gap-8 lg:col-span-5 lg:border-l lg:border-border lg:pl-8">
          {rest.map((outcome) => (
            <div key={outcome.label}>
              <p className="text-sm font-semibold tracking-[0.02em] text-primary uppercase">
                {outcome.label}
              </p>
              <p className="mt-1 font-heading text-xl leading-[1.2] font-semibold text-foreground">
                {outcome.stat}
              </p>
              <p className="mt-2 text-base leading-[1.6] text-foreground">
                {outcome.body}
              </p>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-10 text-base leading-[1.6] font-semibold text-foreground">
        Even in the worst case, you come out ahead.
      </p>
    </section>
  );
}
