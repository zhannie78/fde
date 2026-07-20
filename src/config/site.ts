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
  name: "AI Deployed",

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

  // NEEDS-FOUNDER (D-04): until the production domain is purchased and
  // connected, the site is built/previewed on the free Netlify subdomain.
  domain: "PLACEHOLDER_DOMAIN.example.invalid",

  // NEEDS-FOUNDER (D-01): set once the Cal.com "Free Audit Call" event type
  // is created under the founder's real Cal.com account.
  calLink: "PLACEHOLDER/free-audit-call",

  calNamespace: "free-audit-call",
} as const;
