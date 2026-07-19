# Architecture Research

**Domain:** Marketing site with public AI-powered interactive demos + AI-assisted lead-qualification funnel (form → AI draft → human review → email delivery)
**Researched:** 2026-07-19
**Confidence:** HIGH (stack/infra patterns, verified against official docs and multiple current sources) / MEDIUM (exact free-tier numbers, which vendors change without notice)

## Standard Architecture

This is a well-trodden shape in 2026: a Next.js marketing site deployed on Vercel, with serverless route handlers acting as a thin, secured proxy in front of an LLM API, a lightweight serverless Postgres store for stateful flows, and a transactional email provider for both internal notifications and external delivery. Nothing here requires a "real" backend service, a queue system, or a dedicated ops layer — the entire system is composable from managed, free-tier-friendly primitives. This is exactly the shape recommended for solo-founder SaaS/marketing stacks in 2026 and matches the standard pattern for public-facing Claude API proxies (key stays server-side, rate limiting sits at the edge in front of the model call).

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                             │
│  Marketing pages (static) │ Demo widgets │ Audit form │ /admin UI     │
└───────┬───────────────────────┬───────────────┬───────────┬─────────┘
        │ SSG/SSR HTML           │ fetch/stream   │ fetch      │ fetch (basic-auth)
        ▼                        ▼                ▼           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  VERCEL EDGE / SERVERLESS (Next.js)                  │
