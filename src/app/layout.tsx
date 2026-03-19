import type { Metadata } from "next";
import Script from "next/script";
import "./global.css";
import AnalyticsBootstrap from "@/components/AnalyticsBootstrap";
import PostHogBootstrap from "@/components/PostHogProvider";
import { runtimeConfig } from "@/lib/runtimeConfig";

export const metadata: Metadata = {
  metadataBase: new URL(runtimeConfig.siteUrl),
  title: {
    default: "Safar AI Travel Planner",
    template: "%s | Safar AI Travel Planner",
  },
  description:
    "Production-grade AI travel planning for Indian travelers with live flight data, Google Places attractions, Booking.com affiliate links, and scalable destination SEO pages.",
  openGraph: {
    title: "Safar AI Travel Planner",
    description:
      "Plan domestic and international trips with live travel data, itinerary intelligence, visa guidance, and bookable partner links.",
    url: runtimeConfig.siteUrl,
    siteName: "Safar AI Travel Planner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Safar AI Travel Planner",
    description:
      "AI trip planning for Indian travelers with live travel data, SEO destination guides, and affiliate-ready booking flows.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {runtimeConfig.googleAnalyticsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${runtimeConfig.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${runtimeConfig.googleAnalyticsId}', { send_page_view: false });
              `}
            </Script>
          </>
        ) : null}
        {runtimeConfig.googleAdsenseClientId ? (
          <Script
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${runtimeConfig.googleAdsenseClientId}`}
          />
        ) : null}
      </head>
      <body>
        <PostHogBootstrap />
        <AnalyticsBootstrap />
        {children}
      </body>
    </html>
  );
}

