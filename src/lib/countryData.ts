// ─── Country → Major Arrival Cities ───────────────────────────────────────
// Used to let users pick their preferred arrival city for multi-city country trips.

export interface ArrivalCityOption {
  city: string;
  airport: string; // IATA code
  description: string;
  isRecommended?: boolean;
}

export const countryArrivalCities: Record<string, ArrivalCityOption[]> = {
  japan: [
    { city: "Tokyo", airport: "NRT", description: "Capital city — Shibuya, Akihabara, Senso-ji", isRecommended: true },
    { city: "Osaka", airport: "KIX", description: "Street food capital — Dotonbori, Universal Studios" },
    { city: "Nagoya", airport: "NGO", description: "Central hub — Toyota Museum, Nagoya Castle" },
    { city: "Fukuoka", airport: "FUK", description: "Southern gateway — Hakata Ramen, Canal City" },
  ],
  italy: [
    { city: "Rome", airport: "FCO", description: "Eternal City — Colosseum, Vatican, Trevi Fountain", isRecommended: true },
    { city: "Milan", airport: "MXP", description: "Fashion capital — Duomo, La Scala, Lake Como nearby" },
    { city: "Venice", airport: "VCE", description: "Floating City — Grand Canal, St. Mark's Square" },
    { city: "Naples", airport: "NAP", description: "Gateway to Amalfi Coast & Pompeii" },
  ],
  france: [
    { city: "Paris", airport: "CDG", description: "City of Light — Eiffel Tower, Louvre, Montmartre", isRecommended: true },
    { city: "Nice", airport: "NCE", description: "French Riviera — beaches, Promenade des Anglais" },
    { city: "Lyon", airport: "LYS", description: "Gastronomic capital — Old Town, Basilica of Fourvière" },
    { city: "Marseille", airport: "MRS", description: "Port city — Calanques, Vieux-Port" },
  ],
  thailand: [
    { city: "Bangkok", airport: "BKK", description: "Street food paradise — Grand Palace, Chatuchak", isRecommended: true },
    { city: "Phuket", airport: "HKT", description: "Beach paradise — Patong, Phi Phi Islands" },
    { city: "Chiang Mai", airport: "CNX", description: "Mountain culture — temples, night bazaars, elephants" },
  ],
  spain: [
    { city: "Barcelona", airport: "BCN", description: "Gaudí, La Rambla, Gothic Quarter", isRecommended: true },
    { city: "Madrid", airport: "MAD", description: "Royal Palace, Prado Museum, Plaza Mayor" },
    { city: "Seville", airport: "SVQ", description: "Flamenco, Alcázar, Plaza de España" },
  ],
  germany: [
    { city: "Berlin", airport: "BER", description: "History & nightlife — Brandenburg Gate, Museum Island", isRecommended: true },
    { city: "Munich", airport: "MUC", description: "Bavarian charm — Marienplatz, beer gardens, Alps nearby" },
    { city: "Frankfurt", airport: "FRA", description: "Financial hub — Römerberg, great transit connections" },
  ],
  turkey: [
    { city: "Istanbul", airport: "IST", description: "Where East meets West — Hagia Sophia, Grand Bazaar", isRecommended: true },
    { city: "Antalya", airport: "AYT", description: "Turkish Riviera — beaches, old town, waterfalls" },
    { city: "Cappadocia (Kayseri)", airport: "ASR", description: "Hot air balloons & fairy chimneys" },
  ],
  "south korea": [
    { city: "Seoul", airport: "ICN", description: "K-culture capital — Gyeongbokgung, Hongdae, Myeongdong", isRecommended: true },
    { city: "Busan", airport: "PUS", description: "Coastal city — Gamcheon, Haeundae Beach, seafood" },
    { city: "Jeju", airport: "CJU", description: "Volcanic island — Hallasan, waterfalls, beaches" },
  ],
  "united states": [
    { city: "New York", airport: "JFK", description: "The Big Apple — Times Square, Central Park, Statue of Liberty", isRecommended: true },
    { city: "Los Angeles", airport: "LAX", description: "Hollywood, beaches, Disneyland, Getty Museum" },
    { city: "San Francisco", airport: "SFO", description: "Golden Gate, Alcatraz, Silicon Valley" },
    { city: "Miami", airport: "MIA", description: "Beach vibes, Art Deco, Everglades" },
  ],
  australia: [
    { city: "Sydney", airport: "SYD", description: "Opera House, Harbour Bridge, Bondi Beach", isRecommended: true },
    { city: "Melbourne", airport: "MEL", description: "Coffee culture, street art, Great Ocean Road" },
    { city: "Brisbane", airport: "BNE", description: "Gateway to Gold Coast & Great Barrier Reef" },
  ],
  vietnam: [
    { city: "Hanoi", airport: "HAN", description: "Old Quarter, Ho Chi Minh Mausoleum, street food", isRecommended: true },
    { city: "Ho Chi Minh City", airport: "SGN", description: "Saigon — Ben Thanh Market, Cu Chi Tunnels" },
    { city: "Da Nang", airport: "DAD", description: "Golden Bridge, Marble Mountains, Hoi An nearby" },
  ],
  indonesia: [
    { city: "Bali (Denpasar)", airport: "DPS", description: "Island of the Gods — Ubud, temples, beaches", isRecommended: true },
    { city: "Jakarta", airport: "CGK", description: "Capital — National Monument, Old Town Kota Tua" },
    { city: "Yogyakarta", airport: "JOG", description: "Cultural heart — Borobudur, Prambanan temples" },
  ],
  switzerland: [
    { city: "Zurich", airport: "ZRH", description: "Lake Zurich, Old Town, Swiss National Museum", isRecommended: true },
    { city: "Geneva", airport: "GVA", description: "Lake Geneva, Jet d'Eau, UN headquarters" },
  ],
  "united kingdom": [
    { city: "London", airport: "LHR", description: "Big Ben, Tower Bridge, British Museum", isRecommended: true },
    { city: "Edinburgh", airport: "EDI", description: "Castle, Royal Mile, Arthur's Seat" },
    { city: "Manchester", airport: "MAN", description: "Football, music scene, Northern Quarter" },
  ],
  greece: [
    { city: "Athens", airport: "ATH", description: "Acropolis, Parthenon, Plaka neighbourhood", isRecommended: true },
    { city: "Santorini (Thira)", airport: "JTR", description: "Blue domes, caldera views, sunsets" },
    { city: "Thessaloniki", airport: "SKG", description: "White Tower, vibrant food scene, Byzantine walls" },
  ],
  morocco: [
    { city: "Marrakech", airport: "RAK", description: "Medina, Jemaa el-Fna, Majorelle Garden", isRecommended: true },
    { city: "Casablanca", airport: "CMN", description: "Hassan II Mosque, Art Deco, coastal vibes" },
    { city: "Fez", airport: "FEZ", description: "Oldest medina, tanneries, cultural heritage" },
  ],
  egypt: [
    { city: "Cairo", airport: "CAI", description: "Pyramids of Giza, Egyptian Museum, Khan el-Khalili", isRecommended: true },
    { city: "Luxor", airport: "LXR", description: "Valley of the Kings, Karnak Temple" },
    { city: "Hurghada", airport: "HRG", description: "Red Sea diving, beaches, coral reefs" },
  ],
  malaysia: [
    { city: "Kuala Lumpur", airport: "KUL", description: "Petronas Towers, Batu Caves, street food", isRecommended: true },
    { city: "Langkawi", airport: "LGK", description: "Duty-free island, Sky Bridge, beaches" },
    { city: "Penang", airport: "PEN", description: "George Town heritage, street art, hawker food" },
  ],
};

