# Project Research Summary

**Project:** AI Deployed — v2.0 FDE Pivot
**Domain:** Solo-consultancy marketing/lead-gen site (Next.js App Router) — repositioning to a forward-deployed-engineer (FDE) narrative, adding a blog/content credibility engine, buyer-vocabulary SEO, a visually distinctive redesign, and a re-ideated Claude-backed interactive demo
**Researched:** 2026-07-20
**Confidence:** MEDIUM-HIGH

## Executive Summary

This milestone is not a new product — it's a repositioning-in-place of an existing Next.js 16/React 19/Tailwind 4/Netlify site, adding four additive layers on top of an already-validated foundation: a static MDX blog/content engine, a single-page IA rewrite carrying a 5-part message hierarchy (gap → fix → outcomes → offer → CTA), a buyer-vocabulary SEO/metadata layer, and one re-ideated Claude-backed public demo. Nothing here requires a new hosting model, a database, or new infrastructure decisions — the v1 stack research (Netlify Free, `@anthropic-ai/sdk` server-side proxy, Upstash rate limiting, Turnstile, Resend, Supabase) carries forward unchanged, and this research only adds what's new: `@next/mdx` for content, `motion`/optionally `gsap` for the redesign's visual ambition, and the Vercel AI SDK if the re-ideated demo turns out to be multi-step/agentic rather than single-turn.

The recommended approach is disciplined scoping around three tensions the research repeatedly surfaces: (1) "visually impressive" must be bounded — one or two high-craft signature elements on top of the kept shadcn/ui foundation, not a bespoke component system or heavy animation stack, or it directly threatens the site's own Core Web Vitals, accessibility, and solo-maintainability; (2) the anonymous-founder positioning has no default trust-signal substitute — process/methodology transparency, transparent (but scope-qualified) pricing, and at least one real anonymized case study are near-mandatory compensating content, not optional polish; (3) buyer-vocabulary SEO must be executed as content organized around real buyer intent (a genuine pillar+cluster blog), not literal keyword insertion into every section, which reads as unnatural and is a negative ranking signal.

The single highest-severity risk in this milestone is the public Claude-backed demo shipping without its full three-layer cost/abuse defense (Turnstile + Upstash rate limiting + Anthropic Console spend cap) — this is a day-one financial risk on a $0-recurring-budget project, not a scale-later concern, and the risk is specifically elevated here because the demo is being re-ideated from scratch, making it easy to assume the old demo's protections "still apply" when they don't automatically carry over to new routes. The second-highest risk is a half-migrated rebrand — stray v1 copy/routes/vocabulary (missed-call recovery, vertical pages) surviving in corners of the site alongside the new FDE positioning — which is cheap to prevent (a full-repo grep as an explicit phase exit criterion) but easy to miss without that explicit step.

## Key Findings

### Recommended Stack

The v1 foundation (Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Netlify Free via Next.js Runtime v5, `@anthropic-ai/sdk` server-side, Upstash rate limiting, Cloudflare Turnstile, Resend/react-email, Supabase, Zod) is unchanged and not re-litigated. What's new for v2 is purpose-built and narrowly scoped: a native, zero-extra-infrastructure MDX content pipeline for the blog; a scoped animation approach (Motion for the common case, GSAP added only if the redesign wants cinematic scroll-choreography — and GSAP/ScrollTrigger is now 100% free since Webflow's April 2025 acquisition of GreenSock, correcting a common outdated assumption); and built-in Next.js primitives (`next/font`, `next/og`, `sitemap.ts`/`robots.ts`, `generateMetadata`) for zero-cost, zero-dependency SEO/performance wins.

