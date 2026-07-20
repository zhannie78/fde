# Roadmap: AI Deployed

## Milestones

- 🚫 **v1.0 Marketing Foundation** - Phases 1-4 (superseded mid-execution by the v2.0 FDE pivot — see PROJECT.md Context)
- 🚧 **v2.0 FDE Pivot** - Phases 5-8 (in progress)

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)
- v2.0 continues numbering from v1.0's last phase (4) — starts at Phase 5

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>🚫 v1.0 Marketing Foundation (Phases 1-4) - SUPERSEDED 2026-07-20</summary>

Old missed-call-recovery / vertical-strategy positioning. Phase 1 (Marketing Foundation) was 5/6 plans complete when the FDE pivot superseded it; Phases 2-4 never started. Reusable groundwork (Netlify config, Cal.com booking, design-token scaffold, GSD infra) carries forward into v2.0 per PROJECT.md "Kept from v1." Full detail preserved in git history.

- [x] **Phase 1: Marketing Foundation** - 5/6 plans complete, superseded before Plan 01-06 (launch checklist) finished
- [ ] **Phase 2: Missed-Call Demo & Secure AI Infrastructure** - Not started; concept scrapped (missed-call demo out of scope for v2.0)
- [ ] **Phase 3: Workflow Audit Funnel** - Not started; deferred, not part of v2.0 scope
- [ ] **Phase 4: Vertical-Aware Landing Pages** - Not started; vertical strategy scrapped for v2.0

</details>

### 🚧 v2.0 FDE Pivot (In Progress)

**Milestone Goal:** Reposition AI Deployed around forward-deployed AI engineering for SMBs — new messaging and IA, a visually impressive redesign, a blog/content engine, and buyer-vocabulary SEO, with a client-side ROI calculator as the interactive proof.

- [x] **Phase 5: FDE Landing Page** - Visitor understands the gap/fix/outcomes/offer, sees transparent pricing, can book the free audit, and can run the ROI calculator (completed 2026-07-20)
- [ ] **Phase 6: Visual Redesign** - Site carries a new, distinctive, high-craft visual system with scroll-driven storytelling that performs and is accessible
- [ ] **Phase 7: Blog / Content Engine** - Visitor can read pillar/cluster content that builds credibility and funnels back to the audit CTA
- [ ] **Phase 8: SEO & Metadata Layer** - Site is discoverable and shareable, with buyer-vocabulary reinforced across search/social surfaces

## Phase Details

### Phase 5: FDE Landing Page