// ─── Detect if a destination is a country ────────────────────────────────

const knownCountries = new Set(Object.keys(countryArrivalCities));

// Also detect common aliases
const countryAliases: Record<string, string> = {
  usa: "united states",
  us: "united states",
  uk: "united kingdom",
  england: "united kingdom",
  britain: "united kingdom",
  korea: "south korea",
  "south korea": "south korea",
};

export function isCountryDestination(destination: string): boolean {
  const key = destination.toLowerCase().trim();
  return knownCountries.has(key) || key in countryAliases;
}

export function getArrivalCities(destination: string): ArrivalCityOption[] {
  let key = destination.toLowerCase().trim();
  if (countryAliases[key]) key = countryAliases[key];
  return countryArrivalCities[key] || [];
}

// ─── Indian cities for domestic trip detection ────────────────────────────

const indianCities = new Set([
  "mumbai", "delhi", "new delhi", "bengaluru", "bangalore", "chennai",
  "hyderabad", "kolkata", "pune", "ahmedabad", "jaipur", "lucknow",
  "kochi", "cochin", "goa", "thiruvananthapuram", "trivandrum",
  "chandigarh", "indore", "bhopal", "nagpur", "visakhapatnam", "vizag",
  "coimbatore", "mysore", "mysuru", "udaipur", "jodhpur", "varanasi",
  "agra", "amritsar", "shimla", "manali", "rishikesh", "dehradun",
  "mussoorie", "darjeeling", "gangtok", "shillong", "munnar",
  "alleppey", "alappuzha", "ooty", "kodaikanal", "pondicherry",
  "puducherry", "srinagar", "leh", "ladakh", "andaman", "port blair",
  "lakshadweep", "hampi", "rann of kutch", "guwahati", "kaziranga",
  "jaisalmer", "pushkar", "khajuraho", "ajanta", "ellora",
  "madurai", "rameshwaram", "kanyakumari", "lonavala", "mahabaleshwar",
  "nainital", "kasol", "mcleodganj", "dharamshala", "auli",
  "kodagu", "coorg", "chikmagalur", "wayanad", "hampi",
  "tirupati", "shirdi", "dwarka", "puri", "konark",
  "ranchi", "patna", "bhubaneswar", "cuttack", "raipur",
  "surat", "vadodara", "rajkot", "aurangabad", "nashik",
  "kolhapur", "mangalore", "udupi", "hubli", "belgaum", "belagavi",
]);

