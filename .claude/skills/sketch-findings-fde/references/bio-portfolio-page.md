# Bio & Portfolio Page

## Design Decisions

**Purpose:** A separate page (linked from "Annie" in the homepage hero) that makes the personal-brand pivot concrete: real photo, real credentials, a demos section, and a portfolio of representative builds. Reuses every token/pattern from the homepage visual system directly — same background/ink/accent colors, same card language, same button treatments. This is NOT a separate design language; it's a direct extension.

**Photo:** Circular crop (200px), thin `1px var(--border)` ring, soft drop shadow (`0 12px 32px -12px rgba(12,12,13,0.18)`), plus a subtle inset highlight ring for polish. Deliberately minimal framing — the photo's own soft, blurred-bright background blends into the page's light paper tone (`#fbfaf7`) without a heavy color treatment fighting it. Graceful fallback: if the photo file is missing, show a monogram placeholder (first-initial, accent-tinted gradient background) via `onerror` — never a broken-image icon.

**Credentials:** Presented as pill badges (`.credential-pill` — accent-soft background, accent-colored text, rounded-full). Confirmed content: "M.S., Georgia Tech — 4.0 GPA" and "Palantir Foundry Certified Application Developer". Do NOT add industry-vertical pills (Supply Chain/Finance/Healthcare) as separate badges — that was tried and explicitly reverted; verticals-worked-in framing belongs in the bio prose paragraph, not as standalone bubbles.

**Demos section:** Kept deliberately honest — do not fabricate "live" interactive demos that don't exist. Pattern used: one card marked "Live" (badge) linking to a real, working feature elsewhere on the site (e.g., the ROI calculator); one or more cards marked "Preview" with a "Request a walkthrough" CTA instead of a fake live demo link.

**Portfolio section:** Case-study cards using the SAME `.glow-box`/`.glow-box-inner` hover-backlight treatment as the homepage's stat/offer/process cards (visual continuity). Each card: number label (01/02/03/04), title, then three text blocks — **The Problem**, **The Solution**, **The Result** (labeled with the accent-colored uppercase `.label` style). The Result block gets a distinct treatment: `border-left: 2px solid var(--lime); padding-left: var(--space-4);` with bold ink-colored text — makes the outcome/ROI line visually pop against the more muted problem/solution prose above it.

Portfolio framing line (important, keep on the real build): explicitly disclose these are illustrative/composite examples, not real client case studies — e.g. "Representative examples of the kind of systems I build — illustrative composites based on the patterns I deploy most often, not client-identifying case studies." This is accurate (the source content was fabricated examples) and avoids implying false client claims.

## CSS Patterns

**Avatar:**
```css
.avatar-wrap {
  position: relative; width: 200px; height: 200px; border-radius: 50%;
  overflow: hidden; border: 1px solid var(--border);
  box-shadow: 0 12px 32px -12px rgba(12,12,13,0.18);
}
.avatar-wrap::after {
  content: ""; position: absolute; inset: 0; border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6), inset 0 -20px 30px -10px rgba(53,82,255,0.08);
  pointer-events: none;
}
.avatar-photo { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--accent-soft), #fff);
  color: var(--accent); font-size: 64px; font-weight: 700;
}
```
```html
<div class="avatar-wrap">
  <img src="annie-photo.jpg" alt="Annie" class="avatar-photo"
       onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
  <div class="avatar-placeholder" style="display:none;">A</div>
</div>
```

**Bio header layout:** 2-column grid on desktop (`220px 1fr` — photo | name+credentials+bio), single-column centered stack on mobile (`@media max-width:720px`).

**Credential pill:**
```css
.credential-pill {
  font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.03em;
  background: var(--accent-soft); color: var(--accent); border-radius: 999px;
  padding: 7px 14px;
}
```

**Demo card badge:**
```css
.demo-badge {
  font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--accent); background: var(--accent-soft); padding: 4px 10px; border-radius: 999px;
}
```

**Portfolio case-card result block:**
```css
.case-result { border-left: 2px solid var(--lime); padding-left: var(--space-4); margin-top: var(--space-2); }
.case-result p { color: var(--ink); font-weight: 600; }
```

## HTML Structures

Page order: sticky topbar (back-link + brand + highlighted "Book a Free Call Now" nav CTA) → bio header (photo + name + title + credential pills + bio paragraph) → Demos (2-col card grid) → Portfolio (2-col case-study card grid, 4 cards) → Final CTA (identical elevated `.glow-wrap-final`/`.btn-final` treatment as the homepage — see other reference file; this was explicitly matched during sketching after first using the plain/smaller glow-wrap by mistake).

## What to Avoid

- Industry-vertical pills as standalone credential badges (Supply Chain/Finance/Healthcare) — explicitly removed per user request. If vertical experience needs surfacing, do it in prose.
- A weaker/smaller final-CTA button than the homepage's — the two must match exactly (same static dual-glow, same shine sweep, same sliding arrow), not the plain `glow-wrap`.
- Claiming live/functional demos that don't exist — always distinguish "Live" vs. "Preview" honestly.
- Presenting the fabricated portfolio examples without the illustrative-composite disclosure line.

## Origin
Synthesized from sketch: 002
Source file available in: sources/002-about-page/index.html
Depends on: visual-system-and-motion.md (shared tokens/components — this page does not introduce a separate design language)
