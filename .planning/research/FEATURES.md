# Feature Research

**Domain:** AI-automation consultancy / agency lead-generation website (solo founder, SMB targets)
**Researched:** 2026-07-19
**Confidence:** MEDIUM-HIGH (WebSearch-verified across multiple sources; no Context7-eligible libraries in this domain — this is a marketing/positioning research question, not a library API question)

## Feature Landscape

### Table Stakes (Users Expect These)

Features a skeptical SMB owner assumes exist. Missing these reads as "not a real business" and they bounce.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clear, jargon-free homepage headline stating the outcome (not the tech) | SMB owners buy dollars/hours, not "AI." Generic AI-agency copy is the single most-cited credibility killer in competitor research. | LOW | ROI-first language already decided in PROJECT.md — enforce on every page, not just homepage. |
| 5-page core structure: Home, About, Services, Proof, Contact | This is the baseline structure found across every solo-consultant site researched; visitors expect to find these without hunting. | LOW | "Proof" substitutes for case studies pre-launch (see Differentiators — anonymized/demo-based proof). |
| Persistent, low-friction booking CTA (Calendly-style embed) on every page | Businesses using on-site scheduling see meaningfully higher booked-consultation rates; removing the "email back and forth" step is now a baseline expectation, not a differentiator. | LOW | Use a scheduling embed (Calendly/Cal.com), not a "contact us and we'll email you" form. |
| Real contact info + real person: founder photo, name, physical city/region, matching business email domain | Trust-signal research is unanimous: anonymity/genericness is the top skepticism trigger for SMB buyers evaluating an unknown vendor. | LOW | Directly served by the FDE founder-story requirement already in PROJECT.md. |
| Mobile-responsive, fast-loading, HTTPS | Baseline technical hygiene; real estate/home-services buyers are majority-mobile. Missing = looks unmaintained. | LOW | Standard for any modern static/JAMstack site. |
| Simple, structured lead-capture form (not a bare "Contact us" textbox) | Generic single-field contact forms underperform structured/qualifying forms; SMB owners expect the intake to feel considered, especially for a "workflow audit." | LOW-MEDIUM | The workflow-audit questionnaire itself satisfies this — no separate generic contact form needed as the primary CTA. |
| Explicit "here's what happens next" / how-it-works section | Reduces the biggest objection for unknown solo vendors: "what am I actually agreeing to?" | LOW | Applies to both the audit funnel and the engagement model (project → retainer). |
| Vertical-relevant language on each landing surface (not one generic page for all 4 industries) | Research is unanimous: a landing page tuned for one vertical underperforms badly when reused verbatim for a different one — different objections, different purchase cycles, different vocabulary. | MEDIUM | Does not require 4 fully separate page designs at launch — but headline, pain examples, and audit questions must be vertical-aware at minimum. |

### Differentiators (Competitive Advantage)

