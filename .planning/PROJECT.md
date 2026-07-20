# AI Deployed

## What This Is

A marketing and lead-generation website for **AI Deployed** — a solo practice offering **forward-deployed AI engineering to small and medium-sized businesses**: an experienced FDE who embeds in the client's actual workflows to modernize and automate them (AI agents, automation, AI-native transformation). The site is the storefront and the credibility engine: landing page, blog/content, and interactive proof that closes the gap between "AI can do this" and "my business gets this."

## Core Value

A skeptical SMB owner-operator lands on the site, immediately understands the gap (95% of AI projects fail to deliver ROI), the fix (forward-deployed engineering, embedded in *their* workflows), and the outcomes (TIME, EFFICIENCY, PROFIT) — and is convinced enough to book the free audit.

## Current Milestone: v2.0 FDE Pivot — Forward-Deployed AI for SMBs

**Goal:** Reposition AI Deployed around forward-deployed AI engineering for SMBs — new messaging and IA, a visually impressive redesign, a blog/content engine, and re-ideated demos that prove FDE value.

**Target features:**
- Visual redesign — new design direction that is visually appealing and impressive; the site itself must look like proof of craft, not a template
- FDE landing page with the 5-part message hierarchy: the gap (95%-failure framing) → the fix (forward-deployed engineering) → outcomes (TIME / EFFICIENCY / PROFIT) → the offer (free audit → <$10k setup → <$2k/mo retainer) → CTA to book the free audit
- Blog / content pages as a credibility engine (what FDE is, AI-native transformation for SMBs, anonymized engagement write-ups)
- Buyer-vocabulary SEO throughout: AI agents, automation, AI-native transformation, forward-deployed engineer
- Demos re-ideated under the new framing (missed-call recovery / intake triage scrapped)

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] FDE landing page aimed at SMB owner-operators with the 5-part message hierarchy: gap → fix → outcomes (TIME/EFFICIENCY/PROFIT) → offer → book-the-free-audit CTA
- [ ] Visually impressive redesign — new design direction replacing the Phase 01 (v1.0) visual system where needed; the site itself is proof of craft
- [ ] Blog / content pages showcasing the value of forward-deployed engineering (what FDE is and why it exists, AI-native transformation for small businesses, anonymized engagement write-ups as they accumulate)
- [ ] Offer/pricing presentation: free audit (no cost, no commitment) → one-time setup under $10k → monthly retainer under $2k
- [ ] Buyer-vocabulary SEO: pages explicitly use "AI agents," "automation," "AI-native transformation," "forward-deployed engineer"
- [ ] Interactive proof re-ideated for the FDE framing (replaces the v1 missed-call-recovery and intake-triage demo concepts)

### Out of Scope

- "Missed calls / slow follow-ups" pain-point positioning — superseded by the FDE gap/fix/outcomes framing (v2 pivot)
- 4-vertical strategy (home services / medical-dental / legal / real estate) and verticals teaser — v2 sells forward-deployed engineering horizontally to SMBs, not vertical-specific wedges
- v1 homepage/About/Services copy and information architecture — scrapped by the pivot; rebuilt under the new message hierarchy
- Missed-call recovery and intake-triage demos — tied to the old positioning; demos are re-ideated under FDE framing
- Named-founder personal brand — the site sells experience and results anonymously ("an experienced FDE," no name or photo)
- Domain purchase / paid services — $0 recurring budget; free `*.netlify.app` hosting, free booking, free brand email for now
- Client portal / logged-in dashboard — no clients yet; premature
- Payment processing on the site — engagements are custom proposals, closed via conversation
- Mobile app — web-first
- Serving enterprises or startups — the wedge is SMBs priced out of enterprise FDE consultancies

## Context

- **The market gap**: 95% of generative AI projects fail to deliver measurable ROI — brittle workflows and poor alignment with how work actually happens, not weak models. Enterprises close this gap with forward-deployed engineers (Palantir/OpenAI/Anthropic model; FDE postings up 800%+ in 2025). SMBs have the same gap but the consultancies serving it price for enterprises. That underserved space is the market.
- **The offer**: (1) free audit to scope pain points, (2) one-time setup under $10k, (3) monthly retainer under $2k. Every engagement is judged on TIME (hours recovered), EFFICIENCY (workflows that run themselves), PROFIT (money recovered or newly earned).
- **UVP**: custom white-glove solutions — understand *your specific* workflows, modernize them, apply AI precisely where it adds value. Off-the-shelf tools don't fit; forward-deployed engineering does. "Proximity creates clarity."
- **Sales-model lessons** (from prior research): freelancer/consultant positioning, not agency; proof via before/after case studies with measurable outcomes; audit-first client acquisition; the website is the credibility engine.
- **Kept from v1**: Next.js 16 / Tailwind / shadcn scaffold, design tokens (subject to redesign), Cal.com booking, Netlify free-tier deploy config, GSD planning infrastructure and git history.
- **v1 status**: v1.0 (marketing-foundation) was superseded mid-execution by this pivot; its Phase 01 launch checklist items (Netlify site, Cal.com event, email routing) remain useful groundwork where they don't conflict with the new positioning.
- **Open questions carried to phase discussion**: demo strategy (what interactive proof best demonstrates forward-deployed value), blog implementation (in-repo MDX vs. alternatives), which anonymized engagements to write up first.

## Constraints

- **Budget**: $0 recurring — free hosting (`*.netlify.app`), free booking, free brand email; no domain purchase for now; pay-as-you-go Claude API only when AI features are actually used
- **Team**: Solo founder — everything (site, content, demos, delivery) must be maintainable by one person
- **Tech**: AI features built on Claude — the founder's chosen platform and part of the pitch
- **Anonymity**: The site sells experience and results, not a named person — "an experienced FDE," no name or photo

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pivot to forward-deployed AI engineering positioning (v2) | The 95%-failure gap + enterprise-priced FDE consultancies leave SMBs underserved; FDE framing matches the founder's actual differentiator and buyer search vocabulary | — Pending |
| Keep brand name "AI Deployed" | Name already carries the FDE lineage ("AI, deployed into your business, not bolted on"); avoids renaming churn | — Pending |
| Visual redesign in v2, aimed at "visually impressive" | Founder dissatisfied with the v1 build's look; for a craft-selling consultancy, the site itself is proof of capability | — Pending |
| Scrap 4-vertical strategy | v2 sells FDE horizontally to SMBs; vertical wedges were tied to the missed-call pain point | — Pending |
| Anonymous positioning ("an experienced FDE") | Sells experience and results, not a named person | — Pending |
| Pricing published on site: free audit → <$10k setup → <$2k/mo retainer | Transparent, a fraction of enterprise rates — the affordability contrast is part of the pitch | — Pending |
| Audit-first funnel (free audit as the CTA) | No-cost, no-commitment entry; audit-first acquisition proven pattern for this sales model | — Pending |
| Keep v1 tech scaffold (Next.js 16 / Tailwind / shadcn, Netlify, Cal.com) | Stack decisions were sound and positioning-neutral; only copy/IA/design are scrapped | — Pending |

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
*Last updated: 2026-07-20 after v2.0 FDE pivot (milestone start)*
