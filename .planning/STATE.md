---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: FDE Pivot
status: executing
stopped_at: Phase 6 complete (7/7 plans) — DSGN-04 CWV spot-check optional follow-up
last_updated: "2026-07-24T06:59:00.000Z"
last_activity: 2026-07-24
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 13
  completed_plans: 13
  percent: 50
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-20)

**Core value:** A skeptical SMB owner-operator lands on the site, immediately understands the gap (95% of AI projects fail to deliver ROI), the fix (forward-deployed engineering, embedded in *their* workflows), and the outcomes (TIME, EFFICIENCY, PROFIT) — and is convinced enough to book the free audit.
**Current focus:** Phase 06 — visual-redesign

## Current Position

Phase: 06 (visual-redesign) — EXECUTING
Plan: 7 of 7
Status: Ready to execute
Last activity: 2026-07-24 - Quick task 260724-c67: added file-based /blog + /blog/[slug] section (SEO/AEO metadata, JSON-LD, sitemap, two posts)

Progress: [█████████░] 92%

## Performance Metrics

**Velocity:**

- Total plans completed: 6 (v2.0) — v1.0 completed 5 plans before being superseded, see git history
- Average duration: - min
- Total execution time: 0 hours (v2.0)

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 05 | 6 | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 06 P01 | 15min | 3 tasks | 5 files |
| Phase 06 P02 | 10min | 2 tasks | 4 files |
| Phase 06 P03 | 12min | 3 tasks | 3 files |
| Phase 06 P04 | 1min | 3 tasks | 4 files |
| Phase 06 P05 | 12min | 3 tasks | 4 files |
| Phase 06 P06 | 2min | 3 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap v2.0]: 21 v2.0 requirements grouped into 4 phases (5-8) matching "coarse" granularity — Landing Page (positioning/copy/IA/pricing/ROI calc) → Visual Redesign → Blog/Content Engine → SEO/Metadata Layer, following research's dependency ordering (copy locked before redesign, redesign before blog templates, SEO closes out once both landing and blog content exist).
- [Roadmap v2.0]: The research-suggested "re-ideated demo" phase (Claude-backed mini-audit) was descoped from this milestone per REQUIREMENTS.md — only the client-side ROI calculator (PROOF-02, PROOF-03) ships in v2.0, folded into Phase 5 since it has no API surface, no rate-limiting/Turnstile/spend-cap infra needs, and belongs to the landing-page experience.
- [Roadmap v2.0]: v1.0's Phase 1 (Marketing Foundation) is marked Superseded, not Complete — 5/6 plans landed but its copy/IA is being replaced by Phase 5; reusable groundwork (Netlify config, Cal.com booking, design tokens, GSD infra) carries forward per PROJECT.md "Kept from v1."
- [PROJECT v2.0]: Pivoted from missed-call-recovery/4-vertical positioning to forward-deployed AI engineering for SMBs — see PROJECT.md Key Decisions for full rationale.
- [Phase 06]: Left --muted/--chart-*/--sidebar-* oklch tokens unchanged in globals.css — Only palette values explicitly enumerated in the UI-SPEC Color section were replaced with the new 60/30/10 indigo system, avoiding unscoped drift into shadcn internals not touched by this phase
- [Phase 06]: Wrapped TheFix's two explainer paragraphs in GlowBox with an internal p-8 padding div, since GlowBox's className prop passes through to the outer .glow-box wrapper, not .glow-box-inner.
- [Phase 06]: Limited data-countup/data-countup-to to the Outcomes lead stat (15+ hrs/week) only, per the plan's whole-integer-stat scope; Efficiency and Profit stats keep stat-numeral only.
- [Phase 06]: GlowBox content wrapping pattern reconfirmed for Offer cards — className only reaches the outer .glow-box wrapper, so card content/gap/padding lives in an inner p-8 div, matching 06-02's the-fix.tsx precedent.
- [Phase 06]: process-progress-line implemented as a single provider-scaled element (thin var(--border) line) rather than a line+fill-child pair, per the plan's explicit either-option allowance.
- [Phase 06]: sticky-cta-bar.tsx required no edits in 06-04 Task 3 -- already free of font-semibold/font-medium and already retains its 44px touch target via BookCta's sticky variant
- [Phase 06]: annie-photo.jpg was untracked at repo root, so used mv + git add instead of git mv for the public/ relocation (same end result).
- [Phase 06]: /about's Demos/Portfolio eyebrow labels and case-block Problem/Solution/Result labels reuse the existing homepage Tailwind eyebrow-label convention (text-sm font-bold tracking-[0.02em] text-primary uppercase) since 06-01 did not port a dedicated .section-label/.label CSS class into globals.css.
- [Phase 06]: GSAP+@gsap/react installed post package-legitimacy checkpoint approval; single 'use client' ScrollStoryProvider houses all 5-act ScrollTrigger choreography via scoped useGSAP + selector-text targeting — Keeps all 6 restyled section components as Server Components (RESEARCH.md Pattern 1); gsap.matchMedia() hard-gates reduced-motion to zero ScrollTrigger instances per DSGN-03

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 5]: Carried from v1 Phase 01-06 (unfinished, superseded) — founder still needs to: create/confirm Netlify site + connect repo, decide on domain/DNS-vs-email path, set up brand email routing. Revisit as part of Phase 5 or a launch-checklist pass. (Cal.com dependency resolved by quick task 260721-b89 — /book now uses a native booking flow; no Cal.com account needed.)
- [quick-260721-b89]: `/book`'s native booking flow depends on `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` being set in production (Netlify env vars) before booking notifications actually fire — see `.env.local.example` for setup steps. Fails safely (generic 500 to visitor, specific reason logged server-side) if unset, but should be resolved before launch.
- [Phase 6]: Research flags Motion vs. GSAP+ScrollTrigger as a taste call requiring design judgment during planning, not a resolved technical decision — confirm choice when Phase 6 is planned.
- [Phase 8]: SEO phase depends on both Phase 5 and Phase 7 being content-complete before it can meaningfully cover buyer-vocabulary placement and structured data — do not plan Phase 8 until Phase 7 lands.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260720-op6 | Integrate animated glow-effect CTA button (GlowButton, rotate mode) into BookCta, applied at Hero + FinalCta | 2026-07-20 | b21b7f7 | [260720-op6-integrate-an-animated-glow-effect-cta-bu](./quick/260720-op6-integrate-an-animated-glow-effect-cta-bu/) |
| 260721-b89 | Footer Contact Me CTA + copyright line, new Formspree-backed /contact page, native 5-step /book booking flow (Cal.com removed) with Telegram notification | 2026-07-21 | 38c608c | [260721-b89-footer-cta-contact-link-updates-native-c](./quick/260721-b89-footer-cta-contact-link-updates-native-c/) |
| 260721-bwa | Graph-paper visual polish for ROI calculator box: two-tier indigo-tinted grid + elevation shadow replacing flat grey grid/border | 2026-07-21 | 946c894 | [260721-bwa-graph-paper-visual-polish-for-roi-calcul](./quick/260721-bwa-graph-paper-visual-polish-for-roi-calcul/) |
| 260721-c2a | How It Works: sequential (staggered) step reveal + GSAP TextPlugin typewriter effect on "Build & Deploy" title with blinking lime cursor | 2026-07-21 | 3060632 | [260721-c2a-sequential-step-reveal-typewriter-effect](./quick/260721-c2a-sequential-step-reveal-typewriter-effect/) |
| 260721-fix1 | Header Contact link fix (/contact), calculator anchor scroll-margin, "Annie" typewriter on About, narrowed Build & Deploy typewriter to just "Deploy" | 2026-07-21 | fcd50ea | (no dedicated dir — direct fix, not planned via gsd-quick init) |
| 260722-70p | Unstyled /about links on hero phrases + linked "Annie" in contact/book headings; reordered About before Approach in header, mobile, and footer nav | 2026-07-22 | 878dc96 | [260722-70p-about-page-links-nav](./quick/260722-70p-about-page-links-nav/) |
| 260722-7dm | Underline + blue hover on Annie /about links (contact, book, hero) only — other four hero links stay unstyled; contact H1 "Get in Touch" fully colored | 2026-07-22 | 06698b9 | [260722-7dm-annie-link-hover-styling](./quick/260722-7dm-annie-link-hover-styling/) |
| 260722-fix2 | How It Works step 1 copy: "We map your workflows..." → "I map your workflows..." (first-person consistency with steps 2-3) | 2026-07-22 | 38e1121 | (no dedicated dir — direct fix, not planned via gsd-quick init) |
| 260722-fix3 | About-page avatar photo resized responsively: 128px mobile / 160px sm / 180px md+ (was fixed 200px at all widths) | 2026-07-22 | b3b6355 | (no dedicated dir — direct fix, not planned via gsd-quick init) |
| 260724-c67 | Added file-based /blog + /blog/[slug] section: typed TSX content model (no CMS/DB), per-post OpenGraph metadata + BlogPosting JSON-LD, sitemap coverage, two ~1200-1800 word posts (FDE model, AI-automation urgency for SMBs) | 2026-07-24 | 9803f62 | [260724-c67-add-a-blog-section-for-seo-and-aeo-with-](./quick/260724-c67-add-a-blog-section-for-seo-and-aeo-with-/) |

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none — v1.0 was superseded, not closed via /gsd:complete-milestone)* | | | |

## Session Continuity

Last session: 2026-07-24T06:59:00Z
Stopped at: Completed quick task 260724-c67 (blog section for SEO/AEO); Phase 6 still complete (7/7 plans) — DSGN-04 CWV spot-check optional follow-up
Resume file: .planning/quick/260724-c67-add-a-blog-section-for-seo-and-aeo-with-/260724-c67-SUMMARY.md
</content>
