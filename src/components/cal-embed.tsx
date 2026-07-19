"use client";

import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

import { siteConfig } from "@/config/site";

/**
 * Isolated Cal.com booking embed (D-01/D-02/D-03).
 *
 * This is the ONLY place `@calcom/embed-react` is loaded — keeping the
 * "use client" boundary as small as possible so the rest of /book stays a
 * Server Component. Theme is configured in exactly one place (the
 * `getCalApi` -> `cal("ui", ...)` call below), never also on the `<Cal>`
 * config prop, to avoid the documented light/dark theme-flash bug.
 *
 * If the embed script fails to load, we fall back to the UI-SPEC error
 * state: a role="alert" block with a mailto founder-email fallback so a
 * failed embed never dead-ends the visitor (T-03-02).
 */
export function CalEmbed() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const cal = await getCalApi({ namespace: siteConfig.calNamespace });
        cal("ui", {
          theme: "light",
          hideEventTypeDetails: false,
          layout: "month_view",
          styles: { branding: { brandColor: "#1F6E4A" } },
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-destructive p-6 text-destructive"
      >
        Couldn&apos;t load the booking calendar. Email {siteConfig.founderName}{" "}
        directly at{" "}
        <a href={`mailto:${siteConfig.founderEmail}`} className="underline">
          {siteConfig.founderEmail}
        </a>{" "}
        and she&apos;ll find a time — usually within one business day.
      </div>
    );
  }

  return (
    <Cal
      namespace={siteConfig.calNamespace}
      calLink={siteConfig.calLink}
      style={{ width: "100%", height: "100%", minHeight: "700px", overflow: "scroll" }}
      config={{ layout: "month_view" }}
    />
  );
}
