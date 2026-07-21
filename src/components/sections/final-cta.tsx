import { ElevatedCta } from "@/components/ui/elevated-cta";

/**
 * Closing CTA band (D-09 #5) — the last conversion opportunity on the
 * homepage before the footer. Renders on a light accent-soft inset panel
 * (UI-SPEC FinalCta background exception) using the elevated static-glow
 * CTA button — the SAME treatment reused verbatim on the About page.
 */
export function FinalCta() {
  return (
    <section
      id="cta"
      className="finalcta-section mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <div
        className="finalcta-panel flex flex-col items-center gap-6 bg-[var(--accent-soft)] px-6 py-12 text-center text-foreground sm:px-12"
        style={{ borderRadius: "20px" }}
      >
        <h2 className="font-heading text-2xl leading-[1.75] font-bold sm:text-[1.75rem]">
          Ready to close your AI gap?
        </h2>
        <p className="max-w-md text-base leading-[1.75] text-foreground/90">
          Book a free audit. No commitment, no cost.
        </p>
        <ElevatedCta />
      </div>
    </section>
  );
}
