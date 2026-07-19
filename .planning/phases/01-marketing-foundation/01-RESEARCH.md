# Phase 1: Marketing Foundation - Research

**Researched:** 2026-07-19
**Domain:** Next.js 16 marketing-site scaffold + deployment (Netlify), Cal.com scheduling embed, custom shadcn/ui + Tailwind v4 design-system implementation
**Confidence:** MEDIUM-HIGH overall — HIGH on Netlify/Next.js deployment mechanics (verified against current official docs and a live scaffold test), HIGH on the shadcn CLI's current behavior (verified by actually running it), MEDIUM on Cal.com React embed patterns (official docs are thin; pattern cross-verified across multiple sources and confirmed against the real npm package), LOW→flagged on anything dated before mid-2026 given how fast the shadcn CLI has moved this month.

## Summary

This phase is a walking-skeleton build: `create-next-app` scaffold → shadcn/ui init → design tokens (Fraunces + IBM Plex Sans, 60/30/10 color system) → four routes (`/`, `/about`, `/services`, `/book`) → Cal.com inline embed → deploy to Netlify → connect custom domain over HTTPS. Every piece of this is well-trodden in isolation, but two things surfaced in this research materially change how the walking skeleton should be built versus what the locked UI-SPEC assumes, and both are HIGH-confidence, directly-verified findings:

1. **The shadcn CLI has been substantially restructured very recently (as of this month, July 2026).** The exact init command the UI-SPEC locks in — `npx shadcn@latest init -b neutral -s new-york` — will not do what the UI-SPEC intends. `-b` no longer means "base color," it now selects the component-primitive base (`base` | `radix` | `aria`), Base UI (not Radix) is the new default, `-s` is now `--silent` (not `--style`), and the `--style` flag no longer exists at all — style selection now happens through a named preset system (`nova`, `vega`, `maia`, ...) or an interactive "Custom" flow. This was confirmed by actually running the CLI against a fresh Next.js 16 + Tailwind 4 scaffold (see Code Examples). The planner must replace the locked command with a corrected one and add an explicit reconciliation step.
2. **Netlify's current Next.js Runtime (v5, OpenNext-based) deploys Next.js 16 with zero configuration**, confirmed via official Netlify changelog and docs — this de-risks the walking-skeleton deploy step considerably. The one real gotcha is DNS: if the founder wants free Cloudflare Email Routing for the matching-domain founder email (D-05), the domain's DNS must be hosted at Cloudflare, not delegated to Netlify DNS — these are mutually exclusive, and this decision has to be made once, at domain-connect time, not revisited later.

**Primary recommendation:** Scaffold with `create-next-app@latest` (Next 16.2.10 / React 19.2.x / Tailwind 4.3.x, all current and verified), initialize shadcn with `npx shadcn@latest init -b radix` and select the "Custom" (or "Nova," then override) preset path rather than trying to force the UI-SPEC's literal flags, then do a dedicated theming pass to inject Fraunces/IBM Plex Sans and the 60/30/10 color tokens into the generated `globals.css`. Deploy to Netlify by connecting the git repo — no `netlify.toml` plugin pin required, but do pin `NODE_VERSION` and do decide the DNS-vs-email tradeoff before connecting the custom domain.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Booking scheduler & flow**
- **D-01:** Use **Cal.com** (free tier) over Calendly — more generous free tier (unlimited event types, embeds allowed), open-source, no "Powered by Calendly" lock-in pressure. A single event type: "Free Audit Call" (30 min).
- **D-02:** Every "Book Your Free Audit Call" CTA (header, hero, footer, sticky mobile bar) links to a dedicated **`/book` page with an inline Cal.com embed** — one place to load the widget, one place for the UI-SPEC's failed-to-load error state, works identically on mobile, and gives a linkable URL for emails/social. No popup modals in Phase 1.
- **D-03:** The `/book` page must render the UI-SPEC error state if the embed fails, with the founder-email fallback.

**Domain & founder identity**
- **D-04:** Purchase the production domain **during Phase 1** — SITE-05's "matching email domain" success criterion cannot pass on a Netlify subdomain. Domain name choice is **NEEDS-FOUNDER**. Build and preview on the free Netlify subdomain until it's connected.
- **D-05:** Founder email on the matching domain via a **free email-forwarding route** (registrar forwarding or Cloudflare Email Routing → existing inbox) — no paid Google Workspace yet. Sending-from-domain can wait until Phase 3 (Resend handles transactional).
- **D-06:** All identity values (site name, domain, founder email, region, Cal.com link) live in **one typed site-config module** (e.g., `src/config/site.ts`) — single edit point when the domain lands; no string literals scattered through pages.
- **D-07:** Real founder photo is **NEEDS-FOUNDER** and a launch blocker per UI-SPEC (no stock/AI headshot, non-negotiable). Use an obviously-temporary local placeholder during development, tracked as an unchecked launch-checklist item.

**Site structure & homepage sections**
- **D-08:** Four routes: `/` (Home), `/about`, `/services`, `/book`. Nav order: **Services, About** + primary CTA button. Footer carries page links, contact email, region, and CTA repeat.
- **D-09:** Homepage below the hero + demo-placeholder (stay the focal point), in order: (1) Outcomes section — asymmetric, not a uniform 3-card grid; (2) How the engagement works — audit → project → retainer on a dark ink-navy band, linking to `/services`; (3) Who this is for — four verticals as plain pain-point copy, teaser only, no links yet; (4) Founder credibility strip — photo + one-line FDE story, linking to `/about`; (5) Final CTA band.
- **D-10:** No separate contact page — footer email + `/book` cover contact.

**Copy sourcing & voice**
- **D-11:** Claude drafts all copy; Annie reviews/edits before launch. Copy review is an explicit launch-checklist item.
- **D-12:** Voice: ROI-first, plain language, zero AI jargon on the homepage headline. Company-first brand; founder story is the credibility layer, not the whole identity.
- **D-13:** Biographical specifics for the FDE story are **NEEDS-FOUNDER** — Claude drafts structure/tone with bracketed factual placeholders; no invented biography facts.

