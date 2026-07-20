import Link from "next/link";

import { BookCta } from "@/components/book-cta";
import { MobileNav } from "@/components/mobile-nav";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { siteConfig } from "@/config/site";

const navLinks = [
  { href: "/#offer", label: "Pricing" },
  { href: "/#process", label: "How It Works" },
];

/**
 * Sticky ink-navy header rendered in the root layout so it wraps every
 * route: wordmark, desktop nav (Services, About per D-08), and the primary
 * BookCta. Mobile visitors get the hamburger-triggered MobileNav instead.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-secondary text-secondary-foreground">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="font-heading text-lg font-semibold text-secondary-foreground"
        >
          {siteConfig.name}
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavigationMenu viewport={false}>
            <NavigationMenuList className="gap-6">
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    asChild
                    className="rounded-none border-b-2 border-transparent bg-transparent p-0 pb-1 text-secondary-foreground hover:border-primary hover:bg-transparent hover:text-primary focus:bg-transparent data-active:bg-transparent"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <BookCta />
        </div>

        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
