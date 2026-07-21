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

const [brandPrefix, brandSuffix] = siteConfig.name.split(".");

const navLinks = [
  { href: "/#fix", label: "Approach" },
  { href: "/#offer", label: "Pricing" },
  { href: "/#process", label: "Process" },
  { href: "/about", label: "About" },
];

/**
 * Sticky light frosted-glass header rendered in the root layout so it wraps
 * every route: wordmark, desktop nav (Services, About per D-08), and the
 * primary BookCta. Mobile visitors get the hamburger-triggered MobileNav
 * instead. Only ProcessTransparency uses the dark ink band in this system —
 * chrome stays on the light paper surface with a border-bottom hairline.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 text-foreground backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="font-heading text-lg font-bold text-foreground"
        >
          {brandPrefix}
          <span className="text-primary">.</span>
          {brandSuffix}
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavigationMenu viewport={false}>
            <NavigationMenuList className="gap-6">
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    asChild
                    className="rounded-none border-b-2 border-transparent bg-transparent p-0 pb-1 text-muted-foreground hover:border-primary hover:bg-transparent hover:text-primary focus:bg-transparent data-active:bg-transparent"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <BookCta glow />
        </div>

        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