These map directly to the wedge already chosen in PROJECT.md. Competitor research confirms none of the surveyed AI-audit-lead-magnet competitors (Ciela AI, Arkeo AI, Execution Point Consulting, Layer3 Labs, MannVenture, Fleece AI) combine live interactive demos with an AI-drafted, human-reviewed audit report — most offer either a static audit form or a booked call, not both an experiential demo and a self-serve report.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Ungated interactive demos (missed-call recovery, intake triage) usable without an email gate | Interactive demos drive dramatically higher conversion than static content (roughly 8x reported industry-wide), and top-performing demo CTAs are placed above the fold, un-gated, "try it yourself" style. Gating kills the "let them experience it" advantage this project is built around. | MEDIUM-HIGH | Requires live Claude API calls on demo interaction — needs rate-limiting/cost guardrails (ties to PROJECT.md budget constraint). Keep each demo short: best-performing interactive product demos complete in well under 12 steps. |
| Self-serve workflow-audit questionnaire → Claude-drafted, founder-reviewed findings report | This is the core wedge: it's simultaneously the lead magnet, the qualifier, and a live proof-of-capability demo — competitors' "free audit" offers are either a phone call or a generic PDF, not a personalized AI-drafted artifact the prospect can watch get created for them. | HIGH | Depends on: questionnaire (vertical-aware branching logic) + Claude drafting pipeline + founder review/edit step before send. Human review step is what keeps this trustworthy (see Pitfalls/anti-features on hallucination risk). |
| Vertical-specific ROI calculator/estimator (e.g., "a missed call costs your HVAC business ~$X/month") | ROI calculators convert roughly 2x better than static pages because buyers who build their own business case are far more likely to act — and dollar-framed math is exactly the ROI-first messaging PROJECT.md calls for. | MEDIUM | Depends on rough per-vertical benchmark data (avg. job value, missed-call rate) — needs light research/assumptions per vertical, clearly labeled as estimates. |
| Founder FDE story as the explicit "why trust an AI-drafted report" narrative | Directly answers the "no case studies yet" credibility gap — research confirms that for pre-portfolio consultants, a sharp, specific diagnosis of the prospect's situation (which the demo + audit report both deliver) builds more trust than borrowed case studies. | LOW | Content/copy work, not engineering — pairs with About page. |
| Transparent engagement-model page (fixed-scope project → monthly retainer, explained plainly, indicative pricing range) | SMB owners are wary of "call us for a quote" — showing the shape of engagement (not necessarily exact price) reduces the biggest friction point before booking a call, especially for buyers unused to buying "AI." | LOW-MEDIUM | Doesn't require published fixed pricing (still custom proposals per PROJECT.md) — a clear 2-step model diagram + "what's included" satisfies the transparency need without contradicting the custom-proposal decision. |
| "Powered by Claude" / AI-native transparency angle | Positions the founder as using the same frontier tooling being sold — a subtle proof point that the consultancy practices what it pitches, differentiating from agencies that resell black-box no-code tools. | LOW | Content decision, ties to PROJECT.md's "AI features built on Claude" constraint. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Voice-bot / AI phone receptionist demo | Feels like the "obvious" AI-agency demo | Market is saturated and commoditized (Podium, Bland, dozens of others already own this positioning); already correctly excluded in PROJECT.md | Missed-call text-back + intake triage demos, which are fresher and cheaper to run live |
| Fully-automated audit report with no human review | Feels more "AI-native," removes founder bottleneck, scales infinitely | LLM hallucination risk is well documented in marketing/consulting contexts (fabricated stats, invented specifics) — sending an unreviewed report to a prospect risks a credibility-destroying factual error on the very artifact meant to build trust | Keep the human-review gate (already decided in PROJECT.md); consider a visible "reviewed by [founder]" note on the report as a trust signal, not just an internal QC step |
| Generic AI chatbot widget answering all site questions unsupervised | Seems like a natural "we use AI" showcase | Research flags over-automation and unsupervised AI agents as active trust-destroyers for SMB buyers specifically — the opposite of the intended effect; also a support burden (someone must monitor it) for a solo founder | Let the two flagship demos (missed-call, intake triage) carry the "we build AI agents" proof; skip a generic on-site chatbot entirely |
| Gating interactive demos behind an email-capture form before they can be tried | Standard SaaS lead-gen instinct ("capture the lead first") | Directly contradicts what makes interactive demos convert well — friction before value defeats the "try it yourself" proof strategy this project is betting on; top-performing demo CTAs are un-gated | Let demos run freely; put the email/qualifying capture at the workflow-audit questionnaire step, which is the natural next action after a convinced visitor |
| Fake/placeholder testimonials, stock "trusted by" logos, or padded 5-star ratings with no text | No real clients yet, feels like a shortcut to instant credibility | Research is explicit: generic, unverifiable social proof reads as fake and increases skepticism rather than reducing it — actively worse than no social proof section at all | Lead with demo-based proof ("try it yourself") + founder credibility story; add a real testimonials section only once real client results exist (v2+) |
| Full self-serve checkout / payment processing on the site | Feels more "automated" and scalable, matches SaaS conventions | Already correctly excluded in PROJECT.md — engagements are custom scoped proposals; a payment flow implies fixed productized pricing that doesn't exist yet | Booking → conversation → custom proposal, closed off-site |
| Client portal / logged-in dashboard at launch | Feels like a "real product," roadmap-friendly to imagine early | No clients yet — building auth/dashboard infra before there's anyone to use it is premature complexity for a solo-maintained site | Defer to v2+, only once retainer clients exist and need a shared workspace |
| Long, enterprise-style multi-step lead qualification / lead-scoring / CRM routing logic | Standard B2B SaaS lead-gen playbook, feels sophisticated | Target buyer is a single-owner decision-maker with no procurement committee (per PROJECT.md) — enterprise-grade lead routing solves a problem this business doesn't have and adds real engineering/maintenance overhead for a solo founder | Keep the workflow-audit questionnaire itself as the qualifier; route everything to one inbox/CRM the founder checks directly |

