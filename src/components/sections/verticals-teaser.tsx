const verticals = [
  {
    name: "Home services",
    body: "HVAC, plumbing, roofing, electrical — a missed call after hours is a job that just went to a competitor.",
  },
  {
    name: "Medical & dental practices",
    body: "Patients who can't get through often just don't call back — that's a chair sitting empty.",
  },
  {
    name: "Small & solo law firms",
    body: "A slow response to a new inquiry reads as \"too busy for me\" to a prospective client.",
  },
  {
    name: "Real estate teams",
    body: "Leads go cold fast; the agent who replies first is usually the one who gets the showing.",
  },
] as const;

/**
 * "Who this is for" (D-09 #3): the four target verticals as plain, concrete
 * pain-point copy — text treatment only, no icon grid. Teaser ONLY; no links
 * to vertical landing pages, which ship in Phase 4.
 */
export function VerticalsTeaser() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <h2 className="font-heading text-2xl leading-[1.2] font-semibold text-foreground sm:text-[1.75rem]">
        Who this is for
      </h2>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        {verticals.map((vertical) => (
          <div key={vertical.name} className="flex flex-col gap-2">
            <p className="text-base font-semibold text-foreground">
              {vertical.name}
            </p>
            <p className="text-base leading-[1.6] text-foreground/80">
              {vertical.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
