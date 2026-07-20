---
phase: 06-visual-redesign
plan: 03
subsystem: ui
tags: [tailwind-v4, gsap-hooks, glow-box, elevated-cta, design-tokens]

# Dependency graph
requires:
  - phase: 06-visual-redesign (plan 01)
    provides: GlowBox/ElevatedCta Server Component primitives, 60/30/10 indigo palette tokens (--secondary ink, --accent-soft, --lime), JetBrains Mono font-bold/leading-1.75 conventions
provides:
  - Offer restyled to asymmetric glow-box pricing cards with data-offer-card/data-offer-lead GSAP hooks
  - ProcessTransparency dark band updated with lime on-dark step labels, process-progress-line scrub-fill target, data-process-step hooks
  - FinalCta restyled to a light accent-soft 20px-radius inset panel using ElevatedCta (replacing the dark BookCta glow panel)
  - Stable, nav-anchor-distinct GSAP selector-hook classNames (offer-section, process-section, finalcta-section/finalcta-panel) for plan 06's motion wiring
affects: [06-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "GlowBox content wrapping: className prop on GlowBox sizes/positions the outer .glow-box wrapper only; actual content + padding/gap must live in an inner <div className=\"p-8 ...\"> inside GlowBox's children (glow-box-inner has no built-in padding) — same pattern established by the-fix.tsx in 06-02."
    - "On-dark label color swap: indigo (--primary/--accent) is swapped for --lime specifically on the ProcessTransparency dark band only, per the UI-SPEC's low-contrast-on-near-black rule; every other section keeps indigo."

key-files:
  created: []
  modified:
    - src/components/sections/offer.tsx
    - src/components/sections/process-transparency.tsx
    - src/components/sections/final-cta.tsx

key-decisions:
  - "process-progress-line implemented as a single provider-scaled element (2px var(--border) line, full width, overflow:hidden) rather than a line + separate accent fill child — plan explicitly allowed either option; a single scalable element is less markup for plan 06 to wire via scaleX/width tween."
  - "data-offer-card / data-offer-lead placed on the <li> (not the inner GlowBox), matching this plan's interface contract wording exactly (\"each pricing <li> gets data-offer-card\")."

requirements-completed: [DSGN-01]

# Metrics
duration: 12min
completed: 2026-07-20
---

# Phase 6 Plan 03: Lower-Half Section Restyle Summary

**Offer, ProcessTransparency, and FinalCta restyled onto the Phase 6 glow-box/elevated-CTA system with the exact GSAP selector-hook contract (data-offer-card/-lead, process-progress-line, finalcta-panel) plan 06 will target for Acts 4-5 choreography.**

## Performance

- **Duration:** ~12 min
- **Completed:** 2026-07-20
- **Tasks:** 3/3 completed
- **Files modified:** 3

## Accomplishments
- Offer's three pricing steps now render inside `GlowBox` (hover-backlight card language), keeping the locked asymmetric `1.6fr/1fr/1fr` layout and scope-qualified pricing copy verbatim, with `data-offer-card`/`data-offer-lead` hooks ready for plan 06's asymmetric stagger-in
- ProcessTransparency stays the dark full-bleed ink band (`bg-secondary`/`text-secondary-foreground`, now resolving to `#0C0C0D`/`#F4F3EE` via 06-01's tokens) but step-number labels swapped from low-contrast indigo to `var(--lime)`, and a new `.process-progress-line` target element is in place for the scrub-fill ScrollTrigger effect
- FinalCta flipped from the dark `bg-secondary` panel + `BookCta glow` to a light `bg-[var(--accent-soft)]` 20px-radius inset panel with the shared `ElevatedCta` (the exact static dual-glow + shine-sweep button also destined for the About page's final CTA), with no `overflow-hidden` so the button's -26px ambient halo doesn't clip
- All three sections carry their target root classNames (`offer-section`, `process-section`, `finalcta-section`/`finalcta-panel`) distinct from the pre-existing `#offer`/`#process`/`#cta` nav-anchor ids, so plan 06 can hook GSAP without colliding with in-page nav scrolling
- Every touched heading/body element moved from `font-semibold`/`leading-[1.6]` to `font-bold`/`leading-[1.75]` per the JetBrains Mono two-weight system locked in 06-01

## Task Commits

Each task was committed atomically:

1. **Task 1: Restyle Offer as glow-box asymmetric pricing cards** - `1429392` (feat)
2. **Task 2: Restyle ProcessTransparency dark band + add scrub progress line** - `a261a6f` (feat)
3. **Task 3: Restyle FinalCta as elevated light-panel CTA** - `3e597fb` (feat)

_No TDD tasks in this plan — pure JSX/CSS restyle work, no new behavior/logic._

## Files Created/Modified
- `src/components/sections/offer.tsx` - Wrapped each pricing `<li>` in `GlowBox` (content in an inner `p-8` div per the established GlowBox-content pattern), added `offer-section` root token and `data-offer-card`/`data-offer-lead` hooks, `font-bold`/`leading-[1.75]`
- `src/components/sections/process-transparency.tsx` - Added `process-section` inner-container token, `data-process-step` per-step hooks, a new `.process-progress-line` target element, swapped step-number label color from indigo to `var(--lime)` on the dark band, `font-bold`/`leading-[1.75]`
- `src/components/sections/final-cta.tsx` - Replaced the dark `bg-secondary` panel + `BookCta glow` with a light `bg-[var(--accent-soft)]` 20px-radius panel + `ElevatedCta`, added `finalcta-section`/`finalcta-panel` tokens, removed the unused `BookCta` import, `font-bold`/`leading-[1.75]`

## Decisions Made
- Followed the exact GlowBox-content pattern established in 06-02's `the-fix.tsx`: `GlowBox`'s `className` prop only reaches the outer `.glow-box` wrapper (per its own doc comment), so all layout/padding/gap for Offer's card content lives in an inner `<div className="p-8 ...">` rendered as GlowBox's child, not passed via the `className` prop.
- Implemented `process-progress-line` as one provider-scalable element (thin `var(--border)` line, `overflow: hidden`) rather than a line-plus-fill-child pair — the plan explicitly permitted either shape ("a single element the provider scales"), and this is the smaller surface for plan 06 to wire a `scaleX`/`width` ScrollTrigger tween against.
- Placed `data-offer-card`/`data-offer-lead` on the `<li>` elements per this plan's interface contract's literal wording, rather than on the inner `GlowBox` (which is how 06-02's `data-thefix-card` was placed) — the two plans specify different host elements for their hooks and each was followed as written.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The sandboxed shell's `grep` is aliased to `ugrep -G` (BRE mode) via a Claude Code shell snapshot function, which mis-handles the literal pattern `Under \$10k` mid-string (treats a non-terminal `$` as an anchor in a way GNU grep/`/usr/bin/grep` does not) and reports a false non-match. Confirmed the actual file content is correct and byte-identical to the required string via `/usr/bin/grep`, `grep -F`, and direct inspection (`od -c`) — this is a local shell-tooling quirk, not a code defect. All task verify gates were re-run with `/usr/bin/grep` and passed cleanly; `npx tsc --noEmit` and `npx eslint` on all three files also passed with no output.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All three lower-half sections now carry the exact selector-hook contract (`data-offer-card`, `data-offer-lead`, `.process-progress-line`, `data-process-step`, `.finalcta-panel`) that plan 06 (GSAP/ScrollTrigger wiring) needs for Acts 4-5 — no further DOM/className changes should be required before that plan's motion pass.
- `ElevatedCta` is now live on the homepage FinalCta exactly as the About page (06-05) will need to reuse it verbatim, per the "the two must match exactly" sketch finding.
- No blockers carried forward — `npx tsc --noEmit` and `npx eslint` both pass cleanly on all three modified files.

---
*Phase: 06-visual-redesign*
*Completed: 2026-07-20*

## Self-Check: PASSED

All modified files (`src/components/sections/offer.tsx`, `src/components/sections/process-transparency.tsx`, `src/components/sections/final-cta.tsx`) and all three task commits (`1429392`, `a261a6f`, `3e597fb`) verified present in the working tree and git history.
