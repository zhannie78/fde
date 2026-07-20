# Architecture Research

**Domain:** v2.0 FDE-pivot additions to an existing Next.js 16 App Router marketing site — MDX blog/content engine, redesigned single-page IA, SEO layer, and a re-ideated Claude-backed interactive demo — deployed on Netlify Free via the Next.js Runtime v5
**Researched:** 2026-07-20
**Confidence:** HIGH (Next.js MDX/metadata APIs, verified against official Next.js docs current as of 2026-06-23) / MEDIUM (Netlify Next.js Runtime v5 internals and native rate-limiting compatibility with Route Handlers — WebSearch + Netlify docs, not hands-on verified, flagged explicitly below)

## Standard Architecture

Nothing about this milestone requires a new hosting model, a new deploy target, or a database. It is four additive layers on top of the existing static-first Next.js App Router site: (1) a filesystem-based MDX content layer that compiles to statically-generated blog routes at build time, (2) an IA restructure that collapses the v1 multi-page nav into one long-scroll FDE landing page plus the new `/blog` section, (3) a metadata/structured-data layer (`generateMetadata`, `sitemap.ts`, `robots.ts`, JSON-LD, RSS) that makes the blog discoverable and the buyer-vocabulary SEO strategy machine-readable, and (4) one new server-side Claude proxy surface (same shape as the Phase 2 demo work already scoped in the v1 stack research) sitting behind rate limiting, now re-ideated for the FDE framing rather than missed-call recovery. The content layer is 100% static (no DB, no runtime dependency); the demo layer is the only part of this milestone that touches a paid external API and needs abuse protection.

### System Overview

