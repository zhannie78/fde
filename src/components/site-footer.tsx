import Link from "next/link";

import { BookCta } from "@/components/book-cta";
import { siteConfig } from "@/config/site";

const [brandPrefix, brandSuffix] = siteConfig.name.split(".");

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/#fix", label: "Approach" },
  { href: "/#offer", label: "Pricing" },
  { href: "/#process", label: "Process" },
  { href: "/about", label: "About" },
];

/**
 * Light footer on the paper surface: wordmark, page nav links (including
 * About), a "Questions?" + "Contact Me" CTA pair pointing to /contact, and a
 * siteConfig.domain-derived copyright line. All identity values come from
 * siteConfig, never hardcoded literals. Only ProcessTransparency uses the
 * dark ink band in this system.
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

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Questions?</span>
          <BookCta label="Contact Me" href="/contact" />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
