# Safar AI Production Upgrade

## What changed

- Replaced synthetic flight, hotel, and attraction responses with provider-backed adapters.
- Added FlightDataAPI support for flights, with Kiwi Tequila, SerpAPI, and partner redirects as fallback.
- Added Google Places powered hotel and attraction discovery.
- Added Booking.com affiliate redirect support for hotel monetization.
- Added programmatic SEO pages, sitemap generation, robots rules, structured metadata, and internal linking.
- Added client analytics hooks for planner starts, completions, page views, and affiliate redirects.
- Added cache headers and in-memory TTL caching for expensive provider calls.

## Required environment variables

- `NEXT_PUBLIC_SITE_URL`: production canonical base URL.
- `FLIGHTDATAAPI_KEY`: primary live flight search via FlightDataAPI.
- `KIWI_TEQUILA_API_KEY`: live flight search via Kiwi Tequila.
- `SERPAPI_KEY`: secondary flight provider for Google Flights scraping.
- `GOOGLE_PLACES_API_KEY`: hotel and attraction discovery.
- `BOOKING_AFFILIATE_ID`: Booking.com affiliate `aid` value.
- `NEXT_PUBLIC_GA_ID`: optional Google Analytics 4 property ID.
- `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT`: optional AdSense client ID.

## Deployment notes for Vercel

- Deploy as a standard Next.js app on Vercel.
- Configure the environment variables above in the Vercel project settings.
- Set the production domain in `NEXT_PUBLIC_SITE_URL` so canonical tags, sitemap URLs, and robots host are correct.
- If the planner is expected to sustain high SEO traffic, move the in-memory cache to Vercel KV or Redis. The current cache abstraction is intentionally thin so that swap is low-risk.

## Recommended next infrastructure steps

- Move analytics from console ingestion to a warehouse or product analytics provider.
- Add Vercel KV or Redis-backed cache persistence for cross-instance cache hits.
- Add Search Console, GA4 goals, and affiliate revenue dashboards.
- Add destination content editorial QA before expanding the SEO catalog beyond the current set.