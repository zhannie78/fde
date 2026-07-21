# Phase 6: Visual Redesign - Pattern Map

**Mapped:** 2026-07-20
**Files analyzed:** 21
**Analogs found:** 19 / 21

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/globals.css` | config | transform | `src/app/globals.css` (self, in-place edit) | exact |
| `src/app/layout.tsx` | provider | request-response | `src/app/layout.tsx` (self, in-place edit) | exact |
| `src/components/ui/glow-box.tsx` | component | event-driven | `src/components/ui/glow.tsx` | role-match (CSS-vs-motion, same "hover backlight" purpose) |
| `src/components/ui/elevated-cta.tsx` | component | event-driven | `src/components/ui/glow.tsx` + `src/components/book-cta.tsx` | role-match |
| `src/components/scroll-story-provider.tsx` | provider | event-driven | `src/components/cal-embed.tsx` | role-match (isolated `"use client"` wrapper around a third-party/browser API, graceful-degradation state) |
| `src/components/sections/hero.tsx` | component | transform (restyle only) | self, in-place restyle | exact |
| `src/components/sections/the-fix.tsx` | component | transform (restyle + selector hooks) | self, in-place restyle | exact |
| `src/components/sections/outcomes.tsx` | component | transform (restyle + count-up hooks) | self, in-place restyle | exact |
| `src/components/sections/roi-calculator.tsx` | component | CRUD (client state, restyle only) | self, in-place restyle | exact |
| `src/components/sections/offer.tsx` | component | transform (restyle + stagger hooks) | self, in-place restyle | exact |
| `src/components/sections/process-transparency.tsx` | component | transform (restyle + scrubbed-line hooks) | self, in-place restyle | exact |
| `src/components/sections/final-cta.tsx` | component | transform (restyle + entrance hook) | self, in-place restyle | exact |
| `src/components/site-header.tsx` | component | transform (restyle + nav link) | self, in-place restyle | exact |
| `src/components/site-footer.tsx` | component | transform (restyle only) | self, in-place restyle | exact |
| `src/components/mobile-nav.tsx` | component | transform (restyle + nav link) | self, in-place restyle | exact |
| `src/components/sticky-cta-bar.tsx` | component | transform (restyle only) | self, in-place restyle | exact |
| `src/components/book-cta.tsx` | component | request-response (CTA string change) | self, in-place restyle | exact |
| `src/app/about/page.tsx` | route | request-response | `src/app/page.tsx` (Server Component route composing sections) | role-match |
| `src/components/about/avatar.tsx` | component | file-I/O (image load + error fallback) | `src/components/cal-embed.tsx` | role-match (Client Component, isolated third-party/browser-API boundary, `useState` failure flag, graceful fallback UI) |
| `src/config/site.ts` | config | CRUD (static config object) | self, in-place edit | exact |
| `src/app/sitemap.ts` | route | batch | self, in-place edit | exact |

## Pattern Assignments

### `src/app/globals.css` (config, transform)

**Analog:** self (`src/app/globals.css`, full read, 140 lines)

**Current token block to replace** (lines 7-49, `@theme inline`):
```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-ibm-plex-sans);
  --font-heading: var(--font-fraunces);
  /* ...radius scale unchanged, derives from --radius */
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
}
```
Point `--font-sans` and `--font-heading` at the same `--font-jetbrains-mono` variable (single mono voice — do not add a third font slot).

**Current palette block to replace** (lines 51-86, `:root`):
```css
:root {
  --background: #FAF9F6;
  --foreground: #1A2432;
  --primary: #1F6E4A; /* accent 10% — deep signal green, CTA-only */
  --secondary: #101820; /* secondary 30% — ink navy */
  --secondary-foreground: #F5F3EE;
  --destructive: #B3261E;
  --radius: 0.5rem; /* single restrained radius — SITE-06 anti-pattern gate */
  --on-dark: #F5F3EE;
}
```
Replace hex values per UI-SPEC Color section (`#FBFAF7`/`#0C0C0D`/`#3552FF`/etc.), bump `--radius` to `0.75rem`–`0.875rem`, add new supporting tokens (`--accent-soft`, `--lime`, `--pink-glow`) as additional custom properties in this same block (not shadcn theme slots, per UI-SPEC).

