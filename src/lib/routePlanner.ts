// ─── Smart Route Planner ─────────────────────────────────────────────────────
// Thinks like a real traveler:
// 1. Resolves broad regions (Europe, SE Asia) into optimal city routes
// 2. Picks the best departure airport from the user's source city
// 3. Allocates days per city based on "worth visiting" weight
// 4. Picks arrival and departure airports (open-jaw when it saves money/time)
// 5. Plans internal transport (trains > buses > flights based on distance)
// 6. Budget-aware: drops cities or downgrades transport if over budget

export interface CityProfile {
  city: string;
  country: string;
  airportCode: string;
  /** 1-10 weight for how "must visit" this city is for tourists */
  weight: number;
  /** Minimum recommended nights */
  minNights: number;
  /** Ideal nights */
  idealNights: number;
  /** Average daily cost per person (INR): hotel + food + activities */
  dailyCostPerPerson: number;
}

export interface InternalRoute {
  from: string;
  to: string;
  mode: "train" | "flight" | "bus" | "ferry";
  operator: string;
  duration: string;
  pricePerPerson: number;
  notes?: string;
}

export interface PlannedRoute {
  cities: {
    city: string;
    country: string;
    airportCode: string;
    nights: number;
    arrivalDay: number;  // 0-indexed day of trip
    departureDay: number;
  }[];
  internalRoutes: InternalRoute[];
  arrivalAirport: string;   // code where you land internationally
  departureAirport: string; // code where you depart internationally (can differ)
  isMultiCity: boolean;
  isRegionTrip: boolean;    // true when destination was a region (Europe, SE Asia, etc.)
}

// ─── Route Options (shown to user for region trips) ─────────────────────────

export interface RouteOption {
  id: string;
  countries: number;
  label: string;
  tag: "Within Budget" | "Slight Stretch" | "Over Budget";
  cities: {
    city: string;
    country: string;
    nights: number;
    highlights: string[];
  }[];
  transport: { from: string; to: string; mode: string; duration: string; operator: string }[];
  estimates: {
    flights: number;
    hotels: number;
    transport: number;
    activities: number;
    total: number;
  };
  totalNights: number;
}

// ─── Region Definitions ──────────────────────────────────────────────────────
// When a user says "Europe" we need to know which cities to consider

const regionCities: Record<string, CityProfile[]> = {
  europe: [
    { city: "Paris", country: "France", airportCode: "CDG", weight: 10, minNights: 3, idealNights: 4, dailyCostPerPerson: 12000 },
    { city: "Rome", country: "Italy", airportCode: "FCO", weight: 9, minNights: 2, idealNights: 3, dailyCostPerPerson: 10000 },
    { city: "Barcelona", country: "Spain", airportCode: "BCN", weight: 8, minNights: 2, idealNights: 3, dailyCostPerPerson: 9000 },
    { city: "Amsterdam", country: "Netherlands", airportCode: "AMS", weight: 8, minNights: 2, idealNights: 3, dailyCostPerPerson: 11000 },
    { city: "Zürich", country: "Switzerland", airportCode: "ZRH", weight: 7, minNights: 2, idealNights: 3, dailyCostPerPerson: 16000 },
    { city: "Prague", country: "Czech Republic", airportCode: "PRG", weight: 7, minNights: 2, idealNights: 3, dailyCostPerPerson: 6500 },
    { city: "Vienna", country: "Austria", airportCode: "VIE", weight: 7, minNights: 2, idealNights: 3, dailyCostPerPerson: 9000 },
    { city: "London", country: "United Kingdom", airportCode: "LHR", weight: 9, minNights: 3, idealNights: 4, dailyCostPerPerson: 14000 },
    { city: "Berlin", country: "Germany", airportCode: "BER", weight: 6, minNights: 2, idealNights: 3, dailyCostPerPerson: 8000 },
    { city: "Santorini", country: "Greece", airportCode: "JTR", weight: 7, minNights: 2, idealNights: 3, dailyCostPerPerson: 11000 },
    { city: "Florence", country: "Italy", airportCode: "FLR", weight: 7, minNights: 2, idealNights: 2, dailyCostPerPerson: 9500 },
    { city: "Lisbon", country: "Portugal", airportCode: "LIS", weight: 6, minNights: 2, idealNights: 3, dailyCostPerPerson: 7000 },
    { city: "Budapest", country: "Hungary", airportCode: "BUD", weight: 6, minNights: 2, idealNights: 3, dailyCostPerPerson: 5500 },
    { city: "Istanbul", country: "Turkey", airportCode: "IST", weight: 8, minNights: 2, idealNights: 3, dailyCostPerPerson: 6000 },
  ],
  "southeast asia": [
    { city: "Bangkok", country: "Thailand", airportCode: "BKK", weight: 9, minNights: 2, idealNights: 3, dailyCostPerPerson: 4000 },
    { city: "Singapore", country: "Singapore", airportCode: "SIN", weight: 9, minNights: 2, idealNights: 3, dailyCostPerPerson: 9000 },
    { city: "Bali", country: "Indonesia", airportCode: "DPS", weight: 9, minNights: 3, idealNights: 4, dailyCostPerPerson: 5000 },
    { city: "Hanoi", country: "Vietnam", airportCode: "HAN", weight: 7, minNights: 2, idealNights: 3, dailyCostPerPerson: 3500 },
    { city: "Ho Chi Minh City", country: "Vietnam", airportCode: "SGN", weight: 7, minNights: 2, idealNights: 3, dailyCostPerPerson: 3500 },
    { city: "Kuala Lumpur", country: "Malaysia", airportCode: "KUL", weight: 7, minNights: 2, idealNights: 3, dailyCostPerPerson: 4500 },
    { city: "Siem Reap", country: "Cambodia", airportCode: "REP", weight: 8, minNights: 2, idealNights: 3, dailyCostPerPerson: 3000 },
    { city: "Phuket", country: "Thailand", airportCode: "HKT", weight: 7, minNights: 2, idealNights: 3, dailyCostPerPerson: 5000 },
  ],
  "east asia": [
    { city: "Tokyo", country: "Japan", airportCode: "NRT", weight: 10, minNights: 3, idealNights: 4, dailyCostPerPerson: 10000 },
    { city: "Kyoto", country: "Japan", airportCode: "KIX", weight: 8, minNights: 2, idealNights: 3, dailyCostPerPerson: 9000 },
    { city: "Seoul", country: "South Korea", airportCode: "ICN", weight: 8, minNights: 2, idealNights: 3, dailyCostPerPerson: 8000 },
    { city: "Taipei", country: "Taiwan", airportCode: "TPE", weight: 7, minNights: 2, idealNights: 3, dailyCostPerPerson: 6000 },
    { city: "Hong Kong", country: "Hong Kong", airportCode: "HKG", weight: 8, minNights: 2, idealNights: 3, dailyCostPerPerson: 10000 },
  ],
  "middle east": [
    { city: "Dubai", country: "UAE", airportCode: "DXB", weight: 9, minNights: 3, idealNights: 4, dailyCostPerPerson: 10000 },
    { city: "Abu Dhabi", country: "UAE", airportCode: "AUH", weight: 7, minNights: 2, idealNights: 3, dailyCostPerPerson: 9000 },
    { city: "Doha", country: "Qatar", airportCode: "DOH", weight: 6, minNights: 2, idealNights: 2, dailyCostPerPerson: 9000 },
    { city: "Muscat", country: "Oman", airportCode: "MCT", weight: 6, minNights: 2, idealNights: 3, dailyCostPerPerson: 7500 },
    { city: "Amman", country: "Jordan", airportCode: "AMM", weight: 7, minNights: 2, idealNights: 3, dailyCostPerPerson: 6000 },
  ],
  scandinavia: [
    { city: "Copenhagen", country: "Denmark", airportCode: "CPH", weight: 8, minNights: 2, idealNights: 3, dailyCostPerPerson: 14000 },
    { city: "Stockholm", country: "Sweden", airportCode: "ARN", weight: 8, minNights: 2, idealNights: 3, dailyCostPerPerson: 13000 },
    { city: "Oslo", country: "Norway", airportCode: "OSL", weight: 7, minNights: 2, idealNights: 3, dailyCostPerPerson: 15000 },
    { city: "Reykjavík", country: "Iceland", airportCode: "KEF", weight: 9, minNights: 2, idealNights: 3, dailyCostPerPerson: 16000 },
    { city: "Helsinki", country: "Finland", airportCode: "HEL", weight: 6, minNights: 2, idealNights: 2, dailyCostPerPerson: 12000 },
  ],
};

