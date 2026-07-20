# Phase 5: FDE Landing Page - Pattern Map

**Mapped:** 2026-07-20
**Files analyzed:** 23 (new, rewritten, edited, and deleted)
**Analogs found:** 21 / 23 (2 have no in-repo analog — shadcn `input`/`label` primitives)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/app/page.tsx` | route (composition) | request-response (SSG) | itself (current `page.tsx`) | exact — same composition shape, new import list |
| `src/components/sections/hero.tsx` | component (section) | request-response (static render) | itself (current `hero.tsx`) | exact — same layout skeleton, new copy |
| `src/components/sections/the-fix.tsx` | component (section) | request-response (static render) | `src/components/sections/outcomes.tsx` | role-match — asymmetric static explainer section |
| `src/components/sections/outcomes.tsx` | component (section) | request-response (static render) | itself (current `outcomes.tsx`) | exact — same asymmetric lead/rest pattern, new stats/framing line |
| `src/components/sections/roi-calculator.tsx` | component (client island) | transform (client-side arithmetic, no network) | `src/components/cal-embed.tsx` | role-match — only other `"use client"` component in repo; same "small client boundary" discipline |
| `src/components/sections/offer.tsx` | component (section) | request-response (static render) | `src/components/service-sequence.tsx` | exact — numbered/asymmetric pricing sequence pattern |
| `src/components/sections/process-transparency.tsx` (renamed from `engagement-flow.tsx`) | component (section) | request-response (static render) | itself (current `engagement-flow.tsx`) + `service-sequence.tsx` | exact — same dark-band numbered-flow shape, richer step copy merged in |
| `src/components/sections/final-cta.tsx` | component (section) | request-response (static render) | itself (current `final-cta.tsx`) | exact — copy-only edit, structure unchanged |
| `src/app/book/page.tsx` | route | request-response (SSG) | itself (current `book/page.tsx`) | exact — copy-only edit, structure unchanged |
| `src/components/cal-embed.tsx` | component (client island) | event-driven (Cal.com embed script lifecycle) | itself (current `cal-embed.tsx`) | exact — copy-only edit to error-fallback string |
| `src/app/sitemap.ts` | config/route | batch (build-time route enumeration) | itself (current `sitemap.ts`) | exact — array literal edit only |
| `src/components/site-header.tsx` | component (nav) | request-response (static render) | itself (current `site-header.tsx`) | exact — `navLinks` array edit only |
| `src/components/site-footer.tsx` | component (nav) | request-response (static render) | itself (current `site-footer.tsx`) | exact — `footerLinks` array edit only |
| `src/components/mobile-nav.tsx` | component (nav, client) | request-response (static render) | itself (current `mobile-nav.tsx`) | exact — `navLinks` array edit only |
| `src/components/ui/input.tsx` | component (ui primitive) | request-response (controlled input) | `src/components/ui/button.tsx` | partial — closest existing shadcn cva-pattern primitive; no input/label exists yet, add via `npx shadcn@latest add input label` |
| `src/components/ui/label.tsx` | component (ui primitive) | request-response (static render) | `src/components/ui/button.tsx` | partial — same as above |

### Deleted (no pattern extraction needed, listed for completeness)

| File | Reason for Deletion |
|---|---|
| `src/components/sections/verticals-teaser.tsx` | 4-vertical strategy scrapped (PIVOT-BRIEF.md) |
| `src/components/sections/founder-strip.tsx` | Named-founder trust signal conflicts with anonymity constraint |
| `src/components/sections/demo-placeholder.tsx` | Tied to scrapped missed-call demo concept |
| `src/components/founder-block.tsx` | About-page founder bio, conflicts with anonymity constraint |
| `src/app/about/page.tsx` | Single-page IA — no standalone About route in v2 |
| `src/app/services/page.tsx` | Single-page IA — pricing/sequence content folds into `Offer` + `ProcessTransparency` |
| `src/components/service-sequence.tsx` | Optional — content merged into `Offer`; file deletion is planner's call once merged |

---

## Pattern Assignments

### `src/app/page.tsx` (route, composition)

**Analog:** itself — `src/app/page.tsx` (current, lines 1-31)

**Current shape (imports + composition), replace content but keep the pattern:**
```typescript
import type { Metadata } from "next";