**Base layer weight bug to fix** (lines 122-139, `@layer base`):
```css
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
  html { @apply font-sans; }
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading font-semibold;
  }
}
```
**Critical:** `font-semibold` = weight 600, but JetBrains Mono is loaded at 400/700 only (RESEARCH.md Pitfall 3) — change to `font-bold`. Grep `src/` for any other `font-semibold`/`font-medium` usage (present throughout every section component read above, e.g. `hero.tsx` line 15, `the-fix.tsx` line 14/17, `offer.tsx` lines 39/45/54) and replace with `font-bold`/`font-normal` as part of this same task.

**Reduced-motion override to add** — append after all `@layer` blocks (unlayered, so it wins the cascade per RESEARCH.md Pitfall 6):
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

### `src/app/layout.tsx` (provider, request-response)

**Analog:** self (`src/app/layout.tsx`, full read, 57 lines)

**Font import to replace** (lines 1-21):
```tsx
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
// ...
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz"], display: "swap" });
const ibmPlexSans = IBM_Plex_Sans({ variable: "--font-ibm-plex-sans", subsets: ["latin"], weight: ["400", "600"], display: "swap" });
```
Replace both with:
```tsx
import { JetBrains_Mono } from "next/font/google";
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});
```

**`className` string to update** (line 47):
```tsx
className={`${fraunces.variable} ${ibmPlexSans.variable} h-full antialiased`}
```
→ `className={`${jetBrainsMono.variable} h-full antialiased`}`

**Structural note:** `SiteHeader`/`SiteFooter`/`StickyCtaBar` composition (lines 49-54) is unchanged — no `ScrollStoryProvider` needed here; that wrapper goes around the 7 homepage sections inside `src/app/page.tsx`, not the root layout (RESEARCH.md Pattern 1 — `page.tsx` is the Server Component that owns the section list).

---

### `src/components/ui/glow-box.tsx` (component, event-driven — NEW)

**Analog:** `src/components/ui/glow.tsx` (full read, 173 lines) — for the *file shape* (`"use client"`? — actually NOT needed, see below); **CSS pattern source:** `.claude/skills/sketch-findings-fde/references/visual-system-and-motion.md` lines 21-48 (verbatim CSS, already extracted).

**Key difference from `glow.tsx`'s existing pattern:** `glow.tsx` is a `motion`-driven Client Component (`"use client"`, `motion.div` + JS-computed `animate` props, lines 1-9, 107-118, 144-170). The new `glow-box.tsx` is a **pure-CSS hover effect** — it does NOT need `"use client"` at all; it can be a plain Server Component wrapping children in the `.glow-box` / `.glow-box-inner` class structure, with the actual animation living in `globals.css` (or a co-located CSS module) as `@keyframes glow-box-blob`. Do not port `glow.tsx`'s `motion.div` approach — that would add unnecessary client JS for a decorative hover effect DSGN-04 wants kept CSS-only.

**Composition pattern to copy from `glow.tsx`** (component shape, lines 120-170 — `className`/`children` passthrough convention):
```tsx
type GlowButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    className?: string;
    // ...
  };
export function GlowButton({ className, children, ...props }: GlowButtonProps) {
  return (
    <motion.div className="relative inline-flex" /* ... */>
      <GlowEffectLayer className={glowClassName} /* ... */ />
      <Button className={className} {...props}>{children}</Button>
    </motion.div>
  );
}
```
Mirror this two-layer wrapper shape (outer positioned wrapper + glow layer + inner content layer) but implement the glow layer as a plain `<div className="glow-box::before equivalent" />` with the CSS from the skill file, not a `motion.div`.

