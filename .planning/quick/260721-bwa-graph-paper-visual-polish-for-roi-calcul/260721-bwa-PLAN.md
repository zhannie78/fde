---
phase: quick-260721-bwa
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/globals.css
autonomous: true
requirements: [QUICK-BWA-GRAPHPAPER]
must_haves:
  truths:
    - "The .calculator-box grid has two visually distinct line weights (minor + major), not a single flat grid"
    - "Grid lines are tinted with the site's indigo primary color, not the neutral --border grey"
    - "The box has a layered elevation shadow so it reads as a physical sheet resting on the warm-paper page background, not a flat bordered card"
    - "The existing single 14px border-radius token is unchanged (SITE-06 anti-pattern gate: no new radius values introduced)"
  artifacts:
    - path: "src/app/globals.css"
      provides: "Updated .calculator-box rule with two-tier indigo-tinted grid and elevation shadow"
      contains: ".calculator-box"
---

<objective>
Polish the ROI calculator's graph-paper background so it reads as an authentic sheet of graph/blueprint
paper resting on the page, instead of a flat bordered card with a single grey grid-line pattern.

Purpose: user feedback — "make the graph paper background of the calculator look nicer, maybe make the
edges of that box look like a sheet of actual graph paper."

Design decisions (made directly, not left to executor discretion):
1. Two-tier grid: minor lines every 14px (faint), major lines every 56px / every 4th minor line
   (bolder) — mirrors real engineering/drafting graph paper's minor+index-line hierarchy.
2. Grid lines tinted with the site's existing indigo primary (#3552FF) at low opacity, replacing the
   neutral --border grey — real graph/blueprint paper is commonly ruled in blue ink, and this ties the
   decorative grid directly to the brand accent already used elsewhere (text-primary, --ring, CTAs)
   instead of introducing an unrelated new color.
3. Replace the flat 1px --border outline with a subtler near-ink hairline (rgba(12,12,13,0.08)) plus a
   layered box-shadow (tight contact shadow + soft ambient shadow) so the white --card box visually
   lifts off the warm-paper --background (#FBFAF7 page vs #FFFFFF card is already the right two-tone
   relationship — the shadow is what was missing to sell "physical sheet" depth).
4. Deliberately did NOT add a torn-edge/dog-ear/rotation skeuomorphic treatment — the codebase's own
   comment marks --radius as a "SITE-06 anti-pattern gate, still a single restrained radius" system, so
   a corner-clip or extra radius would fight an existing design constraint. The elevation shadow +
   authentic ruled-grid tint is the single restrained "signature" change, not a pile of physical-paper
   gimmicks.

Output: `.calculator-box` in src/app/globals.css updated in place; no other files touch, no new
dependencies, no new design tokens (reuses existing --primary/--card/--background/--foreground values).
</objective>

<context>
Current rule (src/app/globals.css, lines ~419-430):
```css
/* ROI calculator — distinguished from surrounding prose as its own
   interactive widget: bordered card + a graph-paper grid background. */
.calculator-box {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 32px;
  background-color: var(--card);
  background-image:
    linear-gradient(to right, var(--border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border) 1px, transparent 1px);
  background-size: 28px 28px;
}
```
Used only in src/components/sections/roi-calculator.tsx:
`<div id="calculator" className="roi-calculator-section calculator-box mt-12">`

Design tokens in play (src/app/globals.css :root):
- `--background: #FBFAF7` (warm paper, page bg)
- `--card: #FFFFFF` (the box's own background — already brighter than the page, "sheet on a desk")
- `--foreground: #0C0C0D` (near-black ink)
- `--primary: #3552FF` (indigo accent, CTA-only elsewhere — now also reused for the grid's ink tint)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Two-tier indigo grid + elevation shadow on .calculator-box</name>
  <files>src/app/globals.css</files>
  <action>
Replace the `.calculator-box` rule (and update its preceding comment) with:

```css
/* ROI calculator — distinguished from surrounding prose as its own
   interactive widget: a lifted sheet of graph paper (minor + major
   indigo-tinted ruling, elevation shadow) rather than a flat bordered
   card. Radius stays the single site-wide 14px token (SITE-06 anti-
   pattern gate) — no new radius values here. */
.calculator-box {
  border: 1px solid rgba(12, 12, 13, 0.08);
  border-radius: 14px;
  padding: 32px;
  background-color: var(--card);
  background-image:
    linear-gradient(to right, rgba(53, 82, 255, 0.18) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(53, 82, 255, 0.18) 1px, transparent 1px),
    linear-gradient(to right, rgba(53, 82, 255, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(53, 82, 255, 0.08) 1px, transparent 1px);
  background-size: 56px 56px, 56px 56px, 14px 14px, 14px 14px;
  box-shadow:
    0 1px 1px rgba(12, 12, 13, 0.04),
    0 12px 24px -12px rgba(12, 12, 13, 0.16),
    0 24px 48px -24px rgba(12, 12, 13, 0.12);
}
```

The first two background-image/background-size layers are the major (56px, bolder 0.18 opacity) grid;
the last two are the minor (14px, faint 0.08 opacity) grid — CSS background layers paint in listed
order, so major lines render first and minor lines paint on top, matching how real graph paper draws
its index lines over the fine ruling.
  </action>
  <verify>
    <automated>grep -q "56px 56px, 56px 56px, 14px 14px, 14px 14px" src/app/globals.css && grep -q "rgba(53, 82, 255, 0.18)" src/app/globals.css && grep -q "box-shadow" src/app/globals.css && grep -c "border-radius: 14px" src/app/globals.css | grep -qE "^[0-9]+$" && npm run build</automated>
  </verify>
  <done>`.calculator-box` renders a two-tier indigo-tinted grid (major 56px bold + minor 14px faint) and a layered elevation shadow lifting it off the page background; border-radius is still exactly 14px (no new radius token); `npm run build` passes.</done>
</task>

</tasks>

<verification>
- `npm run build` completes successfully.
- Visual: /  page's ROI calculator section shows a two-weight blue-tinted grid and a soft shadow separating the white box from the warm-paper page background.
</verification>

<success_criteria>
- Grid reads as authentic graph/blueprint paper (minor + major line weights, indigo ink tint) instead of a flat single-weight grey grid.
- Box edges read as a physical sheet lifted off the page via elevation shadow, not a flat 1px outline.
- No new design tokens, dependencies, or radius values introduced.
</success_criteria>

<output>
Create `.planning/quick/260721-bwa-graph-paper-visual-polish-for-roi-calcul/260721-bwa-SUMMARY.md` when done
</output>
