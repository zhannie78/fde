---
phase: 05-fde-landing-page
plan: 03
subsystem: ui
tags: [react, nextjs, client-component, roi-calculator]

# Dependency graph
requires:
  - phase: 05-fde-landing-page
    provides: BookCta component (src/components/book-cta.tsx), design tokens (globals.css UI-SPEC 60/30/10 palette)
provides:
  - RoiCalculator client-island component (src/components/sections/roi-calculator.tsx)
  - PROOF-02/PROOF-03 client-side ROI proof point, ready for page.tsx integration in wave 2
affects: [05-fde-landing-page wave 2 (page.tsx assembly)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Isolated `\"use client\"` island pattern (RESEARCH Pattern 2) — useState-only interactivity with zero network/persistence, matching CalEmbed's small-client-boundary discipline"

key-files:
  created: [src/components/sections/roi-calculator.tsx]
  modified: []

key-decisions:
  - "Combined Task 1 (build) and Task 2 (harden) into a single implementation pass since both tasks' concrete requirements (labels, h-11 touch targets, clamp idiom) were fully specified upfront in the plan — no incremental discovery needed between them"
  - "Used bare Tailwind-styled <input> elements (not shadcn input/label) per UI-SPEC's 'bare <input> is acceptable' allowance, avoiding an unnecessary shadcn CLI add for two simple numeric fields"

patterns-established: []

requirements-completed: [PROOF-02, PROOF-03]

# Metrics
duration: 12min
completed: 2026-07-20
---

# Phase 05 Plan 03: ROI Calculator Client Island Summary

**Client-side ROI calculator (`RoiCalculator`) deriving annual hours/dollars recovered from two clamped numeric inputs via plain arithmetic — zero network, zero persistence, zero new dependencies — terminating in a `BookCta`.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-07-20T04:24:00Z (approx)
- **Completed:** 2026-07-20T04:36:47Z
- **Tasks:** 2 (both satisfied by one component build)
- **Files modified:** 1

## Accomplishments
- Built `RoiCalculator` as a `"use client"` island with `useState`-only state — no react-hook-form, no zod, no fetch, no `useEffect`
- Conservative `WEEKS_PER_YEAR = 50` derivation (not 52) reinforcing the worst-case/conservative framing requirement (LAND-05) inside the calculator's own output
- Honest empty state ("See what you're leaving on the table") rendered when `hoursPerWeek === 0`, instead of a broken `$0`/`0 hours` result
- Output copy explicitly speaks TIME ("hours/year back"), PROFIT ("recovered time"), and EFFICIENCY (qualitative "efficiency gains from work that no longer needs a person at all") — result numerals styled `text-primary` per UI-SPEC color contract
- Accessible `<label htmlFor>`/`id` pairing on both inputs, `h-11` (44px) minimum touch target for mobile, `Math.max(0, Number(value) || 0)` clamp on both change handlers (NaN/negative/empty-string safe)
- Section terminates in a reused `<BookCta />`, routing the calculator's output back to the audit CTA (PROOF-03)

## Task Commits

Both tasks' acceptance criteria were satisfied in a single implementation, committed atomically as one task-level commit:

1. **Task 1 + Task 2: Build and harden the RoiCalculator client-island component** - `deb5e29` (feat)

**Plan metadata:** (this commit, following SUMMARY creation)

## Files Created/Modified
- `src/components/sections/roi-calculator.tsx` - Client-island ROI calculator: two clamped numeric inputs (hours/week default 10, hourly cost default 35), 50-week conservative annual derivation, honest empty state, TIME/EFFICIENCY/PROFIT output with accent numerals, terminal BookCta

## Decisions Made
- Combined Task 1 (build) and Task 2 (harden) into one pass: the plan fully specified the hardening requirements (labels, `h-11`, clamp) upfront rather than requiring discovery during a first unhardened build, so building it correctly the first time avoided a redundant intermediate commit
- Kept bare `<input>` elements (UI-SPEC explicitly allows this) rather than adding shadcn `input`/`label` — avoids an unneeded dependency/CLI step for two simple numeric fields

## Deviations from Plan

None - plan executed exactly as written. Both tasks' acceptance criteria (verified via the plan's own automated verify commands) passed on the first build.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

`RoiCalculator` is a self-contained, build-verified component ready for `page.tsx` integration in wave 2 (per plan frontmatter: "Built standalone; page.tsx integrates it in wave 2"). No blockers. `npm run build` passes cleanly with the new component present but not yet imported anywhere (page.tsx wiring is out of scope for this plan).

---
*Phase: 05-fde-landing-page*
*Completed: 2026-07-20*
