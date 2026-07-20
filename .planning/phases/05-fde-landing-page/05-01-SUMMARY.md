---
phase: 05-fde-landing-page
plan: 01
subsystem: ui
tags: [nextjs, react, tailwind, server-components, marketing-copy]

# Dependency graph
requires: []
provides:
  - Rewritten Hero (gap-first framing, MIT NANDA-cited 95% stat, single-column, top BookCta)
  - New TheFix section (forward-deployed engineering explainer, id="fix")
affects: [05-02, 05-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Gap/Fix narrative sections stay Server Components on current design tokens (no new token values, no lucide icons, no motion)"
    - "Accent eyebrow idiom (text-sm font-semibold tracking-[0.02em] text-primary uppercase) reused for new section labels"

key-files:
  created:
    - src/components/sections/the-fix.tsx
  modified:
    - src/components/sections/hero.tsx

key-decisions:
  - "Hero collapsed to single-column max-w-3xl container (was lg:flex-row two-column) since DemoPlaceholder's right-column slot has no reassigned use in v2"
  - "95%-stat citation rendered as a standalone text-sm text-muted-foreground line, scoped explicitly to 'enterprise generative-AI pilots' per RESEARCH Pitfall 3 sourcing guidance (MIT NANDA / Project NANDA, 2025)"
  - "TheFix copy adapts the fde.academy 'still on the hook when it breaks' ownership framing without citing any enterprise case studies (John Deere/Fox/JPMC/AWS/Databricks), consistent with RESEARCH's anti-pattern guidance for an SMB-affordability pitch"

patterns-established:
  - "New narrative sections (TheFix, and by extension Outcomes/Offer/ProcessTransparency in later plans) follow outcomes.tsx's asymmetric-explainer shape: eyebrow label -> heading -> body, id-anchored section wrapper, no icon grids"

requirements-completed: [LAND-01, LAND-03]

# Metrics
duration: 12min
completed: 2026-07-20
---

# Phase 5 Plan 1: Hero + TheFix Rewrite Summary

**Rewrote Hero to a gap-first, MIT NANDA-cited 95%-failure headline with a single-column layout and top BookCta, and built the new TheFix Server Component explaining forward-deployed engineering — the first two of the five narrative parts, built standalone ahead of page.tsx integration in wave 2.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-07-20T04:18:00Z
- **Completed:** 2026-07-20T04:30:34Z
- **Tasks:** 2 completed
- **Files modified:** 2 (1 rewritten, 1 created)

## Accomplishments
- Hero now leads with a gap-first headline ("A powerful AI model is not the same thing as a working system"), followed by the MIT NANDA-cited, enterprise-scoped 95% stat line and SMB-bridge copy, single-column, with a top `BookCta` (1st of 3 CTA placements, LAND-03)
- Removed the `DemoPlaceholder` import and two-column layout from Hero entirely — no v1 demo-slot coupling remains
- New `TheFix` section (`id="fix"`) explains forward-deployed engineering as embedded/workflow-first/white-glove, with an end-to-end ownership framing ("still on the hook when something breaks"), using buyer vocabulary naturally and no enterprise case-study name-drops

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite Hero to gap-first framing with cited 95% stat and top CTA** - `9ca2735` (feat)
2. **Task 2: Create TheFix forward-deployed-engineering explainer section** - `ee4a8da` (feat)

**Plan metadata:** (pending — final commit follows this SUMMARY)

## Files Created/Modified
- `src/components/sections/hero.tsx` - Rewritten: gap-first H1 (Display-size, unchanged clamp), cited 95% stat line, SMB-bridge body copy, single-column layout, top `BookCta`, no `DemoPlaceholder`
- `src/components/sections/the-fix.tsx` - New Server Component: `id="fix"`, accent eyebrow ("The Fix"), heading + two body paragraphs on forward-deployed engineering, no icons, no enterprise names

## Decisions Made
- Hero's layout collapses to a single `max-w-3xl` column rather than reassigning the vacated right-column slot to new content — UI-SPEC/PATTERNS left this as an open layout choice once `DemoPlaceholder` was removed, and no v2 requirement fills that slot in this plan
- Wrote original gap-statement copy inspired by (not quoting) fde.academy's "a powerful model is not the same thing as a working system" framing, per the plan's explicit instruction not to quote verbatim

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Hero doc comment referenced "DemoPlaceholder" by name, failing its own acceptance criterion**
- **Found during:** Task 1 verification (`! grep -q "DemoPlaceholder" src/components/sections/hero.tsx`)
- **Issue:** Initial rewrite's JSDoc comment explained the removed right-column slot by naming the deleted `DemoPlaceholder` component, which the task's own acceptance criteria explicitly forbids ("File contains no reference to `DemoPlaceholder`")
- **Fix:** Reworded the comment to describe the removed slot generically ("the v1 right-column demo slot") without naming the deleted component
- **Files modified:** `src/components/sections/hero.tsx`
- **Verification:** Re-ran the verify command; `HERO_OK` printed
- **Committed in:** `9ca2735` (part of Task 1 commit — fixed before commit, not a separate commit)

---

**Total deviations:** 1 auto-fixed (1 bug — self-caught during verification, fixed before commit)
**Impact on plan:** No scope creep; pure text fix inside the same task before it was committed.

## Issues Encountered
None beyond the deviation above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `Hero` and `TheFix` are both ready to be imported into `page.tsx` in wave 2 (05-02 or later) alongside `Outcomes`, `RoiCalculator`, `Offer`, `ProcessTransparency`, and `FinalCta`
- `TheFix` is not yet wired into any route — it exists standalone per this plan's explicit scope (page.tsx integration deferred to wave 2)
- No blockers for downstream plans in this wave

---
*Phase: 05-fde-landing-page*
*Completed: 2026-07-20*

## Self-Check: PASSED

- FOUND: src/components/sections/hero.tsx
- FOUND: src/components/sections/the-fix.tsx
- FOUND: .planning/phases/05-fde-landing-page/05-01-SUMMARY.md
- FOUND: 9ca2735 (Task 1 commit)
- FOUND: ee4a8da (Task 2 commit)
- FOUND: 9730585 (SUMMARY commit)
