# Phase 5: FDE Landing Page - Research

**Researched:** 2026-07-20
**Domain:** Marketing/lead-gen landing page rewrite (Next.js 16 App Router, single long-scroll IA) + client-side ROI calculator, on an existing solo-maintained repo mid-pivot
**Confidence:** MEDIUM-HIGH

## Summary

Phase 5 is not a greenfield build — it's a **content/IA rewrite on top of an already-working v1 scaffold**. The repo has a fully functional Next.js 16 / React 19 / Tailwind 4 / shadcn site with Cal.com booking, design tokens, security headers, and Netlify deploy config already in place (`git log` shows 5/6 of v1 Phase 1's plans landed). Every route, component, and metadata field in the current codebase carries v1's "missed calls / slow follow-ups" positioning, the 4-vertical teaser, and a named-founder ("Annie") credibility model — all three of which the PIVOT-BRIEF.md explicitly retires. The actual work of Phase 5 is therefore: (1) delete/rewrite every v1-positioned component and route, (2) build the new 5-part hierarchy (gap → fix → outcomes → offer → CTA) as a single long-scroll `/` page, (3) build a client-side ROI calculator with zero new dependencies, and (4) leave the Netlify config, Cal.com embed, and design-token *values* untouched (those are Phase 6's job to restyle, not Phase 5's).

The single highest-value finding from codebase inspection: **the anonymity constraint is not yet honored anywhere in the current code.** `siteConfig.founderName = "Annie"` is threaded through the hero copy path (indirectly), the About page's `FounderBlock`, the homepage `FounderStrip`, the `/book` page copy ("Grab 30 minutes with Annie"), and the `CalEmbed` component's error-fallback text ("Email Annie directly... she'll find a time"). PIVOT-BRIEF.md and PROJECT.md both lock "an experienced FDE, no name or photo" as the identity model for v2 — so every one of these founder-name references is now in-scope for removal alongside the literal missed-call/vertical vocabulary grep, even though it isn't itself "old positioning" in the literal sense. This is a **Do Not Miss** item for planning: LAND-06's grep-for-old-vocabulary check will not catch "Annie" or "she" references because they aren't retired v1 *positioning terms* — they're a separate anonymity violation that needs its own explicit check.

**Primary recommendation:** Rewrite `page.tsx` and its six section components from scratch around the new 5-part hierarchy; delete `/about` and `/services` (fold anything worth keeping — e.g., the audit→project→retainer sequence pattern in `ServiceSequence` — directly into the single-page IA); strip every founder-name/pronoun reference in favor of anonymous phrasing ("the person who built this," "your engineer," or simply product-first copy); build the ROI calculator as a plain client-side React component with `useState` (no new npm dependencies — `react-hook-form`/`zod` are unnecessary for two numeric fields and are not currently installed); keep `netlify.toml`, `next.config.ts`, `CalEmbed`, `BookCta`, and the current design-token values completely untouched.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Landing page narrative (gap/fix/outcomes/offer/CTA) rendering | Frontend Server (SSR/SSG) | Browser (hydration for CTA links) | `page.tsx` stays a Server Component composed of section Server Components — matches the existing `Hero`/`Outcomes`/`FinalCta` pattern; no client JS needed for static copy |
| "Book the free audit" CTA (top/mid/bottom) | Browser / Client | Frontend Server | `BookCta` renders a `<Link href="/book">` — pure client navigation, already exists, reused unchanged |
| Process-transparency section (audit → setup → retainer) | Frontend Server (SSR/SSG) | — | Static content, same shape as the existing `ServiceSequence`/`EngagementFlow` components — no interactivity required |
| ROI calculator (hours/week × hourly cost → recovered time/$) | Browser / Client | — | Must be a Client Component (`"use client"`) — pure client-side arithmetic, zero API surface, zero signup, per PROOF-02's explicit "no signup and no API cost" requirement |
| Cal.com booking flow | Browser / Client | CDN / Static (cal.com's own hosted UI) | Existing `CalEmbed` component (`@calcom/embed-react`), untouched — an external service boundary, not owned by this repo |
| v1 route/metadata removal (`/about`, `/services`, sitemap/robots entries) | Frontend Server (App Router) | — | Route deletion + `sitemap.ts` route-array edit; build-time only, no runtime component |
| Design tokens / visual styling | CDN / Static (compiled CSS) | — | `globals.css` tokens are explicitly OUT of scope for Phase 5 — DSGN-01 (new visual system) is Phase 6; Phase 5 must render correctly using the *current* token values, not redesign them |

## Project Constraints (from CLAUDE.md)

CLAUDE.md's "Recommended Stack" section targets the *full* v1+v2 feature surface (public Claude demos, audit questionnaire, email nurture, Supabase persistence). Most of it is **not applicable to Phase 5**, because Phase 5 has no server-side API surface and no form beyond two numeric calculator inputs. Directives that DO apply:

- **Next.js App Router / Server Components by default, Client Components only where interactivity is required** — the ROI calculator is the only piece of Phase 5 that needs `"use client"`; everything else should stay a Server Component, matching the existing codebase convention (`/book` is already documented in-repo as "stays a Server Component so surrounding copy ships with zero extra client JS").
- **Never call `@anthropic-ai/sdk` from a Client Component** — not triggered by Phase 5 (no Claude API usage in this phase; the Claude-backed mini-audit demo is explicitly deferred to a future milestone per REQUIREMENTS.md `DEMO-06`).
- **An ORM/full auth provider is explicit overkill** — not applicable; Phase 5 has no persistence layer at all.
- **Zod for schema validation** — CLAUDE.md scopes this to "the audit questionnaire form data AND Claude's JSON output." Neither exists in Phase 5's scope (the audit questionnaire was descoped from v2; Claude API isn't touched). Recommendation: do NOT add `zod`/`react-hook-form` for the ROI calculator — two `<input type="number">` fields with inline clamping (`Math.max(0, value)`) is proportionate; pulling in a form library for this is unjustified complexity for a solo maintainer. Flag this as a deliberate deviation from the letter of CLAUDE.md's "Supporting Libraries" table, justified because that table's stated *purpose* for those libraries (audit questionnaire) no longer exists in the v2 requirement set.
- **shadcn/ui, copy-paste ownership model** — applies. If the ROI calculator needs a text/number input component, add it via `npx shadcn@latest add input` (and `label` if needed) — this is a source-file copy into `src/components/ui/`, not a new npm dependency, consistent with the existing `components.json` config (`style: radix-nova`, `iconLibrary: lucide`).
- **Hosting: Netlify Free, not Vercel Hobby** — already configured (`netlify.toml`), not touched by Phase 5.