import { EngagementFlow } from "@/components/sections/engagement-flow";
import { FinalCta } from "@/components/sections/final-cta";
import { FounderStrip } from "@/components/sections/founder-strip";
import { Hero } from "@/components/sections/hero";
import { Outcomes } from "@/components/sections/outcomes";
import { VerticalsTeaser } from "@/components/sections/verticals-teaser";

export const metadata: Metadata = {
  title: "Recover the time and money your business is losing",
  description: "...",
};

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
```

**New shape (from RESEARCH.md Code Examples — this is the target, not illustrative):**
```typescript
import { Hero } from "@/components/sections/hero";                       // gap
import { TheFix } from "@/components/sections/the-fix";                  // fix — NEW
import { Outcomes } from "@/components/sections/outcomes";               // outcomes + worst-case
import { RoiCalculator } from "@/components/sections/roi-calculator";    // PROOF-02/03 — NEW
import { Offer } from "@/components/sections/offer";                     // offer — NEW
import { ProcessTransparency } from "@/components/sections/process-transparency"; // LAND-04
import { FinalCta } from "@/components/sections/final-cta";              // CTA

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
`metadata` object pattern stays (title/description), content rewritten to gap-first framing per UI-SPEC.

**Order is a testable success criterion — do not reorder** (UI-SPEC Phase Component Inventory, ROADMAP Success Criterion #1).

---

### `src/components/sections/hero.tsx` (component, request-response)

**Analog:** itself — `src/components/sections/hero.tsx` (lines 1-39)

**Structure to keep (Display headline + body + CTA, two-column layout):**
```tsx
import { BookCta } from "@/components/book-cta";

export function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:flex-row lg:items-center lg:gap-16">
      <div className="flex flex-col gap-6 lg:w-1/2">
        <h1
          className="font-heading leading-[1.1] font-semibold text-foreground"
          style={{ fontSize: "clamp(32px, 8vw, 44px)" }}
        >
          {/* gap-first headline, cited 95%-stat framing */}
        </h1>
        <p className="max-w-md text-base leading-[1.6] text-foreground">
          {/* body copy */}
        </p>
        {/* 95%-stat citation line: text-sm text-muted-foreground, directly beneath headline/body per UI-SPEC */}
        <div>
          <BookCta />
        </div>
      </div>
      <div className="lg:w-1/2">
        {/* right column: DemoPlaceholder is DELETED — UI-SPEC doesn't reassign this slot;
            planner should decide whether to drop to single-column or fill with new visual */}
      </div>
    </section>
  );
}
```

**Key removals:** `DemoPlaceholder` import and usage (component deleted). `BookCta` import/usage pattern is unchanged — reuse verbatim, this is the Top CTA (LAND-03).

**Display-size text is reserved for this H1 only** — UI-SPEC Typography: "Display is reserved for the Hero H1 only... every section below is visually subordinate."

---

### `src/components/sections/the-fix.tsx` (component, request-response) — NEW

**Analog:** `src/components/sections/outcomes.tsx` (structural pattern — asymmetric static section, lines 1-61) — no direct v1 "fix" analog exists; this is genuinely new content on an existing section shape.

**Pattern to copy — section wrapper + eyebrow label + heading:**
```tsx
export function TheFix() {
  return (
    <section id="fix" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <p className="text-sm font-semibold tracking-[0.02em] text-primary uppercase">
        {/* eyebrow label, e.g. "The Fix" */}
      </p>
      <p className="mt-2 font-heading text-2xl leading-[1.2] font-semibold text-foreground sm:text-[1.75rem]">
        {/* forward-deployed engineering explainer heading */}
      </p>
      <p className="mt-4 max-w-xl text-base leading-[1.6] text-foreground">
        {/* body copy — embedded/workflow-first/white-glove framing,
            per RESEARCH Pattern 3's fde.academy-derived language */}
      </p>
    </section>
  );
}
```
Uses the same `text-sm font-semibold tracking-[0.02em] text-primary uppercase` eyebrow-label idiom as `Outcomes`' `{lead.label}` (outcomes.tsx line 32) and heading-role sizing (`text-2xl`/`sm:text-[1.75rem]`) as seen in `engagement-flow.tsx` line 31 and `final-cta.tsx` line 11. **No icon grid** — UI-SPEC explicitly excludes lucide-react icons from TheFix.

`id="fix"` anchor required — `site-header.tsx`/`site-footer.tsx` nav links will NOT point here (they point to `#offer`/`#process`), but UI-SPEC's inventory table lists `#fix` as this section's anchor for consistency/future deep-linking.

---

### `src/components/sections/outcomes.tsx` (component, request-response)

**Analog:** itself — `src/components/sections/outcomes.tsx` (lines 1-61, full file)

**Structure to keep exactly (asymmetric lead + secondary-pair grid — this is an explicit SITE-06 anti-pattern gate against a uniform 3-card grid):**
```tsx
const outcomes = [
  { label: "...", stat: "...", body: "..." },
  { label: "...", stat: "...", body: "..." },
  { label: "...", stat: "...", body: "..." },
] as const;

export function Outcomes() {
  const [lead, ...rest] = outcomes;

  return (
    <section id="outcomes" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <p className="text-sm font-semibold tracking-[0.02em] text-primary uppercase">
            {lead.label}
          </p>
          <p className="mt-2 font-heading text-3xl leading-[1.2] font-semibold text-foreground sm:text-4xl">
            <span className="text-primary">{lead.stat}</span> {/* ... */}
          </p>
          <p className="mt-4 max-w-xl text-base leading-[1.6] text-foreground">
            {lead.body}
          </p>
        </div>
        <div className="flex flex-col gap-8 lg:col-span-5 lg:border-l lg:border-border lg:pl-8">
          {rest.map((outcome) => (
            <div key={outcome.label}>
              <p className="text-sm font-semibold tracking-[0.02em] text-primary uppercase">
                {outcome.label}
              </p>
              <p className="mt-1 font-heading text-xl leading-[1.2] font-semibold text-foreground">
                {outcome.stat}
              </p>
              <p className="mt-2 text-base leading-[1.6] text-foreground">
                {outcome.body}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* NEW: add standalone worst-case/conservative framing line (LAND-05) —
          "Even in the worst case, you come out ahead." per UI-SPEC */}
    </section>
  );
}
```

**Content changes required:** relabel to TIME/EFFICIENCY/PROFIT vocabulary (currently "Time saved"/"Profit recovered"/"Expenses cut"); add the standalone worst-case line UI-SPEC mandates as a testable requirement (not just implied by conservative numbers); add `id="outcomes"` anchor (not present in current file).

---

### `src/components/sections/roi-calculator.tsx` (component, client island) — NEW

**Analog:** `src/components/cal-embed.tsx` (only other `"use client"` component in the repo — lines 1-70) for the **"use client" boundary discipline pattern**; RESEARCH.md's Pattern 2 code block is the literal implementation baseline (UI-SPEC: "treat the illustrative code in 05-RESEARCH.md as the implementation baseline, not just inspiration").

**"use client" boundary pattern to copy (cal-embed.tsx lines 1-21):**
```tsx
"use client";

import { useState } from "react";
// keep the "use client" boundary as small as possible —
// everything that doesn't need interactivity stays a Server Component
// (same discipline as cal-embed.tsx's own inline comment, lines 11-13)
```

**Implementation baseline (RESEARCH.md Pattern 2, verified against UI-SPEC's ROI Calculator Contract):**
```tsx
"use client";

import { useState } from "react";
import { BookCta } from "@/components/book-cta";

const WEEKS_PER_YEAR = 50; // conservative — excludes ~2 weeks holiday/slow periods

export function RoiCalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [hourlyCost, setHourlyCost] = useState(35);

  const annualHours = hoursPerWeek * WEEKS_PER_YEAR;
  const annualDollars = annualHours * hourlyCost;

  return (
    <section id="calculator" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
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

      {hoursPerWeek === 0 ? (
        <p>
          See what you&apos;re leaving on the table. Enter your team&apos;s
          hours and hourly cost above — we&apos;ll show you the time and
          money a forward-deployed engineer could recover.
        </p>
      ) : (
        <p>
          That&apos;s <strong className="text-primary">{annualHours.toLocaleString()} hours/year</strong> back
          — roughly <strong className="text-primary">${annualDollars.toLocaleString()}</strong> in recovered
          time, even before counting the efficiency gains from work that no
          longer needs a person at all.
        </p>
      )}
      <BookCta />
    </section>
  );
}
```

**Validation:** clamp non-negative via `Math.max(0, Number(value) || 0)` — same coercion idiom needed here as UI-SPEC's Field table (no Zod, no react-hook-form — RESEARCH explicitly rules these out for a 2-field client-only calculator).

**Result numerals use accent color** (`text-primary`) per UI-SPEC Color contract item (3): "the ROI calculator's result numbers (annual hours / annual dollars)."

**Terminates in `<BookCta />`** — same import/usage as every other CTA placement (`book-cta.tsx`, unchanged).

**Empty state is required, not optional** — UI-SPEC: "do not show '$0/0 hours' — that reads as a broken calculator."

---

### `src/components/sections/offer.tsx` (component, request-response) — NEW

**Analog:** `src/components/service-sequence.tsx` (full file, lines 1-65) — exact structural match for a scope-qualified, numbered/asymmetric pricing sequence.

**Pattern to copy verbatim (numbered asymmetric flow, step-1 gets widest column + accent price):**
```tsx
const steps = [
  {
    number: "01",
    title: "Free Audit",
    price: "$0",
    body: "...", // no cost, no commitment — see UI-SPEC Pricing copy
  },
  {
    number: "02",
    title: "One-Time Setup",
    price: "Under $10k",
    body: "...", // scoped during your free audit — Pitfall 4 scope-qualifying language mandatory
  },
  {
    number: "03",
    title: "Monthly Retainer",
    price: "Under $2k/mo",
    body: "...",
  },
] as const;

export function Offer() {
  return (
    <section id="offer" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <ol className="flex flex-col gap-12 md:grid md:grid-cols-[1.6fr_1fr_1fr] md:items-start md:gap-8">
        {steps.map((step, index) => (
          <li key={step.number} className="flex flex-col gap-4">
            <div className="flex items-baseline gap-3">
              <span className="font-heading text-sm font-semibold text-muted-foreground">
                {step.number}
              </span>
              <span
                className={
                  index === 0
                    ? "font-heading text-lg font-semibold text-primary"
                    : "font-heading text-lg font-semibold text-foreground"
                }
              >
                {step.price}
              </span>
            </div>
            <h3
              className={
                index === 0
                  ? "font-heading leading-[1.2] font-semibold text-foreground"
                  : "font-heading text-xl leading-[1.2] font-semibold text-foreground"
              }
              style={index === 0 ? { fontSize: "28px" } : undefined}
            >
              {step.title}
            </h3>
            <p className="max-w-md text-base leading-[1.6] text-foreground/90">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
      {/* Mid CTA (LAND-03) — <BookCta /> placed here */}
    </section>
  );
}
```

**Pricing copy MUST ship scope-qualified per UI-SPEC/Pitfall 4** — e.g. "most engagements: one-time setup under $10k, scoped during your free audit" — never a bare unconditional "<$10k" headline. This is a copy-review checklist item, not implicit in the layout.

**Anti-pattern gate already satisfied:** the numbered/asymmetric layout (not a uniform 3-card grid) — inherited directly from `service-sequence.tsx`'s own doc comment (lines 22-28).

---

### `src/components/sections/process-transparency.tsx` (renamed from `engagement-flow.tsx`)

**Analog:** itself — `src/components/sections/engagement-flow.tsx` (full file, lines 1-67), merged with `service-sequence.tsx`'s richer step copy (lines 1-20) per RESEARCH's Open Question #1 recommendation (treat as adjacent-but-distinct from Offer).

**Structure to keep exactly (dark-band, numbered flow, asymmetric step widths, ends in a link):**
```tsx
export function ProcessTransparency() {
  return (
    <section id="process" className="bg-secondary text-secondary-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="font-heading text-2xl leading-[1.2] font-semibold text-secondary-foreground sm:text-[1.75rem]">
          How the engagement works
        </h2>
        <ol className="flex flex-col gap-10 sm:flex-row sm:gap-8">
          {steps.map((step, index) => (
            <li
              key={step.number}
              className={
                index === 0
                  ? "flex flex-col gap-3 sm:w-[42%]"
                  : "flex flex-col gap-3 sm:w-[29%]"
              }
            >
              <span className="font-heading text-sm font-semibold text-primary">
                {step.number}
              </span>
              <p className="font-heading text-xl leading-[1.2] font-semibold text-secondary-foreground">
                {step.title}
              </p>
              <p className="text-base leading-[1.6] text-secondary-foreground/90">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
        {/* REMOVE: the <Link href="/services"> at the bottom (lines 56-63) —
            /services is deleted; this section is now the full detail, no
            "read more" link needed, or link to #offer instead if desired */}
      </div>
    </section>
  );
}
```

**Key edit:** remove the `Link` to `/services` (deleted route) — either drop it entirely or repoint to `#offer` as an in-page anchor. **Keep the `40px`/`gap-10` step gap and `bg-secondary`/dark-band treatment** — UI-SPEC Spacing Scale explicitly calls this out as "already in active use, keep for the renamed ProcessTransparency section."

---

### `src/components/sections/final-cta.tsx` (component, request-response) — EDIT ONLY

**Analog:** itself — `src/components/sections/final-cta.tsx` (full file, lines 1-23)

**Structure unchanged, copy only:**
```tsx
import { BookCta } from "@/components/book-cta";

export function FinalCta() {
  return (
    <section id="cta" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex flex-col items-center gap-6 rounded-xl bg-secondary px-6 py-12 text-center text-secondary-foreground sm:px-12">
        <h2 className="font-heading text-2xl leading-[1.2] font-semibold sm:text-[1.75rem]">
          {/* rewrite: drop "what's slipping through" (v1 missed-call framing) */}
        </h2>
        <p className="max-w-md text-base leading-[1.6] text-secondary-foreground/90">
          {/* rewrite copy, keep tone */}
        </p>
        <BookCta />
      </div>
    </section>
  );
}
```
Only the two copy strings (h2, p) need rewriting to drop v1 vocabulary — layout, `bg-secondary` rounded band, `<BookCta />` usage all stay identical. This is the Bottom CTA (LAND-03, 3rd of 3 placements).

---

### `src/app/book/page.tsx` (route) — EDIT ONLY

**Analog:** itself — `src/app/book/page.tsx` (full file, lines 1-40)

**Violating line to remove (line 9-11):**
```typescript
description:
  "Grab 30 minutes with " +
  siteConfig.founderName +
  " to walk through where your business is losing time and money to manual work — no pitch, just a plain conversation.",
```
Replace with anonymous phrasing — no `siteConfig.founderName` interpolation, no gendered pronoun. Body copy (lines 26-33) is already anonymous/pronoun-free ("We'll figure out together...") — no change needed there, only the `metadata.description` string. Structure (`Server Component page wrapping <CalEmbed />`) is unchanged.

---

### `src/components/cal-embed.tsx` (component, client island) — EDIT ONLY

**Analog:** itself — `src/components/cal-embed.tsx` (full file, lines 1-70)

**Violating block to rewrite (lines 46-60, the `failed` fallback):**
```tsx
// BEFORE
if (failed) {
  return (
    <div role="alert" className="rounded-lg border border-destructive p-6 text-destructive">
      Couldn&apos;t load the booking calendar. Email {siteConfig.founderName}{" "}
      directly at{" "}
      <a href={`mailto:${siteConfig.founderEmail}`} className="underline">
        {siteConfig.founderEmail}
      </a>{" "}
      and she&apos;ll find a time — usually within one business day.
    </div>
  );
}
```
```tsx
// AFTER — per UI-SPEC Copywriting Contract, "Error state" row
if (failed) {
  return (
    <div role="alert" className="rounded-lg border border-destructive p-6 text-destructive">
      Couldn&apos;t load the booking calendar. Email us directly at{" "}
      <a href={`mailto:${siteConfig.founderEmail}`} className="underline">
        {siteConfig.founderEmail}
      </a>{" "}
      and we&apos;ll find a time — usually within one business day.
    </div>
  );
}
```
Everything else in the file (the `useEffect`/`getCalApi` theme-config block, lines 24-44, and the success-path `<Cal>` render, lines 62-69) is untouched — this is a copy-only edit isolated to the `role="alert"` fallback string.

---

### `src/app/sitemap.ts` — EDIT ONLY

**Analog:** itself — `src/app/sitemap.ts` (full file, lines 1-15)

```typescript
// BEFORE
const routes = ["", "/about", "/services", "/book"];

// AFTER
const routes = ["", "/book"];
```
Rest of the file (the `sitemap()` function mapping routes to `{ url, lastModified }`) is unchanged.

---

### `src/components/site-header.tsx`, `src/components/site-footer.tsx`, `src/components/mobile-nav.tsx` — EDIT ONLY (nav link arrays)

**Analog:** each is its own analog — only the `navLinks`/`footerLinks` const arrays change; JSX structure is untouched in all three.

**site-header.tsx (line 13-16):**
```typescript
// BEFORE
const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
];

// AFTER (per UI-SPEC Phase Component Inventory "Edit only" list)
const navLinks = [
  { href: "#offer", label: "Pricing" },
  { href: "#process", label: "How It Works" },
];
```

**site-footer.tsx (line 6-11):**
```typescript
// BEFORE
const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/book", label: "Book" },
];

// AFTER
const footerLinks = [
  { href: "/", label: "Home" },
  { href: "#offer", label: "Pricing" },
  { href: "#process", label: "How It Works" },
  { href: "/book", label: "Book" },
];
```

**mobile-nav.tsx (line 17-20):** same `/services`/`/about` → `#offer`/`#process` swap as site-header.tsx — UI-SPEC flags this file as "not read in full during this research pass — check before marking LAND-06 complete," confirmed here: it uses the identical `navLinks` shape as `site-header.tsx` (lines 17-20), same fix applies verbatim.

**Note on anchor links from `/book` or non-`/` pages:** `#offer`/`#process` are same-page anchors that only resolve correctly when the current route is `/`. Since `/about` and `/services` are deleted and `/book` doesn't render these sections, the header/footer/mobile-nav anchor links will only work when the visitor is on `/` already (or the browser follows `/#offer` cross-route, which Next.js's `<Link>` supports natively via full href `"/#offer"` if visited from `/book`). Recommend using `/#offer` and `/#process` (leading slash) rather than bare `#offer`/`#process` if these nav links must also resolve correctly when clicked from `/book`.

---

### `src/components/ui/input.tsx` / `src/components/ui/label.tsx` — NEW (conditional)

**Analog:** `src/components/ui/button.tsx` (full file, lines 1-68) — closest existing shadcn primitive in the repo for the cva-variant, `data-slot`, `cn()`-merged-className pattern this project's UI layer follows.

**Pattern to match (cva variants + data-slot + cn merge, from button.tsx lines 7-42, 44-65):**
```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

// button.tsx establishes: data-slot="button" attribute, cn(variants({...}), className)
// merge order, and a plain functional component (not forwardRef) exported alongside
// its variants object. Match this shape if hand-rolling input/label instead of using
// the shadcn CLI.
```

**Recommended approach (per RESEARCH/UI-SPEC):** run `npx shadcn@latest add input label` rather than hand-rolling — this is the established copy-paste-ownership model already configured via `components.json` (`style: radix-nova`, confirmed working for the 7 primitives already in `src/components/ui/`). Only fall back to hand-rolling matching `button.tsx`'s pattern if the CLI is unavailable in the execution environment.

**44px minimum touch target requirement** (UI-SPEC Spacing Scale exception) applies to the calculator's number inputs on mobile — `h-11` class, same idiom as `book-cta.tsx`'s `variant === "sticky"` branch (`"h-11 w-full text-base"`, book-cta.tsx line 25) and `sticky-cta-bar.tsx`'s `h-14` bar.

---

## Shared Patterns

### CTA Button
**Source:** `src/components/book-cta.tsx` (full file, 30 lines)
**Apply to:** Hero (top CTA), Offer (mid CTA), FinalCta (bottom CTA), RoiCalculator (post-result CTA), SiteHeader, SiteFooter, MobileNav, StickyCtaBar — every CTA placement across all new/rewritten sections.
```tsx
import { BookCta } from "@/components/book-cta";
// <BookCta />  — default "primary" variant, or variant="sticky" for the mobile bar
```
Never hardcode a new `<Link href="/book">` or duplicate the "Book Your Free Audit Call" string — always import and reuse this single component so copy/destination never drift (per its own doc comment, book-cta.tsx lines 15-19).

### Section Eyebrow Label (accent, uppercase)
**Source:** `src/components/sections/outcomes.tsx` line 32
```tsx
<p className="text-sm font-semibold tracking-[0.02em] text-primary uppercase">
  {label}
</p>
```
**Apply to:** TheFix, Outcomes (existing), Offer (step price numeral role), any new section needing a small uppercase category label — per UI-SPEC Color contract item (4): accent reserved for "uppercase eyebrow/section labels."

### Dark "Trust Band" Section Wrapper
**Source:** `src/components/sections/engagement-flow.tsx` line 29, `src/components/sections/final-cta.tsx` line 10
```tsx
<section className="bg-secondary text-secondary-foreground">
```
**Apply to:** ProcessTransparency (renamed engagement-flow) and FinalCta — per UI-SPEC Color: "dark 'trust band' sections: ProcessTransparency... and FinalCta render on this dark surface, matching existing pattern." Do NOT apply to Hero/TheFix/Outcomes/RoiCalculator/Offer — those stay on the paper (`--background`) surface.

### Numbered/Asymmetric Sequence (anti-pattern gate: never a uniform 3-card grid)
**Source:** `src/components/service-sequence.tsx` (full file) and `src/components/sections/engagement-flow.tsx` (full file)
**Apply to:** Offer, ProcessTransparency — both are numbered flows where step/item 1 gets a visually wider column and more copy than steps 2-3. This is an explicit, repeatedly-documented anti-pattern gate in the existing codebase's own comments (service-sequence.tsx lines 22-28, engagement-flow.tsx lines 21-26, outcomes.tsx lines 19-24) — every static multi-item section in this phase must use an asymmetric/numbered layout, never `grid-cols-3` with uniform cards.

### "use client" Boundary Minimization
**Source:** `src/components/cal-embed.tsx` lines 11-13 (doc comment)
```tsx
"use client";
// keep the "use client" boundary as small as possible so the rest of the
// page/route stays a Server Component
```
**Apply to:** RoiCalculator — the only other Client Component this phase introduces. Everything else (Hero, TheFix, Outcomes, Offer, ProcessTransparency, FinalCta, page.tsx) stays a Server Component with zero `"use client"` directive.

### Section Container Width/Padding
**Source:** `src/components/sections/outcomes.tsx` line 29, `src/components/sections/final-cta.tsx` line 9
```tsx
<section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
```
**Apply to:** Every light-surface section (Hero uses `pt-16 pb-20 sm:pt-24 sm:pb-28` as a hero-specific variant; TheFix, Outcomes, Offer, RoiCalculator should use the standard `py-16 sm:py-20`; FinalCta uses `sm:py-24` per its "last conversion moment" exception documented in UI-SPEC Spacing Scale).

### Anonymity Scrub (`siteConfig.founderName` usage)
**Source:** `src/config/site.ts` lines 12-35 (the constant definition itself, which stays)
**Apply to:** `cal-embed.tsx`, `book/page.tsx` — the two known remaining call sites after `founder-strip.tsx`/`founder-block.tsx` are deleted. `siteConfig.founderName` itself is NOT removed from `site.ts` (may still be useful internally) — only consuming components that interpolate it into visitor-facing copy must be rewritten. Run `grep -rn "founderName\|Annie\|\bshe\b\|\bher\b" src/` as the exit-criterion check (UI-SPEC Anonymity scrub checklist).

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `src/components/ui/input.tsx` | ui primitive | request-response (controlled input) | No input primitive exists yet in `src/components/ui/` (verified via `ls` — only badge/button/card/navigation-menu/separator/sheet/skeleton present); add via `npx shadcn@latest add input label`, or hand-roll matching `button.tsx`'s cva/data-slot pattern as fallback |
| `src/components/ui/label.tsx` | ui primitive | request-response (static render) | Same as above |

Both are LOW risk — the shadcn CLI is already configured and trusted in this repo (`components.json` present, 7 primitives already copied via the same tool), so this is a mechanical `npx shadcn@latest add` invocation, not a novel pattern decision.

---

## Metadata

**Analog search scope:** `src/app/**`, `src/components/**`, `src/config/site.ts` — full repo (23 TS/TSX files total, all read in full or targeted during this pass)
**Files scanned:** 23
**Pattern extraction date:** 2026-07-20
