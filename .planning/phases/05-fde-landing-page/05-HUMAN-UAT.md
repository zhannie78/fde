---
status: partial
phase: 05-fde-landing-page
source: [05-VERIFICATION.md]
started: 2026-07-20T13:32:29Z
updated: 2026-07-20T13:32:29Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Cross-viewport scroll-through
expected: Hero -> TheFix -> Outcomes -> RoiCalculator -> Offer -> ProcessTransparency -> FinalCta reads as one coherent narrative at mobile and desktop widths; no text clipping/overflow at Hero's clamp() H1, Offer's inline 28px h3, or ProcessTransparency's 42%/29%/29% flex row
result: [pending]

### 2. ROI calculator live interactivity
expected: hoursPerWeek=0 shows the empty state; positive values show live TIME/PROFIT numerals with no NaN/crash; inputs never go negative
result: [pending]

### 3. Cal.com booking flow via all CTAs
expected: All BookCta instances route to /book; the Cal.com embed loads a working calendar (not the error fallback) under real network conditions
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
