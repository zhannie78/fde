# Pitfalls Research

**Domain:** Solo AI-consultancy lead-gen site with public Claude-powered demos + AI-drafted audit funnel
**Researched:** 2026-07-19
**Confidence:** MEDIUM-HIGH (technical/cost/security findings verified across multiple current sources; conversion/positioning findings are well-supported patterns but not project-specific data — no A/B test history exists yet for this site)

## Critical Pitfalls

### Pitfall 1: Unmetered Public Demo = Open Wallet

**What goes wrong:**
A public, no-login interactive demo (missed-call recovery, intake triage) calls the Claude API directly with no per-visitor budget cap. Someone scripts a loop against the endpoint, shares it on a forum, or a crawler bot hammers it — and a $0 demo turns into a four-figure bill overnight. This is the single most common way solo builders get burned by public LLM demos; documented cases include a $104K bill from an unprotected serverless setup and a $23K bill from bot/DDoS traffic billed at standard rates.

**Why it happens:**
Rate limiting (requests/minute) gets built, but rate limiting is not the same as a cost/budget cap. Builders assume "reasonable" traffic without accounting for scripted abuse, and Claude API calls scale in cost with token count (long conversations, large context) not just request count.

**How to avoid:**
- Never call the Claude API directly from the browser — proxy every demo call through a serverless function/edge function you control.
- Enforce a hard per-IP and per-session daily/hourly request cap (not just "rate limit" — an actual stop, e.g. 5 demo runs per visitor per day) at the proxy layer.
- Enforce a hard *token* cap per request (short system prompts, capped max_tokens, no free-form long input) since token count drives cost more than request count.
- Set a hard monthly spend cap in the Anthropic Console (and platform-level spend caps on Vercel/Netlify) so the failure mode is "demo goes offline" not "five-figure invoice."
- Cache/precompute a small library of demo scenarios where possible instead of a fully open-ended prompt, to bound worst-case cost per interaction.

**Warning signs:** No documented answer to "what's the maximum this demo could cost me if someone scripted 10,000 hits against it overnight?"; API key or proxy has no rate/budget limit configured; no monitoring/alerting on API spend.

**Phase to address:** The demo-build phase (whichever phase implements the missed-call recovery / intake triage demos) — budget caps and proxy architecture must be designed in from the first line of demo code, not retrofitted after a bill.

---

### Pitfall 2: API Key Leakage via Client-Side Demo Code

