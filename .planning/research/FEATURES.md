# Feature Research

**Domain:** FDE/AI-transformation consultancy marketing site — landing page, content/blog credibility engine, interactive AI demos, for a solo, anonymous, SMB-facing practice
**Researched:** 2026-07-20
**Confidence:** MEDIUM (consultancy/SaaS landing-page and content patterns are well-documented and cross-verified across multiple sources; FDE-specific *solo-practice* website examples are scarce — existing FDE web presence is enterprise consultancies like Deloitte/Fujitsu, not solo/anonymous operators, so that piece is triangulated from adjacent domains: solo consultants, B2B SaaS, and AI automation agencies)

**Note:** This supersedes the v1 (2026-07-19) FEATURES.md, which was written for the pre-pivot positioning (missed-calls pain point, 4-vertical strategy, named-founder trust signals). That research is obsolete per PIVOT-BRIEF.md — this file replaces it for the v2.0 FDE Pivot milestone.

## Feature Landscape

### Area 1 — FDE Landing Page

#### Table Stakes (Visitors Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Single clear hero: outcome-focused headline + subhead naming audience/mechanism + one primary CTA | 57% of page-viewing time is spent above the fold; headlines under ~8 words that name the outcome (not the feature) convert best | LOW | Headline should center TIME/EFFICIENCY/PROFIT or the gap, not "AI agents" jargon — jargon belongs in subhead/body for SEO, not the emotional hook |
| Problem → agitate → solution copy flow (PAS) | Names the visitor's real frustration in their own words before pitching a fix; matches the brief's gap→fix→outcomes→offer→CTA hierarchy almost 1:1 | LOW | The 95%-failure stat is the "agitate" — use it early, with the source cited for credibility |
| One consistent CTA repeated top/mid/bottom ("Book your free audit") | Buyers scan long pages; identical CTA at every scroll depth removes friction and keeps the single conversion goal unambiguous | LOW | Already have Cal.com booking (kept from v1) — reuse, don't add a second conversion path |
| Benefits framed as outcomes, not features | "Fast workflow automation" is a feature; "recover 10 hours a week" is a benefit — visitors answer "what's in it for me," not "what does it do" | LOW | TIME/EFFICIENCY/PROFIT are already the right vocabulary for this |
| Transparent pricing / offer structure visible on the page (not gated behind a call) | B2B buyers self-qualify on price; publishing structure (even ranges) reduces buyer anxiety and filters unqualified leads before they book time | LOW | Offer is already decided: free audit → <$10k setup → <$2k/mo retainer — this is well *below* the $3k–$20k/mo retainer range typical of AI automation agencies (MEDIUM confidence, cross-referenced across 3 pricing-guide sources), so the affordability contrast is a legitimate, provable claim, not just marketing copy |
| Mobile-responsive, fast-loading | B2B research increasingly starts on mobile even when deals close on desktop; page speed affects both conversion and SEO ranking | LOW | Standard Next.js/Tailwind baseline; watch this against the "visually impressive" redesign goal (see Anti-Features) |
| Social proof / trust signal near the CTA | Reduces buyer risk-anxiety at the exact decision point; even without named-client logos, *some* proof element must sit beside the CTA | MEDIUM | This is the hardest table-stake for this project specifically — no clients yet, anonymous positioning rules out headshots/bios. Substitute proof = methodology transparency (how the audit works, step by step), the 95%-stat citation, and process credibility until real anonymized case studies exist |
| Buyer-vocabulary SEO in headings/copy: "AI agents," "automation," "AI-native transformation," "forward-deployed engineer" | These are the literal search terms buyers use; matching visible copy to buyer vocabulary is both an SEO requirement and a comprehension requirement (jargon anchors trust with technical buyers, plain-language outcomes anchor trust with non-technical ones) | LOW | Already specified in PROJECT.md — needs to appear in H1/H2s and meta, not just body copy, to actually move SEO |

#### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| The site itself as proof of craft (visually impressive, distinctive design system) | For a business selling "custom, white-glove" work, a template-looking site directly undercuts the pitch — this is explicitly called out in PROJECT.md/PIVOT-BRIEF.md as a founder priority | MEDIUM–HIGH | Real differentiation risk if under-executed: "visually impressive" is subjective and easy to over-scope solo. Bound it — one strong distinctive element (e.g., a signature visual motif, thoughtful micro-interactions) beats broad novelty everywhere |
| Explicit "worst-case scenario" / conservative framing in the outcomes section | Removes risk for a skeptical buyer — "even in the worst case, you still come out ahead" is a documented pattern in AI ROI tooling for exactly this audience (skeptical SMB owners) | LOW–MEDIUM | Pairs naturally with the free-audit no-commitment framing already in the offer |
| Process/methodology transparency section ("how the audit works," "how an engagement runs") | Substitutes for the trust signals a named founder or client logos would normally provide; makes the anonymous positioning feel deliberate/professional rather than evasive | LOW | Directly mitigates the biggest table-stakes gap (no social proof yet) — treat as near-mandatory, not optional, given the anonymity constraint |

---

### Area 2 — Blog / Content Credibility Engine

#### Table Stakes (Needed at Launch for the Engine to Function)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| One pillar page + a small cluster of supporting posts, not a single "blog" dumping ground | Topic-cluster structure (pillar → cluster, internally linked) is the dominant SEO pattern for building topical authority in 2026; a handful of disconnected posts doesn't build authority the way a structured cluster does | MEDIUM | Recommended minimum for a solo operator at launch: 1 pillar (e.g., "What Forward-Deployed AI Engineering Means for Small Businesses," ~1,500–3,000 words — full 3,000–5,000 is B2B-competitive-topic scale, likely overkill pre-launch) + 3–5 cluster posts answering one specific buyer question each (what is an FDE, what is AI-native transformation, why off-the-shelf AI tools fail SMBs, etc.) |
| Content written to buyer search vocabulary, not internal jargon | Freelancers/consultants commonly fail here — they write about what interests them, not what prospects actually search; the whole point of this content engine is buyer-vocabulary SEO | LOW | Directly reuses the four required terms from PROJECT.md as cluster-post topics/titles |
| Each post answers one specific buyer question and links back to the landing page / audit CTA | Content that doesn't route back to conversion is a blog for its own sake, not a credibility *engine* | LOW | Every post needs a "book your free audit" CTA — this is a lead-gen site, not a personal blog |
| Anonymized engagement write-ups (case-study-style posts) as they accumulate | This is the single highest-value content type name-checked in the pivot brief itself — before/after, quantified outcomes | MEDIUM | None exist at launch ("as they accumulate" — PROJECT.md). Structure the format now (situation → diagnosis → what was built → measured TIME/EFFICIENCY/PROFIT outcome, client anonymized by descriptor e.g. "a 12-person HVAC dispatcher") so the first real engagement slots in without a rework |
| Readable, fast, indexable pages (no gating, no heavy client-side-only rendering) | Gated content (email walls) kills SEO value — the entire purpose here is search visibility and authority, not lead capture through content | LOW | Server-rendered/static MDX pages align with Next.js App Router defaults already in the stack |

#### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Anonymized case studies with specific, quantified before/after numbers | The documented technique for making anonymous case studies still convincing is *compensating* for the missing brand name with richer data (exact percentages, timelines, quotes by job title not name) — this is achievable within the anonymity constraint | MEDIUM | This is where "TIME/EFFICIENCY/PROFIT" outcomes become concrete instead of abstract marketing language — high leverage once even 1 engagement is written up |
| "AI-native transformation" as an owned content pillar (not just a keyword) | This phrase has lower existing competition than "AI agents" or "automation" (broader, more contested terms) — becoming the reference explainer for this specific term is a realistic ranking target for a new site | LOW–MEDIUM | Good candidate for the pillar page itself; unverified ranking-difficulty claim (LOW confidence, not measured directly) — treat as a reasonable bet, not a guarantee |

---

### Area 3 — Interactive AI Demo(s)

