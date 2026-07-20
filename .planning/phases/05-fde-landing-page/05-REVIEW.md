---
phase: 05-fde-landing-page
reviewed: 2026-07-20T00:00:00Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - src/components/sections/the-fix.tsx
  - src/components/sections/hero.tsx
  - src/components/sections/offer.tsx
  - src/components/sections/outcomes.tsx
  - src/components/sections/roi-calculator.tsx
  - src/components/sections/process-transparency.tsx
  - src/components/sections/final-cta.tsx
  - src/app/page.tsx
  - src/app/sitemap.ts
  - src/components/site-header.tsx
  - src/components/site-footer.tsx
  - src/components/mobile-nav.tsx
  - src/components/cal-embed.tsx
  - src/app/book/page.tsx
findings:
  critical: 0
  warning: 1
  info: 6
  total: 7
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-07-20
**Depth:** standard
**Files Reviewed:** 14
**Status:** issues_found

## Summary

Reviewed the FDE landing page section components, the home/book routes, the sitemap, and the site chrome (header/footer/mobile nav/Cal embed). No security issues, hardcoded secrets, dangerous APIs, or crashing logic bugs were found — this is a largely static marketing surface with only one client-side island (`RoiCalculator`) doing pure client-local arithmetic (no network calls, no persistence, no injectable input sinks). Cross-referenced `book-cta.tsx`, `config/site.ts`, `layout.tsx`, and the Cal.com embed SDK types to verify the claims made in the reviewed files' JSDoc comments; those hold up (e.g. `cal(...)` is synchronous per the SDK's `.d.ts`, so the `try/catch` error-fallback in `cal-embed.tsx` is correctly scoped — no async-rejection gap there).

The one real defect is a semantic-HTML/accessibility gap: several sections render their visual "heading" as a styled `<p>` instead of an `<h2>`/`<h3>`, which breaks the page's heading outline for screen-reader users navigating by heading. Everything else found is lower-severity: comment/implementation drift, duplicated nav-link arrays, and a couple of small quality nitpicks.

## Warnings

### WR-01: Section titles rendered as `<p>` instead of heading elements, breaking heading-navigation for screen readers

**File:** `src/components/sections/the-fix.tsx:17`, `src/components/sections/outcomes.tsx:35,49`, `src/components/sections/offer.tsx:52-61`

**Issue:** The page's actual heading outline is inconsistent and has gaps. `Hero` correctly uses `<h1>`; `RoiCalculator`, `ProcessTransparency`, and `FinalCta` correctly use `<h2>`. But `TheFix`'s section title ("A forward-deployed engineer, embedded in how your business actually runs.") is a `<p>` (the-fix.tsx:17), and both of `Outcomes`'s stat headlines ("15+ hrs/week back in your week", and the two secondary stat lines) are `<p>` elements (outcomes.tsx:35, 49) despite being styled identically to headings (`font-heading`, `text-2xl`/`text-3xl`, `font-semibold`). `Offer`'s three step titles use `<h3>` (offer.tsx:52-61) with no parent `<h2>` for the section, so the heading level jumps from `<h1>` straight to `<h3>`.

Net effect: a screen-reader user using "jump to next heading" navigation (a primary way blind/low-vision users skim a page) will skip the entire `TheFix` and `Outcomes` sections — two of the five message-hierarchy sections this phase was built to land (LAND-01) — and will encounter a heading-level skip at `Offer`. This is a correctness defect in document structure, not a style preference: the visual design already treats this text as a heading (same type scale/weight as the real `<h2>`s elsewhere on the page); only the markup is wrong.

**Fix:** Promote the styled "heading" text in each section to an actual heading element, keeping the existing className/visual treatment:
```tsx
// the-fix.tsx:17
<h2 className="mt-2 font-heading text-2xl leading-[1.2] font-semibold text-foreground sm:text-[1.75rem]">
  A forward-deployed engineer, embedded in how your business actually runs.
</h2>

// outcomes.tsx:35 (lead) and :49 (rest)
<h2 className="mt-2 font-heading text-3xl leading-[1.2] font-semibold text-foreground sm:text-4xl"> ... </h2>
<h3 className="mt-1 font-heading text-xl leading-[1.2] font-semibold text-foreground"> ... </h3>
```
For `Offer`, either add a visually-hidden `<h2>` for the section (e.g. "Pricing" / "The Offer") before the `<ol>`, or accept `<h3>` only if the section is intentionally treated as a continuation of the preceding `<h2>`-less flow — but note the current state does neither consistently.

## Info

### IN-01: Duplicated `navLinks` array between desktop and mobile nav

