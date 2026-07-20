# Phase 6: Visual Redesign - Research

**Researched:** 2026-07-20
**Domain:** GSAP/ScrollTrigger scroll-choreography in Next.js 16 App Router, next/font self-hosted variable fonts, next/image error-fallback patterns, mobile Core Web Vitals verification
**Confidence:** HIGH (integration mechanics, package legitimacy) / MEDIUM (exact CWV numeric outcomes, which depend on final content weight not yet built)

## Summary

Phase 6 restyles Phase 5's 7 locked landing sections onto a new mono/indigo design system and adds GSAP ScrollTrigger-driven choreography, `prefers-reduced-motion` gating, a new `/about` page, and a font swap (Fraunces + IBM Plex Sans → JetBrains Mono only). The design decisions themselves are locked in `06-UI-SPEC.md` and the `sketch-findings-fde` skill — this research does not re-litigate them. It answers the *how*: the current codebase's 6 of 7 section components (`Hero`, `TheFix`, `Outcomes`, `Offer`, `ProcessTransparency`, `FinalCta`) are **Server Components today** (only `RoiCalculator` has `"use client"`), which materially changes the correct GSAP integration pattern from what the UI-SPEC's phrasing implies. `@gsap/react`'s official pattern is a scoped `useGSAP(() => {...}, { scope: containerRef })` hook querying selector text — this lets a **single new Client Component wrapper** (`scroll-story-provider.tsx`) house all ScrollTrigger logic while the six section components stay Server Components (no `"use client"` conversions needed), targeting them via stable className/data-attribute selectors. This is the single most load-bearing architectural finding in this document — see Pattern 1 below.

A second correction: the UI-SPEC's suggested `next/dynamic(() => import(...), { ssr: false })` wrapper is **not needed and would fail** if attempted directly inside `src/app/page.tsx` (a Server Component) — Next.js App Router explicitly disallows `ssr: false` in Server Components as of Next 13+ and this restriction is unchanged in Next 16. The simpler, officially-documented pattern (a `"use client"` file with plain static `import gsap from "gsap"` / `import { ScrollTrigger } from "gsap/ScrollTrigger"` at module top, all DOM-touching calls inside `useGSAP`) is SSR-safe without any dynamic-import gymnastics, because `useGSAP` never executes during server rendering.

A third finding: `next/image`'s `onError` prop **is supported** (documented, current, non-deprecated) as of Next.js 16 — the UI-SPEC's premise that it needs special workaround is only half-true: `onError` requires the component to be a Client Component (any function prop does), but the callback pattern itself works exactly like the sketch's raw `<img onerror>`, just as React state instead of DOM mutation.

**Primary recommendation:** Install `gsap` + `@gsap/react` (both 100% free post-Webflow acquisition, confirmed via official sources), build one `"use client"` `ScrollStoryProvider` wrapping the page's Server Component sections via `children`, use `gsap.matchMedia()` for the reduced-motion gate exactly as the UI-SPEC specifies, verify DSGN-04 with `@lhci/cli` mobile-throttled runs (not ad hoc DevTools spot checks) so the phase gate is repeatable and scriptable by a solo maintainer.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Design tokens / palette / type (DSGN-01) | Frontend Server (SSR) — `globals.css`, `layout.tsx` | Browser (CSS custom properties resolved client-side too) | Tokens are compiled at build time into CSS shipped with the server-rendered HTML; no client JS required for the visual swap itself. |
| Scroll-driven choreography (DSGN-02) | Browser / Client | — | ScrollTrigger requires `window`/`IntersectionObserver`-class scroll-position APIs that only exist post-hydration in the browser; this is unavoidably client-tier work layered on top of server-rendered markup. |
| Reduced-motion gating (DSGN-03) | Browser / Client (GSAP layer) + CDN/Static (CSS `@media` layer) | — | The GSAP gate (`matchMedia`) and the blanket CSS `@media (prefers-reduced-motion: reduce)` override are both evaluated client-side, but the CSS override ships as static, cacheable CSS with zero JS dependency — it is the fallback of last resort if JS fails to load at all. |
| CWV / performance budget (DSGN-04) | Frontend Server (SSR) for LCP element + CDN/Static for font/image delivery | Browser (JS execution cost of the animation layer) | LCP is won or lost primarily by what's server-rendered before any client JS runs (Hero H1, fonts); the animation layer's *only* job here is to not regress what SSR already achieved. |
| `/about` page + photo (DSGN-05) | Frontend Server (SSR) for the route + CDN/Static for the image asset | Browser (client-side `onError` fallback state) | The page and its text content are server-rendered; only the graceful-degradation image fallback needs a client boundary. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|---------------|
| `gsap` | 3.15.0 `[VERIFIED: npm registry, cross-referenced against official greensock/GSAP GitHub org and gsap.com]` | Core animation engine + `ScrollTrigger` plugin | Industry-standard scroll-choreography library; 4.04M downloads/week `[VERIFIED: npmjs.org downloads API]`; 100% free including all formerly-paid Club plugins since the April 2025 Webflow-driven license change `[CITED: webflow.com/updates/gsap-becomes-free, discourse.webflow.com]` — matches the project's lean/free-tier budget constraint from CLAUDE.md. |
| `@gsap/react` | 2.1.2 `[VERIFIED: npm registry, cross-referenced against official greensock/react GitHub repo]` | `useGSAP()` hook — React-idiomatic wrapper providing automatic context cleanup | Official GreenSock package specifically built to replace bare `useEffect` + manual `gsap.context().revert()` boilerplate; peer-dependency-compatible with React 19 (`peerDependencies: { react: ">=17" }` `[VERIFIED: npm registry]`) and this project's installed `gsap@^3.12.5`-compatible range. |
| `next/font/google` (`JetBrains_Mono`) | Bundled with `next@16.2.10` (already installed) | Self-hosted variable font replacing Fraunces + IBM Plex Sans | Already the project's font-loading mechanism (used for Fraunces/IBM Plex Sans today) — zero new dependency, automatic self-hosting + `display: swap` + fallback metric-matching that protects LCP/CLS per DSGN-04. `[CITED: nextjs.org/docs/app/getting-started/fonts, fetched 2026-07-20]` |

