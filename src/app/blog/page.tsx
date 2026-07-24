import type { Metadata } from "next";
import Link from "next/link";

import { getAllPosts } from "@/content/blog/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on forward-deployed engineering, AI automation, and how small businesses can recover time and money with Claude-powered workflows.",
};

function formatDate(dateISO: string): string {
  return new Date(`${dateISO}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * /blog — static listing page. Server Component; posts are plain in-repo
 * TSX content modules (src/content/blog/posts.ts), no CMS/database.
 */
export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16 sm:px-8 sm:py-24">
      <div className="flex flex-col gap-4 text-center sm:text-left">
        <h1 className="text-[1.75rem] leading-[1.2] font-heading font-bold text-foreground">
          The <span className="text-primary">Blog</span>
        </h1>
        <p className="text-base leading-[1.6] text-foreground">
          Field notes on forward-deployed engineering and AI automation for small
          businesses — what actually works, and what to fix first.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
          >
            <time
              dateTime={post.date}
              className="text-sm font-bold tracking-[0.02em] text-primary uppercase"
            >
              {formatDate(post.date)}
            </time>
            <h2 className="font-heading text-xl font-bold text-foreground group-hover:text-primary">
              {post.title}
            </h2>
            <p className="text-base leading-[1.6] text-muted-foreground">{post.excerpt}</p>
          </Link>
        ))}
      </div>

      <p className="text-base leading-[1.6] text-foreground">
        Curious what this could look like for your own business? Start with a{" "}
        <Link href="/book" className="text-primary underline hover:text-primary/80">
          free workflow audit
        </Link>
        .
      </p>
    </div>
  );
}
