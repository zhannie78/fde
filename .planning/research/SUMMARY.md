# Project Research Summary

**Project:** AI Deployed
**Domain:** Solo AI-transformation consultancy — marketing/lead-gen website with public Claude-powered interactive demos and a self-serve, AI-drafted/human-reviewed workflow-audit funnel
**Researched:** 2026-07-19
**Confidence:** MEDIUM-HIGH

## Executive Summary

AI Deployed is a well-trodden 2026 architecture pattern wearing a novel go-to-market wedge. The technical shape — a Next.js marketing site with serverless Route Handlers proxying Claude API calls, a lightweight Postgres store for one stateful workflow, and a transactional email provider — is standard, low-risk, and fully buildable on free-tier infrastructure by a solo founder. What's differentiated is the product bet: ungated, try-it-yourself interactive demos plus a self-serve questionnaire that produces an AI-drafted, founder-reviewed audit report. Research confirms no surveyed competitor (Ciela AI, Arkeo AI, Execution Point, Layer3 Labs, Fleece AI, MannVenture) combines a live experiential demo with a personalized self-serve AI report — this pairing is the real wedge, not any single technology choice.

The recommended approach: Next.js 16 (App Router) + TypeScript + Tailwind, deployed to **Netlify Free** rather than Vercel (Vercel Hobby's terms explicitly prohibit the commercial use this site constitutes), with Claude Haiku 4.5 powering the cheap/high-volume public demos and Claude Sonnet powering the higher-stakes audit report draft. Every Claude call is server-side only, sits behind Upstash-backed per-IP rate limiting plus a Console-level spend cap, and the audit report always passes through a human review gate before it reaches a prospect — never fully automated. Persistence is a single Supabase/Postgres table tracking submission → draft → reviewed → sent, with a shared-secret-gated `/admin` page in place of a full auth system, since there is exactly one reviewer.

The key risks are not technical scaling risks (traffic will be low) but cost-abuse and trust risks: an unmetered public demo can generate a four/five-figure bill overnight if the proxy/rate-limit/spend-cap chain isn't built before launch; a hallucinated "fact" in an AI-drafted audit report can destroy the exact trust the funnel is built to create; and — because the founder is a strong engineer — the single biggest non-technical risk is over-building site infrastructure before a real visitor has validated that ROI-first copy plus demo plus audit actually converts skeptical SMB owners. The roadmap should sequence infrastructure guardrails (Claude proxy + rate limiting) before any public-facing AI feature, treat the human-review gate as structurally non-optional, and resist scope creep beyond the core funnel until real usage data exists.

## Key Findings

### Recommended Stack

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 is the dominant, best-supported pattern for a marketing site that also needs server-side AI logic on the same routes/deploy target — critical for a solo maintainer who wants one repo, one mental model. The official `@anthropic-ai/sdk` is used exclusively server-side. Hosting is **Netlify Free**, not Vercel Hobby, because Vercel's Fair Use Guidelines explicitly disallow commercial use on the Hobby tier and this site is a lead-gen funnel for paid consulting — a real ToS risk, not a style preference. Supporting libraries (zod, react-hook-form, resend/react-email, @upstash/ratelimit + @upstash/redis, Turnstile, @supabase/supabase-js, @t3-oss/env-nextjs) round out form validation, email, rate limiting/bot protection, and persistence — all chosen specifically for free-tier viability and low solo-maintenance overhead (e.g., shadcn/ui copy-paste components over a versioned dependency, no ORM for a single-table use case, no auth provider for a single-reviewer admin page).

**Core technologies:**
- Next.js 16 (App Router): framework — unifies marketing pages, demo API routes, and audit Server Actions in one deploy target
- @anthropic-ai/sdk (server-only): official Claude client — Haiku 4.5 for public demos (cheap/fast), Sonnet 4.5/4.6 for audit report drafting (quality matters more, lower volume)
- Netlify (Free): hosting — the only free tier among major platforms that explicitly permits this site's commercial use
- Upstash Redis + @upstash/ratelimit: per-IP rate limiting — the only real defense against unmetered public-demo cost blowout on stateless serverless functions
- Supabase (Postgres, Free): single-table persistence for audit submissions with a `pending → drafted → reviewed → sent` status lifecycle

### Expected Features

The feature landscape confirms PROJECT.md's scope is already well-aligned with what converts for this buyer (skeptical, non-technical SMB owner) and what differentiates from competitors. Table stakes are mostly low-complexity content/UX hygiene; the real differentiators are the ungated demos and the self-serve AI-drafted report, both already scoped as launch requirements.

**Must have (table stakes):**
- ROI-first homepage headline and copy (outcome, not technology) on every page
- 5-page core structure (Home, About, Services, Proof, Contact) with real founder identity/contact info
- Persistent, low-friction booking CTA (Calendly/Cal.com-style embed) on every page
- Explicit "here's what happens next" framing for both the audit funnel and the engagement model
- Vertical-relevant language at minimum in headline/pain-point/audit-question copy, even before dedicated per-vertical pages exist

**Should have (differentiators — already in PROJECT.md scope):**
- Ungated, try-it-yourself interactive demos (missed-call recovery, intake triage) — no email gate before value is shown
- Self-serve workflow-audit questionnaire → Claude-drafted, founder-reviewed report — the core wedge, unmatched by surveyed competitors
- Vertical-specific ROI calculator (defer to v1.x — needs validated per-vertical benchmark inputs)
- Transparent (not fixed-price) engagement-model page: project → retainer, explained plainly

**Defer (v1.x / v2+):**
- Intake triage demo (second flagship demo) — build after missed-call demo's engagement data justifies it
- Full 4-vertical dedicated landing pages — start with 1-2 verticals showing early traction
- Real testimonials/case studies — blocked on the first completed engagement
- Client portal, payment processing, voice-bot demo — explicitly out of scope per PROJECT.md and confirmed low-value/high-risk by research

### Architecture Approach

The system is fully composable from managed, free-tier-friendly primitives with no queue system or dedicated ops layer required. Marketing pages are static/SSR with zero runtime dependencies; every Claude-calling route is a server-side Route Handler behind a shared rate-limiter factory; the audit funnel is the only stateful flow, backed by Postgres because a human review step means the "drafted" state must survive an indeterminate delay; and a single shared-secret-gated `/admin` page (not a full auth system) is sufficient since there is exactly one reviewer.

**Major components:**
1. **Marketing pages** (`app/(marketing)/`) — static/SSR, no DB/Redis/Claude dependencies, fully cacheable at the edge
2. **Demo API routes** (`app/api/demo/*`) — server-side Claude proxy, rate-limited, fixed system prompts, streamed responses, stateless (no DB writes)
3. **Audit funnel** (`app/api/audit/*` + `app/admin/`) — submit → Postgres row → Claude structured-output draft → founder email notification → admin review/edit → approve-and-send Server Action → Resend delivery
4. **Shared Claude client + rate-limiter** (`lib/claude/`, `lib/ratelimit.ts`) — the single enforcement point ensuring the API key never reaches the client and every Claude-calling route is protected, preventing the common failure mode of one endpoint shipping unprotected

### Critical Pitfalls

1. **Unmetered public demo = open wallet** — a scripted/bot-abused demo with no per-IP/session cap and no Console spend limit can produce a four-to-five-figure bill overnight; the proxy + rate limit + spend cap chain must exist before the first demo ships, not be retrofitted after a bill.
2. **API key leakage via client-side code** — any Claude call originating from the browser (including a `NEXT_PUBLIC_`-prefixed key) is instantly exploitable; all calls must go through server-side Route Handlers, verified by inspecting the deployed bundle before each launch.
3. **AI-drafted reports sent with hallucinated/overconfident claims** — even with human review, a rushed pass lets a fabricated dollar figure or competitor claim through; the review step needs an explicit checklist (all numeric claims traceable to input or an approved reference table), not a general "read it over" pass, and the report-drafting prompt itself must be constrained to prevent invented specifics.
4. **Demos and copy that alienate the actual buyer** (AI-jargon copy, chat-style/dev-console demo UX) — a non-technical SMB owner needs a 10-second "trigger → outcome" demo and outcome-first language throughout, not a transparent-reasoning chat interface or "agentic workflow" vocabulary; this risk recurs on secondary pages even after the homepage gets it right.
5. **Over-engineering the site before validating the core hypothesis** — the founder's engineering strength makes CMS/personalization/testing-infrastructure feel productive, but it delays the only thing that matters pre-launch (real visitors trying the demo/audit); scope should stay to core funnel pages until usage data justifies more.

## Implications for Roadmap

Based on combined research, suggested phase structure:

### Phase 1: Marketing Foundation
**Rationale:** Nothing else can ship without the deploy pipeline, core pages, and positioning in place; this phase has no dependency on Claude/DB infrastructure and establishes the credibility layer (founder story, ROI-first copy) that every later AI feature leans on for trust.
**Delivers:** Next.js/Netlify scaffold, Home/About/Services pages, booking CTA embed, ROI-first copy pass.
**Addresses:** Table-stakes features (5-page structure, real founder identity, booking CTA, engagement-model transparency) from FEATURES.md.
**Avoids:** Pitfall 4 (AI-jargon copy) and Pitfall 7 (weak positioning without testimonials) by getting outcome-first, specific-not-generic copy right from the start; also the first checkpoint against Pitfall 10 (over-engineering) — keep this phase to static/SSR pages only.

### Phase 2: Secure Claude Integration Layer
**Rationale:** Both flagship demos and the audit report depend on the same server-side proxy, rate-limiting, and spend-cap infrastructure; building this as its own phase — not bolted onto the first demo — is exactly what PITFALLS.md prescribes for the two most severe risks in this project (cost blowout, key leakage).
**Delivers:** `lib/claude/` server-only client, `lib/ratelimit.ts` shared Upstash-backed limiter factory, Turnstile verification wiring, Anthropic Console + hosting-platform spend caps configured.
**Uses:** @anthropic-ai/sdk, @upstash/ratelimit + @upstash/redis, @marsidev/react-turnstile, @t3-oss/env-nextjs (STACK.md).
**Implements:** Server-Side LLM Proxy and Distributed Rate Limiting patterns (ARCHITECTURE.md Patterns 1–2).

### Phase 3: Flagship Demo — Missed-Call Recovery
**Rationale:** The cheapest of the two flagship demos to build and validate the "let them experience it" thesis; ships on top of the Phase 2 infrastructure rather than inventing its own proxy/rate-limit logic.
**Delivers:** Ungated, button-triggered "before/after" demo widget embedded above the fold on the homepage.
**Addresses:** The primary above-the-fold differentiator from FEATURES.md (P1 priority).
**Avoids:** Pitfall 3 (prompt injection), Pitfall 5 (demos that impress engineers, not owners), Pitfall 11 (latency undermining trust) — requires an adversarial-input test pass and non-technical user test as explicit acceptance criteria before this phase is considered done.

### Phase 4: Workflow Audit Funnel (Questionnaire → AI Draft → Human Review → Send)
**Rationale:** This is the core wedge and the actual product-market-fit test for the business, but it has the most dependencies (Postgres schema, structured Claude output, admin UI, email delivery) — it belongs after the Claude integration layer and after at least one demo has proven the proxy pattern works end-to-end in production.
**Delivers:** Self-serve questionnaire (short, staged/multi-step), Supabase submission table with status lifecycle, Claude structured-output drafting pipeline, shared-secret-gated `/admin` review UI, Resend founder-notification + prospect-delivery emails.
**Addresses:** The core differentiator feature from FEATURES.md (P1 priority) — questionnaire, AI-drafted report, human review.
**Avoids:** Pitfall 6 (form friction — keep field count minimal, wire drop-off analytics from day one) and Pitfall 8 (hallucinated claims — build the founder-review checklist alongside the drafting prompt, not after).

### Phase 5: Vertical-Aware Content & Compliance Pass
**Rationale:** Vertical branching in the questionnaire and light per-vertical copy variants are cheapest to add once the questionnaire and demo shells already exist; this phase also closes the compliance gap that two of the four verticals (medical/dental, legal) carry and that a generic funnel design would otherwise miss.
**Delivers:** Vertical-aware questionnaire branching, vertical-flavored demo framing (same components, different copy per industry), synthetic-data disclaimers on medical/dental demo paths, AI-disclosure language on the audit report.
**Addresses:** Vertical-relevant language table-stakes requirement and sets up v1.x full vertical landing pages (FEATURES.md).
**Avoids:** Pitfall 9 (HIPAA/legal-advertising compliance blind spots) — explicit content requirement, not a legal afterthought.

### Phase 6: Launch Hardening & Validation Readiness
**Rationale:** A cross-cutting QA gate before the site goes fully public — this is where the "looks done but isn't" checklist from PITFALLS.md gets explicitly verified rather than assumed, and where scope is deliberately capped rather than allowed to keep expanding.
**Delivers:** Documented worst-case-cost answer for every public demo; verified server-side key isolation (bundle/network inspection); completed adversarial-input test pass per demo; step-by-step funnel analytics live; non-technical (ideally target-vertical) user test completed.
**Addresses:** Launch readiness across all P1 features from FEATURES.md.
**Avoids:** Pitfall 10 (over-engineering) by acting as the explicit stop-and-ship checkpoint, plus final verification of Pitfalls 1, 2, 3, 6, 8, 9 before real traffic arrives.

### Phase Ordering Rationale

- **Infrastructure before features that depend on it:** the Claude proxy/rate-limit layer (Phase 2) is a hard dependency for both demos and the audit funnel — PITFALLS.md is explicit that this must be designed in from the first line of AI-feature code, not retrofitted, so it cannot be deferred past the first demo.
- **Cheapest flagship demo before the harder audit funnel:** Phase 3 (missed-call demo) validates the proxy pattern and the "ungated try-it-yourself" thesis in production at lower engineering cost than Phase 4's multi-system audit pipeline, giving an earlier signal before the highest-complexity phase is built.
- **Vertical/compliance content after the core funnel shape exists:** FEATURES.md explicitly recommends starting with shared/generic questionnaire copy and light vertical branching, only expanding to dedicated vertical pages once early traction data shows which verticals are converting — Phase 5 reflects that "don't build 4x content before validating 1x funnel" sequencing.
- **A dedicated hardening phase, not an assumed byproduct:** every "looks done but isn't" item in PITFALLS.md (spend caps, key isolation, adversarial testing, analytics, non-technical user testing) is the kind of thing that quietly gets skipped when treated as part of each feature phase instead of an explicit gate — Phase 6 exists specifically so launch doesn't happen without these being checked off.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Audit Funnel):** Structured-output schema design for the Claude-drafted report and the founder-review checklist mechanics are product-specific, not off-the-shelf patterns — STACK.md and PITFALLS.md give strong direction (forced tool-use, Zod validation, traceable-claims checklist) but the actual schema/checklist needs to be designed during phase planning, not assumed from research alone.
- **Phase 5 (Vertical/Compliance):** HIPAA-adjacent and state-bar AI-disclosure specifics were only lightly verified (WebSearch-aggregated, not primary legal-source review per PITFALLS.md sourcing) — worth a targeted research pass specifically on medical/dental and legal-vertical disclosure language before that content ships.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Marketing Foundation):** Standard Next.js/Tailwind marketing-site build; no novel technical risk.
- **Phase 2 (Claude Integration Layer):** ARCHITECTURE.md and STACK.md already provide verified, code-level patterns (proxy, Upstash rate limiting, spend caps) — implementation-ready as researched.
- **Phase 3 (Missed-Call Demo):** Well-documented "simulate in the UI, single Claude call, stream the response" pattern — no live telephony integration needed (explicitly an anti-pattern to avoid, per ARCHITECTURE.md).
- **Phase 6 (Launch Hardening):** Checklist-driven verification work, not new technical build — standard QA/launch-readiness practice.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Framework/hosting/API integration patterns verified against official docs (Vercel, Netlify, Claude Platform Docs, npm registry); free-tier exact numbers are MEDIUM (shift over time, flagged for re-verification) |
| Features | MEDIUM-HIGH | WebSearch-verified across many current sources and cross-referenced competitor sites; no Context7-eligible libraries apply to this marketing/positioning question, so no primary-doc-level confidence ceiling is available |
| Architecture | HIGH | Core patterns (proxy, rate limiting, HITL review gate) verified against official docs and current multi-source consensus; exact vendor free-tier limits are MEDIUM |
| Pitfalls | MEDIUM-HIGH | Technical/cost/security findings verified across multiple current sources including official Claude docs; conversion/positioning findings are well-supported general patterns, not project-specific A/B data (none exists yet) |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Exact free-tier limits** (Netlify function credits, Supabase 500MB/7-day-auto-pause, Resend 100/day cap, Upstash 500K commands/mo) were sourced via WebSearch aggregation, not primary billing-page fetches at commit time — re-verify each before locking in the persistence/email/rate-limit implementation in Phase 2/4.
- **Netlify's Next.js Runtime v5 App Router/Server Actions coverage** is MEDIUM confidence (WebSearch-aggregated, not a direct doc fetch) — confirm streaming responses and Server Actions work as expected on Netlify specifically before deep build-out in Phase 2, since this is the one deviation from the "obvious default" (Vercel) stack choice.
- **Supabase vs. Airtable persistence decision** was left as an explicit either/or in STACK.md depending on how much custom admin-UI surface the founder wants to maintain pre-launch — resolve this concretely during Phase 4 planning rather than deferring it further.
- **Vertical-specific compliance language** (HIPAA-adjacent framing for medical/dental, AI-disclosure rules for legal) needs a dedicated, more authoritative research pass before Phase 5 content ships — current sourcing is general-pattern-level, not jurisdiction-specific legal research.
- **No real conversion/usability data exists yet** for this specific site (no A/B history, no target-vertical user testing) — Phase 3 and Phase 6 both call for non-technical/target-vertical user testing specifically because research patterns (interactive demo conversion rates, form-length conversion) are industry-general, not validated for this exact funnel.

