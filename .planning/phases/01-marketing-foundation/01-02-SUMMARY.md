---
phase: 01-marketing-foundation
plan: 02
subsystem: ui
tags: [nextjs, react, tailwind, shadcn, radix, layout, seo]

# Dependency graph
requires:
  - phase: 01-marketing-foundation (plan 01)
    provides: "siteConfig module, UI-SPEC design tokens, shadcn primitives (button, navigation-menu, sheet, separator)"
provides:
  - "Reusable <BookCta> component — single source for the 'Book Your Free Audit Call' copy + /book link"
  - "SiteHeader (sticky ink-navy, desktop nav Services/About + BookCta) and MobileNav (accessible sheet, 44px toggle)"
  - "SiteFooter (siteConfig-sourced identity, mailto contact, page links, BookCta repeat)"
  - "StickyCtaBar (mobile-only 56px bottom CTA bar)"
  - "Root layout wired: SiteHeader -> children -> SiteFooter -> StickyCtaBar, present on every route"
  - "sitemap.ts / robots.ts covering /, /about, /services, /book"
affects: [01-03, 01-04, 01-05, 01-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single reusable <BookCta variant='primary'|'sticky'> component — every CTA instance renders through it, never duplicating the copy string or /book href"
    - "Ink-navy chrome (header/footer) uses the --secondary/--secondary-foreground tokens from Plan 01's globals.css rather than new hardcoded hex values"
    - "Root layout shell pattern: header + main + footer + mobile-only sticky bar, established here for all future routes (Phase 3 audit funnel, Phase 4 vertical pages) to inherit for free"

key-files:
  created:
    - src/components/book-cta.tsx
    - src/components/site-header.tsx
    - src/components/mobile-nav.tsx
    - src/components/site-footer.tsx
    - src/components/sticky-cta-bar.tsx
    - src/app/sitemap.ts
    - src/app/robots.ts
  modified:
    - src/app/layout.tsx

key-decisions:
  - "Styled header/footer dark chrome using the existing --secondary/--secondary-foreground design tokens (ink navy / near-paper) from Plan 01's globals.css instead of introducing new color literals"
  - "Nav hover/active affordance implemented as a bottom-border color shift (transparent -> accent green) per UI-SPEC's 'accent underline' requirement, applied directly to the asChild-rendered Link inside NavigationMenuLink"
  - "MobileNav disables the shadcn Sheet's default close button (showCloseButton=false) and renders its own with the exact aria-label='Close menu' string required by the plan's acceptance criteria, since the primitive's default close button only has sr-only text, not an aria-label attribute"
  - "main element gets pb-14 md:pb-0 so page content isn't hidden behind the fixed mobile sticky CTA bar, removed on desktop where the bar itself is hidden"

patterns-established:
  - "CTA-through-one-component pattern: any future page needing the primary CTA imports <BookCta />, never re-implements the button/link/copy"
  - "Layout-shell-first pattern: new routes added in later plans automatically inherit header/footer/sticky-bar via the root layout with zero per-page wiring"

requirements-completed: [SITE-04, SITE-05, SITE-06]

# Metrics
duration: 4min
completed: 2026-07-19
---

# Phase 1 Plan 2: Layout Shell (Header, Footer, Mobile Nav, Sticky CTA) Summary

**Sticky ink-navy header with ordered nav (Services, About) and a single reusable `<BookCta>`, an accessible 44px-toggle mobile sheet nav, an ink-navy footer sourcing all identity from `siteConfig`, a 56px mobile sticky CTA bar, and generated sitemap/robots — all wired into the root layout so every current and future route inherits the shell.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-07-19T17:55:37Z
- **Completed:** 2026-07-19T17:59:09Z
- **Tasks:** 2 completed
- **Files modified:** 8 (6 created, 1 created for sitemap + 1 for robots, 1 modified)

## Accomplishments
- `<BookCta variant="primary"|"sticky">` — the one component every "Book Your Free Audit Call" instance renders through, eliminating copy/href drift across header, footer, and sticky bar
- Sticky ink-navy `SiteHeader` with desktop nav in D-08's required order (Services, then About) plus an accent hover underline, and an accessible `MobileNav` sheet with a 44px hamburger toggle carrying `aria-label="Open menu"` / `aria-label="Close menu"`
- `SiteFooter` rendering page links, `siteConfig.region`, and a `mailto:` link to `siteConfig.founderEmail` — no hardcoded identity literals, satisfying D-10 (no separate contact page)
- Mobile-only `StickyCtaBar`, exactly 56px (`h-14`) tall, hidden on desktop, with a 44px-minimum-height `BookCta variant="sticky"`
- Root layout now renders `SiteHeader -> {children} -> SiteFooter -> StickyCtaBar` in order, on top of Plan 01's existing Fraunces/IBM Plex Sans font wiring — no route in the app can render without this shell
- `sitemap.ts` / `robots.ts` added covering all four planned routes (`/`, `/about`, `/services`, `/book`); confirmed generated at `/sitemap.xml` and `/robots.txt` in the production build
- `npx next build` exits 0 after both tasks

## Task Commits

Each task was committed atomically:

1. **Task 1: Header, reusable BookCta, and accessible mobile nav** - `735d052` (feat)
2. **Task 2: Footer, sticky mobile CTA bar, root layout wiring, sitemap/robots** - `1bd1d22` (feat)

**Plan metadata:** (final commit follows this SUMMARY)

## Files Created/Modified
- `src/components/book-cta.tsx` - Reusable CTA: `<Link href="/book">Book Your Free Audit Call</Link>` wrapped in the shadcn Button, `primary`/`sticky` variants
- `src/components/site-header.tsx` - Sticky `bg-secondary` header, wordmark from `siteConfig.name`, desktop nav (Services, About) via `navigation-menu` primitive, `<BookCta />`, and `<MobileNav />` on small screens
- `src/components/mobile-nav.tsx` - Client Component; shadcn `sheet` triggered by a 44px ghost-button hamburger (`Menu`/`X` from `lucide-react`), custom close button with `aria-label="Close menu"`, nav links + `<BookCta />` inside
- `src/components/site-footer.tsx` - `bg-secondary` footer with identity (`siteConfig.name`, `region`, `mailto:founderEmail`), page links nav, and a repeated `<BookCta />`
- `src/components/sticky-cta-bar.tsx` - Client Component; fixed bottom bar, `h-14` (56px), `md:hidden`, wraps `<BookCta variant="sticky" />`
- `src/app/layout.tsx` - Added `SiteHeader`/`SiteFooter`/`StickyCtaBar` imports and rendering, title template + Open Graph metadata from `siteConfig.name`, `main` padded to clear the mobile sticky bar; Plan 01's font wiring untouched
- `src/app/sitemap.ts` - `MetadataRoute.Sitemap` covering `/`, `/about`, `/services`, `/book` against `siteConfig.domain`
- `src/app/robots.ts` - `MetadataRoute.Robots` allowing all crawlers, pointing to the generated sitemap

## Decisions Made
- Reused Plan 01's `--secondary` / `--secondary-foreground` design tokens (ink navy / near-paper) for the header and footer chrome instead of hardcoding new hex values, keeping the single design-token source of truth intact
- Implemented the accent hover/active nav underline as a `border-b-2` color transition directly on the `Link` rendered by `NavigationMenuLink asChild`, matching UI-SPEC's "accent underline, nothing decorative" constraint without extra markup
- Disabled the shadcn Sheet's built-in close button and rendered a custom one in `MobileNav` so the required literal `aria-label="Close menu"` string is present in the file the plan's grep-based acceptance criteria checks (the primitive's default close control only carries `sr-only` text, no `aria-label` attribute)
- Added `pb-14 md:pb-0` to the layout's `<main>` so page content clears the fixed mobile sticky CTA bar without affecting desktop, where the bar is hidden

## Deviations from Plan

None - plan executed exactly as written. No Rule 1-4 triggers encountered; all acceptance criteria satisfied on first pass.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. `siteConfig.domain` remains the Plan 01 NEEDS-FOUNDER placeholder; `sitemap.ts`/`robots.ts` will automatically resolve to the real domain once that value is updated (D-04 launch blocker, unchanged by this plan).

## Next Phase Readiness
- The layout shell (header, footer, mobile nav, sticky CTA bar) is locked and wraps every route via the root layout — Plan 03 (Home page) and subsequent page-content plans build inside `{children}` with zero shell wiring of their own
- `<BookCta />` is the established single-source CTA component for all future pages (hero, services page callouts, etc.)
- `/services`, `/about`, and `/book` routes are linked from nav/footer but do not exist yet — they will 404 until built in later plans in this phase; this is expected and does not block Plan 02's own acceptance criteria (only the shell was in scope)
- No blockers — `npx next build` exits 0, all Task 1/Task 2 acceptance criteria verified directly against file contents

## Self-Check: PASSED

All claimed files verified present (src/components/book-cta.tsx, src/components/site-header.tsx, src/components/mobile-nav.tsx, src/components/site-footer.tsx, src/components/sticky-cta-bar.tsx, src/app/sitemap.ts, src/app/robots.ts, src/app/layout.tsx modified, this SUMMARY.md). Both claimed commit hashes (735d052, 1bd1d22) verified present in git log.

---
*Phase: 01-marketing-foundation*
*Completed: 2026-07-19*