## Feature Dependencies

```
Workflow Audit Questionnaire (vertical-aware)
    └──requires──> Vertical-relevant copy/question branching
                       └──requires──> Vertical landing-page content decisions

AI-Drafted Audit Report
    └──requires──> Workflow Audit Questionnaire (data source)
    └──requires──> Claude drafting pipeline + founder review/edit step

ROI Calculator (per vertical)
    └──enhances──> Vertical landing pages
    └──enhances──> Homepage ROI-first messaging

Interactive Demos (missed-call recovery, intake triage)
    └──enhances──> Homepage (above-the-fold proof)
    └──enhances──> Vertical landing pages (contextualized per industry)

Booking/Scheduling CTA
    └──requires──> Services/Engagement-model page (context before the ask)
    (but can also stand alone as a persistent global CTA)

Transparent Engagement-Model Page ──informs──> Booking CTA copy (what happens after booking)

Founder Credibility Story (About) ──supports──> Trust in AI-Drafted Audit Report
Founder Credibility Story (About) ──supports──> Trust in Interactive Demos

Gated Lead Capture ──conflicts──> Ungated Interactive Demos
    (do not require email before letting a visitor try a demo)

Fully-Automated Report (no review) ──conflicts──> Human-Reviewed Report
    (PROJECT.md has already resolved this conflict in favor of human review)
```

### Dependency Notes

- **AI-Drafted Audit Report requires Workflow Audit Questionnaire:** the report is generated from questionnaire answers; questionnaire UX/question design must be finalized (including vertical branching) before the drafting pipeline can be built and tested meaningfully.
- **ROI Calculator enhances Vertical landing pages and Homepage:** it is not a standalone page — it's most effective embedded where the visitor is already reading vertical-specific pain points, per ROI-calculator conversion research (buyers convert better building their own business case in context).
- **Interactive Demos enhance Homepage and Vertical pages:** the same two demo components should be reusable/embeddable across the homepage and each vertical page with light copy/framing changes (e.g., "missed call" example uses HVAC framing on the home-services page, front-desk framing on the dental page) rather than being rebuilt per vertical.
- **Gated Lead Capture conflicts with Ungated Interactive Demos:** this is a real design tension to resolve early — the temptation to capture email before showing the demo will undercut the conversion advantage; resolve by putting the capture point at the audit questionnaire, not the demo.
- **Fully-Automated Report conflicts with Human-Reviewed Report:** flagging this explicitly because it will resurface as a "just let Claude send it automatically, it'll scale better" temptation later; PROJECT.md already made the trust-first call here and research supports that call (hallucination risk on trust-critical artifacts).

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to prove the core wedge (demo + audit → booked call) works at all.

- [ ] Homepage with ROI-first messaging and at least one embedded interactive demo above the fold — this is the core hypothesis under test
- [ ] Missed-call recovery interactive demo (ungated, try-it-yourself) — cheapest of the two flagship demos to build and validate the "let them experience it" thesis
- [ ] Self-serve workflow-audit questionnaire (can start with shared/generic questions across verticals, light vertical branching) — the funnel/qualifier can't be deferred, it's the product
- [ ] Claude-drafted audit report + founder review/edit step before send — trust-critical, must exist from day one, not bolted on later
- [ ] About/credibility page with founder FDE story — the primary substitute for missing case studies
- [ ] Services/engagement-model page explaining project → retainer model plainly
- [ ] Persistent booking CTA (Calendly/Cal.com embed) — table stakes, low complexity, high leverage

### Add After Validation (v1.x)

Add once the core loop (demo → audit → booked call) is proven to produce at least a few real conversations.

- [ ] Intake triage agent demo (second flagship demo) — add once missed-call demo's engagement/conversion data justifies building a second live-Claude-API demo
- [ ] Full vertical-specific landing pages for all 4 industries (dedicated headline, pain examples, tuned audit questions) — start with the 1-2 verticals showing the most early traction, expand from there
- [ ] Vertical-specific ROI calculator — once real inputs (avg. job value, missed-inquiry rate assumptions) are validated with early prospects, not invented in a vacuum
- [ ] Real testimonials/case-study section — trigger: first retainer client agrees to be referenced (even anonymized)

### Future Consideration (v2+)

Defer until there's a client base and retainer relationships to support the added complexity.

