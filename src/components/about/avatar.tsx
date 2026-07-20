"use client";

import { useState } from "react";
import Image from "next/image";

import { siteConfig } from "@/config/site";

/**
 * Isolated `next/image` + `onError` failure-flag Client Component (same
 * "small `use client` boundary, `useState` failure flag, graceful fallback"
 * shape as `cal-embed.tsx`). Renders the real founder photo from `public/`;
 * if the image ever 404s, falls back to a monogram placeholder derived from
 * `siteConfig.founderName` instead of a broken-image icon (T-06-11).
 */
export function Avatar() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="avatar-wrap flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, var(--accent-soft), #fff)" }}
      >
        <span className="text-[64px] font-bold text-[var(--accent)]">
          {siteConfig.founderName.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <div className="avatar-wrap">
      <Image
        src="/annie-photo.jpg"
        alt={siteConfig.founderName}
        width={200}
        height={200}
        className="avatar-photo rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
