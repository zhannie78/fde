import { BookCta } from "@/components/book-cta";
import { DemoPlaceholder } from "@/components/sections/demo-placeholder";

/**
 * Homepage focal point (UI-SPEC "Phase Component Inventory" — Homepage focal
 * point, explicit): the Display headline + demo-placeholder pair is THE
 * primary visual anchor of the page. Every section below is visually
 * subordinate — this is the only Display-size text and the only element
 * pairing with the demo-placeholder's accent weight.
 *
 * Headline is ROI-first, plain language, zero AI jargon (D-12) — dollars and
 * hours, not "AI"/"automation" framing.
 */
export function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:flex-row lg:items-center lg:gap-16">
      <div className="flex flex-col gap-6 lg:w-1/2">
        <h1
          className="font-heading leading-[1.1] font-semibold text-foreground"
          style={{ fontSize: "clamp(32px, 8vw, 44px)" }}
        >
          Stop losing customers to missed calls and slow follow-ups
        </h1>
        <p className="max-w-md text-base leading-[1.6] text-foreground">
          Every missed call, unanswered inquiry, or task left sitting
          overnight costs your business real hours and real dollars. We build
          simple, custom tools that catch what&apos;s slipping through — so
          you recover the time and money without hiring anyone new.
        </p>
        <div>
          <BookCta />
        </div>
      </div>
      <div className="lg:w-1/2">
        <DemoPlaceholder />
      </div>
    </section>
  );
}
