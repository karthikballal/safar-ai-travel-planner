import { getVisaInfo } from "@/lib/visaIntelligence";
import {
  seoDestinations,
  seoDurations,
  seoPageTypes,
  seoThemes,
  type SeoDestination,
  type SeoPageType,
  type TravelTheme,
} from "@/lib/seoCatalog";

export interface SeoPageDescriptor {
  slug: string;
  destination: SeoDestination;
  duration: number;
  theme: TravelTheme;
  pageType: SeoPageType;
  title: string;
  description: string;
}

function startCase(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildTitle(destination: SeoDestination, duration: number, theme: TravelTheme, pageType: SeoPageType): string {
  const themeLabel = startCase(theme);

  if (pageType === "trip-cost") {
    return `${duration}-Day ${themeLabel} ${destination.name} Trip Cost From India`;
  }

  if (pageType === "itinerary") {
    return `${duration}-Day ${destination.name} Itinerary From India`;
  }

  if (pageType === "trip-plan") {
    return `${themeLabel} ${destination.name} Trip Plan From India`;
  }

  return `${duration}-Day ${themeLabel} ${destination.name} Travel Guide From India`;
}

function buildDescription(destination: SeoDestination, duration: number, theme: TravelTheme, pageType: SeoPageType): string {
  const base = `${destination.name} travel guide for Indian travelers with itinerary ideas, budget range, visa notes, attractions, hotel suggestions, and launch CTA into Safar AI Planner.`;

  if (pageType === "trip-cost") {
    return `Estimate a ${duration}-day ${theme} ${destination.name} trip cost from India, including hotels, attractions, and planning tips.`;
  }

  if (pageType === "itinerary") {
    return `Use this ${duration}-day ${destination.name} itinerary from India for route ideas, costs, attractions, and smarter planning with Safar AI.`;
  }

  if (pageType === "trip-plan") {
    return `Plan a ${theme} ${destination.name} trip from India with trip cost, visa guidance, best areas to stay, and destination tips.`;
  }

  return base;
}

function buildProgrammaticSlug(destination: SeoDestination, duration: number, theme: TravelTheme, pageType: SeoPageType): string {
  if (pageType === "trip-cost") {
    return `${duration}-day-${theme}-${destination.slug}-trip-cost-from-india`;
  }

  if (pageType === "itinerary") {
    return `${duration}-day-${theme}-${destination.slug}-itinerary`;
  }

  if (pageType === "trip-plan") {
    return `${duration}-day-${theme}-${destination.slug}-trip-plan-from-india`;
  }

  return `${duration}-day-${theme}-${destination.slug}-travel-guide-from-india`;
}

function buildBaseAliases(destination: SeoDestination): SeoPageDescriptor[] {
  const duration = destination.idealDurations[0] || 5;
  const theme = destination.themes[0] || "family";

  return [
    {
      slug: `${destination.slug}-trip-cost-from-india`,
      destination,
      duration,
      theme,
      pageType: "trip-cost",
      title: `${destination.name} Trip Cost From India`,
      description: `Check typical ${destination.name} trip cost from India with planning tips, visa notes, hotels, and attractions.`,
    },
    {
      slug: `${destination.slug}-itinerary-from-india`,
      destination,
      duration,
      theme,
      pageType: "itinerary",
      title: `${destination.name} Itinerary From India`,
      description: `Build a practical ${destination.name} itinerary from India with route logic, hotels, attractions, and a CTA into Safar AI Planner.`,
    },
    {
      slug: `${duration}-day-${destination.slug}-itinerary`,
      destination,
      duration,
      theme,
      pageType: "itinerary",
      title: `${duration}-Day ${destination.name} Itinerary`,
      description: `Use this ${duration}-day ${destination.name} itinerary for a tighter plan with cost, hotels, attractions, and travel tips.`,
    },
    {
      slug: `${destination.slug}-trip-plan-from-india`,
      destination,
      duration,
      theme,
      pageType: "trip-plan",
      title: `${destination.name} Trip Plan From India`,
      description: `Plan your ${destination.name} trip from India with budget ranges, hotel suggestions, visa notes, and route ideas.`,
    },
  ];
}

const allProgrammaticPages: SeoPageDescriptor[] = seoDestinations.flatMap((destination) => [
  ...buildBaseAliases(destination),
  ...seoDurations.flatMap((duration) =>
    seoThemes.flatMap((theme) =>
      seoPageTypes.map((pageType) => ({
        slug: buildProgrammaticSlug(destination, duration, theme, pageType),
        destination,
        duration,
        theme,
        pageType,
        title: buildTitle(destination, duration, theme, pageType),
        description: buildDescription(destination, duration, theme, pageType),
      }))
    )
  ),
]);

const seoPageMap = new Map(allProgrammaticPages.map((page) => [page.slug, page]));

export function getAllSeoPages(): SeoPageDescriptor[] {
  return allProgrammaticPages;
}

export function getSeoPageBySlug(slug: string): SeoPageDescriptor | null {
  return seoPageMap.get(slug) || null;
}

export function getRelatedSeoPages(page: SeoPageDescriptor, limit = 6): SeoPageDescriptor[] {
  return allProgrammaticPages
    .filter((candidate) => candidate.slug !== page.slug)
    .filter(
      (candidate) =>
        candidate.destination.slug === page.destination.slug ||
        candidate.theme === page.theme ||
        candidate.duration === page.duration
    )
    .slice(0, limit);
}

export function getSeoCostEstimate(page: SeoPageDescriptor): { low: number; mid: number; high: number } {
  const multiplier = page.duration / 5;
  const themeMultiplier =
    page.theme === "budget"
      ? 0.9
      : page.theme === "luxury"
        ? 1.45
        : page.theme === "honeymoon"
          ? 1.2
          : 1;

  return {
    low: Math.round(page.destination.estimatedCostFromIndia.budget * multiplier * themeMultiplier),
    mid: Math.round(page.destination.estimatedCostFromIndia.comfort * multiplier * themeMultiplier),
    high: Math.round(page.destination.estimatedCostFromIndia.premium * multiplier * themeMultiplier),
  };
}

export function getSeoPageContent(page: SeoPageDescriptor) {
  const visa = getVisaInfo(page.destination.name);
  const cost = getSeoCostEstimate(page);

  const itinerarySummary = [
    `Day 1-${Math.max(1, Math.ceil(page.duration / 3))}: arrive and settle into ${page.destination.name} with core highlights near your first base.`,
    `Middle segment: focus on ${page.theme} travel priorities, balancing transport time with ${page.destination.attractions.slice(0, 3).join(", ")}.`,
    `Final stretch: reserve slower blocks for local food, shopping, or scenic downtime before departure.`,
  ];

  return {
    visa,
    cost,
    itinerarySummary,
    overview: page.destination.overview,
    destinationOverview: `${page.destination.name} is a ${page.destination.category} destination with strong demand from Indian travelers looking for ${page.theme} trips over ${page.duration} days.`,
  };
}