- [ ] Client portal / logged-in dashboard — defer until there are actual retainer clients who need a shared workspace; premature before then (already excluded in PROJECT.md)
- [ ] Additional demo concepts (end-of-day owner digest, review/reputation autoresponder, conversational lead qualifier) — mentioned as future ideas in PROJECT.md; validate the first two demos convert before expanding the demo library
- [ ] Referral program / partner ecosystem — research notes referral networks are the highest-value lead channel for professional-services/consulting specifically, but this requires an existing client base to seed
- [ ] Paid-traffic-optimized landing page variants — premature before organic/referral funnel is validated; adds ongoing testing overhead for a solo founder

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| ROI-first homepage messaging | HIGH | LOW | P1 |
| Missed-call recovery interactive demo | HIGH | MEDIUM | P1 |
| Workflow audit questionnaire | HIGH | MEDIUM | P1 |
| Claude-drafted report + human review | HIGH | HIGH | P1 |
| About/founder credibility page | HIGH | LOW | P1 |
| Booking CTA (Calendly-style) | HIGH | LOW | P1 |
| Engagement-model/services page | MEDIUM | LOW | P1 |
| Intake triage demo | HIGH | MEDIUM-HIGH | P2 |
| Full 4-vertical landing pages | MEDIUM-HIGH | MEDIUM-HIGH | P2 |
| Vertical ROI calculator | MEDIUM-HIGH | MEDIUM | P2 |
| Real testimonials/case studies | HIGH (once available) | LOW | P2 (blocked on having clients) |
| Client portal | LOW (pre-clients) | HIGH | P3 |
| Additional demo library (digest, review responder, qualifier) | MEDIUM | MEDIUM-HIGH each | P3 |
| Referral/partner program | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Ciela AI / Arkeo AI / Execution Point (free-audit AI agencies) | Podium / missed-call SaaS incumbents | Our Approach |
|---------|------------------------------------------------------------------|----------------------------------------|--------------|
| Free audit lead magnet | Yes — the category norm; typically a booked call or a static-form-to-PDF/report flow | N/A (product-led, not audit-led) | Match the category norm but differentiate with a *self-serve* questionnaire that produces an AI-drafted, personalized report — most competitors still gate this behind a scheduled call, not a self-serve flow |
| Live interactive demo on the marketing site | Rare — most rely on describing capability in copy or requiring a booked call to see anything | N/A — Podium demos are typically behind a sales-request form, not open/ungated | Ungated, try-it-yourself demos as the primary above-the-fold proof mechanism — a clear differentiation gap in this competitive set |
| Human review before deliverable is sent | Inconsistent — several (e.g., Fleece AI) explicitly market "no meetings, instant roadmap," implying no human review step | N/A | Keep explicit human review — turns a competitor's "instant, unreviewed" positioning into our trust advantage, consistent with PROJECT.md decision |
| Vertical-specific targeting | Mixed — Execution Point targets real estate/insurance/law explicitly; others are generic "small business" | Podium markets broadly across local-service verticals with vertical-flavored case studies/pages | Match with vertical-aware questionnaire branching and (v1.x) dedicated vertical landing pages for the 4 chosen verticals |
| Transparent engagement/pricing model | Mostly opaque ("book a call to find out") | Published tiered SaaS pricing ($300-500/mo range for missed-call/CRM bundles) | Publish the *shape* of the engagement (project → retainer) without fixed price, splitting the difference — more transparent than audit-agency norm, more flexible than fixed-tier SaaS pricing |
| Social proof | Testimonials/logos where an existing client base exists; thin or absent for newer entrants | Extensive published case studies and logos (established incumbent) | Cannot compete on social-proof volume pre-launch; substitute with demo-based "try it yourself" proof + founder credibility story, add real proof once earned |

## Sources

