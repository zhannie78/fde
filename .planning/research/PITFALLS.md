# Pitfalls Research

**Domain:** Repositioning an existing solo-maintained Next.js/Netlify SMB-consultancy marketing site (FDE pivot: new copy/IA, visual redesign, blog/content engine, SEO, re-ideated public Claude demos)
**Researched:** 2026-07-20
**Confidence:** MEDIUM-HIGH (mix of official docs, aggregated WebSearch, and direct inference from PROJECT.md/PIVOT-BRIEF.md constraints)

## Critical Pitfalls

### Pitfall 1: Half-Migrated Positioning (Old and New Framing Coexist)

**What goes wrong:**
The pivot brief explicitly scraps v1's "missed calls / slow follow-ups" pain point, the 4-vertical strategy, and the v1 homepage/About/Services copy — but a mid-flight rewrite of a live site rarely replaces everything atomically. Stray v1 copy, meta descriptions, OG tags, sitemap entries, old demo routes, or vertical-specific pages survive in corners (footer links, old blog stub, cached `/services/medical-dental` route, README/CLAUDE.md references) after the "new" landing page ships. The result: a visitor (or Google) can land on a page that still pitches missed-call recovery for dental practices next to a homepage that pitches forward-deployed engineering — an incoherent, credibility-destroying mix for a site whose entire pitch is "this person understands your business better than a template."

**Why it happens:**
Solo devs (and AI-assisted coding sessions) naturally work page-by-page. Without an explicit inventory of every v1 surface (routes, metadata, sitemap, structured data, internal links, redirect targets), it's easy to ship the new homepage while forgetting `/blog/rss.xml`, `robots.txt` references, or a static OG image still embedded with old messaging.

**How to avoid:**
Before executing the redesign/rewrite phase(s), generate a full inventory of every existing route, metadata field, and content reference (`grep` for old vocabulary: "missed call," "intake triage," "medical," "dental," "legal," "real estate," founder-name remnants if any). Treat this inventory as an explicit checklist item in the phase that ships new copy — not an assumption. Because this is a same-domain, no-URL-change rebrand-in-place (no `*.netlify.app` domain change), there is no redirect-mapping problem — but there is a content-parity problem: every retired route should either redirect to its v2 equivalent or 404/be removed from the sitemap, not silently linger.

**Warning signs:**
`grep -ri "missed call\|intake triage\|dental\|legal\|real estate"` across `app/`, `content/`, `public/` returns hits after the redesign phase claims completion. Sitemap.xml or robots.txt still lists pre-pivot URLs. Old demo API routes (`/api/demo/missed-call`, `/api/demo/intake-triage`) still deployed and reachable.

**Phase to address:**
The phase that ships the new landing page/IA — make "full v1-content grep returns zero unintended hits" an explicit exit criterion, not implicit cleanup.

---

### Pitfall 2: "Visually Impressive" Redesign That Tanks Performance, Accessibility, or Solo-Maintainability

**What goes wrong:**
"The site itself must look like proof of craft" is a legitimate goal, but in practice this bar pushes toward heavy client-side animation libraries (Framer Motion showpieces, WebGL/Three.js hero scenes, scroll-jacking), custom illustration/3D asset pipelines, or bespoke component systems that diverge from shadcn/ui's copy-paste-and-own model. Each of these independently risks: degraded Core Web Vitals (large JS bundles delay Time to Interactive; unoptimized hero media hurts LCP; layout-shifting animations hurt CLS), reduced accessibility (motion-heavy interfaces without `prefers-reduced-motion` handling, low-contrast "editorial" color palettes), and — critical for this project's stated constraint — a design system too bespoke for one person to maintain going forward. A visually loud site that loads slowly or converts worse than a plainer one fails the actual goal: convincing a skeptical SMB owner to book an audit.

**Why it happens:**
"Visually impressive" is measured against portfolio/agency sites, not against conversion or maintenance cost. It's easy to over-index on first-impression wow-factor during a redesign and only discover the performance/conversion regression after launch, when there's no A/B baseline to compare against (this is a from-scratch pivot, not an iterative test).

