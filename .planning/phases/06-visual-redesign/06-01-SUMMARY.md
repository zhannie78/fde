---
phase: 06-visual-redesign
plan: 01
subsystem: ui
tags: [css, tailwind-v4, next-font, design-tokens, jetbrains-mono]

# Dependency graph
requires:
  - phase: 05-fde-landing-page
    provides: Existing globals.css/layout.tsx token scaffold, siteConfig, Button/GlowButton primitives, 7 locked homepage sections
provides:
  - New 60/30/10 indigo (#3552FF on #FBFAF7) design-token palette in globals.css
  - JetBrains Mono as the single font family (layout.tsx + @theme inline)
  - 0.875rem (14px) card radius, h1-h6 font-bold fix, body line-height 1.75
  - Blanket prefers-reduced-motion CSS override (unlayered, wins cascade)
  - Reusable CSS classes: glow-box/glow-box-inner, glow-wrap-final/btn-final, avatar-wrap, credential-pill, demo-badge, case-result
  - GlowBox and ElevatedCta Server Component primitives
  - siteConfig.bookCtaLabel as the single source of truth for CTA copy
affects: [06-02, 06-03, 06-04, 06-05, 06-06, 06-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server-Component-only CSS primitives (GlowBox, ElevatedCta) — no client JS for pure-CSS hover/glow effects"
    - "siteConfig as single source of truth for shared CTA copy (bookCtaLabel), not hardcoded string literals"

key-files:
  created:
    - src/components/ui/glow-box.tsx
    - src/components/ui/elevated-cta.tsx
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - src/config/site.ts

key-decisions:
  - "Kept --muted and chart/sidebar oklch tokens unchanged (not in the locked palette list) — only the tokens explicitly specified in the UI-SPEC Color section were replaced."
  - "Substituted var(--ink) in the skill's case-result CSS with var(--foreground), the project's equivalent near-black ink token, since --ink isn't defined in this codebase's token vocabulary."

requirements-completed: [DSGN-01, DSGN-03]

# Metrics
duration: 15min
completed: 2026-07-20
---

# Phase 6 Plan 01: Visual Foundation Summary

**Swapped the Phase 5 warm-paper/ink-navy/signal-green design tokens for the locked indigo/mono system (#3552FF on #FBFAF7, JetBrains Mono, 14px radius) and shipped the glow-box/elevated-CTA CSS primitives plus their React wrappers.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-07-20
- **Tasks:** 3/3 completed
- **Files modified:** 5 (2 created, 3 modified)

## Accomplishments
- `globals.css` and `layout.tsx` now carry the full new 60/30/10 palette, 14px radius, and single JetBrains Mono font voice — replacing Fraunces + IBM Plex Sans entirely
- Fixed the `font-semibold` (600) heading bug: JetBrains Mono only ships 400/700, so `h1`-`h6` now use `font-bold` with `-0.02em` letter-spacing
- Added a blanket `prefers-reduced-motion: reduce` CSS override as the final, unlayered block in `globals.css` so it always wins the cascade
- Ported every locked sketch CSS pattern (glow-box hover-backlight blob, elevated final-CTA static dual-glow + shine-sweep, avatar framing, credential pill, demo badge, case-result) verbatim, resolving all `var(--space-N)`/`var(--text-N)` references to concrete values
- Created `GlowBox` and `ElevatedCta` as pure Server Components (zero client JS) ready for Wave 2 section restyles
- Added `siteConfig.bookCtaLabel` as the single locked-copy source ("Book a Free Call Now") that `ElevatedCta` reads from, so it can never drift from the Wave 2 `BookCta` rename

## Task Commits

Each task was committed atomically:

1. **Task 1: Swap palette, radius, fonts, base weight, and reduced-motion override** - `cefad97` (feat)
2. **Task 2: Append reusable sketch CSS classes to globals.css** - `0936607` (feat)
3. **Task 3: Create GlowBox and ElevatedCta React primitives** - `6d1d308` (feat)

_No TDD tasks in this plan — pure CSS/token/Server-Component work._

## Files Created/Modified
- `src/app/globals.css` - New 60/30/10 palette, JetBrains Mono font vars, 0.875rem radius, reduced-motion override, and every reusable sketch CSS class (glow-box, elevated final-CTA, avatar, credential pill, demo badge, case-result)
- `src/app/layout.tsx` - Swapped Fraunces + IBM Plex Sans for a single JetBrains Mono `next/font/google` import
- `src/config/site.ts` - Added `bookCtaLabel: "Book a Free Call Now"` as the shared CTA-copy source of truth
- `src/components/ui/glow-box.tsx` - New `GlowBox` Server Component (pure-CSS two-layer hover-backlight wrapper)
- `src/components/ui/elevated-cta.tsx` - New `ElevatedCta` Server Component (pure-CSS static dual-glow + shine-sweep final CTA button)

## Decisions Made
- Left `--muted`, `--chart-*`, and `--sidebar-*` oklch tokens untouched since the UI-SPEC Color section and plan's task action didn't list them for replacement — only the explicitly enumerated palette/token values were swapped, avoiding unscoped drift into shadcn internals not touched by this phase.
- Substituted the skill CSS's `var(--ink)` reference (in `.case-result p`) with this codebase's equivalent `var(--foreground)` token, since `--ink` isn't part of this project's custom-property vocabulary — same near-black `#0C0C0D` value, just the project's existing name for it.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `globals.css`/`layout.tsx` token foundation, `GlowBox`, and `ElevatedCta` are ready for Wave 2's section-by-section restyles (Hero, TheFix, Outcomes, RoiCalculator, Offer, ProcessTransparency, FinalCta, SiteHeader/Footer/MobileNav/StickyCtaBar, and the new About page).
- `siteConfig.bookCtaLabel` is in place for Wave 2's `book-cta.tsx` rename (06-04) to read from, guaranteeing the nav CTA and final CTA labels never drift apart.
- No blockers carried forward — `npx tsc --noEmit` passes cleanly and all plan verification gates passed on first attempt.

---
*Phase: 06-visual-redesign*
*Completed: 2026-07-20*

## Self-Check: PASSED

All created/modified files (`src/app/globals.css`, `src/app/layout.tsx`, `src/components/ui/glow-box.tsx`, `src/components/ui/elevated-cta.tsx`, `src/config/site.ts`) and all three task commits (`cefad97`, `0936607`, `6d1d308`) verified present.