## User Constraints

> No CONTEXT.md exists for this phase. Per the assignment, `.planning/PIVOT-BRIEF.md` is the authoritative source of locked decisions. Its relevant contents are reproduced/summarized below as the constraint set the planner must honor.

### Locked Decisions (from PIVOT-BRIEF.md + PROJECT.md Key Decisions)

- **Message hierarchy is fixed and ordered:** gap (95%-failure framing, cited) → fix (forward-deployed engineering, embedded/workflow-first/white-glove) → outcomes (TIME/EFFICIENCY/PROFIT, with worst-case/conservative framing) → offer (free audit → <$10k one-time setup → <$2k/mo retainer, scope-qualified) → CTA (book the free audit). This exact order is Success Criterion #1 — do not reorder or merge sections.
- **Pricing structure is fixed:** free audit (no cost, no commitment) → one-time setup **under $10k** → monthly retainer **under $2k**. Per PITFALLS.md Pitfall 8 (see Common Pitfalls below), these must ship as *scope-qualified* ranges tied to the free audit, never as bare unconditional numbers.
- **Anonymity is fixed:** "an experienced FDE," no name, no photo. This directly invalidates the current `FounderBlock`/`FounderStrip` components and the `siteConfig.founderName = "Annie"` placeholder usage in `/book`, `CalEmbed`, and the footer mailto link's surrounding copy (the email address itself can stay generic/founder-routed, just not named).
- **Brand name stays "AI Deployed"** — no rename needed; `siteConfig.name` is unchanged.
- **Budget: $0 recurring** — no new paid services; Netlify Free + free Cal.com + free brand email. Confirms: no new infrastructure decisions in this phase.
- **Vocabulary buyers search for** ("AI agents," "automation," "AI-native transformation," "forward-deployed engineer") should appear in the landing page's headings/copy — full SEO/metadata optimization (JSON-LD, sitemap generation for buyer-vocab coverage) is Phase 8's job, but the on-page H1/H2/body copy itself is written in Phase 5 and should use this vocabulary naturally (see Pitfall 6 below — not as keyword stuffing).
- **Kept groundwork (do not rebuild):** Netlify config (`netlify.toml`, `next.config.ts` security headers), Cal.com booking (`CalEmbed`, `BookCta`, `/book` route), design tokens (`globals.css` `:root` values — restyle in Phase 6, not Phase 5), GSD planning infra.

### Claude's Discretion

- Whether `/about` and `/services` routes are deleted outright and folded into the single-page IA, or kept as thin secondary pages. RESEARCH recommends deletion (see Architecture Patterns below) — no v2 requirement calls for standalone About/Services pages, and PIVOT-BRIEF.md explicitly scraps "current homepage/About/Services copy and information architecture."
- Exact ROI calculator formula/framing (e.g., how "EFFICIENCY" is represented numerically, since it's the one outcome that isn't naturally hours-or-dollars) — see Code Examples below for a recommended approach.
- Whether the "process-transparency" section (LAND-04) reuses/adapts the existing `ServiceSequence`/`EngagementFlow` numbered-flow pattern (recommended — it already satisfies the "not a uniform 3-card grid" anti-pattern gate documented in the component comments) or is built fresh.
- Exact citation format/placement for the 95%-failure stat (inline link vs. footnote-style) — see Common Pitfalls, Pitfall 1 below for the scope-accurate framing language; format itself is discretionary.

### Deferred Ideas (OUT OF SCOPE for Phase 5)

- Claude-backed "mini-audit" demo (`DEMO-06`) — future milestone, requires Turnstile + rate limiting + spend cap infra not needed for Phase 5's client-side-only calculator.
- Worst-case/conservative **toggle** on the ROI calculator output (`PROOF-04`) — Phase 5 only needs worst-case *framing* in the outcomes section copy (LAND-05); an interactive toggle on the calculator itself is explicitly deferred.
- Visual redesign / scroll-driven storytelling (`DSGN-01`–`04`) — Phase 6. Phase 5 ships on the *current* design tokens.
- Blog/content engine (`BLOG-*`) — Phase 7.
- Full SEO/structured-data layer (`SEO-*`) — Phase 8, though Phase 5's copy should be buyer-vocabulary-aware as a head start.
- Vertical-specific landing pages, named founder bio/headshot, gated content, email nurture — permanently out of scope per REQUIREMENTS.md.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LAND-01 | Single long-scroll page carrying gap → fix → outcomes → offer → CTA | Architecture Pattern 1 (single-page IA, reuse `page.tsx` + `components/sections/*` pattern); Pitfall 1 (half-migrated positioning) governs the rewrite discipline |
| LAND-02 | Transparent, scope-qualified pricing (free audit → <$10k setup → <$2k/mo retainer) | Pitfall 8 (scope-qualifying language) directly governs copy; existing `ServiceSequence` component has the right numbered-sequence shape to adapt |
| LAND-03 | "Book the free audit" CTA at top/mid/bottom scroll depth, reaching Cal.com | `BookCta`/`CalEmbed`/`/book` already fully built and correct — reuse unchanged, place 3x |
| LAND-04 | Process-transparency section near the CTA | Existing `EngagementFlow`/`ServiceSequence` numbered-flow pattern is the right shape; must NOT reintroduce founder-name/photo trust signals (anonymity constraint) |
| LAND-05 | Outcomes section includes worst-case/conservative framing | FEATURES.md Area 1 differentiator: "even in the worst case, you come out ahead" — LOW-MEDIUM complexity copy addition to the outcomes section |
| LAND-06 | Zero surviving v1 positioning (routes, copy, metadata) | Pitfall 1 (full-repo grep as explicit exit criterion); codebase inventory below lists every file needing deletion/rewrite; also covers the anonymity-name issue found during this research (not literal v1 vocab, but same "surviving artifact" failure mode) |
| PROOF-02 | Client-side ROI calculator, no signup, no API cost | Architectural Responsibility Map (Browser tier, pure client component); Code Examples below; zero new dependencies needed |
| PROOF-03 | Calculator output speaks TIME/EFFICIENCY/PROFIT, routes to CTA | Same component as PROOF-02; output copy must reuse the outcomes section's exact vocabulary and end with a `BookCta` |
</phase_requirements>

