---
sketch: 002
name: about-page
question: "What does Annie's bio/credentials/portfolio page look like, and how does it extend the B2 visual system?"
winner: null
tags: [bio, credentials, portfolio, photo, demos]
---

# Sketch 002: About / Portfolio Page

## Design Question
Sketch 001 established B2 (Polished & Refined) as the winning visual direction for the landing page, under a named-personal-brand pivot ("Hello, I'm Annie"). This sketch answers: what does the page behind that name link look like — photo, credentials, demos, and a portfolio of representative builds — while staying visually continuous with B2?

## How to View
open .planning/sketches/002-about-page/index.html

(Linked from sketch 001's hero: the word "Annie" in "Hello, I'm Annie —" now links here.)

## What's Here

- **Bio header** — circular photo slot (see Photo note below), name, title, credential pills (Georgia Tech M.S. / 4.0 GPA), vertical tags (Supply Chain / Finance / Healthcare), and a short bio paragraph.
- **Demos section** — two teaser cards (ROI Calculator marked "Live" linking back to the homepage offer section; an AI Intake/Triage walkthrough marked "Preview" with a request-a-walkthrough CTA, since no live demo exists yet — avoids overpromising).
- **Portfolio section** — four illustrative case-study cards (Problem → Solution → Result), adapted from the fake examples supplied: invoice/reconciliation automation, lead response & outreach, content repurposing, and SEO/GEO content pipeline. Each uses the same hover-backlight card treatment as the homepage's Fix/Offer/Process boxes for visual continuity. Framed explicitly as "illustrative composites... not client-identifying case studies" — accurate framing since these are fabricated examples, not real client work.
- **Final CTA** — same treatment as the homepage's primary CTA.

## Photo

No actual photo file is available to this sketch session (image was shared in-conversation, not saved to disk). The avatar slot is wired to load `./annie-photo.jpg` and gracefully falls back to a monogram placeholder via `onerror` if the file is missing — **drop your photo in at that exact filename and it will appear automatically, no code changes needed.** The frame (thin ring, soft shadow, circular crop, no heavy color treatment) was designed to let the photo's own soft, blurred-bright background blend into the page's light paper tone (`#fbfaf7`) rather than fighting it.

## Design System Reuse

This page duplicates (does not link to) sketch 001's B2 CSS tokens and component patterns (`.glow-box`/`.glow-box-inner`, `.btn-primary`, `.glow-wrap`, `.section-label`) so it stays a self-contained, no-build-step HTML file per sketch conventions, while reading as the same site as the homepage.

## Open Questions
- Demo section content is a placeholder guess (2 teaser cards) — confirm whether real demos exist or should be scoped differently.
- Portfolio copy adapted the user's fake examples into Problem/Solution/Result cards and intentionally dropped the "why it's easy for you" build-notes (those read as internal implementation notes to Annie, not customer-facing copy) — confirm that omission is correct.