#### Table Stakes (For the Demo Concept to Do Its Job)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Demo directly demonstrates the *actual* service (an audit-style diagnosis or a live agent doing real work), not a generic "chat with AI" novelty | v1's scrapped demos (missed-call recovery, intake triage) failed this test by being tied to a specific pain point rather than the FDE process itself; a demo that doesn't map to "what you'd actually get" doesn't move a skeptical buyer | MEDIUM | Re-ideation should center on the audit/diagnosis motion itself — e.g., visitor describes a real repetitive task, the demo (Claude Haiku) responds with a mini "here's where automation fits and roughly what it'd save you" — this mirrors the real deliverable instead of a disconnected use-case toy |
| No signup/email wall to try it | Public demos exist to prove capability before the ask; gating the demo behind a form defeats its purpose and most comparable demo tools are try-first | LOW | Rate-limit and bot-protect (Turnstile) instead of gating — already decided in STACK.md |
| Fast (results in seconds), mobile-friendly, bounded input | Skeptical non-technical visitors abandon slow or confusing tools quickly; the demo needs to feel effortless, not like homework | LOW–MEDIUM | Reuses the already-decided Haiku 4.5 + rate-limit + Turnstile pattern from STACK.md — no new infra decisions needed, only new prompt/output design |
| Visible, believable output tied to the outcomes framing (TIME/EFFICIENCY/PROFIT) | The demo's output should use the same three-outcome vocabulary as the rest of the site, or it feels like a disconnected gimmick | LOW | Cheap to get right, easy to get wrong by accident — enforce via the Zod-validated structured output schema (already decided in STACK.md) |

#### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "Mini-audit" style demo: visitor briefly describes one repetitive task, demo returns a structured mini-diagnosis (where automation fits + rough TIME/EFFICIENCY/PROFIT estimate) | Directly previews the real product (the free audit) rather than an arbitrary use case — very few competitor consultancy sites let a visitor experience a scaled-down version of the actual deliverable before booking anything | MEDIUM | Highest-value re-ideation candidate found in research; low marginal Claude cost per run (Haiku, bounded input/output) fits the $0-recurring / pay-as-you-go constraint |
| Simple client-side ROI calculator (hours/week × hourly cost → annual TIME/PROFIT recovered) as a *second*, zero-marginal-cost proof point | ROI calculators are a well-established pattern for this exact audience (skeptical SMB owners want to see their own numbers, not generic claims); this one needs no Claude API call at all, so it's free to run unlimited times | LOW | Good complement to the Claude-backed mini-audit demo — gives a free, instant, no-rate-limit-needed interaction, then funnels toward the deeper (rate-limited) AI demo or the CTA |
| Optional "worst-case toggle" on the calculator/demo output | Documented technique for defusing skepticism directly — showing that even a conservative/worst-case estimate still nets positive value removes the buyer's main objection | LOW | Cheap addition to either demo; reinforces the anonymous-positioning trust-substitute strategy from Area 1 |

---

### Anti-Features (Commonly Requested, Often Problematic — All Three Areas)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Open-ended "ask me anything about AI" chatbot | Feels like an easy, impressive-looking demo to build | Unbounded input/cost risk against the $0-recurring budget even with rate limiting; doesn't demonstrate FDE-specific value (this is exactly the trap v1's demos fell into — generic capability, not proof of the actual service); increases abuse surface | The bounded "mini-audit" demo (Area 3) — same underlying Claude call pattern, but scoped input and structured output |
| Named founder bio/headshot section for credibility | Founder bios are a default "build trust" move in consulting-site templates | Directly conflicts with the explicit anonymity constraint in PROJECT.md/PIVOT-BRIEF.md ("an experienced FDE," no name or photo) | Process/methodology transparency section + anonymized case studies (Area 1 & 2 differentiators) |
| Gating blog content behind email capture | Feels like it converts content readers into leads | Kills the SEO/authority value that is the entire point of a "credibility engine" — search engines and skeptical readers both distrust gated thought-leadership; also adds an email-nurture system this solo build doesn't need yet | Every post ends with a direct "book your free audit" CTA instead — no intermediate gate |
| Full case-study library / dozens of blog posts at launch | More content feels more credible | Solo-maintainable content velocity is the real constraint — over-committing to volume at launch risks an abandoned-looking blog, which damages credibility worse than a lean one | 1 pillar + 3–5 cluster posts at launch (Area 2 table stakes); add real anonymized case studies as engagements complete, not before |
| Vertical-specific landing pages (home services, medical/dental, legal, real estate) | Was the v1 approach; feels like better-targeted SEO | Explicitly out of scope for v2 — the pivot brief sells FDE horizontally to SMBs, not through vertical wedges; rebuilding vertical pages recreates scope the pivot deliberately cut | Single horizontal FDE landing page + buyer-vocabulary blog content that ranks across verticals |
| Client login portal / dashboard for demo history or audit results | Feels "complete" for a product-style site | No clients yet — this is a marketing/lead-gen site, not a delivery platform; explicitly out of scope in PROJECT.md | Audit results delivered via the existing email pattern (Resend, already decided in STACK.md) |
| Heavy animation/scroll-jacking "impressive" design | Directly requested by the "visually impressive" redesign goal if interpreted too literally | Hurts page speed, mobile UX, and SEO — undermines the "site as proof of craft" goal by making the craft feel like flash instead of substance; also a much larger solo build/maintenance burden | One or two well-executed signature visual/interaction elements rather than pervasive heavy animation (see Area 1 differentiator note) |

