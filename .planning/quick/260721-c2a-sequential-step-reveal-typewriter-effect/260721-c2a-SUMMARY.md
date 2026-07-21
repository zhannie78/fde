---
status: complete
---

# Quick Task 260721-c2a: Sequential step reveal + typewriter on Build & Deploy

Wired two new effects into the existing Act-5 GSAP scroll-story (scroll-story-provider.tsx), following
the file's established `ScrollTrigger.batch` / `gsap.matchMedia()` pattern:

1. **Sequential step load**: `[data-process-step]` (already present on each `<li>` but previously
   unused) now fades/slides in via `ScrollTrigger.batch` with a 0.35s stagger, so the three "How It
   Works" steps visibly appear one after another instead of all at once.
2. **Typewriter on "Build & Deploy"**: added a `typewriter: true` flag to that one entry in
   process-transparency.tsx's `steps` array, which wraps its title in `<span data-typewriter>`. GSAP's
   `TextPlugin` (free since gsap 3.13, bundled in the installed 3.15) animates that span's text from ""
   to the full string, reading the target text off the DOM at effect-setup time (same technique the
   existing Act 3a count-up already uses to capture its numeral suffix) rather than hardcoding the copy
   in the animation file. A blinking `--lime` cursor (new `.typewriter-cursor` + `@keyframes
   typewriter-blink` in globals.css) sits next to it; it's neutralized automatically by the project's
   existing global `prefers-reduced-motion: reduce` override, and is invisible until its parent `<li>`
   has faded in via effect (1).

Both new effects live only inside the existing `no-preference` matchMedia branch — the `reduce` branch
is untouched, so reduced-motion visitors still see the fully static, immediately-readable section
(DSGN-03 invariant preserved).

**Verification:** `npx tsc --noEmit` and `npm run build` both pass; SSR output for `/` confirmed
`data-process-step` (x3), `data-typewriter`, and `typewriter-cursor` all render correctly.

**Files touched:** `src/components/sections/process-transparency.tsx`,
`src/components/scroll-story-provider.tsx`, `src/app/globals.css`.
