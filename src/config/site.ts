/**
 * Single typed source of truth for all founder-identity values (D-06).
 * Every page/component that needs the founder name, contact email, region,
 * domain, or Cal.com booking link imports from here — never hardcode these
 * as string literals elsewhere.
 *
 * NEEDS-FOUNDER placeholders below are explicit launch blockers, not silently
 * shipped defaults. Do NOT invent real biographical or contact values (D-13).
 * Each is tracked in the Phase 1 launch checklist and must be resolved before
 * the site goes live.
 */
export const siteConfig = {
  // Wordmark/brand name and page-title source, per user decision 2026-07-21
  // (matches the Phase 6 sketch's domain-style wordmark treatment).
  name: "aideployed.dev",

  // Locked copy per the Phase 6 UI-SPEC Copywriting Contract — the single
  // source of truth every BookCta/ElevatedCta call site reads from so the
  // label never drifts between instances.
  bookCtaLabel: "Book a Free Call Now",

  // NEEDS-FOUNDER (D-13): confirm the publicly-presented founder name.
  // "Annie" is an acceptable placeholder during development.
  founderName: "Annie",

  // NEEDS-FOUNDER (D-04 / D-05): obvious placeholder — launch blocker.
  // Resolve once the production domain + email forwarding route are set up.
  founderEmail: "PLACEHOLDER_LAUNCH_BLOCKER@example.invalid",

  // NEEDS-FOUNDER (D-13): founder's presented region/service area.
  region: "PLACEHOLDER_REGION",

  // Real domain, confirmed by user decision 2026-07-21 (matches the
  // wordmark above).
  domain: "aideployed.dev",

  // NEEDS-FOUNDER (D-01): set once the Cal.com "Free Audit Call" event type
  // is created under the founder's real Cal.com account.
  calLink: "PLACEHOLDER/free-audit-call",

  calNamespace: "free-audit-call",
} as const;
