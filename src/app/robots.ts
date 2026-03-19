import type { MetadataRoute } from "next";
import { runtimeConfig } from "@/lib/runtimeConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/go/"],
    },
    sitemap: `${runtimeConfig.siteUrl}/sitemap.xml`,
    host: runtimeConfig.siteUrl,
  };
}