**What goes wrong:**
The Claude API key ends up in frontend JavaScript (directly, or bundled into a static site's client bundle) so anyone can view-source it, extract it, and run their own workload on the founder's Anthropic account.

**Why it happens:**
It's the fastest way to get a demo working in a prototype, and on lean/free-tier hosting the temptation to skip a backend function "just for now" is high. Static-site generators and simple hosting make it easy to forget that anything shipped to the browser is public.

**How to avoid:**
- All Claude API calls go through a serverless/edge function (Vercel/Netlify function, Cloudflare Worker) that holds the key as a server-side environment variable — never in client code or `NEXT_PUBLIC_`/`VITE_`-prefixed env vars.
- Add a pre-commit or CI secret-scan (GitHub's own push-protection catches many key formats, but don't rely on it alone) so a key never lands in a public repo.
- Rotate the key immediately if this project's repo is ever made public after being built with a key in history.

**Warning signs:** grep the built/deployed frontend bundle for the API key prefix before every deploy; any `fetch()` call to `api.anthropic.com` originating from browser code is an instant fail.

**Phase to address:** Demo-build phase, as an architecture decision made before any demo ships — proxy pattern is the default, not an afterthought.

---

### Pitfall 3: Prompt Injection Turns the Demo Into a Liability, Not a Sales Tool

**What goes wrong:**
Because the demos are public and Claude-powered, a visitor can type adversarial input into the "intake triage" or "missed-call" demo to make it say something off-brand, offensive, or embarrassing — then screenshot it. For a consultancy whose entire pitch is "trust me with your business's AI," a viral screenshot of the demo being tricked into misbehaving is reputation-damaging in a way it wouldn't be for a big-brand product.

**Why it happens:**
Demo prompts are built for the happy path (a plausible missed-call scenario) and not hardened against a user typing "ignore previous instructions" or pasting adversarial text into a free-text field.

**How to avoid:**
- Constrain user input surface area: prefer pre-set scenario buttons / limited-choice inputs over fully open free-text fields wherever the demo narrative allows it.
- If free text is needed (e.g., "paste your own inquiry to see triage in action"), wrap it with clear delimiters/system-prompt separation, keep the system prompt narrowly scoped, and add output-side checks (e.g., reject/flag outputs containing certain patterns) before rendering to the visitor.
- Never let demo output be used to make real automated decisions (send real emails, book real calendar slots) — output should always render as a preview/mock, not perform a live side effect, closing off the most damaging injection outcomes.
- Add a lightweight content filter or a "this looks off-topic/unsafe" fallback response rather than always rendering raw model output verbatim.

**Warning signs:** No test pass where you (or a friend) deliberately try to break the demo with adversarial input before launch; free-text fields with no length cap or content check; demo output triggers real side effects (real SMS/email sent).

**Phase to address:** Demo-build phase — include an adversarial-input test pass as an explicit acceptance criterion before any demo goes live, and revisit if a new demo type is added later.

---

### Pitfall 4: AI-Jargon Copy That Alienates the Exact Buyer You're Targeting

**What goes wrong:**
The site's copy leans on AI/technical vocabulary ("agentic workflows," "LLM-powered automation," "RAG pipeline") because that's the founder's natural vocabulary as a former FDE — but the buyer is a solo HVAC owner, dentist, or small-firm lawyer who doesn't know or care what an LLM is and tunes out the moment the copy sounds like a tech pitch instead of a business one.

**Why it happens:**
Technical founders default to describing *how* the thing works instead of *what it does for the owner's bank account*. It feels more credible/precise to the founder, but precision-for-peers reads as confusion to a non-technical buyer.

**How to avoid:**
- Every headline and above-the-fold sentence should be readable and compelling to someone outside the industry — run the "read it to a non-technical friend, can they repeat back what you do" test on every page.
- Lead with the dollar/hour outcome (missed calls recovered, hours saved per week, revenue not lost) — this is already a stated PROJECT.md decision; the risk is drifting from it as demo/technical pages get built and the temptation to "explain the tech" creeps in on secondary pages (About, Services, demo instructions).
- Push jargon translation to a "how it works" tier that's optional/secondary, not the primary path.
- Vertical-specific copy (home services vs. medical vs. legal vs. real estate) should use each industry's own vocabulary for the pain ("no-show," "missed lead," "after-hours call") rather than AI vocabulary.

**Warning signs:** Copy review where the phrase "AI," "LLM," "agent," or "model" appears in a headline instead of an outcome; a non-technical test reader can't explain what the business does after reading the homepage once.

**Phase to address:** Copywriting/messaging phase (likely early — homepage and core positioning), with a re-check pass after demo and audit-funnel pages are built since jargon tends to creep back in on feature-explanation pages.

---

### Pitfall 5: Demos That Impress Engineers, Not Owners

**What goes wrong:**
The demo is built to be technically impressive (shows the "reasoning," exposes model internals, has a chat-style interface that feels like a dev tool) rather than instantly legible to someone who doesn't code. A skeptical SMB owner doesn't want to "chat with an AI" — they want to see, in 10 seconds, that a missed call gets a text back and a booking link, with zero interpretation required.

**Why it happens:**
It's natural for a technical founder to build the demo they'd find cool (transparent, chat-driven, showing capability) rather than the demo a non-technical buyer needs (concrete, scenario-based, instantly showing the business outcome).

**How to avoid:**
- Frame every demo as "before/after" or "trigger → outcome," not as an open-ended chat interface. E.g., "Simulate a missed call" button → shows the text-back message and booking link appear, not a conversational back-and-forth.
- Keep the interaction to one click plus a visible result; avoid requiring the visitor to know what to type or ask.
- Show the dollar/time framing directly in the demo UI ("This call would have gone to a competitor. Instead: recovered in 12 seconds.") rather than assuming the visitor infers the business value from a technical output.
- User-test the demo on a genuinely non-technical person (ideally someone in one of the 4 target verticals) before launch, not just on technical peers.

**Warning signs:** Demo requires the visitor to write a prompt or understand what "good" output looks like; demo UI resembles a chatbot/dev console rather than a before/after business scenario; feedback from technical friends is glowing but feedback from actual target-vertical owners is confused.

**Phase to address:** Demo-build phase — the demo UX spec (not just the backend) should be reviewed against "would a non-technical owner get this in 10 seconds" as an explicit gate.

---

### Pitfall 6: Audit Funnel Friction Kills the Exact Leads You Want

**What goes wrong:**
The self-serve workflow-audit questionnaire is built like an internal discovery form (many fields, business-specific jargon, feels like "work") instead of a low-friction lead magnet. Longer/harder forms convert dramatically worse — forms under ~5 fields convert 35-45% better than longer ones — and the audit is the entire top of the funnel for this business, so friction here is friction on the whole company.

**Why it happens:**
The founder (an FDE) is used to deep discovery processes for real engagements and unconsciously builds the same depth into the free top-of-funnel form. There's also a temptation to ask enough questions upfront that the AI-drafted report can be maximally accurate — but that trades conversion volume for report quality on leads who never finish the form.

**How to avoid:**
- Keep the initial form short (aim for the fewest fields that let Claude produce a *directionally* useful draft — business type/vertical, biggest pain point, rough call/inquiry volume, and 2-3 more at most); treat it as a staged funnel, not a single mega-form.
- Consider a multi-step form (progress bar, one/two questions per screen) over a single long page — perceived effort matters as much as actual field count.
- Separate "enough info for a useful AI-drafted report" from "enough info for a real engagement" — the latter happens in the human conversation after the report, not in the free-tier form.
- A/B or at least directionally test form length once there's real traffic; this is a place where instinct alone (from an engineering background, not a growth-marketing one) is likely to overbuild.

**Warning signs:** Form has more than ~7-8 fields or feels like "paperwork"; form completion rate is unmeasured (no analytics on step-by-step drop-off); qualifying questions are mixed in with report-input questions with no distinction between "needed to draft a report" and "nice to have."

**Phase to address:** Audit-funnel phase — form design should be reviewed for field count/friction as an explicit checklist item, with drop-off analytics wired in from first launch (not added later "if it becomes a problem," since by then the damage is invisible — you don't know what you lost).

---

### Pitfall 7: Positioning as "Just Another AI Vendor" With No Testimonials to Fall Back On

**What goes wrong:**
Without client testimonials, the site defaults to generic consultant-website tropes (vague claims, stock photography, buzzword service lists) that make it indistinguishable from the flood of "AI consulting" outfits that appeared in the last two years — precisely the credibility gap this project already recognizes and is trying to solve via interactive demos + founder story, but which is easy to undermine with weak execution elsewhere on the site.

**Why it happens:**
Without testimonials, there's a temptation to compensate with more claims/adjectives ("industry-leading," "cutting-edge") rather than more *proof* — which reads as less credible, not more, to a skeptical buyer.

**How to avoid:**
- Substitute concrete, verifiable specifics for missing testimonials: the founder's actual FDE work history (which companies/industries, without violating confidentiality — even category-level specificity like "embedded with Fortune 500 clients doing discovery-to-production AI work" beats vague claims), specific numbers in the ROI messaging (even illustrative/estimated, clearly labeled as such), and the demos themselves as the primary proof mechanism.
- Avoid generic consultant-site language entirely ("results-driven," "innovative solutions," "transform your business") — this is exactly the noise that makes new AI consultancies blend together; specificity is the differentiator when social proof is unavailable.
- As soon as the first engagement completes, treat getting a testimonial/case study as a priority action, not an afterthought — the site's credibility model should have an explicit "add first case study" moment built into the plan rather than assuming demos alone carry indefinitely.
- Since two of the four verticals (medical/dental, legal) have their own trust/credibility conventions (credentials, disclaimers), consider whether vertical-specific credibility signals (e.g., explicit "I'm not a lawyer/doctor, I don't touch PHI/privileged info" framing) build trust faster than generic claims for those audiences specifically.

**Warning signs:** Homepage copy uses adjectives ("cutting-edge," "innovative," "world-class") without a specific, checkable claim attached; About page reads like a generic bio instead of a specific work history; nothing on the site would be different if the founder's actual background were swapped for a stock "AI expert" bio.

**Phase to address:** Positioning/messaging phase (homepage + About/credibility section), with a follow-up trigger after the first completed engagement to add real testimonial/case-study content.

---

### Pitfall 8: AI-Drafted Audit Reports Sent With Hallucinated or Overconfident Claims

**What goes wrong:**
Claude drafts a "findings report" from limited questionnaire answers and, left unchecked, states things with unwarranted confidence — specific dollar-savings estimates, industry benchmarks, or claims about the prospect's competitors/market that are plausible-sounding but fabricated. Even with founder review before sending (already a PROJECT.md decision), a rushed or infrequent review pass lets a hallucinated specific slip through, and a prospect who catches even one fabricated "fact" in their free report loses trust in everything else on the site — including the demos.

**Why it happens:**
LLMs are fluent and confident by default; a report-drafting prompt built to sound authoritative and specific (because vague reports feel low-value) will happily manufacture specific numbers or claims not supported by the questionnaire input unless explicitly constrained.

**How to avoid:**
- Constrain the report-drafting prompt to only state figures/facts derivable from questionnaire answers or clearly-labeled industry-general ranges (e.g., "businesses of this type typically lose X-Y% of inquiries after hours" sourced from a founder-curated reference, not model-invented) — never let the model invent a specific number about the prospect's own business it wasn't given.
- Build the founder review step around a checklist (are all numeric claims traceable to an input or approved reference; no invented competitor/market claims) rather than a general "read it over" pass, since hallucinated specifics are easy to skim past when they sound plausible.
- Keep report language appropriately hedged ("could," "likely," "worth exploring") rather than declarative where the underlying data is thin — this is also a brand-trust choice, not just an accuracy one.
- Log/version the questionnaire answers alongside the generated report so the founder review step can quickly diff "what was actually reported by the prospect" vs. "what the report claims."

**Warning signs:** Report contains a specific number (dollar figure, percentage, competitor reference) that isn't traceable to a questionnaire answer or a founder-approved reference table; review step takes under a minute per report (too fast to actually check claims); no standard reference data feeding the "typical loss for this vertical" type of statements.

**Phase to address:** Audit-report-generation phase — the prompt design and the review checklist should be built together, not the prompt first and a review process retrofitted later.

---

### Pitfall 9: Vertical-Specific Compliance Blind Spots (Medical/Dental HIPAA, Legal Advertising Rules)

**What goes wrong:**
Two of the four target verticals carry regulatory obligations the site's generic "audit + demo" flow doesn't naturally account for. For medical/dental: if any real (not synthetic/example) patient-related information is ever entered into a public demo or questionnaire, it's a HIPAA exposure — and even the *appearance* that patient data might be flowing through a public AI tool as a Business Associate without a BAA is a credibility risk to a practice owner who is trained to be wary of exactly that. For legal: several state bars require disclosure when marketing content is AI-generated/assisted, and attorneys are personally responsible for the accuracy of AI-assisted marketing content, including chatbot-style interactions — an AI-drafted audit report sent to a law firm prospect without appropriate framing could itself become a point of skepticism from an audience unusually attuned to this exact issue.

**Why it happens:**
The four verticals were chosen for a shared *demand-side* pattern (missed inquiry = lost revenue), but they don't share the same *regulatory* pattern — it's easy to design one funnel/demo experience and only later realize two of the four verticals need different guardrails or disclosure language.

**How to avoid:**
- Demos and the audit questionnaire should never invite or accept real patient information — use clearly-labeled example/synthetic scenarios for the medical/dental demo path, and state explicitly that no real patient data should be entered.
- Add a simple, visible "this report was AI-drafted and human-reviewed" disclosure on the audit report itself (this is good practice generally, but specifically pre-empts the legal-vertical skepticism and aligns with emerging state disclosure trends) rather than presenting it as if written entirely by the founder.
- Do not claim or imply HIPAA compliance/BAA coverage unless it's actually true for the current lean/free-tier architecture — if the medical/dental vertical content ever implies "safe for patient data," that's a claim to substantiate or avoid entirely at this stage.
- Keep this pitfall's scope proportionate: at the marketing-site/demo stage (not yet handling real client data in production engagements), the main risk is *implying* more compliance posture than exists, or accidentally inviting real PHI into a public form — not full HIPAA program-building, which is a later-stage concern once real client engagements begin.

**Warning signs:** Demo or questionnaire copy doesn't explicitly say "use example data, not real patient/client information"; audit report has no AI-disclosure language; marketing copy for the medical/dental vertical uses the word "HIPAA-compliant" without a concrete basis for that claim.

**Phase to address:** Vertical-content phase (whichever phase builds out the vertical-aware content/demos) — add disclosure/synthetic-data language as a content requirement, not a legal afterthought, especially before any medical/dental or legal-vertical content goes live.

---

### Pitfall 10: Over-Engineering the Marketing Site Instead of Shipping to Validate

**What goes wrong:**
Because the founder is a strong engineer, the temptation is to build the marketing site like a product — CMS integration, elaborate component systems, personalization, A/B testing infrastructure — before a single real visitor has validated that the ROI-first messaging and demo concept actually convert. This delays the thing that actually matters at this stage (getting real SMB owners to try the demo and complete the audit) in favor of technical polish nobody asked for yet.

**Why it happens:**
Engineering skill makes "build it properly" cheap and satisfying compared to the uncertain, less-controllable work of getting real traffic and iterating on conversion — it's a classic solo-technical-founder trap: build what's fun and controllable, defer what's uncertain and requires talking to strangers.

**How to avoid:**
- Treat the first version of the site as a means to validate the core hypothesis (ROI-first copy + interactive demo + AI audit convinces skeptical SMB owners), not as the final architecture — favor a simple, fast-shipping stack (static/lightweight framework, minimal moving parts) over a CMS/personalization/testing-infrastructure buildout at this stage, consistent with the project's own "lean/free-tier first" constraint.
- Apply a rough time-box to the first shippable version and treat anything beyond core pages (home, demos, audit funnel, services, about) plus basic analytics as deferred until there's real usage data suggesting it's needed.
- Resist building infrastructure (multi-vertical CMS, dynamic personalization per industry) before confirming which vertical(s) actually convert — vertical-aware content can start as a handful of well-written static variants, not a dynamic system, until real data shows it's worth automating.

**Warning signs:** Time spent on site infrastructure/tooling exceeds time spent on copy, demo quality, or getting the first real visitors; a feature is being built because it's technically interesting rather than because a specific conversion problem demands it; no analytics/traffic yet but already discussing scaling concerns.

**Phase to address:** Should be an explicit scoping principle across all early phases — flag any phase whose scope starts creeping toward general-purpose infrastructure (CMS, testing frameworks, personalization engines) before the core funnel has real traffic data.

---

### Pitfall 11: Demo/Report Latency Kills the Moment of Trust

**What goes wrong:**
A skeptical visitor clicks "try the demo" or submits the audit questionnaire and stares at a spinner for several seconds (or longer, if the Claude call is chained with other processing). Latency compounds distrust rather than being neutral: a slow response after clicking a button that promises "watch this happen instantly" undercuts the exact pitch (instant recovery, instant response) the demo is trying to prove. General web conversion data shows even 1 second of delay measurably drops conversions, and demo latency is worse than page latency because the visitor is actively watching and waiting for a specific promised outcome.

**Why it happens:**
Claude API calls, especially with longer system prompts or larger max_tokens, take real time (often several seconds), and a naive implementation calls the model synchronously with no streaming or perceived-progress UI, so the wait feels like nothing is happening.

**How to avoid:**
- Use streaming responses so text appears progressively rather than all-at-once after a long silent wait — this alone changes the perceived experience even if total time is similar.
- Design the demo prompt to be as short/constrained as possible (minimize system prompt size, cap max_tokens tightly) since this directly reduces both cost (Pitfall 1) and latency together.
- Add explicit progress/feedback UI ("Analyzing your call..." with a short animated sequence) for the sub-2-second window so the wait feels intentional rather than broken.
- For the audit report specifically (which is not real-time — founder reviews before sending), latency matters less; the real-time constraint applies specifically to the public interactive demos, not the audit report generation.

**Warning signs:** Demo response takes more than ~2-3 seconds with no visible progress indicator; no streaming implemented; demo "feels slow" even in casual internal testing (a strong signal it will feel worse to an impatient, skeptical first-time visitor).

**Phase to address:** Demo-build phase — streaming and perceived-latency design should be part of the initial demo implementation, not a post-launch optimization.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Calling Claude API directly from a serverless function with no caching/scenario library | Faster to build the first demo | Cost scales linearly (or worse) with traffic; a single popular demo can blow the budget | Only with a hard per-visitor/day cap and monthly spend cap already in place |
| Single long-form audit questionnaire (no multi-step/progressive form) | Simpler to build, one form component | Depresses completion rate on the entire top of funnel, invisibly (no baseline to compare against) | Never for the primary lead-gen funnel; acceptable only for a very early, low-traffic internal test |
| Hardcoded vertical copy variants instead of a CMS/content system | Ships faster, no infra to maintain | Editing copy across 4 verticals means touching code each time | Acceptable indefinitely for a solo operator at this scale — do not "fix" this until it's genuinely painful |
| No automated adversarial-input testing for demos | Faster demo launch | Risk of a public embarrassing screenshot going around, exactly the reputational risk this business can least afford | Never — this is cheap to do (a few manual test prompts) relative to the downside |
| Skipping analytics/funnel drop-off tracking at launch | Simpler initial build | No way to know why leads aren't converting once traffic starts; by the time it's added, historical baseline is lost | Never for the audit funnel specifically; acceptable to defer for secondary pages |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|-------------------|
| Anthropic Claude API | No spend cap set in Console; API key embedded client-side | Set hard monthly spend limit in Anthropic Console; proxy all calls server-side; use a restricted-scope key if/when available |
| Vercel/Netlify (hosting + serverless functions) | Relying on "generous free tier" without a hard spend/usage cap | Set explicit spend caps at the platform level (both platforms support this) before any public demo goes live; watch ISR/ revalidation settings that can silently multiply function invocations |
| Booking/calendar link (missed-call demo) | Demo actually creates real bookings or sends real SMS/emails during public testing | Demo renders a realistic mock of the outcome (preview UI) rather than triggering live third-party side effects; only a real "book a call with Annie" CTA should hit a real calendar integration |
| Form/questionnaire backend (audit funnel) | Storing prospect answers with no spam/bot filtering, leading to junk submissions polluting the founder's review queue | Add basic bot protection (honeypot field, simple rate limit) on the audit form even though it's low-friction, since it's the one place actual founder time gets consumed per submission |
| Email delivery (sending the audit report) | Using a personal email account/relying on manual sends without deliverability setup (SPF/DKIM), reports landing in spam | Use a proper transactional email service with domain authentication configured from the start, since a report that lands in spam defeats the entire funnel |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Synchronous, non-streamed Claude call in demo | Visible multi-second blank wait after clicking "try demo" | Stream responses; keep prompts short | Breaks trust immediately, even at low traffic — this isn't a scale problem, it's a day-one UX problem |
| No caching of common demo scenarios | Every demo interaction costs a full API call even for near-identical inputs | Consider a small library of pre-generated scenario responses for the most common demo paths, with live API calls reserved for custom input | Becomes a real cost problem once demo traffic exceeds a few hundred sessions/day |
| Unbounded questionnaire free-text fields feeding directly into the report prompt | Occasional very long/unusual inputs inflate token cost and latency per report | Cap free-text field length in the form itself | Rare at low volume, but a single bad-faith or bot submission with a huge pasted block of text can spike a single request's cost disproportionately |
| No CDN/caching on static marketing pages | Slower page loads under any traffic spike (e.g., a Reddit/HN mention) | Use a platform with edge caching by default (Vercel/Netlify/Cloudflare) for static content; keep the marketing pages fully static/cacheable | Becomes visible the first time a page gets shared somewhere with real traffic (which, for a lead-gen site, is the goal — so this should be solved before it's needed) |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| API key in client bundle or public repo | Anyone can run workloads on the founder's Anthropic billing | Server-side-only key via serverless proxy; secret scanning in CI |
| No spend cap on Anthropic account | Single abuse incident becomes a large, uncapped bill | Hard monthly spend limit set in Anthropic Console before any public demo ships |
| Free-text demo input with no adversarial testing | Prompt injection produces off-brand/embarrassing output that gets screenshotted | Constrain input surface (buttons/presets over free text where possible); test with adversarial prompts before launch; never let demo output trigger real side effects |
| Real PHI/patient or privileged legal info entered into a public demo or form | HIPAA exposure (medical/dental vertical) or confidentiality issue (legal vertical), and a major credibility hit for exactly the audience most sensitive to it | Explicit "use example/synthetic data only" language on vertical-specific demos/forms; never store or process real PHI in the public-facing site |
| Audit questionnaire responses stored without basic protection (plaintext, no access control) | Prospect business data (potentially sensitive, e.g., financials/pain points) exposed if the storage backend is misconfigured | Use a managed backend/database with standard access controls; treat questionnaire responses as sensitive business data, not marketing-analytics data |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|------------------|
| Chat-style, open-ended demo interface | Non-technical owner doesn't know what to type, feels intimidated, bounces | Button-triggered "before/after" scenario demos requiring zero prompting skill |
| Long, discovery-style audit questionnaire | Prospect abandons before completing; funnel loses the exact leads it needs | Short initial form (staged/multi-step), defer deep discovery to the human conversation after the report |
| AI-jargon-heavy copy on core pages | Non-technical SMB owner tunes out, doesn't self-identify as the target buyer | ROI/outcome-first language throughout, jargon confined to optional "how it works" detail |
| No visible proof of the founder's real capability beyond claims | Skeptical buyer has nothing concrete to anchor trust in, since there are no testimonials yet | Specific, checkable founder background details + the demos themselves as primary proof, avoiding generic consultant-speak |
| Demo or report with no indication of AI involvement/limitations | Prospect feels misled if they later realize content was AI-drafted, especially damaging for legal-vertical prospects primed to notice this | Light, honest "AI-drafted, human-reviewed" framing that's confidence-building rather than hedging |
| Silent, unexplained wait during demo generation | Feels broken; undercuts the "instant recovery" pitch the demo is trying to prove | Streaming output + lightweight progress indicator |

## "Looks Done But Isn't" Checklist

- [ ] **Public demo:** Often missing a hard per-visitor cost/rate cap — verify by asking "what's the worst-case bill if this got scripted-abused overnight?" and confirming an actual configured stop exists (not just documented intent).
- [ ] **Demo API integration:** Often missing server-side key isolation — verify by inspecting the deployed frontend bundle/network requests for any exposed key or direct browser-to-Anthropic calls.
- [ ] **Audit questionnaire → report pipeline:** Often missing a founder-review checklist for hallucinated/unsupported claims — verify the review step has an explicit checklist (traceable numeric claims, no invented competitor/market facts), not just "read it over."
- [ ] **Vertical-specific content (medical/dental, legal):** Often missing compliance-aware framing — verify synthetic-data language exists on relevant demos/forms and AI-disclosure language exists on the audit report.
- [ ] **Marketing copy:** Often looks "done" while still jargon-heavy on secondary pages — verify by re-running the non-technical-reader test on About, Services, and demo-instruction pages specifically, not just the homepage.
- [ ] **Analytics on the audit funnel:** Often missing step-by-step drop-off tracking — verify the form has instrumented steps, not just a "submitted" event, before the first real traffic arrives.
- [ ] **Adversarial-input hardening:** Often skipped as "we'll deal with it if it happens" — verify a manual adversarial test pass was actually run against each public demo before launch.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|-----------------|
| Unmetered demo abuse / cost blowout | MEDIUM | Immediately revoke/rotate the API key, set a hard spend cap, take the demo offline until a proxy + cap is in place, contact Anthropic support re: any anomalous charges |
| API key leaked publicly | LOW-MEDIUM | Rotate key immediately (Anthropic auto-deactivates detected public keys, but don't rely on that alone); audit git history and scrub if committed; redeploy with server-side-only key |
| Embarrassing prompt-injection screenshot goes semi-viral | MEDIUM | Take the affected demo offline immediately, harden input handling, post a brief transparent acknowledgment if visibility warrants it (skeptical SMB audience will forgive a fixed issue faster than a defensive non-response) |
| Hallucinated claim discovered in a sent audit report | MEDIUM-HIGH | Proactively follow up with the prospect correcting the specific claim before they raise it; tighten the report-generation prompt and review checklist immediately; this is a trust-recovery situation, treat it as such rather than hoping it goes unnoticed |
| Low audit-form completion rate discovered post-launch | LOW | Add step-by-step analytics if missing, shorten the form, A/B the field count/order; this is a fixable iteration problem, not a rebuild |
| Site over-built relative to actual traffic/validation | LOW-MEDIUM | Deliberately strip scope back to core funnel pages; treat unused infrastructure as sunk cost, not a reason to keep building on top of it |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|---------------|
| Unmetered public demo cost blowout | Demo-build phase | Documented worst-case-cost answer exists; spend caps configured in Anthropic Console + hosting platform before public launch |
| API key leakage | Demo-build phase | Frontend bundle/network inspection shows no exposed key; all Claude calls proxied server-side |
| Prompt injection / embarrassing demo output | Demo-build phase | Adversarial test pass completed and documented before each demo ships |
| AI-jargon copy alienating non-technical buyers | Messaging/copy phase (+ recheck after demo/audit pages built) | Non-technical reader test passes on all core + secondary pages |
| Demos impressive to engineers, not owners | Demo-build phase | Non-technical (ideally target-vertical) user test completed before launch |
| Audit funnel friction / form abandonment | Audit-funnel phase | Field count kept minimal; step-by-step completion analytics live from first launch |
| Weak positioning without testimonials | Positioning/messaging phase | Homepage/About avoid generic consultant-speak; specific, checkable founder claims used throughout |
| Hallucinated/overconfident AI-drafted reports | Audit-report-generation phase | Founder-review checklist exists and is used; no unsupported numeric/competitor claims reach send |
| Vertical compliance blind spots (HIPAA, legal ad rules) | Vertical-content phase | Synthetic-data language present on medical/legal demos and forms; AI-disclosure language present on audit report |
| Over-engineering the marketing site | Cross-cutting (all early phases) | Time/scope check: infrastructure work not outpacing copy/demo/traffic-generation work pre-launch |
| Demo/report latency undermining trust | Demo-build phase | Streaming implemented; demo response feels near-instant (sub 2-3s to first visible output) in casual testing |

## Sources

- [Rate Limiting in AI Gateway: The Ultimate Guide — TrueFoundry](https://www.truefoundry.com/blog/rate-limiting-in-llm-gateway)
- [Stop Your OpenAI Bill from Exploding: Per-User LLM Budget Caps — DEV Community](https://dev.to/kmusicman/stop-your-openai-bill-from-exploding-per-user-llm-budget-caps-in-nodejs-48c8)
- [How to Implement LLM Rate Limiting — OneUptime](https://oneuptime.com/blog/post/2026-01-30-llm-rate-limiting/view)
- [What Is a Prompt Injection Attack? — Palo Alto Networks](https://www.paloaltonetworks.com/cyberpedia/what-is-a-prompt-injection-attack)
- [7 Prompt Injection Mitigation Strategies for Enterprise AI — Witness AI](https://witness.ai/blog/prompt-injection-mitigation-strategies/)
- [API Key Best Practices: Keeping Your Keys Safe and Secure — Claude Help Center](https://support.claude.com/en/articles/9767949-api-key-best-practices-keeping-your-keys-safe-and-secure)
- [Vercel Pricing and Free Tier Limits in 2026 — Vibe Coder Blog](https://blog.vibecoder.me/vercel-pricing-explained-when-free-isnt-enough)
- [Vercel: 5 Hidden Costs Beyond the Price Tag — CostBench](https://costbench.com/software/developer-tools/vercel/hidden-costs/)
- [Consultant Website Copy Checklist — Exposay](https://www.exposay.co/consultant-website-copy-checklist-niche-positioning-service-packages-case-results/)
- [The Website Copy Mistakes That Make Service Businesses Sound Like Everyone Else — Invoke Media](https://invokemedia.co.uk/the-website-copy-mistakes-that-make-uk-service-businesses-sound-like-everyone-else)
- [AI Consulting for SMEs: How Beginners Can Pitch and Deliver Services — Nomad Excel](https://nomadexcel.co/ai-consulting-for-smes/)
- [Avoid These 6 Lead Generation Mistakes in Consulting — Collective](https://www.collective.com/blog/the-6-lead-generation-mistakes-to-avoid-in-your-solo-consulting-business)
- [How to Build a Sales Funnel as a Solopreneur — Lilach Bullock](https://www.lilachbullock.com/sales-funnel-solopreneur/)
- [Social Proof for Startups with Zero Customers: 7 Alternatives That Work — Briefd](https://briefd.it/blog/social-proof-startups-zero-customers/)
- [The Role of Social Proof on Consulting Websites — Knapsack Creative](https://knapsackcreative.com/blog-industry/consulting-website-social-proof)
- [SaaS Marketing Site Engineering: Why Most AI Founders Hire Wrong — Utsubo](https://www.utsubo.com/blog/saas-marketing-site-engineering)
- [AI Latency in Ecommerce: Why Speed Kills Conversions — Alhena AI](https://alhena.ai/blog/ai-latency-ecommerce-cx-speed-conversions/)
- [A 1-Second Page Delay Drops Conversions by 7% — WIRO](https://www.wiro.agency/blog/how-a-1-second-delay-costs-you-a-7-drop-in-conversions)
- [AI in dentistry: What are the HIPAA violation risks? — CDA](https://www.cda.org/newsroom/endorsed-services/ai-in-dentistry-what-are-the-hipaa-violation-risks/)
- [HIPAA-Compliant Digital Marketing for Dental and Medical Practices — Ditans Group](https://ditansgroup.com/hipaa-compliant-digital-marketing-for-dental-and-medical-practices-what-you-can-and-cannot-do/)
- [Navigating State Bar rules on AI-generated ads (50-state overview) — LaFleur Marketing](https://lafleur.marketing/blog/navigating-state-bar-rules-on-ai-generated-ads-a-50-state-overview/)
- [Ethical Issues When Incorporating AI Into Law Firm Marketing — American Bar Association](https://www.americanbar.org/groups/law_practice/resources/law-practice-magazine/2024/september-october-2024/ethical-issues-when-incorporating-ai-into-law-firm-marketing/)
- [AI Hallucinations in Business: Causes and Prevention — IntuitionLabs](https://intuitionlabs.ai/articles/ai-hallucinations-business-causes-prevention)
- [Understanding the Risks AI Hallucinations Create for Businesses — National Law Review](https://natlawreview.com/article/ai-hallucinations-are-creating-real-world-risks-businesses)
- [Audit Your Funnel: Are Your "Qualified" Leads Actually Qualified? — LeadG2](https://leadg2.thecenterforsalesstrategy.com/blog/audit-your-funnel-are-your-qualified-leads-actually-qualified)

---
*Pitfalls research for: Solo AI-consultancy lead-gen site with public Claude-powered demos and AI-drafted audit funnel*
*Researched: 2026-07-19*
