const outcomes = [
  {
    label: "Time saved",
    stat: "15+ hrs/week",
    body: "Missed calls answered instantly, follow-ups sent automatically, and busywork handled before it piles up on your desk.",
  },
  {
    label: "Profit recovered",
    stat: "$4k–$12k/mo",
    body: "Every inquiry that used to go cold gets a same-minute response — turning leads you were already paying to generate into booked jobs.",
  },
  {
    label: "Expenses cut",
    stat: "No new hires",
    body: "The work gets done without adding another salary, another desk, or another person to manage.",
  },
] as const;

/**
 * "Outcomes" (D-09 #1): the three ROI outcomes rendered ASYMMETRICALLY — an
 * explicit SITE-06 anti-pattern gate against a uniform 3-card grid. Time
 * Saved leads with the most visual weight; the other two sit as a secondary
 * stacked pair, differentiated by scale rather than icons.
 */
export function Outcomes() {
  const [lead, ...rest] = outcomes;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
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
    </section>
  );
}
