# Stack Research

**Domain:** v2.0 FDE Pivot additions — blog/content engine, buyer-vocabulary SEO, visually impressive redesign, re-ideated Claude-backed demos
**Researched:** 2026-07-20
**Confidence:** HIGH (Context7 + official Next.js docs for MDX/Metadata/OG; npm registry ground-truth for all versions; MEDIUM on animation-library judgment calls, which are inherently opinion/taste-dependent)

**Scope note:** This document covers only what's *new* for v2. Already-validated and unchanged from v1 (not re-researched here): Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui, Netlify free-tier deploy (Next.js Runtime v5), Cal.com booking embed, `@anthropic-ai/sdk` server-side pattern, Upstash rate limiting, Cloudflare Turnstile, Resend/react-email, Supabase persistence, Zod validation. That layer is captured in `CLAUDE.md` (project instructions) from v1's research.

## Recommended Stack

### Core Technologies (New for v2)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@next/mdx` + `@mdx-js/loader` + `@mdx-js/react` + `@types/mdx` | 16.2.10 (tracks Next.js release) | Blog/content engine — MDX pages under `app/blog/` | Official Next.js team package, zero extra content-pipeline infrastructure. Frontmatter-as-JS-export (`export const metadata = {...}` inside the `.mdx` file) is read directly by a `page.tsx` that imports the file, so a blog index can enumerate posts with plain `fs`/`globby` — no database, no build-time content compiler, nothing extra for a solo maintainer to keep patched. Fully compatible with Server Components (the App Router default), so blog posts ship zero client JS by default. Contentlayer, the historical alternative, was archived in 2024 and is no longer safe to adopt new. |
| `motion` (npm package name for what was "Framer Motion") | 12.42.2 | Component-level animation — hero reveals, hover states, page/section transitions, scroll-triggered fade-ins via `whileInView` | Purpose-built for React, smallest-footprint option for "make the site feel considered" without committing to a full animation-engine dependency. Ships an App-Router-specific import (`motion/react-client`) that trims client JS further. This is the right default for *most* of the redesign's interactivity — reach for GSAP only for the specific sections that need timeline-precision scroll choreography (see Stack Patterns below). |
| GSAP core + `ScrollTrigger` + `@gsap/react` | gsap 3.15.0, @gsap/react 2.1.2 | Scroll-driven storytelling for the landing page's 5-part message hierarchy (gap → fix → outcomes → offer → CTA), if the redesign wants a cinematic scrollytelling hero or pinned/scrubbed sections | As of April 2025, Webflow (which acquired GreenSock in Oct 2024) made **100% of GSAP free** — every plugin that used to require a paid "Club GSAP" membership (ScrollTrigger, SplitText, MorphSVG, ScrollSmoother, DrawSVG) now ships with no license key, no auth token, no cost. This directly matches the $0-recurring-budget constraint — a capability that used to have a price tag is now free, and a lot of tutorials/articles predating April 2025 still say otherwise, so don't be misled by older sources. GSAP + ScrollTrigger is the de facto industry-standard combo for "pin a section, scrub a multi-step timeline as the user scrolls" — exactly what a gap→fix→outcomes narrative section wants. `@gsap/react`'s `useGSAP()` hook handles React 19 effect cleanup correctly (context reversion on unmount), which raw GSAP does not do for you. |
| `next/font` (built into `next`, no separate install) | ships with next@16.2.10 | Self-hosted, zero-CLS Google/local fonts for the redesign's new typography | Not a new dependency — already part of the kept Next.js scaffold — but worth calling out explicitly for the redesign: `next/font/google` downloads and self-hosts font files at build time (no runtime request to Google, no layout shift, no separate font CDN to pay for), which fits both "visually impressive" and "$0 recurring budget." Use variable fonts where available to keep weight-switching cheap. |
| `next/og` (`ImageResponse`, built into `next`, no separate install) | ships with next@16.2.10 | Per-route Open Graph / Twitter-card images — one per blog post, one for the FDE landing page | Built into Next.js App Router; `@vercel/og` is bundled in and does not need a separate `npm install`. Drop an `opengraph-image.tsx` (or a dynamic `[slug]/opengraph-image.tsx`) in any route segment and Next.js auto-generates the image and injects the `og:image` meta tags — no manual `<meta>` wiring, no third-party image-generation service, no cost. Directly serves the "buyer-vocabulary SEO" requirement: every blog post and the landing page get a real, on-brand social preview instead of a default screenshot. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `remark-gfm` | 4.0.1 | GitHub-Flavored-Markdown support (tables, strikethrough, task lists) in MDX plugin pipeline | Add to `@next/mdx`'s `remarkPlugins` config if blog posts need tables or checklists (likely for engagement write-ups with before/after metrics tables). |
| `rehype-slug` + `rehype-autolink-headings` | 6.0.0 / 7.1.0 | Auto-generate `id` attributes on headings + anchor links | Standard for a content/blog engine — lets you deep-link to a section of a long-form post (e.g., a specific case-study outcome), which is good for SEO and good for sharing a specific claim. Cheap to add via `rehypePlugins`. |
| `@tailwindcss/typography` | 0.5.20 | `prose` class for styling MDX-rendered HTML | The official pairing for `@next/mdx` + Tailwind — apply `prose` classes in a shared blog layout instead of hand-styling every markdown-generated `<h2>`/`<ul>`/`<blockquote>`. Saves real time for a solo maintainer writing content regularly. |
| `reading-time` | 1.5.0 | Computes estimated read time from post body text | Small, standard credibility-engine touch ("6 min read") for blog index/detail pages; negligible cost to add. |
| `schema-dts` | 2.0.0 | TypeScript types for JSON-LD structured data (Google's own schema types package) | Use when hand-writing `<script type="application/ld+json">` blocks for `Organization`/`Service`/`Article`/`FAQPage` schema — types-only (zero runtime weight), catches typos in schema property names at compile time. Directly supports buyer-vocabulary SEO: structured data is where you can explicitly mark up "AI agents," "automation," "forward-deployed engineer" in a way search engines parse as entities, not just body copy. |
| `feed` | 6.0.0 | RSS/Atom/JSON feed generation | Optional but cheap: a `app/blog/feed.xml/route.ts` Route Handler using this package gives the content engine an RSS feed, which some SMB-owner audiences (and any journalist/newsletter picking up a case study) still consume via feed readers. Low effort, reinforces "credibility engine" framing. |
| `lenis` | 1.3.25 | Smooth/inertia scrolling | Only add if the redesign specifically wants buttery inertia scroll to pair with GSAP ScrollTrigger scrubbing — it is the standard pairing (GSAP's own docs recommend it over the deprecated `ScrollSmoother`-only approach for this). **Caution:** smooth-scroll libraries are a common accessibility and Core Web Vitals pitfall. Always gate behind `prefers-reduced-motion: no-preference` and don't let it hijack scroll on the blog/content pages, only the landing-page hero if used at all. |
| `ai` (Vercel AI SDK) + `@ai-sdk/anthropic` + `@ai-sdk/react` | 7.0.31 / 4.0.16 / 4.0.34 | Streaming, multi-step, tool-call-visible chat/agent UI for the re-ideated demo(s) | **Upgraded from "optional" (v1) to primary recommendation for v2.** The FDE pitch is literally "watch an engineer's AI agent work inside your actual workflow" — a demo that *shows its steps* (tool calls, intermediate reasoning, streamed output token-by-token) sells that story far better than a single request/response card. `useChat`/`useObject` from `@ai-sdk/react` combined with `@ai-sdk/anthropic`'s streaming provider is the standard 2026 pattern for this; render every `part.type` (`text`, `tool-call`, `tool-result`, `reasoning`) explicitly in the UI — the default renderer only shows `text`, so an unhandled `tool-call` part looks like the demo silently froze. This is a meaningful new client-side dependency, so only pull it in if the re-ideated demo concept is actually multi-step/agentic; for a single structured-JSON-output demo (closer to v1's shape), stay with the plain `@anthropic-ai/sdk` Route Handler pattern already validated in v1 and skip this entirely. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Native `app/sitemap.ts` + `app/robots.ts` (Next.js file convention, no package) | Sitemap and robots.txt generation | Do not add the `next-sitemap` npm package — Next.js 16's App Router has this built in as a Metadata Route file convention (`sitemap.ts` exporting `MetadataRoute.Sitemap`, served automatically at `/sitemap.xml`). Enumerate blog posts dynamically here (read the same `fs`/`globby` post list used for the blog index) so new posts appear in the sitemap without a manual step — matches "buyer-vocabulary SEO" and is zero extra dependency. |
| Next.js `generateMetadata` / static `metadata` export (built-in) | Per-page `<title>`, `<meta description>`, canonical URL, Open Graph tags | Set `metadataBase` once in the root layout so every relative OG/canonical URL across the new landing page and blog posts resolves correctly without hardcoding the domain in every file — important since the domain is still `*.netlify.app` for now and will change later; one config point to update. |

## Installation

```bash
# Blog/content engine
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
npm install remark-gfm rehype-slug rehype-autolink-headings reading-time feed
npm install @tailwindcss/typography

# SEO structured data
npm install schema-dts

# Redesign — animation (add incrementally, see Stack Patterns)
npm install motion
npm install gsap @gsap/react   # only if scroll-choreographed sections are built
npm install lenis              # only if paired with GSAP for hero smooth-scroll

# Re-ideated demo — only if the demo concept is multi-step/agentic
npm install ai @ai-sdk/anthropic @ai-sdk/react

# No install needed (built into next@16.2.10, already in the kept scaffold):
# next/font, next/og (ImageResponse), app/sitemap.ts, app/robots.ts, generateMetadata
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| `@next/mdx` (native, file-based) | `velite` | If you want a Contentlayer-style typed content pipeline with schema validation across many content collections (blog + case studies + changelog, etc.) with generated TypeScript types. For a single blog collection maintained by one person, native `@next/mdx` is less machinery; reach for Velite only if the content model grows past "one folder of MDX posts." |
| `@next/mdx` (native, file-based) | `next-mdx-remote` / `next-mdx-remote-client` | If MDX content needs to be fetched from a remote source at request time (e.g., a headless CMS) rather than living in the repo. Not applicable here — the pivot brief explicitly favors in-repo MDX for solo-maintainability. |
| `@next/mdx` (native, file-based) | Contentlayer / Contentlayer2 | Do not adopt for a new project — original Contentlayer is archived/unmaintained (last real activity 2024); Contentlayer2 is a community fork with smaller reputation and adds a build-time codegen step that's one more thing to debug alone. Only relevant if migrating an *existing* Contentlayer site. |
| Motion for UI, GSAP for scroll-storytelling (both, scoped to purpose) | GSAP for everything | If you want one animation mental model everywhere and don't mind GSAP's more imperative API for simple hover/tap micro-interactions too. Valid choice, but Motion's declarative `whileHover`/`whileTap`/`whileInView` props are less code for the high-frequency small interactions a marketing site has many of. |
| Motion for UI, GSAP for scroll-storytelling (both, scoped to purpose) | Motion only, skip GSAP entirely | If the redesign's ambition is "polished and tasteful" rather than "cinematic scrollytelling." Motion's `whileInView` + `useScroll`/`useTransform` hooks can do basic scroll-linked reveals without adding a second library. Simpler dependency footprint for a solo maintainer — legitimate default if the founder doesn't want to invest design time in a pinned/scrubbed hero sequence. |
| `ai` SDK for the re-ideated demo | Plain `@anthropic-ai/sdk` streaming (as in v1) | If the re-ideated demo concept turns out to be a single-turn, structured-JSON-output experience (closer to v1's audit-drafting pattern) rather than a visibly multi-step agent. Keeps the dependency surface identical to what v1 already validated — no new library to learn or maintain. |
| Native `app/sitemap.ts` | `next-sitemap` package | Only relevant for the Pages Router or very large sites needing sitemap index splitting across thousands of URLs — not applicable at this project's scale. |
| `next/og` `ImageResponse` (built-in) | Standalone `@vercel/og` install, or a third-party OG-image-as-a-service | Never for this project — `@vercel/og` is already bundled inside `next`, and an external OG-image service adds a network dependency and, often, a paid tier for a capability that's free and built in. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| Contentlayer (original) | Archived, unmaintained since 2024; adopting it new means inheriting an abandoned build-time codegen dependency with no security/compat updates going forward | `@next/mdx` (native) or Velite if a typed multi-collection pipeline is truly needed |
| `next-sitemap` npm package | Duplicates functionality Next.js 16's App Router ships natively via the `app/sitemap.ts` file convention; adds a postbuild step and a dependency for something that's a zero-dependency built-in | Native `app/sitemap.ts` / `app/robots.ts` |
| Standalone `@vercel/og` install | Already bundled into `next` as `next/og`; installing it separately risks a version mismatch with the one Next.js expects internally | `import { ImageResponse } from 'next/og'` |
| Scroll-jacking (GSAP `ScrollSmoother`/Lenis) applied site-wide, including blog/content pages | Smooth-scroll and scroll-pinning libraries are a well-documented accessibility hazard (breaks native scroll behavior for screen-reader and keyboard users, fights `prefers-reduced-motion`, mobile momentum scroll) and a Core Web Vitals risk if not lazy-loaded; content/blog pages in particular gain nothing from it and lose scannability | Scope any scroll-driven library strictly to the landing-page hero/narrative section, gate behind `prefers-reduced-motion: no-preference`, and leave blog/content pages as plain native scroll |
| Old GSAP tutorials/blog posts referencing "Club GSAP" membership or license tokens for ScrollTrigger/SplitText | Predate the April 2025 Webflow acquisition that made all plugins free; following a pre-2025 guide may lead you to add unnecessary license-key config that no longer exists | Current GSAP docs (gsap.com) — no membership, no token, `npm install gsap` gets everything |
| Rendering `useChat`'s default UI without explicitly handling `tool-call`/`tool-result`/`reasoning` part types | The default renderer only shows `text` parts; when the model pauses to call a tool, the UI shows nothing and the demo looks frozen to a skeptical, non-technical visitor — the worst possible failure mode for a demo whose entire job is building trust | Explicitly switch on all `part.type` values in the render loop and show a visible "agent is doing X" state for tool calls |

## Stack Patterns by Variant

**If the redesign scope is "polished and tasteful" (default, lower-risk):**
- Use Motion alone for hero reveals, hover states, and `whileInView` scroll fades
- Skip GSAP and Lenis entirely
- Because it's the smaller dependency footprint and faster to build/maintain solo — reach for the heavier scrollytelling stack only if the founder specifically wants a cinematic, timeline-choreographed hero

**If the redesign scope is "cinematic scrollytelling landing page" (higher visual ambition, matches "site itself is proof of craft"):**
- Add `gsap` + `ScrollTrigger` + `@gsap/react` for the 5-part message-hierarchy scroll narrative, optionally `lenis` for inertia scroll
- Because GSAP+ScrollTrigger is the industry-standard tool for pinned/scrubbed multi-step scroll sequences and, since April 2025, costs nothing — but budget real design/QA time for `prefers-reduced-motion` fallbacks and mobile scroll testing, since this is the highest-pitfall-risk part of the redesign

**If the re-ideated demo is single-turn / structured-output (closer to v1's shape):**
- Reuse the already-validated `@anthropic-ai/sdk` Route Handler + Zod-schema-forced-tool-use pattern from v1 unchanged
- Because it's proven, and adding the `ai` SDK for a non-streaming, non-multi-step demo is unjustified extra surface area for a solo maintainer

**If the re-ideated demo is multi-step / visibly agentic ("watch the agent work" — the stronger fit for FDE positioning):**
- Use `ai` + `@ai-sdk/anthropic` + `@ai-sdk/react` (`useChat` or `useObject`) with explicit UI for every streamed part type
- Because the FDE narrative's differentiator *is* proximity/process visibility — a demo that only shows a final answer undersells the pitch that this consultancy embeds in and exposes real workflow steps

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| `@next/mdx@16.2.10` | `next@16.2.10` | Versioned in lockstep with Next.js core — install whatever version `npm install @next/mdx` resolves against the project's installed `next` version rather than pinning independently. |
| `@next/mdx` + Turbopack | remark/rehype plugins passed as **strings** (e.g., `'remark-gfm'`), not function references | Turbopack (Next.js 16's default dev/build engine) can't pass JS functions to its Rust plugin pipeline; plugins without serializable string-based config aren't usable yet under Turbopack. Confirmed in official Next.js MDX guide (fetched 2026-07-20, doc dated 2026-06-23). |
| `motion@12.x` | `react@19.x` (App Router, Server Components) | Any file importing `motion` must be a Client Component (`"use client"`), or import from `motion/react-client` instead of `motion/react` to shrink the client bundle. Confirmed via Context7 (`/websites/motion_dev`, React 19/Next.js App Router installation docs). |
| `gsap@3.15.0` + `@gsap/react@2.1.2` | `react@19.x` | Use the `useGSAP()` hook from `@gsap/react` (not raw `useEffect`) for any GSAP animation inside a component — it handles context cleanup correctly on unmount/Strict Mode re-render, which matters for React 19's stricter effect behavior. |
| `ai@7.x` | `@ai-sdk/anthropic@4.x`, `@ai-sdk/react@4.x` | These three move together as one SDK family; check that all three are on compatible majors when upgrading — the AI SDK's provider-package versioning has moved fast through 2025–2026, so pin and upgrade them as a set rather than individually. |
| `@tailwindcss/typography@0.5.20` | `tailwindcss@4.x` | Already-compatible with the kept Tailwind CSS 4 scaffold; add via the CSS-first `@plugin` directive in `globals.css` (v4 pattern) rather than a `tailwind.config.js` `plugins` array. |

## Sources

- Context7 `/websites/motion_dev` — React 19 / Next.js App Router installation, RSC compatibility — HIGH confidence
- Next.js official docs — `nextjs.org/docs/app/guides/mdx` (fetched 2026-07-20, doc `lastUpdated: 2026-06-23`, `version: 16.2.10`) — HIGH confidence, direct fetch, covers `@next/mdx` setup, frontmatter-as-export pattern, Turbopack plugin string requirement
- Next.js official docs — `nextjs.org/docs/app/getting-started/metadata-and-og-images`, `nextjs.org/docs/app/api-reference/functions/image-response` (aggregated via WebSearch, cross-referenced) — MEDIUM-HIGH confidence; `next/og` bundling and `opengraph-image.tsx` file convention consistent across multiple sources
- npm registry (`npm view <pkg> version`, fetched 2026-07-20) — HIGH confidence, ground-truth current published versions for every package listed
- Webflow / GreenSock — `webflow.com/updates/gsap-becomes-free`, GSAP `gsap.com/pricing` (aggregated via WebSearch, cross-referenced across Webflow's own announcement, GSAP's pricing page, and multiple independent write-ups) — HIGH confidence on the free-plugin-license claim; consistent across the vendor's own announcement and third-party coverage
- WebSearch (aggregated, multiple sources) — Motion vs. GSAP tradeoffs for marketing-site scroll animation — MEDIUM confidence, judgment-based rather than a hard technical fact; treated as informed opinion, not asserted as settled truth
- WebSearch (aggregated) — Vercel AI SDK streaming, `useChat` part-type rendering pitfall (tool calls appearing "frozen" if unhandled) — MEDIUM confidence; consistent across several dev-focused sources, worth spot-checking against `ai-sdk.dev` docs directly at implementation time given how fast this SDK has moved through majors in 2025–2026
- Contentlayer archival status — WebSearch aggregated (multiple sources describing 2024 archival and the Contentlayer2 community fork) — MEDIUM confidence

---
*Stack research for: AI Deployed v2.0 FDE Pivot — blog/content engine, SEO, visual redesign, re-ideated demos*
*Researched: 2026-07-20*