## Standard Stack

### Core (already installed — no changes needed for Phase 5)

| Library | Version (installed) | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.10 [VERIFIED: npm registry, installed locally] | Framework, App Router | Already the project's framework; `npm view next version` confirms 16.2.10 is current published |
| react / react-dom | 19.2.4 (installed) / 19.2.7 (latest on registry) [VERIFIED: npm registry] | UI library | Server Components for static sections, one Client Component for the calculator |
| tailwindcss | ^4 (installed), 4.4.3 latest on registry [VERIFIED: npm registry] | Styling | Design tokens already defined in `globals.css`; Phase 5 must use existing token names, not introduce new ones (Phase 6 owns the visual system) |
| shadcn/ui components (`Card`, `Button`, `Badge`, `Separator`, `Skeleton`, `Sheet`, `NavigationMenu`) | already copied into `src/components/ui/` | Component primitives | Copy-paste model already established; add `input`/`label` via `npx shadcn@latest add input label` only if the calculator needs styled inputs beyond a plain `<input>` |
| @calcom/embed-react | ^1.5.3 (installed) | Cal.com booking widget | Already correctly isolated in `CalEmbed.tsx` — do not touch |
| lucide-react | ^1.25.0 (installed) | Icons | Already used in `MobileNav` — reuse if the process-transparency section wants icons (recommendation: avoid, per the codebase's own existing anti-pattern-gate comments favoring numbered text over icon grids) |

### Supporting (do NOT add for this phase)

| Library | Verdict | Reason |
|---------|---------|--------|
| zod | Not needed | No form/API payload to validate in Phase 5; scoped to the (now out-of-scope) audit questionnaire and Claude JSON output per CLAUDE.md's own stated purpose |
| react-hook-form / @hookform/resolvers | Not needed | Two numeric inputs don't warrant a form-state library; plain `useState` is proportionate and keeps bundle size down (relevant since Phase 6 will already be adding an animation library) |
| motion / gsap | Not needed in Phase 5 | DSGN-02 (scroll-driven storytelling) is explicitly Phase 6's requirement; introducing an animation dependency in Phase 5 pre-empts a Phase 6 decision and risks work that gets redone |
| @upstash/ratelimit, @marsidev/react-turnstile, @anthropic-ai/sdk | Not needed | No public API surface in Phase 5 — these guard the (deferred) Claude-backed demo, not the client-side calculator |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain `useState` calculator | `react-hook-form` + `zod` | Only worth it if the calculator grows beyond 2 fields or needs cross-field validation; not justified at current scope |
| Deleting `/about` and `/services` | Keeping them as thin secondary pages, updated with new copy | Adds 2 more surfaces to keep in sync with the single source of truth on `/`; ARCHITECTURE.md's Pattern 1 (single-page IA) explicitly recommends against multi-page silos for a single-offer consultancy — deletion is the standard-of-record recommendation, but this is flagged as Claude's Discretion above since no requirement forces either choice |

**Installation:** No new packages required for Phase 5. If the calculator needs a styled input beyond a bare `<input>`:
```bash
npx shadcn@latest add input label
```

**Version verification:** Ran `npm view next/react/tailwindcss/zod/react-hook-form version` against the live npm registry 2026-07-20 (see table above) — all core packages are current; no upgrade needed for this phase.

## Package Legitimacy Audit

**Not applicable — Phase 5 introduces zero new npm dependencies.** All work uses packages already installed and audited as part of the original v1 scaffold build. If the planner decides the ROI calculator needs shadcn's `input`/`label` primitives, those are copy-paste source files added via the shadcn CLI (already a trusted, configured tool in this repo via `components.json`), not new registry dependencies — no legitimacy audit is triggered.

## Architecture Patterns

### System Architecture Diagram

```
Visitor's browser
      │
      │ GET /
      ▼
┌─────────────────────────────────────────────────────────────┐
│ Next.js App Router (Netlify, Next.js Runtime v5) — SSG        │
│                                                                 │
│  page.tsx (Server Component)                                   │
│   ├─ Hero            (gap statement, 95%-stat, primary CTA)    │
│   ├─ TheFix           (forward-deployed engineering explainer) │
│   ├─ Outcomes         (TIME/EFFICIENCY/PROFIT + worst-case)    │
│   ├─ RoiCalculator ── "use client" island, no network calls    │
│   │      └─ on submit → renders result → <BookCta/>            │
│   ├─ Offer            (pricing, scope-qualified, mid CTA)      │
│   ├─ ProcessTransparency (audit→setup→retainer, near CTA)      │
│   └─ FinalCta         (bottom CTA)                              │
│                                                                 │
│  sitemap.ts / robots.ts — trimmed to current routes only       │
└───────────────┬─────────────────────────────────────────────┘
                │ client navigation (<Link href="/book">)
                ▼
        /book (Server Component page)
                │
                ▼
        CalEmbed (Client Component, "use client")
                │  fetch cal.com's own embed script
                ▼
        cal.com hosted booking UI (external service)
```

A visitor's primary path: land on `/` → read gap/fix/outcomes in order → optionally play with the ROI calculator (pure client-side, no round trip) → read the offer + process-transparency → click any of the 3 repeated CTAs → land on `/book` → complete booking inside the Cal.com iframe. No server-side dynamic surface exists anywhere in this flow — the entire phase is static HTML plus one client-side arithmetic island.

### Recommended Project Structure

```
src/
├── app/
│   ├── page.tsx                       # REWRITTEN — new 5-part hierarchy, no old imports
│   ├── about/                         # DELETE (or fold — see Claude's Discretion)
│   ├── services/                      # DELETE (or fold — see Claude's Discretion)
│   ├── book/page.tsx                  # EDIT ONLY — remove "Annie"/"she" copy, keep CalEmbed usage
│   ├── sitemap.ts                     # EDIT — routes array must match final route set
│   └── robots.ts                      # UNCHANGED (already generic, references sitemap.xml only)
├── components/
│   ├── sections/
│   │   ├── hero.tsx                   # REWRITTEN — gap framing, not "missed calls" headline
│   │   ├── outcomes.tsx               # REWRITTEN — TIME/EFFICIENCY/PROFIT + worst-case framing
│   │   ├── engagement-flow.tsx        # REWRITTEN or renamed — process-transparency (LAND-04)
│   │   ├── verticals-teaser.tsx       # DELETE — 4-vertical strategy explicitly scrapped
│   │   ├── demo-placeholder.tsx       # DELETE — tied to the scrapped missed-call demo concept
│   │   ├── founder-strip.tsx          # DELETE — named-founder trust signal conflicts with anonymity
│   │   ├── final-cta.tsx              # EDIT ONLY — copy update, structure/pattern reusable
│   │   ├── the-fix.tsx                # NEW — "the fix" (forward-deployed engineering) section
│   │   ├── offer.tsx                  # NEW — pricing/offer section (LAND-02), or fold into outcomes/CTA
│   │   └── roi-calculator.tsx         # NEW — "use client", PROOF-02/PROOF-03
│   ├── founder-block.tsx              # DELETE — About-page founder bio, conflicts with anonymity
│   ├── service-sequence.tsx           # KEEP pattern, REPURPOSE into process-transparency section content
│   └── ui/
│       ├── input.tsx                  # NEW (if needed) — via shadcn CLI, for calculator fields
│       └── label.tsx                  # NEW (if needed) — via shadcn CLI
└── config/
    └── site.ts                        # EDIT — founderName usage audited/removed from consuming components; NEEDS-FOUNDER placeholders stay placeholders (launch blockers, not this phase's job to resolve)
```

### Pattern 1: Single-Page IA, No Multi-Page Silos

**What:** The entire gap→fix→outcomes→offer→CTA hierarchy lives on `/`. `/about` and `/services` are deleted; their genuinely reusable *pattern* (the numbered audit→project→retainer sequence in `ServiceSequence`) is repurposed into the new page's process-transparency section rather than kept as a separate route.
**When to use:** Single-offer, single-CTA consultancy sites with no product catalog to segment across pages — exactly this project's shape (confirmed in `.planning/research/ARCHITECTURE.md` Pattern 1, HIGH confidence, cross-referenced against the project's own single-CTA/audit-first funnel design).
**Example (existing code showing the right pattern to extend, not the right content):**
```tsx
// src/app/page.tsx — CURRENT shape is right, CONTENT is v1 and must be replaced
export default function Home() {
  return (
    <>
      <Hero />           {/* rewrite: gap, not "missed calls" */}
      <Outcomes />        {/* rewrite: TIME/EFFICIENCY/PROFIT + worst-case */}
      <EngagementFlow />  {/* rewrite/rename: process-transparency, LAND-04 */}
      <VerticalsTeaser /> {/* DELETE entirely */}
      <FounderStrip />    {/* DELETE entirely */}
      <FinalCta />        {/* copy edit only */}
    </>
  );
}
```

