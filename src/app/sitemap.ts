import type { MetadataRoute } from "next";
import { runtimeConfig } from "@/lib/runtimeConfig";
import { getAllSeoPages } from "@/lib/seoPages";
import { blogPosts } from "@/data/blogPosts";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const seoEntries = getAllSeoPages().map((page) => ({
    url: `${runtimeConfig.siteUrl}/${page.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: page.pageType === "trip-cost" ? 0.7 : 0.8,
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: `${runtimeConfig.siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: runtimeConfig.siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${runtimeConfig.siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${runtimeConfig.siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...blogEntries,
    ...seoEntries,
  ];
}