## Feature Dependencies

```
[FDE Landing Page: message hierarchy]
    └──requires──> [Pricing/offer content decided] (already resolved — free audit → <$10k → <$2k/mo)
    └──requires──> [Trust-signal substitute copy] (process transparency, since no case studies exist at launch)
    └──enhanced by──> [Blog/content credibility engine] (internal links from landing page to pillar content raise both SEO and on-page depth)
    └──enhanced by──> [Interactive demo(s)] (demo sits within or links from the landing page's "outcomes/offer" section as the proof point)

[Blog / Content Credibility Engine]
    └──requires──> [Buyer-vocabulary keyword decisions] (already resolved — AI agents, automation, AI-native transformation, forward-deployed engineer)
    └──requires──> [Content IA/blog implementation choice] (open question in PIVOT-BRIEF.md — in-repo MDX vs. alternative; must be resolved before any post is written)
    └──enhances──> [FDE Landing Page] (cluster posts capture long-tail buyer searches that a single landing page cannot rank for alone)

[Interactive Demo(s)]
    └──requires──> [Existing Claude API integration pattern] (Route Handler/Server Action proxy, Haiku 4.5, Zod-validated structured output — already decided in STACK.md, carried from v1, reusable as-is)
    └──requires──> [Rate limiting + bot protection] (Upstash + Turnstile — already decided in STACK.md, must ship with any public demo, not after)
    └──conflicts with──> [Open-ended chatbot demo] (see Anti-Features — the bounded/structured approach and an unbounded chatbot are mutually exclusive design choices, not additive)

[Anonymized case-study format]
    └──requires──> [At least 1 completed engagement] (does not exist yet — format can and should be designed now, but content itself is a v1.x addition, not launch-blocking)
```

### Dependency Notes

- **Landing page requires trust-signal substitute copy:** because there are no clients yet and no named founder, the "social proof near CTA" table stake (Area 1) cannot use the default pattern (logos/testimonials) — it must be satisfied by process/methodology transparency instead. This needs to be treated as a first-class content requirement, not a placeholder to fill in later.
- **Blog requires the content IA/implementation decision:** PIVOT-BRIEF.md flags "in-repo MDX vs. anything else" as still open. This blocks any content work and should be resolved early in phase planning — it's infrastructure, not content strategy.
- **Interactive demo requires the existing Claude integration pattern:** this is a genuine dependency on already-completed v1 stack decisions (Haiku, rate limiting, Turnstile, structured output via Zod) — the re-ideation work is about the demo *concept and prompt design*, not new infrastructure. Scope phases accordingly; don't re-litigate the technical pattern.
- **Open-ended chatbot conflicts with the bounded mini-audit demo:** these are alternative designs solving the same "prove AI capability" goal — pick one direction (bounded/structured, per Table Stakes) rather than building both.

## MVP Definition

### Launch With (v1 of the pivot / "v2.0 FDE Pivot" milestone)

- [ ] FDE landing page with full 5-part hierarchy (gap → fix → outcomes → offer → CTA) — this is the core deliverable of the milestone
- [ ] Transparent pricing/offer section (free audit → <$10k setup → <$2k/mo retainer) on the landing page — already-decided content, low complexity to implement
- [ ] Process/methodology transparency section substituting for absent social proof — required given zero case studies + anonymity constraint
- [ ] Buyer-vocabulary SEO applied to landing page headings, meta, and body copy
- [ ] 1 pillar blog post + 3–5 cluster posts covering FDE definition / AI-native transformation / why off-the-shelf tools fail SMBs — minimum viable credibility engine, not a full library
- [ ] Anonymized case-study format/template defined (even with zero posts using it yet) — so the first real engagement slots in without a content-model rework
- [ ] One re-ideated interactive demo: the bounded "mini-audit" concept (Claude Haiku, rate-limited, structured Zod output) mapped to the FDE framing
- [ ] Visual redesign covering at minimum the landing page and blog templates — "the site as proof of craft" is core to this milestone, not deferrable