### Pattern 2: The ROI Calculator as an Isolated Client Island

**What:** A single `"use client"` component that owns its own `useState` for two numeric inputs (hours/week, hourly cost) and derives TIME/PROFIT outputs via plain arithmetic — no form library, no network request, no persistence. Everything else on the page stays a Server Component.
**When to use:** Any interactive widget on an otherwise-static marketing page where the interaction has zero external dependency — matches the project's own established pattern of keeping `"use client"` boundaries as small as possible (see the code comment in the existing `CalEmbed.tsx`: "keeping the `use client` boundary as small as possible so the rest of `/book` stays a Server Component").
**Example:**
```tsx
"use client";

import { useState } from "react";
import { BookCta } from "@/components/book-cta";

const WEEKS_PER_YEAR = 50; // conservative — excludes ~2 weeks holiday/slow periods,
                            // reinforces the worst-case-framing requirement (LAND-05)

export function RoiCalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [hourlyCost, setHourlyCost] = useState(35);

  const annualHours = hoursPerWeek * WEEKS_PER_YEAR;
  const annualDollars = annualHours * hourlyCost;

  return (
    <div>
      <label>
        Hours/week lost to manual work
        <input
          type="number"
          min={0}
          value={hoursPerWeek}
          onChange={(e) => setHoursPerWeek(Math.max(0, Number(e.target.value) || 0))}
        />
      </label>
      <label>
        Your team&apos;s hourly cost
        <input
          type="number"
          min={0}
          value={hourlyCost}
          onChange={(e) => setHourlyCost(Math.max(0, Number(e.target.value) || 0))}
        />
      </label>

      <p>
        That&apos;s <strong>{annualHours.toLocaleString()} hours/year</strong> back —
        roughly <strong>${annualDollars.toLocaleString()}</strong> in recovered time,
        even before counting the efficiency gains from work that no longer
        needs a person at all.
      </p>
      <BookCta />
    </div>
  );
}
```
*Note: `WEEKS_PER_YEAR = 50` (not 52) and the "even before counting efficiency gains" framing are deliberate choices to satisfy LAND-05's worst-case/conservative requirement inside the calculator's own output, reinforcing (not just repeating) the outcomes section's framing. Exact copy/numbers are Claude's Discretion — this is illustrative, not prescriptive.*

### Pattern 3: Copy/Positioning Reference — fde.academy's FDE Value-Proposition Language

