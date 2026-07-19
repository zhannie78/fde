---
phase: 01-marketing-foundation
plan: 05
subsystem: ui
tags: [nextjs, react, tailwind, credibility, engagement-model]

# Dependency graph
requires:
  - phase: 01-marketing-foundation (plan 01)
    provides: "siteConfig module, UI-SPEC design tokens, founder-placeholder.svg"
  - phase: 01-marketing-foundation (plan 02)
    provides: "Root layout shell (SiteHeader/SiteFooter/StickyCtaBar), reusable <BookCta>"
provides:
  - "Working /about route: company-first FDE credibility story (SITE-02)"
  - "Working /services route: audit -> project -> retainer engagement model (SITE-03)"
  - "<FounderBlock> — custom ink-navy-band founder-photo credibility treatment, reusable if other pages need it"
  - "<ServiceSequence> — the sequential (not card-grid) engagement-model flow, reusable on future pages"
affects: [01-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sequential/numbered flow pattern (RESEARCH Pattern 3) for the engagement model: asymmetric column widths (wider first column, most copy on step 1) instead of a uniform card grid — same anti-pattern gate already established for the homepage's EngagementFlow, now reused at full depth on /services"
    - "Bracketed NEEDS-FOUNDER inline-placeholder pattern (established in Plan 01/04) extended to full-paragraph FDE narrative text in FounderBlock, not just single-value substitutions"

key-files:
  created:
    - src/components/founder-block.tsx
    - src/components/service-sequence.tsx
    - src/app/about/page.tsx
    - src/app/services/page.tsx
  modified: []

key-decisions:
  - "FounderBlock renders on a full-bleed ink-navy band (bg-secondary) with a two-column asymmetric layout (photo column ~42%, narrative column ~58%) rather than a centered avatar+name+role bio-card, satisfying UI-SPEC's explicit 'not a generic bio-card template' requirement"
  - "ServiceSequence uses md:grid-cols-[1.6fr_1fr_1fr] (not grid-cols-3) so step 1 (Free Audit) gets a visibly wider column and the most body copy, per RESEARCH Pattern 3 and the SITE-06 anti-pattern gate; accent color (#1F6E4A) appears only on the step-1 price numeral, matching UI-SPEC's 'accent reserved for ROI/highlight numerals' rule"
  - "FDE biographical narrative in FounderBlock is written as full sentences with inline bracketed [... — NEEDS-FOUNDER] placeholders for every unverifiable specific (work-history beat, engagement outcome, full name/tenure), rather than omitting the narrative until founder input arrives — keeps the page shippable now while making it unmistakable which facts still need confirmation (D-13)"

requirements-completed: [SITE-02, SITE-03]

# Metrics
duration: 3min
completed: 2026-07-19
---

# Phase 1 Plan 5: About & Services Content Pages Summary

**Company-first About page with a custom ink-navy founder-credibility band (bracketed NEEDS-FOUNDER FDE story per D-13), and a Services page rendering the audit -> project -> retainer model as an asymmetric sequential flow instead of a card grid.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-19T18:14:28Z
- **Completed:** 2026-07-19T18:16:53Z
- **Tasks:** 2 completed
- **Files modified:** 4 (all created)

## Accomplishments
- `/about` route live: Fraunces H1, company-first intro copy, `<FounderBlock />` on a full-bleed ink-navy band, closing narrative section, `<BookCta />`
- `<FounderBlock>` gives the founder photo a deliberate custom treatment (large photo column + narrative column on `bg-secondary`), explicitly not a centered avatar/name/role bio-card
- Every FDE biographical specific (work-history beat, engagement outcome, full name/tenure) ships as a clearly-bracketed `NEEDS-FOUNDER` placeholder — zero invented facts, per D-13
- `/services` route live: plain-language intro (no AI jargon), `<ServiceSequence />`, closing `<BookCta />`
- `<ServiceSequence>` renders Free Audit / Fixed-Scope Project / Monthly Retainer as an asymmetric `1.6fr/1fr/1fr` sequential flow — step 1 visibly wider with the most copy, no icons/emoji, no `grid-cols-3` uniform grid
- `npx next build` exits 0 after both tasks; `/about` and `/services` both appear in the static route list

## Task Commits

Each task was committed atomically:

1. **Task 1: About page + founder credibility block (SITE-02)** - `2ac1957` (feat)
2. **Task 2: Services page + audit -> project -> retainer sequential flow (SITE-03)** - `f6f98d7` (feat)

**Plan metadata:** (final commit follows this SUMMARY)

## Files Created/Modified
- `src/components/founder-block.tsx` - Founder credibility block: photo + narrative on an ink-navy band, `siteConfig.founderName`/`siteConfig.region`, bracketed `NEEDS-FOUNDER` biographical placeholders
- `src/app/about/page.tsx` - About route (Server Component): heading, intro copy, `<FounderBlock />`, closing narrative + `<BookCta />`, page metadata
- `src/components/service-sequence.tsx` - Engagement-model sequence: three steps as an asymmetric `md:grid-cols-[1.6fr_1fr_1fr]` flow, step 1 widest, accent color only on the step-1 price numeral
- `src/app/services/page.tsx` - Services route (Server Component): heading, plain-language intro, `<ServiceSequence />`, closing `<BookCta />`, page metadata

## Decisions Made
See `key-decisions` in frontmatter above.

## Deviations from Plan

None - plan executed exactly as written. No Rule 1-4 triggers encountered; both tasks' acceptance criteria (build exit 0, required component references, no `grid-cols-3`, bracketed placeholders present) satisfied on first pass.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. All FDE biographical specifics in `src/components/founder-block.tsx` remain flagged `NEEDS-FOUNDER` (D-13) and must be resolved by the founder before launch, tracked alongside the existing Plan 01 `siteConfig` launch-blocker placeholders (name, email, region, domain, Cal.com link, founder photo).

## Next Phase Readiness
- `/about` and `/services` are both live, reachable from the existing header/footer nav (wired in Plan 02), and reuse the established design tokens, fonts, and `<BookCta />` component with zero new dependencies
- `<FounderBlock>` and `<ServiceSequence>` are both standalone, reusable components if Plan 06 or later phases need to reference the founder story or engagement model elsewhere
- No blockers — `npx next build` exits 0, all Task 1/Task 2 acceptance criteria verified directly against file contents
- Outstanding launch-checklist items unchanged from prior plans: real founder photo (D-07), real founder biographical specifics (D-13), production domain/email (D-04/D-05), Cal.com link (D-01) — all still tracked as `NEEDS-FOUNDER` placeholders, none newly introduced by this plan

## Self-Check: PASSED

All claimed files verified present (src/components/founder-block.tsx, src/components/service-sequence.tsx, src/app/about/page.tsx, src/app/services/page.tsx, this SUMMARY.md). Both claimed commit hashes (2ac1957, f6f98d7) verified present in git log.

---
*Phase: 01-marketing-foundation*
*Completed: 2026-07-19*
