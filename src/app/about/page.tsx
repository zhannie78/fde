import type { Metadata } from "next";
import Link from "next/link";

import { AnimatedName } from "@/components/about/animated-name";
import { Avatar } from "@/components/about/avatar";
import { ElevatedCta } from "@/components/ui/elevated-cta";
import { GlowBox } from "@/components/ui/glow-box";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.founderName} — Forward-Deployed AI Engineer & Consultant`,
  description:
    "Meet the forward-deployed engineer behind AI Deployed: credentials, honest demos, and a portfolio of the kinds of AI agent and automation systems built for small and medium businesses.",
};

const demos = [
  {
    badge: "Live",
    title: "ROI Calculator",
    body: "Enter your team's hours and hourly cost, see exactly how much time and profit AI-native automation could recover for your business.",
    href: "/#calculator",
    cta: "Try it",
  },
  {
    badge: "Preview",
    title: "AI Intake & Triage Assistant",
    body: "A walkthrough of an inbound-lead triage agent — scoring, routing, and drafting a first response in under a minute.",
    href: "/book",
    cta: "Request a walkthrough",
  },
] as const;

const cases = [
  {
    number: "01",
    title: "The Autonomous Invoice & Financial Reconciliation Engine",
    problem:
      "SMBs spend hours every month manually downloading invoices, matching them against bank lines, and categorizing expenses inside QuickBooks or Xero.",
    solution:
      "A structured pipeline pulls attachments from a dedicated invoices inbox, extracts vendor, line items, tax, and totals via an OCR/vision-capable model, and logs everything directly into the client's accounting software.",
    result: "Cut monthly bookkeeping admin hours by 80% and eliminated manual data-entry errors.",
  },
  {
    number: "02",
    title: "Hyper-Personalized Lead Response & Outreach",
    problem:
      "Inbound leads go cold waiting hours for a reply, while outbound reps burn half their day researching prospects before a single cold email goes out.",
    solution:
      "Inbound leads are enriched, scored against the ideal customer profile, logged to the CRM, and a personalized reply is drafted for human review within minutes. Outbound targets get research-backed intro lines pulled from their recent activity.",
    result: "Doubled the meeting-booked rate by cutting response time to under 3 minutes with fully researched messaging.",
  },
  {
    number: "03",
    title: "Multi-Channel Content Repurposing Engine",
    problem:
      "Businesses know they need a content presence but don't have time to turn one podcast or webinar into a month of social content.",
    solution:
      "One raw recording dropped into a folder triggers transcription, a brand-voice-matched rewrite, and delivery of a blog post, five LinkedIn posts, a newsletter draft, and short-form video hooks — automatically.",
    result: "Turns 1 hour of raw content into a 30-day cross-platform campaign, saving $2,000+/month versus an agency retainer.",
  },
  {
    number: "04",
    title: "Automated SEO & GEO Content Pipeline",
    problem:
      "SMBs want organic traffic but can't afford an SEO agency — and now need to rank inside AI search engines like Perplexity, Gemini, and ChatGPT, not just Google.",
    solution:
      "A pipeline monitors competitor rankings, finds high-intent content gaps, and drafts authoritative, search-intent-matched articles delivered straight to the client's CMS as ready-to-review drafts.",
    result: "A self-sustaining content engine that gets the brand cited by AI search engines and ranked on Google, for a fraction of an agency's cost.",
  },
] as const;

/**
 * About / bio & portfolio page (DSGN-05 anonymity reversal): founder photo
 * (with monogram fallback), name/title/credentials/bio, an honest
 * live-vs-preview demos section, a disclosed illustrative-composite
 * portfolio, and the same elevated final CTA as the homepage. Reuses every
 * token/pattern from the homepage visual system directly — this is a direct
 * extension of the same design language, not a separate one.
 */
export default function About() {
  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pt-16 pb-8 sm:px-6 sm:pt-20">
        <div className="grid grid-cols-1 items-center gap-10 text-center sm:gap-12 md:grid-cols-[220px_1fr] md:text-left">
          <div className="mx-auto md:mx-0">
            <Avatar />
          </div>
          <div>
            <h1 className="font-heading text-2xl leading-[1.2] font-bold text-foreground sm:text-[2.75rem]">
              Hello, I&apos;m <AnimatedName name={siteConfig.founderName} />
            </h1>
            <p className="mt-2 text-lg font-bold text-primary">
              Forward Deployed Engineer &amp; AI-Native Consultant
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <span className="credential-pill">M.S., Georgia Tech — 4.0 GPA</span>
              <span className="credential-pill">
                Palantir Foundry Certified Application Developer
              </span>
            </div>
            <p className="mt-6 max-w-xl text-base leading-[1.75] text-foreground">
              I&apos;m an AI-native forward-deployed engineer with a
              Master&apos;s degree from Georgia Tech. I&apos;ve embedded
              inside businesses across supply chain, finance, and
              healthcare — modernizing how they actually work with AI built
              around their real workflows, not bolted on top of them. Every
              engagement is judged the same way: time recovered, workflows
              that run themselves, and profit that shows up on the books.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="section-label">Demos</p>
        <p className="mt-2 font-heading text-2xl leading-[1.2] font-bold text-foreground sm:text-[1.75rem]">
          See it in action.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {demos.map((demo) => (
            <GlowBox key={demo.title} className="h-full">
              <div className="flex h-full flex-col gap-3 p-6">
                <span className="demo-badge">{demo.badge}</span>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {demo.title}
                </h3>
                <p className="text-sm leading-[1.6] text-foreground/90">
                  {demo.body}
                </p>
                <Link
                  href={demo.href}
                  className="mt-2 inline-flex w-fit items-center gap-2 rounded-[8px] border border-border px-4 py-2 text-sm font-bold text-foreground transition-colors hover:border-foreground"
                >
                  {demo.cta} →
                </Link>
              </div>
            </GlowBox>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="section-label">Portfolio</p>
        <p className="mt-2 font-heading text-2xl leading-[1.2] font-bold text-foreground sm:text-[1.75rem]">
          Selected builds.
        </p>
        <p className="mt-4 max-w-xl text-base leading-[1.75] text-foreground">
          Representative examples of the kind of systems I build —
          illustrative composites based on the patterns I deploy most often,
          not client-identifying case studies.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {cases.map((item) => (
            <GlowBox key={item.number} className="h-full">
              <div className="flex h-full flex-col gap-4 p-8">
                <span className="text-xs font-bold tracking-[0.06em] text-muted-foreground">
                  {item.number}
                </span>
                <h3 className="font-heading text-xl leading-[1.25] font-bold text-foreground">
                  {item.title}
                </h3>
                <div>
                  <p className="text-xs font-bold tracking-[0.06em] text-primary uppercase">
                    The Problem
                  </p>
                  <p className="mt-1 text-sm leading-[1.65] text-foreground/90">
                    {item.problem}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.06em] text-primary uppercase">
                    The Solution
                  </p>
                  <p className="mt-1 text-sm leading-[1.65] text-foreground/90">
                    {item.solution}
                  </p>
                </div>
                <div className="case-result">
                  <p className="text-xs font-bold tracking-[0.06em] text-primary uppercase">
                    The Result
                  </p>
                  <p className="mt-1 text-sm leading-[1.65]">{item.result}</p>
                </div>
              </div>
            </GlowBox>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div
          className="finalcta-panel flex flex-col items-center gap-6 bg-[var(--accent-soft)] px-6 py-12 text-center text-foreground sm:px-12"
          style={{ borderRadius: "20px" }}
        >
          <h2 className="font-heading text-2xl leading-[1.75] font-bold sm:text-[1.75rem]">
            Want to see what this looks like for your business?
          </h2>
          <p className="max-w-md text-base leading-[1.75] text-foreground/90">
            Book a free audit. No commitment, no cost.
          </p>
          <ElevatedCta />
        </div>
      </section>
    </>
  );
}
