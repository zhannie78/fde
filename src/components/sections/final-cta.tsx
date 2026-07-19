import { BookCta } from "@/components/book-cta";

/**
 * Closing CTA band (D-09 #5) — the last conversion opportunity on the
 * homepage before the footer, reusing the single BookCta component.
 */
export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex flex-col items-center gap-6 rounded-xl bg-secondary px-6 py-12 text-center text-secondary-foreground sm:px-12">
        <h2 className="font-heading text-2xl leading-[1.2] font-semibold sm:text-[1.75rem]">
          Ready to see what&apos;s slipping through?
        </h2>
        <p className="max-w-md text-base leading-[1.6] text-secondary-foreground/90">
          Thirty minutes, no pitch — just a plain conversation about where
          your business is losing time and money.
        </p>
        <BookCta />
      </div>
    </section>
  );
}
