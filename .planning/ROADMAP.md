# Roadmap: AI Deployed

## Overview

AI Deployed ships as four vertical slices, each ending in something a real visitor can experience. Phase 1 stands up the marketing site itself — the credibility layer (founder story, service model, booking CTA, custom design) a skeptical SMB owner needs before trusting anything AI-powered. Phase 2 adds the first live proof of capability: the missed-call recovery demo, embedded on the homepage and built on top of a hardened, rate-limited, spend-capped Claude proxy so the "wow" never becomes a liability. Phase 3 builds the actual funnel — the self-serve audit questionnaire, Claude's drafted findings report, founder review, and delivery — the core wedge and real product-market-fit test. Phase 4 closes the loop with vertical-specific landing pages so each of the four target industries (home services, medical/dental, legal, real estate) sees itself reflected in the pitch, including the compliance-aware copy those verticals require. By the end of Phase 4, a prospect from any target vertical can land on a page written for them, try a live demo, complete an audit, and book a call — the entire core value loop, end to end.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Marketing Foundation** - Visitor can browse a credible, custom-designed marketing site and book a call
- [ ] **Phase 2: Missed-Call Demo & Secure AI Infrastructure** - Visitor can safely try a live AI missed-call recovery demo on the homepage
- [ ] **Phase 3: Workflow Audit Funnel** - Prospect can complete a self-serve audit and receive a founder-reviewed AI-drafted report
- [ ] **Phase 4: Vertical-Aware Landing Pages** - Visitors from each target industry see a dedicated, compliance-aware landing page

## Phase Details

### Phase 1: Marketing Foundation
**Goal**: Visitor can browse a professional, trustworthy marketing site, understand the engagement model, and book a call
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: SITE-02, SITE-03, SITE-04, SITE-05, SITE-06
**Success Criteria** (what must be TRUE):
  1. Visitor can read the founder's FDE story on an About page that establishes the human credibility layer
  2. Visitor can read a Services page explaining the white-glove model plainly (free audit → fixed-scope project → monthly retainer)
  3. Visitor can click a persistent booking CTA (Calendly/Cal.com embed) present on every page
  4. Site is mobile-responsive, fast-loading, served over HTTPS, and shows real founder identity (name, photo, region, matching email domain)
  5. Visitor perceives the site as custom-designed and polished — distinctive typography/color system and deliberate art direction, not templated or AI-generated
**Plans**: 6 plans
- [x] 01-01-PLAN.md — Scaffold Next.js 16 + shadcn (Radix/neutral) + design tokens/fonts + siteConfig identity module
- [x] 01-02-PLAN.md — Shared layout shell: header, accessible mobile nav, sticky CTA bar, footer, sitemap/robots
- [x] 01-03-PLAN.md — /book route + Cal.com inline embed with founder-email error fallback (SITE-04)
- [x] 01-04-PLAN.md — Homepage: focal hero + demo-placeholder slot + D-09 sections (SITE-06 design gate)
- [x] 01-05-PLAN.md — About (FDE story) + Services (audit→project→retainer sequence) pages (SITE-02, SITE-03)
- [ ] 01-06-PLAN.md — Netlify deploy, HTTPS/domain, DNS-vs-email decision, founder launch checklist (SITE-05)
**UI hint**: yes

### Phase 2: Missed-Call Demo & Secure AI Infrastructure
**Goal**: Visitor can safely try a live, ungated AI-powered missed-call recovery demo embedded on the homepage
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: SITE-01, DEMO-01, DEMO-02, INFRA-01, INFRA-02, INFRA-03
**Success Criteria** (what must be TRUE):
  1. Visitor lands on the homepage and sees the missed-call recovery demo embedded above the fold, framed in ROI terms (time/money, not AI jargon)
  2. Visitor can trigger the demo without providing an email and watch an instant AI text-back with a booking link generate in real time
  3. Demo responses stream fast enough to feel live — no long dead spinner that kills the "wow"
  4. Claude API key never reaches the client — every call routes through a server-side endpoint, verifiable via bundle/network inspection
  5. Demo endpoint is rate-limited per visitor with bot protection, has a hard Claude Console spend cap set, and returns safe, on-brand output against adversarial/prompt-injection input
**Plans**: TBD
**UI hint**: yes

### Phase 3: Workflow Audit Funnel
**Goal**: A prospect can complete a self-serve workflow audit and receive a founder-reviewed, AI-drafted findings report
**Mode:** mvp
**Depends on**: Phase 2 (reuses the Claude proxy, rate-limiting, and spend-cap infrastructure)
**Requirements**: AUDIT-01, AUDIT-02, AUDIT-03, AUDIT-04, AUDIT-05
**Success Criteria** (what must be TRUE):
  1. Prospect can complete a short, staged, vertical-aware workflow-audit questionnaire with low friction
  2. Claude drafts a structured, ROI-framed findings report from the prospect's questionnaire answers
  3. Founder is notified of new submissions and can review/edit the drafted report in a simple admin view before anything is sent
  4. Approved report is emailed to the prospect with a "reviewed by [founder]" trust signal and a booking CTA
  5. Submission state (pending → drafted → sent) persists reliably even if the founder reviews days later
**Plans**: TBD
**UI hint**: yes

### Phase 4: Vertical-Aware Landing Pages
**Goal**: Visitors from each of the four target industries see a dedicated landing page speaking directly to their pain points
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: VERT-01, VERT-02, VERT-03, VERT-04
**Success Criteria** (what must be TRUE):
  1. Home-services visitor (HVAC/plumbing/roofing/electrical) sees a dedicated landing page with industry-specific pain examples and framing
  2. Medical/dental visitor sees a dedicated landing page with compliance-aware copy — no PHI in demos, synthetic-data disclosure
  3. Small/solo law-firm visitor sees a dedicated landing page with AI-disclosure-aware copy aligned to state bar guidance
  4. Real-estate visitor sees a dedicated landing page framed around lead-response speed
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Marketing Foundation | 5/6 | In Progress|  |
| 2. Missed-Call Demo & Secure AI Infrastructure | 0/TBD | Not started | - |
| 3. Workflow Audit Funnel | 0/TBD | Not started | - |
| 4. Vertical-Aware Landing Pages | 0/TBD | Not started | - |