### Supporting

No new supporting libraries required. `next/image` (built into `next`) handles the About page photo; `motion` (already installed, `^12.42.2`) is retained unchanged for discrete micro-interactions per the UI-SPEC's explicit "don't migrate `glow.tsx`" instruction.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| GSAP + ScrollTrigger | `motion`'s `useScroll`/`useTransform` (already installed) | UI-SPEC and STATE.md already resolved this in GSAP's favor for the scroll-linked narrative specifically — `motion` stays scoped to non-scroll micro-interactions. Not re-litigated here; documented only so the planner understands why both libraries coexist rather than picking one. |
| `next/dynamic(..., { ssr: false })` for the GSAP wrapper | Plain `"use client"` + static import + `useGSAP` | The dynamic-import approach adds an extra network waterfall step (separate chunk fetch) for no SSR-safety benefit, since `useGSAP`'s internal effect never runs server-side anyway. Use plain `"use client"` — simpler, one fewer moving part, still code-split automatically by Next.js's per-route bundling since the wrapper is only imported on `/`. |
| Manual DevTools Lighthouse spot-check for DSGN-04 | `@lhci/cli` (`lighthouse` npm package + `lighthouserc.js`) | DevTools spot-checks are fine for iterative dev feedback but are not a repeatable acceptance-criterion artifact a solo maintainer can re-run identically pre-ship and after future changes. Recommend `@lhci/cli` as the actual verification gate. |

**Installation:**
```bash
npm install gsap @gsap/react
```

**Version verification:** Confirmed via `npm view gsap version` → `3.15.0` (published 2026, actively maintained since 2014) and `npm view @gsap/react version` → `2.1.2`, both cross-referenced against their GitHub source repos (`github.com/greensock/GSAP`, `github.com/greensock/react`). No new dependency needed for `next/font/google` or `next/image` — both ship inside the already-installed `next@16.2.10`.

## Package Legitimacy Audit

`slopcheck` could not be installed in this research environment (`pip install slopcheck` → `ERROR: Could not find a version that satisfies the requirement slopcheck`, tried against both `pip` and `pip3`, no matching PyPI distribution found — network reachability to `api.npmjs.org` and GitHub was otherwise confirmed working, so this is a package-availability gap, not a connectivity failure). Per protocol, packages are marked `[ASSUMED]` below despite substantial manual verification, and the planner should gate the `npm install gsap @gsap/react` step behind a `checkpoint:human-verify` task.

Manual verification performed as a substitute (strong signal, not equivalent to slopcheck):

| Package | Registry | Age | Downloads | Source Repo | Postinstall Script | Manual Verdict | Disposition |
|---------|----------|-----|-----------|--------------|---------------------|-----------------|-------------|
| `gsap` | npm | 12 years (first published 2014-08-25) | 4,042,700/week | `github.com/greensock/GSAP` (official GreenSock/Webflow org) | none found (`npm view gsap scripts` → empty) | Clean — long-lived, massive adoption, no suspicious install hooks | Approved `[ASSUMED — slopcheck unavailable, gate behind checkpoint:human-verify]` |
| `@gsap/react` | npm | Official companion package, actively maintained, current `2.1.2` | 1,059,149/week | `github.com/greensock/react` (official GreenSock org) | none found | Clean — official first-party React integration, no install hooks | Approved `[ASSUMED — slopcheck unavailable, gate behind checkpoint:human-verify]` |

**Packages removed due to slopcheck `[SLOP]` verdict:** none (slopcheck did not run — see above).
**Packages flagged as suspicious `[SUS]`:** none.

