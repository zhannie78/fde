"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";

import { BookCta } from "@/components/book-cta";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/#offer", label: "Pricing" },
  { href: "/#process", label: "How It Works" },
];

/**
 * Mobile-only nav: 44px hamburger toggle (WCAG 2.5.5) opening a slide-out
 * sheet with the same links + BookCta as the desktop header.
 */
export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="h-11 w-11 text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
        >
          <Menu className="size-6" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex flex-col gap-0 bg-background text-foreground"
      >
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle>Menu</SheetTitle>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close menu"
              className="h-11 w-11"
            >
              <X className="size-6" aria-hidden="true" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <nav className="flex flex-col gap-4 px-4" aria-label="Mobile">
          {navLinks.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className="text-base font-medium text-foreground hover:text-primary"
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="mt-auto p-4">
          <BookCta />
        </div>
      </SheetContent>
    </Sheet>
  );
}