### Add After Validation (v2.x)

- [ ] Client-side ROI calculator as a second, zero-marginal-cost proof point — add once the primary demo and landing page are validated to be converting, since it's additive rather than foundational
- [ ] Additional blog cluster posts based on early search-performance data
- [ ] First real anonymized case study, once the first engagement completes — triggers filling in the format defined at launch
- [ ] "Worst-case scenario" toggle on demo/calculator output — a refinement of an existing proof point, not a new one

### Future Consideration (v3+)

- [ ] Full case-study library (multiple anonymized engagements) — defer until enough engagements exist; premature with zero clients at pivot time
- [ ] Second demo concept — only justified once there's evidence one demo alone isn't converting well enough to warrant more Claude-API surface area
- [ ] Comparison/positioning content ("FDE consultancy vs. AI agency" style posts) targeting bottom-of-funnel comparison searches — a later-stage SEO play once the pillar/cluster foundation is ranking

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| FDE landing page (5-part hierarchy) | HIGH | MEDIUM | P1 |
| Pricing/offer transparency section | HIGH | LOW | P1 |
| Process-transparency trust substitute | HIGH | LOW | P1 |
| Buyer-vocabulary SEO copy/meta | HIGH | LOW | P1 |
| Pillar + 3–5 cluster blog posts | HIGH | MEDIUM | P1 |
| Case-study format/template (no content yet) | MEDIUM | LOW | P1 |
| Bounded "mini-audit" interactive demo | HIGH | MEDIUM | P1 |
| Visually distinctive redesign (landing + blog templates) | HIGH | HIGH | P1 |
| Client-side ROI calculator | MEDIUM | LOW | P2 |
| First real anonymized case study | HIGH | LOW (content only, once engagement exists) | P2 |
| Worst-case-scenario toggle | LOW–MEDIUM | LOW | P2 |
| Full case-study library | MEDIUM | MEDIUM | P3 |
| Second demo concept | MEDIUM | MEDIUM | P3 |
| Comparison/bottom-funnel content | MEDIUM | LOW | P3 |

**Priority key:**
- P1: Must have for this milestone's launch
- P2: Should have, add once P1 is shipped and validated
- P3: Nice to have, future consideration post-milestone

## Competitor Feature Analysis

| Feature | Enterprise FDE consultancies (Deloitte, Fujitsu FDE+C) | Generic AI automation agencies | AI Deployed (this project) |
|---------|---------------------------------------------------------|----------------------------------|------------------------------|
| Pricing transparency | Not published (enterprise sales-cycle, custom quotes) | Mixed — some publish ranges, many gate behind a call | Fully published: free audit → <$10k → <$2k/mo — this is a genuine differentiator vs. both comparison sets |
| Named team/founder credibility | Named leadership, case studies, logos | Usually named founder(s)/team | Anonymous by design — must be compensated with process transparency + anonymized case studies |
| Interactive proof-of-capability demo | Rare/absent — enterprise sales relies on RFP/pilot process, not public web demos | Occasionally present, usually a generic chatbot widget | Bounded mini-audit demo tied directly to the actual free-audit deliverable — closer to the real product than either comparison set typically offers |
| Content/blog credibility engine | Present but written for enterprise buyers/analysts, not SMB owner-operators | Inconsistent; often thin or absent for smaller agencies | Buyer-vocabulary-targeted, SMB-owner-operator-focused content — underserved niche per the pivot brief's core market thesis |

## Sources