**Goal**: A skeptical SMB owner-operator lands on the site, moves through the gap → fix → outcomes → offer → CTA hierarchy, sees transparent scope-qualified pricing, can book the free audit at any scroll depth, and can run a client-side ROI calculator that reinforces the TIME/EFFICIENCY/PROFIT vocabulary — with zero surviving v1 positioning anywhere on the site.
**Depends on**: Nothing (first phase of v2.0; supersedes v1 Phase 1's copy/IA, keeps its Netlify/Cal.com/design-token groundwork)
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06, PROOF-02, PROOF-03
**Success Criteria** (what must be TRUE):

  1. Visitor scrolling the page encounters the gap (95%-failure stat, properly sourced) → fix (forward-deployed engineering) → outcomes (TIME/EFFICIENCY/PROFIT, including worst-case/conservative framing) → offer (free audit → <$10k setup → <$2k/mo retainer, scope-qualified) → CTA, in that order
  2. Visitor can click a "book the free audit" CTA at top, middle, and bottom scroll depth and reach the Cal.com booking flow
  3. Visitor sees a step-by-step process-transparency section near the CTA explaining how the audit and engagement work
  4. Visitor can enter hours/week and hourly cost into a client-side ROI calculator with no signup and no API cost, and see TIME/EFFICIENCY/PROFIT-framed annual hours/dollars-recovered results that route back to the audit CTA
  5. A full-repo grep for retired v1 vocabulary (missed-call, intake triage, vertical pages) and routes returns zero matches in shipped copy, routes, and metadata

**Plans**: 6 plans in 3 waves
Plans:
**Wave 1**

- [x] 05-01-PLAN.md — Hero (gap) + TheFix (fix) sections
- [x] 05-02-PLAN.md — Outcomes (TIME/EFFICIENCY/PROFIT + worst-case) + Offer (scope-qualified pricing)
- [x] 05-03-PLAN.md — Client-side ROI calculator (PROOF-02/03)
- [x] 05-04-PLAN.md — ProcessTransparency + FinalCta (dark-band, bottom CTA)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 05-05-PLAN.md — page.tsx integration (locked order) + v1 section teardown

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 05-06-PLAN.md — Route/nav/anonymity teardown + LAND-06 grep gate

**UI hint**: yes

### Phase 6: Visual Redesign

**Goal**: The site carries a new, distinctive design direction that is itself proof of craft — the landing page's 5-part narrative is choreographed as a scroll-driven story, motion respects accessibility preferences, and performance holds up on mobile.
**Depends on**: Phase 5 (restyles locked copy/IA rather than content that's about to change)
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05
**Success Criteria** (what must be TRUE):

  1. Visitor sees a new, distinctive design direction (tokens, typography, layout) applied consistently across the landing page and blog templates, replacing the v1 visual system
  2. Visitor scrolling the landing page experiences the 5-part narrative choreographed as a scroll-driven story (GSAP ScrollTrigger effects tied to scroll position)
  3. Visitor with `prefers-reduced-motion` enabled sees a fully readable static version of the page with no scroll/motion effects
  4. Visitor on mobile experiences the redesigned pages meeting Core Web Vitals budgets (LCP <2.5s, CLS <0.1, INP <200ms) despite the animation layer
  5. Visitor can view the founder's name, photo, and bio on a new `/about` page (DSGN-05 — reverses the Phase 5 anonymity constraint per validated sketch findings, confirmed by user 2026-07-20)

**Plans**: 7 plans in 4 waves
Plans:

**Wave 1**

- [x] 06-01-PLAN.md — Design-token & font foundation (globals.css palette/radius/reduced-motion, JetBrains Mono, GlowBox + ElevatedCta primitives)

**Wave 2** *(blocked on Wave 1)*

- [x] 06-02-PLAN.md — Upper sections restyle + GSAP hooks (Hero + Annie/about link, TheFix, Outcomes count-up, RoiCalculator)
- [x] 06-03-PLAN.md — Lower sections restyle + GSAP hooks (Offer glow-box cards, ProcessTransparency dark band, FinalCta elevated panel)
- [x] 06-04-PLAN.md — Chrome restyle + CTA rename + About nav link (header, mobile nav, footer, sticky bar, book-cta)
- [x] 06-05-PLAN.md — About/bio & portfolio page (Avatar fallback, credentials, honest demos, disclosed composites, sitemap)

**Wave 3** *(blocked on Wave 2)*

- [ ] 06-06-PLAN.md — GSAP install (package-legitimacy gate) + ScrollStoryProvider + page.tsx wiring

**Wave 4** *(blocked on Wave 3)*

- [ ] 06-07-PLAN.md — Verification: DSGN-01 v1-removal sweep, DSGN-03 reduced-motion, DSGN-04 mobile CWV

**UI hint**: yes

### Phase 7: Blog / Content Engine

**Goal**: Visitors can browse and read credibility-building blog content — a pillar post plus buyer-question cluster posts — built on a maintainable, statically-generated MDX pipeline, every post funneling back to the audit CTA, with an anonymized case-study format defined and ready for the first real engagement.
**Depends on**: Phase 6 (blog templates inherit the redesign's typography/design tokens)
**Requirements**: BLOG-01, BLOG-02, BLOG-03, BLOG-04, BLOG-05
**Success Criteria** (what must be TRUE):

  1. Visitor can browse a blog index generated statically from a single in-repo MDX content source
  2. Visitor can read one pillar post ("What AI-native transformation means for small businesses")
  3. Visitor can read 3-5 cluster posts, each answering one buyer question (what is an FDE, why off-the-shelf AI fails SMBs, AI agents, automation)
  4. Visitor reaches a book-the-free-audit CTA at the end of every post, with no content gated behind a form
  5. A defined anonymized case-study template (situation → diagnosis → what was built → measured TIME/EFFICIENCY/PROFIT) exists in the codebase, ready for the first real engagement write-up

**Plans**: 7 plans in 4 waves
Plans:

**Wave 1**

- [x] 06-01-PLAN.md — Design-token & font foundation (globals.css palette/radius/reduced-motion, JetBrains Mono, GlowBox + ElevatedCta primitives)

**Wave 2** *(blocked on Wave 1)*

- [x] 06-02-PLAN.md — Upper sections restyle + GSAP hooks (Hero + Annie/about link, TheFix, Outcomes count-up, RoiCalculator)
- [x] 06-03-PLAN.md — Lower sections restyle + GSAP hooks (Offer glow-box cards, ProcessTransparency dark band, FinalCta elevated panel)
- [x] 06-04-PLAN.md — Chrome restyle + CTA rename + About nav link (header, mobile nav, footer, sticky bar, book-cta)
- [ ] 06-05-PLAN.md — About/bio & portfolio page (Avatar fallback, credentials, honest demos, disclosed composites, sitemap)

**Wave 3** *(blocked on Wave 2)*

- [ ] 06-06-PLAN.md — GSAP install (package-legitimacy gate) + ScrollStoryProvider + page.tsx wiring

**Wave 4** *(blocked on Wave 3)*

- [ ] 06-07-PLAN.md — Verification: DSGN-01 v1-removal sweep, DSGN-03 reduced-motion, DSGN-04 mobile CWV

**UI hint**: yes

### Phase 8: SEO & Metadata Layer

**Goal**: The site is discoverable and shareable — buyer vocabulary is reinforced naturally across search/social surfaces, and sitemap/RSS/structured data all derive from the same content source as the blog index so nothing drifts out of sync.
**Depends on**: Phase 5 and Phase 7 (needs both landing and blog content finalized to cover)
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04
**Success Criteria** (what must be TRUE):

  1. Landing page and blog headings, meta titles/descriptions, and body copy visibly use buyer vocabulary (AI agents, automation, AI-native transformation, forward-deployed engineer) in natural, non-stuffed placement
  2. A sitemap, robots.txt, and RSS feed are all generated from the same content source that feeds the blog index, with no drift between them
  3. Viewing page source on the landing page and any blog post shows valid JSON-LD structured data (Organization on landing, Article on posts)
  4. Sharing the landing page or a blog post link on social platforms shows correct OG title/description/image via a social-share debug preview

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 5 → 6 → 7 → 8

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|-----------------|--------|-----------|
| 1. Marketing Foundation | v1.0 | 5/6 | Superseded | - |
| 2. Missed-Call Demo & Secure AI Infrastructure | v1.0 | 0/TBD | Superseded | - |
| 3. Workflow Audit Funnel | v1.0 | 0/TBD | Superseded | - |
| 4. Vertical-Aware Landing Pages | v1.0 | 0/TBD | Superseded | - |
| 5. FDE Landing Page | v2.0 | 6/6 | Complete   | 2026-07-20 |
| 6. Visual Redesign | v2.0 | 5/7 | In Progress|  |
| 7. Blog / Content Engine | v2.0 | 0/TBD | Not started | - |
| 8. SEO & Metadata Layer | v2.0 | 0/TBD | Not started | - |
</content>