**Core technologies:**
- `@next/mdx` (+ `remark-gfm`, `rehype-slug`, `@tailwindcss/typography`) — blog/content engine — official, zero-DB, git-versioned, ships zero client JS for posts; Contentlayer (the old default) is unmaintained since 2024 and must not be adopted new
- `motion` (Framer Motion's current package name) — component-level animation (hero reveals, hover states, scroll fades) — smallest-footprint, purpose-built for React, App-Router-aware imports
- `gsap` + `ScrollTrigger` + `@gsap/react` — only if the redesign wants a cinematic, pinned/scrubbed scroll narrative for the 5-part message hierarchy — now fully free, industry-standard for this specific effect
- `next/og` (`ImageResponse`) + `schema-dts` + `feed` — per-route OG images, typed JSON-LD, and an RSS feed — all built-in or near-zero-cost, directly serve the buyer-vocabulary SEO requirement
- `ai` + `@ai-sdk/anthropic` + `@ai-sdk/react` — only if the re-ideated demo is visibly multi-step/agentic ("watch the agent work"); otherwise reuse v1's plain `@anthropic-ai/sdk` Route Handler pattern unchanged

### Expected Features

Three feature areas: the FDE landing page, the blog/content credibility engine, and the interactive demo(s) — all converging on one CTA (book the free audit) and one consistent outcome vocabulary (TIME/EFFICIENCY/PROFIT).

**Must have (table stakes):**
- Single-page 5-part message hierarchy (gap → fix → outcomes → offer → CTA) with one repeated CTA and outcome-framed (not feature-framed) benefit copy
- Transparent, scope-qualified pricing (free audit → <$10k setup → <$2k/mo retainer) visible on the page, not gated behind a call
- Process/methodology transparency section — the mandatory trust-signal substitute given anonymous positioning and zero case studies at launch
- Buyer-vocabulary SEO ("AI agents," "automation," "AI-native transformation," "forward-deployed engineer") in headings/meta, mapped to buyer intent, not keyword-stuffed
- 1 pillar blog post + 3–5 cluster posts (topic-cluster structure), each routing back to the audit CTA, no gating
- Anonymized case-study format/template defined now, even with zero posts using it yet
- One bounded "mini-audit" style interactive demo (Claude Haiku, rate-limited, Zod-structured output) that previews the actual audit deliverable, not a generic chatbot
- Visual redesign covering at minimum the landing page and blog templates

**Should have (competitive):**
- The site itself as visible proof of craft (one strong signature visual/interaction element, not pervasive heavy animation)
- Explicit "worst-case scenario" framing in the outcomes section to defuse skeptical-buyer risk-anxiety
- Anonymized case studies with specific, quantified before/after numbers (once real engagements exist)

**Defer (v2+):**
- Client-side ROI calculator (zero-marginal-cost second proof point) — add once primary demo/landing page are validated
- "Worst-case scenario" toggle on demo/calculator output
- Full case-study library, second demo concept, comparison/bottom-funnel content — all explicitly v3+, premature pre-launch

**Explicit anti-features:** open-ended "ask me anything" chatbot demo (cost/abuse risk, undersells FDE specificity), named founder bio/headshot (conflicts with anonymity constraint), gated blog content (kills the SEO purpose), vertical-specific landing pages (v1 approach, explicitly scrapped), client login/dashboard (out of scope), and pervasive scroll-jacking/heavy animation (undermines the "craft not flash" goal).

### Architecture Approach

Four additive layers on the existing static-first Next.js App Router site: a filesystem-based MDX content layer (`content/blog/*.mdx`, `export const metadata`, `generateStaticParams`, fully SSG, no DB); a single-page IA collapsing the v1 multi-page nav into one long-scroll landing page plus `/blog`; a metadata/structured-data layer (`generateMetadata`, `sitemap.ts`, `robots.ts`, JSON-LD, RSS) sharing one `lib/content/posts.ts` read path to prevent sitemap/RSS/index drift; and one re-ideated Claude proxy surface (`/api/demo/[name]/route.ts`) behind rate limiting — the only dynamic, cost-bearing surface this milestone adds, everything else is build-time static and effectively risk-free.

**Major components:**
1. FDE landing page (`/`) — single Server Component carrying the full 5-part hierarchy, statically generated
2. `content/blog/` + `lib/content/posts.ts` — single source of truth feeding `/blog`, `/blog/[slug]`, RSS, and sitemap
3. Demo Route Handler (`/api/demo/[name]`) — server-side Claude proxy, rate-limit gate in front of every call
4. SEO/metadata layer — `generateMetadata`, JSON-LD, sitemap/robots/RSS, all built at compile time

**One open, flagged architecture decision:** whether Netlify's native code-based rate limiting can gate Next.js Runtime v5 (OpenNext) Route Handlers directly, or whether the proven Upstash-in-handler pattern from v1 must be used instead. Recommended: spike the native option early (cheap, ~1 hour), fall back to Upstash immediately if path-matching doesn't reliably intercept — but do not ship the demo publicly without explicitly testing that whichever option is chosen actually returns a 429 under load.

### Critical Pitfalls

1. **Public Claude demo ships without full cost/abuse defense** — because the demo is being rebuilt from scratch, it's easy to assume old protections carry over. Require Turnstile + Upstash rate limiting + Console spend cap as an explicit Definition-of-Done gate for the demo phase, re-verified against the new demo's actual routes.
2. **Half-migrated positioning** — stray v1 copy/routes (missed-call recovery, vertical pages) surviving alongside new FDE copy reads as incoherent to a skeptical visitor. Make a full-repo grep for retired vocabulary an explicit phase exit criterion, not implicit cleanup.
3. **"Visually impressive" redesign tanks performance/accessibility/maintainability** — heavy animation/bespoke components risk CWV regressions and abandon the shadcn/ui-owned-code model. Set explicit CWV budgets (LCP <2.5s, CLS <0.1, INP <200ms) and `prefers-reduced-motion` support before design work starts.
4. **MDX/Netlify integration breaks in production despite working in `next dev`** — MDX + App Router + Netlify has real, under-documented failure classes. Verify a production Netlify build (not just local dev) as an explicit blog-phase exit criterion, and confirm the Runtime v5 plugin version.
5. **Anonymous positioning leaves a trust gap the redesign alone doesn't fix** — a purely aesthetic redesign solves the craft-credibility problem, not the identity-credibility problem. At least one real anonymized case study before active traffic push, plus concrete (if unnamed) origin-story specifics, are required compensating content.

Also flagged: misusing the 95%-AI-failure stat without scoping it to "enterprise pilots" (credibility risk if fact-checked), buyer-vocabulary SEO executed as keyword stuffing (negative ranking signal + undermines the specificity pitch), and pricing numbers shipped as unconditional promises rather than scope-qualified ranges tied to the free audit.

## Implications for Roadmap

Based on combined research, the natural build order follows the risk/dependency gradient: static content-and-copy work (safe, zero infra risk) can ship incrementally, while the one dynamic/cost-bearing surface (the demo) needs its full defense wired before it's ever public. Positioning/copy work should be finished and cleaned up atomically (not left half-migrated) before or alongside the visual redesign, since the redesign phase is the natural place to also enforce CWV/accessibility budgets.

### Phase 1: FDE Landing Page — Positioning, Copy, IA Rewrite
**Rationale:** This is the core deliverable and the dependency root for everything else (blog CTAs link back to it, the demo sits within it, the redesign restyles it). Copy/positioning must be locked before visual and content work builds on top of it.
**Delivers:** Single long-scroll page with the full 5-part hierarchy (gap → fix → outcomes → offer → CTA), transparent scope-qualified pricing, process/methodology transparency section, properly-sourced 95%-stat citation, buyer-vocabulary SEO in headings/meta.
**Addresses:** FDE landing page table stakes + differentiators (FEATURES.md Area 1)
**Avoids:** Pitfall 1 (half-migrated positioning — full-repo grep as exit criterion), Pitfall 3 (misused stat), Pitfall 6 (keyword stuffing), Pitfall 8 (unconditional pricing)

### Phase 2: Visual Redesign
**Rationale:** Redesign the landing page (and set the design system that blog templates will inherit) only once copy/IA is locked, so visual work isn't wasted restyling content that's about to change.
**Delivers:** Distinctive, high-craft visual treatment scoped to a small number of signature elements on top of the kept shadcn/ui foundation; explicit CWV budgets and `prefers-reduced-motion` support baked into Definition of Done.
**Uses:** `motion` (default), optionally `gsap`+`ScrollTrigger`+`@gsap/react` if cinematic scroll-choreography is chosen; `next/font` for zero-CLS typography
**Avoids:** Pitfall 2 (performance/accessibility/maintainability regression), Pitfall 7 partially (redesign must not be mistaken for solving the trust-identity gap)

### Phase 3: Blog / Content Credibility Engine
**Rationale:** Depends on the landing page's finalized positioning/vocabulary (cluster posts extend the same buyer-vocabulary strategy) and benefits from the redesign's typography/design tokens being settled first (blog templates inherit them), but is otherwise independently shippable and static/low-risk.
**Delivers:** `@next/mdx` content pipeline, 1 pillar + 3–5 cluster posts, shared `lib/content/posts.ts` feeding blog index/RSS/sitemap, JSON-LD Article schema, anonymized case-study format/template (no content yet).
**Implements:** Architecture Pattern 2 (file-based MDX, no Contentlayer) and Pattern 4 (structured data/SEO layer)
**Avoids:** Pitfall 5 (MDX/Netlify build breaks — verify production build explicitly), Pitfall 6 (keyword stuffing in content)

### Phase 4: Re-ideated Interactive Demo
**Rationale:** Placed last because it's the one net-new dynamic/cost-bearing surface and the only piece with an unresolved architecture question (Netlify-native vs. Upstash rate limiting); sequencing it after the static work is settled reduces the number of moving pieces when validating the cost-control defense.
**Delivers:** Bounded "mini-audit" demo (Claude Haiku, Zod-structured output, TIME/EFFICIENCY/PROFIT-framed) wired with Turnstile + rate limiting + Console spend cap, explicitly tested (not assumed) before going live.
**Uses:** `@anthropic-ai/sdk` server-side Route Handler (or `ai`/`@ai-sdk/anthropic`/`@ai-sdk/react` if the concept ends up multi-step/agentic); Upstash fallback if Netlify-native rate limiting doesn't cleanly gate Route Handlers
**Avoids:** Pitfall 4 (demo ships without full cost/abuse defense) — the single highest-severity pitfall identified

### Phase Ordering Rationale

- Copy/positioning must be finished and cleaned up (Pitfall 1) before the redesign restyles it and before blog content extends its vocabulary — doing this out of order risks restyling or extending content that changes underneath the later work.
- The demo is deliberately last: it's the only phase touching a paid external API and carrying real day-one financial risk, and it has one unresolved architecture question (Pattern 3) that benefits from being spiked in isolation rather than entangled with content/design work.
- Content (blog) and redesign could in principle be reordered relative to each other — the roadmapper should feel free to swap Phases 2 and 3 if it's more efficient to build the content pipeline before finalizing visual polish — but both must follow Phase 1 and both must precede or run parallel to, never depend on, Phase 4.

### Research Flags

Phases likely needing deeper research during planning:
- **Demo phase (Phase 4):** Needs `--research-phase` validation specifically for the Netlify-native vs. Upstash rate-limiting question (Architecture Pattern 3, MEDIUM confidence, explicitly flagged as unverified against the Next.js Runtime v5/OpenNext internals) — spike Option A, confirm or fall back before committing the phase plan.
- **Blog/content-engine phase (Phase 3):** MEDIUM confidence on Netlify + App Router + MDX production-build specifics (Pitfall 5) — worth a targeted check of current `@netlify/plugin-nextjs`/Runtime v5 compatibility before implementation, since this is exactly the kind of "works in `next dev`, breaks in production" risk that benefits from a pre-build spike.

Phases with standard patterns (skip research-phase):
- **Landing page / positioning phase (Phase 1):** Copy/IA/pricing patterns are well-documented consulting-landing-page conventions (CXL, Unbounce, B2B SaaS best practices), cross-referenced across multiple sources — standard execution, not novel technical risk.
- **Visual redesign (Phase 2):** `motion`/`gsap` integration patterns are HIGH-confidence, officially documented (Context7-verified for Motion; GSAP's free-license status independently confirmed) — implementation is a design-judgment exercise, not a technical-research gap.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Context7 + official Next.js docs for MDX/Metadata/OG; npm registry ground-truth for every version; only animation-library tradeoffs (Motion vs. GSAP judgment) are MEDIUM, and that's inherently a taste call, not a fact gap |
| Features | MEDIUM | Consultancy/SaaS landing-page and content patterns are well cross-verified across multiple sources; FDE-specific *solo-practice* examples are scarce (existing FDE web presence is enterprise-only: Deloitte, Fujitsu), so that slice is triangulated from adjacent domains (solo consultants, B2B SaaS, AI automation agencies) rather than directly observed |
| Architecture | HIGH for MDX/metadata APIs (official docs, current); MEDIUM for the Netlify Next.js Runtime v5 rate-limiting compatibility question — explicitly flagged as WebSearch/docs-aggregated, not hands-on verified |
| Pitfalls | MEDIUM-HIGH | Mix of official docs (Anthropic rate-limit scoping), the project's own PROJECT.md/PIVOT-BRIEF.md constraints (HIGH confidence, primary source), and aggregated WebSearch on rebrand-SEO-risk, CWV-vs-conversion, and B2B trust-signal literature (MEDIUM, directionally consistent across sources but not independently audited) |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Netlify-native vs. Upstash rate limiting for the demo route (Architecture Pattern 3):** Unresolved whether Netlify's native `config.rateLimit` can gate a Next.js Runtime v5 (OpenNext) Route Handler directly. Handle by spiking Option A early in the demo phase; fall back to the already-proven Upstash pattern immediately if it doesn't work. Do not treat this as resolved by assumption.
- **Re-ideated demo concept itself is still undecided** ("Open Questions" in PIVOT-BRIEF.md) — whether it's single-turn/structured-output (reuse v1's `@anthropic-ai/sdk` pattern unchanged) or multi-step/agentic (adopt the `ai`/`@ai-sdk/anthropic`/`@ai-sdk/react` stack). This is a product-design decision, not a research gap, but it directly determines which stack path Phase 4 takes — resolve during Phase 4 planning, not before.
- **In-repo MDX vs. alternative content implementation** was flagged as open in PIVOT-BRIEF.md; this research resolves it with a clear recommendation (native `@next/mdx`, not Contentlayer/`next-mdx-remote`) but the roadmapper/planner should treat that recommendation as the default to confirm, not re-litigate from scratch.
- **95%-failure-stat exact framing language** — MEDIUM confidence on the MIT NANDA report's precise scope; re-verify the primary source before finalizing the landing page's citation copy in Phase 1.
- **FDE solo-practice competitive examples are thin** — no direct solo/anonymous FDE consultancy site was found to benchmark against; feature and trust-signal recommendations are triangulated from adjacent domains (solo consulting, B2B SaaS, AI automation agencies) rather than a direct competitor audit. Treat as a reasonable, well-triangulated bet rather than a validated pattern.

## Sources

### Primary (HIGH confidence)
- Next.js official docs — `nextjs.org/docs/app/guides/mdx`, `/mdx-components`, `/generate-sitemaps`, `/guides/json-ld` (fetched 2026-07-20, current as of 2026-06-23) — MDX setup, file conventions, sitemap/JSON-LD patterns
- npm registry (`npm view <pkg> version`, fetched 2026-07-20) — ground-truth current versions for every new package
- Context7 `/websites/motion_dev` — React 19/Next.js App Router installation and RSC compatibility
- Webflow / GreenSock (`webflow.com/updates/gsap-becomes-free`, `gsap.com/pricing`) — GSAP's April 2025 shift to a fully free license, cross-referenced across vendor announcement + independent coverage
- Anthropic Platform Docs — `/docs/en/api/rate-limits` — confirms account/workspace-scoped rate limits and Console spend caps as the correct backstop
- Project's own `.planning/PROJECT.md` and `.planning/PIVOT-BRIEF.md` — primary source for constraints (budget, anonymity, scrapped v1 content, pricing structure)
- Existing codebase inspection (`src/app/*`, `src/config/site.ts`, `sitemap.ts`, `robots.ts`) — ground truth for what's actually built today

### Secondary (MEDIUM confidence)
- Netlify Docs — Next.js on Netlify overview, rate-limiting feature docs (fetched 2026-07-20) — confirms Runtime v5 App Router support and native rate-limiting config, but doesn't resolve OpenNext/Route-Handler compatibility for that feature
- CXL, Unbounce, Flow Agency, SaaS Hero — consulting/B2B SaaS landing-page structure and CTA best practices, cross-referenced across multiple independent sources
- Search Engine Land, Conductor, Whitehat SEO — topic-cluster/pillar-page SEO structure and minimums
- Proofmap, Orange Marketing, XY Planning Network, Umbrex — anonymous-case-study and solo-practitioner trust-signal techniques
- Layer3Labs, Taskip — AI automation agency pricing benchmarks used to validate the <$10k/<$2k pricing as a genuine differentiator
- Sitebulb, Numen Technology, Lantern Digital, Silverback Strategies — rebrand/migration SEO risk patterns
- Excellent Presence (citing Deloitte 2023) — pricing-transparency buyer-preference research
- Wisp CMS + multiple community sources — Contentlayer's unmaintained status since 2024

### Tertiary (LOW confidence)
- HRBrain, Chatarmin, CNAX, eMediaAI (aggregated) — ROI-calculator pattern survey, not deep-dived individually
- "AI-native transformation" as a lower-competition SEO term — unverified ranking-difficulty claim, treated as a reasonable bet not a guarantee
- Refentry, Trajectory Web Design, Square Root SEO — general B2B trust-signal literature applied by inference, not FDE/consultancy-specific

---
*Research completed: 2026-07-20*
*Ready for roadmap: yes*
