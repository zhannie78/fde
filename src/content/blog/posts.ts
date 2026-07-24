import type { ComponentType } from "react";

import * as whatIsAnFde from "@/content/blog/what-is-a-forward-deployed-engineer";
import * as whySmbsFallBehind from "@/content/blog/why-smbs-that-skip-ai-automation-will-fall-behind";

/**
 * Typed content model for the blog. Each post lives as its own TSX module
 * under src/content/blog/ exporting `meta` (BlogPostMeta) and a default-export
 * `Body` React component containing the post prose as semantic HTML. This
 * registry wires those modules together — no CMS, no database, no MDX
 * pipeline, matching the project's lean, solo-maintained stack.
 */
export type BlogPostMeta = {
  slug: string;
  title: string;
  /** ~1-2 sentence summary shown on the /blog listing card. */
  excerpt: string;
  /** Meta-description length (~150 chars), used for <meta name="description">. */
  description: string;
  /** ISO date string, e.g. "2026-07-24". */
  date: string;
};

export type BlogPost = BlogPostMeta & {
  Body: ComponentType;
};

function toPost(mod: { meta: BlogPostMeta; default: ComponentType }): BlogPost {
  return { ...mod.meta, Body: mod.default };
}

const posts: BlogPost[] = [toPost(whatIsAnFde), toPost(whySmbsFallBehind)];

/** All posts, sorted newest-first by `date`. */
export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Look up a single post by slug, or undefined if no post matches. */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}