export function isDomesticTrip(origin: string, destination: string): boolean {
  const o = origin.toLowerCase().trim();
  const d = destination.toLowerCase().trim();
  return indianCities.has(o) && indianCities.has(d);
}

export function isIndianCity(city: string): boolean {
  return indianCities.has(city.toLowerCase().trim());
}

// ─── Region → Country mapping ─────────────────────────────────────────────
// When a user selects a region (e.g. "Europe"), let them pick which countries.

export interface RegionCountry {
  country: string;
  flag: string;
  cities: string[];
  description: string;
  budgetPerDay: string; // e.g. "₹8,000 – ₹25,000"
}

export const regionCountries: Record<string, RegionCountry[]> = {
  europe: [
    { country: "France", flag: "🇫🇷", cities: ["Paris", "Nice", "Lyon"], description: "Art, fashion, wine & cuisine", budgetPerDay: "₹10,000 – ₹30,000" },
    { country: "Italy", flag: "🇮🇹", cities: ["Rome", "Florence", "Venice", "Milan"], description: "History, art, food & romance", budgetPerDay: "₹9,000 – ₹28,000" },
    { country: "Spain", flag: "🇪🇸", cities: ["Barcelona", "Madrid", "Seville"], description: "Beaches, Gaudí, tapas & flamenco", budgetPerDay: "₹8,000 – ₹22,000" },
    { country: "Germany", flag: "🇩🇪", cities: ["Berlin", "Munich", "Frankfurt"], description: "Beer, castles, history & tech", budgetPerDay: "₹9,000 – ₹25,000" },
    { country: "Netherlands", flag: "🇳🇱", cities: ["Amsterdam", "Rotterdam", "The Hague"], description: "Canals, bikes, tulips & art", budgetPerDay: "₹10,000 – ₹28,000" },
    { country: "Switzerland", flag: "🇨🇭", cities: ["Zurich", "Interlaken", "Lucerne"], description: "Alps, lakes, chocolate & luxury", budgetPerDay: "₹15,000 – ₹40,000" },
    { country: "Czech Republic", flag: "🇨🇿", cities: ["Prague", "Cesky Krumlov"], description: "Gothic architecture & beer", budgetPerDay: "₹6,000 – ₹18,000" },
    { country: "Austria", flag: "🇦🇹", cities: ["Vienna", "Salzburg", "Innsbruck"], description: "Music, palaces & Alpine beauty", budgetPerDay: "₹9,000 – ₹26,000" },
    { country: "Greece", flag: "🇬🇷", cities: ["Athens", "Santorini", "Mykonos"], description: "Islands, ruins & Mediterranean sun", budgetPerDay: "₹7,000 – ₹22,000" },
    { country: "Portugal", flag: "🇵🇹", cities: ["Lisbon", "Porto", "Algarve"], description: "Tiles, pastéis, surf & port wine", budgetPerDay: "₹6,000 – ₹20,000" },
    { country: "United Kingdom", flag: "🇬🇧", cities: ["London", "Edinburgh", "Manchester"], description: "Royalty, pubs, culture & history", budgetPerDay: "₹12,000 – ₹35,000" },
    { country: "Turkey", flag: "🇹🇷", cities: ["Istanbul", "Cappadocia", "Antalya"], description: "East meets West — bazaars & balloons", budgetPerDay: "₹5,000 – ₹18,000" },
  ],
  "southeast asia": [
    { country: "Thailand", flag: "🇹🇭", cities: ["Bangkok", "Chiang Mai", "Phuket", "Krabi"], description: "Temples, beaches, food & nightlife", budgetPerDay: "₹3,000 – ₹12,000" },
    { country: "Vietnam", flag: "🇻🇳", cities: ["Hanoi", "Ho Chi Minh City", "Da Nang", "Hoi An"], description: "Pho, bays, history & motorbikes", budgetPerDay: "₹2,500 – ₹10,000" },
    { country: "Indonesia", flag: "🇮🇩", cities: ["Bali", "Yogyakarta", "Jakarta"], description: "Temples, rice terraces & surf", budgetPerDay: "₹3,000 – ₹14,000" },
    { country: "Malaysia", flag: "🇲🇾", cities: ["Kuala Lumpur", "Langkawi", "Penang"], description: "Towers, beaches & street food", budgetPerDay: "₹3,500 – ₹12,000" },
    { country: "Singapore", flag: "🇸🇬", cities: ["Singapore"], description: "Gardens, food & futuristic city", budgetPerDay: "₹8,000 – ₹25,000" },
    { country: "Cambodia", flag: "🇰🇭", cities: ["Siem Reap", "Phnom Penh"], description: "Angkor Wat & Khmer heritage", budgetPerDay: "₹2,000 – ₹8,000" },
  ],
  "middle east": [
    { country: "Dubai (UAE)", flag: "🇦🇪", cities: ["Dubai", "Abu Dhabi"], description: "Luxury, skyscrapers & desert", budgetPerDay: "₹8,000 – ₹30,000" },
    { country: "Turkey", flag: "🇹🇷", cities: ["Istanbul", "Cappadocia", "Antalya"], description: "East meets West — bazaars & balloons", budgetPerDay: "₹5,000 – ₹18,000" },
    { country: "Egypt", flag: "🇪🇬", cities: ["Cairo", "Luxor", "Hurghada"], description: "Pyramids, Nile & pharaohs", budgetPerDay: "₹4,000 – ₹15,000" },
    { country: "Jordan", flag: "🇯🇴", cities: ["Amman", "Petra", "Wadi Rum"], description: "Petra, Dead Sea & desert camps", budgetPerDay: "₹5,000 – ₹18,000" },
  ],
  "east asia": [
    { country: "Japan", flag: "🇯🇵", cities: ["Tokyo", "Kyoto", "Osaka", "Hiroshima"], description: "Temples, tech, ramen & cherry blossoms", budgetPerDay: "₹8,000 – ₹25,000" },
    { country: "South Korea", flag: "🇰🇷", cities: ["Seoul", "Busan", "Jeju"], description: "K-culture, BBQ, palaces & nightlife", budgetPerDay: "₹7,000 – ₹22,000" },
    { country: "Taiwan", flag: "🇹🇼", cities: ["Taipei", "Kaohsiung", "Jiufen"], description: "Night markets, hot springs & nature", budgetPerDay: "₹5,000 – ₹18,000" },
  ],
};

// Check if destination is a region (multi-country)
export function isRegionDestination(destination: string): boolean {
  const key = destination.toLowerCase().trim();
  return key in regionCountries;
}

export function getRegionCountries(destination: string): RegionCountry[] {
  const key = destination.toLowerCase().trim();
  return regionCountries[key] || [];
}
