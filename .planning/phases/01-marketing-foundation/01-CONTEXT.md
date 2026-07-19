# Phase 1: Marketing Foundation - Context

**Gathered:** 2026-07-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Stand up the marketing site itself: Next.js scaffold with the locked design system, Home page (hero + demo-placeholder slot), About page (founder FDE story), Services page (audit → project → retainer model), persistent booking CTA on every page, deployed to Netlify over HTTPS, mobile-responsive and fast. No live AI demo (Phase 2), no audit funnel (Phase 3), no vertical landing pages (Phase 4).

Requirements: SITE-02, SITE-03, SITE-04, SITE-05, SITE-06.

</domain>

<decisions>
## Implementation Decisions

> **Note:** The user opted to skip the interactive discussion and proceed. All decisions below are Claude-recommended defaults consistent with PROJECT.md, REQUIREMENTS.md, and the approved UI-SPEC — the user may edit this file before planning. Items marked **NEEDS-FOUNDER** require input/assets from Annie and must surface as explicit tasks or launch-blockers in the plan, not silently shipped as placeholders.

### Booking scheduler & flow
- **D-01:** Use **Cal.com** (free tier) over Calendly — more generous free tier (unlimited event types, embeds allowed), open-source, no "Powered by Calendly" lock-in pressure; fits the lean/free-tier-first constraint. A single event type: "Free Audit Call" (30 min).
- **D-02:** Every "Book Your Free Audit Call" CTA (header, hero, footer, sticky mobile bar) links to a dedicated **`/book` page with an inline Cal.com embed** — one place to load the widget, one place for the UI-SPEC's failed-to-load error state, works identically on mobile, and gives a linkable URL for emails/social. No popup modals in Phase 1.
- **D-03:** The `/book` page must render the UI-SPEC error state if the embed fails, with the founder-email fallback.

### Domain & founder identity
- **D-04:** Purchase the production domain **during Phase 1** — SITE-05's "matching email domain" success criterion cannot pass on a Netlify subdomain. Domain name choice is **NEEDS-FOUNDER** (working name "AI Deployed"; domain marked Pending in PROJECT.md Key Decisions). Build and preview on the free Netlify subdomain until it's connected.
- **D-05:** Founder email on the matching domain via a **free email-forwarding route** (registrar forwarding or Cloudflare Email Routing → existing inbox) — no paid Google Workspace yet; lean-budget constraint. Sending-from-domain can wait until Phase 3 (Resend handles transactional).
- **D-06:** All identity values (site name, domain, founder email, region, Cal.com link) live in **one typed site-config module** (e.g., `src/config/site.ts`) — single edit point when the domain lands; no string literals scattered through pages.
- **D-07:** Real founder photo is **NEEDS-FOUNDER** and a launch blocker per UI-SPEC (no stock/AI headshot, non-negotiable). Use an obviously-temporary local placeholder during development, tracked as an unchecked launch-checklist item.

### Site structure & homepage sections
- **D-08:** Four routes: `/` (Home), `/about`, `/services`, `/book`. Nav order: **Services, About** + primary CTA button (per UI-SPEC header spec). Footer carries page links, contact email, region, and CTA repeat.
- **D-09:** Homepage below the hero + demo-placeholder (which stay the focal point per UI-SPEC), in order:
  1. **Outcomes section** — the three ROI outcomes (time saved, profit recovered, expenses cut) rendered asymmetrically, NOT a uniform 3-card grid (UI-SPEC anti-pattern gate).
  2. **How the engagement works** — compressed audit → project → retainer sequence on a dark ink-navy band, linking to `/services`.
  3. **Who this is for** — the four verticals as plain, concrete pain-point copy (text treatment, no icon grid); teaser only, no links to vertical pages until Phase 4.
  4. **Founder credibility strip** — photo + one-line FDE story, linking to `/about`.
  5. **Final CTA band.**
- **D-10:** No separate contact page — footer email + `/book` cover contact.

### Copy sourcing & voice
- **D-11:** **Claude drafts all copy; Annie reviews/edits before launch.** Copy review is an explicit launch-checklist item — no page ships with unreviewed copy.
- **D-12:** Voice: ROI-first, plain language, zero AI jargon on the homepage headline; dollars-and-hours framing (per PROJECT.md messaging decision). Company-first brand with the founder story as the credibility layer — About page is "AI Deployed, and here's the person who deploys it," not a personal blog.
- **D-13:** Biographical specifics for the FDE story (name as publicly presented, region, real work-history beats) are **NEEDS-FOUNDER** — Claude drafts structure and tone with clearly-bracketed factual placeholders; no invented biography facts, ever.

### Claude's Discretion
- Exact section copy, headline variants, and micro-interaction implementation details (within UI-SPEC's stated limits).
- Next.js project layout, component file organization, metadata/SEO basics (titles, descriptions, OG tags), sitemap/robots.
- Netlify configuration details (build settings, redirects, headers).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design contract (locked)
- `.planning/phases/01-marketing-foundation/01-UI-SPEC.md` — Approved UI design contract: fonts (Fraunces + IBM Plex Sans), 60/30/10 color system, spacing/typography scales, component inventory, copywriting contract (CTA text, empty/error states), and the SITE-06 anti-pattern gates. MUST be followed exactly; do not re-theme or re-decide.

### Product & requirements
- `.planning/PROJECT.md` — Core value, constraints (lean budget, solo founder, Claude-based), key brand/messaging decisions.
- `.planning/REQUIREMENTS.md` — SITE-02 … SITE-06 definitions and out-of-scope table (no fake testimonials, no email-gating, etc.).
- `.planning/ROADMAP.md` — Phase 1 goal and success criteria.

### Stack
- `CLAUDE.md` — Locked technology stack (Next.js 16 App Router, React 19, TypeScript, Tailwind 4, shadcn/ui, Netlify Free — NOT Vercel Hobby), version compatibility notes, and what-not-to-use table.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield repo. Only `CLAUDE.md` exists; no code, no git repository initialized yet. Phase 1 includes scaffolding (`create-next-app`, `git init`, shadcn init per UI-SPEC preset `npx shadcn@latest init -b neutral -s new-york`).

### Established Patterns
- None yet — Phase 1 establishes them. Patterns set here (site-config module, section components, token-driven theming in `globals.css`) become the base for Phases 2–4.

### Integration Points
- Homepage hero must reserve the **demo placeholder slot** exactly as specified in the UI-SPEC empty state — Phase 2 swaps the live demo into that slot.
- Layout shell (header/footer/CTA) will wrap Phase 3's audit funnel pages and Phase 4's vertical landing pages — build it as a shared root layout.

</code_context>

<specifics>
## Specific Ideas

- The UI-SPEC's copywriting contract is verbatim-binding: primary CTA is "Book Your Free Audit Call" everywhere; the demo-placeholder empty state uses the exact heading/body specified.
- The founder-email fallback string in the error state contains a literal `[founder email]` placeholder that MUST be resolved via the site-config module before launch (UI-SPEC executor note).

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope. (Verticals mention on the homepage is teaser copy only; dedicated pages remain Phase 4.)

</deferred>

---

*Phase: 1-marketing-foundation*
*Context gathered: 2026-07-19*
