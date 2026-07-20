# Visual System & Motion (Homepage)

## Design Decisions

**Overall register:** "Pixel-Grid Brutalist" as the starting DNA (bold, blocky, developer-coded), refined toward award-portfolio restraint — NOT the raw brutalist look, and NOT the "Terminal//CRT" hacker-nostalgia or "Dark Neon IDE" premium-SaaS directions. Two other full directions were explored and rejected (see What to Avoid).

**Typography:** Monospace throughout (`'JetBrains Mono', 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace`) — the primary voice, not just code accents. Hero display type: `clamp(2.75rem, 6.4vw, 5rem)`, line-height 1, weight 700, letter-spacing -0.035em. Section headings: `clamp(1.75rem, 3.2vw, 2.75rem)`, weight 700, letter-spacing -0.02em. Body copy: 1.75 line-height for readability at this weight/tracking. Only 2 font weights used (400/600-700) — do not introduce more.

**Color — single-accent discipline:** Background `#fbfaf7` (light, warm-neutral paper — not stark white). Ink `#0c0c0d` near-black, softened slightly warm. Ink-soft `#46484c` for secondary text. ONE primary accent: indigo `#3552ff` (`--accent`), used for CTAs, links, section-label markers, stat numerals, price figures. `--accent-soft: #eef1ff` for tinted backgrounds/highlights. `--lime: #c8ff4d` is a RARE detail accent only (underline rules, ticker separators, glow-gradient secondary stop) — never a primary color. A third color (`#ff6ac1` pink) appears ONLY inside the multi-stop conic-gradient glow effects, never as flat UI color. Do not add a second primary hue — this was explicitly corrected once during sketching (early version used blue+lime as co-equal accents; user's "more polished" request specifically triggered demoting lime to a rare accent).

**Cards — one consistent language:** Rounded (12–14px radius), 1px `var(--border)` (`#e4e2db`) borders, white `#fff` face, soft hover-lift (`translateY(-3px)` to `-4px`) with border-color shifting to accent on hover. Do NOT mix hard-offset brutalist shadows with soft shadows on the same page — pick one card language and apply it everywhere (stat cards, offer cards, process-step cards, portfolio case cards, demo cards).

**Spacing:** Generous section rhythm using a `--space-*` scale (4/8/12/16/24/32/48/64/96px). Large negative space between sections is a deliberate "confident portfolio" signal, not wasted space.

**Personal-brand pivot:** Named individual ("Hello, I'm Annie —"), not anonymous. "Annie" in the hero links to the bio/portfolio page (see other reference file). This REVERSES an earlier locked "no name, no photo" decision — explicit, confirmed user override, not a drift.

**Copy pattern — designed emphasis without a new color:** For inline emphasis phrases (e.g. "save time", "increase profit"), do NOT just recolor the text into the accent (reads like a broken link). Instead: keep text near-black + bold (700), add an accent-colored underline rule via `box-shadow: inset 0 -2px 0 0 var(--accent)`, plus a faint background tint via a `linear-gradient(transparent 72%, var(--accent-soft) 72%)` — reads as a deliberate highlighter mark.

## CSS Patterns

**Hover-triggered backlight-blob glow** (used on stat cards, offer cards, process cards — any "eye-catching box"). Two-layer structure is REQUIRED for correct stacking — do not put the glow `::before` and the opaque card background on the same element, or the glow paints over the readable content instead of behind it:

```css
.glow-box { position: relative; border-radius: 14px; height: 100%; }
.glow-box::before {
  content: ""; position: absolute; inset: -11px; border-radius: 14px; z-index: 0;
  background: conic-gradient(from 0deg, var(--accent), var(--lime), #ff6ac1, var(--accent));
  filter: blur(14px); opacity: 0;
  transition: opacity 0.35s ease;
}
.glow-box:hover::before { opacity: 0.6; animation: glow-box-blob 4.5s ease-in-out infinite; }
/* Rotates AND morphs border-radius through asymmetric blob shapes each quarter-turn —
   a plain rotating rectangle reads as "boring"; the shape must visibly bulge/recede. */
@keyframes glow-box-blob {
  0%   { transform: rotate(0deg);   border-radius: 42% 58% 65% 35% / 45% 40% 60% 55%; }
  25%  { transform: rotate(90deg);  border-radius: 62% 38% 30% 70% / 60% 65% 35% 40%; }
  50%  { transform: rotate(180deg); border-radius: 35% 65% 58% 42% / 40% 55% 45% 60%; }
  75%  { transform: rotate(270deg); border-radius: 68% 32% 45% 55% / 55% 35% 65% 45%; }
  100% { transform: rotate(360deg); border-radius: 42% 58% 65% 35% / 45% 40% 60% 55%; }
}
.glow-box-inner {
  position: relative; z-index: 1; height: 100%; box-sizing: border-box;
  background: #fff; border: 1px solid var(--border); border-radius: inherit;
  transition: background 0.25s ease, border-color 0.2s ease, transform 0.2s ease;
}
.glow-box:hover .glow-box-inner { transform: translateY(-3px); border-color: var(--accent); }
```
Wrap actual content in `.glow-box-inner`, not directly in `.glow-box`. Glow bleeds -11px beyond the card (tight insets like -2.5px make the morph invisible — there must be room for the shape to breathe).

**Elevated final-CTA button** (the LAST/most important CTA on a page gets extra weight — bigger, static dual-layer glow, always visible, NOT rotating, plus a periodic shine sweep and sliding arrow):

```css
.glow-wrap-final { position: relative; display: inline-block; margin-top: var(--space-8); }
.glow-wrap-final::before {
  content: ""; position: absolute; inset: -5px; border-radius: 15px; z-index: -1;
  background: conic-gradient(from 0deg, var(--accent), var(--lime), #ff6ac1, var(--accent));
  filter: blur(16px); opacity: 0.7; /* static — no rotation animation */
}
.glow-wrap-final::after {
  content: ""; position: absolute; inset: -26px; border-radius: 26px; z-index: -2;
  background: radial-gradient(circle, rgba(53,82,255,0.4), transparent 72%);
  filter: blur(28px); opacity: 0.7; /* static ambient halo, always present */
}
.glow-wrap-final:hover::before { opacity: 0.95; filter: blur(20px); }
.btn-final { position: relative; overflow: hidden; padding: 20px 40px; font-size: var(--text-lg); border-radius: 12px; box-shadow: 0 6px 20px -4px rgba(12,12,13,0.25); }
.btn-final::after { /* diagonal shine sweep, loops periodically */
  content: ""; position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
  background: linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent);
  transform: skewX(-20deg); animation: shine-sweep 3s ease-in-out infinite;
}
@keyframes shine-sweep { 0% { left: -60%; } 40% { left: 130%; } 100% { left: 130%; } }
.btn-final:hover { background: var(--accent); box-shadow: 0 16px 34px -8px rgba(53,82,255,0.55); }
.btn-final .arrow { display: inline-block; transition: transform 0.25s ease; margin-left: 2px; }
.btn-final:hover .arrow { transform: translateX(6px); }
```
CRITICAL: the parent section housing this button must NOT have `overflow: hidden` — it will clip the -26px ambient halo bleed. This was a real bug caught during sketching.

CRITICAL (magnetic buttons): if a button also has a cursor-follow "magnetic" mousemove handler that sets `btn.style.transform` inline, any CSS `:hover { transform: ... }` rule will be silently overridden by the JS on the next mousemove (inline styles beat any CSS specificity). Combine the lift/scale INTO the JS-set transform string instead:
```js
document.querySelectorAll('.magnetic').forEach(btn => {
  const isFinal = btn.classList.contains('btn-final');
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.25;
    const y = (e.clientY - r.top - r.height / 2) * 0.35;
    const scale = isFinal ? ' scale(1.05)' : '';
    btn.style.transform = `translate(${x}px, ${y - 2}px)${scale}`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});
```

**Standard (non-final) glow-wrap** — smaller, breathing pulse, used on the hero CTA and nav CTA (scaled down via `.nav-glow` inset/blur overrides):
```css
.glow-wrap { position: relative; display: inline-block; }
.glow-wrap::before {
  content: ""; position: absolute; inset: -3px; border-radius: 11px; z-index: -1;
  background: conic-gradient(from 0deg, #3552ff, #8f6fff, #3552ff 60%, #8f6fff 100%);
  filter: blur(14px); opacity: 0.55; animation: glow-breathe 4.5s ease-in-out infinite;
}
.glow-wrap:hover::before { opacity: 0.85; filter: blur(18px); }
@keyframes glow-breathe { 0%, 100% { transform: scale(1); opacity: 0.45; } 50% { transform: scale(1.08); opacity: 0.65; } }
```

**Endless marquee/ticker** — CRITICAL bug and fix: do not put a flex `gap` on the outer track AND rely on each duplicated `<span>` copy's own internal spacing — the seam between the two copies will have mismatched spacing vs. internal word gaps, producing a visible "pause" once per loop. Fix: uniform per-item `margin-right` on every word/separator (not flex `gap` anywhere), two identical `.ticker-group` children with NO gap between them, animate exactly `translateX(-50%)`:
```css
.ticker { overflow: hidden; white-space: nowrap; }
.ticker-track { display: inline-flex; animation: ticker 22s linear infinite; }
.ticker-group { display: inline-flex; flex-shrink: 0; align-items: center; }
.ticker-track b { display: inline-block; margin-right: var(--space-8); font-weight: 600; }
.ticker-track .sep { display: inline-block; margin-right: var(--space-8); color: var(--accent); }
@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
```
HTML: two identical `<span class="ticker-group">...</span>` inside `.ticker-track`, each item's own trailing margin — not container gap.

**Scroll-reveal fade-in:**
```js
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
```
```css
.reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.6s cubic-bezier(.16,1,.3,1), transform 0.6s cubic-bezier(.16,1,.3,1); }
.reveal.in { opacity: 1; transform: translateY(0); }
```
Above-the-fold hero content should carry both `reveal` and `in` classes from the start (already visible, no animation needed on load).

**"Available for new engagements" status pill** (personal-portfolio signature device):
```css
.status-pill { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--border); border-radius: 999px; padding: 6px 14px; text-transform: uppercase; letter-spacing: 0.04em; }
.status-pill .ping { width: 7px; height: 7px; border-radius: 50%; background: #2ecc71; position: relative; }
.status-pill .ping::after { content: ""; position: absolute; inset: -4px; border-radius: 50%; background: #2ecc71; opacity: 0.5; animation: pulse 1.8s ease-out infinite; }
@keyframes pulse { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2.2); opacity: 0; } }
```

## HTML Structures

Page order (locked, from the phase-5 requirements — content unchanged by this visual redesign): Hero → skills ticker → market-gap band (dark, full-bleed) → The Fix (stat cards) → The Offer (pricing cards) → How It Works (process cards) → Final CTA.

Nav CTA and final CTA both read "Book a Free Call Now" (renamed from "Book Audit" / "Book Free Audit" during sketching — apply consistently across every instance when building for real, not just the two touched during sketch iteration).

## What to Avoid

- **"Terminal // CRT" direction** (Variant A): near-black bg, phosphor-green, scanlines, terminal chrome, blinking cursor. Rejected — too raw/hacker-nostalgic for a "modern, impressive, award-portfolio" brief.
- **"Dark Neon IDE" direction** (Variant C): charcoal/navy, violet-cyan-pink syntax-token accents, glass-panel blur cards, editor-tab chrome. Rejected — not chosen, though its glass-blur card treatment could be revisited for a future dark-mode pass if ever requested.
- **Raw brutalism** (original Variant B, pre-polish): thick 3px black borders, hard 6px offset drop-shadows on every card, TWO co-equal loud accents (blue + lime), visible pixel-grid background texture. Explicitly softened after user asked for "more polished and professional" — keep the blocky/confident bones, drop the loud/raw execution.
- **Rotating rectangle glow** (first glow-box attempt): tight inset (-2.5px) + plain `rotate()` on a rounded-rect pseudo-element reads as "a boring rotating rectangle," not organic — the border-radius must also animate (see blob keyframes above).
- **Rotating final-CTA glow**: tried and explicitly reverted — the last/most important CTA's backlight should be static and always-present, not spinning. Rotation is reserved for the smaller, secondary glow-box hover treatment.
- **Citing the 95%-stat with an inline source parenthetical** ("(MIT NANDA, 2025)") in the hero — copy iteration removed this in favor of a cleaner standalone claim; if citation/credibility framing is needed, place it elsewhere (e.g., a footnote or the process-transparency section), not inline in the hero lede.

## Origin
Synthesized from sketch: 001
Source file available in: sources/001-visual-system/index.html (all variants A/B/B2/C preserved, B2 is the winner and default-active tab)
Shared theme tokens: sources/themes/default.css
