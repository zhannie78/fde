---
phase: quick-260720-op6
plan: 01
subsystem: ui
tags: [motion, glow-effect, cta, book-cta]
provides:
  - GlowButton client component (src/components/ui/glow.tsx) wrapping the project Button in an animated rotating conic-gradient glow
  - BookCta opt-in `glow?: boolean` prop
  - Hero and FinalCta "Book Your Free Audit Call" buttons rendering with the animated glow
affects: [05-fde-landing-page]
tech-stack:
  added: [motion (npm package, formerly framer-motion)]
  patterns: ["GlowButton wraps Button/asChild/Slot passthrough", "mode=rotate conic-gradient animated via Framer Motion animate prop"]
key-files:
  created: [src/components/ui/glow.tsx]
  modified: [src/components/book-cta.tsx, src/components/sections/hero.tsx, src/components/sections/final-cta.tsx, package.json, package-lock.json]
key-decisions:
  - "Glow mode defaults to rotate (not breathe) per explicit user follow-up requesting a visibly circling/orbiting glow; duration set to 3.5s so the rotation reads clearly without looking like a loading spinner."
  - "Glow color duotone kept to the existing single accent (#1F6E4A / #3DBD82) to respect the project's single-accent-color design discipline — no new hue introduced."
duration: ~15min
completed: 2026-07-20
---

# Quick Task 260720-op6: Animated Glow-Effect CTA Button Summary

**Added a rotating conic-gradient glow (green duotone, 3.5s rotation) behind the Hero and FinalCta "Book Your Free Audit Call" buttons via a new opt-in GlowButton component, leaving all five other BookCta placements unchanged.**

## Performance
- **Duration:** ~15 min
- **Tasks:** 2/2 complete
- **Files modified:** 6 (1 created, 5 modified — including package.json/package-lock.json)

## Accomplishments
- Installed `motion` (the maintained successor to `framer-motion`) as the animation dependency.
- Created `src/components/ui/glow.tsx`: a `"use client"` component with a `GlowEffectLayer` internal helper (blur presets, mode-keyed Framer Motion animation map covering `rotate`, `pulse`, `breathe`, `colorShift`, `flowHorizontal`, `static`) and an exported `GlowButton` that layers the animated glow behind the project's existing `Button`, forwarding `variant`/`size`/`asChild`/`disabled` and adding a `whileHover`/`whileTap` spring scale interaction.
- Default glow mode is `"rotate"` with `duration: 3.5` and colors `["#1F6E4A", "#3DBD82"]` — per explicit instruction, NOT the originally-drafted `"breathe"` default, because the user asked for the glow to visibly circle the button.
- Added an optional `glow?: boolean` prop to `BookCta`. When `true`, it renders through `GlowButton`; when false/undefined (the default), it renders the exact same plain `Button` as before — byte-for-byte unchanged behavior for every other call site.
- Set `glow` on exactly the two highest-impact placements: `Hero` and `FinalCta`. All other call sites (`site-header.tsx`, `mobile-nav.tsx`, `site-footer.tsx`, `sticky-cta-bar.tsx`, `roi-calculator.tsx`, `offer.tsx`) remain untouched, verified via grep — no `glow` attribute present on any of them.
- `npx tsc --noEmit` and `npm run build` (Next.js 16.2.10, Turbopack) both pass cleanly.

## Task Commits
1. **Task 1: Install motion and create the GlowButton component** - `912c284`
2. **Task 2: Add glow prop to BookCta and opt in Hero + FinalCta** - `b21b7f7`

## Files Created/Modified
- `src/components/ui/glow.tsx` - New GlowEffectLayer + GlowButton component; rotate-mode animated conic-gradient glow behind an inner project Button.
- `src/components/book-cta.tsx` - Added `glow?: boolean` prop; branches to `GlowButton` when true, otherwise unchanged plain `Button` path.
- `src/components/sections/hero.tsx` - `<BookCta />` → `<BookCta glow />`.
- `src/components/sections/final-cta.tsx` - `<BookCta />` → `<BookCta glow />`.
- `package.json` / `package-lock.json` - Added `motion` dependency.

## Deviations from Plan

**1. [Instructed deviation — user follow-up, not a Rule 1-4 auto-fix] Default mode changed from `"breathe"` to `"rotate"`, duration from 5 to 3.5**
- **Found during:** Task 1
- **Issue:** The plan's ground-truth code block (drafted before a later user follow-up) showed `mode = "breathe"` and `duration = 5` as the `GlowEffectLayer`/`GlowButton` defaults. The plan's own prose explicitly instructed overriding both to `"rotate"` and `3.5` respectively, per the user's request that the glow visibly circle/orbit the button.
- **Fix:** Both function signature defaults in `src/components/ui/glow.tsx` (`GlowEffectLayer` and `GlowButton`) use `mode = "rotate"` and `duration = 3.5`. This was called out in the plan constraints as deliberate, not a contradiction — documented here for traceability.
- **Files modified:** `src/components/ui/glow.tsx`
- **Commit:** `912c284`

**2. [Type-safety adjustment, not in plan's literal code excerpt]**
- **Found during:** Task 1 verification (`npx tsc --noEmit`)
- **Issue:** The internal `animations` map in `GlowEffectLayer` was initially typed as `Record<GlowMode, Record<string, unknown>>`, which is not structurally assignable to Framer Motion's `animate` prop type (`TargetAndTransition`).
- **Fix:** Imported `TargetAndTransition` from `motion/react` and retyped the map as `Record<GlowMode, TargetAndTransition>`. No behavior change — purely a type annotation fix required for `tsc --noEmit` to pass cleanly, in line with Rule 1 (auto-fix bugs/type errors).
- **Files modified:** `src/components/ui/glow.tsx`
- **Commit:** `912c284`

No other deviations. Plan's core structure (files touched, prop shape, call-site scope) executed exactly as written.

## Known Stubs
None. Both `GlowEffectLayer` and `GlowButton` are fully wired — no placeholder data, no empty defaults reaching the UI.

## Threat Flags
None. This task adds a purely presentational client-side animation component with no new network endpoints, auth paths, file access, or schema changes.

## Next Phase Readiness
No blockers. This was a standalone quick task; Phase 6 (visual redesign) planning is unaffected and can proceed independently. The `GlowButton` component is reusable if future work wants to extend the glow effect to additional CTAs.

## Self-Check: PASSED
- FOUND: src/components/ui/glow.tsx
- FOUND: .planning/quick/260720-op6-integrate-an-animated-glow-effect-cta-bu/260720-op6-SUMMARY.md
- FOUND commit: 912c284
- FOUND commit: b21b7f7
