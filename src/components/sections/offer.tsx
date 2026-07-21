import { GlowBox } from "@/components/ui/glow-box";

const steps = [
  {
    number: "01",
    title: "Free Audit",
    price: "$0",
    body: "Scope your workflows, find where AI actually helps.",
  },
  {
    number: "02",
    title: "Setup",
    price: "Under $5k",
    body: "Or hourly, if you prefer. Scoped during your free audit.",
  },
  {
    number: "03",
    title: "Retainer",
    price: "Under $1,000/mo",
    body: "Scoped during your free audit.",
  },
] as const;

/**
 * "Offer" (LAND-02): the free audit -> setup -> retainer pricing sequence,
 * ported verbatim from the Phase 6 sketch (sources/001-visual-system,
 * variant B2) — a single combined "01 — Free Audit" label line (not a
 * separate number + large title), followed by the price (plain ink color,
 * not accent — the sketch never colors the price), then a short desc. No
 * CTA button below the grid — the sketch doesn't have one here.
 */
export function Offer() {
  return (
    <section
      id="offer"
      className="offer-section mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <p className="section-label">The Offer</p>
      <h2 className="mt-2 font-heading text-2xl leading-[1.2] font-bold text-foreground sm:text-[1.75rem]">
        Transparent pricing. No enterprise markup.
      </h2>
      <ol className="mt-8 flex flex-col gap-4 md:grid md:grid-cols-[1.3fr_1fr_1fr] md:items-start">
        {steps.map((step) => (
          <li key={step.number} data-offer-card>
            <GlowBox className="h-full">
              <div className="flex h-full flex-col gap-3 p-6">
                <p className="text-xs font-bold tracking-[0.06em] text-muted-foreground uppercase">
                  {step.number} — {step.title}
                </p>
                <p className="font-heading text-2xl leading-none font-bold tracking-[-0.02em] text-foreground">
                  {step.price}
                </p>
                <p className="text-sm leading-[1.65] text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </GlowBox>
          </li>
        ))}
      </ol>
    </section>
  );
}