**What:** The user supplied [fde.academy's "AI Forward-Deployed Engineering" article](https://fde.academy/blog/ai-forward-deployed-engineering) as additional value-proposition content to draw from. It's an industry explainer of the FDE role/hiring market (not a competitor landing page), but its language independently corroborates and sharpens several phrases useful for the gap → fix → outcomes copy this phase writes. Treat it as a copy-reference source, not a locked spec — none of it overrides PIVOT-BRIEF.md's locked decisions above.
**When to use:** During copywriting for the Hero (gap), TheFix, and Outcomes sections.
**Findings, mapped to this phase's hierarchy:**
- **The gap:** The article cites the same MIT/95%-failure statistic already sourced in Pitfall 3 below ("95% of generative AI projects fail to deliver measurable ROI, largely due to brittle workflows and poor alignment") — independent corroboration of the stat and its "brittle workflows / poor alignment" root-cause framing, not a new source to cite separately. It also frames the gap itself as **"the space where AI is technically deployed but the expected business outcome never materializes"** — a reusable framing for why a working model isn't the same as a working system: **"A powerful model is not the same thing as a working system."** Both phrases are strong, on-vocabulary candidates for the Hero/gap section's subhead or body copy (rephrase, don't quote verbatim, to avoid duplicating another site's exact sentence).
- **The fix:** Defines FDE by ownership, not by sales/consulting motions: **"engineers embed directly inside a customer's environment to deploy, integrate, and own AI systems end-to-end"** and explicitly differentiates it from adjacent roles — "not sales engineering... not solutions architecture... not traditional consulting." The ownership/accountability framing — **"build the thing, deploy the thing, and are still on the hook when the thing breaks at 2 a.m."** — is a distinctive, concrete way to make "embedded, workflow-first, white-glove" (PIVOT-BRIEF's language) feel tangible rather than abstract; useful for TheFix section copy, adapted to this project's solo/anonymous, SMB-scale framing (the article's own examples — John Deere, Fox Corp, JPMC, AWS's $1B commitment — are enterprise-scale and should NOT be cited directly on this site; the whole point of the FDE-for-SMBs pitch is that enterprise-scale FDE engagements are exactly what SMBs are priced out of).
- **The outcomes:** Reinforces "measurable business outcome" as the load-bearing phrase (used repeatedly in the source) over vaguer "AI value" language — supports keeping this project's own TIME/EFFICIENCY/PROFIT vocabulary concrete and outcome-first rather than drifting into capability-first language ("agentic," "AI-native") in the outcomes section specifically (save that vocabulary for the fix/offer sections, per Pitfall 6's buyer-intent mapping below).
- **Buyer vocabulary corroboration:** Confirms "agentic workflows," "autonomous AI agents," and "production-grade AI deployment" as live buyer/industry terms alongside this project's already-locked four terms (AI agents, automation, AI-native transformation, forward-deployed engineer) — no new required terms, but "production-grade" and "agentic workflows" are reasonable natural variations to use in the fix/offer sections if they read naturally in context (Pitfall 6 still applies — don't insert mechanically).
- **One phrase worth adapting directly:** **"the difference between an AI pilot that stalls and one that ships"** — a crisp, on-message way to describe what forward-deployed engineering actually changes; strong candidate for a subhead or transition line between the gap and fix sections.
**Trade-offs / caution:** This source is a hiring-market/industry explainer aimed at engineers considering FDE careers, not a buyer-facing sales page — its enterprise case studies (John Deere, Fox, JPMC, AWS, Databricks) are NOT appropriate to cite as this project's own proof (no client relationship exists, and citing enterprise names would contradict the project's own SMB-affordability differentiation). Use only the definitional/framing language, not the examples or stats beyond the already-independently-verified 95% figure.

### Anti-Patterns to Avoid

