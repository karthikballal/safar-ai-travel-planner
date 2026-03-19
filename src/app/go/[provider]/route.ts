import { NextRequest, NextResponse } from "next/server";
import { isAllowedAffiliateHost, SUPPORTED_PROVIDERS } from "@/lib/affiliate/links";
import { trackAffiliateClick } from "@/lib/affiliate/tracker";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;

  if (!SUPPORTED_PROVIDERS.includes(provider as (typeof SUPPORTED_PROVIDERS)[number])) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Support both "target" and "url" query params
  const target = request.nextUrl.searchParams.get("url") ||
    request.nextUrl.searchParams.get("target") || "";

  if (!target || !isAllowedAffiliateHost(target)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const label = request.nextUrl.searchParams.get("label") || provider;
  const category = (request.nextUrl.searchParams.get("category") || "flight") as
    "flight" | "hotel" | "activity" | "insurance" | "train";
  const tripId = request.nextUrl.searchParams.get("trip") || undefined;

  // Track click asynchronously (don't block redirect)
  trackAffiliateClick({
    provider,
    category,
    destinationUrl: target,
    label,
    tripId,
    referrerPage: request.headers.get("referer") || undefined,
  }).catch(() => {});

  return NextResponse.redirect(target, { status: 307 });
}