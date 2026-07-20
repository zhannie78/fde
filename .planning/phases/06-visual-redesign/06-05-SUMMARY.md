---
phase: 06-visual-redesign
plan: 05
subsystem: ui
tags: [about-page, next-image, avatar-fallback, portfolio, sitemap]

# Dependency graph
requires:
  - phase: 06-visual-redesign
    plan: 01
    provides: GlowBox/ElevatedCta primitives, avatar-wrap/credential-pill/demo-badge/case-result CSS classes, siteConfig.bookCtaLabel
provides:
  - New /about route (bio, honest demos, disclosed composite portfolio, elevated final CTA)
  - Avatar Client Component (next/image + onError monogram fallback)
  - Founder photo served from public/annie-photo.jpg
  - /about registered in sitemap.ts
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Small `use client` boundary + useState failure flag + graceful fallback (Avatar mirrors CalEmbed's shape)"
    - "About page composes new section markup directly in the route file (no separate section components), following page.tsx's Server Component + metadata export convention"

key-files:
  created:
    - src/app/about/page.tsx
    - src/components/about/avatar.tsx
  modified:
    - src/app/sitemap.ts
  moved:
    - "annie-photo.jpg -> public/annie-photo.jpg"

key-decisions:
  - "annie-photo.jpg was untracked at repo root (not yet git-added), so `git mv` failed with 'not under version control' — used a plain filesystem `mv` followed by `git add public/annie-photo.jpg` to achieve the same relocation the plan intended."
  - "Preview demo card's 'Request a walkthrough' CTA links to /book (no dedicated walkthrough-request form exists) rather than a dead link or a fabricated action — consistent with the 'never fake a Live demo' constraint while keeping the CTA functional."
  - "Did not reuse a `.section-label`/`.label` CSS class for eyebrow text (Demos/Portfolio headings, case-block Problem/Solution/Result labels) because 06-01 did not port those classes into globals.css — matched the existing homepage convention instead (text-sm font-bold tracking-[0.02em] text-primary uppercase, as used in the-fix.tsx and outcomes.tsx) for visual consistency with the rest of the site."

requirements-completed: [DSGN-05, DSGN-01]

# Metrics
duration: 12min
completed: 2026-07-20
---

# Phase 6 Plan 05: About Page (Bio, Demos, Portfolio) Summary

**Built the `/about` route that makes the anonymity reversal concrete — Avatar photo with a React monogram fallback, name/credentials/bio, an honest Live-vs-Preview demos section, a 4-card illustrative-composite portfolio, and the homepage's exact elevated final CTA — then registered the route in the sitemap.**

## Performance

- **Duration:** ~12 min
- **Completed:** 2026-07-20
- **Tasks:** 3/3 completed
- **Files modified:** 4 (2 created, 1 modified, 1 moved)

## Accomplishments
- Moved `annie-photo.jpg` from repo root into `public/` so `next/image` can serve it (repo-root files 404 under Next's `public/`-only serving rule)
- Created `Avatar` as a small `"use client"` Component: `next/image` at explicit 200x200 dimensions, `onError` sets a `useState` failure flag that swaps in a monogram placeholder derived from `siteConfig.founderName` (never hardcoded, never a raw `<img onerror>` string)
- Built `src/app/about/page.tsx` as a Server Component route with its own `metadata` export: bio header (2-col desktop grid, stacked/centered mobile) with the two confirmed credential pills (Georgia Tech, Palantir Foundry) and no industry-vertical pills; a Demos section with one real "Live" card linking to `/#calculator` and a "Preview" card (no fabricated live demo); a Portfolio section with 4 `GlowBox` composite case cards (Problem/Solution/Result, Result wrapped in `.case-result`'s lime left-border) and the required illustrative-composite disclosure line rendered visibly under the section heading; a final CTA using the shared `ElevatedCta` component — identical treatment to the homepage
- Added `/about` to `src/app/sitemap.ts`'s `routes` array
- Verified with `npx tsc --noEmit`, `npx eslint`, and a full `npm run build` — `/about` compiles and prerenders as a static route alongside `/`, `/book`, `/sitemap.xml`

## Task Commits

Each task was committed atomically:

1. **Task 1: Move photo to public/ and build the Avatar fallback component** - `a845ff1` (feat)
2. **Task 2: Build the /about page (bio header, demos, portfolio, final CTA)** - `f5c7944` (feat)
3. **Task 3: Add /about to the sitemap** - `8ad238a` (feat)

_No TDD tasks in this plan — static Server Component route + one isolated Client Component fallback._

## Files Created/Modified
- `public/annie-photo.jpg` - Founder photo asset, relocated from repo root so it's servable by `next/image`
- `src/components/about/avatar.tsx` - Client Component: real photo via `next/image`, `onError`-driven monogram fallback from `siteConfig.founderName`
- `src/app/about/page.tsx` - New `/about` Server Component route: bio header, demos, portfolio, final CTA
- `src/app/sitemap.ts` - Added `"/about"` to the `routes` array

## Decisions Made
- Used plain `mv` + `git add` instead of `git mv` for the photo relocation, since the source file was untracked at repo root (a pre-existing condition noted in the plan context, not a deviation from the plan's intent).
- Routed the "Preview" demo card's CTA to `/book` rather than leaving a non-functional walkthrough-request action, keeping the honest Live-vs-Preview distinction while avoiding a dead link.
- Reused the homepage's existing eyebrow-label Tailwind utility convention (`text-sm font-bold tracking-[0.02em] text-primary uppercase`) for the Demos/Portfolio section labels and case-block Problem/Solution/Result labels, since 06-01 did not port a dedicated `.section-label`/`.label` CSS class from the skill file into `globals.css`.

## Deviations from Plan

None (Rule 1/2/3) requiring functional changes — the `git mv` → `mv`+`git add` substitution above is a mechanical adjustment to an already-noted pre-existing condition (untracked file), not a behavior or architecture change.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `/about` is fully built and reachable, satisfying DSGN-05; `DSGN-05` and `DSGN-01` (already complete from 06-01) are both marked complete in REQUIREMENTS.md.
- No blockers carried forward — `npx tsc --noEmit`, `npx eslint`, and `npm run build` all pass cleanly, and `/about` appears as a static prerendered route in the build output.
- Ready for the remaining Phase 6 waves (06-06, 06-07) to proceed independently — this plan introduced no new shared primitives or CSS beyond what 06-01 already provided.

---
*Phase: 06-visual-redesign*
*Completed: 2026-07-20*

## Self-Check: PASSED

All created/modified files (`public/annie-photo.jpg`, `src/components/about/avatar.tsx`, `src/app/about/page.tsx`, `src/app/sitemap.ts`) and all three task commits (`a845ff1`, `f5c7944`, `8ad238a`) verified present.