```
┌───────────────────────────────────────────────────────────────────────────┐
│                             CLIENT (Browser)                                │
│  FDE landing page (/)  │  /blog, /blog/[slug]  │  Demo widget  │  /book     │
└───────┬─────────────────────────┬───────────────────┬────────────┬─────────┘
        │ static HTML (SSG)       │ static HTML (SSG)  │ fetch/stream│ Cal embed
        ▼                         ▼                     ▼            ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                 NETLIFY (Next.js Runtime v5 / OpenNext)                     │
│                                                                              │
│  ┌─────────────────┐  ┌────────────────────┐  ┌──────────────────────────┐│
│  │ Static/SSG pages │  │ MDX build pipeline  │  │ /api/demo/[name]         ││
│  │ (/, /blog/*)      │  │ (@next/mdx, build   │  │ Route Handler            ││
│  │ + sitemap.ts,     │  │  time only — reads  │  │ (Claude proxy)           ││
│  │ robots.ts, RSS    │  │  content/*.mdx)     │  └──────────┬───────────────┘│
│  └──────────────────┘  └──────────┬──────────┘             │                │
│                                    │                         │                │
│                          content/*.mdx files                │                │
│                          (in-repo, git-versioned)            │                │
│                                                              ▼                │
│                                             ┌──────────────────────────────┐│
│                                             │ Rate limit gate               ││
│                                             │ (Netlify native code-based    ││
│                                             │  rule on the /api/demo path,  ││
│                                             │  OR Upstash Redis inside the  ││
│                                             │  handler — see Pattern 3)     ││
│                                             └──────────────┬───────────────┘│
└────────────────────────────────────────────────────────────┼────────────────┘
                                                               ▼
                                                     ┌──────────────────┐
                                                     │ Anthropic         │
                                                     │ Claude API        │
                                                     │ (Haiku, demo)     │
                                                     └──────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|-------------------------|
| FDE landing page (`/`) | Single long-scroll page carrying the 5-part message hierarchy (gap → fix → outcomes → offer → CTA) and the embedded demo | Next.js Server Component, statically generated, composed of section components (mirrors the existing `src/components/sections/*` pattern) |
| MDX content collection | Source of truth for blog posts and anonymized case-study write-ups | `content/blog/*.mdx` files in-repo, each with an `export const metadata = {...}` block (title, date, description, tags, type: "guide" \| "case-study") read via `@next/mdx` |
| `/blog` index route | Lists all posts, supports filtering/tagging by content type for SEO-vocabulary coverage | Server Component; reads `content/blog/` at build time via `fs`/dynamic `import()`, sorts by date |
| `/blog/[slug]` route | Renders one MDX post, generates per-post `<title>`/OG/JSON-LD metadata | Dynamic segment + `generateStaticParams` (full SSG, `dynamicParams = false`) + `generateMetadata` |
| SEO/metadata layer | Machine-readable discoverability: sitemap (incl. blog slugs), robots, RSS feed, JSON-LD `Article`/`Organization` schema, per-page `generateMetadata` using buyer vocabulary | Extends existing `sitemap.ts`/`robots.ts`; new `app/blog/feed.xml/route.ts`; JSON-LD via inline `<script type="application/ld+json">` in layouts/pages |
| Demo widget | Client-side UI for the re-ideated FDE-proof interaction; framed around TIME/EFFICIENCY/PROFIT, not the old missed-call scenario | React Client Component; calls only its own `/api/demo/[name]` route |
| Demo Route Handler | Server-side Claude proxy: validate input, enforce rate limit, call Claude with a fixed system prompt, return/stream result | Next.js Route Handler (`app/api/demo/[name]/route.ts`), Anthropic SDK server-side only |
| Rate limit gate | Abuse/cost protection in front of the one paid-API surface this milestone adds | See Pattern 3 — two viable implementations, confidence-flagged below |
| `siteConfig` | Existing typed constants module — extended with blog/SEO-relevant values (canonical domain, default OG image, social handles if any) | `src/config/site.ts` (already exists; additive, not restructured) |

## Recommended Project Structure

```
content/
└── blog/                       # NEW — MDX source of truth, git-versioned
    ├── what-is-forward-deployed-engineering.mdx
    ├── ai-native-transformation-for-smbs.mdx
    └── case-study-<anonymized-slug>.mdx

src/
├── app/
│   ├── page.tsx                 # REWRITTEN — single FDE landing page (5-part hierarchy)
│   ├── blog/
│   │   ├── page.tsx              # NEW — index/listing, reads content/blog/
│   │   ├── [slug]/
│   │   │   └── page.tsx          # NEW — dynamic import of content/blog/[slug].mdx
│   │   └── feed.xml/
│   │       └── route.ts          # NEW — RSS/Atom feed, same content source
│   ├── book/page.tsx             # KEPT — Cal.com embed, unchanged
│   ├── api/
│   │   └── demo/
│   │       └── [name]/route.ts   # NEW — re-ideated Claude proxy (replaces the
│   │                              #        scrapped missed-call/intake-triage routes)
│   ├── about/                    # REMOVE or fold into `/` — see Pattern 1 rationale
│   ├── services/                 # REMOVE or fold into `/` — see Pattern 1 rationale
│   ├── sitemap.ts                # EXTENDED — add blog slugs dynamically
│   ├── robots.ts                 # UNCHANGED — already points at sitemap.xml
│   └── layout.tsx                # LIGHT EXTEND — add sitewide Organization JSON-LD
├── mdx-components.tsx            # NEW — required by @next/mdx for App Router; maps
│                                  #        MDX elements to styled components (prose,
│                                  #        headings, custom callouts for case studies)
├── lib/
│   ├── content/
│   │   ├── posts.ts               # NEW — reads content/blog/, extracts metadata,
│   │   │                          #        sorts/filters — single place blog + RSS +
│   │   │                          #        sitemap all pull from
│   │   └── json-ld.ts             # NEW — small builder functions for Article/
│   │                              #        Organization schema objects
│   ├── claude/
│   │   ├── client.ts               # NEW — server-only Anthropic SDK instance
│   │   └── prompts/                # NEW — fixed system prompt(s) for the re-ideated demo
│   └── ratelimit.ts                 # NEW — see Pattern 3 (implementation TBD by STACK.md)
├── components/
│   ├── sections/                    # EXTENDED — new sections for gap/fix/outcomes/offer
│   └── blog/                        # NEW — PostCard, PostMeta, TableOfContents, etc.
└── config/
    └── site.ts                      # EXTENDED — add canonical URL, default OG image
```

### Structure Rationale

- **`content/blog/` at the repo root (not under `src/`):** Keeps MDX content visually and organizationally separate from application code — a solo founder writing a case study should not need to touch `src/`. Also makes the git history of content changes easy to scan independently of code changes.
- **`lib/content/posts.ts` as the single read path:** The blog index, the RSS feed, and the sitemap all need the same list of posts with the same metadata. Reading `content/blog/` in three separate places is exactly the kind of duplication a solo maintainer will let drift; one shared module prevents the RSS feed and sitemap from silently disagreeing with what's actually published.
- **`app/api/demo/[name]/route.ts` (dynamic route, not a hardcoded static path):** The old plan had `missed-call/route.ts` and `intake-triage/route.ts` as two separate demo endpoints. Since the demo concept itself is being re-ideated and may end up as one interaction type or several, a dynamic `[name]` segment (or a single fixed route if the new demo concept is singular) avoids over-committing to a route shape before the demo is designed. Collapse to a single fixed-name route once the re-ideated demo concept is locked in phase planning.
- **`about/` and `services/` marked REMOVE or fold:** The pivot brief explicitly scraps the v1 homepage/About/Services IA. A single long-scroll landing page is the dominant, higher-converting pattern for a narrow single-offer consultancy pitch (one CTA: book the free audit) — see Pattern 1. This is a recommendation, not a hard requirement; if phase planning wants a standalone `/about` for the anonymous-founder credibility bio, it's a small addition, not a structural change.
- **`mdx-components.tsx` at project root:** Required file-convention location for `@next/mdx` under the App Router — not optional, the App Router will not resolve MDX without it existing at this path (confirmed via official Next.js docs, HIGH confidence).

## Architectural Patterns

### Pattern 1: Single-Page IA with Content as the SEO Surface (not multi-page silos)

**What:** Instead of separate `/`, `/about`, `/services` pages each carrying a slice of the pitch, the entire 5-part message hierarchy (gap → fix → outcomes → offer → CTA) lives on one page (`/`), and buyer-vocabulary SEO ("AI agents," "automation," "AI-native transformation," "forward-deployed engineer") is carried primarily by the `/blog` content, not by proliferating thin marketing pages that each try to rank for one keyword.
**When to use:** Solo-founder, single-offer consultancies with one primary CTA and no product catalog. This is the correct shape here because the offer itself is not segmented (one audit → one setup fee → one retainer, not a menu of services to compare across pages).
**Trade-offs:** A single page is easier to maintain and gives one strong page more topical authority than several thin ones, but it's a worse fit if the offer later segments (e.g., distinct packages needing their own comparison pages) — revisit if the offer structure changes. Long-scroll pages also need careful in-page anchor navigation/CTAs so a mobile visitor doesn't have to scroll past the whole pitch to find "book a call" (the existing `StickyCtaBar` component already solves this and should be kept).

### Pattern 2: File-Based MDX Content Layer with `export const metadata` (no Contentlayer, no frontmatter parser)

**What:** Blog posts and case studies are `.mdx` files under `content/blog/`, each exporting a `metadata` object directly as JS (title, date, description, tags, type) rather than YAML frontmatter parsed by `gray-matter`. Routes are generated via a dynamic `[slug]` segment using dynamic `import()` + `generateStaticParams`, per Next.js's own documented pattern (not filesystem-routed `.mdx` pages directly in `app/blog/`, which would require one folder per post and complicate the shared index/RSS/sitemap read path).
**When to use:** Low-to-moderate post volume (tens, not thousands, of posts) maintained by one person who is comfortable editing `.mdx` files directly in the repo. This is exactly this project's shape.
**Trade-offs:** **Contentlayer** (the previous default answer for "typed content layer in Next.js") is effectively unmaintained since 2024 — its primary sponsor was acquired by Netlify and the maintainer scaled back to ~1 day/month (MEDIUM confidence, multiple community sources agree). Do not adopt it for new work. **Velite** is the actively-maintained spiritual successor if a schema-validated, typed content pipeline becomes worth the extra dependency — but for this project's expected volume (a handful of guides + case studies), plain `@next/mdx` with `export const metadata` avoids an entire dependency and its build-step integration for a benefit (compile-time schema validation) that isn't load-bearing at this scale. Revisit Velite only if post volume or content-modeling complexity grows materially (e.g., multiple content types with real cross-references).

```typescript
// content/blog/what-is-forward-deployed-engineering.mdx
export const metadata = {
  title: "What Is Forward-Deployed Engineering?",
  date: "2026-08-01",
  description: "...",
  tags: ["forward-deployed engineer", "AI agents"],
  type: "guide",
};

## The gap between AI capability and AI ROI
...
```

```typescript
// app/blog/[slug]/page.tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { default: Post, metadata } = await import(`@/../content/blog/${slug}.mdx`);
  return <Post />; // metadata consumed separately by generateMetadata()
}

export async function generateStaticParams() {
  return getAllPostSlugs(); // lib/content/posts.ts — reads content/blog/ once
}
export const dynamicParams = false;
```

### Pattern 3: Netlify-Native Rate Limiting vs. Upstash Redis for the Demo Route (confidence-flagged decision point)

**What:** The re-ideated demo still needs the same abuse/cost protection the v1 stack research already specified (Claude key never reaches the client; every call rate-limited per visitor). Two viable implementations exist for this milestone, and which one applies cleanly depends on how the Netlify Next.js Runtime v5 (OpenNext-based) exposes Route Handlers as underlying Netlify Functions:

- **Option A — Netlify native code-based rate limiting (MEDIUM confidence, verify early):** Netlify has a first-party rate-limiting feature, explicitly marketed for "rate limiting AI features to avoid surprise costs," available on the Free plan (2 code-based rules per project). It's configured via an exported `config.rateLimit` block (`windowLimit`, `windowSize` up to 180s, `aggregateBy: ["ip","domain"]`, `action: "block"` → HTTP 429) on a Netlify Function or Edge Function file. **The open question:** the Next.js Runtime v5 (OpenNext) bundles all Route Handlers into its own generated Netlify Function(s) — it is not confirmed whether you can attach a `rateLimit` config directly to a Next.js `route.ts` file and have Netlify's post-processing pick it up, or whether it requires a separate, hand-written Netlify Edge Function (in `netlify/edge-functions/`) declared with a matching `path` (e.g. `/api/demo/*`) that gates the request before it reaches the Next.js origin function via `context.next()`. If it works, this is the cheaper option (zero extra vendor, no Redis account) and only costs 1 of the 2 free-plan rule slots.
- **Option B — Upstash Redis + `@upstash/ratelimit` inside the Route Handler (HIGH confidence, proven pattern):** Called explicitly inside `app/api/demo/[name]/route.ts` as the first statement, independent of any Netlify-platform rate-limiting feature. This is the pattern already specified in the existing v1 stack research and is guaranteed to work regardless of how OpenNext structures the underlying functions, because it doesn't depend on Netlify's function/edge-function config plumbing at all — it's just a Redis call from application code.

**When to use:** Attempt Option A first as a build-order spike early in whichever phase builds the demo (cheap to test, saves adding Upstash entirely if it works) — this is exactly the kind of "needs deeper research/validation before committing" item that should be flagged for phase-specific research rather than assumed. Fall back to Option B immediately if Option A's path-matching doesn't reliably gate the Next.js Route Handler.
**Trade-offs:** Option A is simpler (no new vendor/account) but unverified against this specific runtime combination; Option B is one more free-tier account to manage but is a well-established, framework-agnostic pattern that sidesteps all Netlify-Runtime-internals uncertainty. Given the small blast radius of getting this wrong (a demo abuse incident costs API spend, not user data), it's reasonable to spike Option A for an hour and fall back rather than defaulting straight to Option B — but do not ship the demo publicly without confirming *one* of these two is actually gating requests (a rate limiter that silently doesn't attach is worse than not having built one, because it creates false confidence).

```typescript
// Option B fallback — lib/ratelimit.ts (unchanged from v1 stack research)
export const demoRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 s"),
});
```

### Pattern 4: Structured Data + Metadata API for Buyer-Vocabulary SEO

**What:** Every blog post and the landing page carry `generateMetadata`-produced `<title>`/description/OG tags built from the post's own `metadata` export, plus inline JSON-LD (`<script type="application/ld+json">`) for `Article` schema on posts and `Organization`/`ProfessionalService`-style schema sitewide in the root layout. Buyer vocabulary ("AI agents," "automation," "AI-native transformation," "forward-deployed engineer") should appear naturally in post titles/descriptions/body copy, not stuffed into schema alone — schema supplements on-page copy, it doesn't substitute for it.
**When to use:** Always for the blog section (this is the primary SEO surface per Pattern 1) and for the landing page's core metadata.
**Trade-offs:** Minimal — this is pure addition with no runtime cost (all computed at build time for SSG pages). The only discipline required is validating JSON-LD output against Google's Rich Results Test before shipping, since malformed structured data is worse than none (search engines may flag the page).

```tsx
// app/blog/[slug]/page.tsx (excerpt)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { metadata } = await import(`@/../content/blog/${slug}.mdx`);
  return {
    title: metadata.title,
    description: metadata.description,
    openGraph: { title: metadata.title, description: metadata.description, type: "article" },
  };
}
```

## Data Flow

### Content Build Flow (static, no runtime dependency)

```
Founder writes/edits content/blog/<slug>.mdx (git commit)
    ↓
Next.js build: lib/content/posts.ts reads content/blog/ once
    ↓
generateStaticParams() → one static route per slug (SSG, dynamicParams=false)
    ↓
Same read path feeds: /blog index, /blog/feed.xml (RSS), sitemap.ts (blog URLs + lastModified)
    ↓
Deployed as static HTML/XML — zero runtime cost per visitor, cacheable indefinitely at Netlify's edge
```

### Demo Request Flow (the one dynamic, cost-bearing surface in this milestone)

```
Visitor interacts with the re-ideated demo widget (on the landing page)
    ↓
POST /api/demo/[name]
    ↓
Rate limit gate (Pattern 3 — Netlify-native or Upstash) → 429 if exceeded
    ↓ (if allowed)
Claude API call (Haiku, fixed system prompt reflecting the FDE framing) — streamed
    ↓
Response streamed back to widget, rendered live
    ↓
No persistence — same as v1's demo flow, stateless by design
```

### Key Data Flows

1. **Content is entirely build-time; only the demo is request-time.** This milestone adds a lot of new *pages* but only one new *dynamic backend surface*. That asymmetry should drive build order: the content/IA/SEO work is safe to ship incrementally with zero infra risk, while the demo work carries the same "must be rate-limited before going live" constraint the v1 research already flagged for the Phase 2 missed-call demo — that constraint doesn't relax just because the demo concept changed.
2. **Sitemap/RSS/blog-index must share one source of truth (`lib/content/posts.ts`)**, or they will drift out of sync as posts are added — a common failure mode where a new post appears on `/blog` but not in the sitemap because someone forgot to update a second hardcoded list (see the current `src/app/sitemap.ts`, which already hardcodes a `routes` array — this pattern must not be copy-pasted for blog URLs).
3. **`siteConfig.domain` currently holds a placeholder value** (`PLACEHOLDER_DOMAIN.example.invalid`) used to build the sitemap/robots base URL and will directly become the canonical URL / OG base for every new blog page's metadata — this is a shared, already-existing single point of truth and should stay that way rather than hardcoding a domain in the new blog/SEO code.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|---------------------------|
| Current (a handful of posts, low-thousands monthly visitors) | Everything as designed: static MDX build, Netlify Free, demo behind one rate-limit layer. No adjustments needed. |
| Growth (dozens of posts, demo gets shared/goes semi-viral) | Blog: still fine, SSG scales trivially with post count into the hundreds. Demo: this is where the rate-limit choice (Pattern 3) actually gets tested — tighten the window, and if Option A (native) turns out not to be gating correctly, this is the point it will surface as a cost spike, not before. |
| Content-modeling complexity grows (many content types, cross-references, related-posts logic) | Reconsider Velite for schema validation and typed queries — not needed at this milestone's scope, but the natural next step past plain `@next/mdx` if the content layer's ad-hoc `fs`/dynamic-import logic starts feeling brittle. |

### Scaling Priorities

1. **First and only real risk in this milestone: an unrated-limited or silently-non-functional rate limit on the demo route.** Everything else (content, IA, SEO) is static and effectively risk-free from a cost/scaling standpoint.
2. **Second, much smaller: sitemap/RSS drift as content volume grows**, mitigated structurally by Pattern 2's single shared read path — not a runtime risk, just a maintainability one.

## Anti-Patterns

### Anti-Pattern 1: Reaching for Contentlayer

**What people do:** Default to Contentlayer because it was the standard "typed MDX content layer for Next.js" answer as recently as 2024 tutorials.
**Why it's wrong:** Contentlayer has been effectively unmaintained since its primary sponsor (Stackbit) was acquired by Netlify — ironic given this project's own hosting choice — leaving it a single-maintainer side project at ~1 day/month of attention (MEDIUM confidence, consistent across multiple community sources). Adopting an unmaintained content-layer dependency for a solo-maintained project is exactly the kind of risk this project's constraints (solo founder, must be maintainable by one person) exist to avoid.
**Instead:** Plain `@next/mdx` with `export const metadata` (Pattern 2) at this project's post volume; Velite if/when typed schema validation becomes worth the dependency.

### Anti-Pattern 2: Fragmenting the Landing Page into Many Thin SEO Pages

**What people do:** Create a separate page per buyer-vocabulary keyword (`/ai-agents`, `/automation`, `/ai-native-transformation`, `/forward-deployed-engineer`) hoping each ranks independently.
**Why it's wrong:** Thin, near-duplicate marketing pages targeting one keyword each are a well-known low-value SEO pattern in 2026 — they dilute topical authority instead of concentrating it, and multiply the solo founder's maintenance surface for pages that mostly restate the same offer.
**Instead:** One strong landing page (Pattern 1) covering the offer, backed by a genuinely useful `/blog` content engine that naturally uses the buyer vocabulary across multiple substantive posts — this is both better SEO practice and directly matches the project's own framing of content as "the credibility engine, not an afterthought."

### Anti-Pattern 3: Letting the Demo Ship Without Confirming Rate Limiting Actually Attached

**What people do:** Add a rate-limit `config` block or an Upstash call, see it doesn't immediately error, and assume it's working.
**Why it's wrong:** Given the Netlify-native option (Pattern 3, Option A) has unverified compatibility with how the Next.js Runtime v5 exposes Route Handlers, a rate limiter that's configured but not actually intercepting traffic is a silent failure mode — the demo goes live, looks fine in manual testing (one request never trips any limit), and the cost exposure is identical to having no rate limiter at all.
**Instead:** Explicitly test the limiter by exceeding the configured window in a pre-launch check (e.g., script 10 rapid requests, confirm a 429 appears) before the demo route is linked from any public page — this is a five-minute check that closes a real gap.

### Anti-Pattern 4: Duplicating the Post List Across Blog Index, RSS, and Sitemap

**What people do:** Write separate `fs.readdir`/glob logic in `app/blog/page.tsx`, `app/blog/feed.xml/route.ts`, and `app/sitemap.ts`.
**Why it's wrong:** Three independent implementations of "list all blog posts" will drift — a new post appearing on the blog index but missing from the sitemap (or vice versa) is a common, easy-to-miss SEO bug.
**Instead:** One shared `lib/content/posts.ts` module (Pattern 2/Structure Rationale) that all three consume.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|----------------------|-------|
| Anthropic Claude API | Server-side SDK call from the new `/api/demo/[name]` Route Handler only | Same non-negotiable server-side-only pattern as the v1 demo research — carries forward unchanged for the re-ideated demo. Model choice (Haiku for public demo traffic) is a STACK.md decision, not an architecture one. |
| Netlify (Next.js Runtime v5 / OpenNext) | Existing deploy target, unchanged for this milestone — MDX content and new routes deploy the same way existing pages do | The one open integration question is Pattern 3's rate-limiting compatibility — verify early, don't assume |
| Netlify native rate limiting (if Option A works) | Exported `config.rateLimit` on a Netlify Function/Edge Function; free plan allows 2 code-based rules per project | MEDIUM confidence — spike before committing; consumes 1 of 2 free-plan rule slots if adopted |
| Upstash Redis (fallback, if Option A doesn't work) | `@upstash/ratelimit` called inside the Route Handler | HIGH confidence, proven pattern already specified in v1 stack research — zero new architectural risk if reached for |
| Cal.com | Unchanged — existing `/book` embed | No integration changes for this milestone |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|----------------|-------|
| `content/blog/*.mdx` ↔ `lib/content/posts.ts` | Build-time `fs`/dynamic `import()` | Only server-side/build-time code touches the filesystem; never exposed to the client directly |
| `lib/content/posts.ts` ↔ `/blog`, `/blog/[slug]`, `/blog/feed.xml`, `sitemap.ts` | Direct function import, same process, build time | Single source of truth — see Anti-Pattern 4 |
| Demo widget ↔ `/api/demo/[name]` | `fetch`/streaming HTTP | Widget holds no secret; identical boundary shape to the v1 demo research |
| `siteConfig` ↔ everything needing canonical URL/OG defaults | Direct import from `src/config/site.ts` | Already-established pattern (D-06 in existing codebase); extend, don't parallel it |

## Sources

- [Guides: MDX — Next.js Docs](https://nextjs.org/docs/app/guides/mdx) (fetched 2026-07-20, doc `lastUpdated: 2026-06-23`, version 16.2.10) — HIGH confidence, official, current
- [`mdx-components.tsx` file convention — Next.js Docs](https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components) — HIGH confidence, official
- [`generateSitemaps` — Next.js Docs](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps) — HIGH confidence, official
- [Guides: JSON-LD — Next.js Docs](https://nextjs.org/docs/app/guides/json-ld) — HIGH confidence, official
- npm registry (`npm view @next/mdx version`, fetched 2026-07-20) — confirms `@next/mdx@16.2.10` ships in lockstep with `next@16.2.10`, already installed in this project — HIGH confidence
- [ContentLayer has been Abandoned — What are the Alternatives? — Wisp CMS](https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives) — MEDIUM confidence, corroborated by multiple independent community sources (Medium/dub.co migration posts) on Contentlayer's unmaintained status
- [Next.js on Netlify — Netlify Docs](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) (fetched 2026-07-20) — MEDIUM confidence (WebFetch summary of official docs); confirms Route Handlers/Server Actions/streaming/ISR full support, edge "runtime" for SSR actually executes in Node.js not true edge, Middleware runs as Netlify Edge Functions
- [Rate limiting — Netlify Docs](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/) (fetched 2026-07-20) — MEDIUM confidence; confirms code-based rules available on all plans (2 rules/project on Free), config syntax, `windowSize` capped at 180s, per-IP+domain aggregation on Free
- [Introducing Netlify's New Rate Limiting Feature / Rate limiting AI features on Netlify to avoid surprise costs — Netlify Blog](https://www.netlify.com/blog/how-to-rate-limit-ai-features-and-avoid-surprise-costs/) — MEDIUM confidence; directly on-point for this project's demo-cost-protection use case, but does not resolve the OpenNext/Route-Handler compatibility question (flagged in Pattern 3)
- Netlify community/support forum threads on function timeouts (aggregated via WebSearch) — MEDIUM confidence: 10s timeout on Free plan functions, up to 300s for streaming edge responses — consistent with the existing v1 stack research's Netlify choice, no new constraint introduced by this milestone
- Prior project research: `.planning/research/STACK.md`, `.planning/research/ARCHITECTURE.md` (v1, 2026-07-19) — carried-forward patterns (server-side Claude proxy, never-expose-the-key, defense-in-depth rate limiting) re-affirmed rather than re-derived
- Existing codebase inspection (`src/app/*`, `src/config/site.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`) — HIGH confidence, ground truth for what's actually built today

---
*Architecture research for: v2.0 FDE-pivot blog/content engine, IA redesign, SEO layer, and re-ideated Claude-backed demo*
*Researched: 2026-07-20*
