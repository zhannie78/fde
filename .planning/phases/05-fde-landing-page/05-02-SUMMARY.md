---
phase: 05-fde-landing-page
plan: 02
subsystem: ui
tags: [nextjs, react, tailwind, server-components, landing-page]

# Dependency graph
requires:
  - phase: 05-fde-landing-page (plan 01)
    provides: Design tokens and section-layout patterns (outcomes.tsx asymmetric grid, service-sequence.tsx numbered flow) this plan reused verbatim
provides:
  - Outcomes section rewritten to TIME/EFFICIENCY/PROFIT vocabulary with an explicit worst-case/conservative line (LAND-05) and id="outcomes" anchor
  - New Offer section (src/components/sections/offer.tsx) with scope-qualified free-audit -> under-$10k setup -> under-$2k/mo retainer pricing sequence (LAND-02) and a mid-page BookCta (LAND-03)
affects: [05-fde-landing-page plan 03+ (page.tsx integration wires Outcomes + Offer into the section order)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Numbered/asymmetric pricing sequence (md:grid-cols-[1.6fr_1fr_1fr]) copied from service-sequence.tsx for Offer — step 1 widest column + accent price, anti-pattern gate against uniform 3-card grids"
    - "Every published price ships paired with scope-qualifying language tied to the free audit ('scoped during your free audit') rather than as a bare unconditional headline number"

key-files:
  created: [src/components/sections/offer.tsx]
  modified: [src/components/sections/outcomes.tsx]

key-decisions:
  - "Kept Outcomes' existing asymmetric lead+pair layout and lead-stat text-primary accent unchanged, only relabeling copy and adding id anchor + worst-case line — per plan's explicit anti-pattern gate against converting to a uniform grid"
  - "Offer's mid CTA (BookCta) placed directly after the <ol> pricing sequence with mt-12 spacing, matching the section-container padding convention (py-16/sm:py-20) used elsewhere on the page"

patterns-established:
  - "Scope-qualified pricing copy pattern: every price in Offer body copy explicitly ties back to 'scoped during your free audit' to avoid an unconditional public price commitment (threat T-05-02 mitigation)"

requirements-completed: [LAND-01, LAND-02, LAND-03, LAND-05]

# Metrics
duration: 8min
completed: 2026-07-20
---

# Phase 05 Plan 02: Outcomes Rewrite + Offer Section Summary

**Outcomes relabeled to TIME/EFFICIENCY/PROFIT with an explicit worst-case line, and a new scope-qualified Offer pricing sequence with mid-page BookCta**

## Performance

- **Duration:** 8 min
- **Started:** 2026-07-20T06:26:00Z (approx.)
- **Completed:** 2026-07-20T06:34:19Z
- **Tasks:** 2 completed
- **Files modified:** 2 (1 rewritten, 1 created)

## Accomplishments
- Outcomes section (`src/components/sections/outcomes.tsx`) rewritten to the TIME/EFFICIENCY/PROFIT vocabulary, kept the asymmetric lead + secondary-pair layout intact, added `id="outcomes"` and a standalone "Even in the worst case, you come out ahead." line
- New Offer section (`src/components/sections/offer.tsx`) built as a Server Component with the free-audit -> one-time-setup-under-$10k -> retainer-under-$2k/mo numbered/asymmetric sequence, every price scope-qualified, ending in a mid-page `<BookCta />`

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite Outcomes to TIME/EFFICIENCY/PROFIT with worst-case line** - `4b7c21c` (feat)
2. **Task 2: Create Offer section with scope-qualified pricing and mid CTA** - `6dcd16c` (feat)

**Plan metadata:** (this commit, pending)

## Files Created/Modified
- `src/components/sections/outcomes.tsx` - Relabeled outcome items to TIME/EFFICIENCY/PROFIT, added `id="outcomes"`, added the worst-case/conservative framing line; asymmetric `lg:col-span-7`/`lg:col-span-5` layout and `text-primary` lead stat preserved unchanged
- `src/components/sections/offer.tsx` - New file; exports `Offer`, a numbered/asymmetric pricing sequence (`md:grid-cols-[1.6fr_1fr_1fr]`) with scope-qualified copy for all three price tiers and a mid-page `<BookCta />`

## Decisions Made
- Kept Outcomes' layout skeleton byte-for-byte structurally identical (only copy/label/id changes) to satisfy the plan's explicit anti-pattern gate against a uniform 3-card grid
- EFFICIENCY (the item with no natural raw number) represented qualitatively as "Workflows that run themselves" per UI-SPEC/RESEARCH guidance
- Offer's mid CTA uses the default `<BookCta />` ("primary" variant) — no `sticky` variant needed for an in-page placement

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

During automated verification, the environment's `grep` resolves to `ugrep`, which in its default (non-fixed-string) mode does not match literal `$` followed directly by a digit (e.g. `Under $10k`) the same way GNU/BSD grep does — the plan's verify one-liner (`grep -q "Under \$10k" ...`) returned a false negative even though the exact substring is present in the file. Confirmed presence of all required substrings (`id="offer"`, `scoped during your free audit`, `Under $10k`, `Under $2k`, `BookCta`) via `grep -qF` (fixed-string mode) and `od -c` byte inspection instead — all passed. This is a local tooling quirk, not a defect in `offer.tsx`; no code change was made in response.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Outcomes and Offer are both standalone Server Components, ready to be imported and composed into `src/app/page.tsx` in a later wave/plan alongside Hero, TheFix, RoiCalculator, ProcessTransparency, and FinalCta per the UI-SPEC section order (gap -> fix -> outcomes -> offer -> CTA)
- No blockers. `npm run build` passes with both files in their current (not-yet-imported) state.

---
*Phase: 05-fde-landing-page*
*Completed: 2026-07-20*

## Self-Check: PASSED

- FOUND: src/components/sections/outcomes.tsx
- FOUND: src/components/sections/offer.tsx
- FOUND: .planning/phases/05-fde-landing-page/05-02-SUMMARY.md
- FOUND commit: 4b7c21c
- FOUND commit: 6dcd16c
- FOUND commit: 84d35f0
