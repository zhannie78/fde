---
phase: 01-marketing-foundation
plan: 04
subsystem: ui
tags: [nextjs, react, tailwind, homepage, design-showcase]

# Dependency graph
requires:
  - phase: 01-marketing-foundation (plan 01)
    provides: "siteConfig module, UI-SPEC design tokens, shadcn primitives (card, skeleton), Fraunces/IBM Plex Sans fonts"
  - phase: 01-marketing-foundation (plan 02)
    provides: "Root layout shell (SiteHeader/SiteFooter/StickyCtaBar), reusable <BookCta />"
provides:
  - "The homepage (/) composed of six D-09-ordered section components"
  - "Hero + demo-placeholder as the explicit SITE-06 visual focal point, with the Phase 2 live-demo slot reserved verbatim"
  - "Asymmetric (non-grid) Outcomes section pattern for future ROI-stat presentation"
  - "src/components/sections/ directory as the home for reusable homepage-section components"
affects: [01-05, 01-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Homepage sections live as standalone Server Components in src/components/sections/, composed by src/app/page.tsx in explicit D-09 order — no page-level markup beyond imports and ordering"
    - "Asymmetric stat layout: a 7/5 (or similar unequal) column split with one lead stat at larger scale, rather than a uniform N-card grid — established here for Outcomes, reusable anywhere ROI stats are needed"
    - "Dark ink-navy band pattern (bg-secondary/text-secondary-foreground) reused from the layout shell for the EngagementFlow and FinalCta sections, keeping only two surface treatments (paper page background, ink-navy bands) sitewide"

key-files:
  created:
    - src/components/sections/hero.tsx
    - src/components/sections/demo-placeholder.tsx
    - src/components/sections/outcomes.tsx
    - src/components/sections/engagement-flow.tsx
    - src/components/sections/verticals-teaser.tsx
    - src/components/sections/founder-strip.tsx
    - src/components/sections/final-cta.tsx
  modified:
    - src/app/page.tsx

key-decisions:
  - "Hero's Display headline uses an inline style={{ fontSize: 'clamp(32px, 8vw, 44px)' }} rather than a Tailwind arbitrary-value class, since Tailwind's arbitrary-value syntax cannot cleanly express a three-argument clamp() with mixed units — this keeps the exact UI-SPEC clamp function verifiable by grep and avoids fighting the utility-class syntax for a one-off value"
  - "Outcomes' lead stat uses text-3xl/sm:text-4xl (30px/36px) — deliberately kept below the 44px Display size reserved exclusively for the hero headline, satisfying the 'nothing else competes at Display size' focal-point constraint while still visually leading its column"
  - "FounderStrip's bracketed placeholders ([client organizations — sector TBD], [{siteConfig.region}]) wrap around the existing siteConfig.region NEEDS-FOUNDER placeholder rather than inventing new bracket text, keeping D-13's 'no invented biography facts' constraint intact end-to-end"

patterns-established:
  - "Section-per-file homepage composition: src/app/page.tsx is a pure composition root (imports + ordering only), each section owns its own copy/layout/data — future phases (vertical pages, services page) can follow the same file-per-section pattern"
  - "Asymmetric ROI-stat presentation (lead stat + secondary stack) as the house style for any future 'here are N outcomes/benefits' content, replacing the generic uniform-card-grid default"

requirements-completed: [SITE-06]

# Metrics
duration: 8min
completed: 2026-07-19
---

# Phase 1 Plan 4: Homepage (SITE-06 Design Showcase) Summary

**Complete homepage composed of seven Server Components (hero, demo-placeholder, outcomes, engagement-flow, verticals-teaser, founder-strip, final-cta), rendering all six D-09 sections in order with the hero + demo-placeholder pair as the sole Display-scale focal point.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-07-19T18:03:00Z
- **Completed:** 2026-07-19T18:11:25Z
- **Tasks:** 2 completed
- **Files modified:** 8 (7 created, 1 modified)

## Accomplishments
- Hero section renders the exact `clamp(32px, 8vw, 44px)` Display headline with ROI-first, zero-AI-jargon copy and a primary `<BookCta />`, paired with the demo-placeholder as the homepage's single visual focal point
- Demo-placeholder card carries the VERBATIM UI-SPEC empty-state heading ("The live demo lands here next") and body copy, shaped to accept the Phase 2 live missed-call demo with no layout change
- Outcomes section renders the three ROI stats in an asymmetric 7/5-column layout (lead stat + secondary stack) — explicitly not a uniform 3-card grid, satisfying the SITE-06 anti-pattern gate
- EngagementFlow renders the audit → project → retainer sequence as a numbered flow (not a card grid) on the ink-navy dark band, linking to `/services`
- VerticalsTeaser presents the four target verticals as plain pain-point copy with zero links to vertical-specific routes (teaser only, per D-09/Phase 4 boundary)
- FounderStrip renders the D-07 placeholder photo, `siteConfig.founderName`, and a bracketed-placeholder FDE story linking to `/about`, keeping D-13's "no invented biography" constraint intact
- FinalCta closes the page with a repeated `<BookCta />` on a matching ink-navy band
- `src/app/page.tsx` composes all six sections in exact D-09 order; `npx next build` exits 0 after both tasks

## Task Commits

Each task was committed atomically:

1. **Task 1: Hero (focal point) + demo-placeholder empty state + outcomes section** - `19d13a4` (feat)
2. **Task 2: Engagement band + verticals teaser + founder strip + final CTA, composed into the home route** - `c3b3aae` (feat)

**Plan metadata:** (final commit follows this SUMMARY)

## Files Created/Modified
- `src/components/sections/hero.tsx` - Display headline (clamp 32/8vw/44px), ROI-first sub-copy, `<BookCta />`, demo-placeholder slot; the SITE-06 focal point
- `src/components/sections/demo-placeholder.tsx` - Empty-state card with verbatim UI-SPEC copy and a `skeleton`-based shimmer treatment, reserved for the Phase 2 live demo
- `src/components/sections/outcomes.tsx` - Three ROI outcomes (time saved, profit recovered, expenses cut) in an asymmetric 7/5 layout
- `src/components/sections/engagement-flow.tsx` - Numbered audit → project → retainer sequence on the ink-navy band, linking to `/services`
- `src/components/sections/verticals-teaser.tsx` - Four target verticals as plain pain-point copy, no vertical-page links
- `src/components/sections/founder-strip.tsx` - Founder photo + siteConfig-sourced name + bracketed-placeholder FDE story, linking to `/about`
- `src/components/sections/final-cta.tsx` - Closing CTA band reusing `<BookCta />`
- `src/app/page.tsx` - Replaced the `create-next-app` scaffold placeholder with the full D-09-ordered homepage composition and real home-page metadata

## Decisions Made
- Used an inline `style={{ fontSize: "clamp(32px, 8vw, 44px)" }}` on the hero `<h1>` instead of a Tailwind arbitrary-value utility, since the plan's grep-based verification checks for the literal `clamp(32px, 8vw, 44px)` string and Tailwind's arbitrary-value class syntax doesn't cleanly express a mixed-unit three-argument `clamp()`
- Kept the Outcomes lead-stat typography at `text-3xl`/`sm:text-4xl` (30px/36px), well under the 44px Display size, so the hero remains the page's only Display-scale element per the focal-point constraint
- Wrapped FounderStrip's bracketed placeholders around the existing `siteConfig.region` NEEDS-FOUNDER value rather than introducing new placeholder text, so there is exactly one place (`src/config/site.ts`) to resolve before launch

## Deviations from Plan

None - plan executed exactly as written. Both tasks' automated verification commands (build + grep checks) passed on the first attempt; no Rule 1-4 triggers encountered.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. `src/components/sections/founder-strip.tsx` and `src/config/site.ts` still carry the pre-existing NEEDS-FOUNDER placeholders (founder region, real photo) tracked as launch-checklist items since Plan 01; this plan did not introduce any new unresolved placeholders.

## Known Stubs
- `src/components/sections/demo-placeholder.tsx` intentionally renders an empty-state card instead of a live demo — this is the plan's explicit deliverable (the Phase 2 demo slot), not an unintentional stub. It will be resolved when Phase 2 builds the missed-call-recovery demo and swaps it into this exact component.
- `src/components/sections/engagement-flow.tsx` links to `/services`, which does not exist yet (ships in a later Phase 1 plan) — consistent with the layout shell's existing pattern of linking to not-yet-built routes (see 01-02-SUMMARY.md), not a new stub introduced by this plan.
- `src/components/sections/founder-strip.tsx` links to `/about`, which does not exist yet for the same reason as above.

## Next Phase Readiness
- The homepage is fully composed and buildable; SITE-06's "would a design-savvy visitor believe a human made this" gate is implemented per the UI-SPEC (asymmetric outcomes, numbered engagement flow, no icon grids, no purple gradients, one Display instance) — final human-review confirmation is deferred to the Plan 06 launch checkpoint as scoped by this plan
- `/services` and `/about` routes are linked from the homepage but not yet built (expected — later plans in this phase); they will 404 until those plans land, matching the pattern already established by the layout shell (01-02)
- `src/components/sections/` is now established as the pattern for all future homepage-style section composition (reusable in Phase 4 vertical pages if a similar section-per-file approach is desired)
- No blockers — `npx next build` exits 0, all Task 1/Task 2 acceptance criteria verified directly against file contents

## Self-Check: PASSED

All claimed files verified present (src/components/sections/hero.tsx, demo-placeholder.tsx, outcomes.tsx, engagement-flow.tsx, verticals-teaser.tsx, founder-strip.tsx, final-cta.tsx, src/app/page.tsx modified, this SUMMARY.md). Both claimed commit hashes (19d13a4, c3b3aae) verified present in git log.

---
*Phase: 01-marketing-foundation*
*Completed: 2026-07-19*
