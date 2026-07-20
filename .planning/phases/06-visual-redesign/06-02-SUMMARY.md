---
phase: 06-visual-redesign
plan: 02
subsystem: ui
tags: [nextjs, tailwind-v4, gsap-hooks, design-tokens, jetbrains-mono]

# Dependency graph
requires:
  - phase: 06-visual-redesign
    provides: 06-01's 60/30/10 indigo palette, JetBrains Mono, GlowBox/ElevatedCta Server Component primitives, siteConfig.bookCtaLabel
provides:
  - Hero, TheFix, Outcomes, RoiCalculator restyled onto the mono/indigo/paper system (weights 400/700 only)
  - DSGN-05 "Hello, I'm Annie —" anonymity-reversal hero link to /about
  - Stable GSAP selector hooks for the plan-06 scroll-story provider: hero-section/hero-lede, thefix-section/data-thefix-card, outcomes-section/data-outcome-card/stat-numeral/data-countup, roi-calculator-section
affects: [06-03, 06-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "GSAP selector hooks as plain className/data-* attributes added directly on section JSX, kept distinct from existing nav-anchor ids (#fix/#outcomes/#calculator) — sections stay Server Components, no client JS added by this plan"
    - "Accent-underline inline emphasis via inline style (box-shadow: inset 0 -2px 0 0 var(--accent)) rather than a flat accent recolor, per UI-SPEC inline-emphasis rule"

key-files:
  created: []
  modified:
    - src/components/sections/hero.tsx
    - src/components/sections/the-fix.tsx
    - src/components/sections/outcomes.tsx
    - src/components/sections/roi-calculator.tsx

key-decisions:
  - "Wrapped TheFix's two explainer paragraphs in GlowBox with an internal p-8 padding div (GlowBoxProps' className passthrough applies to the outer .glow-box wrapper, not .glow-box-inner, so padding needed its own inner div)."
  - "Only the Outcomes lead stat (15+ hrs/week) got data-countup/data-countup-to per the plan's explicit scope — Efficiency and Profit stats keep stat-numeral only (one-shot fade, no count-up), matching their non-integer/abbreviated values."
  - "Confirmed existing rounded-lg utility already resolves to the new 14px radius (--radius-lg maps to --radius in the @theme inline block from 06-01), so RoiCalculator's input radius needed no class change."

requirements-completed: [DSGN-01, DSGN-02, DSGN-05]

# Metrics
duration: 10min
completed: 2026-07-20
---

# Phase 6 Plan 02: Upper-Half Section Restyle Summary

**Restyled Hero/TheFix/Outcomes/RoiCalculator onto the indigo/mono system, added the DSGN-05 "Hello, I'm Annie —" hero link to /about, and wired every stable GSAP selector hook (hero-section/hero-lede, thefix-section/data-thefix-card, outcomes-section/data-outcome-card/stat-numeral/data-countup, roi-calculator-section) that plan 06's scroll-story provider will target.**

## Performance

- **Duration:** ~10 min
- **Completed:** 2026-07-20
- **Tasks:** 2/2 completed
- **Files modified:** 4

## Accomplishments
- Hero now carries Display-scale H1 (`clamp(2.75rem, 6.4vw, 5rem)`, weight 700, `-0.035em` tracking), the `hero-section`/`hero-lede` GSAP hooks, and the anonymity-reversal "Hello, I'm Annie —" link (imports `siteConfig.founderName`, never hardcodes the string) styled with the accent-underline idiom instead of a flat accent recolor
- TheFix's explainer content moved into two `GlowBox` cards (`data-thefix-card` hooks), plus a `data-thefix-card` wrapper around the eyebrow+heading block so all three participate in the staggered reveal
- Outcomes gained `outcomes-section`/`data-outcome-card`/`stat-numeral` hooks on every stat, with the lead "15+ hrs/week" numeral additionally tagged `data-countup`/`data-countup-to="15"` for the 0→15 count-up tween; asymmetric 7/5 grid and the "Even in the worst case, you come out ahead." line preserved unchanged
- RoiCalculator gained the `roi-calculator-section` container hook with zero logic changes — `"use client"`, `useState`, `WEEKS_PER_YEAR = 50` arithmetic, and both empty/result copy strings preserved verbatim
- Completed the codebase-wide `font-semibold` → `font-bold` and `leading-[1.6]` → `leading-[1.75]` sweep across all four files (JetBrains Mono ships 400/700 only)

## Task Commits

Each task was committed atomically:

1. **Task 1: Restyle Hero + TheFix, add Annie/about link and hooks** - `03dc93a` (feat)
2. **Task 2: Restyle Outcomes + RoiCalculator, add count-up and container hooks** - `551a16a` (feat)

_No TDD tasks in this plan — pure JSX/className restyle work, no new behavior/logic._

## Files Created/Modified
- `src/components/sections/hero.tsx` - Display-type H1, Annie/about link, hero-section/hero-lede hooks
- `src/components/sections/the-fix.tsx` - GlowBox card language, thefix-section/data-thefix-card hooks
- `src/components/sections/outcomes.tsx` - outcomes-section/data-outcome-card/stat-numeral/data-countup hooks
- `src/components/sections/roi-calculator.tsx` - roi-calculator-section hook, logic/copy unchanged

## Decisions Made
- GlowBox's `className` prop passes through to the outer `.glow-box` wrapper, not `.glow-box-inner` (confirmed by reading `glow-box.tsx`) — added an internal `p-8` div inside each GlowBox in TheFix so the 32px card padding from the UI-SPEC spacing scale actually applies to the visible card face.
- Limited `data-countup`/`data-countup-to` to the Outcomes lead stat only, per the plan's explicit interface contract ("when the stat begins with a whole integer") — Efficiency ("Workflows that run themselves") and Profit ("$4k–$12k/mo") have no clean leading integer and keep `stat-numeral` only for a one-shot fade.
- Verified `rounded-lg` on RoiCalculator's inputs already resolves to the new 14px radius via 06-01's `--radius-lg: var(--radius)` mapping — no class change needed there beyond the font-weight/line-height sweep.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All four upper-half sections now render in the new mono/indigo/paper system with the exact GSAP selector-hook contract plan 06 (scroll-story-provider) needs: `.hero-section`/`.hero-lede`, `.thefix-section`/`[data-thefix-card]`, `.outcomes-section`/`[data-outcome-card]`/`.stat-numeral`/`[data-countup]`, `.roi-calculator-section`.
- `/about` route referenced by the Hero link does not exist yet — it lands in plan 05 (same wave per the plan's own verification note); until then the link 404s in dev, which is expected and not a blocker for this plan's scope.
- No blockers carried forward — `npx tsc --noEmit` passes cleanly and both grep verification gates passed on first attempt.

---
*Phase: 06-visual-redesign*
*Completed: 2026-07-20*

## Self-Check: PASSED

All modified files (`src/components/sections/hero.tsx`, `src/components/sections/the-fix.tsx`, `src/components/sections/outcomes.tsx`, `src/components/sections/roi-calculator.tsx`) and both task commits (`03dc93a`, `551a16a`) verified present.
