import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const routes = ["", "/about", "/services", "/book"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = `https://${siteConfig.domain}`;

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}
