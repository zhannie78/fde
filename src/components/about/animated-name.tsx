"use client";

import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

/**
 * "Hello, I'm [name]" — types `name` out letter-by-letter on mount (page-load
 * polish, not scroll-triggered — this sits above the fold), then loops:
 * holds, erases, holds, retypes, forever (yoyo + repeat: -1). Same GSAP
 * TextPlugin + gsap.matchMedia() reduced-motion gate as the homepage's
 * scroll-story provider (DSGN-03): under `prefers-reduced-motion: reduce`
 * this creates zero tweens and the SSR-rendered `name` text stays static.
 * Isolated `"use client"` island, same shape as Avatar in this same folder.
 */
export function AnimatedName({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    gsap.registerPlugin(TextPlugin);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!ref.current) return;
      gsap.fromTo(
        ref.current,
        { text: "" },
        {
          text: name,
          duration: 0.9,
          delay: 0.3,
          ease: "none",
          repeat: -1,
          yoyo: true,
          repeatDelay: 1.2,
        }
      );
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      // Intentionally empty — zero tweens, static name stays as rendered.
    });
  });

  return (
    <>
      <span ref={ref}>{name}</span>
      <span className="typewriter-cursor" aria-hidden="true" />
    </>
  );
}
