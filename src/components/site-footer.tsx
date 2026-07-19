import Link from "next/link";

import { BookCta } from "@/components/book-cta";
import { siteConfig } from "@/config/site";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/book", label: "Book" },
];

/**
 * Ink-navy footer: page links, founder region + mailto contact (D-10 — no
 * separate contact page), and a repeated BookCta. All identity values come
 * from siteConfig, never hardcoded literals.
 */
export function SiteFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="space-y-2">
          <p className="font-heading text-lg font-semibold">{siteConfig.name}</p>
          <p className="text-sm text-secondary-foreground/80">{siteConfig.region}</p>
          <a
            href={`mailto:${siteConfig.founderEmail}`}
            className="inline-block text-sm text-secondary-foreground/80 underline-offset-4 hover:text-primary hover:underline"
          >
            {siteConfig.founderEmail}
          </a>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-secondary-foreground/80 hover:text-primary"
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
