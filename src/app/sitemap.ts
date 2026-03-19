import type { MetadataRoute } from "next";
import { runtimeConfig } from "@/lib/runtimeConfig";
import { getAllSeoPages } from "@/lib/seoPages";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const seoEntries = getAllSeoPages().map((page) => ({
    url: `${runtimeConfig.siteUrl}/${page.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: page.pageType === "trip-cost" ? 0.7 : 0.8,
  }));

  return [
    {
      url: runtimeConfig.siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...seoEntries,
  ];
}
