import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSeoPages, getRelatedSeoPages, getSeoPageBySlug, getSeoPageContent } from "@/lib/seoPages";
import { runtimeConfig } from "@/lib/runtimeConfig";

export const revalidate = 86400;

export async function generateStaticParams() {
  return getAllSeoPages().slice(0, 120).map((page) => ({ slug: page.slug }));
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const page = getSeoPageBySlug(slug);
  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/${page.slug}`,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${runtimeConfig.siteUrl}/${page.slug}`,
      type: "article",
    },
  };
}

export default async function SeoLandingPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const page = getSeoPageBySlug(slug);
  if (!page) {
    notFound();
  }

  const content = getSeoPageContent(page);
  const relatedPages = getRelatedSeoPages(page, 6);
  const schema = {
    "@context": "https://schema.org",
    "@type": "TravelGuide",
    name: page.title,
    description: page.description,
    url: `${runtimeConfig.siteUrl}/${page.slug}`,
    about: {
      "@type": "TouristDestination",
      name: page.destination.name,
      description: content.destinationOverview,
    },
    audience: {
      "@type": "Audience",
      geographicArea: "India",
    },
  };

  return (
    <main className="min-h-screen bg-[#050510] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300/80">
          Programmatic Destination Page
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          {page.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-white/70 sm:text-lg">
          {page.description}
        </p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/60">
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            Best time: {page.destination.bestTime}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            Theme: {page.theme}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            Duration: {page.duration} days
          </span>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Launch Safar AI Planner
          </Link>
          <Link
            href="/#planner"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            Start with live planning
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <article className="rounded-3xl border border-white/8 bg-white/4 p-6">
          <h2 className="text-2xl font-bold">Destination overview</h2>
          <p className="mt-4 text-sm leading-7 text-white/70">{content.overview}</p>
          <p className="mt-4 text-sm leading-7 text-white/70">{content.destinationOverview}</p>
        </article>

        <article className="rounded-3xl border border-white/8 bg-white/4 p-6">
          <h2 className="text-2xl font-bold">Estimated trip cost</h2>
          <div className="mt-5 space-y-3 text-sm text-white/70">
            <p>Budget: ₹{content.cost.low.toLocaleString("en-IN")}</p>
            <p>Comfort: ₹{content.cost.mid.toLocaleString("en-IN")}</p>
            <p>Premium: ₹{content.cost.high.toLocaleString("en-IN")}</p>
          </div>
          <p className="mt-4 text-xs text-white/45">
            Cost ranges are destination-level editorial estimates for Indian travelers and should be validated against live partner pricing inside the planner.
          </p>
        </article>

        <article className="rounded-3xl border border-white/8 bg-white/4 p-6">
          <h2 className="text-2xl font-bold">Itinerary summary</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-white/70">
            {content.itinerarySummary.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-white/8 bg-white/4 p-6">
          <h2 className="text-2xl font-bold">Visa requirements</h2>
          <p className="mt-4 text-sm leading-7 text-white/70">
            {content.visa?.notes || page.destination.visaSummary}
          </p>
          <p className="mt-4 text-sm leading-7 text-white/70">
            Recommended planning lead time: {content.visa?.recommendedLeadDays || 21} days.
          </p>
        </article>

        <article className="rounded-3xl border border-white/8 bg-white/4 p-6">
          <h2 className="text-2xl font-bold">Recommended attractions</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-white/70">
            {page.destination.attractions.map((attraction) => (
              <li key={attraction}>{attraction}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-white/8 bg-white/4 p-6">
          <h2 className="text-2xl font-bold">Hotel suggestions</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-white/70">
            {page.destination.hotelSuggestions.map((hotel) => (
              <li key={hotel}>{hotel}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-white/8 bg-white/4 p-6 lg:col-span-2">
          <h2 className="text-2xl font-bold">Travel tips</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-white/70">
            {page.destination.travelTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-8">
          <h2 className="text-2xl font-bold">Plan it with Safar AI</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
            Turn this SEO guide into a live plan with route generation, Booking.com affiliate hotel links, Google Places activity discovery, visa guidance, and partner flight redirects.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-indigo-50"
          >
            Open Safar AI Planner
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold">Related travel pages</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {relatedPages.map((relatedPage) => (
            <Link
              key={relatedPage.slug}
              href={`/${relatedPage.slug}`}
              className="rounded-2xl border border-white/8 bg-white/4 p-5 transition hover:border-indigo-400/30 hover:bg-white/6"
            >
              <p className="text-sm font-semibold text-white">{relatedPage.title}</p>
              <p className="mt-2 text-sm leading-6 text-white/55">{relatedPage.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}