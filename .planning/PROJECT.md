# AI Deployed

## What This Is

A marketing and lead-generation website for **AI Deployed** — a solo AI-transformation consultancy run by a former forward-deployed engineer (FDE). The business offers free workflow audits to small/medium businesses, then builds custom white-glove AI solutions (powered by Claude) for the pain points the audit uncovers. The site is both the storefront and the first proof of capability: interactive demos and an AI-drafted audit report let prospects experience the product before ever talking to a human.

## Core Value

A skeptical, non-technical SMB owner lands on the site, tries a demo or completes the free workflow audit, and comes away convinced this person can recover real money and time for their business — convinced enough to book an engagement.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Marketing website with ROI-first messaging (time saved, profit recovered, expenses cut — not "look, AI")
- [ ] Interactive demo: missed-call recovery (instant auto-text-back with booking link when a call is missed)
- [ ] Interactive demo: intake triage agent (classifies/summarizes incoming inquiries, drafts responses)
- [ ] Self-serve workflow audit questionnaire (prospect fills out form about their business/workflow)
- [ ] AI-drafted audit findings report — Claude drafts a personalized report from questionnaire answers; owner (Annie) reviews/edits before it's sent to the prospect
- [ ] Services/engagement page communicating the white-glove model: scoped initial project to prove value fast, then monthly retainer for maintenance and new automations
- [ ] About/credibility section: company-first brand with the founder's FDE story as the human credibility layer ("I embedded with enterprise clients; now I embed AI in your business")
- [ ] Vertical-aware content for the four target industries: home services (HVAC/plumbing/roofing/electrical), medical/dental practices, small/solo law firms, real estate teams

### Out of Scope

- Voice-bot / phone-answering AI receptionist demo — saturated market, commoditized; the missed-call recovery angle is fresher and cheaper to demo
- Client portal / logged-in dashboard — no clients yet; premature
- Payment processing on the site — engagements are custom proposals, closed via conversation
- Fully-automated audit reports (no human review) — while trust is being built, every report gets founder review before sending
- Mobile app — web-first
- Serving enterprises or startups — the wedge is SMBs with single-owner decision-makers

## Context

- **Founder background**: Forward-deployed engineer — experienced at embedding with client organizations, doing discovery-to-production work, finding actual workflow pain (not the pain clients think they have), and shipping solutions that stick. This is the business's core differentiator and the brand's namesake.
- **Target verticals** were chosen on two axes — profitability and ease of client acquisition. All four share the winning traits: a missed inquiry has an obvious dollar cost the owner already feels, the decision-maker is a single owner (no procurement committee), and the industries are referral-dense.
- **The audit is the funnel**: self-serve questionnaire → Claude drafts a personalized findings report → founder reviews → report is sent. The audit doubles as a live demo of the consultancy's capability.
- **Social proof strategy** (no client testimonials yet): interactive demos as the primary proof ("try it yourself"), FDE work history as the human credibility layer behind them.
- **Business model**: free audit → fixed-scope initial project (prove value fast) → monthly retainer (maintenance + new automations, like a fractional AI engineer).
- Demo ideas considered for later: end-of-day owner digest (chief-of-staff daily summary), review/reputation autoresponder, conversational lead qualifier.

## Constraints

- **Budget**: Lean/free-tier first — minimize recurring costs; free-tier hosting, pay-as-you-go Claude API only when demos are actually used — solo bootstrapped business
- **Team**: Solo founder — everything (site, demos, audits, delivery) must be maintainable by one person
- **Tech**: AI features built on Claude — the founder's chosen platform and part of the pitch

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Working name "AI Deployed" | FDE lineage + doubles as the pitch ("AI, deployed directly into your business, not bolted on") | — Pending (domain TBD) |
| Target 4 verticals, one shared wedge | Home services, medical/dental, small law, real estate all share the same pain (missed inquiry = lost revenue), so demos and pitch reuse across all four | — Pending |
| Missed-call recovery + intake triage as flagship demos | Less saturated than voice receptionists; directly demonstrate the ROI wedge | — Pending |
| Audit = self-serve questionnaire → AI draft + human review | Scales without losing quality control while trust is being built; the audit itself demos the capability | — Pending |
| Project + retainer engagement model | Scoped build proves value fast; retainer creates recurring revenue and embeds long-term | — Pending |
| Company-first brand, founder story prominent | "AI Deployed" is the brand; FDE background is the credibility layer, not the whole identity | — Pending |
| ROI-first messaging | SMB owners respond to dollars/hours, not technology; copy leads with time saved, profit recovered, expenses cut | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-19 after initialization*
