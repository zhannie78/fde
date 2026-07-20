---
name: sketch-findings-fde
description: Validated design decisions, CSS patterns, and visual direction from sketch experiments. Auto-loaded during UI implementation on fde.
---

<context>
## Project: fde (AI Deployed)

Complete visual system replacement for the AI Deployed landing page. Moving away from the warm-neutral editorial palette (paper/ink-navy/signal-green, Fraunces + IBM Plex Sans) toward a modern, high-impact **developer-portfolio** aesthetic for a solo, named AI-native forward-deployed engineer/consultant (Annie). Core requirements: monospace type as the primary voice, pixelated/retro-tech visual texture (refined toward award-portfolio restraint, not raw brutalism), and a personal, first-person hero replacing the prior anonymous-FDE framing. Content stays the same (gap → fix → outcomes → offer → CTA, ROI calculator, pricing) — this was a visual-system swap, not a copy rewrite, though several copy refinements happened alongside it.

Reference points: Wix Studio "Transparent Video" inspiration page (bold high-contrast type, generous negative space, accent punctuation) — translated into a mono/pixel developer register, not copied literally.

Sketch sessions wrapped: 2026-07-20
</context>

<design_direction>
## Overall Direction

**Winning direction: "B2 — Polished & Refined."** Pixel-grid brutalist bones (blocky mono type, confident structure) refined toward award-winning-portfolio restraint: ONE precise accent color (indigo `#3552ff`), light warm-neutral background (`#fbfaf7`), consistent soft-hover-lift card language (not hard brutalist offset shadows), generous section whitespace, and deliberate micro-interactions (scroll-reveal, magnetic buttons, hover-triggered morphing backlight glow, elevated final-CTA treatment).

Two other full directions were explored and rejected: "Terminal // CRT" (too raw/hacker) and "Dark Neon IDE" (not chosen). See references/visual-system-and-motion.md § What to Avoid for why.

The site now introduces a named personal brand ("Hello, I'm Annie —") linking to a full bio/credentials/portfolio page — this reverses an earlier "anonymous FDE, no name/photo" decision. Explicit, confirmed user override.
</design_direction>

<findings_index>
## Design Areas

| Area | Reference | Key Decision |
|------|-----------|--------------|
| Visual System & Motion (Homepage) | references/visual-system-and-motion.md | Mono type, single-accent (#3552ff) discipline, consistent soft-hover card language, morphing backlight glow, static elevated final-CTA, endless-marquee fix |
| Bio & Portfolio Page | references/bio-portfolio-page.md | Photo framing, credential pills (Georgia Tech + Palantir Foundry, no vertical bubbles), honest live-vs-preview demos, illustrative-composite portfolio cards |

## Theme

The winning theme file is at `sources/themes/default.css` (shared base tokens — font stack, type scale, spacing scale, radii; each sketch's actual color palette is defined locally per-variant in its own `<style>` block, see reference files for the winning B2 values).

## Source Files

Original sketch HTML files are preserved in `sources/` for complete reference — `sources/001-visual-system/index.html` contains ALL explored variants (A/B/B2/C) with B2 marked as winner and default-active; `sources/002-about-page/index.html` is the bio/portfolio page.
</findings_index>

<metadata>
## Processed Sketches

- 001-visual-system
- 002-about-page
</metadata>
