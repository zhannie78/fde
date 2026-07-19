# Launch Checklist — Phase 1: Marketing Foundation

Tracks every NEEDS-FOUNDER launch blocker and human-only action required before the site can be
declared live. Nothing on this list can be completed by the executor agent — each item requires
an account, a purchase, or a real identity value only the founder can supply.

Do not remove an item until it is genuinely resolved on the live site (no placeholder text
remaining, matching-domain email working, etc.).

## Decision Log (resolved)

- **DNS ownership (D-05 dependency):** `cloudflare-dns` — DNS stays hosted at Cloudflare;
  Netlify is pointed at via A/CNAME records (apex A/ALIAS or CNAME-flattening to Netlify's load
  balancer, plus a `www` CNAME to the Netlify subdomain). This preserves free **Cloudflare Email
  Routing** as the founder-email path for D-05. Recorded 2026-07-19 per founder decision at the
  01-06 Task 2 checkpoint.

## Outstanding Launch Blockers

### Hosting & Deploy

- [ ] **NEEDS-FOUNDER** — Create a Netlify site and connect this git repo (Netlify dashboard →
      Add new site → Import from Git). Confirm the build succeeds and the site is reachable at
      the `*.netlify.app` subdomain over HTTPS.
- [ ] **NEEDS-FOUNDER** — Confirm Netlify build uses the pinned Node version from `netlify.toml`
      / `.nvmrc` (already committed — verify the Netlify build log shows Node 20.x, not a
      mismatched default).

### Domain & DNS (per cloudflare-dns decision above)

- [ ] **NEEDS-FOUNDER** (D-04) — Purchase the production domain at a reputable registrar; enable
      registrar domain-lock and 2FA (mitigates T-06-01 domain hijack).
- [ ] **NEEDS-FOUNDER** — Keep/move the domain's DNS to Cloudflare (per the cloudflare-dns
      decision). Add DNS records pointing at Netlify:
      - Apex/root: A record(s) or ALIAS/CNAME-flattening to Netlify's load balancer IP(s), per
        Netlify's custom-domain instructions for the site.
      - `www`: CNAME to the `*.netlify.app` subdomain.
- [ ] **NEEDS-FOUNDER** — Connect the custom domain in the Netlify dashboard (Domain management)
      and confirm Netlify auto-provisions the Let's Encrypt TLS certificate.
- [ ] **NEEDS-FOUNDER** — Verify the site serves over HTTPS on the real production domain (not
      just the `*.netlify.app` subdomain) — closes T-06-02 (traffic interception mitigation).

### Founder Email (D-05, via Cloudflare Email Routing)

- [ ] **NEEDS-FOUNDER** — In the Cloudflare dashboard for the production domain, enable **Email
      Routing** (free) and create a routing rule forwarding a matching-domain address (e.g.
      `hello@<domain>` or `<founderName>@<domain>`) to the founder's real inbox.
- [ ] **NEEDS-FOUNDER** — Update `founderEmail` in `src/config/site.ts` from the
      `PLACEHOLDER_LAUNCH_BLOCKER@example.invalid` value to the real matching-domain address once
      Email Routing is verified working (send a test email).

### Cal.com Booking

- [ ] **NEEDS-FOUNDER** (D-01) — Create a "Free Audit Call" (30 min) event type on Cal.com; copy
      the real `username/free-audit-call` event link.
- [ ] **NEEDS-FOUNDER** — Update `calLink` in `src/config/site.ts` from
      `PLACEHOLDER/free-audit-call` to the real Cal.com link; redeploy; confirm the `/book` embed
      loads a real, bookable calendar (RESEARCH Pattern 1 / Open Question 1 — pull the current
      embed snippet from Cal.com's in-app generator if the config shape differs from what's
      currently implemented).

### Founder Identity (D-13, D-06 single edit point: `src/config/site.ts`)

- [ ] **NEEDS-FOUNDER** — Confirm/update `founderName` (currently placeholder value `"Annie"` —
      confirm this is the name to present publicly, or supply the real presented name).
- [ ] **NEEDS-FOUNDER** — Replace `public/founder-placeholder.svg` with the real founder photo
      (update any component references from the placeholder asset to the new file).
- [ ] **NEEDS-FOUNDER** — Update `region` in `src/config/site.ts` from `PLACEHOLDER_REGION` to the
      founder's real presented service area.
- [ ] **NEEDS-FOUNDER** — Update `domain` in `src/config/site.ts` from
      `PLACEHOLDER_DOMAIN.example.invalid` to the real purchased production domain.
- [ ] **NEEDS-FOUNDER** — Resolve the bracketed NEEDS-FOUNDER biographical placeholders in the
      About page's `FounderBlock` narrative (specific unverifiable facts flagged per D-13 — see
      01-05-SUMMARY.md) with founder-confirmed real details or intentionally-vaguer phrasing.
- [ ] Search the built/shipped output for the literal strings `PLACEHOLDER` and `NEEDS-FOUNDER`
      to confirm no placeholder text remains anywhere before declaring launch.

### Copy Review (D-11)

- [ ] **NEEDS-FOUNDER** — Review copy on all four pages (Home, About, Services, /book) for tone,
      accuracy, and typos before launch. No page ships with unreviewed copy.

### Final Verification (SITE-05 / SITE-06 gates)

- [ ] Mobile-responsive: test the live site at ~375px viewport width on all four pages.
- [ ] Fast-loading: spot-check page load on the live deploy (Netlify CDN + Next.js should be
      fast by default; no action expected unless an issue is found).
- [ ] HTTPS confirmed on the real production domain (see Domain & DNS section above).
- [ ] Real founder identity visible: name, photo, region, and matching-domain email all present
      and non-placeholder on the live site.
- [ ] SITE-06 design gate on the live home page: hero focal point holds; no purple gradients, no
      dark-by-default shell, no emoji/icon-per-feature grid, one restrained corner radius used
      consistently; "would a design-savvy visitor believe a human designer made this?"

## Resolution

This checklist is resolved (all items checked) before the phase is declared launch-ready. Until
then, the site continues to build/preview on the Netlify subdomain with placeholder identity
values, which is expected and tracked, not a bug.
