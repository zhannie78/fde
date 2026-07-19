---
phase: 01-marketing-foundation
plan: 01
subsystem: infra
tags: [nextjs, tailwind, shadcn, radix, fonts, design-tokens, calcom]

# Dependency graph
requires: []
provides:
  - "Buildable Next.js 16 (App Router, Turbopack, src/) + Tailwind v4 + TypeScript scaffold"
  - "shadcn initialized (radix-nova preset, baseColor neutral) with button/card/badge/navigation-menu/sheet/separator/skeleton primitives"
  - "@calcom/embed-react installed (the correct package, not the nonexistent @calcom/react-widget)"
  - "UI-SPEC 60/30/10 design tokens (warm paper / ink navy / signal green) as the globals.css theme source"
  - "Fraunces (headings) + IBM Plex Sans (body) self-hosted via next/font/google, no Geist anywhere"
  - "src/config/site.ts: single typed siteConfig module (D-06) with flagged NEEDS-FOUNDER placeholders"
  - "public/founder-placeholder.svg: obvious temporary founder-photo placeholder (D-07)"
affects: [01-02, 01-03, 01-04, 01-05, 01-06]

# Tech tracking
tech-stack:
  added:
    - "next@16.2.10 (App Router, Turbopack, src-dir)"
    - "react@19.2.4 / react-dom@19.2.4"
    - "tailwindcss@4.3.3"
    - "shadcn@4.13.1 CLI (radix-nova preset, not an npm runtime dependency)"
    - "@calcom/embed-react@1.5.3"
    - "lucide-react (installed automatically by shadcn init)"
  patterns:
    - "Design tokens live as CSS custom properties in src/app/globals.css :root, re-exposed via @theme inline — override the CLI-generated preset, don't hand-roll from scratch"
    - "Single typed siteConfig module (src/config/site.ts) as the only place founder-identity values are defined; all NEEDS-FOUNDER values are obvious placeholders with inline decision-ID comments"
    - "Headings default to font-heading (Fraunces) + font-semibold via a @layer base h1-h6 rule, so individual components don't need to repeat font classes"

key-files:
  created:
    - src/config/site.ts
    - public/founder-placeholder.svg
    - components.json
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - package.json
    - next.config.ts

key-decisions:
  - "Used shadcn's corrected CLI (`init -b radix -p nova`) per RESEARCH Critical Pitfall #1, not the UI-SPEC's stale `-b neutral -s new-york` command — verified components.json output matches research's ground-truth (radix-nova style, neutral baseColor)"
  - "Scaffolded create-next-app in a temp directory and rsync'd generated files into the existing repo (excluding .git, node_modules, .next, and the generated stub CLAUDE.md) to avoid clobbering the project's real CLAUDE.md and .planning/ directory"
  - "Kept AGENTS.md (Next.js 16's scaffold-generated agent-rules file) since it's harmless and documents Next.js 16 breaking-change awareness for future agents"

patterns-established:
  - "Design-token override pattern: shadcn init output is a throwaway starting point, immediately overridden with UI-SPEC's exact hex values in a single dedicated pass"
  - "NEEDS-FOUNDER placeholder pattern: every founder-identity value ships as an obvious, non-real placeholder string with an inline comment citing its decision ID (D-04/D-05/D-07/D-13)"

requirements-completed: [SITE-05, SITE-06]

# Metrics
duration: 6min
completed: 2026-07-19
---

# Phase 1 Plan 1: Design System Foundation Summary

**Next.js 16 + Tailwind v4 + shadcn (radix-nova) scaffold themed with the UI-SPEC's warm-paper/ink-navy/signal-green palette, Fraunces + IBM Plex Sans fonts, and a single typed `siteConfig` identity module.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-07-19T17:46:48Z
- **Completed:** 2026-07-19T17:52:17Z
- **Tasks:** 2 completed
- **Files modified:** 31 (27 created in Task 1, 4 created/modified in Task 2)

## Accomplishments
- Buildable Next.js 16 + Tailwind v4 + TypeScript scaffold (`npx next build` exits 0, zero font/token errors)
- shadcn initialized with the CLI's current (July 2026) flag shape — `radix-nova` style, `neutral` baseColor — matching the UI-SPEC's underlying intent even though the CLI's literal preset labels changed
- All seven UI-SPEC primitives installed: button, card, badge, navigation-menu, sheet, separator, skeleton
- `@calcom/embed-react` installed (verified real package, not the hallucinated `@calcom/react-widget`)
- Full UI-SPEC 60/30/10 color system and single restrained radius now the `globals.css` theme source, with the CLI's Nova/Geist defaults completely overridden
- Fraunces (headings, variable font) + IBM Plex Sans (body, weight 400/600) loaded via `next/font/google`, zero occurrences of Geist remaining
- `src/config/site.ts` created as the single source of truth for founder-identity values, per D-06
- `public/founder-placeholder.svg` created as an unmistakably temporary founder-photo placeholder, per D-07

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 16 + shadcn (corrected CLI) + Cal.com package** - `9c0bba7` (feat)
2. **Task 2: Apply UI-SPEC design tokens, fonts, and the siteConfig identity module** - `bc1c7b5` (feat)

