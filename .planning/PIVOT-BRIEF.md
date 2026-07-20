# Pivot Brief: AI Deployed v2 — Forward-Deployed AI for SMBs

**Status:** Supersedes the v1 positioning (missed-calls/slow-follow-ups pain point, 4-vertical strategy) and the copy/IA built in Phase 1. This brief is the input for re-running project discussion and planning.

**Date:** 2026-07-20

---

## The problem this business solves

There is a gap between what foundation models can do and what businesses actually get out of them. 95% of generative AI projects fail to deliver measurable ROI — not because the models are weak, but because of brittle workflows and poor alignment with how work actually happens ([Invisible Tech — What is Forward-Deployed Engineering](https://invisibletech.ai/blog/what-is-forward-deployed-engineering)).

Enterprises close this gap by embedding forward-deployed engineers (FDEs) — the model pioneered by Palantir, OpenAI, and Anthropic, with FDE job postings up 800%+ in 2025. FDEs work *inside* the customer's environment, building solutions around real workflows instead of abstract requirements: "proximity creates clarity."

Small and medium-sized businesses have exactly the same gap — but the consultancies serving this space price for enterprises. SMBs need forward-deployed AI engineering and cannot afford it. **That is the market.**

## What the business is

A solo practice offering **forward-deployed AI engineering to small and medium-sized businesses**: an experienced FDE who embeds in the client's current workflows to modernize and automate them — AI agents, automation, AI-native transformation — closing the gap between AI technology and real implementation.

## Unique value proposition

**Custom white-glove solutions.** Every business has its own way of doing things — its own workflows, quirks, and constraints. Off-the-shelf AI tools don't fit that reality; forward-deployed engineering does. The service is: understand *your specific* workflows, modernize them, and apply AI precisely where it adds value.

Every engagement is judged on three outcomes:

- **TIME** — hours recovered from manual work
- **EFFICIENCY** — workflows that run themselves
- **PROFIT** — money recovered or newly earned

## Offer and pricing

1. **Free audit** — scope the business's pain points; discover where AI can save time, increase efficiency, and increase profit. No cost, no commitment.
2. **One-time setup** — build and deploy the custom solution. Priced under $10k (a fraction of enterprise consultancy rates).
3. **Monthly retainer** — ongoing iteration, monitoring, and support. Under $2k/month.

## What the site must do (v2 requirements)

- **FDE / AI-deployment landing page** aimed at SMB owner-operators. Message hierarchy:
  1. The gap: AI capability vs. real business implementation (the 95%-failure framing)
  2. The fix: forward-deployed engineering — embedded, workflow-first, white-glove
  3. The outcomes: TIME, EFFICIENCY, PROFIT
  4. The offer: free audit → affordable setup → low monthly retainer
  5. CTA: book the free audit
- **Blog / content pages** that showcase the value of this work — e.g., what forward-deployed engineering is and why it exists, what AI-native transformation looks like for a small business, anonymized engagement write-ups as they accumulate. Content is part of the credibility engine, not an afterthought.
- Explicitly use the vocabulary buyers are searching for: **AI agents, automation, AI-native transformation, forward-deployed engineer**.

## Scrapped from v1

- The "missed calls and slow follow-ups" pain-point positioning
- The 4-vertical strategy (medical/dental/legal/etc.) and verticals teaser
- Current homepage/About/Services copy and information architecture
- Demo concepts tied to the old positioning (missed-call recovery, intake triage) — demos should be re-ideated to demonstrate FDE value under the new framing

## Kept from v1 (carried assumptions — confirm during discussion)

- Tech stack: Next.js 16 / Tailwind / shadcn scaffold, design tokens, Cal.com booking, Netlify free-tier deploy config
- **Budget: $0 recurring** — free hosting (`*.netlify.app`), free booking, free brand email; no domain purchase for now
- ~~**Anonymity:** the site sells experience and results, not a named person — "an experienced FDE," no name or photo~~ — **REVERSED 2026-07-20:** site now sells a named individual, Annie, as a personal developer/consultant brand ("Hello, I'm Annie, a forward deployed engineer and ai consultant"). Explicit user decision during the Phase 6 visual redesign request. No photo requirement not revisited — treat as open unless specified otherwise.
- Sales-model lessons from prior research: freelancer/consultant (not agency) positioning; proof via before/after case studies with measurable outcomes
- GSD planning infrastructure and git history

## Open questions for the discuss phase

1. **Brand name** — keep "AI Deployed" or rename to fit the FDE framing?
2. **Design system** — keep the existing tokens/typography, or refresh as part of re-ideation ("I don't like what has been built" may extend to the visual design)?
3. **Blog implementation** — in-repo MDX (free, simple, solo-maintainable) vs. anything else?
4. **Demo strategy** — what interactive proof best demonstrates forward-deployed value under the new positioning?
5. **Case-study content** — which real (anonymized) engagements are available to write up first?

## References

- [What is Forward-Deployed Engineering — Invisible Tech](https://invisibletech.ai/blog/what-is-forward-deployed-engineering) — core framing, 95% stat, FDE model
- [How to Sell AI Workflows (Without Starting an Agency)](https://www.youtube.com/watch?v=QIsJe-nZ5XE) — freelancer→consultant path, niche by pain, before/after proof
- [The AI Offer You Can Sell Tomorrow Morning](https://www.youtube.com/watch?v=Pi-m8R068r4) — audit-first client acquisition, website as credibility engine