// ─── Internal Transport Routes ───────────────────────────────────────────────
// Realistic transport options between major city pairs

const transportRoutes: Record<string, InternalRoute> = {
  // Europe
  "Paris→Rome":        { from: "Paris", to: "Rome", mode: "flight", operator: "EasyJet", duration: "2h 10m", pricePerPerson: 6500, notes: "Budget airline, cabin bag included" },
  "Paris→Barcelona":   { from: "Paris", to: "Barcelona", mode: "train", operator: "SNCF TGV", duration: "6h 30m", pricePerPerson: 7000, notes: "High-speed train via Montpellier" },
  "Paris→Amsterdam":   { from: "Paris", to: "Amsterdam", mode: "train", operator: "Thalys", duration: "3h 15m", pricePerPerson: 5500, notes: "Direct high-speed rail" },
  "Paris→London":      { from: "Paris", to: "London", mode: "train", operator: "Eurostar", duration: "2h 16m", pricePerPerson: 8000, notes: "Under the Channel Tunnel" },
  "Paris→Zürich":      { from: "Paris", to: "Zürich", mode: "train", operator: "TGV Lyria", duration: "4h 03m", pricePerPerson: 6500, notes: "Scenic ride through French countryside" },
  "Paris→Prague":      { from: "Paris", to: "Prague", mode: "flight", operator: "Transavia", duration: "1h 50m", pricePerPerson: 5500 },
  "Rome→Florence":     { from: "Rome", to: "Florence", mode: "train", operator: "Trenitalia Frecciarossa", duration: "1h 32m", pricePerPerson: 3500, notes: "Italy's bullet train" },
  "Rome→Barcelona":    { from: "Rome", to: "Barcelona", mode: "flight", operator: "Vueling", duration: "2h 05m", pricePerPerson: 5500 },
  "Amsterdam→Prague":  { from: "Amsterdam", to: "Prague", mode: "flight", operator: "KLM", duration: "1h 40m", pricePerPerson: 5000 },
  "Amsterdam→Berlin":  { from: "Amsterdam", to: "Berlin", mode: "train", operator: "ICE", duration: "6h 20m", pricePerPerson: 4500 },
  "Amsterdam→London":  { from: "Amsterdam", to: "London", mode: "train", operator: "Eurostar", duration: "3h 52m", pricePerPerson: 7500, notes: "Via Brussels, under the Channel" },
  "Prague→Vienna":     { from: "Prague", to: "Vienna", mode: "train", operator: "RegioJet", duration: "4h 00m", pricePerPerson: 2000, notes: "Budget-friendly, scenic ride" },
  "Prague→Budapest":   { from: "Prague", to: "Budapest", mode: "train", operator: "RegioJet", duration: "6h 45m", pricePerPerson: 2500 },
  "Vienna→Budapest":   { from: "Vienna", to: "Budapest", mode: "train", operator: "ÖBB Railjet", duration: "2h 40m", pricePerPerson: 2500, notes: "Fast & comfortable" },
  "Barcelona→Lisbon":  { from: "Barcelona", to: "Lisbon", mode: "flight", operator: "TAP Portugal", duration: "2h 15m", pricePerPerson: 5000 },
  "London→Paris":      { from: "London", to: "Paris", mode: "train", operator: "Eurostar", duration: "2h 16m", pricePerPerson: 8000 },
  "Zürich→Vienna":     { from: "Zürich", to: "Vienna", mode: "train", operator: "ÖBB Railjet", duration: "7h 50m", pricePerPerson: 4500 },
  "Zürich→Rome":       { from: "Zürich", to: "Rome", mode: "flight", operator: "Swiss Air", duration: "1h 40m", pricePerPerson: 6000 },
  "Istanbul→Rome":     { from: "Istanbul", to: "Rome", mode: "flight", operator: "Turkish Airlines", duration: "2h 50m", pricePerPerson: 7000 },

  // Southeast Asia
  "Bangkok→Singapore": { from: "Bangkok", to: "Singapore", mode: "flight", operator: "AirAsia", duration: "2h 25m", pricePerPerson: 4500 },
  "Singapore→Bali":    { from: "Singapore", to: "Bali", mode: "flight", operator: "Scoot", duration: "2h 40m", pricePerPerson: 5000 },
  "Bangkok→Siem Reap": { from: "Bangkok", to: "Siem Reap", mode: "flight", operator: "AirAsia", duration: "1h 10m", pricePerPerson: 3000 },
  "Bangkok→Hanoi":     { from: "Bangkok", to: "Hanoi", mode: "flight", operator: "VietJet Air", duration: "1h 50m", pricePerPerson: 3500 },
  "Bangkok→Kuala Lumpur": { from: "Bangkok", to: "Kuala Lumpur", mode: "flight", operator: "AirAsia", duration: "2h 15m", pricePerPerson: 3500 },
  "Singapore→Kuala Lumpur": { from: "Singapore", to: "Kuala Lumpur", mode: "bus", operator: "Transtar", duration: "5h 30m", pricePerPerson: 1500, notes: "Luxury coach, frequent departures" },
  "Hanoi→Ho Chi Minh City": { from: "Hanoi", to: "Ho Chi Minh City", mode: "flight", operator: "VietJet Air", duration: "2h 05m", pricePerPerson: 3000 },
  "Bali→Singapore":    { from: "Bali", to: "Singapore", mode: "flight", operator: "Scoot", duration: "2h 40m", pricePerPerson: 5000 },

  // East Asia
  "Tokyo→Kyoto":       { from: "Tokyo", to: "Kyoto", mode: "train", operator: "JR Shinkansen Nozomi", duration: "2h 15m", pricePerPerson: 10000, notes: "Bullet train, reserved seat" },
  "Seoul→Tokyo":       { from: "Seoul", to: "Tokyo", mode: "flight", operator: "Peach Aviation", duration: "2h 30m", pricePerPerson: 6000 },
  "Taipei→Tokyo":      { from: "Taipei", to: "Tokyo", mode: "flight", operator: "Peach Aviation", duration: "3h 00m", pricePerPerson: 6500 },
  "Hong Kong→Taipei":  { from: "Hong Kong", to: "Taipei", mode: "flight", operator: "Cathay Pacific", duration: "1h 50m", pricePerPerson: 5500 },

  // Middle East
  "Dubai→Abu Dhabi":   { from: "Dubai", to: "Abu Dhabi", mode: "bus", operator: "E101 Intercity", duration: "1h 30m", pricePerPerson: 500, notes: "Air-conditioned express bus, every 20 min" },
  "Dubai→Muscat":      { from: "Dubai", to: "Muscat", mode: "flight", operator: "FlyDubai", duration: "1h 10m", pricePerPerson: 4000 },
  "Dubai→Doha":        { from: "Dubai", to: "Doha", mode: "flight", operator: "FlyDubai", duration: "1h 15m", pricePerPerson: 4500 },
  "Amman→Dubai":       { from: "Amman", to: "Dubai", mode: "flight", operator: "FlyDubai", duration: "3h 10m", pricePerPerson: 6000 },
};