## Sources

### Primary (HIGH confidence)
- Vercel Docs — `/docs/plans/hobby`, `/docs/limits/fair-use-guidelines` — commercial-use restriction on Hobby plan
- Claude Platform Docs — `/docs/en/manage-claude/rate-limits-api` — rate limits are org/workspace-scoped, not per-visitor
- Claude Help Center — API Key Best Practices — server-side-only key handling
- npm registry (`npm view <pkg> version`) — ground-truth current package versions
- Context7 — `/vercel/next.js`, `/anthropics/anthropic-sdk-typescript` — ecosystem/maintenance signal

### Secondary (MEDIUM confidence)
- Netlify Support Forums / netlify.com pricing — commercial use permitted on Free plan; Next.js Runtime v5 App Router support
- Cloudflare Developer Docs — Pages/Workers free tier, Turnstile independence from DNS
- Supabase Docs / billing FAQ — free-tier limits, 7-day auto-pause behavior
- Upstash Blog / Ratelimit SDK Docs — sliding-window rate limiting pattern for serverless
- Navattic / Storylane / Chameleon — interactive demo conversion research (industry-general, not project-specific)
- Ciela AI, Arkeo AI, Execution Point Consulting, Layer3 Labs, Fleece AI, MannVenture — direct competitor feature analysis

### Tertiary (LOW confidence)
- Anthropic/Claude pricing figures aggregated via WebSearch (cloudzero.com, finout.io, benchlm.ai) — re-verify at platform.claude.com before committing budget
- HIPAA/legal-advertising vertical-compliance sourcing — general-pattern level, needs jurisdiction-specific follow-up before Phase 5 content ships

---
*Research completed: 2026-07-19*
*Ready for roadmap: yes*
