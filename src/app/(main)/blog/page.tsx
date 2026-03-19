"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { blogPosts, type BlogPost } from "@/data/blogPosts";

const CATEGORIES = [
  { key: "all" as const, label: "All" },
  { key: "guides" as const, label: "Guides" },
  { key: "tips" as const, label: "Tips" },
  { key: "facts" as const, label: "Facts" },
  { key: "budget" as const, label: "Budget" },
  { key: "food" as const, label: "Food" },
];

const CATEGORY_COLORS: Record<string, string> = {
  guides: "bg-primary-100 text-primary-700",
  tips: "bg-amber-100 text-amber-700",
  facts: "bg-violet-100 text-violet-700",
  budget: "bg-emerald-100 text-emerald-700",
  food: "bg-orange-100 text-orange-700",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="card overflow-hidden transition-all duration-300 group-hover:-translate-y-1">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute left-3 top-3">
            <span
              className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-700"
              }`}
            >
              {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </span>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <h2 className="text-base font-bold text-text-primary line-clamp-2 group-hover:text-primary-700 transition-colors sm:text-lg">
            {post.title}
          </h2>
          <p className="mt-2 text-sm text-text-secondary line-clamp-2">
            {post.excerpt}
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {post.readTime} min read
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary-600 opacity-0 transition-opacity group-hover:opacity-100">
            Read more <ArrowRight size={14} />
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered =
    activeCategory === "all"
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Schema.org Blog markup */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Safar AI Travel Blog",
            description:
              "Travel tips, guides, and stories for Indian travelers",
            url: "https://safarai.in/blog",
            publisher: {
              "@type": "Organization",
              name: "Safar AI",
            },
            blogPost: blogPosts.map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              datePublished: post.publishedAt,
              author: { "@type": "Person", name: post.author },
              image: post.coverImage,
              url: `https://safarai.in/blog/${post.slug}`,
            })),
          }),
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            Travel Blog
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-text-secondary">
            Tips, guides, and stories to help you travel smarter and cheaper.
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeCategory === key
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Blog grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-text-muted">
            No posts found in this category yet.
          </div>
        )}
      </div>
    </>
  );
}