**File:** `src/components/site-header.tsx:13-16`, `src/components/mobile-nav.tsx:17-20`
**Issue:** The exact same `navLinks` array (`/#offer` "Pricing", `/#process` "How It Works") is hand-copied into both `site-header.tsx` and `mobile-nav.tsx`. If a nav link is ever added, renamed, or reordered, it's easy to update one file and forget the other, producing a desktop/mobile nav that silently drifts apart.
**Fix:** Extract to a single shared constant, e.g. `src/config/nav.ts`, and import it from both components.

### IN-02: Stale JSDoc comment on `SiteHeader` references nav links that don't exist

**File:** `src/components/site-header.tsx:20`
**Issue:** The comment says "desktop nav (Services, About per D-08)", but the actual `navLinks` array (lines 13-16) renders "Pricing" and "How It Works", not "Services" or "About". This looks like leftover documentation from an earlier iteration of the nav that wasn't updated when the links changed — misleading for the next person reading this file.
**Fix:** Update the comment to match the current links, e.g. "desktop nav (Pricing, How It Works) and the primary BookCta."

### IN-03: Hardcoded pixel font-sizes via inline `style`, bypassing Tailwind's type-scale tokens

**File:** `src/components/sections/hero.tsx:16` (`clamp(32px, 8vw, 44px)`), `src/components/sections/offer.tsx:58` (`28px`)
**Issue:** Both components reach for an inline `style={{ fontSize: ... }}` with a raw magic-number pixel value instead of a Tailwind utility class, unlike every other heading in the reviewed files (which use `text-xl`/`text-2xl`/`text-3xl` etc.). This is a one-off escape hatch used in two different places with two different techniques (`clamp()` vs. a bare `px` value), making it harder to keep type scale consistent site-wide and harder to grep for "what sizes exist."
**Fix:** If a size truly falls outside the Tailwind scale, add it as a named theme token (e.g. `text-display` in the Tailwind v4 CSS-first config) rather than inlining a literal value at each call site.

### IN-04: Desktop `<nav>` landmark has no accessible label, unlike the footer/mobile nav

**File:** `src/components/site-header.tsx:35-48`
**Issue:** Radix's `NavigationMenu.Root` (used here via the shadcn wrapper) renders as a `<nav>` element. `SiteFooter`'s nav is labeled `aria-label="Footer"` (site-footer.tsx:33) and `MobileNav`'s is labeled `aria-label="Mobile"` (mobile-nav.tsx:58), but the desktop header's nav has no `aria-label` at all. With two-plus unlabeled/inconsistently-labeled `<nav>` landmarks in the DOM, assistive-tech users browsing by landmark get an ambiguous "navigation" entry.
**Fix:** Add `aria-label="Primary"` (or similar) to the `NavigationMenu` in `site-header.tsx` for parity with the other nav landmarks.

### IN-05: `process-transparency.tsx` relies on implicit flex-shrink to avoid overflow, unlike the equivalent CSS Grid used in `offer.tsx`

**File:** `src/components/sections/process-transparency.tsx:38-42`
**Issue:** The three `<li>` widths (`sm:w-[42%]`, `sm:w-[29%]`, `sm:w-[29%]`) sum to exactly 100% of the flex container before `sm:gap-8` (2rem × 2 gaps) is added on top, so the row's un-shrunk content would exceed the container by the gap width. The layout currently renders correctly only because flex-shrink defaults to `1` and proportionally reduces all three items — which happens to preserve the intended ~42/29/29 ratio, but that's an emergent property of the shrink algorithm, not an explicit contract. `offer.tsx` solves the identical "asymmetric 3-column, one column wider" layout problem more robustly with `grid-cols-[1.6fr_1fr_1fr]`, where gaps are accounted for automatically.
**Fix:** For consistency and to make the intent explicit, consider switching to the same `grid-cols-[42fr_29fr_29fr]`-style approach (or `flex-basis` instead of `width`) rather than relying on default shrink behavior.

### IN-06: `TheFix`'s JSDoc claims a structural parity with `Outcomes` that doesn't match the actual markup

**File:** `src/components/sections/the-fix.tsx:3-6`
**Issue:** The header comment states "Structural analog: outcomes.tsx's asymmetric static-explainer shape and accent eyebrow-label idiom." `TheFix` does share the eyebrow-label idiom (the uppercase accent-colored label), but its layout is a single-column stack of three paragraphs — it has none of `outcomes.tsx`'s asymmetric two-column (`lg:col-span-7` / `lg:col-span-5`) grid structure. A future maintainer reading only the comment could reasonably expect an asymmetric layout that isn't there.
**Fix:** Tighten the comment to describe only what's actually shared (the eyebrow-label idiom), or add the asymmetric grid if that was in fact the intended shape.

---

_Reviewed: 2026-07-20_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