│                                                                       │
│  ┌────────────────┐   ┌─────────────────┐   ┌────────────────────┐ │
│  │ Static/SSR      │   │ /api/demo/*      │   │ /api/audit/*        │ │
│  │ marketing pages │   │ (Claude proxy,   │   │ (submit, draft,     │ │
│  │                 │   │  rate-limited)   │   │  send)               │ │
│  └────────────────┘   └────────┬─────────┘   └──────┬──────┬───────┘ │
│                                 │                     │      │        │
│                        ┌────────┴────────┐            │      │        │
│                        │ Rate limiter     │            │      │        │
│                        │ middleware       │            │      │        │
│                        └────────┬────────┘            │      │        │
└─────────────────────────────────┼─────────────────────┼──────┼────────┘
                                   │                      │      │
                                   ▼                      ▼      ▼
                          ┌──────────────┐      ┌──────────────┐ ┌─────────────┐
                          │ Anthropic    │      │ Postgres      │ │ Resend      │
                          │ Claude API   │      │ (Neon)        │ │ (email)     │
                          └──────────────┘      └──────────────┘ └─────────────┘
                                   ▲                      ▲
                                   │                      │
                          ┌──────────────┐                │
                          │ Upstash Redis│────────────────┘
                          │ (rate limit  │  shared limiter store
                          │  counters)   │
                          └──────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|-------------------------|
| Marketing pages | Static/SSR content: home, services, about, vertical pages | Next.js App Router, statically generated (SSG) at build time, no runtime dependencies |
| Demo widgets | Client-side UI that simulates an interaction (missed call, incoming inquiry) and displays the Claude-generated result | React client components; call only their own `/api/demo/*` route, never Anthropic directly |
| Demo API routes | Server-side Claude proxy for public demos: validate input, enforce rate limit, call Claude with a fixed/constrained system prompt, stream result back | Next.js Route Handlers (Node or Edge runtime), Anthropic SDK server-side, `@upstash/ratelimit` guard before the model call |
| Rate limiter | Shared abuse-prevention layer across all Claude-calling routes; keys on IP (and optionally a lightweight fingerprint/cookie) | Upstash Redis + `@upstash/ratelimit` (sliding window), invoked as the first step inside each route handler or in Next.js middleware |
| Audit form + submit API | Collect questionnaire answers, persist as a submission, kick off AI draft generation, notify founder | Route Handler writes to Postgres (status=`pending`), then triggers draft generation (sync if fast enough, or deferred with `after()`/QStash if not) |
| Data store | Source of truth for audit submissions and their draft/review/sent lifecycle | Neon serverless Postgres (Vercel's native Postgres integration since Vercel Postgres was sunset), accessed via a lightweight ORM (Drizzle) |
| Draft generation | Turn structured questionnaire answers into a structured audit report draft | Server-side Claude call using structured/tool-based output for a consistent report schema; result stored in Postgres (status=`drafted`) |
| Founder notification | Alert the founder that a new submission needs review | Resend transactional email fired from the submit/draft-complete route handler |
| Admin review UI | Single-user, password-gated page listing pending drafts; founder edits inline and approves send | Next.js route under `/admin`, protected by simple shared-secret middleware (not a full auth system); Server Action updates Postgres and triggers send |
| Prospect delivery | Send the founder-approved report to the prospect | Resend send from the admin "approve" Server Action; updates submission status=`sent` in Postgres |

## Recommended Project Structure

```
src/
├── app/
│   ├── (marketing)/            # Static/SSR marketing pages
│   │   ├── page.tsx             # Home
│   │   ├── services/page.tsx
│   │   ├── about/page.tsx
│   │   └── industries/[vertical]/page.tsx
│   ├── audit/
│   │   └── page.tsx             # Self-serve questionnaire (client form)
│   ├── admin/
│   │   ├── layout.tsx           # Basic-auth gate (middleware-enforced)
│   │   └── page.tsx             # List + review/edit/send drafts
│   └── api/
│       ├── demo/
│       │   ├── missed-call/route.ts
│       │   └── intake-triage/route.ts
│       └── audit/
│           ├── submit/route.ts       # Create submission + kick off draft
│           └── [id]/send/route.ts    # Founder-approved send to prospect
├── lib/
│   ├── claude/
│   │   ├── client.ts             # Server-only Anthropic SDK instance
│   │   ├── prompts/               # System prompts per demo/report type
│   │   └── audit-report-schema.ts # Structured output schema for reports
│   ├── ratelimit.ts               # Upstash Redis limiter factory (per-route configs)
│   ├── db/
│   │   ├── schema.ts              # Drizzle schema (submissions, drafts)
│   │   └── client.ts              # Neon connection
│   ├── email/
│   │   ├── notify-founder.ts
│   │   └── send-report.ts
│   └── auth/
│       └── admin-guard.ts         # Shared-secret cookie check for /admin
└── middleware.ts                  # Route /admin through admin-guard
```

### Structure Rationale

- **`app/(marketing)/`:** Route group keeps static/SSR pages isolated from anything stateful — nothing in this tree touches the DB, Redis, or Claude directly, so it can be fully statically generated and cached at the edge for free.
- **`app/api/demo/*` vs `app/api/audit/*`:** Two distinct API surfaces with different risk profiles — demos are public, stateless, rate-limit-critical; audit routes are semi-public (write path) but stateful and lower-frequency. Separating them makes it obvious where rate limiting is mandatory vs where it's secondary.
- **`lib/claude/`:** Centralizes the only code allowed to hold the Anthropic API key and call the API. Every route imports from here rather than instantiating its own client — this is the enforcement point for "the key never reaches the client and every call goes through one audited path."
- **`lib/ratelimit.ts`:** One shared factory so every Claude-calling route gets a limiter instance, rather than each route reinventing its own Redis logic (a common source of gaps where one endpoint quietly ships unprotected).
- **`admin/`:** Deliberately outside `app/api` and gated by middleware rather than a full auth library — this is a single-user internal tool, not a multi-tenant admin panel, and should stay that simple.

## Architectural Patterns

### Pattern 1: Server-Side LLM Proxy (never expose the key)

**What:** All Claude API calls happen inside Next.js Route Handlers running server-side (Node or Edge runtime with the key in an environment variable). The browser never sees the Anthropic API key and never calls `api.anthropic.com` directly.
**When to use:** Always, for any public-facing AI feature. This is non-negotiable for a public demo — an exposed key on a marketing site is an open invitation to have your Claude spend drained by scripts within minutes.
**Trade-offs:** Adds one network hop (browser → your API → Anthropic) vs. calling Claude directly from the client, but this is the only architecture that keeps the key secret and lets you enforce rate limits and prompt constraints server-side.

```typescript
// app/api/demo/missed-call/route.ts
export async function POST(req: Request) {
  const { success } = await ratelimit.limit(getClientIp(req));
  if (!success) return new Response("Too many requests", { status: 429 });

  const { scenario } = await req.json();
  const stream = await anthropic.messages.stream({
    model: "claude-...",
    system: MISSED_CALL_DEMO_SYSTEM_PROMPT, // fixed, not user-controllable
    messages: [{ role: "user", content: scenario }],
  });
  return new Response(stream.toReadableStream());
}
```

### Pattern 2: Distributed Rate Limiting at the Route Boundary

**What:** Because each serverless invocation is stateless and isolated, per-IP counters must live in a shared store (Redis), not in-memory. Upstash Redis (HTTP-based, no persistent connections needed) is the standard fit for Vercel serverless/edge functions, with a first-class Vercel integration that auto-injects credentials.
**When to use:** In front of every route that calls Claude, and on the audit form submit route (to prevent spam submissions from draining email/DB quota, not just Claude spend).
**Trade-offs:** Adds an external dependency and a small per-request latency (~single-digit ms with Upstash's edge-replicated REST API), but it's the only viable way to cap cost exposure on serverless — without it, a single bot script can generate an unbounded Anthropic bill before you notice.

```typescript
// lib/ratelimit.ts
export const demoRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 s"), // per IP
});
```

### Pattern 3: Human-in-the-Loop Review Gate (draft → review → send)

**What:** The AI never sends anything directly to a prospect. The submit flow always lands in a `drafted` state visible only to the founder; a distinct, explicit approve/send action (the admin UI) is what actually triggers delivery. This mirrors the standard HITL pattern: AI produces output, a human reviews with the AI's output surfaced clearly, and only an explicit human action advances the workflow — with the state transitions themselves forming a lightweight audit trail (submission → drafted → sent, with timestamps).
**When to use:** Any AI-generated artifact that reaches an external party (the prospect) rather than staying internal — this is explicitly required by the project's scope (no fully-automated report sending).
**Trade-offs:** Adds latency between submission and delivery (founder has to act) and requires a review surface (however minimal) — but it's what makes it safe to use an AI draft for outbound communication before the business has a track record to lean on.

```typescript
// app/admin/page.tsx (Server Action, simplified)
async function approveAndSend(id: string, editedBody: string) {
  "use server";
  await db.update(submissions).set({ status: "sent", finalReport: editedBody }).where(eq(submissions.id, id));
  await sendReportEmail({ to: submissionEmail(id), body: editedBody });
}
```

## Data Flow

### Demo Request Flow (ephemeral, no persistence)

```
Visitor interacts with demo widget
    ↓
POST /api/demo/[name]  → rate limiter check (Upstash, per-IP)
    ↓ (if allowed)
Claude API call (fixed system prompt, bounded input) — streamed
    ↓
Response streamed back to widget, rendered live
    ↓
(optional: increment a Redis counter for cost/usage visibility — no DB write)
```

### Audit Funnel Flow (stateful, human-gated)

```
Prospect submits questionnaire
    ↓
POST /api/audit/submit
    ↓
Insert row into Postgres (status: pending) ──────────┐
    ↓                                                  │
Claude call: structured-output audit report draft      │  durable record —
    ↓                                                  │  survives retries/
Update row (status: drafted, draft: <text>)             │  redeploys
    ↓                                                  │
Resend → notify founder "new audit ready to review" ───┘
    ↓
Founder opens /admin (password-gated) → sees draft
    ↓
Founder edits inline → clicks "Approve & Send"
    ↓
Server Action: update row (status: sent, finalReport: <edited text>)
    ↓
Resend → email final report to prospect
```

### Key Data Flows

1. **Demo flow is stateless by design:** no submission ever needs to be recalled later, so there's no reason to write it to Postgres — keeping demos DB-free minimizes moving parts and cost for the highest-traffic, most abuse-prone part of the site.
2. **Audit flow is DB-backed and stateful because it must survive a human delay:** the founder may review hours or days after submission, so the "draft awaiting review" state has to be durable, not held in memory or a serverless function's transient scope.
3. **Notification is a side effect, not a blocking dependency:** if the founder-notification email fails to send, the submission and draft must still be safely persisted — the admin UI (querying "status = drafted") is the source of truth, the email is just a nudge.

## Scaling Considerations

At the scale implied by this project (solo consultancy, early-stage SMB lead gen), traffic will realistically stay in the low thousands of monthly visitors and dozens of audit submissions/demo interactions per month — this is not a scaling problem, it's a cost-and-abuse-containment problem.

| Scale | Architecture Adjustments |
|-------|---------------------------|
| Current (0–1k visitors/mo, single founder) | Everything on free tiers as designed: Vercel Hobby, Neon free (0.5GB/project, ~191 compute-hours/mo), Upstash free (500K commands/mo), Resend free (3,000 emails/mo, 100/day cap) |
| Growth (1k–10k visitors/mo, demos going semi-viral) | Rate-limit budgets become the real constraint, not infra — tighten per-IP demo limits, add Vercel's built-in bot/attack protections (available on Hobby), consider a CAPTCHA (e.g. Cloudflare Turnstile) on the audit form if spam appears |
| Beyond solo capacity (needs a team / high volume) | Out of scope for this project's stated constraints, but the natural next step is moving from single-admin `/admin` gate to real multi-user auth, and from synchronous Claude report generation to a queued background job (Upstash QStash) if draft generation volume grows |

### Scaling Priorities

1. **First bottleneck: Claude API cost from unrestrained public demo usage**, not server capacity. The rate limiter (Pattern 2) is the priority build item — it must exist before demos go live publicly, not be retrofitted after a cost spike.
2. **Second bottleneck: Resend's 100-emails/day cap**, which will bind before the 3,000/month cap given the workflow sends at least two emails per audit (founder notification + prospect delivery) plus potential marketing/contact-form email. Trivial to monitor at this volume; only becomes a real concern if outbound volume scales into dozens of audits/day.

## Anti-Patterns

### Anti-Pattern 1: Calling Claude Directly from the Browser

**What people do:** Put the Anthropic API key in a client-side env var (e.g. `NEXT_PUBLIC_ANTHROPIC_KEY`) to "keep it simple" for a demo.
**Why it's wrong:** The key is trivially extractable from any bundled JS and can be abused by anyone, unrelated to your rate limits, running up unbounded spend on your account.
**Instead:** Route every Claude call through a server-side Route Handler (Pattern 1) — no exceptions, even for "just a demo."

### Anti-Pattern 2: Building Real Telephony for the Missed-Call Demo

**What people do:** Reach for Twilio (or similar) to make the "missed-call recovery" demo actually place/receive calls, so it feels "real."
**Why it's wrong:** Massively increases scope, cost, and compliance surface (phone numbers, carrier approval, SMS regulations) for a marketing-site demo whose only job is to *illustrate* the auto-text-back concept convincingly — not operate as a production phone system. This directly contradicts the project's "lean/free-tier" constraint and its explicit exclusion of a voice-bot demo.
**Instead:** Simulate the scenario entirely in the UI (a mocked "incoming call" state that transitions to a generated auto-text-back message via a single Claude call). This is standard practice for interactive marketing demos — SOTA "try it yourself" widgets are almost always simulated front-ends over a single model call, not live integrations.

### Anti-Pattern 3: Fully Automating the Audit Report Send

**What people do:** Once the AI draft looks good in testing, wire the "send" step directly to draft completion to remove friction from the funnel.
**Why it's wrong:** Removes the human review gate the project explicitly requires while trust is being built (an AI-drafted, unreviewed report going out under the founder's name is a real reputational/quality risk with SMB prospects who are the intended proof point).
**Instead:** Keep draft-generation and send as two distinct, explicitly-triggered steps (Pattern 3) — the review gate is a product requirement, not just an engineering nicety, and the architecture should make it structurally impossible to skip (no code path sends an unapproved draft).

### Anti-Pattern 4: Over-Building Admin Auth for a Single User

**What people do:** Reach for NextAuth/Clerk/a full RBAC system to protect `/admin` "because that's the standard way to do auth."
**Why it's wrong:** Adds real setup cost (provider config, session storage, sometimes another paid service) to protect a page only one person will ever log into.
**Instead:** A middleware check against a single shared secret (password → signed cookie) is standard and sufficient for a solo-founder internal tool; upgrade only if/when a second reviewer is added.

### Anti-Pattern 5: In-Memory Rate Limiting on Serverless

**What people do:** Implement rate limiting with a plain in-memory `Map` counter inside the route handler.
**Why it's wrong:** Each serverless invocation may run in a fresh, isolated instance — the counter resets constantly and provides close to zero real protection, giving false confidence.
**Instead:** Use a shared external store (Upstash Redis, Pattern 2) so counters are consistent across invocations and regions.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|----------------------|-------|
| Anthropic Claude API | Server-side SDK call from Route Handlers only; structured/tool-based output for the audit report to get a consistent, parseable schema | Never call from client. Use streaming for demo latency; report generation can be synchronous within Vercel's function timeout (10s Hobby / 15s Pro) if kept to a single call, or deferred via `after()`/a queue if generation risks exceeding it |
| Upstash Redis | REST-based client (`@upstash/redis`, `@upstash/ratelimit`), first-class Vercel integration auto-injects env vars | Free tier (~500K commands/mo) is far more than sufficient at this project's scale |
| Neon Postgres | Serverless Postgres, accessed via Drizzle ORM; this is now Vercel's native/default Postgres integration (Vercel Postgres itself was sunset in favor of Neon) | Free tier: multiple projects, ~191 compute-hours/mo, 0.5GB storage/project — ample for low-volume audit submissions |
| Resend | Transactional email API, two distinct sends: founder notification, prospect report delivery | Free tier: 3,000 emails/mo, capped at 100/day — the daily cap is the more likely constraint given 2 emails/audit |
| (optional) Cloudflare Turnstile | Client-side widget + server-side token verification on the audit form | Add only if spam becomes an observed problem — avoid adding friction to the funnel preemptively |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|----------------|-------|
| Demo widget ↔ Demo API route | `fetch`/streaming HTTP, JSON in, text/event-stream out | Widget never holds any secret; all validation and prompt construction happens server-side |
| Audit form ↔ Submit API | `fetch` POST, JSON | Form should do basic client-side validation but server must re-validate (never trust client input going into a Claude prompt or DB write) |
| Submit API ↔ Data store | Drizzle ORM queries | Only server-side code touches the DB — no client-side Postgres access ever |
| Admin UI ↔ Data store / Email | Server Actions (mutations) + server-side reads | Keeps `/admin` free of a separate API layer; Server Actions are the standard Next.js pattern for this kind of internal-tool mutation |
| All Claude-calling routes ↔ Rate limiter | Shared `lib/ratelimit.ts` factory, invoked first in every handler | Centralizing this prevents the common failure mode of one endpoint shipping without protection |

## Sources

- [Rate Limiting in Next.js: Protecting Your API Routes — Nextcraft](https://www.nextcraft.agency/resources/insights/nextjs-rate-limiting)
- [Setting Up Proxy API Routes in Next.js: The Definitive Guide](https://www.nextsaaspilot.com/blogs/nextjs-proxy-api-route)
- [Keeping Your Next.js API Key Secure](https://nextnative.dev/blog/api-key-secure)
- [Ratelimit with Upstash Redis — Vercel Templates](https://vercel.com/templates/next.js/ratelimit-with-upstash-redis)
- [Rate Limiting Your Next.js App with Vercel Edge — Upstash Blog](https://upstash.com/blog/edge-rate-limiting)
- [Overview — Upstash Ratelimit SDK Docs](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [Rate limits — Claude Platform Docs](https://platform.claude.com/docs/en/api/rate-limits)
- [Usage and Cost API — Claude Platform Docs](https://platform.claude.com/docs/en/manage-claude/usage-cost-api)
- [Human-in-the-Loop Workflows for AI — Velt (June 2026)](https://velt.dev/blog/designing-human-in-the-loop-workflows-ai-products)
- [Human-in-the-loop in AI workflows: Meaning and patterns — Zapier](https://zapier.com/blog/human-in-the-loop/)
- [AI Agent Approval Workflows: Human Oversight That Scales — Waxell (2026)](https://waxell.ai/blog/ai-agent-approval-workflows)
- [Neon vs Vercel (2026): Serverless Postgres + Hosting Stack](https://www.buildmvpfast.com/compare/neon-vs-vercel)
- [Vercel Supabase: Full Stack Setup and Limits in 2026 — Kuberns](https://kuberns.com/blogs/vercel-supabase/)
- [Supabase Pricing 2026: Free Tier Limits & Real Costs](https://designrevision.com/blog/supabase-pricing)
- [New Free Tier — Resend Blog](https://resend.com/blog/new-free-tier)
- [What are Resend account quotas and limits? — Resend Docs](https://resend.com/docs/knowledge-base/account-quotas-and-limits)
- [Upstash Free Tier 2026: Limits, Pricing & What Changed](https://agentdeals.dev/vendor/upstash)
- [The Best SaaS Stack in 2026: Build Production Apps Fast — Makerkit](https://makerkit.dev/blog/saas/saas-stack-2026)

---
*Architecture research for: Marketing site + public AI demos + AI-assisted audit funnel with human review*
*Researched: 2026-07-19*