**How to avoid:**
Set explicit non-negotiable technical budgets before design work starts: Core Web Vitals targets (LCP < 2.5s, CLS < 0.1, INP < 200ms on mobile), a JS bundle budget, and a rule that every animation/interaction respects `prefers-reduced-motion`. Keep shadcn/ui as the component foundation (already a Key Decision to keep the v1 scaffold) and treat "visually impressive" as achieved through typography, motion restraint, whitespace, and a small number of high-craft custom elements (e.g., one hero interaction) — not a systemically bespoke component library. A solo maintainer redesigning a site they already regretted once (the stated dissatisfaction with the v1 build) is at elevated risk of over-correcting toward complexity this time.

**Warning signs:**
Lighthouse/PageSpeed mobile score drops below ~85 after redesign. Bundle analyzer shows a single animation or 3D library adding >100KB gzipped. New components can't be explained/modified without re-reading library docs (signals it's not "owned" the way shadcn/ui components are). No `prefers-reduced-motion` media query present anywhere in the codebase.

**Phase to address:**
The visual redesign phase — bake Core Web Vitals + accessibility checks into that phase's Definition of Done, not a later "polish" phase.

---

### Pitfall 3: Misusing the 95%-Failure Statistic (Sourcing, Scope, and Overclaiming)

**What goes wrong:**
The MIT NANDA "State of AI in Business 2025" report — the actual source behind the "95% of generative AI projects fail to deliver measurable ROI" framing — measured **enterprise generative-AI pilot programs** (300+ initiatives, largely at organizations experimenting with GenAI pilots), not "AI projects" universally and not SMB-specific deployments. Presenting the number on the landing page as a bare, unlinked claim ("95% of AI projects fail") — or worse, implying it was measured for *businesses like the visitor's* — is a credibility risk for a site whose core pitch is "understanding your specific reality, not generic claims." A skeptical SMB owner (or a competitor, or a journalist) who fact-checks the stat and finds it's about enterprise pilots, not SMBs, has a reason to distrust the rest of the site's claims.

**Why it happens:**
The stat is compelling and widely recirculated (Fortune, Forbes, HealthcareITNews all cite it secondhand), which makes it feel like established, safe-to-use common knowledge. The secondary sources rarely carry through the original scope caveats.

**How to avoid:**
Cite the stat with a visible source link (MIT NANDA / "The GenAI Divide: State of AI in Business 2025") directly on the page where it's used, and frame it accurately: "95% of enterprise generative-AI pilots fail to show measurable ROI" — then make the *argument* (not the stat itself) do the work of connecting enterprise findings to the SMB gap: "the same brittle-workflow problem exists in SMBs, worse, because SMBs can't afford the forward-deployed engineering enterprises use to close it." This is a stronger, more defensible narrative than implying the stat itself covers SMBs.

**Warning signs:**
The stat appears on the site with no citation/link. Copy implies "95% of businesses like yours" rather than "95% of enterprise pilots." No fallback framing if a visitor searches the stat and lands on a "well, actually" hot-take article.

**Phase to address:**
The FDE landing page copywriting phase — the message-hierarchy phase where "the gap" is written should include the citation as a requirement, not a nice-to-have.

---

### Pitfall 4: Public Claude-Backed Demo Ships Without Cost/Abuse Controls Because "It's Being Re-Ideated Anyway"