### Claude's Discretion
- Exact section copy, headline variants, and micro-interaction implementation details (within UI-SPEC's stated limits).
- Next.js project layout, component file organization, metadata/SEO basics (titles, descriptions, OG tags), sitemap/robots.
- Netlify configuration details (build settings, redirects, headers).

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope. Verticals mention on the homepage is teaser copy only; dedicated pages remain Phase 4.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SITE-02 | Visitor can read an About page telling the founder's FDE story | Founder credibility block pattern (Architecture Patterns); site-config module for identity values (D-06); NEEDS-FOUNDER biography placeholder pattern documented in Assumptions/Open Questions |
| SITE-03 | Visitor can read a Services page explaining audit → project → retainer plainly | Numbered/sequential flow pattern (not card grid) — see Architecture Patterns and Anti-Patterns; UI-SPEC component inventory |
| SITE-04 | Visitor can book a call via persistent scheduling CTA (Cal.com embed on every page) | Cal.com `@calcom/embed-react` integration pattern, `getCalApi` gotchas, error-state handling — see Code Examples and Common Pitfalls |
| SITE-05 | Mobile-responsive, fast, HTTPS, real founder identity (name/photo/region/matching email domain) | Netlify automatic HTTPS via Let's Encrypt (verified); domain DNS vs. email-forwarding tradeoff (Common Pitfalls); site-config module (D-06) |
| SITE-06 | Distinctive, non-templated visual design passing the "human designer" test | shadcn CLI reconciliation (Critical Pitfall #1); Fraunces/IBM Plex Sans font-loading pattern; Tailwind v4 `@theme inline` token structure — see Code Examples |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Marketing pages (Home, About, Services) | Frontend Server (SSR/SSG) | — | Fully static content, no data dependencies; Next.js App Router renders these as static/SSG output at build time, served from Netlify's CDN edge |
| Persistent booking CTA (header/footer/sticky bar) | Browser / Client | Frontend Server | The CTA itself is server-rendered markup (a plain link to `/book`); no client JS required until `/book` itself loads the embed |
| Cal.com inline embed (`/book` page) | Browser / Client | — | `@calcom/embed-react` is a client-side widget that loads a third-party iframe/script; must be a Client Component (`"use client"`); no server-side proxy needed since no secret is involved (Cal.com links are public scheduling URLs) |
| Site identity/config (name, domain, email, Cal.com link) | Frontend Server | — | Single typed module (`src/config/site.ts`) imported at build/render time by both server and client components; not a runtime API, just shared constants |
| Mobile nav / sheet, sticky CTA bar | Browser / Client | — | Interactive UI state (open/close), must be a Client Component |
| DNS / domain / HTTPS | CDN / Static (Netlify edge) | — | Handled entirely by Netlify's edge + Let's Encrypt integration; no application code involved |
| Design tokens / fonts | Frontend Server (build-time) | — | `next/font/google` self-hosts and inlines font files at build time; Tailwind v4 `@theme` tokens compiled into static CSS at build time |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|---------------|
| next | 16.2.10 | Framework | [VERIFIED: npm registry] Matches CLAUDE.md's locked recommendation (16.x). Confirmed current via `npm view next version` and via a live `create-next-app` scaffold run in this session. |
| react / react-dom | 19.2.7 (registry latest) / 19.2.4 (what `create-next-app` actually installed) | UI library | [VERIFIED: npm registry + live scaffold] Ships automatically with `create-next-app@latest`; do not hand-pin a different version. |
| typescript | 5.x (installed automatically by `create-next-app --ts`) | Type safety | [CITED: nextjs.org/docs] Locked by CLAUDE.md; scaffold installs latest 5.x automatically. |
| tailwindcss | 4.3.3 | Styling | [VERIFIED: npm registry] CSS-first config (`@import "tailwindcss"` in `globals.css`, no `tailwind.config.js`) — confirmed by inspecting the actual `globals.css` a fresh `create-next-app --tailwind` scaffold produces in this session. |
| shadcn | 4.13.1 | Component CLI / registry client | [VERIFIED: npm registry + live CLI run] **Not the same tool as the UI-SPEC's assumed CLI** — this is a major-version-bumped rewrite from what "new-york style / neutral base" tutorials describe. See Critical Pitfall #1. |
| @calcom/embed-react | 1.5.3 | Cal.com React embed component | [VERIFIED: npm registry] Peer deps `react: ^18.2.0 || ^19.0.0`, `react-dom` same — confirmed compatible with React 19. Last published 2026-05-06 — actively maintained. |
| lucide-react | 1.25.0 | Icon library | [VERIFIED: npm registry] Locked by UI-SPEC component inventory; installed automatically by shadcn init. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| class-variance-authority | 0.7.1 (registry latest; shadcn CLI installs its own pinned compatible version automatically) | Variant styling for shadcn components | Installed automatically by `shadcn init` — do not add manually first, let the CLI manage it. |
| tailwind-merge | 3.4.0 | Merging Tailwind class strings in `cn()` util | Installed automatically by `shadcn init` as part of `lib/utils.ts` scaffolding. |
| radix-ui | (unified package, installed automatically) | Underlying accessible primitives when `-b radix` is selected | [VERIFIED: live CLI run] Radix has consolidated from many `@radix-ui/react-*` packages into a single `radix-ui` package — confirmed in the generated `button.tsx` (`import { Slot } from "radix-ui"`). Do not add legacy `@radix-ui/react-slot`-style packages manually. |
| next/font/google | built into Next.js | Self-hosted Fraunces + IBM Plex Sans loading | No external font CDN calls, no FOUT, per UI-SPEC requirement. See Code Examples for the exact gotcha with IBM Plex Sans weights. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Cal.com inline embed via `@calcom/embed-react` | Raw `<iframe>` to the public booking page | Loses the `getCalApi` UI-config hooks (theme, layout, hiding event-type details) and the official failed-to-load event hooks; not recommended, embed-react is the maintained path |
| shadcn "Nova" preset (Radix base) | Hand-author `components.json` + individually copy component source from `ui.shadcn.com` (bypassing CLI presets entirely) | More control over avoiding preset-injected Geist fonts/Nova-specific button styling from the start, at the cost of losing the CLI's automatic dependency installation and future `add` command convenience. Given the design system must be heavily overridden anyway (custom fonts, custom colors, custom radius) either path converges on similar effort — CLI-init-then-override is faster to start from. |
| Netlify's zero-config Next.js Runtime v5 | Manually configuring `@netlify/plugin-nextjs` with a pinned version in `netlify.toml` | Only needed if you want to lock the adapter version instead of always tracking latest — not recommended per Netlify's own guidance (they advise against pinning) |

**Installation:**
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --turbopack
npx shadcn@latest init -b radix   # then select a preset interactively — see Critical Pitfall #1 before scripting this non-interactively
npm install @calcom/embed-react
npx shadcn@latest add button card badge navigation-menu sheet separator skeleton
```

**Version verification:** All versions above were confirmed live in this research session via `npm view <package> version` against the public npm registry (2026-07-19), and `next`/`tailwindcss`/`react` were additionally confirmed by actually scaffolding a throwaway project and inspecting the resulting `package.json`.

## Package Legitimacy Audit

`slopcheck` (npm package, not a PyPI package — the generic install command in the protocol assumes PyPI; it is actually distributed via npm) was installed and run successfully in this session (`npx`-free, explicit `npm install slopcheck@0.2.0` followed by direct binary invocation — never used bare `npx --yes`). It scans markdown/config files for npm package name references and cross-checks the registry; all candidate packages passed with zero findings.

| Package | Registry | Age | Downloads (last 7d) | Source Repo | slopcheck | Disposition |
|---------|----------|-----|----------------------|--------------|-----------|-------------|
| next | npm | 15 yrs (first publish 2011) | 42.9M | github.com/vercel/next.js | OK | Approved |
| react / react-dom | npm | 14-15 yrs | 146M / — | github.com/facebook/react | OK | Approved |
| tailwindcss | npm | 9 yrs | 108.8M | github.com/tailwindlabs/tailwindcss | OK | Approved |
| shadcn | npm | ~2 yrs (first publish 2024) | 6.1M | github.com/shadcn-ui/ui | OK | Approved (see Critical Pitfall #1 for CLI-behavior caveat — legitimacy is not the issue, currency of assumed usage patterns is) |
| @calcom/embed-react | npm | 4 yrs | 359K | github.com/calcom/cal.com | OK | Approved |
| lucide-react | npm | 6 yrs | 85.8M | github.com/lucide-icons/lucide | OK | Approved |
| class-variance-authority | npm | 4 yrs | 53.7M | github.com/joe-bell/cva | OK | Approved |
| tailwind-merge | npm | 5 yrs | 69.1M | github.com/dcastil/tailwind-merge | OK | Approved |
| eslint-config-next | npm | 11 yrs (same repo as next) | — | github.com/vercel/next.js | OK | Approved |
| `@calcom/react-widget` (found in a low-quality Medium tutorial during this research) | — | N/A | N/A | N/A | N/A — 404 on npm registry | **REMOVED — do not use.** This package does not exist on the npm registry (`npm view @calcom/react-widget` → 404). A tutorial article presented it as a valid alternative install path; it is not. Flagged here explicitly so it never enters a task list. |

No `postinstall` scripts were found on any approved package via `npm view <pkg> scripts.postinstall`.

**Packages removed due to slopcheck / registry verification:** `@calcom/react-widget` (hallucinated/nonexistent — found via a tutorial source, not slopcheck itself, but the same class of risk the legitimacy gate exists to catch).
**Packages flagged as suspicious [SUS]:** none.

## Architecture Patterns

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                          VISITOR (Browser)                            │
│  requests /, /about, /services, /book                                 │
└───────────────────────────────┬───────────────────────────────────────┘
                                 │ HTTPS (Netlify-provisioned Let's Encrypt cert)
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    NETLIFY EDGE / CDN                                 │
│   Serves statically-generated HTML/CSS/JS for all 4 routes            │
│   (Next.js App Router — no server data-fetching in Phase 1, so every  │
│    route is fully static/SSG; no Route Handlers needed until Phase 2) │
└───────────────────────────────┬───────────────────────────────────────┘
                                 │
              ┌──────────────────┴───────────────────┐
              ▼                                       ▼
  ┌────────────────────────┐              ┌─────────────────────────────┐
  │ Home / About / Services │              │ /book (Client Component)     │
  │ (Server Components,     │              │  <Cal calLink=... />         │
  │  fully static)          │              │  loads Cal.com iframe/script │
  │  header/footer/sticky   │              │  from an external cal.com    │
  │  CTA link to /book      │              │  origin at runtime            │
  └────────────────────────┘              └───────────────┬───────────────┘
                                                            │ visitor's browser
                                                            │ fetches directly —
                                                            ▼ no app backend hop
                                              ┌──────────────────────────┐
                                              │   Cal.com (3rd party)     │
                                              │   hosted scheduling UI    │
                                              └──────────────────────────┘
```

A reader can trace the primary use case end to end: a visitor lands on `/`, reads the ROI-first hero and section content (fully static, edge-cached), clicks the persistent "Book Your Free Audit Call" CTA anywhere on the site, arrives at `/book`, and the browser loads the Cal.com embed directly from Cal.com's own servers (no app server involved in this phase — no API key, no proxy, unlike the Phase 2 demo architecture). If the embed script fails to load, the `/book` page shows the UI-SPEC's error state with the founder-email fallback.

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx           # Root layout: font loading (Fraunces + IBM Plex Sans), header, footer, sticky mobile CTA
│   ├── page.tsx              # Home
│   ├── about/page.tsx
│   ├── services/page.tsx
│   ├── book/page.tsx         # Cal.com inline embed + error state
│   ├── sitemap.ts
│   ├── robots.ts
│   └── globals.css           # Tailwind v4 @theme tokens + shadcn CSS variables, overridden per UI-SPEC
├── components/
│   ├── ui/                   # shadcn-generated primitives (button, card, badge, navigation-menu, sheet, separator, skeleton)
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   ├── sticky-cta-bar.tsx
│   ├── cal-embed.tsx         # Client Component wrapping @calcom/embed-react
│   └── sections/             # Homepage section components (outcomes, engagement-flow, verticals-teaser, founder-strip, final-cta)
├── config/
│   └── site.ts               # D-06: single typed source of truth for name/domain/email/region/calLink
└── lib/
    └── utils.ts               # cn() helper (shadcn-generated)
```

### Structure Rationale
- **`config/site.ts` as the single identity source (D-06):** every place that currently needs a placeholder (founder email in the error state, the Cal.com link, the domain-dependent metadata) imports from here — this is the one file that gets edited when the real domain lands, rather than a repo-wide find/replace.
- **`components/cal-embed.tsx` isolated as its own Client Component:** keeps the `"use client"` boundary as small as possible — everything else in `/book/page.tsx` (surrounding copy, layout) can stay a Server Component, only the embed itself needs client-side JS.
- **No `app/api/` directory in Phase 1:** unlike the project's overall architecture (which will add `/api/demo/*` and `/api/audit/*` in later phases), Phase 1 has zero server-side secrets or mutations — the Cal.com embed talks to Cal.com directly from the browser using only a public scheduling link, not an API key. Introducing a Route Handler here would be premature.

### Pattern 1: Client-Side Third-Party Embed (Cal.com), No Server Proxy Needed

**What:** Unlike the Claude API integration pattern (Phase 2+), which requires a server-side proxy because it holds a secret, the Cal.com embed uses only a public, non-secret scheduling link (`username/event-type-slug`). It is safe to call directly from the browser.
**When to use:** Any embed where the "credential" is just a public link, not an API key.
**Trade-offs:** None significant — this is the simplest integration in the whole project.

```tsx
// src/components/cal-embed.tsx
"use client";

import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { siteConfig } from "@/config/site";

export function CalEmbed() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cal = await getCalApi({ namespace: "free-audit-call" });
        // NOTE: set theme in exactly one place — either here or via the
        // `config` prop below, never both (see Common Pitfalls: theme flash).
        cal("ui", {
          theme: "light",
          hideEventTypeDetails: false,
          layout: "month_view",
          styles: { branding: { brandColor: "#1F6E4A" } }, // UI-SPEC accent
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <div role="alert" className="border border-destructive text-destructive p-6 rounded-lg">
        Couldn&apos;t load the booking calendar. Email {siteConfig.founderName} directly at{" "}
        <a href={`mailto:${siteConfig.founderEmail}`}>{siteConfig.founderEmail}</a> and she&apos;ll
        find a time — usually within one business day.
      </div>
    );
  }

  return (
    <Cal
      namespace="free-audit-call"
      calLink={siteConfig.calLink}
      style={{ width: "100%", height: "100%", minHeight: "700px", overflow: "scroll" }}
      config={{ layout: "month_view" }}
    />
  );
}
```
```tsx
// src/config/site.ts (D-06)
export const siteConfig = {
  name: "AI Deployed",
  founderName: "Annie", // NEEDS-FOUNDER: confirm publicly-presented name (D-13)
  founderEmail: "PLACEHOLDER — resolve before launch (D-04/D-05 blocker)",
  region: "PLACEHOLDER — NEEDS-FOUNDER",
  calLink: "PLACEHOLDER — set once the Cal.com 'Free Audit Call' event type is created (D-01)",
} as const;
```
*Source: pattern synthesized from Cal.com's official React embed guidance (developer.cal.com/embed/install-with-react, which points to a live snippet generator rather than static docs) cross-checked against multiple independent working examples — [CITED: cal.com/docs] for the existence and shape of `getCalApi`/`Cal` component, [ASSUMED] for the exact config-object shape shown (WebSearch-aggregated, not pulled verbatim from a single authoritative snippet — verify against the in-app Embed Snippet Generator once the real Cal.com account/event type exists, since Cal.com states snippets are "automatically updated as per the cal.com instance").*

### Pattern 2: Design Tokens via Tailwind v4 `@theme` + shadcn CSS Variables (Reconciled with UI-SPEC)

**What:** Tailwind v4's CSS-first config means design tokens live directly in `globals.css` as CSS custom properties, re-exposed to Tailwind utilities via `@theme inline`. The current shadcn CLI (as of this session) generates this structure automatically with OKLCH color values and a `--radius` scale — the planner's job is to *override* the generated `:root`/`.dark` blocks with the UI-SPEC's actual palette and fonts, not to build this structure from scratch.
**When to use:** Immediately after `shadcn init` completes, before any page content is built.
**Trade-offs:** The CLI-generated starting point ships a specific preset aesthetic (rounded-lg buttons, a Nova-style radius scale, Geist fonts) that actively conflicts with several UI-SPEC anti-pattern gates (restrained single radius, no default SaaS look) — budget an explicit theming task, don't assume `shadcn init` output is launch-ready.

```css
/* src/app/globals.css — after shadcn init, override the generated :root block */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@theme inline {
  --font-sans: var(--font-ibm-plex-sans);   /* overrides the CLI's Geist default */
  --font-heading: var(--font-fraunces);      /* overrides the CLI's font-sans fallback */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);          /* map to UI-SPEC's #1F6E4A accent */
  /* ...remaining shadcn-generated --color-* mappings kept as-is */
}

:root {
  --background: #FAF9F6;       /* UI-SPEC dominant 60% — warm paper */
  --foreground: #1A2432;       /* UI-SPEC body text on paper */
  --primary: #1F6E4A;          /* UI-SPEC accent 10% — deep signal green, CTA-only */
  --primary-foreground: #FAF9F6;
  --destructive: #B3261E;      /* UI-SPEC destructive/error */
  --radius: 0.5rem;            /* pick ONE restrained radius per UI-SPEC anti-pattern gate;
                                   overrides the CLI default of 0.625rem with sub-scaled
                                   --radius-sm/md/lg/xl derived from it */
}
```
```tsx
// src/app/layout.tsx
import { Fraunces, IBM_Plex_Sans } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],       // Fraunces is a true variable font — no weight array needed
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],  // IBM Plex Sans is NOT variable on Google Fonts — must specify weights explicitly, or the build errors. See Common Pitfalls.
  variable: "--font-ibm-plex-sans",
  display: "swap",
});
```
*Source: [VERIFIED: live scaffold] `@theme inline` structure and `--radius-*` derivation confirmed by inspecting a real `shadcn init` output in this session. [CITED: nextjs.org/docs/app/api-reference/components/font] for `next/font/google` variable-font handling. [CITED via WebSearch, cross-verified against IBM/plex GitHub issues] for the IBM Plex Sans "not variable, must specify weight" gotcha.*

### Pattern 3: Numbered/Sequential Service Model Flow (Not a Card Grid)

**What:** UI-SPEC explicitly bans a uniform 3-card grid for the audit → project → retainer model (SITE-06 anti-pattern gate). Render it as a sequential flow where step 1 ("free") gets the most visual weight, using layout (not icons) to differentiate steps.
**When to use:** Services page, and the homepage's compressed "how the engagement works" band.
**Trade-offs:** More custom CSS than dropping in a stock 3-card shadcn block, but this is precisely the kind of decision that determines whether SITE-06's "would a design-savvy visitor believe a human designer made this" test passes.

```tsx
// Conceptual structure — not a literal shadcn <Card> repeated 3x
<ol className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-8">
  <li>{/* Step 1: Free Audit — largest column, most copy */}</li>
  <li>{/* Step 2: Fixed-Scope Project — standard column */}</li>
  <li>{/* Step 3: Monthly Retainer — standard column */}</li>
