import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/app/contact/contact-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Send a message about your business's workflow pain points — no pitch, just a plain conversation.",
};

/**
 * /contact — a lightweight, no-scheduling way to reach out (mirrors /book's
 * layout pattern). Stays a Server Component; only <ContactForm /> is a
 * Client Component, so the surrounding copy ships with zero extra client JS.
 */
export default function ContactPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16 sm:px-8 sm:py-24">
      <div className="flex flex-col gap-4 text-center sm:text-left">
        <h1 className="text-[1.75rem] leading-[1.2] font-heading font-bold text-foreground">
          Get in <span className="text-primary">Touch</span> with{" "}
          <Link href="/about" className="text-inherit no-underline">
            {siteConfig.founderName}
          </Link>
        </h1>
        <p className="text-base leading-[1.6] text-foreground">
          Not ready to book a call? Send a quick note about what&apos;s
          slowing your business down and I&apos;ll get back to you within
          one business day.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