**CSS to add (verbatim, from skill file lines 23-47):**
```css
.glow-box { position: relative; border-radius: 14px; height: 100%; }
.glow-box::before {
  content: ""; position: absolute; inset: -11px; border-radius: 14px; z-index: 0;
  background: conic-gradient(from 0deg, var(--accent), var(--lime), #ff6ac1, var(--accent));
  filter: blur(14px); opacity: 0;
  transition: opacity 0.35s ease;
}
.glow-box:hover::before { opacity: 0.6; animation: glow-box-blob 4.5s ease-in-out infinite; }
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
**Constraint from the sketch source:** wrap content in `.glow-box-inner`, not directly in `.glow-box` — glow bleeds -11px beyond the card, parent must not clip via `overflow: hidden`.

---

### `src/components/ui/elevated-cta.tsx` (component, event-driven — NEW or extend `book-cta.tsx`)

**Analog:** `src/components/book-cta.tsx` (full read, 49 lines) for the component/prop-passthrough convention; `src/components/ui/glow.tsx` for the existing `glow` boolean-prop pattern already wired into `BookCta`; **CSS pattern source:** skill file lines 52-91 (verbatim).

**Prop convention to copy from `book-cta.tsx`** (lines 7-20, 27-49):
```tsx
type BookCtaProps = {
  variant?: "primary" | "sticky";
  className?: string;
  glow?: boolean;
};
export function BookCta({ variant = "primary", className, glow }: BookCtaProps) {
  if (glow) {
    return (
      <GlowButton asChild size={variant === "sticky" ? "lg" : "default"} className={cn(...)}>
        <Link href="/book">Book Your Free Audit Call</Link>
      </GlowButton>
    );
  }
  return (
    <Button asChild size={variant === "sticky" ? "lg" : "default"} className={cn(...)}>
      <Link href="/book">Book Your Free Audit Call</Link>
    </Button>
  );
}
```
Follow this same "boolean prop selects the elevated treatment" shape — e.g. add an `elevated` variant/prop to `BookCta` (or a new sibling component reserved for FinalCta + About page's final CTA per UI-SPEC's "must match exactly" requirement) rather than duplicating the whole component.

**CSS to add (verbatim, skill file lines 53-74):**
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
.btn-final::after {
  content: ""; position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
  background: linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent);
  transform: skewX(-20deg); animation: shine-sweep 3s ease-in-out infinite;
}
@keyframes shine-sweep { 0% { left: -60%; } 40% { left: 130%; } 100% { left: 130%; } }
.btn-final:hover { background: var(--accent); box-shadow: 0 16px 34px -8px rgba(53,82,255,0.55); }
```
**Critical constraint (skill file line 76):** the parent `<section>` housing this button must NOT have `overflow: hidden` — clips the -26px ambient halo. Check `final-cta.tsx`'s current section wrapper (no overflow rules present today — safe) and the new About page's final-CTA section wrapper for the same.

**No `motion`/GSAP needed here** — this is a static, always-on CSS effect (UI-SPEC: "not rotating... static and always-present"), not a scroll or hover-driven JS animation.

---

### `src/components/scroll-story-provider.tsx` (provider, event-driven — NEW)

**Analog:** `src/components/cal-embed.tsx` (full read, 69 lines) — closest existing "isolated `use client` wrapper around a non-React browser/third-party API, with a graceful-degradation branch" pattern in the codebase.

**Imports pattern to mirror** (lines 1-6):
```tsx
"use client";
import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { siteConfig } from "@/config/site";
```
For `scroll-story-provider.tsx`, replace with:
```tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
```