// ─── Golden Routes (curated travel routes per region) ───────────────────────
// These are classic, well-connected routes that real travelers follow

const goldenRoutes: Record<string, string[][]> = {
  europe: [
    ["Paris"],
    ["Paris", "Rome"],
    ["Paris", "Amsterdam", "Prague"],
    ["Paris", "Zürich", "Rome", "Barcelona"],
    ["Paris", "Amsterdam", "Prague", "Vienna", "Budapest"],
  ],
  "southeast asia": [
    ["Bangkok"],
    ["Bangkok", "Singapore"],
    ["Bangkok", "Singapore", "Bali"],
    ["Bangkok", "Siem Reap", "Singapore", "Bali"],
  ],
  "east asia": [
    ["Tokyo"],
    ["Tokyo", "Seoul"],
    ["Tokyo", "Kyoto", "Seoul"],
  ],
  "middle east": [
    ["Dubai"],
    ["Dubai", "Abu Dhabi"],
    ["Dubai", "Abu Dhabi", "Muscat"],
  ],
  scandinavia: [
    ["Copenhagen"],
    ["Copenhagen", "Stockholm"],
    ["Copenhagen", "Stockholm", "Oslo"],
  ],
};

// City highlights for route option cards
const cityHighlightsMap: Record<string, string[]> = {
  Paris: ["Eiffel Tower", "Louvre Museum", "Seine River Cruise"],
  Rome: ["Colosseum", "Vatican City", "Trevi Fountain"],
  Amsterdam: ["Canal Cruise", "Rijksmuseum", "Anne Frank House"],
  Barcelona: ["La Sagrada Familia", "Park Güell", "Las Ramblas"],
  Prague: ["Charles Bridge", "Old Town Square", "Prague Castle"],
  Vienna: ["Schönbrunn Palace", "Hofburg", "Vienna State Opera"],
  Budapest: ["Parliament Building", "Thermal Baths", "Buda Castle"],
  "Zürich": ["Lake Zürich", "Old Town (Altstadt)", "Swiss Alps Day Trip"],
  Berlin: ["Brandenburg Gate", "Berlin Wall Memorial", "Museum Island"],
  London: ["Big Ben", "Tower of London", "British Museum"],
  Florence: ["Uffizi Gallery", "Duomo", "Ponte Vecchio"],
  Lisbon: ["Belém Tower", "Alfama District", "Pastéis de Nata"],
  Istanbul: ["Hagia Sophia", "Grand Bazaar", "Blue Mosque"],
  Santorini: ["Oia Sunset", "Caldera Views", "Red Beach"],
  Bangkok: ["Grand Palace", "Wat Pho", "Chatuchak Market"],
  Singapore: ["Gardens by the Bay", "Marina Bay Sands", "Sentosa Island"],
  Bali: ["Ubud Rice Terraces", "Tanah Lot Temple", "Uluwatu"],
  Tokyo: ["Shibuya Crossing", "Senso-ji Temple", "teamLab Borderless"],
  Kyoto: ["Fushimi Inari", "Arashiyama Bamboo", "Kinkaku-ji"],
  Seoul: ["Gyeongbokgung Palace", "Bukchon Hanok Village", "Myeongdong"],
  Dubai: ["Burj Khalifa", "Dubai Mall", "Desert Safari"],
  "Abu Dhabi": ["Sheikh Zayed Mosque", "Louvre Abu Dhabi", "Yas Island"],
  Muscat: ["Sultan Qaboos Mosque", "Mutrah Souq", "Wadi Shab"],
  Copenhagen: ["Tivoli Gardens", "Nyhavn", "Little Mermaid"],
  Stockholm: ["Gamla Stan", "Vasa Museum", "ABBA Museum"],
  Oslo: ["Viking Ship Museum", "Holmenkollen", "Vigeland Park"],
  Hanoi: ["Hoan Kiem Lake", "Old Quarter", "Ha Long Bay Day Trip"],
  "Ho Chi Minh City": ["Cu Chi Tunnels", "War Remnants Museum", "Ben Thanh Market"],
  "Kuala Lumpur": ["Petronas Towers", "Batu Caves", "Jalan Alor Food Street"],
  "Siem Reap": ["Angkor Wat", "Bayon Temple", "Ta Prohm"],
  Phuket: ["Phi Phi Islands", "Old Phuket Town", "Big Buddha"],
  Doha: ["Museum of Islamic Art", "Souq Waqif", "The Pearl"],
  Amman: ["Petra Day Trip", "Roman Citadel", "Rainbow Street"],
  Taipei: ["Taipei 101", "Night Markets", "Jiufen Old Street"],
  "Hong Kong": ["Victoria Peak", "Tsim Sha Tsui", "Temple Street Night Market"],
  "Reykjavík": ["Golden Circle", "Blue Lagoon", "Northern Lights"],
  Helsinki: ["Suomenlinna Fortress", "Design District", "Temppeliaukio Church"],
};

