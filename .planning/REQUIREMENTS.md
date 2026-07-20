# Requirements: AI Deployed — v2.0 FDE Pivot

**Defined:** 2026-07-20
**Core Value:** A skeptical SMB owner-operator lands on the site, immediately understands the gap (95% of AI projects fail to deliver ROI), the fix (forward-deployed engineering, embedded in *their* workflows), and the outcomes (TIME, EFFICIENCY, PROFIT) — and is convinced enough to book the free audit.

## v2.0 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Landing Page

- [ ] **LAND-01**: Visitor sees a single long-scroll FDE landing page carrying the 5-part hierarchy: the gap (cited 95%-failure stat) → the fix (forward-deployed engineering) → outcomes (TIME/EFFICIENCY/PROFIT) → the offer → CTA
- [ ] **LAND-02**: Visitor sees transparent pricing on the page — free audit → one-time setup under $10k → retainer under $2k/mo — with scope-qualifying language tied to the free audit
- [ ] **LAND-03**: Visitor can book the free audit via the Cal.com CTA, repeated at top/mid/bottom scroll depth
- [ ] **LAND-04**: Visitor sees a process-transparency section ("how the audit and engagement work, step by step") as the trust signal near the CTA
- [ ] **LAND-05**: Outcomes section includes conservative/worst-case framing ("even in the worst case, you come out ahead")
- [ ] **LAND-06**: No v1 positioning survives — old missed-call/vertical copy, routes, and metadata are removed or redirected

### Visual Redesign

- [x] **DSGN-01**: Site carries a new, distinctive design direction (tokens, typography, layout) replacing the v1 visual system across landing and blog templates
- [ ] **DSGN-02**: The landing page's 5-part narrative is choreographed as a scroll-driven story (GSAP ScrollTrigger)
- [x] **DSGN-03**: All scroll/motion effects respect `prefers-reduced-motion` with a fully readable static fallback
- [ ] **DSGN-04**: Redesigned pages meet Core Web Vitals on mobile despite the animation layer
- [x] **DSGN-05**: Visitor can view the founder's name, photo, and bio on a new `/about` page (reverses the v1/Phase 5 anonymity constraint — validated via Phase 6 sketch findings, confirmed by user 2026-07-20)

### Blog / Content Engine

- [ ] **BLOG-01**: Blog runs on in-repo MDX with a single content source feeding the index, rendered statically
- [ ] **BLOG-02**: Visitor can read one pillar post (e.g. "What AI-native transformation means for small businesses")
- [ ] **BLOG-03**: Visitor can read 3–5 cluster posts, each answering one buyer question (what is an FDE, why off-the-shelf AI fails SMBs, AI agents, automation)
- [ ] **BLOG-04**: Every post ends with a book-the-free-audit CTA (no gated content)
- [ ] **BLOG-05**: Anonymized case-study post format is defined (situation → diagnosis → what was built → measured TIME/EFFICIENCY/PROFIT), ready for the first real engagement

### SEO

- [ ] **SEO-01**: Buyer vocabulary (AI agents, automation, AI-native transformation, forward-deployed engineer) appears in H1/H2s, meta titles/descriptions, and body copy across landing and blog
- [ ] **SEO-02**: Sitemap, robots, and RSS feed are generated from the same content source as the blog index
- [ ] **SEO-03**: JSON-LD structured data (Organization + Article) ships on landing and posts
- [ ] **SEO-04**: Landing page and posts have OG/social-share metadata and images

### Interactive Proof

- [ ] **PROOF-02**: Visitor can use a client-side ROI calculator (hours/week × hourly cost → annual hours and dollars recovered) with no signup and no API cost
- [ ] **PROOF-03**: Calculator output speaks TIME/EFFICIENCY/PROFIT vocabulary and routes to the free-audit CTA

## Future Requirements

Deferred to a later milestone. Tracked but not in current roadmap.

### Interactive Proof

- **DEMO-06**: Visitor can run the bounded "mini-audit" demo — describe one repetitive task, receive a structured TIME/EFFICIENCY/PROFIT mini-diagnosis (Claude Haiku, Turnstile + rate limiting + spend cap required before public link)
- **PROOF-04**: Worst-case/conservative toggle on the ROI calculator output

### Blog / Content Engine

- **BLOG-06**: First real anonymized case study published using the BLOG-05 format (requires a completed engagement)
- **BLOG-07**: Additional cluster posts driven by early search-performance data

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Open-ended "ask me anything" AI chatbot | Unbounded cost/abuse surface; doesn't demonstrate FDE-specific value — the exact trap that got v1's demos scrapped |
| Vertical-specific landing pages (home services, medical/dental, legal, real estate) | v2 sells FDE horizontally to SMBs; rebuilding vertical pages recreates scope the pivot deliberately cut |
| Gated blog content / email capture walls | Kills the SEO and credibility value that is the entire point of the content engine |
| Named founder bio/headshot | Conflicts with the anonymity constraint ("an experienced FDE," no name or photo) |
| Full case-study library at launch | Zero completed engagements exist; an empty-looking library damages credibility |
| ~~Named founder bio/headshot~~ *(reversed 2026-07-20, see DSGN-05)* | Superseded — Phase 6 sketch findings validated a named-founder direction as part of the visual redesign; user confirmed the reversal during `/gsd:ui-phase 6` |
| Email nurture / marketing automation | Solo maintainer; single conversion path (book the audit) is the deliberate design |
| Site-wide scroll-jacking / heavy animation everywhere | Scrollytelling is scoped to the landing narrative; pervasive animation hurts CWV, accessibility, and solo maintainability |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAND-01 | Phase 5 | Pending |
| LAND-02 | Phase 5 | Pending |
| LAND-03 | Phase 5 | Pending |
| LAND-04 | Phase 5 | Pending |
| LAND-05 | Phase 5 | Pending |
| LAND-06 | Phase 5 | Pending |
| PROOF-02 | Phase 5 | Pending |
| PROOF-03 | Phase 5 | Pending |
| DSGN-01 | Phase 6 | Complete |
| DSGN-02 | Phase 6 | Pending |
| DSGN-03 | Phase 6 | Complete |
| DSGN-04 | Phase 6 | Pending |
| DSGN-05 | Phase 6 | Complete |
| BLOG-01 | Phase 7 | Pending |
| BLOG-02 | Phase 7 | Pending |
| BLOG-03 | Phase 7 | Pending |
| BLOG-04 | Phase 7 | Pending |
| BLOG-05 | Phase 7 | Pending |
| SEO-01 | Phase 8 | Pending |
| SEO-02 | Phase 8 | Pending |
| SEO-03 | Phase 8 | Pending |
| SEO-04 | Phase 8 | Pending |

**Coverage:**
- v2.0 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-20*
*Last updated: 2026-07-20 — added DSGN-05 (anonymity-constraint reversal) during `/gsd:ui-phase 6`, superseding the "Named founder bio/headshot" Out of Scope entry*
</content>
