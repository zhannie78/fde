---
status: complete
---

# Quick Task 260721-bwa: Graph-paper visual polish for ROI calculator box

Replaced `.calculator-box`'s single-weight grey grid + flat 1px border (src/app/globals.css) with:
- A two-tier grid: faint 14px minor ruling + bolder 56px major ruling, both tinted with the site's
  existing `--primary` indigo (#3552FF) instead of the neutral `--border` grey — reads as authentic
  blueprint/engineering-pad ruling and ties the decorative grid directly to the brand accent.
- A layered elevation box-shadow (contact shadow + soft ambient shadow) replacing the flat border as
  the primary edge treatment, so the white `--card` box visually lifts off the warm-paper `--background`
  page like a physical sheet resting on a desk.
- `border-radius: 14px` left untouched — no new radius token introduced (respects the codebase's
  existing SITE-06 anti-pattern gate comment on the shared `--radius` system). Deliberately skipped a
  torn-edge/dog-ear treatment for the same reason — one restrained signature change (grid + shadow), not
  a pile of skeuomorphic paper gimmicks.

**Verification:** `npm run build` passes; dev server confirmed serving the page at 200 with the updated
source in place.

**Files touched:** `src/app/globals.css` (single rule replacement, ~15 lines).
