# Requirements: Deployed AI

**Defined:** 2026-07-19
**Core Value:** A skeptical, non-technical SMB owner lands on the site, tries a demo or completes the free workflow audit, and comes away convinced enough to book an engagement.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Core Site

- [ ] **SITE-01**: Visitor sees an ROI-first homepage (time saved, profit recovered, expenses cut — no AI jargon) with a demo embedded above the fold
- [ ] **SITE-02**: Visitor can read an About page telling the founder's FDE story as the credibility layer ("I embedded with enterprise clients; now I embed AI in your business")
- [ ] **SITE-03**: Visitor can read a Services page explaining the white-glove engagement model plainly (free audit → fixed-scope project → monthly retainer)
- [ ] **SITE-04**: Visitor can book a call via a persistent scheduling CTA (Calendly/Cal.com embed) present on every page
- [ ] **SITE-05**: Site is mobile-responsive, fast-loading, and served over HTTPS with real founder identity (name, photo, region, matching email domain)
- [ ] **SITE-06**: Site has a distinctive, intentional visual design that does not read as AI-generated or templated — custom typography and color system, deliberate art direction, polished micro-interactions; passes the "would a design-savvy visitor believe a human designer made this?" test

### Demo

- [ ] **DEMO-01**: Visitor can try the missed-call recovery demo without providing an email (ungated) — simulate a missed call and watch an instant AI text-back with booking link generated live
- [ ] **DEMO-02**: Demo responses stream fast enough to feel live (no long spinner that kills the "wow")

### Audit Funnel

- [ ] **AUDIT-01**: Prospect can complete a self-serve workflow-audit questionnaire with vertical-aware questions (short, staged — low friction)
- [ ] **AUDIT-02**: Claude drafts a personalized findings report from questionnaire answers (structured output, ROI-framed)
- [ ] **AUDIT-03**: Founder is notified of new submissions and can review/edit the drafted report in a simple admin view before anything is sent
- [ ] **AUDIT-04**: Approved report is emailed to the prospect with a "reviewed by [founder]" trust signal and a booking CTA
- [ ] **AUDIT-05**: Submissions persist through the pending → drafted → sent lifecycle (nothing lost if founder reviews days later)

### Verticals

- [ ] **VERT-01**: Visitor from home services (HVAC/plumbing/roofing/electrical) can view a dedicated landing page with industry-specific pain examples and framing
- [ ] **VERT-02**: Visitor from a medical/dental practice can view a dedicated landing page (with compliance-aware copy — no PHI in demos, synthetic data disclosure)
- [ ] **VERT-03**: Visitor from a small/solo law firm can view a dedicated landing page (with AI-disclosure-aware copy per state bar guidance)
- [ ] **VERT-04**: Visitor from a real estate team can view a dedicated landing page with lead-response-speed framing

### Infrastructure

- [ ] **INFRA-01**: All Claude API calls go through server-side routes — API key never reaches the client
- [ ] **INFRA-02**: Public demo endpoints are rate-limited per visitor with bot protection, and a hard spend cap is set in the Claude Console
- [ ] **INFRA-03**: Demo endpoints resist prompt injection (guided inputs over free-text where possible; adversarial inputs produce safe, on-brand responses)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Demo

- **DEMO-03**: Visitor can try the intake triage agent demo (classifies/summarizes inquiries, drafts responses) — add once missed-call demo validates the demo thesis
- **DEMO-04**: Visitor can use a per-vertical ROI calculator ("a missed call costs your HVAC business ~$X/month") — needs validated benchmark data per vertical
- **DEMO-05**: Additional demo library — end-of-day owner digest, review autoresponder, conversational lead qualifier

### Proof

- **PROOF-01**: Real testimonials/case-study section — triggered by first client willing to be referenced

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Voice-bot / AI phone receptionist demo | Saturated, commoditized market (Podium, Bland, et al.); missed-call recovery is fresher and cheaper to demo |
| Generic on-site AI chatbot widget | Research shows unsupervised AI agents are trust-destroyers for SMB buyers; support burden for solo founder |
| Gating demos behind email capture | Kills the conversion advantage the whole strategy is built on; capture happens at the audit questionnaire |
| Fully-automated report sending (no human review) | Hallucination risk on the exact artifact meant to build trust; founder review is structural |
| Fake testimonials / stock "trusted by" logos | Unverifiable social proof increases skepticism — worse than none |
| Payment processing on site | Engagements are custom proposals closed via conversation |
| Client portal / logged-in dashboard | No clients yet; premature complexity |
| Enterprise lead-scoring / CRM routing | Target buyer is a single-owner decision-maker; one inbox suffices |
| Mobile app | Web-first |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SITE-01 | Phase 2 | Pending |
| SITE-02 | Phase 1 | Pending |
| SITE-03 | Phase 1 | Pending |
| SITE-04 | Phase 1 | Pending |
| SITE-05 | Phase 1 | Pending |
| SITE-06 | Phase 1 | Pending |
| DEMO-01 | Phase 2 | Pending |
| DEMO-02 | Phase 2 | Pending |
| AUDIT-01 | Phase 3 | Pending |
| AUDIT-02 | Phase 3 | Pending |
| AUDIT-03 | Phase 3 | Pending |
| AUDIT-04 | Phase 3 | Pending |
| AUDIT-05 | Phase 3 | Pending |
| VERT-01 | Phase 4 | Pending |
| VERT-02 | Phase 4 | Pending |
| VERT-03 | Phase 4 | Pending |
| VERT-04 | Phase 4 | Pending |
| INFRA-01 | Phase 2 | Pending |
| INFRA-02 | Phase 2 | Pending |
| INFRA-03 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-19*
*Last updated: 2026-07-19 after roadmap creation (all 20 v1 requirements mapped to 4 phases)*
