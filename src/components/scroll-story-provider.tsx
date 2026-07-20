"use client";

import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * ScrollStoryProvider — the single `"use client"` wrapper housing every
 * ScrollTrigger effect for the homepage's 5-act scroll story (DSGN-02). It
 * accepts the seven server-rendered homepage sections as `children` and
 * targets them by stable selector text (className/data-*), never by ref —
 * this is what lets Hero/TheFix/Outcomes/Offer/ProcessTransparency/FinalCta
 * stay Server Components (RESEARCH.md Pattern 1). `RoiCalculator` is the one
 * pre-existing Client Component among the children; it isn't converted or
 * otherwise special-cased here beyond its own one-shot entrance (Act 3b).
 *
 * `useGSAP` runs its callback only after mount/hydration — it never executes
 * during SSR, so this component is safe without any `next/dynamic({ssr:false})`
 * wrapper (RESEARCH.md Pitfall 2). Every effect is registered inside
 * `gsap.matchMedia()`: the `no-preference` branch holds all five acts, the
 * `reduce` branch creates ZERO ScrollTrigger instances (DSGN-03) — the page
 * already ships in its settled, fully-readable state by default, so the
 * reduced-motion branch has nothing to do beyond existing.
 */
export function ScrollStoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // --- Act 1: Hero — scrub parallax on the lede paragraphs ---
        // Transform/opacity only; scrubbed to scroll position, no entrance.
        gsap.to(".hero-lede", {
          opacity: 0.3,
          y: -24,
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        // --- Act 2: TheFix — batch stagger-in for the explainer cards ---
        ScrollTrigger.batch("[data-thefix-card]", {
          start: "top 75%",
          once: true,
          onEnter: (batch) =>
            gsap.from(batch, {
              opacity: 0,
              y: 18,
              stagger: 0.12,
              duration: 0.6,
              onStart: () =>
                batch.forEach((el) => {
                  (el as HTMLElement).style.willChange = "transform, opacity";
                }),
              onComplete: () =>
                batch.forEach((el) => {
                  (el as HTMLElement).style.willChange = "auto";
                }),
            }),
        });

        // --- Act 3a: Outcomes — count-up on every [data-countup] numeral ---
        // Preserves any non-numeric suffix in the original text (e.g. a
        // trailing "+") by capturing it once before the tween starts.
        document
          .querySelectorAll<HTMLElement>("[data-countup][data-countup-to]")
          .forEach((el) => {
            const target = Number(el.dataset.countupTo);
            if (!Number.isFinite(target)) return;

            const originalText = el.textContent ?? "";
            const suffixMatch = originalText.match(/^\d+(.*)$/);
            const suffix = suffixMatch ? suffixMatch[1] : "";

            const proxy = { value: 0 };
            gsap.to(proxy, {
              value: target,
              duration: 1.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 70%",
                once: true,
              },
              onUpdate: () => {
                el.textContent = `${Math.round(proxy.value)}${suffix}`;
              },
            });
          });

        // --- Act 3b: RoiCalculator — one-shot fade/scale-in ---
        gsap.from(".roi-calculator-section", {
          opacity: 0,
          scale: 0.96,
          duration: 0.6,
          scrollTrigger: {
            trigger: ".roi-calculator-section",
            start: "top 70%",
            end: "top 55%", // approximates the Act-3a "+0.15s" offset
            once: true,
          },
        });

        // --- Act 4: Offer — asymmetric stagger (lead card vs. rest) ---
        gsap.from("[data-offer-lead]", {
          opacity: 0,
          x: -24,
          duration: 0.6,
          scrollTrigger: {
            trigger: ".offer-section",
            start: "top 75%",
            once: true,
          },
        });

        ScrollTrigger.batch("[data-offer-card]:not([data-offer-lead])", {
          start: "top 75%",
          once: true,
          onEnter: (batch) =>
            gsap.from(batch, {
              opacity: 0,
              y: 18,
              stagger: 0.12,
              duration: 0.6,
            }),
        });

        // --- Act 5a: ProcessTransparency — scrub-fill progress line ---
        gsap.fromTo(
          ".process-progress-line",
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: "left center",
            ease: "none",
            scrollTrigger: {
              trigger: ".process-section",
              start: "top 70%",
              end: "bottom 70%",
              scrub: true,
            },
          }
        );

        // --- Act 5b: FinalCta — one-shot scale-in ---
        gsap.from(".finalcta-panel", {
          opacity: 0,
          scale: 0.96,
          duration: 0.6,
          scrollTrigger: {
            trigger: ".finalcta-panel",
            start: "top 80%",
            once: true,
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // Intentionally empty: create ZERO ScrollTrigger instances. The
        // page's default (non-animated) DOM state is already the settled
        // state every effect above animates TO, so nothing further is
        // needed here (DSGN-03).
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="contents">
      {children}
    </div>
  );
}
