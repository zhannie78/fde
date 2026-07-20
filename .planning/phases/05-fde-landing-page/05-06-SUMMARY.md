---
phase: 05-fde-landing-page
plan: 06
subsystem: ui
tags: [nextjs, routing, nav, anonymity, sitemap, copywriting]

# Dependency graph
requires:
  - phase: 05-fde-landing-page
    provides: 7-section page.tsx composition and first-tranche v1 component deletions (plan 05)
provides:
  - "/about and /services routes fully deleted; single-page IA is now the entire public route surface (/, /book)"
  - "sitemap.ts trimmed to home and /book only"
  - "site-header.tsx, site-footer.tsx, mobile-nav.tsx nav links repointed to /#offer and /#process in-page anchors"
  - "Zero founder-name/gendered-pronoun references reach rendered visitor-facing copy"
  - "Zero v1 vocabulary (missed calls, intake triage, vertical-specific terms) reaches rendered output"
affects: [LAND-06 requirement closure, any future plan adding new routes/nav links or touching cal-embed.tsx/book/page.tsx copy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "In-page anchor nav links use leading-slash form (/#offer, /#process) so they resolve correctly when clicked from a non-home route like /book"
    - "siteConfig.founderName stays defined in site.ts as an internal-only constant; consuming components are scrubbed, not the constant itself"

key-files:
  created: []
  modified:
    - src/app/sitemap.ts
    - src/components/site-header.tsx
    - src/components/site-footer.tsx
    - src/components/mobile-nav.tsx
    - src/components/cal-embed.tsx
    - src/app/book/page.tsx

key-decisions:
  - "Removed the now-unused siteConfig import from book/page.tsx after dropping the founderName interpolation, to avoid an unused-import build/lint failure (Rule 1 auto-fix, not called out explicitly in the plan action text)"

patterns-established: []

requirements-completed: [LAND-06]

# Metrics
duration: 2min
completed: 2026-07-20
---

# Phase 05 Plan 06: Delete v1 Routes, Repoint Nav, Scrub Anonymity Summary

**Deleted the /about and /services routes plus their orphaned founder-block/service-sequence components, trimmed the sitemap to home+/book, repointed all three nav surfaces to in-page anchors, and scrubbed the last founder-name/pronoun and v1-vocabulary references from cal-embed.tsx and /book — closing out LAND-06 with both exit greps passing clean across the fully-migrated repo.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-07-20T06:44:42+02:00
- **Completed:** 2026-07-20T06:46:14+02:00
- **Tasks:** 3 completed
- **Files modified:** 10 (4 deleted, 6 edited)

## Accomplishments

- Deleted `src/app/about/page.tsx`, `src/app/services/page.tsx`, `src/components/founder-block.tsx`, `src/components/service-sequence.tsx` — confirmed via grep that no remaining source file imports either component before deleting (the sole other hit was a historical doc-comment mention in `process-transparency.tsx`, not an import).
- Trimmed `src/app/sitemap.ts` `routes` array from `["", "/about", "/services", "/book"]` to `["", "/book"]`.
- Repointed `navLinks` in `site-header.tsx` and `mobile-nav.tsx`, and `footerLinks` in `site-footer.tsx`, from `/services`/`/about` to `/#offer` (Pricing) and `/#process` (How It Works) — leading-slash anchors so they resolve correctly when clicked from `/book` per the plan's PATTERNS.md guidance.
- Rewrote the `cal-embed.tsx` booking-failure fallback to drop `siteConfig.founderName` and the gendered pronoun "she," replacing with "Email us directly... and we'll find a time."
- Rewrote `book/page.tsx`'s `metadata.description` to drop the `founderName` string-concatenation interpolation, and rewrote the body intro paragraph to drop the literal v1 vocabulary "missed calls, slow follow-ups, manual busywork" in favor of FDE-framed language ("manual busywork and workflows that don't run themselves").
- Removed the now-unused `siteConfig` import from `book/page.tsx` after the `founderName` interpolation was dropped (Rule 1 auto-fix — an unused import would otherwise be a lint/build correctness issue).
- Ran both LAND-06 exit greps across the fully-migrated repo: (1) v1-vocabulary grep (`missed call|intake triage|dental|home services|law firm|real estate`) across `src public` returns zero hits; (2) `founderName|Annie|\bshe\b|\bher\b` grep across `src` returns hits only in `src/config/site.ts` (the constant definition and its dev-placeholder comment), which the plan explicitly designates as internal-only and out of scope for the scrub.
- `npm run build` passes after every task.

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete /about and /services routes and orphaned components; trim sitemap** - `5dfffc0` (feat)
2. **Task 2: Repoint nav links to in-page anchors (header, footer, mobile-nav)** - `919b807` (feat)
3. **Task 3: Anonymity scrub (Cal.com fallback + /book intro) and final LAND-06 grep gate** - `4d9061e` (fix)

_Note: This plan runs sequentially on the main working tree (worktree isolation unavailable this session); no separate plan-metadata commit was made per orchestrator instructions — STATE.md/ROADMAP.md updates are owned by the orchestrator after the wave completes._

## Files Created/Modified
- `src/app/about/page.tsx` - Deleted (single-page IA, no standalone About route in v2)
- `src/app/services/page.tsx` - Deleted (single-page IA, pricing/sequence content already folded into Offer + ProcessTransparency)
- `src/components/founder-block.tsx` - Deleted (About-page founder bio, violated anonymity constraint)
- `src/components/service-sequence.tsx` - Deleted (orphaned once services/page.tsx removed; content already merged upstream)
- `src/app/sitemap.ts` - Edited: `routes` array trimmed to `["", "/book"]`
- `src/components/site-header.tsx` - Edited: `navLinks` repointed to `/#offer`, `/#process`
- `src/components/site-footer.tsx` - Edited: `footerLinks` repointed to `/`, `/#offer`, `/#process`, `/book`
- `src/components/mobile-nav.tsx` - Edited: `navLinks` repointed to `/#offer`, `/#process` (identical to site-header.tsx)
- `src/components/cal-embed.tsx` - Edited: booking-failure `role="alert"` fallback drops founderName + gendered pronoun
- `src/app/book/page.tsx` - Edited: `metadata.description` drops founderName interpolation; body intro drops v1 vocabulary; unused `siteConfig` import removed

## Decisions Made
- Confirmed via grep, before deleting, that `founder-block` and `service-sequence` had no remaining source imports outside the two pages being deleted in the same task — safe single-commit deletion.
- Used leading-slash anchor hrefs (`/#offer`, `/#process`) rather than bare `#offer`/`#process` across all three nav surfaces, per PATTERNS.md's explicit recommendation, so links resolve correctly from `/book` as well as from `/`.
- Left `siteConfig.founderName` defined in `src/config/site.ts` untouched (internal-only constant, no longer consumed anywhere in rendered output) rather than deleting it — matches the plan's explicit scope boundary.
- Auto-fixed (Rule 1) the now-unused `siteConfig` import in `book/page.tsx` after the `founderName` interpolation was removed from `metadata.description` — the plan's action text didn't call this out explicitly, but leaving an unused import risked a lint/type error.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused `siteConfig` import from book/page.tsx**
- **Found during:** Task 3
- **Issue:** After rewriting `metadata.description` to drop the `siteConfig.founderName` interpolation, `siteConfig` became an unused import in `book/page.tsx` (the body copy never referenced it).
- **Fix:** Removed the `import { siteConfig } from "@/config/site";` line from `book/page.tsx`.
- **Files modified:** `src/app/book/page.tsx`
- **Commit:** `4d9061e`

## Threat Flags

None — this plan only deletes routes/components, trims an array, and edits existing copy strings; no new network endpoints, auth paths, file access patterns, or schema changes were introduced. All three threats in the plan's own STRIDE register (T-05-10, T-05-11, T-05-12) were the ones directly mitigated by this plan's tasks.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- LAND-06 is fully satisfied: no v1 routes, copy, or metadata survive; no founder-name/pronoun reaches rendered output; nav resolves to in-page anchors; both exit greps pass clean; build green.
- This closes out the last plan of Phase 05 (fde-landing-page) — the site's public route surface is now exactly `/` and `/book`, and the full 5-part message hierarchy composed in plan 05 carries the site's only nav/anchor targets.
- No blockers for Phase 06 (Visual Redesign), which builds on this same route/component surface.

---
*Phase: 05-fde-landing-page*
*Completed: 2026-07-20*

## Self-Check: PASSED

- FOUND: src/app/about/page.tsx deleted
- FOUND: src/app/services/page.tsx deleted
- FOUND: src/components/founder-block.tsx deleted
- FOUND: src/components/service-sequence.tsx deleted
- FOUND: src/app/sitemap.ts routes trimmed to ["", "/book"]
- FOUND: src/components/site-header.tsx navLinks repointed
- FOUND: src/components/site-footer.tsx footerLinks repointed
- FOUND: src/components/mobile-nav.tsx navLinks repointed
- FOUND: src/components/cal-embed.tsx fallback scrubbed
- FOUND: src/app/book/page.tsx metadata/body scrubbed
- FOUND: .planning/phases/05-fde-landing-page/05-06-SUMMARY.md
- FOUND: commit 5dfffc0 (Task 1)
- FOUND: commit 919b807 (Task 2)
- FOUND: commit 4d9061e (Task 3)