- **Leaving `siteConfig.founderName` wired into any user-facing copy path.** The constant itself can stay in `site.ts` (it may still be useful internally, e.g., for a future admin-only surface), but every *component* that interpolates it into visitor-facing text (`CalEmbed`'s error fallback, `/book`'s intro paragraph, `FounderStrip`, `FounderBlock`) must be rewritten to remove the name/pronoun, not just have the component deleted while the string constant lingers unused — audit all `siteConfig.founderName` call sites explicitly (`grep -rn "founderName" src/`).
- **Treating the ROI calculator as needing the same rigor as a lead-capture form.** It has no signup, no persistence, no API call (PROOF-02 requirement) — adding `zod`/`react-hook-form`/a Server Action for it is solving a problem that doesn't exist in this phase.
- **Reordering or merging the 5-part hierarchy sections "for better flow."** Success Criterion #1 in ROADMAP.md and REQUIREMENTS.md LAND-01 both specify the exact order (gap → fix → outcomes → offer → CTA) as a testable criterion — a reviewer/verifier will check section order, not just content presence.
- **Building new visual/animation treatments in this phase.** DSGN-01/02 (new design direction, scroll-driven storytelling) are explicitly Phase 6. Phase 5 must look "current-design-tokens plain" — resist the urge to add motion/gsap now just because the new copy makes the old static layout feel underwhelming; that's Phase 6's mandate, and doing it now risks rework when Phase 6 changes the token/animation system underneath it.
- **Citing fde.academy's enterprise case studies (John Deere, Fox, JPMC, AWS, Databricks) as if they were this project's own proof.** They belong to a different company's hiring-market content, not this project's anonymized case-study format (BLOG-05, Phase 7) — pulling them in would contradict the SMB-affordability differentiation and could read as borrowed/inflated credibility.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Booking flow / calendar UI | A custom date-picker + availability API | Existing `CalEmbed` (`@calcom/embed-react`) — already built, tested, isolated | Reinventing booking UI is pure waste; it's explicitly "kept groundwork" per PIVOT-BRIEF.md |
| Numbered process/sequence layout | A new bespoke grid component | Adapt the existing `ServiceSequence`/`EngagementFlow` numbered-flow pattern (already satisfies the codebase's own "not a uniform 3-card grid" anti-pattern gate) | The pattern is proven and matches the design-token system Phase 5 must not touch |
| Styled form inputs | Hand-rolled `<input>` styling from scratch | `npx shadcn@latest add input label` if styling beyond bare HTML is wanted | Keeps the copy-paste-owned-code model consistent with the rest of the UI layer |
| Sitemap/robots generation | A new dynamic sitemap library | Edit the existing `sitemap.ts`/`robots.ts` route arrays directly | Already correctly implemented via Next.js's built-in `MetadataRoute` API; only the `routes` array needs trimming to match Phase 5's final route set |

**Key insight:** Every piece of *infrastructure* this phase needs (routing, booking, metadata generation, component styling system) already exists and works. The only genuinely new code is copy, IA reshuffling, and one small client-side arithmetic component — resist scope creep toward rebuilding anything that isn't explicitly retired v1 positioning.

## Common Pitfalls

> The project's own milestone-level research (`.planning/research/PITFALLS.md`, `.planning/research/FEATURES.md`, `.planning/research/ARCHITECTURE.md`) already covers this phase in depth (MEDIUM-HIGH confidence, researched 2026-07-20 as part of roadmap creation). The pitfalls most load-bearing for Phase 5 specifically are reproduced/adapted below; see those files for full detail and sourcing.

### Pitfall 1: Half-Migrated Positioning (Old and New Framing Coexist)
**What goes wrong:** Stray v1 copy/routes/metadata survive in corners after the new landing page ships — confirmed as a live risk here, not hypothetical: a repo grep during this research (`grep -ril "missed call|intake triage|dental|home services|law firm|real estate"`) returned hits in `src/app/page.tsx`, `src/app/book/page.tsx`, and four section components.
**Why it happens:** Solo/AI-assisted dev sessions work page-by-page; without an explicit full inventory, stray references in less-obvious files (the `/book` page's intro paragraph, footer links, metadata strings) get missed.
**How to avoid:** Treat LAND-06's "full-repo grep for retired v1 vocabulary returns zero matches" as a literal, scripted exit-criterion check (`grep -ril` across `src/` and `public/`, not just a visual pass), run *after* all rewrites, not assumed from having "rewritten the main files."
**Warning signs:** The exact grep command in ROADMAP.md's Success Criterion #5 returns any hit.

### Pitfall 2: Anonymity Violation Surviving Alongside the Vocabulary Grep (found during this research, not in prior milestone research)
**What goes wrong:** A grep for "missed call"/"intake triage"/vertical names will NOT catch the founder-name ("Annie") and gendered-pronoun ("she") references currently in `/book`, `CalEmbed`, `FounderStrip`, and `FounderBlock` — these aren't v1 *positioning* vocabulary, they're a separate PIVOT-BRIEF.md anonymity requirement, easy to miss if the exit check is scoped only to the literal LAND-06 grep terms.
**How to avoid:** Add a second, explicit grep pass for `grep -rn "founderName\|Annie\|\bshe\b\|\bher\b" src/` as part of the same exit-criterion check, and confirm every hit is either removed or is an internal-only reference (e.g., a code comment) that never reaches rendered output.
**Warning signs:** `/book`'s intro paragraph or `CalEmbed`'s error-fallback text still reads "Email Annie directly... she'll find a time" after the phase is marked complete.

### Pitfall 3: Misusing the 95%-Failure Statistic (Sourcing, Scope, Overclaiming)
**What goes wrong:** The stat's actual source — MIT NANDA / Project NANDA's "The GenAI Divide: State of AI in Business 2025" — measured **enterprise generative-AI pilot programs** (~300 initiatives, 150 executive interviews, published August 2025), not SMB-specific deployments or "AI projects" universally. Presenting it as a bare, unscoped claim ("95% of AI projects fail") is a credibility risk for a site whose pitch is "we understand your specific reality, not generic claims" — verified independently during this research via WebSearch cross-referencing Fortune, Forbes, and the primary report PDF (`mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf`); independently corroborated again via fde.academy's own citation of the same MIT figure and "brittle workflows / poor alignment" root-cause language (see Architecture Pattern 3 above).
**How to avoid:** Cite the stat with a visible source reference and scope it accurately on the page: "95% of **enterprise** generative-AI pilots fail to show measurable ROI (MIT NANDA, 2025)" — then let the argument (not the stat) bridge to SMBs: "the same brittle-workflow problem exists in SMBs, worse, because they can't afford the forward-deployed engineering enterprises use to close it."
**Confidence:** MEDIUM-HIGH — report existence, title, methodology, and ~95%/enterprise-pilot scope independently confirmed via WebSearch (Fortune 2025-08-18, Forbes 2025-08-26, primary PDF) during this research session, cross-referencing PIVOT-BRIEF.md's own cited secondary source (Invisible Tech blog) and fde.academy's independent citation of the same figure.

### Pitfall 4: Pricing Promises Ship as Unconditional Claims
**What goes wrong:** Publishing "<$10k setup" / "<$2k/mo retainer" as bare numbers with no qualifying language publicly commits to a ceiling before any real engagement is scoped.
**How to avoid:** Pair every price with scope-qualifying language tied to the free audit: "most engagements: one-time setup under $10k, scoped during your free audit" — not a bare "<$10k" headline with no context.
**Phase to address:** This phase's offer-section copywriting — make it an explicit copy-review checklist item, not implicit.

### Pitfall 5: Buyer-Vocabulary Requirement Executed as Keyword Stuffing
**What goes wrong:** Mechanically repeating "AI agents / automation / AI-native transformation / forward-deployed engineer" across every section reads as unnatural and undermines the "we understand your specific business" pitch.
**How to avoid:** Use each term where it's the natural word for the point being made (e.g., "forward-deployed engineer" in the fix section explaining the model; "AI agents"/"automation" in the offer section describing what gets built) — not inserted into every section as a checklist.
**Phase to address:** Copywriting pass — a read-aloud naturalness check before marking sections complete.

### Pitfall 6: "Visually Impressive" Redesign Scope Creep Into Phase 5
**What goes wrong:** Because the current design (unchanged since v1) will look plain next to the new FDE copy, there's a temptation to start adding motion/visual polish in this phase.
**How to avoid:** Explicitly scope Phase 5 to copy/IA/structure only, using the *existing* token values; defer all visual-system work to Phase 6 (which owns DSGN-01 through DSGN-04, including CWV budgets and `prefers-reduced-motion` handling that a rushed Phase 5 animation addition would not have accounted for).
**Phase to address:** Phase boundary discipline — flag any PR/plan step that touches `globals.css` token *values* (not just using existing tokens) as out of scope.

## Code Examples

### Removing a v1 section cleanly (verified against current file contents)
```tsx
// BEFORE — src/app/page.tsx (current, v1-positioned)
import { EngagementFlow } from "@/components/sections/engagement-flow";
import { FinalCta } from "@/components/sections/final-cta";
import { FounderStrip } from "@/components/sections/founder-strip";
import { Hero } from "@/components/sections/hero";
import { Outcomes } from "@/components/sections/outcomes";
import { VerticalsTeaser } from "@/components/sections/verticals-teaser";

export default function Home() {
  return (
    <>
      <Hero />
      <Outcomes />
      <EngagementFlow />
      <VerticalsTeaser />
      <FounderStrip />
      <FinalCta />
    </>
  );
}

// AFTER — shape only (content is new copy per LAND-01..06)
import { Hero } from "@/components/sections/hero";           // gap
import { TheFix } from "@/components/sections/the-fix";      // fix — NEW
import { Outcomes } from "@/components/sections/outcomes";   // outcomes + worst-case
import { RoiCalculator } from "@/components/sections/roi-calculator"; // PROOF-02/03 — NEW
import { Offer } from "@/components/sections/offer";         // offer — NEW
import { ProcessTransparency } from "@/components/sections/process-transparency"; // LAND-04 — renamed/rewritten from engagement-flow.tsx
import { FinalCta } from "@/components/sections/final-cta";  // CTA

export default function Home() {
  return (
    <>
      <Hero />
      <TheFix />
      <Outcomes />
      <RoiCalculator />
      <Offer />
      <ProcessTransparency />
      <FinalCta />
    </>
  );
}
```

### Trimming `sitemap.ts` to the final route set
```typescript
// src/app/sitemap.ts — update the routes array once /about and /services are removed
const routes = ["", "/book"]; // was: ["", "/about", "/services", "/book"]
```

## State of the Art

| Old Approach (v1, current codebase) | Current Approach (v2, Phase 5) | When Changed | Impact |
|--------------------------------------|----------------------------------|---------------|--------|
| Multi-page IA (`/`, `/about`, `/services`, `/book`) | Single long-scroll `/` + `/book` only | This phase (LAND-01, Pattern 1) | Simpler sitemap, one page carries full narrative, matches single-offer/single-CTA funnel |
| Named-founder trust signal ("Annie," photo placeholder) | Anonymous process/pricing-transparency trust signals | This phase (anonymity constraint, Pitfall 2 above) | Removes `FounderBlock`/`FounderStrip`; process-transparency section + scope-qualified pricing become the primary trust substitute |
| Pain-point-first headline ("Stop losing customers to missed calls") | Gap-first headline (95%-failure framing, cited) | This phase (LAND-01) | Headline vocabulary shifts from ROI-generic to FDE-specific per PIVOT-BRIEF.md |
| 4-vertical teaser section | Removed entirely | This phase (LAND-06, `VerticalsTeaser` deleted) | Horizontal SMB positioning, no vertical-specific copy anywhere |

**Deprecated/outdated:** `DemoPlaceholder` component (referenced a Phase-2-that-never-shipped missed-call demo) — delete; no live demo ships in v2 Phase 5, and the eventual `DEMO-06` demo (future milestone) will need its own component built around the FDE audit framing, not this placeholder's copy.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `/about` and `/services` should be deleted outright rather than kept as thin secondary pages | Architecture Patterns, Recommended Project Structure | Low — explicitly flagged as Claude's Discretion; if planner/user prefers keeping them, the rewrite work simply moves into those files instead of `page.tsx`, no wasted effort either way |
| A2 | `WEEKS_PER_YEAR = 50` and the specific calculator copy in the Pattern 2 example are the right worst-case framing numbers | Code Examples, Pattern 2 | Low — explicitly labeled illustrative/discretionary in the code comment; planner should treat exact figures/copy as a drafting decision, not a locked spec |
| A3 | shadcn `input`/`label` primitives aren't already present and would need adding via CLI | Standard Stack, Don't Hand-Roll | Low — verified by direct `ls` of `src/components/ui/` during this research (only badge/button/card/navigation-menu/separator/sheet/skeleton exist); if the planner decides bare `<input>` elements are sufficient, this step is simply skipped |

**Note:** No claims in this research are tagged `[ASSUMED]` in the body text above requiring separate confirmation beyond what's listed here — the 95%-stat sourcing (Pitfall 3) was independently verified via WebSearch against the primary report and secondary press coverage during this research session (MEDIUM-HIGH confidence, not a bare assumption), and all package/version claims were verified against the live npm registry and the actual installed `package.json`. The fde.academy copy-reference findings (Architecture Pattern 3) are attributed inline to that specific source and explicitly scoped as copy inspiration, not locked spec.

## Open Questions (RESOLVED)

1. **RESOLVED: Exact "process-transparency" section content: reuse `ServiceSequence`'s copy almost verbatim (audit → fixed-scope project → monthly retainer) or write fresh copy for LAND-04?**
   - What we know: The existing `ServiceSequence` component's *structure* (numbered, asymmetric-width, step-1-gets-most-space) already matches what LAND-04 needs, and its copy is already fairly close to FDE-appropriate language (it never mentions missed calls/verticals).
   - What's unclear: Whether "process-transparency" (LAND-04, framed as trust-building "how it works") and "the offer" (LAND-02, pricing) should be the same section or two adjacent sections. ROADMAP.md's Success Criteria list them as related-but-distinct (#1 covers the offer as part of the gap→fix→outcomes→**offer**→CTA order; #3 covers process-transparency as a *separate* trust signal "near the CTA").
   - Recommendation: Treat as two adjacent sections — Offer (pricing, scope-qualified) immediately followed by Process Transparency (step-by-step, reusing `ServiceSequence`'s pattern) immediately before the final CTA, consistent with FEATURES.md's finding that "no social proof yet" makes process-transparency the load-bearing trust signal that must sit directly next to the conversion point.

2. **RESOLVED: Should the ROI calculator sit near the top (reinforcing outcomes early) or lower on the page (after the offer, as a final decision-nudge before the CTA)?**
   - What we know: FEATURES.md frames the calculator as "a second, zero-marginal-cost proof point" that "funnels toward... the CTA" — implying it belongs after the core argument is made, not before.
   - What's unclear: No requirement pins its exact position beyond "somewhere in the flow, routes back to the audit CTA."
   - Recommendation: Place it directly after (or interleaved with) the Outcomes section, since PROOF-03 requires it to speak the same TIME/EFFICIENCY/PROFIT vocabulary the Outcomes section just introduced — reads as a natural "prove it yourself" continuation rather than a bolt-on.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Local dev / Netlify build | ✓ | v24.18.0 local (`.nvmrc` pins `20`, `netlify.toml` pins `NODE_VERSION=20` for the build) | — |
| npm | Package management | ✓ | 11.16.0 | — |
| Cal.com booking event ("Free Audit Call") | LAND-03 (CTA must reach a working booking flow) | ✗ — `siteConfig.calLink` is still `"PLACEHOLDER/free-audit-call"` | — | **Blocking for full manual verification of LAND-03**, but not blocking for *building* the phase — `CalEmbed` already has a documented graceful-degradation path (role="alert" fallback with mailto link) if the embed fails to resolve. Carried forward from STATE.md's existing "Blockers/Concerns" entry: founder must create the real Cal.com event before this can be end-to-end verified in production. |
| Production domain / DNS | Not required for Phase 5 | ✗ — `siteConfig.domain` is `PLACEHOLDER_DOMAIN.example.invalid` | — | No fallback needed; site ships on `*.netlify.app` per the $0-recurring-budget constraint (PROJECT.md), sitemap/robots/OG URLs already correctly derive from `siteConfig.domain` as a single point of truth |
| Netlify site connection | Deploy, not build | Unknown/unverified in this research pass (not a code-inspectable fact) | — | Carried forward from STATE.md's "Blockers/Concerns": founder still needs to confirm the Netlify site + repo connection exists — orthogonal to Phase 5's code changes, does not block writing/reviewing the code itself |

**Missing dependencies with no fallback:** None that block *implementing* Phase 5 — the two placeholders above (`calLink`, `domain`) are pre-existing launch blockers tracked since v1, not new to this phase, and both already have documented in-repo fallback/placeholder behavior.

**Missing dependencies with fallback:** Cal.com event placeholder (graceful degradation already coded); production domain placeholder (Netlify subdomain works as-is for `*.netlify.app` hosting).

## Security Domain

> `security_enforcement` is not set in `.planning/config.json` — treated as enabled per the default rule. Scope is intentionally minimal: Phase 5 has no authentication, no session, no server-side data handling, and no new external API surface.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | No login/auth surface anywhere in Phase 5 |
| V3 Session Management | No | No session state; the ROI calculator's state is ephemeral component state, never persisted |
| V4 Access Control | No | All routes are public marketing pages by design |
| V5 Input Validation | Yes (minimal) | ROI calculator's two numeric inputs: clamp to non-negative numbers client-side (`Math.max(0, Number(value) || 0)`), as shown in Code Examples. No server-side validation needed because the values never leave the browser — there is no injection surface (React's default text rendering already escapes any accidental string content; values are only ever used in arithmetic and `toLocaleString()` formatting, never `dangerouslySetInnerHTML`) |
| V6 Cryptography | No | No secrets, tokens, or encrypted data in this phase |
| V14 Configuration | Partial (already satisfied) | Security headers (`X-Content-Type-Options`, `Referrer-Policy`, CSP `frame-ancestors 'self'`) already configured in `next.config.ts` from v1 — Phase 5 doesn't need to touch this, just shouldn't regress it (verify no new inline scripts/iframes are added outside the existing Cal.com CSP allowance) |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| ROI calculator input causing a rendering crash (e.g., `NaN`, negative numbers, extremely large numbers) | Denial of Service (client-side, low severity) | Clamp/coerce input with `Math.max(0, Number(value) || 0)` on every change handler, as shown in Pattern 2's example — prevents `NaN` propagating into `toLocaleString()` output |
| Stale/removed routes (`/about`, `/services`) left crawlable or bookmarked, serving 404s or (worse) cached stale content | Information disclosure (very low severity — no sensitive data involved, but reads as broken/unmaintained) | Ensure `sitemap.ts`'s `routes` array is trimmed in the same change that removes the route files, so no orphaned sitemap entries point at 404s |

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection (`src/app/*`, `src/components/*`, `src/config/site.ts`, `netlify.toml`, `next.config.ts`, `components.json`, `package.json`) — ground truth for what's currently built, read in full during this research session
- `.planning/PIVOT-BRIEF.md`, `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md` — primary sources for locked decisions, constraints, and success criteria
- npm registry (`npm view <pkg> version`, fetched 2026-07-20) — ground-truth current versions for next/react/tailwindcss/zod/react-hook-form
- `git log --oneline` — confirms v1 Phase 1's actual completion state (5/6 plans landed) matching STATE.md's claim

### Secondary (MEDIUM confidence)
- `.planning/research/ARCHITECTURE.md`, `FEATURES.md`, `PITFALLS.md`, `STACK.md`, `SUMMARY.md` — this project's own milestone-level research (completed 2026-07-20, same day, as part of v2.0 roadmap creation), covering the full v2.0 milestone; the Phase 5-relevant sections are reproduced/adapted above with the phase's specific scope applied
- WebSearch, "MIT NANDA State of AI in Business 2025 95% generative AI pilots fail ROI report" (2026-07-20) — cross-referenced Fortune (2025-08-18), Forbes (2025-08-26), and the primary report PDF (`mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf`) to independently verify the 95%-stat's actual scope (enterprise pilots, ~300 initiatives, 150 executive interviews) ahead of Pitfall 3's citation guidance
- [fde.academy — "AI Forward-Deployed Engineering"](https://fde.academy/blog/ai-forward-deployed-engineering) (fetched 2026-07-20 via WebFetch, user-supplied) — MEDIUM confidence: an industry/hiring-market explainer of the FDE role, not an official standard or a competitor's landing page. Used only as copy/framing inspiration (Architecture Pattern 3 above) — definitional language and root-cause framing corroborate this project's existing positioning; its enterprise case studies and stats beyond the independently-verified 95% figure are explicitly flagged as NOT appropriate to reuse on this site (see Pattern 3's Trade-offs note)

### Tertiary (LOW confidence)
- None used directly in this research pass beyond what's already flagged LOW confidence and cited in the project's own PITFALLS.md/FEATURES.md (e.g., the ROI-calculator pattern survey sources, "AI-native transformation" SEO-difficulty claim) — not re-verified independently here since Phase 5's ROI calculator is a build-it-yourself component, not a vendored pattern requiring further sourcing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; all version claims verified against live npm registry and the actual `package.json`/`components.json` in this repo
- Architecture: HIGH — directly extends the existing, working `page.tsx` + `components/sections/*` pattern; no novel architectural decisions required for this phase
- Copy/positioning guidance (95%-stat sourcing, pricing scope-qualification, anonymity handling, fde.academy copy reference): MEDIUM-HIGH — cross-verified against the project's own prior milestone research, independent WebSearch verification of the 95%-stat's primary source, and the user-supplied fde.academy article, all pointing the same direction
- Pitfalls: MEDIUM-HIGH — mix of direct codebase inspection (HIGH confidence — the founder-name/vertical-vocab hits are literal grep results, not inferred) and the project's own prior research (MEDIUM-HIGH, per that document's own stated confidence)

**Research date:** 2026-07-20
**Valid until:** ~30 days (stable domain — no fast-moving library APIs involved; re-verify the 95%-stat citation and Cal.com/domain placeholder status if this research is reused after that window)
