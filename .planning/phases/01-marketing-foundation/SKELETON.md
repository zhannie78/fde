# Walking Skeleton — AI Deployed

**Phase:** 1
**Generated:** 2026-07-19

## Capability Proven End-to-End

> The smallest user-visible capability that exercises the full stack.

A visitor can load the deployed marketing site over HTTPS, navigate from the home page's persistent "Book Your Free Audit Call" CTA to `/book`, and interact with a real Cal.com scheduling embed (or see the founder-email fallback error state if the embed fails to load). No database exists in this phase — the "real interaction" that proves the stack is the third-party Cal.com embed wired through the shared layout shell and the typed `siteConfig` module, served static from Netlify's edge over an automatic Let's Encrypt certificate.

**Local full-stack proof (available after Wave 3, before Netlify deploy):** `npm run dev` → open `/` → click any "Book Your Free Audit Call" CTA → land on `/book` → Cal embed renders. This is the documented local full-stack run command; Netlify deployment (Plan 06) completes the SITE-05 HTTPS/domain criteria.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16.2.x App Router + React 19.2.x + TypeScript 5.x | Locked by CLAUDE.md. App Router gives static/SSG marketing pages now and `/api/*` Route Handlers + Server Actions for Phase 2/3 without a second backend. |
| Styling / design system | Tailwind CSS 4.3.x (CSS-first `@theme`, no `tailwind.config.js`) + shadcn (Radix primitives) | Locked by CLAUDE.md + UI-SPEC. shadcn init uses the **corrected** command `npx shadcn@latest init -b radix` (NOT the UI-SPEC's stale `-b neutral -s new-york`); style label resolves to `radix-*`, `baseColor: "neutral"`. |
| Data layer | None in Phase 1 | Cal.com embed uses only a public scheduling link, no secret, no DB. Persistence (Supabase) arrives in Phase 3. Do NOT add `app/api/` or any env-secret in Phase 1 — that is scope creep from Phase 2. |
| Third-party integration | Cal.com via `@calcom/embed-react@1.5.3` only | The only real npm package; `@calcom/react-widget` does NOT exist (404) and must never appear in any task. |
| Fonts | Fraunces (variable, headings) + IBM Plex Sans (body, `weight: ["400","600"]` required) via `next/font/google` | Self-hosted, no CDN/FOUT. IBM Plex Sans is NOT variable on Google Fonts — omitting the weight array is a build-time error. Strip the CLI's Geist default (SITE-06 anti-pattern). |
| Deployment target | Netlify Free (NOT Vercel Hobby — commercial-use violation) via Next.js Runtime v5 (OpenNext), zero-config | Locked by CLAUDE.md. Pin `NODE_VERSION` in `netlify.toml`; do NOT set `output: 'export'` (breaks Phase 2/3 Route Handlers). |
| Directory layout | `src/app/*` routes, `src/components/{ui,sections}`, `src/config/site.ts`, `src/lib/utils.ts` | Per RESEARCH recommended structure. `src/config/site.ts` (D-06) is the single source of truth for all founder-identity values. |

## Stack Touched in Phase 1

- [x] Project scaffold — `create-next-app` + shadcn init + lint (`eslint-config-next`) + build (`next build` / Turbopack)
- [x] Routing — four real routes: `/`, `/about`, `/services`, `/book`
- [ ] Database — **N/A this phase** (no DB until Phase 3; the Cal.com embed is the "real interaction" that proves the stack instead)
- [x] UI — real interactive element wired to a third party: the Cal.com embed on `/book`, plus mobile nav sheet and sticky CTA bar
- [x] Deployment — Netlify over HTTPS (Plan 06) OR local `npm run dev` full-stack run (available after Wave 3)

## Out of Scope (Deferred to Later Slices)

> Explicit — prevents future phases from re-litigating Phase 1's minimalism.

- Live AI missed-call demo (Phase 2) — Phase 1 ships only the demo-placeholder empty-state card in the hero slot; the live widget swaps into that exact slot later.
- Any Claude API call, `app/api/*` Route Handler, or `ANTHROPIC_API_KEY`-shaped env var (Phase 2).
- Workflow-audit questionnaire, admin review screen, Supabase persistence, Resend email (Phase 3).
- Vertical-specific landing pages and compliance copy (Phase 4).
- Paid founder email (Google Workspace) — Phase 1 uses free forwarding only (D-05).
- Popup/modal booking flows — Phase 1 uses the single inline `/book` embed only (D-02).

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- **Phase 2:** Visitor tries a live, ungated AI missed-call recovery demo embedded in the homepage hero slot (adds the first `app/api/demo/*` Route Handler + Claude proxy + rate limiting).
- **Phase 3:** Prospect completes a self-serve audit and receives a founder-reviewed AI-drafted report (adds Supabase, admin gate, Resend).
- **Phase 4:** Visitors from each of four verticals see a dedicated compliance-aware landing page (reuses the layout shell + design system built here).
