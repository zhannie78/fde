# Stack Research

**Domain:** Solo-consultancy marketing/lead-gen website with live Claude-powered demos and an AI-drafted, human-reviewed audit funnel
**Researched:** 2026-07-19
**Confidence:** HIGH (framework/hosting/API patterns verified against official docs); MEDIUM (exact free-tier numbers, which shift — treat as directional, re-verify before implementation)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js (App Router) | 16.x (16.2 current) | Framework — pages, API/Route Handlers, Server Actions | This is the dominant 2025/2026 pattern for "marketing site + interactive product demo," specifically because the demos need server-side logic (calling Claude without exposing the key) on the same routes as the marketing content. Route Handlers give you `/api/demo/*` endpoints for free; Server Actions give you type-safe form submission for the audit questionnaire without a separate backend. One deploy target, one repo, one mental model — critical for a solo maintainer. Also the framework Claude Code has the deepest, most current training/tooling support for, which matters since a solo founder will lean on AI-assisted coding to build and maintain this. |
| React | 19.x | UI library (via Next.js) | Ships with Next.js 16; Server Components reduce client JS for the mostly-static marketing pages while the two demo widgets and questionnaire become explicit Client Components. |
| TypeScript | 5.x | Type safety | Non-negotiable for a solo dev shipping AI-integration code (Claude request/response shapes, Zod-validated form data, DB rows) without a team to catch mistakes. |
| Tailwind CSS | 4.x | Styling | Standard for solo-built marketing sites in 2025/2026 — CSS-first config in v4 removes the old `tailwind.config.js` ceremony; pairs with shadcn/ui for fast, ownable UI. |
| @anthropic-ai/sdk | 0.112.x | Official Claude API client | HIGH confidence, official SDK. Use server-side only (Route Handlers / Server Actions) — never in client bundles. Supports streaming, structured tool-use output, and the Batch API if audit-report drafting volume ever grows. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 4.x | Schema validation | Validate the audit questionnaire form data AND validate/force the shape of Claude's JSON output (see Claude integration pattern below). One schema, two jobs. |
| react-hook-form | 7.82.x | Form state management | Multi-question audit questionnaire needs client-side validation feedback before hitting the server; pairs natively with zod via `@hookform/resolvers`. |
| resend | 6.17.x | Transactional email delivery | Sends: (1) internal notification to founder when a new audit draft is ready for review, (2) final reviewed report to the prospect, (3) any demo-related follow-up. Modern DX, generous low-volume free tier, official React Email integration. |
| react-email | latest | Email templates as React components | Write the audit-report email and internal-notification email as components instead of raw HTML strings — much easier to maintain solo. |
| @upstash/ratelimit + @upstash/redis | 2.0.x / 1.38.x | Per-IP/session rate limiting on public demo routes | Anthropic's API rate limits are account-wide, not per-visitor — they do NOT stop one visitor from hammering your demo and running up your bill. This is the standard serverless-friendly (HTTP-based, no persistent connection) way to cap "N demo runs per IP per hour." Required, not optional, given the public/unauthenticated demo surface. |
| @marsidev/react-turnstile (or Cloudflare's own snippet) | latest | Bot protection on questionnaire + demo forms | Cloudflare Turnstile is free, does NOT require moving your DNS to Cloudflare, and stops the cheap-bot class of abuse before it ever reaches your rate limiter or Claude API. Verify the token server-side in the Route Handler — the widget alone is not protection. |
| @supabase/supabase-js | 2.110.x | Database client for audit submissions | See Persistence section below. |
| ai (Vercel AI SDK) | latest | Optional: streaming helper for the intake-triage chat-style demo | Only pull this in if the triage demo is conversational/streamed token-by-token; adds a dependency, so skip it for the simpler missed-call-recovery demo which can return a single structured response. |
| @t3-oss/env-nextjs | latest | Build-time env var validation | Solo dev safety net — fails the build if `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, etc. are missing, instead of failing silently in production. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| shadcn/ui | Component primitives | Copy-paste, not an npm dependency — you own the code, no version-lock risk for a project with no team to manage upgrades. Use for form inputs, cards, the admin review screen. |
| ESLint + Prettier | Linting/formatting | Use Next.js's built-in `eslint-config-next`. |
| Vitest | Unit tests (optional, targeted) | Not a TDD-heavy project, but worth a handful of tests around the Zod schemas that shape Claude's structured output and the rate-limiter logic — these are the two places a silent bug costs real money. |

## Installation

```bash
# Core
npx create-next-app@latest deployed-ai --typescript --tailwind --app
npm install @anthropic-ai/sdk zod react-hook-form @hookform/resolvers

# Email
npm install resend react-email

# Rate limiting + bot protection
npm install @upstash/ratelimit @upstash/redis
npm install @marsidev/react-turnstile

# Persistence
npm install @supabase/supabase-js

# Env safety
npm install @t3-oss/env-nextjs

# Dev dependencies
npm install -D vitest @vitejs/plugin-react
```

## Hosting: Netlify (Free plan) — NOT Vercel Hobby

This is the single most important deviation from "the obvious default" and needs to be explicit for the roadmap.

**Vercel Hobby is disqualified.** Per Vercel's own Fair Use Guidelines (verified 2026-06-16 doc): *"Hobby teams are restricted to non-commercial personal use only... Commercial usage is defined as any Deployment that is used for the purpose of financial gain of anyone involved in any part of the production of the project... Examples include: Advertising the sale of a product or service."* AI Deployed's entire site is a lead-gen funnel for paid consulting engagements — this is squarely commercial use. Using Hobby would be a ToS violation, not just a faux pas. The alternative is Vercel Pro at $20/month minimum, which conflicts with the "free-tier-first" constraint.

**Recommendation: Netlify Free plan.** Netlify's terms explicitly permit commercial use on the free tier ("you can host a paid SaaS or a business site on Free as long as you stay within the monthly credit allowance"). It includes Netlify Functions (serverless, for the Claude proxy routes), full Next.js App Router support including Server Actions via the official Next.js Runtime v5 adapter, and a managed Postgres offering if you want to keep the DB and host in one vendor. At this traffic scale (marketing site + occasional demo/audit usage) the free credit allowance is not a realistic constraint.

**Alternative: Cloudflare Pages/Workers (Free).** Also explicitly allows commercial use, unlimited static bandwidth, and pairs naturally with Turnstile (same vendor) and Cloudflare KV/D1 if you want to consolidate rate-limiting storage and DB with your host. Slightly more setup friction for Next.js App Router edge cases than Netlify's adapter; choose this if you'd rather consolidate more services under one Cloudflare account (Turnstile + Pages + KV) than spread across Netlify + Upstash + Supabase.

**Do not use Vercel unless** the founder is willing to pay the $20/mo Pro minimum — in which case Vercel remains the smoothest Next.js deployment experience and this whole section becomes moot.

## Claude API Integration Pattern

**Never call Claude from the client.** All three AI touchpoints (missed-call demo, intake-triage demo, audit report drafting) go through server-side Route Handlers or Server Actions that hold `ANTHROPIC_API_KEY` as a server-only env var. This is non-negotiable — it's the standard pattern for any public-facing Claude integration and the only way to keep the key from leaking into a browser bundle.

**Model selection by use case (cost-driven, HIGH confidence on pricing as of intro-pricing window through Aug 31 2026):**
- **Public demos (missed-call recovery, intake triage): Claude Haiku 4.5** ($1/$5 per million input/output tokens). These run on unauthenticated public traffic with unpredictable volume — cheap and fast is the right tradeoff, and demo output quality doesn't need frontier reasoning.
- **Audit report drafting: Claude Sonnet (4.5/4.6 family)** ($3/$15 per million tokens, or $2/$10 intro pricing through Aug 2026). This is the actual deliverable a prospect will judge the consultancy by — worth the higher cost, and volume is naturally lower (one questionnaire submission → one draft, not open-ended demo replay) and human-reviewed before sending, so quality matters more than the marginal cost difference.

**Structured output for the audit report:** Use forced tool-use (a single defined tool/JSON schema passed to the Messages API) to get the audit findings back as structured JSON (pain points, ROI estimates, recommended next steps) rather than parsing freeform prose. Validate the response against the same Zod schema used for the questionnaire input — this makes the founder's review screen a form-over-structured-data editor instead of an editable text blob, and catches malformed Claude output before it's ever shown to the founder or a prospect.

**Rate limiting (defense in depth, three layers):**
1. **Upstash-backed sliding-window limiter** on every demo/questionnaire Route Handler, keyed by IP (or a lightweight cookie-based fingerprint) — e.g., cap each visitor to N demo runs per hour. This is the layer that actually protects your wallet from a single abusive visitor or scraper, since Anthropic's own rate limits are account-wide and won't stop that.
2. **Turnstile verification** in front of both the demo trigger and the questionnaire submit, checked server-side before the Claude call fires — filters out the cheap-bot traffic class before it costs you a token.
3. **Spend limit configured in the Claude Console** (Settings → Plans & Billing / Limits) as a hard backstop — caps total monthly spend regardless of what gets past the other two layers. Treat this as the "worst case" tripwire, not the primary control.

**Streaming:** Optional. If the intake-triage demo is framed as a live chat-style interaction, stream the response (Vercel AI SDK's `streamText`/`useChat`, or a raw `ReadableStream` from the Route Handler) for a more convincing live-demo feel. The missed-call-recovery demo and the audit-report draft are both better as single structured responses — no streaming needed there.

## Lightweight Persistence for Audit Submissions

**Recommendation: Supabase (Free plan), Postgres.** One table for questionnaire submissions with status tracking (`submitted` → `draft_generated` → `reviewed` → `sent`), storing the raw answers, Claude's structured draft (JSONB), the founder's edited final version, and timestamps. Free tier (500MB DB, 500K edge-function invocations, 50K MAU) is far more than a solo consultancy's audit volume will touch. `@supabase/supabase-js` gives simple typed queries without an ORM, which is enough for one table doing CRUD.

**Known gotcha (verify at implementation time):** Supabase free projects auto-pause after 7 consecutive days with zero API requests. For a live marketing site this is unlikely to trigger once real traffic exists, but during pre-launch/staging it can catch a solo founder off guard. Mitigate with a scheduled GitHub Actions cron hitting a lightweight health-check endpoint weekly, or just don't worry about it post-launch.

**Review workflow (no auth system needed):** Because there is exactly one reviewer (the founder), skip building real authentication. Protect `/admin/*` routes with a single shared-secret check in Next.js middleware (a long random password stored as an env var, set as an HTTP-only cookie after a simple login form) — this avoids pulling in an auth provider (Clerk/Auth.js/Supabase Auth) for a one-user use case. When a questionnaire is submitted: store row → call Claude to draft → store draft → Resend sends the founder an internal email with a link to `/admin/reports/[id]` → founder edits the structured draft in a form UI → clicking "Send" triggers a Resend email to the prospect and flips status to `sent`.

**Lower-effort alternative: Airtable.** If building even a minimal custom admin review UI feels like too much surface area for a solo founder pre-launch, store submissions directly in an Airtable base and let the founder review/edit the AI draft in Airtable's own interface (no custom admin page needed at all). Trade-off: less control over the review UX, and you're gluing a third-party no-code tool into the funnel instead of owning the data model. Reasonable MVP-of-MVP choice if the custom admin panel is cut for time; migrate to Supabase + custom admin later if the audit funnel proves out and the review flow needs more structure.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| Next.js (App Router) | Astro + React islands | If the site ends up being 90% static content with only light-touch interactivity (e.g., if the two demos get simplified to non-Claude static mockups). Astro ships far less JS by default and has native type-safe server Actions for forms. For this project's spec — two live Claude-backed demos plus an AI-drafted, editable report — Next.js's unified Server Components/Route Handlers/Server Actions model is the better fit; don't switch unless the interactive surface shrinks significantly. |
| Netlify (Free) | Vercel (Pro, $20/mo) | If the founder decides the $20/mo is worth it for Vercel's marginally smoother DX and is fine paying instead of using free tier. Do not use Vercel Hobby for this project — it violates their commercial-use terms. |
| Netlify (Free) | Cloudflare Pages/Workers (Free) | If consolidating Turnstile + hosting + KV/D1 under one Cloudflare account is preferred over spreading services across Netlify + Upstash + Supabase. |
| Supabase (Postgres) | Airtable | If a fully custom admin review UI is more engineering than the founder wants to maintain solo — see Persistence section above. |
| Supabase (Postgres) | Neon (serverless Postgres) | If you want branchable databases for preview deploys (each PR gets its own DB branch) — overkill for a solo dev with no team, but a fine alternative if that workflow appeals. |
| Upstash Redis rate limiting | In-memory rate limiting | Never, for this project — serverless functions are stateless/ephemeral between invocations, so an in-memory counter resets constantly and provides no real protection. Only viable on a long-running server process, which this stack doesn't have. |
| Resend | SendGrid / Postmark | If email volume grows well beyond marketing-site scale (thousands/day) — Resend's free/low tiers are the better fit at this project's expected volume and its DX (React Email) is a better match for a solo dev. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| Vercel Hobby plan | Explicitly disallows commercial use per Vercel's Fair Use Guidelines — this is a lead-gen site for a paid consultancy, which is commercial by their own definition | Netlify Free (commercial use explicitly allowed) or Vercel Pro if budget allows |
| Calling `@anthropic-ai/sdk` directly from a Client Component | Leaks `ANTHROPIC_API_KEY` into the browser bundle — trivially stealable, leads to a drained/abused API budget | Server-side Route Handler or Server Action that proxies the call |
| Relying only on Anthropic's account-level rate limits to protect a public demo | Those limits are org/workspace-wide, not per-visitor — a single abusive visitor or bot can consume your entire budget before any Anthropic-side limit engages | Upstash-backed per-IP rate limiting in front of every demo route, plus Turnstile, plus a Console spend limit |
| A full auth provider (Clerk, Auth.js, Supabase Auth) for the admin review screen | Massive overkill for exactly one user (the founder) reviewing drafts — adds a dependency, a login flow, and maintenance surface for zero real benefit at this scale | A single shared-secret cookie check in middleware |
| Parsing Claude's freeform text response for the audit report | Freeform prose is brittle to build a structured, editable review UI on top of, and silent formatting drift breaks the admin screen without warning | Forced tool-use / structured JSON output validated against a Zod schema |
| An ORM (Prisma, Drizzle) for one Supabase table | Unnecessary abstraction layer for a single-table CRUD use case, adds a migration/build-step dependency a solo founder has to maintain | `@supabase/supabase-js` typed client directly |

## Stack Patterns by Variant

**If the founder wants zero custom backend/admin code before launch:**
- Use Airtable instead of Supabase for persistence + review
- Skip the custom `/admin` middleware-protected UI entirely
- Because it trades review-UX polish for dramatically less code to build and maintain solo pre-launch

**If demo cost exposure becomes a real concern after launch (e.g., a demo goes viral or gets hammered by bots):**
- Tighten the Upstash rate-limiter window (e.g., 3 runs/IP/day instead of /hour)
- Drop the public demos to Haiku's cheapest configuration and cap `max_tokens` tightly
- Consider requiring an email address (captured via the form, validated, and rate-limited per-email too) before a demo runs, turning "anonymous public demo" into a soft lead-capture gate
- Because the three-layer defense in the base recommendation is a reasonable default, not a guarantee — real-world abuse patterns should tighten it, not the reverse

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| next@16.x | react@19.x, react-dom@19.x | Next.js 16 requires React 19; `create-next-app@latest` wires this up automatically. |
| next@16.x (App Router) | Netlify Next.js Runtime v5 | v5 is the current Netlify adapter with full App Router + Server Actions support (confirmed via Netlify docs, early 2026) — do not use the legacy v4 runtime for a new project. |
| tailwindcss@4.x | Next.js 16 | v4's CSS-first config (`@import "tailwindcss"` in globals.css, no `tailwind.config.js` needed by default) is what `create-next-app --tailwind` scaffolds now; don't follow v3-era tutorials that reference `tailwind.config.js` as required. |
| @upstash/ratelimit@2.x | @upstash/redis@1.x | Ratelimit v2 is built against the HTTP-based `@upstash/redis` client, not `ioredis` — required for compatibility with stateless serverless/edge runtimes (Netlify Functions, Cloudflare Workers). |
| zod@4.x | react-hook-form@7.x via @hookform/resolvers | Confirm the resolvers package version supports Zod 4's schema API before upgrading past what `npm install` resolves by default — Zod 4 changed some internal type-inference behavior from v3. |

## Sources

- Vercel Docs — `/docs/plans/hobby` and `/docs/limits/fair-use-guidelines` (fetched 2026-07-19, doc `last_updated: 2026-06-16`) — HIGH confidence, official source, direct quote on commercial-use restriction
- Netlify Support Forums + netlify.com/pricing — commercial use permitted on Free plan — MEDIUM confidence (community + vendor marketing page, not a formal ToS fetch, but consistent across multiple sources)
- Netlify Docs / netlify.com blog — Next.js Runtime v5 App Router + Server Actions support — MEDIUM confidence (WebSearch-aggregated, not a direct doc fetch)
- Cloudflare Developer Docs — Pages/Workers free tier limits, commercial use, Turnstile independence from DNS proxy — MEDIUM confidence (WebSearch + community threads)
- Claude Platform Docs — `/docs/en/manage-claude/rate-limits-api` (fetched 2026-07-19) — HIGH confidence, official, confirms rate limits are org/workspace-scoped (not per-visitor) and that spend limits are configured via Console Limits tab
- Claude/Anthropic pricing pages (aggregated via WebSearch, cross-referenced across cloudzero.com, finout.io, benchlm.ai) — MEDIUM confidence on exact figures ($1/$5 Haiku 4.5, $3/$15 Sonnet with $2/$10 intro pricing through Aug 2026) — re-verify at platform.claude.com/docs/en/about-claude/pricing before committing budget
- Context7 — `/vercel/next.js` and `/anthropics/anthropic-sdk-typescript` resolved — confirms both are actively maintained, high-reputation libraries; used for version/ecosystem signal, not deep API detail in this pass
- npm registry (`npm view <pkg> version`, fetched 2026-07-19) — HIGH confidence, ground-truth current published versions for all listed packages
- Astro Docs — `docs.astro.build/en/guides/actions/` (aggregated via WebSearch) — MEDIUM confidence, used only to characterize the Astro alternative, not the primary recommendation
- Supabase Docs / billing FAQ (aggregated via WebSearch) — MEDIUM confidence on free-tier numbers and the 7-day auto-pause behavior — re-verify exact limits at supabase.com/pricing before implementation, these figures shift

---
*Stack research for: Solo AI-consultancy marketing site with Claude-powered demos and AI-drafted audit funnel*
*Researched: 2026-07-19*