- [Creating a Consulting Landing Page That Turns Visitors Into Clients — Melisa Liberman](https://www.melisaliberman.com/blog/consulting-landing-page) — MEDIUM confidence, consultant-specific landing page structure
- [CXL — How to Build a High-Converting Landing Page: Anatomy, Structure & Design](https://cxl.com/blog/how-to-build-a-high-converting-landing-page/) — MEDIUM confidence, established CRO publication
- [Unbounce — 15 high-converting landing page examples](https://unbounce.com/landing-page-examples/high-converting-landing-pages/) — MEDIUM confidence
- [Flow Agency — High-Performing B2B SaaS Landing Page Best Practices](https://www.flow-agency.com/blog/b2b-saas-landing-page-best-practices/) — MEDIUM confidence, cross-referenced hero/social-proof/CTA findings
- [SaaS Hero — Data-Driven B2B SaaS Landing Page CTA Best Practices](https://www.saashero.net/design/b2b-saas-landing-cta-practices/) — MEDIUM confidence
- [Invisible Tech — What is Forward-Deployed Engineering](https://invisibletech.ai/blog/what-is-forward-deployed-engineering) — HIGH confidence (already the project's own core-thesis source, per PIVOT-BRIEF.md)
- [Deloitte — Forward Deployed Engineering](https://www.deloitte.com/us/en/services/consulting/services/forward-deployed-engineering.html) — MEDIUM confidence, only enterprise FDE web-presence example found
- [Fujitsu Global — Forward deployed engineer + consultant (FDE+C)](https://global.fujitsu/en-global/wayfinders/what-we-do/fde-c) — MEDIUM confidence, second enterprise FDE web-presence example
- [XY Planning Network — The Trust Factor: How Solo Practitioners Can Build Credibility Without Compromising Client Privacy](https://www.xyplanningnetwork.com/advisor-blog/the-trust-factor-how-solo-practitioners-can-build-credibility-without-compromising-client-privacy) — MEDIUM confidence, directly relevant to anonymous-positioning trust-substitute strategy
- [Umbrex — Build a Simple, Credible Online Presence for Trust](https://umbrex.com/resources/how-to-start-your-own-consulting-practice/build-a-simple-credible-online-presence/) — MEDIUM confidence, independent-consultant-specific
- [Proofmap — How to Write Anonymous Case Studies: Template & Best Practices](https://proofmap.com/insights/how-to-write-anonymous-case-studies) — MEDIUM confidence, directly informs the anonymized-case-study format recommendation
- [Orange Marketing — What's In A Name? Writing Compelling Anonymous Case Studies](https://blog.orangemarketing.com/writing-compelling-anonymous-case-studies) — MEDIUM confidence, corroborates the "compensate with data" technique
- [Search Engine Land — The complete guide to topic clusters and pillar pages for SEO](https://searchengineland.com/guide/topic-clusters) — HIGH confidence, established SEO publication, used for pillar/cluster minimums
- [Conductor — Topic Cluster and Pillar Page SEO/AEO Guide](https://www.conductor.com/academy/topic-clusters/) — MEDIUM confidence, cross-referenced cluster-count recommendation (6–15 range across sources)
- [Whitehat SEO — What Is a Pillar Page?](https://whitehat-seo.co.uk/blog/what-is-a-pillar-page) — MEDIUM confidence, pillar length guidance
- [HRBrain, Chatarmin, CNAX, eMediaAI — AI ROI calculator tools (aggregated)](https://www.enrichlabs.ai/free-tools/ai-roi-calculator) — LOW–MEDIUM confidence, WebSearch-aggregated pattern survey, not deep-dived individually; used only to establish the ROI-calculator + worst-case-toggle pattern as real and common for this exact audience
- [Layer3Labs — AI Automation Agency Cost (2026): Real Pricing Guide](https://www.layer3labs.io/roi/ai-automation-agency-cost) — MEDIUM confidence, used to benchmark AI Deployed's <$10k/<$2k pricing against market retainer ranges ($3k–$20k/mo typical)
- [Taskip — AI Automation Agency Pricing: 6 Proven Models for 2026](https://taskip.net/ai-automation-agency-pricing/) — MEDIUM confidence, corroborates pricing-range benchmark
- [Landingi — Lead Magnet Landing Page: Definition, How to Create & 7 Examples](https://landingi.com/landing-page/lead-magnet/) — MEDIUM confidence, free-audit-as-lead-magnet pattern
- Note: no direct Context7/official-docs lookups performed for this research pass — findings are marketing/content/UX pattern research (not library API research), so WebSearch was the primary tool per the mode's guidance; all load-bearing claims above are cross-referenced across 2+ independent sources except where explicitly flagged LOW confidence

---
*Feature research for: FDE consultancy marketing site — v2.0 pivot (landing page, blog credibility engine, interactive demos)*
*Researched: 2026-07-20*
