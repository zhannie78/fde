import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/config/site";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});

const siteDescription =
  "AI transformation for small and medium businesses — free workflow audits, custom white-glove AI solutions.";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteDescription,
  openGraph: {
    title: siteConfig.name,
    description: siteDescription,
    type: "website",
  },
};

// Cloudflare Web Analytics — privacy-first (no cookies, no raw IP ever
// exposed), site-wide traffic/location analytics. NEXT_PUBLIC_ because the
// beacon token is a public identifier embedded in the rendered HTML, not a
// secret (same trust level as a GA measurement ID) — see .env.local.example
// for how to get one. Renders nothing until the founder sets the env var, so
// the site behaves identically before/after analytics is configured.
const cfBeaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetBrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
        {cfBeaconToken && (
          <Script
            src="https://static.cloudflare.com/beacon.min.js"
            data-cf-beacon={`{"token": "${cfBeaconToken}"}`}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