**Plan metadata:** (final commit follows this SUMMARY)

## Files Created/Modified
- `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `.gitignore`, `AGENTS.md`, `README.md` - standard `create-next-app` scaffold output
- `components.json` - shadcn config: `radix-nova` style, `neutral` baseColor, confirming Radix primitives per UI-SPEC
- `src/app/globals.css` - UI-SPEC 60/30/10 palette (`#FAF9F6`/`#1A2432`/`#1F6E4A`/`#101820`/`#B3261E`), single `--radius: 0.5rem`, `--font-heading`/`--font-sans` repointed to Fraunces/IBM Plex Sans, `--on-dark` (`#F5F3EE`) supporting token, `h1-h6` default to `font-heading font-semibold`
- `src/app/layout.tsx` - Fraunces (variable, `opsz` axis) + IBM Plex Sans (`weight: ["400","600"]`) via `next/font/google`, replacing CLI-injected Geist fonts; updated page metadata (title/description)
- `src/config/site.ts` - `siteConfig` typed module: name, founderName, founderEmail, region, domain, calLink, calNamespace — all NEEDS-FOUNDER values flagged with decision-ID comments
- `public/founder-placeholder.svg` - labeled "FOUNDER PHOTO — REPLACE BEFORE LAUNCH" placeholder
- `src/components/ui/{button,card,badge,navigation-menu,separator,skeleton,sheet}.tsx` - shadcn-generated primitives
- `src/lib/utils.ts` - shadcn-generated `cn()` helper

## Decisions Made
- Followed RESEARCH's corrected shadcn CLI command (`init -b radix -p nova`) instead of the UI-SPEC's stale, now-invalid `-b neutral -s new-york` — this was explicitly flagged in RESEARCH as Critical Pitfall #1 and pre-approved by the plan itself, not a deviation
- Scaffolded in a temp directory then merged into the existing repo via `rsync`, excluding `.git`/`node_modules`/`.next`/the generated stub `CLAUDE.md`, to avoid clobbering the project's real `CLAUDE.md` and `.planning/` directory — this was anticipated by the plan's own action text ("If create-next-app refuses due to existing files, scaffold in a temp dir and move generated files in")

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Isolated npm cache to work around a pre-existing permission conflict**
- **Found during:** Task 1 (initial scaffold attempt)
- **Issue:** The shared global npm cache (`~/.npm/_cacache`) contained a root-owned file from a prior `sudo` npm invocation outside this session, causing `EACCES: permission denied` during `create-next-app`'s dependency install
- **Fix:** Set `npm_config_cache` to an isolated directory under the session scratchpad for the scaffold, install, and shadcn/Cal.com install commands — did not modify or attempt to `sudo`-fix the shared system npm cache
- **Files modified:** none (environment-only workaround, no repo files affected)
- **Verification:** `npm install`, `shadcn init`, and `npm install @calcom/embed-react` all completed successfully afterward
- **Committed in:** N/A (no repo change; purely an install-time environment workaround)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** No scope creep — purely an environment workaround to let the planned install commands succeed. No package substitutions were made; the exact packages/versions the plan specified were installed.

## Issues Encountered
- Root-owned file in the shared npm cache blocked the first scaffold attempt (see Deviations above) — resolved by pointing `npm_config_cache` at an isolated directory for this session's install commands, no changes to the shared system cache.

## User Setup Required
None - no external service configuration required. All NEEDS-FOUNDER placeholders (founder name, email, region, domain, Cal.com link, founder photo) are flagged in `src/config/site.ts` and `public/founder-placeholder.svg` for resolution before launch (tracked as launch-checklist items per D-04/D-05/D-07/D-13, per the phase's later plans).

## Next Phase Readiness
- The design-system foundation (fonts, colors, radius, shadcn primitives, siteConfig) is locked and ready for 01-02 (routes/pages) to build on
- No blockers — `npx next build` exits 0, all Task 1/Task 2 acceptance criteria verified directly against the file contents
- Downstream plans (01-02 through 01-06) can now import `siteConfig`, use the seven installed shadcn primitives, and rely on `font-heading`/`font-sans` utilities without redefining any tokens

---
*Phase: 01-marketing-foundation*
*Completed: 2026-07-19*
