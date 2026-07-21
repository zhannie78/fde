import Link from "next/link";

import { BookCta } from "@/components/book-cta";
import { siteConfig } from "@/config/site";

const [brandPrefix, brandSuffix] = siteConfig.name.split(".");

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/#fix", label: "Approach" },
  { href: "/#offer", label: "Pricing" },
  { href: "/#process", label: "Process" },
  { href: "/book", label: "Book" },
];

/**
 * Light footer on the paper surface: page links, founder region + mailto
 * contact (D-10 — no separate contact page), and a repeated BookCta. All
 * identity values come from siteConfig, never hardcoded literals. Only
 * ProcessTransparency uses the dark ink band in this system.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="space-y-2">
          <p className="font-heading text-lg font-bold">
            {brandPrefix}
            <span className="text-primary">.</span>
            {brandSuffix}
          </p>
          <p className="text-sm text-muted-foreground">{siteConfig.region}</p>
          <a
            href={`mailto:${siteConfig.founderEmail}`}
            className="inline-block text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {siteConfig.founderEmail}
          </a>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div>
          <BookCta />
        </div>
      </div>
    </footer>
  );
}