- [The 12 best strategies to generate consulting leads in 2026](https://www.enginy.ai/blog/generate-consulting-lead)
- [How to Build a Lead Generation Website in 2026 That Actually Converts?](https://emergent.sh/learn/how-to-build-a-lead-generation-website)
- [The 10 Steps to Building a Client-Generating Consulting Website | Consulting Success](https://www.consultingsuccess.com/consulting-website)
- [Building Trust Signals: The New Currency of Small Business Websites in 2026](https://www.connectmediaagency.com/website-trust-signals/)
- [Trust Signals That Actually Increase Conversion Rates](https://www.stackmatix.com/blog/trust-signals-that-increase-conversion)
- [Website Trust Signals: The Complete Guide for Small Businesses](https://www.remarqz.com/post/website-trust-signals-guide)
- [B2B Website Trust Signals: Building Credibility That Converts](https://www.trajectorywebdesign.com/blog/b2b-website-trust-signals)
- [6 Ways to Improve Demo Conversions on Your Site | Arcade Blog](https://www.arcade.software/post/how-to-drive-saas-website-conversions)
- [How to Increase Conversions For Interactive Demos | Navattic](https://www.navattic.com/blog/increase-conversions-for-interactive-demos)
- [Interactive Demo Platforms and Best Practices for 2026 | Navattic](https://www.navattic.com/blog/interactive-demos)
- [Impact Of Interactive Demos On Conversion Rates & Time To Convert | Storylane](https://www.storylane.io/plot/the-impact-of-interactive-demos-on-conversion-rates-sales-velocity)
- [Interactive Demo Best Practices: The Complete Guide for PLG Teams | Chameleon](https://www.chameleon.io/blog/interactive-demo-best-practices)
- [ROI Calculator Examples: 15 B2B SaaS Tools (2026) Analysis | Outgrow](https://outgrow.co/blog/roi-calculator-examples-b2b-saas)
- [B2B SaaS Landing Page Best Practices: 5 Pillars for 20% CVR | SaaS Hero](https://www.saashero.net/design/landing-page-optimization-b2b-saas/)
- [How to Get AI Agency Clients With a Free Audit (2026 Playbook) | Ciela AI](https://ciela.ai/blogs/how-to-get-ai-agency-clients-with-a-free-audit)
- [Free AI Audit for Small Business | Execution Point Consulting](https://executionpointconsulting.com/ai-audit)
- [AI Workflow Audit: Free ROI Scorecard for Small Business | Layer3 Labs](https://www.layer3labs.io/ai-workflow-audit)
- [AI Consulting — Free Workflow Automation Audit | Fleece AI](https://fleeceai.app/ai-consulting)
- [Free AI Audit for Small Business | MannVenture](https://mannventure.com/ai-audit)
- [Missed Call Text Back: Best Tools & Setup Guide [2026]](https://www.getaira.io/blog/missed-call-text-back)
- [4 Ways to Avoid the Hidden Cost of Missed Calls - Podium](https://www.podium.com/article/avoid-the-hidden-cost-of-missed-calls)
- [Best Missed-Call Text-Back Software for Local Service Businesses | Local Growth Stack](https://localgrowthstack.com/guides/best-missed-call-text-back-software/)
- [8 Landing Page Examples for Your Home Services Business | Scorpion](https://www.scorpion.co/home-services/insights/blog/verticals/home-services/8-landing-page-examples-for-your-home-services-b/)
- [Top Examples of Real Estate Landing Pages | Muffin Group](https://muffingroup.com/blog/real-estate-landing-pages/)
- [7 Professional Services Website Examples for 2026 | Solo Blog](https://blog.soloist.ai/professional-services-website-examples)
- [How to create an AI Consultant website that actually gets clients (2026 guide)](https://www.theoriq.fr/en/post/ai-consultant-website)
- [How to get your first 3 clients as an AI consultant (without a portfolio)](https://www.bizwhat.net/p/how-to-get-your-first-3-clients-as)
- [Book More Appointments And Calls From Your Website - Leadferno](https://leadferno.com/blog/book-more-appointments-and-calls-from-your-website)
- [20 Website Fixes That Increase Booked Consultations | WSI Next Gen Marketing](https://wsinextgenmarketing.com/checklist-20-website-fixes-that-increase-booked-consultations/)
- [Qualify, Route, and Book Sales Meetings Instantly | Calendly](https://calendly.com/resources/guides/book-meetings-instantly)
- [AI Hallucinations in Marketing: 7 Mistakes and How to Stop Them](https://faststrat.ai/ai-hallucinations-marketing-7-mistakes/)
- [Common AI Marketing Mistakes That Small Businesses Make | LNM](https://linknow.com/blog/2026/02/06/common-ai-marketing-mistakes/)
- [5 Reasons Your AI Website Sucks - Hemisphere Design](https://www.hemispheredm.com/ai-website-problems-solutions-small-business)

---
*Feature research for: AI-automation consultancy / agency lead-generation website*
*Researched: 2026-07-19*