// ─── India Source Airport Intelligence ───────────────────────────────────────
// Given a city, find the best international airport

interface IndianAirport {
  code: string;
  city: string;
  isInternational: boolean;
  /** Nearby major international hub if this airport has limited international routes */
  nearestHub?: string;
}

const indianAirports: Record<string, IndianAirport> = {
  mumbai:      { code: "BOM", city: "Mumbai", isInternational: true },
  delhi:       { code: "DEL", city: "New Delhi", isInternational: true },
  bangalore:   { code: "BLR", city: "Bengaluru", isInternational: true },
  bengaluru:   { code: "BLR", city: "Bengaluru", isInternational: true },
  chennai:     { code: "MAA", city: "Chennai", isInternational: true },
  kolkata:     { code: "CCU", city: "Kolkata", isInternational: true },
  hyderabad:   { code: "HYD", city: "Hyderabad", isInternational: true },
  kochi:       { code: "COK", city: "Kochi", isInternational: true },
  pune:        { code: "PNQ", city: "Pune", isInternational: false, nearestHub: "BOM" },
  ahmedabad:   { code: "AMD", city: "Ahmedabad", isInternational: true },
  goa:         { code: "GOI", city: "Goa", isInternational: true },
  jaipur:      { code: "JAI", city: "Jaipur", isInternational: false, nearestHub: "DEL" },
  lucknow:     { code: "LKO", city: "Lucknow", isInternational: false, nearestHub: "DEL" },
  chandigarh:  { code: "IXC", city: "Chandigarh", isInternational: false, nearestHub: "DEL" },
  coimbatore:  { code: "CJB", city: "Coimbatore", isInternational: false, nearestHub: "MAA" },
  thiruvananthapuram: { code: "TRV", city: "Thiruvananthapuram", isInternational: true },
  varanasi:    { code: "VNS", city: "Varanasi", isInternational: false, nearestHub: "DEL" },
  indore:      { code: "IDR", city: "Indore", isInternational: false, nearestHub: "BOM" },
  nagpur:      { code: "NAG", city: "Nagpur", isInternational: false, nearestHub: "BOM" },
  bhopal:      { code: "BHO", city: "Bhopal", isInternational: false, nearestHub: "DEL" },
  mysore:      { code: "MYQ", city: "Mysore", isInternational: false, nearestHub: "BLR" },
  mangalore:   { code: "IXE", city: "Mangalore", isInternational: true },
  visakhapatnam: { code: "VTZ", city: "Visakhapatnam", isInternational: false, nearestHub: "HYD" },
  surat:       { code: "STV", city: "Surat", isInternational: false, nearestHub: "BOM" },
};

