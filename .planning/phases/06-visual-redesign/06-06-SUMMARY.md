---
phase: 06-visual-redesign
plan: 06
subsystem: ui
tags: [gsap, scrolltrigger, use-gsap, reduced-motion, client-boundary]

# Dependency graph
requires:
  - phase: 06-visual-redesign (plans 01-03)
    provides: 60/30/10 indigo palette + JetBrains Mono tokens (06-01); hero-section/hero-lede, thefix-section/data-thefix-card, outcomes-section/data-outcome-card/stat-numeral/data-countup, roi-calculator-section selector hooks (06-02); offer-section/data-offer-card/data-offer-lead, process-section/data-process-step/process-progress-line, finalcta-section/finalcta-panel selector hooks (06-03)
provides:
  - Installed gsap@3.15.0 + @gsap/react@2.1.2 (post human-verify package-legitimacy checkpoint)
  - "src/components/scroll-story-provider.tsx — the single `\"use client\"` ScrollStoryProvider housing all 5-act ScrollTrigger choreography"
  - "src/app/page.tsx wired to wrap all 7 homepage sections in ScrollStoryProvider"
affects: [07]

# Tech tracking
tech-stack:
  added:
    - "gsap@3.15.0"
    - "@gsap/react@2.1.2"
  patterns:
    - "Single 'use client' scoped useGSAP({ scope: containerRef }) wrapper targeting sibling Server Components by selector text (className/data-*), never by ref — no section component gained \"use client\""
    - "gsap.matchMedia() with a no-preference branch (all 5 acts) and a reduce branch that creates zero ScrollTrigger instances (DSGN-03 hard gate)"
    - "ScrollTrigger.batch() for multi-card stagger effects (TheFix cards, non-lead Offer cards) to keep live ScrollTrigger instance count low (INP budget)"
    - "will-change scoped to active tween only via onStart/onComplete (TheFix batch), never left globally set"

key-files:
  created:
    - src/components/scroll-story-provider.tsx
  modified:
    - package.json
    - package-lock.json
    - src/app/page.tsx

key-decisions:
  - "Count-up tween (Act 3a) queries all [data-countup][data-countup-to] elements generically via document.querySelectorAll inside the useGSAP effect (scoped to containerRef's lifecycle via useGSAP's own cleanup) rather than hardcoding the single current Outcomes lead stat, so future data-countup additions need no scroll-story-provider.tsx changes — captures and preserves any non-numeric suffix (e.g. a trailing '+') already present in the element's text before starting the tween."
  - "RoiCalculator's one-shot fade/scale-in (Act 3b) triggers off '.roi-calculator-section' itself at start: \"top 70%\", end: \"top 55%\" as the +0.15s-equivalent offset from the Act-3a count-up's own 'top 70%' trigger, per the plan's 'offset ~+0.15s' instruction — implemented as a distinct scroll-position offset rather than a literal timeline delay since RoiCalculator's trigger is a different DOM element than the count-up's own trigger element."
  - "Offer's asymmetric stagger (Act 4) uses two separate ScrollTrigger registrations — a single gsap.from on '[data-offer-lead]' (translateX only) plus a ScrollTrigger.batch on '[data-offer-card]:not([data-offer-lead])' (translateY, staggered) — rather than one combined timeline, since the two groups need different transform axes and the :not() selector cleanly excludes the lead card from the batch without needing a second data attribute."
  - "ProcessTransparency's scrub-fill (Act 5a) uses gsap.fromTo with scaleX 0->1 and transformOrigin: \"left center\" against the single process-progress-line element from 06-03 (a plain div, not an SVG/canvas line), matching that plan's 'single provider-scaled element' implementation choice."

requirements-completed: [DSGN-02, DSGN-03, DSGN-04]

# Metrics
duration: ~2min (continuation from human-approved package-legitimacy checkpoint)
completed: 2026-07-20
---

# Phase 6 Plan 06: Scroll-Driven Storytelling Layer Summary

**Installed gsap@3.15.0 + @gsap/react@2.1.2 post-approval and built the single `"use client"` ScrollStoryProvider housing the full 5-act ScrollTrigger choreography (Hero parallax, TheFix stagger, Outcomes count-up + RoiCalculator fade-in, Offer asymmetric stagger, ProcessTransparency scrub-fill + FinalCta scale-in), gated hard behind `gsap.matchMedia()` so `prefers-reduced-motion: reduce` visitors get zero ScrollTrigger instances — all six restyled section components remain Server Components.**

## Performance

