import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, Calendar, ArrowLeft, ArrowRight, Lightbulb, Sparkles } from "lucide-react";
import { blogPosts, getBlogPost, getRelatedPosts } from "@/data/blogPosts";
import ShareButtons from "./ShareButtons";

/* ---------- Static generation ---------- */

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return { title: "Post Not Found" };
  }
  return {
    title: `${post.title} | Safar AI Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [{ url: post.coverImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

/* ---------- Helpers ---------- */

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
    month: "long",
    day: "numeric",
  });
}

/* ---------- Simple Markdown Renderer ---------- */

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeader: string[] = [];

  function flushTable() {
    if (tableHeader.length === 0 && tableRows.length === 0) return;
    elements.push(
      <div key={`table-${elements.length}`} className="my-4 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          {tableHeader.length > 0 && (
            <thead>
              <tr>
                {tableHeader.map((h, i) => (
                  <th
                    key={i}
                    className="border border-border bg-surface-elevated px-3 py-2 text-left font-semibold text-text-primary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {tableRows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="border border-border px-3 py-2 text-text-secondary"
                  >
                    {formatInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableHeader = [];
    tableRows = [];
    inTable = false;
  }

  function formatInline(text: string): React.ReactNode {
    // Bold + inline code
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g;
    let last = 0;
    let match: RegExpExecArray | null;
    let idx = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > last) {
        parts.push(text.slice(last, match.index));
      }
      if (match[2]) {
        parts.push(
          <strong key={idx++} className="font-semibold text-text-primary">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        parts.push(
          <code
            key={idx++}
            className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono"
          >
            {match[3]}
          </code>
        );
      }
      last = match.index + match[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table row
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      // Separator row (|---|---|)
      if (cells.every((c) => /^[-:]+$/.test(c))) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    }

    // End of table
    if (inTable && !trimmed.startsWith("|")) {
      flushTable();
    }

    // Headings
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={elements.length}
          className="mt-8 mb-3 text-xl font-bold text-text-primary sm:text-2xl"
        >
          {formatInline(trimmed.slice(3))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3
          key={elements.length}
          className="mt-6 mb-2 text-lg font-bold text-text-primary"
        >
          {formatInline(trimmed.slice(4))}
        </h3>
      );
      continue;
    }

    // Unordered list item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <li
          key={elements.length}
          className="ml-5 list-disc text-text-secondary leading-relaxed"
        >
          {formatInline(trimmed.slice(2))}
        </li>
      );
      continue;
    }

    // Ordered list item
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (olMatch) {
      elements.push(
        <li
          key={elements.length}
          className="ml-5 list-decimal text-text-secondary leading-relaxed"
        >
          {formatInline(olMatch[2])}
        </li>
      );
      continue;
    }

    // Checkbox-style items
    if (trimmed.startsWith("✅")) {
      elements.push(
        <div
          key={elements.length}
          className="flex items-start gap-2 text-text-secondary leading-relaxed py-0.5"
        >
          <span className="mt-0.5 text-primary-600 shrink-0">✅</span>
          <span>{formatInline(trimmed.slice(2))}</span>
        </div>
      );
      continue;
    }

    // Empty line
    if (trimmed === "") {
      continue;
    }

    // Paragraph
    elements.push(
      <p key={elements.length} className="text-text-secondary leading-relaxed mb-3">
        {formatInline(trimmed)}
      </p>
    );
  }

  // Flush any remaining table
  if (inTable) flushTable();

  return elements;
}

/* ---------- Page Component ---------- */

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          Post Not Found
        </h1>
        <p className="mt-2 text-text-secondary">
          The blog post you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/blog"
          className="mt-6 inline-flex items-center gap-1 text-primary-600 font-medium hover:underline"
        >
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>
    );
  }

  const related = getRelatedPosts(slug, 3);

  return (
    <>
      {/* Schema.org Article markup */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            image: post.coverImage,
            datePublished: post.publishedAt,
            author: { "@type": "Person", name: post.author },
            publisher: {
              "@type": "Organization",
              name: "Safar AI",
            },
          }),
        }}
      />

      <article className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary-600 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        {/* Hero image */}
        <div className="relative aspect-[2/1] overflow-hidden rounded-2xl mb-6">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>

        {/* Meta */}
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-700"
            }`}
          >
            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
          </span>
          {post.destination && (
            <span className="text-text-muted">{post.destination}</span>
          )}
          <span className="flex items-center gap-1 text-text-muted">
            <Calendar size={13} />
            {formatDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-1 text-text-muted">
            <Clock size={13} />
            {post.readTime} min read
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl lg:text-4xl">
          {post.title}
        </h1>
        <p className="mt-2 text-sm text-text-muted">By {post.author}</p>

        {/* Share buttons */}
        <div className="mt-4 mb-8">
          <ShareButtons title={post.title} slug={post.slug} />
        </div>

        {/* Content area with optional sidebar */}
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
          {/* Main content */}
          <div className="prose-custom">{renderMarkdown(post.content)}</div>

          {/* Sidebar: Did You Know */}
          {post.didYouKnow && post.didYouKnow.length > 0 && (
            <aside className="mt-8 lg:mt-0">
              <div className="card sticky top-20 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={18} className="text-amber-500" />
                  <h3 className="font-bold text-text-primary">Did You Know?</h3>
                </div>
                <ul className="space-y-3">
                  {post.didYouKnow.map((fact, i) => (
                    <li
                      key={i}
                      className="rounded-lg bg-amber-50 p-3 text-sm text-text-secondary leading-relaxed"
                    >
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>

        {/* CTA: Plan this trip */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary-50 to-primary-100 p-6 sm:p-8 text-center">
          <Sparkles className="mx-auto mb-2 text-primary-600" size={28} />
          <h2 className="text-xl font-bold text-text-primary sm:text-2xl">
            Ready to plan this trip?
          </h2>
          <p className="mt-1 text-text-secondary">
            Let our AI build a personalised itinerary with real-time prices.
          </p>
          <Link
            href="/plan"
            className="btn-primary mt-4 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
          >
            Plan This Trip with AI <ArrowRight size={16} />
          </Link>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="mb-6 text-xl font-bold text-text-primary">
              Related Posts
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="group card overflow-hidden"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={rp.coverImage}
                      alt={rp.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        CATEGORY_COLORS[rp.category] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {rp.category.charAt(0).toUpperCase() +
                        rp.category.slice(1)}
                    </span>
                    <h3 className="mt-2 text-sm font-bold text-text-primary line-clamp-2 group-hover:text-primary-700 transition-colors">
                      {rp.title}
                    </h3>
                    <p className="mt-1 text-xs text-text-muted">
                      {rp.readTime} min read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
