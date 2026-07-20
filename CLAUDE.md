<!-- GSD:project-start source:PROJECT.md -->
## Project

**AI Deployed**

A marketing and lead-generation website for **AI Deployed** — a solo AI-transformation consultancy run by a former forward-deployed engineer (FDE). The business offers free workflow audits to small/medium businesses, then builds custom white-glove AI solutions (powered by Claude) for the pain points the audit uncovers. The site is both the storefront and the first proof of capability: interactive demos and an AI-drafted audit report let prospects experience the product before ever talking to a human.

**Core Value:** A skeptical, non-technical SMB owner lands on the site, tries a demo or completes the free workflow audit, and comes away convinced this person can recover real money and time for their business — convinced enough to book an engagement.

### Constraints

- **Budget**: Lean/free-tier first — minimize recurring costs; free-tier hosting, pay-as-you-go Claude API only when demos are actually used — solo bootstrapped business
- **Team**: Solo founder — everything (site, demos, audits, delivery) must be maintainable by one person
- **Tech**: AI features built on Claude — the founder's chosen platform and part of the pitch
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
# Core
# Email
# Rate limiting + bot protection
# Persistence
# Env safety
# Dev dependencies
## Hosting: Netlify (Free plan) — NOT Vercel Hobby
## Claude API Integration Pattern
- **Public demos (missed-call recovery, intake triage): Claude Haiku 4.5** ($1/$5 per million input/output tokens). These run on unauthenticated public traffic with unpredictable volume — cheap and fast is the right tradeoff, and demo output quality doesn't need frontier reasoning.
- **Audit report drafting: Claude Sonnet (4.5/4.6 family)** ($3/$15 per million tokens, or $2/$10 intro pricing through Aug 2026). This is the actual deliverable a prospect will judge the consultancy by — worth the higher cost, and volume is naturally lower (one questionnaire submission → one draft, not open-ended demo replay) and human-reviewed before sending, so quality matters more than the marginal cost difference.
## Lightweight Persistence for Audit Submissions
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
- Use Airtable instead of Supabase for persistence + review
- Skip the custom `/admin` middleware-protected UI entirely
- Because it trades review-UX polish for dramatically less code to build and maintain solo pre-launch
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

- **Sketch findings for fde** (design decisions, CSS patterns, visual direction from the Phase 6 visual redesign sketches) → `Skill("sketch-findings-fde")`
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
