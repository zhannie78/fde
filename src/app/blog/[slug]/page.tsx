import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ElevatedCta } from "@/components/ui/elevated-cta";
import { siteConfig } from "@/config/site";
import { getAllPosts, getPostBySlug } from "@/content/blog/posts";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

// Pre-render every known post at build time. Combined with the notFound()
// fallback below, arbitrary/probing slugs never render post content — only
// slugs registered in src/content/blog/posts.ts do (T-c67-01).
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  const url = `https://${siteConfig.domain}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.date,
    },
  };
}

function formatDate(dateISO: string): string {
  return new Date(`${dateISO}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const url = `https://${siteConfig.domain}/blog/${post.slug}`;

  // Built as a JS object and JSON.stringify'd — every field comes from the
  // trusted in-repo `meta`, never from request-derived input, so no
  // untrusted string reaches dangerouslySetInnerHTML (T-c67-02).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: siteConfig.founderName,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    mainEntityOfPage: url,
    url,
  };

  const Body = post.Body;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16 sm:px-8 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <time dateTime={post.date} className="text-sm font-bold tracking-[0.02em] text-primary uppercase">
            {formatDate(post.date)}
          </time>
          <h1 className="text-[1.75rem] leading-[1.2] font-heading font-bold text-foreground sm:text-3xl">
            {post.title}
          </h1>
        </div>
        <div className="blog-prose">
          <Body />
        </div>
      </article>

      <div className="flex flex-col items-center gap-4 border-t border-border pt-10 text-center">
        <p className="text-base leading-[1.6] text-foreground">
          Ready to see where your own business is leaking time or money?
        </p>
        <ElevatedCta />
        <p className="text-sm text-muted-foreground">
          Prefer to talk it through first?{" "}
          <Link href="/contact" className="text-primary underline hover:text-primary/80">
            Reach out directly
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