Note on licensing (relevant to CLAUDE.md's budget constraint): `gsap`'s registry `license` field reads `"Standard 'no charge' license: https://gsap.com/standard-license."` — this is **not** an OSI-approved license (e.g., not MIT/Apache), but Webflow's April 2025 announcement confirms it now permits unrestricted commercial use including in billed client products, at no cost `[CITED: webflow.com/updates/gsap-becomes-free, fetched via WebSearch 2026-07-20]`. Flag this as a fact worth a one-line confirmation in the plan's assumptions rather than a blocker — GSAP's own standard license terms should be skimmed once before shipping a paid client site on it, even though the practical risk is low given its ubiquity.

## Architecture Patterns

### System Architecture Diagram

```
Browser request for "/"
        │
        ▼
Next.js App Router — src/app/page.tsx (Server Component)
        │  renders Hero, TheFix, Outcomes, RoiCalculator, Offer,
        │  ProcessTransparency, FinalCta as SERVER-RENDERED HTML
        │  (RoiCalculator is the one existing "use client" island)
        ▼
  <ScrollStoryProvider>  ← NEW "use client" wrapper, receives
        │                  the above as `children` (still server-rendered
        │                  markup — wrapper does not re-render their content)
        │
        │  on mount (post-hydration only):
        │    useGSAP(() => {
        │      gsap.registerPlugin(ScrollTrigger)
        │      const mm = gsap.matchMedia()
        │      mm.add("(prefers-reduced-motion: no-preference)", () => {
        │        // per-section ScrollTrigger.create()/.batch() calls,
        │        // targeting selector text like ".hero-headline",
        │        // "[data-thefix-card]" — NOT refs into section components
        │      })
        │      mm.add("(prefers-reduced-motion: reduce)", () => {
        │        // force final/settled state, create ZERO triggers
        │      })
        │    }, { scope: containerRef })
        ▼
  Browser paints server HTML immediately (LCP unaffected by GSAP)
        │
        ▼
  User scrolls → ScrollTrigger's internal rAF-batched listener fires
        │
        ▼
  gsap.to()/timeline updates transform/opacity only (no layout thrash,
  protects CLS) on the targeted DOM nodes already painted by SSR
```

A reader can trace: request → server-rendered sections → client wrapper attaches behavior post-hydration → scroll fires GSAP tweens on already-painted nodes. Nothing in this flow requires converting `Hero`/`TheFix`/`Outcomes`/`Offer`/`ProcessTransparency`/`FinalCta` into Client Components.

### Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx              # font swap only: Fraunces/IBM_Plex_Sans → JetBrains_Mono
│   ├── page.tsx                # wraps existing 7 sections in <ScrollStoryProvider>
│   ├── about/
│   │   └── page.tsx            # NEW — Server Component, About/bio/portfolio route
│   └── globals.css             # token swap: 60/30/10 palette, --radius, font vars
├── components/
│   ├── scroll-story-provider.tsx   # NEW "use client" — houses all useGSAP/ScrollTrigger
│   ├── ui/
│   │   ├── glow-box.tsx            # NEW — pure-CSS hover-backlight pattern (cards)
│   │   ├── elevated-cta.tsx        # NEW — static dual-glow final-CTA button
│   │   └── glow.tsx                # UNCHANGED — motion-driven button glow, keep as-is
│   ├── about/
│   │   └── avatar.tsx              # NEW "use client" — next/image + onError fallback
│   └── sections/                   # Hero/TheFix/Outcomes/Offer/ProcessTransparency/
│                                    # FinalCta — restyled in place, structure unchanged,
│                                    # stay Server Components, gain stable selector hooks
│                                    # (className or data-* attrs) for GSAP targeting
└── config/
    └── site.ts                     # founderName now interpolated on /about
```

### Pattern 1: Scoped `useGSAP` wrapper around Server Component children (the load-bearing pattern)

**What:** A single `"use client"` component accepts server-rendered sections as `children`, wraps them in a ref'd container, and runs all ScrollTrigger setup via `useGSAP(() => {...}, { scope: containerRef })`, targeting selector text rather than component-local refs.

**When to use:** Any time scroll-linked animation needs to touch multiple sibling Server Components without converting each one to a Client Component — exactly this phase's situation, since 6 of 7 sections are Server Components today and DSGN-01 explicitly favors keeping heavy content server-rendered for CWV.

**Example:**
```tsx
// Source: pattern synthesized from official useGSAP scope/selector-text docs
// (gsap.com/resources/React, github.com/greensock/react) + Next.js's documented
// Server-Component-as-children-prop composition pattern (nextjs.org/docs/app/
// building-your-application/rendering/composition-patterns#supported-pattern-
// passing-server-components-to-client-components-as-props)

// src/components/scroll-story-provider.tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

export function ScrollStoryProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".hero-lede", {
          opacity: 0.3,
          y: -24,
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        ScrollTrigger.batch("[data-thefix-card]", {
          start: "top 75%",
          onEnter: (batch) =>
            gsap.from(batch, { opacity: 0, y: 18, stagger: 0.12, duration: 0.6 }),
          once: true, // matches UI-SPEC's "toggleActions: play none none none"
        });

        // ...Outcomes count-up, Offer asymmetric stagger, ProcessTransparency
        // scrubbed line, FinalCta scale-in — each registered the same way.
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // no ScrollTrigger.create() calls at all — final/settled state is
        // already what CSS ships by default, so nothing to set here unless
        // a given effect's *default* CSS state is mid-animation (it should
        // not be, if authored per the "settled by default, animate FROM
        // settled" convention below).
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="contents">
      {children}
    </div>
  );
}
```
```tsx
// src/app/page.tsx (Server Component — unchanged import list, one new wrapper)
import { ScrollStoryProvider } from "@/components/scroll-story-provider";
// ...existing section imports unchanged