// International flight costs from Indian hubs (approximate one-way per person, economy)
const intlFlightCosts: Record<string, Record<string, number>> = {
  // From Indian airport code → to destination airport code → price per person
  BOM: { CDG: 38000, FCO: 36000, BCN: 38000, AMS: 37000, LHR: 40000, ZRH: 37000, PRG: 35000, BER: 36000, BUD: 34000, VIE: 35000, LIS: 38000, IST: 28000, BKK: 16000, SIN: 18000, DPS: 22000, NRT: 38000, KIX: 38000, ICN: 35000, HKG: 28000, TPE: 32000, DXB: 15000, DOH: 16000, AUH: 14000, CPH: 38000, ARN: 39000, KEF: 42000, HAN: 22000, SGN: 20000, KUL: 18000, REP: 24000, MCT: 10000, AMM: 22000 },
  DEL: { CDG: 36000, FCO: 35000, BCN: 37000, AMS: 36000, LHR: 38000, ZRH: 36000, PRG: 34000, BER: 35000, BUD: 33000, VIE: 34000, LIS: 37000, IST: 26000, BKK: 18000, SIN: 20000, DPS: 24000, NRT: 36000, KIX: 36000, ICN: 33000, HKG: 26000, TPE: 30000, DXB: 14000, DOH: 15000, AUH: 13000, CPH: 37000, ARN: 38000, KEF: 41000, HAN: 20000, SGN: 22000, KUL: 19000, REP: 23000, MCT: 12000, AMM: 20000 },
  BLR: { CDG: 39000, FCO: 37000, BCN: 39000, AMS: 38000, LHR: 41000, ZRH: 38000, PRG: 36000, BER: 37000, BUD: 35000, VIE: 36000, LIS: 39000, IST: 30000, BKK: 14000, SIN: 15000, DPS: 20000, NRT: 40000, KIX: 40000, ICN: 36000, HKG: 28000, TPE: 32000, DXB: 13000, DOH: 14000, AUH: 13000, CPH: 39000, ARN: 40000, KEF: 44000, HAN: 22000, SGN: 20000, KUL: 16000, REP: 24000, MCT: 11000, AMM: 24000 },
  MAA: { CDG: 40000, FCO: 38000, BCN: 40000, AMS: 39000, LHR: 42000, ZRH: 39000, PRG: 37000, BER: 38000, BUD: 36000, VIE: 37000, LIS: 40000, IST: 31000, BKK: 16000, SIN: 14000, DPS: 19000, NRT: 41000, KIX: 41000, ICN: 37000, HKG: 29000, TPE: 33000, DXB: 12000, DOH: 13000, AUH: 12000, CPH: 40000, ARN: 41000, KEF: 45000, HAN: 22000, SGN: 18000, KUL: 14000, REP: 23000, MCT: 10000, AMM: 24000 },
  CCU: { CDG: 40000, FCO: 38000, BCN: 40000, AMS: 39000, LHR: 42000, ZRH: 39000, PRG: 37000, BER: 38000, BUD: 36000, VIE: 37000, LIS: 40000, IST: 32000, BKK: 16000, SIN: 18000, DPS: 24000, NRT: 38000, KIX: 38000, ICN: 35000, HKG: 26000, TPE: 30000, DXB: 16000, DOH: 17000, AUH: 16000, CPH: 40000, ARN: 41000, KEF: 45000, HAN: 18000, SGN: 20000, KUL: 18000, REP: 22000, MCT: 14000, AMM: 24000 },
  HYD: { CDG: 39000, FCO: 37000, BCN: 39000, AMS: 38000, LHR: 41000, ZRH: 38000, PRG: 36000, BER: 37000, BUD: 35000, VIE: 36000, LIS: 39000, IST: 30000, BKK: 16000, SIN: 16000, DPS: 21000, NRT: 40000, KIX: 40000, ICN: 36000, HKG: 28000, TPE: 32000, DXB: 13000, DOH: 14000, AUH: 13000, CPH: 39000, ARN: 40000, KEF: 44000, HAN: 22000, SGN: 20000, KUL: 16000, REP: 24000, MCT: 11000, AMM: 24000 },
  COK: { CDG: 40000, FCO: 38000, BCN: 40000, AMS: 39000, LHR: 42000, ZRH: 39000, PRG: 37000, BER: 38000, BUD: 36000, VIE: 37000, LIS: 40000, IST: 32000, BKK: 16000, SIN: 15000, DPS: 20000, NRT: 42000, KIX: 42000, ICN: 38000, HKG: 30000, TPE: 34000, DXB: 11000, DOH: 12000, AUH: 11000, CPH: 41000, ARN: 42000, KEF: 46000, HAN: 22000, SGN: 19000, KUL: 14000, REP: 24000, MCT: 9000, AMM: 22000 },
  GOI: { CDG: 42000, FCO: 40000, BCN: 42000, AMS: 41000, LHR: 44000, ZRH: 41000, PRG: 39000, BER: 40000, BUD: 38000, VIE: 39000, LIS: 42000, IST: 34000, BKK: 18000, SIN: 18000, DPS: 24000, NRT: 44000, KIX: 44000, ICN: 40000, HKG: 32000, TPE: 36000, DXB: 14000, DOH: 15000, AUH: 14000, CPH: 43000, ARN: 44000, KEF: 48000, HAN: 24000, SGN: 22000, KUL: 18000, REP: 26000, MCT: 12000, AMM: 26000 },
  AMD: { CDG: 38000, FCO: 36000, BCN: 38000, AMS: 37000, LHR: 40000, ZRH: 37000, PRG: 35000, BER: 36000, BUD: 34000, VIE: 35000, LIS: 38000, IST: 28000, BKK: 18000, SIN: 20000, DPS: 24000, NRT: 40000, KIX: 40000, ICN: 36000, HKG: 30000, TPE: 34000, DXB: 12000, DOH: 13000, AUH: 12000, CPH: 39000, ARN: 40000, KEF: 44000, HAN: 24000, SGN: 22000, KUL: 20000, REP: 26000, MCT: 11000, AMM: 24000 },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveIndianAirport(origin: string): { code: string; city: string } {
  const key = origin.toLowerCase().trim();
  const airport = indianAirports[key];
  if (!airport) {
    // fallback: try partial match
    const partial = Object.entries(indianAirports).find(([k]) => key.includes(k) || k.includes(key));
    if (partial) {
      const a = partial[1];
      if (!a.isInternational && a.nearestHub) {
        const hub = Object.values(indianAirports).find(x => x.code === a.nearestHub);
        return hub ? { code: hub.code, city: hub.city + ` (via ${a.city})` } : { code: a.code, city: a.city };
      }
      return { code: a.code, city: a.city };
    }
    return { code: key.slice(0, 3).toUpperCase(), city: origin };
  }
  if (!airport.isInternational && airport.nearestHub) {
    const hub = Object.values(indianAirports).find(x => x.code === airport.nearestHub);
    return hub ? { code: hub.code, city: hub.city + ` (via ${airport.city})` } : { code: airport.code, city: airport.city };
  }
  return { code: airport.code, city: airport.city };
}

function isRegion(dest: string): boolean {
  const key = dest.toLowerCase().trim();
  return !!regionCities[key] || ["europe", "southeast asia", "east asia", "middle east", "scandinavia", "se asia", "sea"].some(r => key.includes(r));
}

function getRegionKey(dest: string): string | null {
  const key = dest.toLowerCase().trim();
  if (regionCities[key]) return key;
  if (key.includes("europe")) return "europe";
  if (key.includes("southeast asia") || key.includes("se asia") || key === "sea") return "southeast asia";
  if (key.includes("east asia")) return "east asia";
  if (key.includes("middle east")) return "middle east";
  if (key.includes("scandinavia") || key.includes("nordic")) return "scandinavia";
  return null;
}

function getTransport(from: string, to: string): InternalRoute | null {
  return transportRoutes[`${from}→${to}`] || transportRoutes[`${to}→${from}`] || null;
}

function getIntlFlightCost(sourceCode: string, destCode: string): number {
  const costs = intlFlightCosts[sourceCode];
  if (costs && costs[destCode]) return costs[destCode];
  // Fallback: use BOM pricing or estimate
  const bomCosts = intlFlightCosts["BOM"];
  if (bomCosts && bomCosts[destCode]) return bomCosts[destCode];
  return 35000; // generic long-haul estimate
}

// ─── Day-Country Validation ──────────────────────────────────────────────────

/** Maximum countries feasible given number of days (3 nights min per country + transit) */
export function getMaxCountries(days: number): number {
  if (days >= 15) return 5;
  if (days >= 12) return 4;
  if (days >= 9) return 3;
  if (days >= 6) return 2;
  if (days >= 3) return 1;
  return 0;
}

export function getMinDaysForCountries(countries: number): number {
  if (countries <= 1) return 3;
  return countries * 3; // ~3 nights per country
}

export function isValidRegionDuration(days: number): boolean {
  return days >= 3;
}

// ─── Route Options Generator (for user selection) ────────────────────────────

export function generateRouteOptions(input: {
  origin: string;
  destination: string;
  duration: number;
  budget: number;
  adults: number;
  children: number;
}): RouteOption[] {
  const travelers = input.adults + input.children;
  const sourceAirport = resolveIndianAirport(input.origin);
  const regionKey = getRegionKey(input.destination);

  if (!regionKey) return [];

  const maxCities = getMaxCountries(input.duration);
  if (maxCities === 0) return [];

  const routes = goldenRoutes[regionKey] || [];
  const allCities = regionCities[regionKey] || [];
  const options: RouteOption[] = [];

  const maxAvailable = Math.min(maxCities, routes.length);

  for (let n = 1; n <= maxAvailable; n++) {
    const cityNames = routes[n - 1];
    if (!cityNames) continue;

    const cityProfiles = cityNames
      .map((name) => allCities.find((c) => c.city === name))
      .filter(Boolean) as CityProfile[];
    if (cityProfiles.length !== n) continue;

    // Allocate nights proportionally to weight
    const totalWeight = cityProfiles.reduce((s, c) => s + c.weight, 0);
    const nights: number[] = cityProfiles.map((c) => {
      const proportional = Math.round((input.duration * c.weight) / totalWeight);
      return Math.max(c.minNights, proportional);
    });

    // Adjust to match input.duration
    let totalNights = nights.reduce((s, x) => s + x, 0);
    while (totalNights > input.duration) {
      // Reduce from city with most nights above its minimum
      let maxIdx = -1;
      let maxExcess = 0;
      nights.forEach((n, i) => {
        const excess = n - cityProfiles[i].minNights;
        if (excess > maxExcess) { maxExcess = excess; maxIdx = i; }
      });
      if (maxIdx >= 0) { nights[maxIdx]--; totalNights--; }
      else break;
    }
    while (totalNights < input.duration) {
      // Add to highest-weight city
      nights[0]++;
      totalNights++;
    }

    // Estimate costs
    const firstCity = cityProfiles[0];
    const lastCity = cityProfiles[cityProfiles.length - 1];
    const outboundFlightCost =
      getIntlFlightCost(sourceAirport.code, firstCity.airportCode) * travelers;
    const inboundFlightCost =
      getIntlFlightCost(sourceAirport.code, lastCity.airportCode) * travelers;
    const flightEstimate = outboundFlightCost + inboundFlightCost;

    let transportEstimate = 0;
    const transportSegments: {
      from: string;
      to: string;
      mode: string;
      duration: string;
      operator: string;
    }[] = [];
    for (let i = 0; i < cityProfiles.length - 1; i++) {
      const route = getTransport(cityProfiles[i].city, cityProfiles[i + 1].city);
      if (route) {
        transportEstimate += route.pricePerPerson * travelers;
        transportSegments.push({
          from: route.from,
          to: route.to,
          mode: route.mode,
          duration: route.duration,
          operator: route.operator,
        });
      } else {
        transportEstimate += 5000 * travelers;
        transportSegments.push({
          from: cityProfiles[i].city,
          to: cityProfiles[i + 1].city,
          mode: "flight",
          duration: "~2h",
          operator: "Budget Airline",
        });
      }
    }

    // Hotel: ~50% of daily cost, Activities: ~50% of daily cost
    const hotelEstimate = cityProfiles.reduce(
      (s, c, i) => s + c.dailyCostPerPerson * 0.5 * nights[i] * travelers,
      0
    );
    const activitiesEstimate = cityProfiles.reduce(
      (s, c, i) => s + c.dailyCostPerPerson * 0.5 * nights[i] * travelers,
      0
    );
    const totalEstimate =
      flightEstimate + transportEstimate + hotelEstimate + activitiesEstimate;

    const uniqueCountries = [...new Set(cityProfiles.map((c) => c.country))];

    const tag: RouteOption["tag"] =
      totalEstimate <= input.budget
        ? "Within Budget"
        : totalEstimate <= input.budget * 1.15
        ? "Slight Stretch"
        : "Over Budget";

    options.push({
      id: `route-${n}`,
      countries: uniqueCountries.length,
      label:
        n === 1
          ? `${firstCity.city} Getaway`
          : `${uniqueCountries.length} ${uniqueCountries.length === 1 ? "Country" : "Countries"} — ${cityNames.join(" → ")}`,
      tag,
      cities: cityProfiles.map((c, i) => ({
        city: c.city,
        country: c.country,
        nights: nights[i],
        highlights: cityHighlightsMap[c.city] || [`Explore ${c.city}`],
      })),
      transport: transportSegments,
      estimates: {
        flights: flightEstimate,
        hotels: hotelEstimate,
        transport: transportEstimate,
        activities: activitiesEstimate,
        total: totalEstimate,
      },
      totalNights: input.duration,
    });
  }

  return options;
}

// ─── Plan Route from Selected Option ─────────────────────────────────────────

export function planRouteFromOption(
  option: RouteOption,
  regionKey: string
): PlannedRoute {
  const allCities = regionCities[regionKey] || [];
  let currentDay = 0;

  const cities = option.cities.map((c) => {
    const profile = allCities.find((p) => p.city === c.city);
    const result = {
      city: c.city,
      country: c.country,
      airportCode: profile?.airportCode || "",
      nights: c.nights,
      arrivalDay: currentDay,
      departureDay: currentDay + c.nights,
    };
    currentDay += c.nights;
    return result;
  });

  const internalRoutes: InternalRoute[] = [];
  for (let i = 0; i < cities.length - 1; i++) {
    const route = getTransport(cities[i].city, cities[i + 1].city);
    if (route) {
      internalRoutes.push(route);
    } else {
      internalRoutes.push({
        from: cities[i].city,
        to: cities[i + 1].city,
        mode: "flight",
        operator: "Budget Airline",
        duration: "2h 00m",
        pricePerPerson: 5000,
        notes: "Route estimated by AI",
      });
    }
  }

  return {
    cities,
    internalRoutes,
    arrivalAirport: cities[0].airportCode,
    departureAirport: cities[cities.length - 1].airportCode,
    isMultiCity: true,
    isRegionTrip: true,
  };
}

// ─── Main Route Planner ──────────────────────────────────────────────────────

export function planRoute(input: {
  origin: string;
  destination: string;
  duration: number;
  budget: number;
  adults: number;
  children: number;
}): PlannedRoute {
  const travelers = input.adults + input.children;
  const sourceAirport = resolveIndianAirport(input.origin);

  // ─── Single-city trip (not a region) ───
  if (!isRegion(input.destination)) {
    return {
      cities: [{
        city: input.destination,
        country: input.destination,
        airportCode: "",
        nights: input.duration,
        arrivalDay: 0,
        departureDay: input.duration,
      }],
      internalRoutes: [],
      arrivalAirport: "",
      departureAirport: "",
      isMultiCity: false,
      isRegionTrip: false,
    };
  }

  // ─── Multi-city region trip ───
  const regionKey = getRegionKey(input.destination);
  if (!regionKey) {
    return {
      cities: [{ city: input.destination, country: "", airportCode: "", nights: input.duration, arrivalDay: 0, departureDay: input.duration }],
      internalRoutes: [],
      arrivalAirport: "",
      departureAirport: "",
      isMultiCity: false,
      isRegionTrip: false,
    };
  }

  const allCities = [...regionCities[regionKey]].sort((a, b) => b.weight - a.weight);

  // Budget allocation: ~40% flights, ~35% hotels, ~25% activities+food
  const budgetForFlightsAndTransport = input.budget * 0.4;
  const budgetForDailyCosts = input.budget * 0.6; // hotels + activities + food

  // International flights cost (round trip estimate)
  // Cheapest option: fly into highest-weight city, fly out of last city (open jaw)
  const topCity = allCities[0];
  const intlRoundTripCost = (getIntlFlightCost(sourceAirport.code, topCity.airportCode) * 2) * travelers;
  const budgetForInternalTransport = Math.max(0, budgetForFlightsAndTransport - intlRoundTripCost);

  // Greedy city selection based on budget and days
  const availableDays = input.duration;
  const selectedCities: { profile: CityProfile; nights: number }[] = [];
  let daysUsed = 0;
  let internalTransportCost = 0;

  for (const city of allCities) {
    if (daysUsed >= availableDays) break;

    // Calculate if we can afford this city
    const nights = Math.min(
      city.idealNights,
      availableDays - daysUsed,
      // Cap based on remaining daily budget
      Math.floor((budgetForDailyCosts - selectedCities.reduce((s, c) => s + c.profile.dailyCostPerPerson * c.nights * travelers, 0)) / (city.dailyCostPerPerson * travelers))
    );

    if (nights < city.minNights) {
      // Try minimum nights
      const minCost = city.dailyCostPerPerson * city.minNights * travelers;
      const currentDailyCosts = selectedCities.reduce((s, c) => s + c.profile.dailyCostPerPerson * c.nights * travelers, 0);
      if (currentDailyCosts + minCost > budgetForDailyCosts) continue;
      if (daysUsed + city.minNights > availableDays) continue;
    }

    if (nights < 1) continue;

    // Check internal transport cost if not the first city
    if (selectedCities.length > 0) {
      const prevCity = selectedCities[selectedCities.length - 1].profile.city;
      const route = getTransport(prevCity, city.city);
      const transportCost = route ? route.pricePerPerson * travelers : 5000 * travelers; // fallback
      if (internalTransportCost + transportCost > budgetForInternalTransport) continue;
      internalTransportCost += transportCost;
    }

    const actualNights = Math.max(city.minNights, Math.min(nights, availableDays - daysUsed));
    selectedCities.push({ profile: city, nights: actualNights });
    daysUsed += actualNights;

    // Limit to a reasonable number of cities for the trip duration
    if (selectedCities.length >= Math.min(5, Math.floor(availableDays / 2))) break;
  }

  // If no cities selected (shouldn't happen), pick just the top city
  if (selectedCities.length === 0) {
    selectedCities.push({ profile: topCity, nights: availableDays });
  }

  // Build the planned route
  let currentDay = 0;
  const cities = selectedCities.map((c) => {
    const result = {
      city: c.profile.city,
      country: c.profile.country,
      airportCode: c.profile.airportCode,
      nights: c.nights,
      arrivalDay: currentDay,
      departureDay: currentDay + c.nights,
    };
    currentDay += c.nights;
    return result;
  });

  // Internal transport between cities
  const internalRoutes: InternalRoute[] = [];
  for (let i = 0; i < cities.length - 1; i++) {
    const from = cities[i].city;
    const to = cities[i + 1].city;
    const route = getTransport(from, to);
    if (route) {
      internalRoutes.push(route);
    } else {
      // Generate a fallback flight
      internalRoutes.push({
        from,
        to,
        mode: "flight",
        operator: "Budget Airline",
        duration: "2h 00m",
        pricePerPerson: 5000,
        notes: "Route estimated by AI",
      });
    }
  }

  return {
    cities,
    internalRoutes,
    arrivalAirport: cities[0].airportCode,
    departureAirport: cities[cities.length - 1].airportCode,
    isMultiCity: true,  // Always true for region trips — even 1 city from a region
    isRegionTrip: true,
  };
}

// Re-export helpers for use in trip generator
export { resolveIndianAirport, getIntlFlightCost, regionCities, getRegionKey, isRegion, goldenRoutes, cityHighlightsMap };
