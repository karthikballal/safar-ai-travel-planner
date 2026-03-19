// ─── Visa Intelligence ────────────────────────────────────────────────────────
// Smart default start date based on visa processing requirements.
// If a destination requires a prior visa (not visa-on-arrival, not visa-free),
// the default start date should be at least 1 month from today.

export interface VisaInfo {
  destination: string;
  visaRequired: boolean;
  visaType: "visa-free" | "visa-on-arrival" | "e-visa" | "sticker-visa";
  processingDays: number;     // Typical processing time in business days
  recommendedLeadDays: number; // How far ahead to plan (including buffer)
  notes?: string;
}

// Visa requirements for Indian passport holders (2025-2026 data)
const visaData: Record<string, VisaInfo> = {
  // Visa-free or visa-on-arrival — can travel on short notice
  thailand:    { destination: "Thailand", visaRequired: false, visaType: "visa-free", processingDays: 0, recommendedLeadDays: 14, notes: "Visa-free for 60 days" },
  indonesia:   { destination: "Indonesia", visaRequired: false, visaType: "visa-on-arrival", processingDays: 0, recommendedLeadDays: 14, notes: "VOA for 30 days (₹3,000 at airport)" },
  bali:        { destination: "Bali", visaRequired: false, visaType: "visa-on-arrival", processingDays: 0, recommendedLeadDays: 14 },
  maldives:    { destination: "Maldives", visaRequired: false, visaType: "visa-on-arrival", processingDays: 0, recommendedLeadDays: 14 },
  mauritius:   { destination: "Mauritius", visaRequired: false, visaType: "visa-free", processingDays: 0, recommendedLeadDays: 14 },
  nepal:       { destination: "Nepal", visaRequired: false, visaType: "visa-free", processingDays: 0, recommendedLeadDays: 7 },
  bhutan:      { destination: "Bhutan", visaRequired: false, visaType: "visa-free", processingDays: 0, recommendedLeadDays: 14 },
  "sri lanka": { destination: "Sri Lanka", visaRequired: true, visaType: "e-visa", processingDays: 3, recommendedLeadDays: 14, notes: "ETA online, approved within 48 hours" },
  malaysia:    { destination: "Malaysia", visaRequired: true, visaType: "e-visa", processingDays: 5, recommendedLeadDays: 21, notes: "eNTRI or eVISA, processed within 48h" },
  singapore:   { destination: "Singapore", visaRequired: true, visaType: "e-visa", processingDays: 5, recommendedLeadDays: 21, notes: "E-visa via authorized agent, 3-5 business days" },
  cambodia:    { destination: "Cambodia", visaRequired: false, visaType: "visa-on-arrival", processingDays: 0, recommendedLeadDays: 14 },
  vietnam:     { destination: "Vietnam", visaRequired: true, visaType: "e-visa", processingDays: 5, recommendedLeadDays: 21 },

  // E-visa with moderate processing — plan 2-3 weeks ahead
  dubai:       { destination: "Dubai", visaRequired: true, visaType: "e-visa", processingDays: 5, recommendedLeadDays: 21, notes: "UAE e-visa, 3-5 business days" },
  "abu dhabi": { destination: "Abu Dhabi", visaRequired: true, visaType: "e-visa", processingDays: 5, recommendedLeadDays: 21 },
  turkey:      { destination: "Turkey", visaRequired: true, visaType: "e-visa", processingDays: 3, recommendedLeadDays: 21, notes: "Turkey e-Visa, approved instantly/within 24h" },
  kenya:       { destination: "Kenya", visaRequired: true, visaType: "e-visa", processingDays: 5, recommendedLeadDays: 21 },
  myanmar:     { destination: "Myanmar", visaRequired: true, visaType: "e-visa", processingDays: 5, recommendedLeadDays: 21 },
  "south korea": { destination: "South Korea", visaRequired: true, visaType: "e-visa", processingDays: 7, recommendedLeadDays: 28, notes: "K-ETA required, apply 72h before travel" },

  // Sticker visa — need embassy appointment, plan 1+ month ahead
  japan:       { destination: "Japan", visaRequired: true, visaType: "sticker-visa", processingDays: 7, recommendedLeadDays: 35, notes: "Apply via VFS/embassy, 5-7 business days" },
  "south korea (sticker)": { destination: "South Korea", visaRequired: true, visaType: "sticker-visa", processingDays: 10, recommendedLeadDays: 35 },
  australia:   { destination: "Australia", visaRequired: true, visaType: "e-visa", processingDays: 20, recommendedLeadDays: 45, notes: "Subclass 600, can take 2-4 weeks" },
  "new zealand": { destination: "New Zealand", visaRequired: true, visaType: "e-visa", processingDays: 25, recommendedLeadDays: 50 },
  canada:      { destination: "Canada", visaRequired: true, visaType: "sticker-visa", processingDays: 30, recommendedLeadDays: 60, notes: "Biometrics required, 4-6 weeks processing" },
  "united states": { destination: "United States", visaRequired: true, visaType: "sticker-visa", processingDays: 45, recommendedLeadDays: 90, notes: "B1/B2, interview required. Book 2-3 months ahead." },
  usa:         { destination: "USA", visaRequired: true, visaType: "sticker-visa", processingDays: 45, recommendedLeadDays: 90 },

  // Europe — Schengen visa, plan 1-2 months ahead
  france:      { destination: "France", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45, notes: "Schengen visa via VFS Global, 10-15 business days" },
  paris:       { destination: "Paris", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  germany:     { destination: "Germany", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  italy:       { destination: "Italy", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  rome:        { destination: "Rome", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  spain:       { destination: "Spain", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  barcelona:   { destination: "Barcelona", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  netherlands: { destination: "Netherlands", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  amsterdam:   { destination: "Amsterdam", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  switzerland: { destination: "Switzerland", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  austria:     { destination: "Austria", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  vienna:      { destination: "Vienna", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  czech:       { destination: "Czech Republic", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  prague:      { destination: "Prague", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  hungary:     { destination: "Hungary", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  budapest:    { destination: "Budapest", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  portugal:    { destination: "Portugal", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  lisbon:      { destination: "Lisbon", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  greece:      { destination: "Greece", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  europe:      { destination: "Europe", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45, notes: "Schengen visa required — apply 45 days before travel" },

  // UK — separate from Schengen
  "united kingdom": { destination: "United Kingdom", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45, notes: "Standard Visitor visa, 3 weeks typical" },
  london:      { destination: "London", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },
  uk:          { destination: "UK", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },

  // Scandinavia
  scandinavia: { destination: "Scandinavia", visaRequired: true, visaType: "sticker-visa", processingDays: 15, recommendedLeadDays: 45 },

  // Asia
  "southeast asia": { destination: "Southeast Asia", visaRequired: false, visaType: "visa-on-arrival", processingDays: 0, recommendedLeadDays: 14, notes: "Most SE Asian countries are VOA/visa-free for Indians" },
  "east asia":  { destination: "East Asia", visaRequired: true, visaType: "sticker-visa", processingDays: 10, recommendedLeadDays: 35 },
  "middle east": { destination: "Middle East", visaRequired: true, visaType: "e-visa", processingDays: 5, recommendedLeadDays: 21 },
  tokyo:       { destination: "Tokyo", visaRequired: true, visaType: "sticker-visa", processingDays: 7, recommendedLeadDays: 35 },
  bangkok:     { destination: "Bangkok", visaRequired: false, visaType: "visa-free", processingDays: 0, recommendedLeadDays: 14 },
};

function normalizeKey(dest: string): string {
  return dest.toLowerCase().trim().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ");
}

export function getVisaInfo(destination: string): VisaInfo | null {
  const key = normalizeKey(destination);

  // Exact match
  if (visaData[key]) return visaData[key];

  // Partial match
  const partial = Object.entries(visaData).find(
    ([k]) => key.includes(k) || k.includes(key)
  );
  if (partial) return partial[1];

  // Default for unknown — assume visa required with 30-day lead
  return {
    destination,
    visaRequired: true,
    visaType: "sticker-visa",
    processingDays: 15,
    recommendedLeadDays: 45,
    notes: "Visa requirements unknown — we recommend applying 45 days before travel",
  };
}

/**
 * Get the smart default start date based on visa processing times.
 * - If destination requires prior visa → at least recommendedLeadDays from today
 * - If visa-free/VOA → 2 weeks from today
 * - Always rounds up to the next weekend (Saturday) for convenience
 */
export function getSmartStartDate(destination: string): string {
  const visa = getVisaInfo(destination);
  const today = new Date();
  const leadDays = visa ? visa.recommendedLeadDays : 30;

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() + leadDays);

  // Round to next Saturday for a weekend departure
  const daysUntilSaturday = (6 - startDate.getDay() + 7) % 7;
  if (daysUntilSaturday > 0) {
    startDate.setDate(startDate.getDate() + daysUntilSaturday);
  }

  const year = startDate.getFullYear();
  const month = String(startDate.getMonth() + 1).padStart(2, "0");
  const day = String(startDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Get a human-readable visa advisory message
 */
export function getVisaAdvisory(destination: string): {
  message: string;
  severity: "none" | "info" | "warning";
  leadDays: number;
} {
  const visa = getVisaInfo(destination);
  if (!visa) return { message: "", severity: "none", leadDays: 14 };

  if (visa.visaType === "visa-free") {
    return {
      message: `${visa.destination} is visa-free for Indian passport holders. ${visa.notes || ""}`,
      severity: "none",
      leadDays: visa.recommendedLeadDays,
    };
  }

  if (visa.visaType === "visa-on-arrival") {
    return {
      message: `${visa.destination} offers visa on arrival. ${visa.notes || ""}`,
      severity: "info",
      leadDays: visa.recommendedLeadDays,
    };
  }

  if (visa.visaType === "e-visa") {
    return {
      message: `E-visa required for ${visa.destination}. ${visa.notes || `Processing: ~${visa.processingDays} business days.`} Book at least ${Math.ceil(visa.recommendedLeadDays / 7)} weeks ahead.`,
      severity: "info",
      leadDays: visa.recommendedLeadDays,
    };
  }

  // Sticker visa
  return {
    message: `⚠️ Embassy visa required for ${visa.destination}. ${visa.notes || `Processing: ~${visa.processingDays} business days.`} Start date auto-set to ~${Math.ceil(visa.recommendedLeadDays / 7)} weeks from today.`,
    severity: "warning",
    leadDays: visa.recommendedLeadDays,
  };
}