</ol>
```

### Anti-Patterns to Avoid
- **Scripting `npx shadcn@latest init -b neutral -s new-york` verbatim (as UI-SPEC's frontmatter literally states):** this will fail or silently do the wrong thing against the current CLI — see Critical Pitfall #1.
- **Leaving the CLI-injected Geist font wiring in `layout.tsx`:** the UI-SPEC's SITE-06 gate specifically calls out Inter/Geist-style defaults as the #1 "looks AI-generated" tell — the CLI ships exactly that by default and it must be explicitly removed/replaced, not just supplemented.
- **Setting Cal.com's theme in both the `config` prop and the `getCalApi` `ui()` call:** documented to cause a rapid light/dark flash (see Common Pitfalls).
- **Using `output: 'export'` in `next.config.ts`:** this forces a fully static export and will break Route Handlers/Server Actions the moment Phase 2/3 need them — leave `output` unset and let Netlify's zero-config adapter handle the hybrid rendering.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| Scheduling calendar UI, timezone handling, availability logic | A custom booking form + calendar picker | Cal.com inline embed (`@calcom/embed-react`) | D-01 already locks this; timezone/availability logic is a deceptively complex, high-liability surface (double-booking, DST bugs) that Cal.com already solves |
| Accessible dropdown/sheet/nav primitives | Custom `useState`-driven mobile menu with manual focus-trapping | shadcn's `sheet` (Radix `Dialog` under the hood) | Radix primitives handle focus trapping, ARIA attributes, and escape-key/outside-click dismissal correctly — a hand-rolled mobile nav is a common source of accessibility bugs, and UI-SPEC explicitly requires `aria-label` correctness on the toggle |
| SSL/TLS certificate provisioning and renewal | Manual cert management | Netlify's automatic Let's Encrypt integration | Free, automatic renewal, zero maintenance — exactly matches the lean/solo-founder constraint |
| Sitemap/robots.txt generation | Hand-written static files | Next.js `sitemap.ts` / `robots.ts` file conventions | Type-safe, stays in version control, regenerates automatically as routes are added in later phases |

**Key insight:** Every piece of custom-build temptation in this phase (a hand-rolled scheduler, a hand-rolled mobile nav) is exactly the kind of "impressive to build, invisible to the buyer, high bug-risk" work Pitfall 10 in the project's own PITFALLS.md research warns against (over-engineering instead of shipping to validate). Phase 1's actual differentiator is the *design system* (typography, color, art direction), not infrastructure — spend the custom-build effort there.

## Common Pitfalls

### Pitfall 1 (CRITICAL): The UI-SPEC's Locked shadcn Init Command Is Stale Against the Current CLI

**What goes wrong:** Running `npx shadcn@latest init -b neutral -s new-york` exactly as the UI-SPEC's frontmatter specifies either errors out (`-b neutral` is not a valid value for the current `--base <base>` flag, which only accepts `base|radix|aria`) or silently does something unintended (`-s` is now `--silent`, a boolean flag, not `--style`).
**Why it happens:** The shadcn CLI underwent a major restructuring very recently (base-library selection added, Base UI became the new default, style names changed from `new-york`/`default` to composite preset names like `radix-nova`). The UI-SPEC was authored against the older, more widely-documented CLI shape that most current tutorials (including ones surfaced by web search during this research) still describe — this is a live example of the "Deprecated Features" trap: search results and training data both skew toward the older, more commonly-documented behavior.
**How to avoid:** The planner should replace the literal locked command with a corrected scaffolding task:
1. Run `npx shadcn@latest init -b radix` (forces Radix primitives, matching UI-SPEC's "Component library: Radix primitives" requirement — Base UI is now the default and would silently violate that requirement if `-b radix` is omitted).
2. When prompted for a preset, either select **Custom** for maximum control, or select **Nova** and treat its output as a starting point that gets fully overridden in the theming pass (Pattern 2) — both were verified to produce a working `radix-nova` style with `baseColor: "neutral"` in `components.json`, which does satisfy the UI-SPEC's underlying *intent* (Radix + neutral) even though the *label* is no longer literally "new-york."
3. Treat `components.json`'s `"style"` value as whatever the CLI produces (e.g., `"radix-nova"`) — do not attempt to hand-force it to the literal string `"new-york"`, which is not accepted by the current CLI/schema pairing observed in this session.
4. Immediately after init, do the theming override pass (Pattern 2) to strip the Nova preset's Geist fonts and rounded-lg/shadow defaults, replacing them with UI-SPEC's Fraunces/IBM Plex Sans and restrained radius.
**Warning signs:** `components.json` after init shows anything other than `"baseColor": "neutral"` and a style value starting with `radix-` — if it shows `base-` or `aria-`, the `-b radix` flag was dropped somewhere and the wrong primitive library got installed.
**Phase to address:** Phase 1, Wave 0 (scaffolding task) — this blocks every subsequent UI task in the phase, so it must be resolved and verified (by actually running the command and inspecting `components.json`) before component-building tasks begin, not discovered mid-build.

### Pitfall 2: `@calcom/react-widget` Is Not a Real Package

**What goes wrong:** A moderately-ranked tutorial (surfaced during this research) presents `npm install @calcom/react-widget` with a `<CalcomWidget>` component as a valid, simpler alternative to `@calcom/embed-react`. It does not exist on the npm registry (confirmed 404 in this session).
**Why it happens:** Classic tutorial-content hallucination/staleness — the article may be describing a since-removed or never-real package, or conflating it with something else.
**How to avoid:** Only use `@calcom/embed-react` (the official, verified, actively-maintained package — see Package Legitimacy Audit). Never let a task reference `@calcom/react-widget`.
**Warning signs:** `npm install` failing with a 404 for any `@calcom/*` package other than `embed-react`, `embed-core`, or `embed-snippet`.
**Phase to address:** Phase 1, `/book` page implementation task.

### Pitfall 3: Cal.com Embed Renders an Empty Div (Historical Ref-Forwarding Bug)

**What goes wrong:** Older versions of `@calcom/embed-react` had a bug where the component tried to pass `ref` as a plain prop to a div, producing a console warning ("ref is not a prop...") and a container that never populates with the actual calendar iframe.
**Why it happens:** A ref-forwarding implementation bug in the library, reported against Next.js 14/React 18 usage; fixed via a since-merged PR.
**How to avoid:** Use the current version (1.5.3, verified current in this session, published well after the reported fix) rather than pinning to an old version. If the embed ever renders an empty container in local testing, check the browser console for ref-related warnings first before assuming it's a config/calLink problem.
**Warning signs:** `/book` page shows a container with no visible calendar and a console warning mentioning "ref."
**Phase to address:** Phase 1, `/book` page implementation and its manual verification step.

### Pitfall 4: Cal.com Theme Flash (Setting Theme in Two Places)

**What goes wrong:** Setting `theme` both via the `config`/`data-cal-config` prop on the `<Cal>` component AND via the `getCalApi()` → `cal("ui", { theme: ... })` call causes the embed to rapidly flash between light/dark during initialization.
**How to avoid:** Set theme in exactly one place — this research recommends the `getCalApi` `ui()` call (Pattern 1 code example), since it's also where the accent-color branding is set, keeping all embed configuration in one spot.
**Phase to address:** Phase 1, `/book` page implementation.

### Pitfall 5: IBM Plex Sans Build Failure — Missing `weight` Array

**What goes wrong:** IBM Plex Sans is **not** a variable font on Google Fonts (unlike Fraunces, which is). Calling `IBM_Plex_Sans({ subsets: ["latin"] })` without an explicit `weight` array throws a build-time error from `next/font/google`.
**How to avoid:** Always specify `weight: ["400", "600"]` (matching UI-SPEC's exactly-2-weight-values requirement) when loading IBM Plex Sans. Fraunces, being variable, does not need a weight array — use `axes: ["opsz"]` instead if the optical-size axis should be controllable.
**Warning signs:** Build fails immediately on first `next build`/`next dev` with an error naming the font and mentioning "weight."
**Phase to address:** Phase 1, font-loading/theming task (Wave 0 or the first design-system task).

### Pitfall 6: DNS Provider Choice Locks Out Cloudflare Email Routing

**What goes wrong:** D-05 wants free email forwarding for the matching-domain founder email, and Cloudflare Email Routing is a commonly-recommended free option — but Cloudflare Email Routing **requires the domain's DNS to be hosted at Cloudflare**. If the domain's nameservers get delegated to Netlify DNS instead (a natural choice when connecting a custom domain to a Netlify site), Cloudflare Email Routing becomes unavailable without switching DNS providers later — a disruptive change once the site is live.
**Why it happens:** Netlify's custom-domain setup flow nudges toward "let Netlify manage your DNS" for simplicity, without surfacing the email-routing tradeoff.
**How to avoid:** Decide DNS ownership *before* connecting the domain: if Cloudflare Email Routing is the intended free-forwarding path, keep the domain's nameservers at Cloudflare (or the registrar) and point Cloudflare's DNS records at Netlify (an apex `CNAME`-flattened record or `A` record to Netlify's load balancer `75.2.60.5`, plus a `www` `CNAME` to `<site>.netlify.app`) rather than delegating to Netlify DNS. If the founder instead prefers pure registrar-level email forwarding (no Cloudflare involved at all), Netlify DNS is fine.
**Warning signs:** Domain connected via Netlify DNS delegation, then a later attempt to enable Cloudflare Email Routing fails or requires a nameserver change that causes a brief outage.
**Phase to address:** Phase 1, domain-connection task (D-04) — this decision should be made explicitly, once, and documented in `site.ts`'s surrounding comments or a launch-checklist note, not discovered during Phase 3 when Resend/email actually starts mattering.

### Pitfall 7: Netlify Edge Function Bundling Fails on CommonJS Dependencies in Middleware

**What goes wrong:** If a `middleware.ts` (or Next.js 16's new `proxy.ts`) pulls in a CommonJS-only dependency, Netlify's Edge Function bundler fails with "Failed to load external module" errors, because Netlify's Next.js Runtime converts Next.js middleware to Netlify Edge Functions, which require ES modules.
**Why it happens:** Documented Netlify support-forum issue for Next.js 16 projects.
**How to avoid:** Phase 1 has no middleware/proxy requirement (no admin auth yet — that's Phase 3), so this is **not currently a blocker**, but flag it now: when Phase 3 adds the `/admin` shared-secret cookie check (per the project's overall architecture), verify any dependency used inside `middleware.ts`/`proxy.ts` is ESM-compatible before relying on it.
**Phase to address:** Not Phase 1 — flagged here for the Phase 3 planner's awareness, since it directly affects the "single shared-secret cookie check in middleware" pattern the project's architecture research already recommends.

### Pitfall 8: Next.js 16's `middleware.ts` → `proxy.ts` Split

**What goes wrong:** Next.js 16 splits the old `middleware.ts` into a network-level `proxy.ts` (URL rewriting, header injection, geolocation — Node.js runtime by default) as a conceptually separate layer. Code written against Next.js 15-era `middleware.ts` tutorials may reference an API surface that's been reorganized.
**How to avoid:** Not applicable to Phase 1 (no middleware needed). Documented here so redirects/headers work, if ever needed at the Next.js config layer instead of `netlify.toml`, are written against the current Next.js 16 file convention rather than a stale one.
**Phase to address:** N/A for Phase 1; awareness item for any future phase adding middleware.

## Code Examples

Verified patterns from this session's direct tool use (live CLI runs, live registry checks) and official/cross-verified sources:

### Actual `components.json` produced by `npx shadcn@latest init -b radix` + "Nova" preset (ground truth, this session)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
```
*Source: [VERIFIED: live CLI run] this exact output was produced in this research session against a fresh `create-next-app` (Next 16.2.10, Tailwind 4, App Router, `src/` dir) scaffold.*

### Current `shadcn init` CLI help (ground truth, this session)
```
Usage: shadcn init|create [options] [components...]

Options:
  -t, --template <template>  the template to use. (next, start, vite, react-router, laravel, astro)
  -b, --base <base>          the component library to use. (base, radix, aria)
  --monorepo                 scaffold a monorepo project.
  -p, --preset [name]        use a preset configuration
  -y, --yes                  skip confirmation prompt. (default: true)
  -d, --defaults             use default configuration: --template=next --preset=base-nova (default: false)
  -f, --force                force overwrite of existing configuration.
  -c, --cwd <cwd>            the working directory.
  -n, --name <name>          the name for the new project.
  -s, --silent               mute output. (default: false)
  --css-variables            use css variables for theming. (default: true)
  --rtl                      enable RTL support.
  --pointer                  enable pointer cursor for buttons.
```
*Source: [VERIFIED: live CLI run], `shadcn@4.13.1`, 2026-07-19. Available named presets confirmed interactively: `nova, vega, maia, lyra, mira, luma, sera, rhea` plus an interactive-only "Custom" option (the string `"custom"` is not a valid value for the `--preset` flag directly — confirmed by testing `--preset custom`, which errors with "Invalid preset").*

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| shadcn `init --style new-york --base-color neutral` | shadcn `init -b radix` + named preset (`nova`, `vega`, ...) or interactive "Custom" flow; `components.json` `"style"` field now holds composite values like `"radix-nova"` | Recently (within the current 4.x CLI line, active as of July 2026) | Any pre-2026 tutorial or the UI-SPEC's own locked command is stale; must be corrected per Critical Pitfall #1 |
| Individual `@radix-ui/react-*` packages | Single consolidated `radix-ui` package | Confirmed via live scaffold in this session (button.tsx imports `{ Slot } from "radix-ui"`) | Don't manually add legacy per-primitive Radix packages; the CLI already manages the consolidated dependency |
| Next.js `middleware.ts` for all edge logic | Split into `proxy.ts` (network-level: rewrites, headers, geolocation) vs. narrower `middleware.ts` scope | Next.js 16 | Not relevant to Phase 1 (no middleware yet), relevant to Phase 3's admin-gate work |
| Webpack as default bundler | Turbopack stable and default for both `next dev` and `next build` in Next.js 16 | Next.js 16 | Netlify's Runtime v5 supports this with zero config, confirmed ~2.8x faster builds in Netlify's own testing |
| Tailwind v3 `tailwind.config.js` | Tailwind v4 CSS-first `@theme` in `globals.css`, no config file by default | Tailwind v4 (already reflected correctly in CLAUDE.md) | Confirmed still current; `create-next-app --tailwind` scaffolds this by default |

**Deprecated/outdated:**
- shadcn's `"style": "default"` value: deprecated in favor of `"new-york"`-family styles per shadcn's own theming docs — though note the *CLI flag* for selecting it has itself changed again since (see Critical Pitfall #1), so this deprecation note applies to the schema/docs layer, not necessarily what the CLI's interactive/preset flow currently outputs.
- Netlify's legacy Next.js Runtime v4: superseded by v5 (OpenNext-based); do not follow tutorials referencing `runtime-v4` paths in Netlify's docs.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | The exact `getCalApi`/`Cal` component config shape shown in Pattern 1's code example (property names like `hideEventTypeDetails`, `layout`, `styles.branding.brandColor`) | Code Examples / Architecture Patterns → Pattern 1 | LOW-MEDIUM — these are consistently reported across multiple independent sources and match the package's own TypeScript-oriented API surface conventions, but no single official doc page confirmiing the full shape verbatim was reachable in this session (official docs pages returned thin/incomplete content or 404s). Verify against Cal.com's in-app Embed Snippet Generator once a real account/event type exists — Cal.com states generated snippets are "automatically updated as per the cal.com instance," implying the generator is the most current source of truth. |
| A2 | Selecting the "Nova" or "Custom" shadcn preset with `-b radix` fully satisfies the UI-SPEC's underlying design intent (Radix primitives, neutral base color) even though the literal style label is no longer "new-york" | Critical Pitfall #1 / Standard Stack | LOW — the `baseColor: "neutral"` and Radix-base outcome were directly verified via live CLI run; only the cosmetic label changed. Recommend the UI-checker re-verify component output (not the label) against the six UI-SPEC dimensions once real pages exist. |
| A3 | Cal.com free-tier terms (unlimited event types, embeds allowed, 1 user, Cal.com branding retained on free tier) | Common context / D-01 support | LOW-MEDIUM — sourced directly from cal.com/pricing in this session, but pricing pages change without notice; re-verify at account-creation time before assuming embed access is unrestricted. |
| A4 | IBM Plex Sans requires an explicit `weight` array in `next/font/google` (not a variable font on Google Fonts) | Common Pitfalls #5 | LOW — cross-verified across multiple sources (GitHub issues, font library docs) all agreeing on this; low risk of being wrong, but worth a 30-second build-time confirmation on first font-loading task. |

**If this table is empty:** N/A — see entries above; all are LOW-MEDIUM risk with a clear verification step already identified.

## Open Questions

1. **What is the exact, current-as-of-account-creation `getCalApi`/`Cal` component config surface?**
   - What we know: The package (`@calcom/embed-react@1.5.3`) exists, is actively maintained, supports React 19, and the general `getCalApi()` → `cal("ui", {...})` + `<Cal calLink={...} config={...} />` pattern is consistently reported.
   - What's unclear: The exhaustive, currently-valid set of config keys (official docs pages for this specific topic returned thin or 404 content during this research session).
   - Recommendation: Once the founder creates the actual Cal.com account and "Free Audit Call" event type, use Cal.com's in-app Embed Snippet Generator to pull the current, instance-specific snippet rather than relying solely on this research's pattern — treat Pattern 1's code as a strong starting scaffold, not a verbatim final answer.

2. **Will the "Nova" preset's visual defaults (button shape, shadow treatment) require heavy override, or would starting from "Custom"/manual `components.json` authoring be net-faster?**
   - What we know: Nova ships a specific button aesthetic (rounded-lg, OKLCH neutral grays, `h-8`/`h-7`/`h-9` sizing scale) that will need overriding regardless of preset choice, since UI-SPEC's colors/radius/fonts are all bespoke.
   - What's unclear: Whether "Custom" preset's interactive flow produces a genuinely bare starting point (less to override) or essentially the same base with different defaults — this session did not complete a full interactive "Custom" walkthrough due to the non-interactive testing constraints of this environment.
   - Recommendation: The planner should include a short spike/verification step at the start of the scaffolding task — run `shadcn init -b radix` interactively once, try "Custom" specifically, and inspect the diff against "Nova" before committing to a specific preset choice in the task plan.

3. **Founder-identity placeholders (name-as-presented, region, bio beats, email, domain, Cal.com link) — all NEEDS-FOUNDER per CONTEXT.md.**
   - What we know: These must live in `src/config/site.ts` (D-06) as typed placeholders, and are explicit launch-checklist blockers (D-04, D-05, D-07, D-13), not silently-shipped defaults.
   - What's unclear: N/A — this is correctly scoped as founder input, not a research gap.
   - Recommendation: Planner should generate explicit `checkpoint:human-verify`-style tasks (or equivalent launch-checklist items) for each NEEDS-FOUNDER item rather than letting placeholder values ship unflagged.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|--------------|-----------|---------|----------|
| Node.js | Local dev, Netlify build | ✓ (local) | v24.18.0 local; Next.js 16 requires 20.9+ | Netlify build image default may differ from local — pin explicitly via `netlify.toml` `[build.environment] NODE_VERSION` or a `.nvmrc`, don't rely on either environment's default matching |
| npm | Package management | ✓ | 11.16.0 local | — |
| git | Version control, Netlify git-based deploy | ✓ | 2.39.5 | — |
| Netlify account/CLI | Deployment target | Not verified in this session (no credentials available) | — | Deployment must be validated manually by the founder/executor via the Netlify dashboard git-connect flow; this research could not test an actual live deploy |
| Cal.com account | `/book` embed to function for real | Not verified in this session (no credentials available) | — | Development can proceed against a placeholder `calLink` in `site.ts`; the embed component itself is buildable/testable in isolation, but end-to-end booking verification requires the founder's real Cal.com account and event type |
| Domain registrar / DNS access | HTTPS with matching domain (SITE-05), Pitfall 6's DNS decision | Not verified in this session — D-04 marks domain purchase as an explicit Phase 1 task, not yet done | — | Build and preview on the free `*.netlify.app` subdomain until purchased, per D-04 |

**Missing dependencies with no fallback:**
- None — every external dependency has a documented fallback (subdomain preview, placeholder config values) that lets development proceed without blocking on founder-supplied credentials/assets.

**Missing dependencies with fallback:**
- Netlify account, Cal.com account, domain/DNS access — all founder-provided, all have documented interim fallbacks above.

## Security Domain

`security_enforcement` is not explicitly disabled in `.planning/config.json`, so this section is included per protocol default. Phase 1 has an unusually small security surface: no authentication, no user-supplied data persistence, no server-side secrets (the Cal.com integration uses only a public scheduling link, not an API key).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|--------------------|
| V2 Authentication | No | Nothing in Phase 1 authenticates users — no admin surface until Phase 3 |
| V3 Session Management | No | No sessions created in Phase 1 |
| V4 Access Control | No | All Phase 1 routes are public marketing pages by design |
| V5 Input Validation | No | Phase 1 has no forms that submit data to the app itself — D-10 explicitly removes the contact form; the only "input" is the Cal.com widget, which is Cal.com's own validated surface, not this app's |
| V6 Cryptography | Partial | No app-level cryptography; relies entirely on Netlify's automatic TLS/Let's Encrypt for transport security (SITE-05's HTTPS requirement) — verified as automatic, zero-config per Netlify docs |
| V14 Configuration | Yes | Ensure no secrets are needed/introduced in Phase 1 (there shouldn't be any — flag it as a code-review check: if any task introduces an `ANTHROPIC_API_KEY`-shaped env var in Phase 1, that's out of scope and a sign of scope creep from Phase 2) |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|-----------------------|
| Third-party script injection via a compromised/malicious Cal.com embed | Tampering | Out of this project's control surface (trusting Cal.com as a vendor) — mitigate by only loading the embed on the dedicated `/book` page (D-02), not injecting it site-wide, limiting blast radius if the embed ever misbehaves |
| DNS hijacking / domain takeover during the D-04 domain-purchase step | Spoofing | Use a reputable registrar, enable registrar-level domain lock/2FA — standard practice, not project-specific; worth a one-line launch-checklist reminder given this phase is when the domain is first purchased |
| Clickjacking on the booking page (embedding the site itself in a malicious iframe) | Tampering | Netlify's Next.js Runtime does not set restrictive frame-ancestors headers by default; if desired, add `X-Frame-Options`/`Content-Security-Policy: frame-ancestors` via `next.config.ts` headers — low priority for a marketing site with no sensitive actions, noted for completeness rather than as a blocking requirement |

## Sources

### Primary (HIGH confidence)
- Live CLI execution in this session: `npm view <pkg> version/time.created/repository.url/scripts.postinstall` for all Standard Stack packages, 2026-07-19
- Live scaffold: `npx create-next-app@latest` (Next 16.2.10, React 19.2.4, Tailwind 4) run in this session, inspected `package.json`, `globals.css`, `.gitignore`, `next.config.ts`
- Live CLI execution: `npx shadcn@latest init -b radix` (twice, selecting "Nova" preset both times; also tested `--preset custom` which errors) run against the live scaffold in this session, inspected resulting `components.json`, `globals.css`, `layout.tsx`, `button.tsx`
- `npm view @calcom/react-widget` → confirmed 404 (package does not exist), 2026-07-19
- `npx slopcheck@0.2.0 --json` — ran against a candidate package manifest in this session, 0 findings across 13 packages
- [Netlify Docs — Next.js on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) — fetched 2026-07-19, confirms Next.js 13.5+ support, zero-config, App Router/Server Actions/Route Handlers full support
- [Netlify Changelog — Next.js 16 is ready to deploy on Netlify](https://www.netlify.com/changelog/next-js-16-deploy-on-netlify/)
- [Netlify Docs — HTTPS (SSL)](https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/) — automatic Let's Encrypt provisioning confirmed

### Secondary (MEDIUM confidence)
- [Cal.com pricing](https://cal.com/pricing) — free tier: unlimited event types/calendars, 1 user, Cal.com branding retained
- [Cal.com developer docs — install with React](https://cal.com/docs/core-features/embed/install-with-react) — conceptual overview confirmed (inline/popup/floating/form), but no verbatim code snippet reachable in this session
- [npmjs.com/package/@calcom/embed-react](https://www.npmjs.com/package/@calcom/embed-react) — peer deps confirmed via `npm view`
- GitHub issues cross-verified for Cal.com embed gotchas: [#13428](https://github.com/calcom/cal.com/issues/13428) (namespace/ref issue), [#15772](https://github.com/calcom/cal.diy/issues/15772) (empty-div ref bug), [#16806](https://github.com/calcom/cal.com/issues/16806) (theme flash)
- [Netlify Support Forums — Next.js 16 build fails on Netlify](https://answers.netlify.com/t/next-js-16-project-build-fails-on-netlify/157791) — CommonJS-in-Edge-Function-bundling gotcha
- [Cloudflare community — CNAME flattening for root domain when using Netlify](https://community.cloudflare.com/t/cname-flattening-for-root-domain-when-using-netlify/847279)
- [ForwardMX/ImprovMX Netlify DNS guides](https://forwardmx.net/billing/knowledgebase/13/Netlify-DNS-Settings-to-Forward-Email-with-ForwardMX.html), cross-checked against [Cloudflare Email Routing docs](https://developers.cloudflare.com/email-service/get-started/route-emails/) for the DNS-provider mutual-exclusivity finding (Pitfall 6)
- [nextjs.org/blog/next-16](https://nextjs.org/blog/next-16), [nextjs.org/docs/app/guides/upgrading/version-16](https://nextjs.org/docs/app/guides/upgrading/version-16) — Turbopack default, proxy.ts/middleware split, Node 20.9+ requirement
- IBM Plex Sans variable-font-availability findings cross-verified across [fontsource.org/fonts/ibm-plex-sans](https://fontsource.org/fonts/ibm-plex-sans) and multiple GitHub issue threads on IBM/plex

### Tertiary (LOW confidence, flagged for validation)
- Exact `getCalApi`/`Cal` component config object shape in Pattern 1 (see Assumptions Log A1) — WebSearch-aggregated from multiple blog/tutorial sources, not pulled verbatim from a single official reference page
- shadcn "Custom" preset's actual interactive prompt flow (not fully walked through in this non-interactive research session — see Open Question 2)

## Metadata

**Confidence breakdown:**
- Standard stack (Next/React/Tailwind/Netlify): HIGH — every version and behavior claim was either directly verified via live tool execution in this session or confirmed against current official docs
- shadcn CLI behavior: HIGH — directly verified via live, repeated CLI execution against a real scaffold in this session; this is the single most important finding in this research precisely because it contradicts the UI-SPEC's locked assumption
- Cal.com embed integration pattern: MEDIUM — package legitimacy and general pattern shape are solid, but exact config-object completeness is WebSearch-aggregated rather than pulled from one authoritative source (official docs pages were unusually thin/unreachable during this session)
- Architecture/data flow: HIGH — Phase 1 has no novel architecture (fully static site + one client-side third-party embed), low risk of surprises
- Pitfalls: HIGH for the shadcn CLI and DNS/email findings (both directly verified or cross-source-confirmed in this session); MEDIUM for the Cal.com-specific bug reports (sourced from GitHub issues describing historical, likely-fixed behavior)

**Research date:** 2026-07-19
**Valid until:** 14 days for the shadcn CLI specifics (actively changing this month — re-verify `components.json` output before Wave 0 execution if planning is delayed); 30 days for Next.js/Netlify/Tailwind version specifics; 30 days for Cal.com integration pattern (re-verify against the in-app snippet generator once a real account exists, regardless of elapsed time)