export default function Home() {
  return (
    <ScrollStoryProvider>
      <Hero />
      <TheFix />
      <Outcomes />
      <RoiCalculator />
      <Offer />
      <ProcessTransparency />
      <FinalCta />
    </ScrollStoryProvider>
  );
}
```

**Important corollary:** each section component needs stable selector hooks added during its restyle pass (e.g. `className="hero-section"` on `Hero`'s root, `data-thefix-card` on each stat card) — these are plain HTML attributes emitted by Server Components, no `"use client"` needed on the sections themselves. Use `className`/`data-*`, not `id`, to avoid collisions with the existing anchor IDs (`#fix`, `#outcomes`, etc.) already used for nav-link scrolling.

**`className="contents"` note:** the wrapper `<div>` uses Tailwind's `contents` display value so it does not introduce an extra box in the layout (which could otherwise shift flex/grid behavior inherited from `body`'s `flex flex-col` in `layout.tsx`) — verify this doesn't interfere with `ScrollTrigger`'s trigger-element measurements; if it does, fall back to a plain unstyled `<div>` (accepting the extra DOM node) rather than fighting `display: contents`' known cross-browser quirks with ref-based measurement.

### Pattern 2: `gsap.matchMedia()` for reduced-motion gating (confirms UI-SPEC's approach against official docs)

**What:** Wrap all ScrollTrigger-creating code in `gsap.matchMedia()` conditions keyed to `prefers-reduced-motion`.

**When to use:** Every single ScrollTrigger instance in this phase, no exceptions — DSGN-03 requires zero ScrollTrigger instances created at all under `reduce`, not just instant-completing ones.

**Example:**
```js
// Source: gsap.com/docs/v3/GSAP/gsap.matchMedia() (fetched 2026-07-20)
let mm = gsap.matchMedia();
mm.add(
  {
    motionOK: "(prefers-reduced-motion: no-preference)",
    motionReduced: "(prefers-reduced-motion: reduce)",
  },
  (context) => {
    const { motionOK } = context.conditions;
    if (motionOK) {
      // create ScrollTrigger instances here
    }
    // else: branch intentionally does nothing — no trigger created
  }
);
```
This "conditions object" form (vs. two separate `.add()` calls) is the documented, slightly more concise official variant and is functionally identical to the two-call form the UI-SPEC shows — either is correct; pick one and use it consistently across all sections for maintainability.

### Pattern 3: `next/font/google` variable-font swap

**What:** Replace `Fraunces` + `IBM_Plex_Sans` next/font imports with a single `JetBrains_Mono` import, weights `["400", "700"]`.

**Example:**
```tsx
// Source: nextjs.org/docs/app/getting-started/fonts (fetched 2026-07-20, doc
// version matches next@16.2.10 per the fetched page's version field)
import { JetBrains_Mono } from "next/font/google";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// <html className={`${jetBrainsMono.variable} h-full antialiased`}>
```
Then in `globals.css`'s `@theme inline` block, point **both** `--font-sans` and `--font-heading` at `--font-jetbrains-mono` (a single mono voice, per the UI-SPEC's "not a code accent" instruction) rather than introducing a third theme-font slot.

**Pitfall this surfaces:** `globals.css`'s `@layer base` currently sets `h1..h6 { @apply font-heading font-semibold; }` — `font-semibold` is Tailwind's 600 weight utility. JetBrains Mono is loaded with only 400/700 files. Requesting `font-weight: 600` on a font family with no 600 file loaded causes the browser to either snap to the nearest loaded weight or (worse, on some engines) synthesize a faux-bold, which looks inconsistent and violates the "exactly 2 weights" contract. **Change `font-semibold` → `font-bold` (700)** in this rule as part of the token swap — a one-line fix easy to miss since it's not called out explicitly in the UI-SPEC's Typography section.

### Pattern 4: `next/image` with `onError` fallback for the About page photo

