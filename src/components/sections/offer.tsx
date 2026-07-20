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
    title: "One-Time Setup",
    price: "Under $10k",
    body: "Most engagements: a one-time setup, scoped during your free audit, that builds the specific fix your business needs and gets it running.",
  },
  {
    number: "03",
    title: "Monthly Retainer",
    price: "Under $2k/mo",
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
      <ol className="flex flex-col gap-12 md:grid md:grid-cols-[1.6fr_1fr_1fr] md:items-start md:gap-8">
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
