---
phase: 01-marketing-foundation
plan: 03
subsystem: ui
tags: [nextjs, react, calcom, embed, booking]

# Dependency graph
requires:
  - phase: 01-marketing-foundation (plan 01)
    provides: "siteConfig module (calLink, calNamespace, founderName, founderEmail), UI-SPEC design tokens, @calcom/embed-react package"
  - phase: 01-marketing-foundation (plan 02)
    provides: "Root layout shell (SiteHeader/SiteFooter/StickyCtaBar) that /book inherits automatically, and <BookCta> which already links to /book"
provides:
  - "Working /book route rendering a real Cal.com scheduling embed, isolated to a small Client Component"
  - "UI-SPEC failed-to-load error state (role=alert, mailto founder-email fallback) satisfying D-03"
  - "Local end-to-end skeleton path exercisable: home -> BookCta -> /book -> Cal embed"
affects: [01-04, 01-05, 01-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Third-party embed isolation pattern: @calcom/embed-react is loaded ONLY inside src/components/cal-embed.tsx, keeping the \"use client\" boundary as small as possible while the route itself (src/app/book/page.tsx) stays a Server Component"
    - "Single-source theme configuration: Cal.com theme/branding is set in exactly one place (the getCalApi -> cal(\"ui\", ...) call), never duplicated on the <Cal> config prop, to avoid the documented theme-flash bug"

key-files:
  created:
    - src/components/cal-embed.tsx
    - src/app/book/page.tsx
  modified: []

key-decisions:
  - "Used the Heading typographic scale (28px/600/1.2) for the /book H1 instead of the Display scale (44px), even though the plan's task text says 'H1/Display heading' — UI-SPEC explicitly reserves Display size for the hero headline only ('do not use a second display size elsewhere'); the H1 tag is semantically correct, its visual size follows the UI-SPEC constraint that takes precedence over the plan's shorthand wording."

patterns-established:
  - "Any future third-party client-only widget (e.g. a demo iframe in Phase 2) should follow the same isolation pattern: a small dedicated Client Component wrapping just the widget, imported into an otherwise-Server-Component page."

requirements-completed: [SITE-04]

# Metrics
duration: 3min
completed: 2026-07-19
---

# Phase 1 Plan 3: Book Route (Cal.com Embed) Summary

**A `/book` route rendering a real, isolated Cal.com scheduling embed with a UI-SPEC founder-email error fallback, completing the site's one live third-party integration in Phase 1.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-19T20:01:00Z
- **Completed:** 2026-07-19T20:04:37Z
- **Tasks:** 2 completed
- **Files modified:** 2 (both created)

## Accomplishments
- `src/components/cal-embed.tsx` — isolated Client Component wrapping `@calcom/embed-react`, theme configured in exactly one place, all identity/link values (`calNamespace`, `calLink`, `founderName`, `founderEmail`) sourced from `siteConfig`
- UI-SPEC error state implemented: a `role="alert"` block with destructive-token styling and a `mailto:` founder-email fallback, resolved from `siteConfig` (no literal `[founder email]` bracket text shipped)
- `src/app/book/page.tsx` — Server Component route with Fraunces H1 + plain-voice, ROI-framed sub-copy above the embed; only `<CalEmbed />` carries the `"use client"` boundary
- `/book` confirmed present in `npx next build`'s route list; build exits 0
- No reference anywhere to the nonexistent `@calcom/react-widget` package (RESEARCH Pitfall 2)
- The local end-to-end skeleton path (home -> `<BookCta>` -> `/book` -> Cal embed) is now exercisable

## Task Commits

Each task was committed atomically:

1. **Task 1: Cal.com embed client component with error-state fallback** - `d0b630e` (feat)
2. **Task 2: /book route composing surrounding copy + the embed** - `0625709` (feat)

**Plan metadata:** (final commit follows this SUMMARY)

## Files Created/Modified
- `src/components/cal-embed.tsx` - Client Component: `getCalApi({ namespace: siteConfig.calNamespace })` configures theme/branding once via `cal("ui", ...)`; renders `<Cal namespace calLink={siteConfig.calLink} config={{ layout: "month_view" }} />`; on `getCalApi` failure, renders the `role="alert"` error state with a `mailto:siteConfig.founderEmail` link
- `src/app/book/page.tsx` - Server Component: route metadata (title/description), Fraunces H1 + ROI-framed plain-voice sub-copy (D-11/D-12), `min-h-[700px]` container wrapping `<CalEmbed />`; no popup/modal booking (D-02)

## Decisions Made
- Sized the `/book` H1 at the UI-SPEC "Heading" scale (28px) rather than "Display" (44px), reconciling the plan task's literal "H1/Display" wording against the UI-SPEC's explicit constraint that Display size is reserved for the hero headline only. The tag remains `<h1>` (correct document semantics); only the visual size differs from a literal reading of the task text.

## Deviations from Plan

None - both tasks executed as written; the H1-sizing choice above is a UI-SPEC compliance interpretation, not a functional deviation, and required no fix-cycle.

## Issues Encountered
None.

## User Setup Required

None for this plan's own acceptance criteria — `npx next build` and route-list checks pass against the current placeholder `siteConfig.calLink`. Real end-to-end booking still requires the founder's live Cal.com account and a real "Free Audit Call" 30-min event type wired into `siteConfig.calLink`; this is an existing NEEDS-FOUNDER launch blocker (D-01/D-04/D-05, tracked since Plan 01) resolved in Plan 06's launch checklist, not introduced by this plan.

## Next Phase Readiness
- `/book` is fully built and reachable from every `<BookCta>` instance already wired in Plan 02's layout shell (header, footer, sticky mobile bar)
- The Cal.com embed pattern (isolated Client Component, single-source theme, siteConfig-driven identity) is established for any future third-party client-only widget
- No blockers — `npx next build` exits 0, all Task 1/Task 2 acceptance criteria verified directly against file contents
- Remaining Phase 1 plans (04-06: home page, about page, services page) can now link to a real, working `/book` route instead of a placeholder

## Self-Check: PASSED

All claimed files verified present (src/components/cal-embed.tsx, src/app/book/page.tsx, this SUMMARY.md). Both claimed commit hashes (d0b630e, 0625709) verified present in git log.

---
*Phase: 01-marketing-foundation*
*Completed: 2026-07-19*
