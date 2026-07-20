---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: FDE Pivot
status: planning
last_updated: "2026-07-20T01:09:46.018Z"
last_activity: 2026-07-20
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-19)

**Core value:** A skeptical, non-technical SMB owner lands on the site, tries a demo or completes the free workflow audit, and comes away convinced enough to book an engagement.
**Current focus:** Phase 01 — marketing-foundation

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-07-20 — Milestone v2.0 started

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: - min
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01-marketing-foundation P01 | 6min | 2 tasks | 31 files |
| Phase 01 P02 | 4min | 2 tasks | 8 files |
| Phase 01 P03 | 3min | 2 tasks | 2 files |
| Phase 01-marketing-foundation P04 | 8min | 2 tasks | 8 files |
| Phase 01 P05 | 3min | 2 tasks | 4 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Reconciled research's 6-phase suggestion down to 4 phases to match "coarse" granularity — merged Claude infrastructure into the demo phase (Phase 2) rather than a standalone infra phase, and folded compliance content directly into vertical-page requirements (Phase 4) rather than a separate compliance pass.
- [Roadmap]: SITE-01 (homepage with embedded demo) assigned to Phase 2, not Phase 1, since the requirement is only fully satisfiable once the demo exists.
- [Phase 01-marketing-foundation]: Used corrected shadcn CLI (init -b radix -p nova) per RESEARCH Critical Pitfall #1 instead of UI-SPEC's stale -b neutral -s new-york command — produces radix-nova style + neutral baseColor, matching UI-SPEC intent under the current CLI shape
- [Phase 01-marketing-foundation]: Scaffolded create-next-app in a temp dir and rsync'd generated files into the existing repo, excluding .git/node_modules/.next/generated CLAUDE.md — avoids clobbering the project's real CLAUDE.md and .planning/ directory since create-next-app refuses to run in a non-empty directory
- [Phase 01]: Styled header/footer dark chrome using Plan 01's --secondary/--secondary-foreground design tokens rather than new hex literals
- [Phase 01]: MobileNav renders its own close button with aria-label="Close menu" instead of the shadcn Sheet default, since the primitive's default close control has no aria-label attribute
- [Phase 01-marketing-foundation]: Sized /book H1 at UI-SPEC Heading scale (28px), not Display (44px), to honor UI-SPEC's constraint that Display is reserved for the hero headline only
- [Phase 01-marketing-foundation]: Used inline clamp() style on the hero Display headline instead of a Tailwind arbitrary-value class — Tailwind cannot cleanly express a mixed-unit three-argument clamp(), and the plan's grep-based verification checks for the literal clamp(32px, 8vw, 44px) string
- [Phase 01-marketing-foundation]: Kept Outcomes lead-stat typography at 30px/36px, under the 44px Display size — Preserves the hero as the homepage's only Display-scale element per the SITE-06 focal-point constraint
- [Phase 01-marketing-foundation]: FounderStrip's bracketed biographical placeholders wrap the existing siteConfig.region NEEDS-FOUNDER value — Keeps D-13's no-invented-biography constraint centralized in one file rather than introducing new placeholder text
- [Phase 01-marketing-foundation]: FounderBlock renders on a full-bleed ink-navy band with an asymmetric two-column layout (photo ~42%, narrative ~58%) rather than a centered avatar bio-card — Satisfies UI-SPEC's explicit requirement that the founder credibility block not be a generic bio-card template
- [Phase 01-marketing-foundation]: ServiceSequence uses an asymmetric md:grid-cols-[1.6fr_1fr_1fr] layout, not grid-cols-3, so step 1 (Free Audit) gets the widest column and most copy — Matches RESEARCH Pattern 3 and the SITE-06 anti-pattern gate against a uniform 3-card grid
- [Phase 01-marketing-foundation]: FDE biographical narrative in FounderBlock ships as full sentences with inline bracketed NEEDS-FOUNDER placeholders for every unverifiable specific, rather than omitting the narrative — Keeps the About page shippable now while making clear which facts still need founder confirmation per D-13
- [Phase 01-marketing-foundation]: DNS ownership decided: cloudflare-dns — DNS stays hosted at Cloudflare, records point at Netlify (A/CNAME + www CNAME); free Cloudflare Email Routing serves as the D-05 founder-email path

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 2]: Research flags Netlify's Next.js Runtime v5 Server Actions/streaming support as MEDIUM confidence — verify early in Phase 2 planning before deep build-out.
- [Phase 4]: Vertical compliance language (HIPAA-adjacent for medical/dental, state-bar AI-disclosure for legal) needs a targeted research pass before content ships — current sourcing is general-pattern level, not jurisdiction-specific.
- [Phase 01-06] checkpoint:human-verify pending — founder must: create Netlify site + connect repo, create Cal.com Free Audit Call event + update calLink, purchase production domain + connect DNS at Cloudflare per cloudflare-dns decision + verify HTTPS, set up Cloudflare Email Routing + update founderEmail, replace founder-placeholder.svg + update founderName/region/domain, review copy on all 4 pages. See .planning/phases/01-marketing-foundation/LAUNCH-CHECKLIST.md

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-07-19T18:32:24.372Z
Stopped at: 01-06 Task 3 checkpoint:human-verify pending (LAUNCH-CHECKLIST.md created, cloudflare-dns decision recorded)
Resume file: 01-06-PLAN.md