**What:** Move `annie-photo.jpg` to `public/`, render via `next/image` with explicit `width`/`height` (200×200, matching the sketch's circular crop), and use the documented `onError` prop (not a raw `<img onerror>` string) to swap to a monogram placeholder on load failure.

**Example:**
```tsx
// Source: nextjs.org/docs/app/api-reference/components/image (fetched
// 2026-07-20, version 16.2.10 — onError is documented, current, non-deprecated;
// onLoadingComplete is the deprecated one, do not use it)
"use client";

import { useState } from "react";
import Image from "next/image";

export function Avatar() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="avatar-wrap flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, var(--accent-soft), #fff)" }}
      >
        <span className="text-[64px] font-bold text-[var(--accent)]">A</span>
      </div>
    );
  }

  return (
    <div className="avatar-wrap">
      <Image
        src="/annie-photo.jpg"
        alt="Annie"
        width={200}
        height={200}
        className="avatar-photo rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
```
**Correction to the phase brief's premise:** `onError` is a documented, supported, non-deprecated `next/image` prop as of Next 16 — it is not true that "`next/image` doesn't support `onError` the same way" as a raw `<img>`. The only real constraint is that any component using it must be a Client Component (any function-typed prop forces this — same rule as `onLoad`), which this component already is. Keep this Client Component boundary small (just the avatar), not the whole About page.

### Anti-Patterns to Avoid

- **Converting `Hero`/`TheFix`/`Outcomes`/`Offer`/`ProcessTransparency`/`FinalCta` to `"use client"` just to attach GSAP refs:** unnecessary given Pattern 1's selector-scoped approach, and it would needlessly increase client JS shipped for content that has zero interactivity of its own, directly working against DSGN-04's CWV budget.
- **Calling `ScrollTrigger.create()` or `gsap.to()` directly inside a bare `useEffect` instead of `useGSAP`:** loses the automatic `gsap.context().revert()` cleanup on unmount — a real risk here since this is a single-page app with no route changes, but still bad practice that will bite if the About page or future routes ever get scroll effects.
- **`next/dynamic(..., { ssr: false })` inside `page.tsx` directly:** throws a build/runtime error in Next.js App Router — `ssr: false` is disallowed in Server Components. If code-splitting the GSAP bundle out of the main chunk is ever desired, do it via `next/dynamic` called *from inside* `ScrollStoryProvider` itself (a Client Component, where `ssr: false` is legal) — not from `page.tsx`.
- **Reintroducing `font-semibold` (600) anywhere in the new mono system:** breaks the "exactly 2 weights" contract from both UI-SPEC and the sketch findings; grep for `font-semibold`/`font-medium` across `src/` during the restyle pass and replace with `font-bold`/`font-normal`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll-position-tied animation triggering/cleanup | Custom `IntersectionObserver` + manual scroll-event math (the sketch's own vanilla-JS `reveal`/`in` pattern) | `ScrollTrigger` + `useGSAP`'s automatic context cleanup | `ScrollTrigger` already solves rAF-batched scroll listening, `start`/`end` scrubbing, and `.batch()` for sibling groups — reimplementing this in raw JS (as the throwaway sketch prototype did) is exactly the kind of custom solution this phase should NOT carry into the real build; the sketch's `IntersectionObserver` pattern was a prototyping shortcut, not the target implementation. |
| Reduced-motion detection + cleanup on preference change | Manual `matchMedia("(prefers-reduced-motion: reduce)").addEventListener(...)` bookkeeping alongside separately-tracked animation instances | `gsap.matchMedia()` | Handles both the initial check and live preference-change revert/recreate automatically via its internal `gsap.context()` — hand-rolling this risks leaking ScrollTrigger instances if a user toggles the OS setting mid-session. |
| Image load-failure fallback | Raw `<img onerror="this.style.display=...">` DOM mutation (what the sketch prototype used) | `next/image`'s `onError` prop + React state | React-idiomatic, avoids direct DOM manipulation fighting React's virtual DOM, and is the officially documented pattern — again, the sketch's inline `onerror` string was a static-HTML prototyping shortcut, not meant to be carried into the Next.js build verbatim (the UI-SPEC already flags this correctly). |
| Mobile CWV measurement | Ad hoc single DevTools run, manually eyeballed | `@lhci/cli` with a committed `lighthouserc.js` (mobile preset, `numberOfRuns: 3`) | Repeatable, scriptable, diffable across future changes — a solo maintainer needs this to be a command they can re-run, not tribal knowledge of "open DevTools, remember to check Mobile + throttling." |

**Key insight:** Every "don't hand-roll" item above maps to something the sketch's throwaway static-HTML prototype *did* hand-roll (by necessity — it was a prototype with no build tooling, no React). The single biggest risk in this phase is copying those prototyping shortcuts (raw `IntersectionObserver`, inline `onerror`, manual `matchMedia` listeners) into the real Next.js codebase instead of translating them to their framework-idiomatic equivalents. The CSS patterns (glow-box, elevated-cta, marquee ticker fix) are correctly meant to be reused verbatim — only the *JS* patterns need this translation.

## Common Pitfalls

### Pitfall 1: Converting Server Components to Client Components unnecessarily
**What goes wrong:** A naive reading of "wire GSAP into Hero/TheFix/Outcomes/..." leads to slapping `"use client"` on all 6 currently-server sections.
**Why it happens:** Most GSAP+React tutorials assume a fully client-rendered SPA and default to per-component refs, not scope+selector-text targeting from a single outer wrapper.
**How to avoid:** Use Pattern 1 (scoped wrapper + selector text). Only components with genuine interactivity (`RoiCalculator`, the new `Avatar`) need `"use client"`.
**Warning signs:** If the diff for this phase adds `"use client"` to `hero.tsx`, `the-fix.tsx`, `outcomes.tsx`, `offer.tsx`, `process-transparency.tsx`, or `final-cta.tsx`, stop and reconsider — that's very likely unnecessary and will hurt DSGN-04's JS-weight budget.

### Pitfall 2: `ssr: false` used where the App Router forbids it
**What goes wrong:** Following the UI-SPEC's literal `next/dynamic(() => import(...), { ssr: false })` phrasing by placing it in `page.tsx` (a Server Component) throws a build error: `` `ssr: false` is not allowed with `next/dynamic` in Server Components ``.
**Why it happens:** This restriction is a Next.js 13+ App Router-specific rule that many pre-App-Router GSAP tutorials predate.
**How to avoid:** Don't use `ssr: false` at all for this phase — the plain `"use client"` + static-import + `useGSAP` pattern (Pattern 1) is SSR-safe without it, since `useGSAP`'s effect body never executes during server rendering.
**Warning signs:** Any build-time error mentioning "ssr: false" and "Server Components" together — remove the `dynamic()` wrapper entirely rather than trying to work around it.

### Pitfall 3: `font-semibold` (600) surviving the JetBrains Mono swap
**What goes wrong:** `globals.css`'s existing `h1..h6 { @apply font-heading font-semibold; }` rule requests a 600 weight that JetBrains Mono (loaded at 400/700 only) doesn't have, causing inconsistent rendering across browsers/engines.
**Why it happens:** The UI-SPEC's Typography section documents the *target* weight scale (400/700) but doesn't call out this specific pre-existing CSS rule as needing a matching edit — an easy line to miss in a restyle pass focused on new files.
**How to avoid:** Grep `src/` for `font-semibold` and `font-medium` during the token-swap task and replace with `font-bold`/`font-normal`.
**Warning signs:** Headings that look slightly "off-weight" or inconsistently bold across browsers after the swap.

### Pitfall 4: `display: contents` on the ScrollTrigger wrapper interfering with trigger measurement
**What goes wrong:** Using Tailwind's `contents` utility on `ScrollStoryProvider`'s wrapping `<div>` (to avoid an extra layout box) can, in some browser/GSAP-version combinations, cause `getBoundingClientRect()`-based trigger calculations to misbehave since `display: contents` elements don't have their own box.
**Why it happens:** `display: contents` deliberately removes the element's own box from layout/rendering while keeping its children — GSAP/ScrollTrigger don't need the wrapper's own box (they target children by selector), but this is a known rough edge in some setups.
**How to avoid:** Ship with `contents` first (simplest, zero layout impact); if any ScrollTrigger `start`/`end` positions measure incorrectly during manual QA, fall back to a plain unstyled wrapper `<div>` — the extra DOM node has no visible effect since it isn't styled.
**Warning signs:** ScrollTrigger effects firing at the wrong scroll position, or `markers: true` debug output (temporarily enable during QA) showing trigger lines in unexpected places.

### Pitfall 5: `annie-photo.jpg` staying at repo root
**What goes wrong:** Files outside `public/` are not servable by Next.js at all — importing `"/annie-photo.jpg"` in `next/image` will 404 (triggering the very `onError` fallback that's supposed to be for genuine failures, masking a simple misconfiguration as a "handled gracefully" state).
**Why it happens:** The file already exists at repo root (committed there during the sketch-prep work per git log) and it's easy to reference it in place instead of moving it.
**How to avoid:** Explicit `git mv annie-photo.jpg public/annie-photo.jpg` as its own task step, verified by loading `/about` and confirming the *real* photo renders (not the placeholder) before considering DSGN-05 done.
**Warning signs:** The About page always shows the "A" monogram placeholder even though a real photo file exists in the repo.

### Pitfall 6: Reduced-motion CSS override not reaching pseudo-elements
**What goes wrong:** The blanket `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { ... } }` override (already specified correctly in the UI-SPEC) can still fail in practice if a pseudo-element's animation is defined with a more specific selector that wins the cascade, or if `!important` is stripped by a CSS-in-JS/Tailwind layer ordering issue.
**Why it happens:** Tailwind v4's `@layer` system and `tw-animate-css` (already installed) both define their own animation utilities that may load after this override in the cascade if placed in the wrong `@layer`.
**How to avoid:** Place the reduced-motion override in `@layer base` (or after all other `@layer` blocks, unlayered) so it wins regardless of Tailwind's own layer ordering, and — per the UI-SPEC's own instruction — test with the actual OS-level `prefers-reduced-motion` setting toggled on, not just a code review.
**Warning signs:** Glow-box blob rotation or the marquee ticker still animating with the OS reduced-motion setting enabled.

## Code Examples

### Marquee ticker (optional/discretionary component, if built) — endless-loop spacing-seam fix
```css
/* Source: .claude/skills/sketch-findings-fde/references/visual-system-and-motion.md
   (validated during sketching — documented bug: flex `gap` on the outer track plus
   each duplicated <span> copy's own internal spacing creates a mismatched seam once
   per loop). Reuse verbatim if the ticker is built. */
.ticker { overflow: hidden; white-space: nowrap; }
.ticker-track { display: inline-flex; animation: ticker 22s linear infinite; }
.ticker-group { display: inline-flex; flex-shrink: 0; align-items: center; }
.ticker-track b { display: inline-block; margin-right: var(--space-8); font-weight: 700; }
@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
```

### Blanket reduced-motion CSS override (place after all `@layer` blocks in `globals.css`)
```css
/* Source: 06-UI-SPEC.md Motion & Performance Contract — verified as the correct
   universal-override pattern; placement note (Pitfall 6) added by this research. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|-------------------|---------------|--------|
| GSAP Club GreenSock (paid tier for `ScrollTrigger`/`SplitText`/`MorphSVG`/etc.) | All GSAP plugins free, including formerly-Club ones | April 2025, following Webflow's October 2024 GreenSock acquisition | Removes any licensing-cost concern for this project's lean/free-tier budget constraint — safe to use any GSAP plugin without a Club subscription. |
| `next/image`'s `onLoadingComplete` prop | `onLoad` prop | Deprecated in Next.js 14 | Irrelevant to this phase's `onError` use, but flagging so nobody reaches for the deprecated sibling prop by habit. |
| `next/dynamic({ssr:false})` usable anywhere | `ssr: false` restricted to Client Components only | Next.js 13+ App Router (unchanged through 16) | Directly affects how the GSAP wrapper must be structured — see Pitfall 2. |

**Deprecated/outdated:** `onLoadingComplete` (use `onLoad`); the UI-SPEC's literal `ssr: false` phrasing for `page.tsx`-level dynamic import (not itself "deprecated," just inapplicable to a Server Component in this architecture — see Pattern 1/Pitfall 2 for the corrected approach).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | `gsap` and `@gsap/react` are legitimate, non-malicious packages | Package Legitimacy Audit | Low in practice (strong manual evidence: 12-year-old official GreenSock/Webflow-org packages, 4M+/1M+ weekly downloads, no postinstall scripts) but tagged `[ASSUMED]` per protocol since `slopcheck` could not run in this environment — planner should add a `checkpoint:human-verify` before `npm install`. |
| A2 | `display: contents` on the `ScrollStoryProvider` wrapper won't break ScrollTrigger's measurement | Pattern 1 / Pitfall 4 | Low-medium — if wrong, ScrollTrigger effects fire at incorrect scroll positions; easy to detect via `markers: true` during manual QA and easy to fix (drop `contents`, accept the extra DOM node). |
| A3 | GSAP's "Standard 'no charge' license" fully permits this project's commercial/billed-client use without further action | Package Legitimacy Audit | Low — Webflow's own public announcement confirms unrestricted commercial free use, but this is a non-OSI custom license, not MIT/Apache; worth a founder skim of gsap.com/standard-license before shipping, not a blocker. |

## Open Questions

1. **Exact Core Web Vitals numbers this phase will actually hit**
   - What we know: the architectural choices in this research (SSR content + client-only animation layer touching only `transform`/`opacity`, self-hosted font with `display: swap`, explicit image dimensions) are all standard CWV-protective patterns.
   - What's unclear: actual LCP/CLS/INP numbers depend on final bundle size, image weights, and hosting (Netlify) cold-start behavior — none of which exist yet since this phase hasn't been built.
   - Recommendation: treat the Lighthouse CI run (see below) as the actual gate, not a number predicted in advance; if a run comes back over budget, the fix is almost always image weight or unnecessarily-broad `will-change` usage (see UI-SPEC's own INP guidance), not an architecture change.

2. **Whether `ScrollTrigger.batch()`'s selector-text approach will need `data-*` attributes added to every section, or whether existing className/structure already provides enough hooks**
   - What we know: `Hero`, `TheFix`, etc. were not built with GSAP targeting in mind (Phase 5 predates this phase's motion requirements).
   - What's unclear: whether their existing JSX structure already has sufficiently unique/stable classNames, or whether every targeted element needs a new `data-*` attribute added during the restyle pass.
   - Recommendation: the planner should treat "add stable selector hooks (className or data-*) to each section's animated elements" as an explicit task step within each section's restyle, not an assumed side effect of the palette/type restyle.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|--------------|-----------|---------|----------|
| Node.js / npm | Package installation, build | ✓ (implied by working `npm view` calls in this session) | — (see `.nvmrc`) | — |
| `gsap` / `@gsap/react` | DSGN-02 | ✗ (not yet installed — confirmed absent from `package.json`) | 3.15.0 / 2.1.2 (latest, to install) | none needed — install is the task |
| `@lhci/cli` (Lighthouse CI) | DSGN-04 verification gate | ✗ (not yet installed) | latest (recommend pinning at install time) | Manual Chrome DevTools mobile-throttled Lighthouse run if CI tooling is skipped — acceptable but less repeatable |
| Netlify Next.js Runtime v5 | Deployed CWV numbers reflect production hosting | Not verifiable from this local research pass | — | Test against local `next build && next start` if Netlify preview isn't available during planning |

**Missing dependencies with no fallback:** none — both `gsap`/`@gsap/react` and `@lhci/cli` are simple `npm install` additions with no environment blocker found.
**Missing dependencies with fallback:** Lighthouse CI tooling (fallback: manual DevTools runs, less repeatable but functional).

## Project Constraints (from CLAUDE.md)

- **Lean/free-tier budget:** `gsap`/`@gsap/react` are confirmed free (see Package Legitimacy Audit) — compliant. No new paid service introduced by this phase.
- **Solo maintainer:** Recommend `@lhci/cli` specifically because it's a scriptable, one-command re-run — aligns with "everything must be maintainable by one person." Avoid introducing any animation pattern that requires bespoke per-effect debugging tooling beyond GSAP's own `markers: true` dev flag.
- **AI features built on Claude:** Not implicated by this phase — Phase 6 is a pure visual/motion redesign with no Claude API surface.
- **Next.js App Router pattern (from Technology Stack doc):** This research's Pattern 1 (Server Components + one Client Component wrapper) is a direct application of the stack doc's stated rationale ("Server Components reduce client JS for the mostly-static marketing pages") — the GSAP wrapper is the one deliberate exception, scoped as narrowly as possible.
- **Tailwind CSS v4 CSS-first config:** No `tailwind.config.js` exists or should be introduced; all token changes go through `globals.css`'s `@theme inline` block and `:root`, consistent with the existing Phase 5 setup.

## Sources

### Primary (HIGH confidence)
- `npm view gsap version` / `npm view @gsap/react version` / `npm view gsap scripts` / `npm view gsap license` / `npm view @gsap/react peerDependencies` — direct registry ground truth, fetched 2026-07-20
- `api.npmjs.org/downloads/point/last-week/{gsap,@gsap/react}` — direct download-count ground truth, fetched 2026-07-20
- `nextjs.org/docs/app/api-reference/components/image` (fetched via WebFetch, doc version matches `next@16.2.10`, `lastUpdated: 2026-03-10`) — confirms `onError` prop is current/documented, `onLoadingComplete` is deprecated
- `gsap.com/docs/v3/GSAP/gsap.matchMedia()` (fetched via WebFetch 2026-07-20) — confirms exact `matchMedia`/conditions-object API
- Local codebase inspection (`src/app/page.tsx`, `src/app/layout.tsx`, `src/components/sections/*.tsx`, `src/components/ui/glow.tsx`, `src/app/globals.css`, `src/config/site.ts`, `src/app/sitemap.ts`, `public/`) — confirmed which sections are Server vs. Client Components today, current token/font setup, and asset locations

### Secondary (MEDIUM confidence)
- `github.com/greensock/gsap-skills` `SKILL.md` (fetched via WebFetch) — official GreenSock-authored agent-skill doc confirming the `useGSAP` + Next.js SSR guidance ("do not call gsap or ScrollTrigger during SSR")
- WebSearch aggregation on GSAP Webflow-acquisition free-license status (webflow.com/updates/gsap-becomes-free, discourse.webflow.com — cross-referenced across multiple independent sources)
- WebSearch aggregation on `next/dynamic({ssr:false})` App-Router restriction (multiple GitHub issues/discussions on `vercel/next.js`, cross-referenced)

### Tertiary (LOW confidence)
- General WebSearch results on Lighthouse CI mobile-throttling defaults (Moto G4 emulation, Slow 4G/150ms RTT/1.6Mbps) — widely repeated figures but not independently re-verified against a fresh Lighthouse source doc in this pass; treat as directionally correct, re-confirm exact throttling profile against `@lhci/cli`'s own README at install time.

## Metadata

**Confidence breakdown:**
- Standard stack (gsap/@gsap/react versions, licensing, Next.js font/image APIs): HIGH — directly verified via registry commands and official doc fetches.
- Architecture (Server-Component-preserving wrapper pattern, ssr:false restriction): HIGH — confirmed against official Next.js documentation/GitHub issues, not just training-data recall.
- Pitfalls (font-weight mismatch, display:contents edge case, reduced-motion cascade ordering): MEDIUM — logically derived from verified facts (JetBrains Mono weight subset, CSS cascade mechanics) but not independently reproduced in a running build during this research pass.
- CWV numeric outcomes: LOW/not applicable — no numeric target is asserted beyond the UI-SPEC's existing budget table; this phase hasn't been built yet, so no measurement exists to cite.

**Research date:** 2026-07-20
**Valid until:** 30 days (GSAP/Next.js APIs are stable; re-verify package versions if planning is delayed past mid-August 2026)
</content>
