import { BookCta } from "@/components/book-cta";
import { GlowBox } from "@/components/ui/glow-box";

const steps = [
  {
    number: "01",
    title: "Free Audit",
    price: "$0",
    body: "No cost, no commitment. A close look at how your business actually runs today — where time and money are leaking to manual work — with a personalized findings report at the end.",
  },
  {
    number: "02",
    title: "Setup",
    price: "Under $5k",
    body: "Or hourly, if you prefer. Scoped during your free audit, this builds the specific fix your business needs and gets it running.",
  },
  {
    number: "03",
    title: "Retainer",
    price: "Under $1,000/mo",
    body: "Once it's working, an ongoing retainer — also scoped during your free audit — keeps it maintained and adds new automations as your business grows.",
  },
] as const;

/**
 * "Offer" (LAND-02): the free audit -> one-time setup -> monthly retainer
 * pricing sequence, rendered as a numbered/asymmetric flow (not a uniform
 * 3-card grid — SITE-06 anti-pattern gate). Step 1 ("free") gets the widest
 * column and the accent-colored price; every price ships scope-qualified
 * and tied to the free audit (Pitfall 4) — never a bare unconditional
 * number as a standalone headline. Carries the mid-page BookCta (LAND-03).
 */
export function Offer() {
  return (
    <section
      id="offer"
      className="offer-section mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <p className="text-sm font-bold tracking-[0.02em] text-primary uppercase">
        The Offer
      </p>
      <h2 className="mt-2 font-heading text-2xl leading-[1.2] font-bold text-foreground sm:text-[1.75rem]">
        Transparent pricing. No enterprise markup.
      </h2>
      <ol className="mt-8 flex flex-col gap-12 md:grid md:grid-cols-[1.6fr_1fr_1fr] md:items-start md:gap-8">
        {steps.map((step, index) => (
          <li
            key={step.number}
            data-offer-card
            {...(index === 0 ? { "data-offer-lead": true } : {})}
          >
            <GlowBox className="h-full">
              <div className="flex h-full flex-col gap-4 p-8">
                <div className="flex items-baseline gap-3">
                  <span className="font-heading text-sm font-bold text-muted-foreground">
                    {step.number}
                  </span>
                  <span
                    className={
                      index === 0
                        ? "font-heading text-lg font-bold text-primary"
                        : "font-heading text-lg font-bold text-foreground"
                    }
                  >
                    {step.price}
                  </span>
                </div>
                <h3
                  className={
                    index === 0
                      ? "font-heading leading-[1.75] font-bold text-foreground"
                      : "font-heading text-xl leading-[1.75] font-bold text-foreground"
                  }
                  style={index === 0 ? { fontSize: "28px" } : undefined}
                >
                  {step.title}
                </h3>
                <p className="max-w-md text-base leading-[1.75] text-foreground/90">
                  {step.body}
                </p>
              </div>
            </GlowBox>
          </li>
        ))}
      </ol>
      <div className="mt-12">
        <BookCta />
      </div>
    </section>
  );
}
