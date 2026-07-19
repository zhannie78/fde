import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";

/**
 * Founder credibility strip (D-09 #4): the D-07 temporary founder-photo
 * placeholder, founder name from siteConfig, and a one-line FDE story
 * linking to /about. Biographical specifics are clearly-bracketed
 * placeholders (D-13) — no invented biography facts.
 */
export function FounderStrip() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
        <Image
          src="/founder-placeholder.svg"
          alt={`${siteConfig.founderName}, founder of ${siteConfig.name}`}
          width={96}
          height={96}
          className="h-24 w-24 flex-none rounded-full ring-1 ring-border"
        />
        <div className="flex flex-col gap-2">
          <p className="text-base leading-[1.6] text-foreground">
            <span className="font-heading font-semibold">
              {siteConfig.founderName}
            </span>{" "}
            spent years as a forward-deployed engineer, embedded inside
            [client organizations — sector TBD] to find the workflow pain
            teams couldn&apos;t name themselves, then shipped the fix. Now she
            does the same thing for businesses in [{siteConfig.region}].
          </p>
          <Link
            href="/about"
            className="text-base font-semibold text-primary underline decoration-2 underline-offset-4"
          >
            Read the full story &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