- **Duration:** ~2 min of active execution this session (Task 1's package-legitimacy checkpoint was reached and approved by the human in a prior session; this session resumed at "Approved — install and continue")
- **Completed:** 2026-07-20
- **Tasks:** 3/3 completed
- **Files modified:** 3 (`package.json`, `package-lock.json`, `src/app/page.tsx`), 1 created (`src/components/scroll-story-provider.tsx`)

## Accomplishments

- **Task 1 (checkpoint, pre-approved):** Package-legitimacy human-verify checkpoint for `gsap`/`@gsap/react` — approved by the human ("Approved — install and continue"), citing npm registry verification against the official `github.com/greensock/GSAP` and `greensock/react` source repos, maintainer `greensock`, and the GreenSock Standard no-charge license permitting free commercial use.
- **Task 2:** Ran `npm install gsap@3.15.0 @gsap/react@2.1.2` (installed as `^3.15.0`/`^2.1.2` in `package.json`, exact versions confirmed via `npm ls`). Built `src/components/scroll-story-provider.tsx` — a `"use client"` component exporting `ScrollStoryProvider({ children })` that wraps a `containerRef`'d `<div className="contents">` around its children and runs all GSAP setup inside `useGSAP(() => {...}, { scope: containerRef })`. `gsap.matchMedia()` gates every effect: the `no-preference` branch implements all 5 acts against the exact selector hooks documented in the plan's `<interfaces>` block; the `reduce` branch is intentionally empty (zero `ScrollTrigger` instances created).
- **Task 3:** Wired `src/app/page.tsx` to import `ScrollStoryProvider` and wrap the existing 7 sections (unchanged order: Hero → TheFix → Outcomes → RoiCalculator → Offer → ProcessTransparency → FinalCta), replacing the bare `<>...</>` fragment. `page.tsx` stays a Server Component (no `"use client"` added). `npm run build` completes successfully.

## Task Commits

Each task was committed atomically (Task 1's checkpoint approval carries no code commit — the install/build work is Task 2):

1. **Task 2: Install GSAP and build ScrollStoryProvider** - `8851fd0` (feat)
2. **Task 3: Wrap homepage sections in ScrollStoryProvider** - `3ff7e43` (feat)

_No TDD tasks in this plan — GSAP wiring is new client-side choreography logic with no test harness in scope for this phase (per plan; DSGN-04's actual CWV numbers are verified in plan 07 via Lighthouse, not unit tests here)._

## Files Created/Modified

- `src/components/scroll-story-provider.tsx` (NEW) — `"use client"` `ScrollStoryProvider`, houses all 5-act `useGSAP`/`ScrollTrigger`/`gsap.matchMedia()` choreography
- `src/app/page.tsx` — imports and wraps all 7 sections in `ScrollStoryProvider`, order unchanged, stays a Server Component
- `package.json` / `package-lock.json` — adds `gsap@^3.15.0`, `@gsap/react@^2.1.2` dependencies

## Decisions Made

- Count-up tween queries `[data-countup][data-countup-to]` generically (not hardcoded to the current single Outcomes lead stat) so future stats tagged the same way animate automatically with no `scroll-story-provider.tsx` edits; preserves any non-numeric suffix already in the element's text (e.g. a trailing unit) before the tween starts writing integers.
- RoiCalculator's one-shot fade/scale-in (Act 3b) is offset from the count-up trigger via a later scroll-position threshold (`start: "top 70%"` on its own section vs. the count-up's `top 70%` on the stat element) rather than a literal `+0.15s` timeline delay, since the two triggers are different DOM elements with independent scroll positions.
- Offer's asymmetric stagger (Act 4) uses two independent registrations — one `gsap.from` for `[data-offer-lead]` (translateX) and one `ScrollTrigger.batch` for `[data-offer-card]:not([data-offer-lead])` (translateY, staggered) — since the two groups animate on different axes and `:not()` cleanly excludes the lead card without a second selector hook.
- ProcessTransparency's scrub-fill (Act 5a) uses `scaleX: 0 -> 1` with `transformOrigin: "left center"` against 06-03's single-element `.process-progress-line` implementation (confirmed by reading `process-transparency.tsx` — a plain scalable `div`, not a two-element line+fill pair).

## Deviations from Plan

None - plan executed exactly as written. Task 1's checkpoint approval and its "approved package versions/rationale" were supplied directly in this session's objective (continuation from a prior checkpoint pause), so no additional human-verify round was needed before proceeding to `npm install`.

## Issues Encountered

None. `npx tsc --noEmit`, `npx eslint` on both modified/created files, and `npm run build` all passed on first attempt.

## User Setup Required

None - no external service configuration required. The npm install itself was the one action gated behind human approval, and that approval was already granted per this session's objective.

## Known Stubs

None. All 5 acts are wired against real, already-landed selector hooks (confirmed by reading `hero.tsx`, `the-fix.tsx`, `outcomes.tsx`, `offer.tsx`, `process-transparency.tsx`, `final-cta.tsx`, `roi-calculator.tsx` before implementation) — no placeholder data or unwired effects.

## Threat Flags

None. `T-06-SC` (npm supply-chain tampering) was mitigated exactly per the plan's threat register — the blocking human-verify checkpoint was approved with explicit npm-registry/GitHub-org verification before install, and both packages install with no postinstall scripts (confirmed: only pre-existing transitive deps `sharp`/`unrs-resolver` triggered npm's install-script warning, unrelated to this plan's new dependencies). `T-06-12`/`T-06-13` (INP/reduced-motion DoS) are mitigated by `ScrollTrigger.batch()` usage, scoped `will-change`, transform/opacity-only tweens, and the hard `matchMedia` reduce-branch gate — full DSGN-04 numeric confirmation is deferred to plan 07's Lighthouse CI gate per this plan's own `<verification>` section.

## Next Phase Readiness

- All 3 tasks complete: GSAP installed post-approval, `ScrollStoryProvider` built with the full 5-act choreography and a hard reduced-motion gate, `page.tsx` wired and building successfully.
- Plan 07 (DSGN-04 CWV verification via `@lhci/cli`, per RESEARCH.md) can now measure the real bundle/CWV impact of this animation layer against production-representative content.
- No blockers carried forward.

---
*Phase: 06-visual-redesign*
*Completed: 2026-07-20*

## Self-Check: PASSED

All created/modified files (`src/components/scroll-story-provider.tsx`, `src/app/page.tsx`) and both task commits (`8851fd0`, `3ff7e43`) verified present in the working tree and git history.