**What goes wrong:**
The v1 STACK.md already establishes the correct pattern (Upstash rate limiting + Turnstile + server-side-only API calls + Console spend caps) for the old missed-call/intake-triage demos. Because those demos are explicitly being scrapped and the *new* demo concept is still undecided ("Open Questions" in PIVOT-BRIEF.md), there's a real risk that the re-ideated demo gets built as a fresh feature and the cost-control scaffolding doesn't get carried over — either because it's assumed the old demo's protections still apply (they don't, if routes/keys change), or because "we'll add rate limiting later" becomes permanent under solo-dev time pressure. Anthropic's account-level rate limits do not protect against a single visitor or bot running up the bill on a public, unauthenticated route — this remains true regardless of what the new demo concept turns out to be.

**Why it happens:**
Re-ideation naturally focuses attention on *what* the demo proves (FDE value), not the operational scaffolding around it; the scaffolding is invisible in a demo of the concept and only matters once it's public and indexed by Google/shared on social media.

**How to avoid:**
Whatever the new demo concept turns out to be, require the same three-layer defense before it goes live on the public site: (1) Turnstile on the demo trigger, (2) Upstash-backed per-IP (and ideally per-email, if a lead-capture gate is used) rate limiting server-side, (3) an Anthropic Console workspace spend cap configured as a hard backstop. Treat this as a phase-level Definition-of-Done item for whichever phase ships the new demo(s) — not something bundled into "polish."

**Warning signs:**
Demo route calls `@anthropic-ai/sdk` with no rate-limit check preceding it. No Upstash Redis / KV dependency present when a live-Claude demo phase is marked complete. No documented Console spend limit set before the demo phase ships to production.

**Phase to address:**
The demo re-ideation/build phase — explicitly gate "demo phase done" on cost-control verification, mirroring the pattern already validated in STACK.md.

---

### Pitfall 5: Blog/MDX Integration Breaks Netlify Deploys or Silently Fails to Build Content

**What goes wrong:**
Adding a blog/content engine to an existing Next.js 16 App Router app on Netlify has several known failure classes: (1) the official `@next/mdx` package expects content colocated under `app/**/page.mdx`, which fights against organizing blog posts as a separate content collection (common workaround: `next-mdx-remote`, which is explicitly flagged unstable with React Server Components as of current docs); (2) MDX is intolerant of stray blank lines inside JSX-like blocks and produces cryptic build errors rather than clear ones; (3) frontmatter (title/date/description used for SEO metadata) isn't handled by Next's MDX package by default and needs a manual convention; (4) Netlify's Next.js Runtime has had App Router edge cases (500s on direct/refreshed URL access) that were fixed in Runtime v5 — using an older/legacy runtime for a *new* content feature on an existing site is a realistic mistake if the Netlify config wasn't touched since v1.

**Why it happens:**
Blog/MDX tutorials mostly target either the Pages Router or a from-scratch Next.js app, not "add a content collection to an existing App Router site with its own layout/design-token system already in place." The seams between "official Next MDX," "content organized outside `app/`," and "frontmatter feeding page `<head>` metadata" are under-documented and each choice has a different Netlify-compatibility profile.

**How to avoid:**
Decide the MDX approach deliberately rather than defaulting to whatever a tutorial shows: `next-mdx-remote` (or `next-mdx-remote-client`, its RSC-stable fork) for content stored in a `/content/blog/*.mdx` directory outside `app/`, read via `fs` at build time, with a small hand-rolled frontmatter-to-metadata mapping (using `generateMetadata`) for SEO. Confirm Netlify is on Next.js Runtime v5 (check `netlify.toml`/plugin version) before adding the content feature — don't inherit v1's config unverified. Test a production build (`netlify build` or a preview deploy) before considering the blog phase complete, since MDX build errors often don't surface in local `next dev`.

**Warning signs:**
`next dev` blog pages render fine but `next build` or the Netlify deploy fails or produces blank content. Frontmatter fields (title, date) show up as literal text in the rendered page instead of being consumed as metadata. Netlify build logs reference an outdated `@netlify/plugin-nextjs` version.

**Phase to address:**
The blog/content-engine phase — verify Netlify production build (not just local dev) as an exit criterion.

---

### Pitfall 6: SEO "Buyer Vocabulary" Requirement Executed as Keyword Stuffing

**What goes wrong:**
The requirement to "explicitly use the vocabulary buyers are searching for: AI agents, automation, AI-native transformation, forward-deployed engineer" is correct strategically, but a literal, mechanical execution (repeating the four phrases verbatim across every page/section to "cover the keywords") reads as unnatural to human visitors and is treated by modern search ranking as a negative quality signal, not a positive one. It also actively undermines the site's core pitch — a site claiming deep, specific understanding of a visitor's business that reads like keyword-stuffed ad copy signals the opposite.

**Why it happens:**
"Use buyer vocabulary throughout" is easy to misread as "insert these exact phrases repeatedly" rather than "write content organized around what buyers are actually trying to figure out (what is an FDE, is this different from generic AI consulting, what would this cost, does this work for a business like mine) using their terms naturally within that content."

**How to avoid:**
Map the four vocabulary terms to buyer *intent* stages rather than sprinkling them everywhere: "forward-deployed engineer" and "AI-native transformation" answer problem-awareness/definition intent (best served by a blog post literally titled around "what is a forward-deployed engineer"); "AI agents" and "automation" answer solution-comparison intent (best served in the outcomes/offer section, describing concretely what gets built). Each term should appear where it's the natural word for the point being made, not as a checklist to satisfy on every page.

**Warning signs:**
Keyword density audit shows the four terms repeated many times per page with no new information added each time. A human read-aloud test of the landing page sounds unnatural or robotic. All four terms cluster in one paragraph rather than being distributed across genuinely relevant sections.

**Phase to address:**
The landing-page-copy and blog-content phases — review copy for natural buyer-intent framing, not keyword-insertion checklist compliance, before marking those phases complete.

---

### Pitfall 7: Anonymous Positioning Undercuts the Trust the Redesign Is Trying to Build

**What goes wrong:**
The project deliberately sells "an experienced FDE" with no name or photo. Generic B2B trust research is consistent that named, verifiable individuals (founder bios, real case studies with attributable metrics, visible credentials) are a primary trust lever, especially for high-consideration purchases like a <$10k custom engagement — exactly the kind of purchase this site is asking a skeptical SMB owner to commit to. Combined with a from-scratch site (no existing reviews/reputation, no domain history — the constraint says no domain purchase for now, staying on `*.netlify.app`) and a bare pricing promise, an anonymous "trust me" pitch has more trust-deficit to overcome than usual, and a purely aesthetic redesign doesn't by itself fix that gap.

**Why it happens:**
Anonymity was chosen deliberately (see Key Decisions) for good reasons the research doesn't need to re-litigate — but it's a real tradeoff, not a free constraint, and a "visually impressive redesign" alone can be mistaken for solving the trust problem when it only solves the aesthetic-credibility problem, not the identity-credibility problem.

**How to avoid:**
Compensate for the anonymity tradeoff with the trust signals that don't require a name: concrete, specific anonymized case studies with real before/after numbers (already planned per PIVOT-BRIEF's "case-study content" open question — prioritize getting at least one real writeup live, even if thin, over a fully polished zero-case-study launch); a specific, credible origin story ("an experienced FDE" should still be concrete about *what* that experience was — e.g., "built forward-deployed AI systems for [type of environment]" without naming employer/self, if that's compatible with the anonymity constraint); transparent, exact pricing (already planned) as a substitute trust signal, since Deloitte-cited research shows buyers reward pricing transparency specifically when other trust signals (identity, reviews) are thin. Do not let the redesign phase treat visual polish as a substitute for these content-level trust signals.

**Warning signs:**
Landing page ships with zero case studies (all "coming soon" placeholders) at the same time as a fully polished visual redesign — signals effort was misallocated toward the wrong trust lever. "An experienced FDE" language stays fully generic with no specific, credible detail anywhere on the site.

**Phase to address:**
Split across the landing-page-copy phase (origin-story specificity, pricing transparency) and the content/case-study phase (at least one real anonymized writeup before/alongside launch, not deferred indefinitely).

---

### Pitfall 8: Pricing Promises ("<$10k setup," "<$2k/mo retainer") Ship as Unconditional Claims

**What goes wrong:**
Publishing specific price ceilings is good for conversion (transparency reduces buyer hesitation, per the pricing-transparency research above) but if the copy states the numbers as flat, unconditional promises ("setup starts under $10k") without any qualifying scope language, the founder has publicly committed to a ceiling before ever scoping a single real engagement. The first prospect whose actual needs exceed $10k either gets an awkward on-call renegotiation (undermines the trust the transparent pricing was supposed to build) or the founder eats the difference to honor the stated number.

**Why it happens:**
"Transparent pricing beats vague pricing" is true and is exactly why this is in the plan — but transparency and unconditional-commitment are different things, and it's easy to collapse them into one when writing conversion-focused offer copy.

**How to avoid:**
Use scope-qualified transparent pricing rather than bare numbers: pair each price with the thing that determines it ("most engagements: one-time setup under $10k, scoped during your free audit" rather than a bare "<$10k" headline number with no context). The free-audit step already in the funnel is the natural place to attach the qualifier — the audit is what determines whether a given business fits the stated range, and the copy should make that link explicit so the number reads as "here's the typical range" rather than "here's a guaranteed ceiling."

**Warning signs:**
Pricing appears as a bare number with no adjoining scope language anywhere on the site (offer section, FAQ, or footer disclaimer). No mechanism (in copy or process) for handling a prospect whose scoped work would exceed the stated range.

**Phase to address:**
The offer/pricing-presentation phase — pair pricing copy with scope-qualifying language as an explicit requirement, not implicit.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|-----------------|------------------|
| Ship redesign with placeholder/lorem-ipsum case studies "for now" | Unblocks launch without waiting on real engagement writeups | Anonymous + no-case-study site has almost no trust signal; visitors bounce before booking | Never past initial soft-launch — replace with at least one real anonymized writeup before actively driving traffic |
| Skip Upstash/Turnstile on the re-ideated demo "since it's just a prototype for now" | Faster to ship the new demo concept for review | A single bot run or shared link can exhaust the Claude budget with no per-visitor cap | Only acceptable if the demo route is never deployed to a public/production URL — not acceptable once the site is live |
| Use `next-mdx-remote` in its known-unstable RSC mode without pinning a tested version | Fewer content-organization constraints than `@next/mdx`'s `app/**/page.mdx` requirement | Silent build breaks on a routine `npm update`, with cryptic MDX error messages | Acceptable if the version is pinned exactly and a production Netlify build is verified in CI before merge |
| Leave v1 copy/routes in place "to redirect later" | Less upfront cleanup work during the rewrite phase | Google indexes and visitors encounter contradictory old/new positioning simultaneously (Pitfall 1) | Never — cleanup should ship in the same phase as the new copy, not deferred |
| Hand-roll a bespoke design system beyond shadcn/ui for "visually impressive" | Stronger initial wow-factor / differentiation | Solo maintainer inherits an unowned, harder-to-modify component layer, directly contradicting the stated maintainability constraint | Only for a small number of hero/signature elements, never as the base component layer |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|-----------------|-------------------|
| Netlify Next.js Runtime (App Router) | Assuming v1's Netlify config is still current/correct for a new content feature; hitting known App Router edge cases (500s on direct URL access) fixed only in Runtime v5 | Verify `@netlify/plugin-nextjs` / Runtime version is v5+ before adding the blog phase; test a production build/preview deploy, not just `next dev` |
| MDX (`next-mdx-remote` or `@next/mdx`) | Choosing based on the first tutorial found rather than compatibility with existing App Router structure and RSC stability status | Deliberately choose `next-mdx-remote`/its RSC-stable fork with content outside `app/`, and hand-roll frontmatter → `generateMetadata` mapping; pin the version |
| Anthropic Claude API (re-ideated demo) | Treating "the old demo's Upstash/Turnstile setup" as automatically inherited by a structurally different new demo | Re-verify rate limiting, Turnstile, and Console spend caps are wired into whatever the new demo's actual routes/keys are before it goes live |
| Cal.com booking (kept from v1) | Assuming the booking embed/link still matches the new CTA copy and offer framing (free audit vs. old CTA wording) without re-checking event-type naming/description | Confirm the Cal.com event type's own name/description reflects "free audit," not leftover v1 language, since Cal.com content isn't part of the Next.js codebase and is easy to forget during a code-focused rewrite |
| Google Search Console / sitemap | Not resubmitting/monitoring after a same-domain but full-IA-change rewrite, assuming "no domain change = no SEO risk" | Even without a domain migration, a full copy/IA rewrite changes what pages rank for what terms — monitor Search Console for indexing/ranking shifts in the weeks after launch, and update `sitemap.xml` to reflect the new/removed routes |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| Unbounded public Claude demo usage | Anthropic Console spend spikes with no per-visitor pattern explaining it | Upstash per-IP/per-email rate limiting + Turnstile + Console spend cap (see Pitfall 4) | Breaks the moment the demo is shared publicly or found by a bot/scraper — not a "scale" threshold, a day-one risk on a $0-recurring-budget project |
| Heavy hero animation/3D asset on the redesigned landing page | Mobile Lighthouse score and LCP regress after redesign ships | Set explicit CWV budgets before design work; test mobile performance on real mid-tier devices, not just desktop dev tools | Immediately on mobile/low-bandwidth visitors — the exact skeptical-SMB-owner audience this site targets is not guaranteed to be on fast connections or new devices |
| Blog content fetched/rendered without static generation | Blog pages slow to load or inconsistent between builds | Use static generation (SSG) for MDX blog posts at build time, not runtime fetch/render, since content changes infrequently and Netlify's free tier favors static output | Breaks noticeably once more than a handful of posts exist and pages are generated dynamically per-request instead of at build |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Re-ideated demo calls Claude directly from a Client Component (repeating a v1-documented anti-pattern in new demo code) | `ANTHROPIC_API_KEY` leaks into the browser bundle, trivially stealable | Server-side Route Handler/Server Action proxy only — re-verify this explicitly for whatever the new demo's architecture turns out to be, don't assume the pattern carries over automatically |
| Turnstile widget present but not verified server-side on the new demo route | Bot traffic bypasses the intended protection entirely while looking protected | Verify the Turnstile token server-side in the Route Handler on every demo submission, not just render the widget client-side |
| Blog content sourced from MDX allows arbitrary component/JS execution if content source isn't fully trusted | Low risk here since content is authored by the founder, but worth confirming no external/user-submitted MDX path exists | Keep MDX sourced only from the repo (founder-authored), never accept external/user-submitted content into the MDX pipeline |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| Message hierarchy (gap → fix → outcomes → offer → CTA) implemented as five disconnected sections rather than a narrative flow | Skeptical visitor reads it as generic marketing-template structure rather than a persuasive argument built for them | Write each section as an explicit continuation of the previous one's claim (the gap sets up why the fix matters; the fix sets up why these specific outcomes follow), reviewed as a single read-through, not five isolated blocks |
| Redesign optimizes for aesthetic novelty over form/CTA clarity | Visitor admires the site but isn't sure what to do next or hesitates on the primary "book the free audit" action | Keep the CTA visually dominant and repeated at natural decision points (after the gap, after the offer) regardless of how visually rich the rest of the page becomes |
| Blog posts written as generic AI-transformation thought leadership disconnected from the specific offer | Visitor reads good content but doesn't connect it back to booking an audit | Every blog post ends with a clear, low-friction link back to the free-audit CTA, and at least some posts are structured around the actual case-study/engagement content that doubles as proof, not just opinion |

## "Looks Done But Isn't" Checklist

- [ ] **New landing page copy:** Often missing removal of all old v1 vocabulary elsewhere on the site — verify with a full-repo grep for retired terms (missed call, intake triage, vertical names) returning zero unintended hits
- [ ] **Redesign:** Often missing a mobile-performance and `prefers-reduced-motion` check — verify Lighthouse mobile score and reduced-motion behavior explicitly, not just desktop visual review
- [ ] **Blog/content engine:** Often missing a verified Netlify *production* build — verify via preview deploy or `netlify build`, since MDX/App Router issues frequently don't surface in `next dev`
- [ ] **Buyer-vocabulary SEO:** Often missing actual `generateMetadata`/structured-data wiring (title tags, meta descriptions, OpenGraph) reflecting the new vocabulary — verify rendered `<head>` output, not just visible body copy
- [ ] **Re-ideated demo:** Often missing the full three-layer defense (Turnstile + Upstash rate limit + Console spend cap) carried over from v1's pattern — verify all three are wired for the new demo's actual routes, not assumed inherited
- [ ] **Pricing/offer section:** Often missing scope-qualifying language next to the price numbers — verify the "<$10k"/"<$2k/mo" figures are paired with "scoped during your free audit" or equivalent, not presented as bare unconditional numbers
- [ ] **95%-stat citation:** Often missing a visible source link/attribution — verify the stat links to or names the MIT NANDA report and is scoped to "enterprise pilots," not stated as a blanket claim

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|----------------|------------------|
| Half-migrated positioning discovered post-launch (Pitfall 1) | LOW | Full-repo grep for old vocabulary, redirect or remove stale routes, resubmit sitemap to Search Console |
| Redesign shipped with CWV/accessibility regressions (Pitfall 2) | MEDIUM | Bundle-analyze to find the largest offenders, replace heavy animation libraries with CSS-only or lighter alternatives, add `prefers-reduced-motion` guards retroactively |
| Public demo ran up unexpected Claude spend (Pitfall 4) | LOW–MEDIUM (bounded by Console spend cap if one was set; unbounded if not) | Immediately set/lower the Console spend cap, add Upstash rate limiting and Turnstile if missing, review Console usage logs to identify the abuse pattern |
| MDX/Netlify build broke in production despite working locally (Pitfall 5) | LOW | Check Netlify build logs for the specific MDX/runtime error, pin dependency versions, verify Runtime v5 plugin version, redeploy from a known-good preview |
| Pricing promise publicly conflicts with a real prospect's scoped needs (Pitfall 8) | MEDIUM (reputational, not technical) | Update copy to add scope-qualifying language immediately; handle the individual prospect conversation transparently rather than silently breaking the stated range |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|--------------------|----------------|
| Half-migrated positioning (old/new coexist) | Landing page / IA rewrite phase | Full-repo grep for retired vocabulary returns zero hits; sitemap reflects only current routes |
| "Visually impressive" redesign hurts performance/maintainability | Visual redesign phase | Lighthouse mobile score, bundle-size budget, `prefers-reduced-motion` present, components remain shadcn/ui-based or minimally bespoke |
| Misused 95%-failure stat | Landing page copywriting (the-gap section) | Stat is linked/attributed and scoped to "enterprise pilots" in the actual rendered copy |
| Public demo ships without cost controls | Demo re-ideation/build phase | Upstash rate limit, Turnstile server-side verification, and Console spend cap all present and tested before production deploy |
| Blog/MDX breaks Netlify production build | Blog/content-engine phase | Netlify preview/production build succeeds (not just `next dev`); frontmatter correctly feeds `generateMetadata` |
| Buyer-vocabulary SEO becomes keyword stuffing | Landing page + blog content phases | Read-aloud/naturalness review of copy; keyword density check shows organic distribution, not clustering |
| Anonymous positioning leaves trust gap the redesign doesn't fix | Landing page copy phase + content/case-study phase | At least one real anonymized case study live before active traffic push; origin-story copy has concrete (if unnamed) specifics |
| Pricing promises ship as unconditional | Offer/pricing-presentation phase | Pricing copy includes scope-qualifying language tied to the free-audit step |

## Sources

- Anthropic Platform Docs — `/docs/en/api/rate-limits` (aggregated via WebSearch, cross-checked against project's existing STACK.md which cites the same doc directly) — HIGH confidence, official, confirms rate limits are token-bucket and account/workspace-scoped, and that Console workspace spend caps are the correct backstop
- MIT NANDA — "The GenAI Divide: State of AI in Business 2025," as reported via Fortune, Forbes, HealthcareITNews, National CIO Review (aggregated via WebSearch) — MEDIUM confidence on exact study scope (enterprise pilots, ~300 initiatives, 150 executive interviews); re-verify against the primary NANDA report before finalizing landing-page citation language
- Sitebulb — "The Silent SEO Killer: Rebrand Migration"; Numen Technology, Lantern Digital, Love at First Search, Silverback Strategies (aggregated via WebSearch) — MEDIUM confidence on rebrand/migration SEO risk figures (1-in-10 migrations improve rankings, average recovery ~523 days); figures vary by source, directionally consistent
- DEV Community, Netlify Docs (`docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/`), GitHub `vercel/next.js` Discussion #58575, Space Jelly, Josh Comeau's blog (aggregated via WebSearch) — MEDIUM confidence on Next.js App Router + MDX + Netlify specifics (Runtime v5 fix, `next-mdx-remote` RSC-instability, MDX blank-line parsing gotcha, `page.mdx` colocation requirement)
- Design Develop Now, NitroPack, Nextfly Web Design, WebifyGO (aggregated via WebSearch) — MEDIUM confidence on redesign-vs-conversion/Core Web Vitals figures (30-40% conversion loss in first month post-redesign, mobile speed-to-conversion correlation); marketing-agency-published figures, directionally credible but not independently audited
- Excellent Presence ("Should I Put Prices on My Website?", citing Deloitte 2023 research on pricing transparency and buyer preference) (aggregated via WebSearch) — MEDIUM confidence, single source for the specific 39%-switch-to-transparent-competitor figure
- Refentry, Trajectory Web Design, Square Root SEO, 321 Web Marketing (aggregated via WebSearch, B2B trust-signal and founder-visibility research) — MEDIUM confidence; general B2B trust literature, not FDE/consultancy-specific, applied here by inference to this project's anonymity constraint
- Project's own `.planning/PROJECT.md` and `.planning/PIVOT-BRIEF.md` — HIGH confidence, primary source for constraints (budget, anonymity, scrapped v1 content, pricing structure)

---
*Pitfalls research for: AI Deployed v2.0 FDE Pivot — repositioning, redesign, blog/content, SEO, re-ideated demos*
*Researched: 2026-07-20*
