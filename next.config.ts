import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        // Conservative, low-priority hardening headers (T-06-03). Only
        // `frame-ancestors` is set on the CSP — it controls who may embed
        // THIS site in an iframe, not iframes this site itself loads, so
        // it does not affect the Cal.com booking widget on /book (which
        // creates its own iframe pointing at cal.com).
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
