---
phase: 06-visual-redesign
plan: 04
subsystem: ui
tags: [tailwind-v4, next-link, site-chrome, navigation, cta]

# Dependency graph
requires:
  - phase: 06-visual-redesign (plan 01)
    provides: siteConfig.bookCtaLabel constant, new 60/30/10 indigo/mono token system already flowing into theme utilities used by chrome
provides:
  - Single-source CTA label ("Book a Free Call Now") rendered by every BookCta call site (header, hero, footer, sticky bar) via siteConfig.bookCtaLabel
  - "/about" nav entry in both desktop (site-header.tsx) and mobile (mobile-nav.tsx) navLinks arrays, making the About route reachable from global nav
  - Chrome components (header, mobile nav, footer) restricted to the exactly-2-weights contract (font-bold / font-normal only)
affects: [06-05, 06-06, 06-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Chrome components reference siteConfig constants and theme utilities only — no hardcoded copy or hex values, so palette/copy changes propagate from a single source (06-01's tokens, this plan's bookCtaLabel)"

key-files:
  created: []
  modified:
    - src/components/book-cta.tsx
    - src/components/site-header.tsx
    - src/components/mobile-nav.tsx
    - src/components/site-footer.tsx

key-decisions:
  - "sticky-cta-bar.tsx required no edits — it already had zero font-semibold/font-medium occurrences and already retains its h-11 (44px) touch target via BookCta's sticky variant, so Task 3 only touched site-footer.tsx."
  - "Reworded the book-cta.tsx doc comment to avoid literally quoting the label string, since a quoted-string comment would have satisfied the verification grep for a 'hardcoded label' false-positive while looking correct to a human reader."

requirements-completed: []

# Metrics
duration: 1min
completed: 2026-07-20
---

# Phase 6 Plan 04: Site Chrome CTA + Nav Summary

**Renamed the site-wide CTA to "Book a Free Call Now" via a single siteConfig constant, added the About nav link to desktop + mobile navigation, and corrected stray font-semibold/font-medium weights in header/footer to honor the mono-type 2-weight contract.**

## Performance

- **Duration:** ~1 min (three small, independent edits)
- **Completed:** 2026-07-20
- **Tasks:** 3/3 completed
- **Files modified:** 4 (book-cta.tsx, site-header.tsx, mobile-nav.tsx, site-footer.tsx)

## Accomplishments
- `BookCta` now renders `siteConfig.bookCtaLabel` in both the glow and plain branches — every CTA call site across the site inherits the new "Book a Free Call Now" copy from one place, with no duplicated literal left anywhere in the file
- Desktop (`site-header.tsx`) and mobile (`mobile-nav.tsx`) `navLinks` arrays both gained `{ href: "/about", label: "About" }`, appended last for stable ordering — makes the forthcoming `/about` page (06-05) reachable from global nav (DSGN-05 reachability half; the page itself ships in 06-05)
- Fixed stray `font-semibold`/`font-medium` weights in the header wordmark, mobile-nav links, and footer wordmark to `font-bold`/`font-normal`, completing the exactly-2-weights (400/700) contract across all persistent chrome
- Confirmed `sticky-cta-bar.tsx` needed no changes — already weight-compliant and already carries its 44px touch target through `BookCta`'s `sticky` variant

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename CTA label in book-cta.tsx** - `164184a` (feat)
2. **Task 2: Add About nav link and restyle header + mobile nav** - `45b914a` (feat)
3. **Task 3: Weight/style sweep for footer + sticky CTA bar** - `3dabd6c` (feat)

_No TDD tasks in this plan — pure copy/markup edits to existing components._

## Files Created/Modified
- `src/components/book-cta.tsx` - Both CTA branches (glow + plain) now render `{siteConfig.bookCtaLabel}` instead of the hardcoded "Book Your Free Audit Call" literal; doc comment updated to match
- `src/components/site-header.tsx` - Added `/about` entry to `navLinks`; wordmark `font-semibold` → `font-bold`
- `src/components/mobile-nav.tsx` - Added `/about` entry to `navLinks`; nav link `font-medium` → `font-normal`
- `src/components/site-footer.tsx` - Wordmark `font-semibold` → `font-bold`

## Decisions Made
- `sticky-cta-bar.tsx` required zero edits for Task 3 — inspected first and confirmed it already had no `font-semibold`/`font-medium` occurrences and already preserves its 44px min touch target via `BookCta`'s `h-11` sticky-variant class, so no commit-worthy change existed there.
- Reworded the `book-cta.tsx` file doc comment away from a literal quoted copy of the new label, since the verification gate greps for a hardcoded `"Book a Free Call Now"` string literal anywhere in the file (not just the JSX) — a comment quoting the label would have falsely tripped that gate despite being harmless prose.

## Deviations from Plan

None - plan executed exactly as written. (The `sticky-cta-bar.tsx` "no changes needed" outcome was anticipated by the plan itself, which described the file as already theme-utility-only.)

## Issues Encountered

None. First verification attempt on Task 1 caught its own comment-string false-positive during self-review before committing; fixed inline, no re-run of unrelated tasks needed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Global nav now exposes `/about` on both desktop and mobile; 06-05 must build the actual `/about` route (Bio & Portfolio Page per the sketch-findings-fde skill) to complete DSGN-05 end-to-end — that requirement remains unchecked in REQUIREMENTS.md until 06-05 lands.
- Every `BookCta` instance site-wide now reads the same `siteConfig.bookCtaLabel` copy; future copy changes only need one edit.
- No blockers carried forward — `npx tsc --noEmit` passes cleanly and all three task verification gates passed.

---
*Phase: 06-visual-redesign*
*Completed: 2026-07-20*

## Self-Check: PASSED

All modified files (`src/components/book-cta.tsx`, `src/components/site-header.tsx`, `src/components/mobile-nav.tsx`, `src/components/site-footer.tsx`) and all three task commits (`164184a`, `45b914a`, `3dabd6c`) verified present.