**Effect/cleanup pattern to mirror** (lines 21-44 — async setup inside effect, `cancelled` guard, cleanup function):
```tsx
export function CalEmbed() {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cal = await getCalApi({ namespace: siteConfig.calNamespace });
        cal("ui", { theme: "light", /* ... */ });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  // ...
}
```
`scroll-story-provider.tsx` swaps `useEffect`+manual cleanup for `useGSAP(() => {...}, { scope: containerRef })`, which handles the equivalent of `CalEmbed`'s cleanup automatically (RESEARCH.md Pattern 1, full code example already in `06-RESEARCH.md` lines 155-212 — reuse verbatim, this PATTERNS.md does not duplicate it). The shared principle from `CalEmbed` worth carrying over: **keep the `"use client"` boundary as small as possible** — `CalEmbed`'s own doc-comment states this explicitly (lines 8-19); `scroll-story-provider.tsx` should likewise wrap only the section list via `children`, not convert the sections themselves to Client Components (RESEARCH.md's central architectural finding).

**Fallback/graceful-degradation branch to mirror** (lines 46-59 — render an alternate UI state instead of crashing):
```tsx
if (failed) {
  return (
    <div role="alert" className="rounded-lg border border-destructive p-6 text-destructive">
      Couldn&apos;t load the booking calendar. Email us directly at ...
    </div>
  );
}
```
Equivalent for `scroll-story-provider.tsx`: the `gsap.matchMedia()` `reduce`-branch (RESEARCH.md Pattern 2) is the structural analog — a conditional branch that renders/behaves differently under a "can't/shouldn't do the enhanced thing" condition, without erroring.

---

### `src/components/sections/{hero,the-fix,outcomes,offer,process-transparency,final-cta}.tsx` (component, transform — restyle in place)

**Analog:** each file is its own analog — these are in-place restyles, not new files. All six currently share:
- Server Components (no `"use client"`, confirmed by absence of the directive in all six files read above)
- `id="..."` anchors used for nav scrolling (`#fix`, `#outcomes`, `#offer`, `#process`, `#cta`) — RESEARCH.md warns: add new `className`/`data-*` selector hooks for GSAP targeting, do NOT reuse or collide with these existing `id`s (RESEARCH.md line 233).
- Consistent section-wrapper shape: `<section id="..." className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">` (see `the-fix.tsx` line 10-13, `outcomes.tsx` line 29, `offer.tsx` line 34, `roi-calculator.tsx` line 26-29) — preserve this wrapper shape, only change the token values (spacing scale bumps to 96px/32px desktop per UI-SPEC) and add selector hooks (e.g. `data-thefix-card` on `the-fix.tsx`'s content blocks, `.hero-section`/`.hero-lede` on `hero.tsx`'s root/headline+stat-line per RESEARCH.md's own example).

**Font-weight bug applies here too:** every eyebrow label / heading in these files uses `font-semibold` (e.g. `the-fix.tsx` line 14 `text-sm font-semibold`, `outcomes.tsx` line 32/46, `offer.tsx` lines 39/45/54, `hero.tsx` line 15) — these all need `font-bold` per the globals.css task above; do this as one grep-driven pass across all six files, not six separate discoveries.

**`ProcessTransparency` dark-band specifics** (`process-transparency.tsx` lines 29-30):
```tsx
<section id="process" className="bg-secondary text-secondary-foreground">
```
Stays a dark full-bleed band (UI-SPEC: unchanged pattern, only hex value moves `#101820`→`#0C0C0D`) — this is a token-only change since `bg-secondary`/`text-secondary-foreground` already resolve through `globals.css`'s `--secondary`/`--secondary-foreground` custom properties; no JSX change needed here beyond selector hooks for the scrubbed connecting-line effect.

**`FinalCta` background exception** (`final-cta.tsx` lines 9-13):
```tsx
<section id="cta" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
  <div className="flex flex-col items-center gap-6 rounded-xl bg-secondary px-6 py-12 text-center text-secondary-foreground sm:px-12">
```
Per UI-SPEC, `bg-secondary`/`text-secondary-foreground` on the inner div must become `bg-[var(--accent-soft)]` (light tinted panel, NOT the dark band) with a `20px` border-radius (override `rounded-xl`) — this is the one section-level class change beyond a pure token swap.

---

### `src/components/sections/roi-calculator.tsx` (component, CRUD — restyle only, no logic change)

**Analog:** self (full read, 109 lines) — the codebase's only existing Client Component island besides `CalEmbed`.

**Pattern to preserve exactly (no changes):** `"use client"` boundary (line 1), `useState` for `hoursPerWeek`/`hourlyCost` (lines 3, 19-20), derived-value computation with no network/persistence (lines 22-23), conditional empty-state render (lines 77-101). UI-SPEC explicitly states "no logic changes" — only the input/container/numeral classNames change (e.g. `border-border bg-card` on line 53/71 gets new radius/palette tokens, numeral `text-primary` spans at lines 91-96 gain the count-up GSAP hook from `scroll-story-provider.tsx` targeting these by a new selector).

---

### `src/components/site-header.tsx`, `mobile-nav.tsx` (component, transform — restyle + new nav link)

**Analog:** each is its own analog for the restyle; **new "About" link pattern to copy** from the existing `navLinks` array shape (`site-header.tsx` lines 13-16, duplicated in `mobile-nav.tsx` lines 17-20):
```tsx
const navLinks = [
  { href: "/#offer", label: "Pricing" },
  { href: "/#process", label: "How It Works" },
];
```
Add `{ href: "/about", label: "About" }` to this array in **both** files (they currently duplicate the list rather than sharing a single source — follow the existing duplication convention rather than introducing a new shared-constants file mid-restyle, unless the planner decides deduplication is in scope).

---

### `src/components/sticky-cta-bar.tsx`, `site-footer.tsx` (component, transform — restyle only)

**Analog:** each is its own analog — no structural change, only token/palette updates flow through automatically via `bg-background`/`bg-secondary`/etc. Tailwind utility classes once `globals.css` is updated (both files reference only theme-level utility classes, no hardcoded hex values to hunt down).

---

### `src/components/book-cta.tsx` (component, request-response — CTA copy change)

**Analog:** self (full read, 49 lines).

**String to change** (lines 35, 46 — both instances):
```tsx
<Link href="/book">Book Your Free Audit Call</Link>
```
→ `<Link href="/book">Book a Free Call Now</Link>` (both occurrences — the `glow` branch at line 35 and the plain branch at line 46). Since every call site across the codebase (`hero.tsx`, `offer.tsx`, `final-cta.tsx`, `site-header.tsx`, `site-footer.tsx`, `mobile-nav.tsx`, `sticky-cta-bar.tsx`) renders through this single component (confirmed — grepped all 7, each imports `BookCta` and never hardcodes the string), this one-file edit propagates everywhere per the D-02 discipline documented in the component's own comment (lines 22-26).

---

### `src/app/about/page.tsx` (route, request-response — NEW)

**Analog:** `src/app/page.tsx` (full read, 35 lines) — the only existing route that composes multiple section components into a page.

**Structure to copy** (lines 1-35):
```tsx
import type { Metadata } from "next";
import { FinalCta } from "@/components/sections/final-cta";
import { Hero } from "@/components/sections/hero";
// ...other section imports

export const metadata: Metadata = {
  title: "...",
  description: "...",
};

export default function Home() {
  return (
    <>
      <Hero />
      <TheFix />
      {/* ... */}
    </>
  );
}
```
`about/page.tsx` follows the same shape: a Server Component default export, its own `metadata` export (Next.js Metadata API, matching `page.tsx`'s convention exactly), composing new About-page-specific section components (photo/credentials/demos/portfolio/final-CTA) in a `<>...</>` fragment — no wrapping layout needed since `SiteHeader`/`SiteFooter`/`StickyCtaBar` already come from the root `layout.tsx` and apply to every route automatically.

**Final CTA reuse:** per UI-SPEC ("must match exactly, not the plain glow-wrap"), import and reuse the same `elevated-cta`/`BookCta` elevated variant built for the homepage's `FinalCta`, not a new bespoke component — same reuse discipline as `page.tsx`'s single shared `BookCta` import across all 7 homepage sections.

---

### `src/components/about/avatar.tsx` (component, file-I/O — NEW)

**Analog:** `src/components/cal-embed.tsx` (already fully read above, 69 lines) — same "Client Component with a `useState` failure flag and a conditional fallback render" shape.

**Pattern to copy directly** (lines 1-4, 21-22, 46-59 restructured for `next/image`):
```tsx
"use client";
import { useState } from "react";
import Image from "next/image";

export function Avatar() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="avatar-wrap flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--accent-soft), #fff)" }}>
        <span className="text-[64px] font-bold text-[var(--accent)]">A</span>
      </div>
    );
  }

  return (
    <Image
      src="/annie-photo.jpg"
      alt="Annie"
      width={200}
      height={200}
      className="avatar-photo rounded-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}
```
This is the exact pattern already worked out in `06-RESEARCH.md` (Pattern 4, lines 286-327) — cross-referenced here because `cal-embed.tsx` is the pre-existing codebase precedent for the same shape (isolated failure-state Client Component), confirming this is idiomatic for this project, not a one-off.

**Prerequisite file move (not a code pattern, but blocking):** `git mv annie-photo.jpg public/annie-photo.jpg` — RESEARCH.md Pitfall 5 confirms the file currently sits at repo root, which 404s under `next/image`/`public/` serving rules.

---

### `src/config/site.ts` (config, CRUD — edit in place)

**Analog:** self (full read, 36 lines).

**Existing shape to extend, not replace** (lines 12-35):
```ts
export const siteConfig = {
  name: "AI Deployed",
  founderName: "Annie", // NEEDS-FOUNDER (D-13)
  founderEmail: "PLACEHOLDER_LAUNCH_BLOCKER@example.invalid",
  region: "PLACEHOLDER_REGION",
  domain: "PLACEHOLDER_DOMAIN.example.invalid",
  calLink: "PLACEHOLDER/free-audit-call",
  calNamespace: "free-audit-call",
} as const;
```
Per UI-SPEC: `founderName` may now be interpolated into visitor-facing copy on `/about` — no new key needed, just a new *consumer* of the existing `founderName` value (About page imports `siteConfig.founderName`, same import convention as `site-footer.tsx` line 4/23-30 or `cal-embed.tsx` line 6/52-56). Do not add a photo-path constant — `annie-photo.jpg` is a real, already-existing asset, not a `NEEDS-FOUNDER` placeholder (per the UI-SPEC's explicit instruction).

---

### `src/app/sitemap.ts` (route, batch — edit in place)

**Analog:** self (full read, 15 lines).

**Array to extend** (line 5):
```ts
const routes = ["", "/book"];
```
→ `const routes = ["", "/book", "/about"];` — the rest of the file (lines 7-14, `.map()` over `routes` building `MetadataRoute.Sitemap` entries) needs no other change; `/about` automatically gets a sitemap entry once added to this array.

---

## Shared Patterns

### Server-Component-preserving Client Component wrapper (the phase's single most load-bearing pattern)
**Source:** `src/components/cal-embed.tsx` (existing codebase precedent) + `06-RESEARCH.md` Pattern 1 (full worked example, lines 141-235)
**Apply to:** `scroll-story-provider.tsx`, `avatar.tsx` — both are the only NEW files in this phase that need `"use client"`; every section component (`Hero`, `TheFix`, `Outcomes`, `Offer`, `ProcessTransparency`, `FinalCta`) and the new `about/page.tsx` stay Server Components. `RoiCalculator` remains the sole pre-existing Client Component among the sections (unchanged boundary).
```tsx
"use client";
// isolated to exactly the piece that needs a browser/third-party API
// (Cal.com embed / GSAP ScrollTrigger / next/image onError),
// with a useState-driven fallback branch — never converts siblings.
```

### `font-semibold` (600) → `font-bold` (700) sweep
**Source:** `06-RESEARCH.md` Pitfall 3, confirmed present in `globals.css` line 138, `hero.tsx` line 15, `the-fix.tsx` lines 14/17, `outcomes.tsx` lines 32/35/46/49, `offer.tsx` lines 39/45/54/55, `process-transparency.tsx` lines 31/44/47, `final-cta.tsx` lines 14, `site-header.tsx` line 29
**Apply to:** every file above plus `globals.css`'s base-layer heading rule — do as one grep pass (`grep -rn "font-semibold\|font-medium" src/`) rather than six separate per-file discoveries.

### Stable selector hooks for GSAP targeting (className/data-* — never reuse existing nav-anchor `id`s)
**Source:** `06-RESEARCH.md` line 233 + Pattern 1 code example (`.hero-section`, `.hero-lede`, `[data-thefix-card]`)
**Apply to:** `hero.tsx`, `the-fix.tsx`, `outcomes.tsx`, `offer.tsx`, `process-transparency.tsx`, `final-cta.tsx` — each needs new `className`/`data-*` attributes added on the elements `scroll-story-provider.tsx` will target, distinct from the existing `id="fix"`/`id="outcomes"`/`id="offer"`/`id="process"`/`id="cta"` anchors used by header/footer nav links.

### Single shared `BookCta` component — every CTA instance renders through it
**Source:** `src/components/book-cta.tsx` (existing, confirmed sole CTA implementation across 7+ call sites)
**Apply to:** any new CTA surface (About page's final CTA, demo card CTAs) — extend `BookCta`'s props (e.g. an `elevated` variant) rather than hand-rolling a new button component, per the file's own documented D-02 discipline.

### `siteConfig` as single source of truth for founder-identity values
**Source:** `src/config/site.ts` (existing, documented D-06 discipline)
**Apply to:** `about/page.tsx` and `avatar.tsx` — import `founderName` from `siteConfig`, never hardcode "Annie" as a string literal in the new page/component.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/ui/glow-box.tsx` | component | event-driven | No pure-CSS (non-`motion`-driven) hover-glow component exists yet — `glow.tsx` is the closest sibling but uses a fundamentally different (JS/motion-driven) mechanism; CSS itself is fully specified in the skill file (extracted above), not derived from a codebase analog. |
| `src/components/scroll-story-provider.tsx` | provider | event-driven | No GSAP/ScrollTrigger usage exists anywhere in the codebase yet (confirmed absent from `package.json` dependencies) — `cal-embed.tsx` is the closest structural analog (isolated third-party-API Client Component) but the GSAP-specific implementation itself is net-new, fully specified in `06-RESEARCH.md` Pattern 1. |

## Metadata

**Analog search scope:** `src/app/`, `src/components/` (all subdirectories), `src/config/`, `src/lib/`, `.claude/skills/sketch-findings-fde/references/` (CSS pattern source, not code analog)
**Files scanned:** 21 existing source files (full reads) + 2 skill reference docs (targeted grep + read)
**Pattern extraction date:** 2026-07-20

