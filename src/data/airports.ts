// ─── Airport / City Autocomplete Data ──────────────────────────────────────
// Comprehensive list of airports and cities for autocomplete suggestions.

export interface AirportCity {
  code: string;       // IATA code
  city: string;       // City name
  country: string;    // Country name
  name?: string;      // Airport name (optional)
  region?: string;    // Region grouping
}

export const airports: AirportCity[] = [
  // ─── India ─────────────────────────────────────────────────────────────
  { code: "BLR", city: "Bengaluru", country: "India", name: "Kempegowda International", region: "South Asia" },
  { code: "BOM", city: "Mumbai", country: "India", name: "Chhatrapati Shivaji Maharaj International", region: "South Asia" },
  { code: "DEL", city: "Delhi", country: "India", name: "Indira Gandhi International", region: "South Asia" },
  { code: "MAA", city: "Chennai", country: "India", name: "Chennai International", region: "South Asia" },
  { code: "HYD", city: "Hyderabad", country: "India", name: "Rajiv Gandhi International", region: "South Asia" },
  { code: "CCU", city: "Kolkata", country: "India", name: "Netaji Subhas Chandra Bose International", region: "South Asia" },
  { code: "COK", city: "Kochi", country: "India", name: "Cochin International", region: "South Asia" },
  { code: "GOI", city: "Goa", country: "India", name: "Manohar International", region: "South Asia" },
  { code: "PNQ", city: "Pune", country: "India", name: "Pune Airport", region: "South Asia" },
  { code: "AMD", city: "Ahmedabad", country: "India", name: "Sardar Vallabhbhai Patel International", region: "South Asia" },
  { code: "JAI", city: "Jaipur", country: "India", name: "Jaipur International", region: "South Asia" },
  { code: "TRV", city: "Thiruvananthapuram", country: "India", name: "Trivandrum International", region: "South Asia" },
  { code: "IXC", city: "Chandigarh", country: "India", name: "Chandigarh Airport", region: "South Asia" },
  { code: "LKO", city: "Lucknow", country: "India", name: "Chaudhary Charan Singh International", region: "South Asia" },
  { code: "GAU", city: "Guwahati", country: "India", name: "Lokpriya Gopinath Bordoloi International", region: "South Asia" },
  { code: "IXB", city: "Bagdogra", country: "India", name: "Bagdogra Airport", region: "South Asia" },
  { code: "SXR", city: "Srinagar", country: "India", name: "Sheikh ul-Alam International", region: "South Asia" },
  { code: "VNS", city: "Varanasi", country: "India", name: "Lal Bahadur Shastri International", region: "South Asia" },
  { code: "ATQ", city: "Amritsar", country: "India", name: "Sri Guru Ram Dass Jee International", region: "South Asia" },
  { code: "IXR", city: "Ranchi", country: "India", name: "Birsa Munda Airport", region: "South Asia" },
  { code: "PAT", city: "Patna", country: "India", name: "Jay Prakash Narayan International", region: "South Asia" },
  { code: "NAG", city: "Nagpur", country: "India", name: "Dr. Babasaheb Ambedkar International", region: "South Asia" },
  { code: "IDR", city: "Indore", country: "India", name: "Devi Ahilyabai Holkar Airport", region: "South Asia" },
  { code: "BBI", city: "Bhubaneswar", country: "India", name: "Biju Patnaik International", region: "South Asia" },
  { code: "RPR", city: "Raipur", country: "India", name: "Swami Vivekananda Airport", region: "South Asia" },
  { code: "IXM", city: "Madurai", country: "India", name: "Madurai Airport", region: "South Asia" },
  { code: "CJB", city: "Coimbatore", country: "India", name: "Coimbatore International", region: "South Asia" },
  { code: "CCJ", city: "Kozhikode", country: "India", name: "Calicut International", region: "South Asia" },
  { code: "MYQ", city: "Mysuru", country: "India", name: "Mysore Airport", region: "South Asia" },
  { code: "UDR", city: "Udaipur", country: "India", name: "Maharana Pratap Airport", region: "South Asia" },

  // ─── South Asia ────────────────────────────────────────────────────────
  { code: "CMB", city: "Colombo", country: "Sri Lanka", name: "Bandaranaike International", region: "South Asia" },
  { code: "KTM", city: "Kathmandu", country: "Nepal", name: "Tribhuvan International", region: "South Asia" },
  { code: "DAC", city: "Dhaka", country: "Bangladesh", name: "Hazrat Shahjalal International", region: "South Asia" },
  { code: "MLE", city: "Malé", country: "Maldives", name: "Velana International", region: "South Asia" },

  // ─── Southeast Asia ────────────────────────────────────────────────────
  { code: "SIN", city: "Singapore", country: "Singapore", name: "Changi Airport", region: "Southeast Asia" },
  { code: "BKK", city: "Bangkok", country: "Thailand", name: "Suvarnabhumi Airport", region: "Southeast Asia" },
  { code: "DPS", city: "Bali", country: "Indonesia", name: "Ngurah Rai International", region: "Southeast Asia" },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia", name: "Kuala Lumpur International", region: "Southeast Asia" },
  { code: "HAN", city: "Hanoi", country: "Vietnam", name: "Noi Bai International", region: "Southeast Asia" },
  { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam", name: "Tan Son Nhat International", region: "Southeast Asia" },
  { code: "MNL", city: "Manila", country: "Philippines", name: "Ninoy Aquino International", region: "Southeast Asia" },
  { code: "RGN", city: "Yangon", country: "Myanmar", name: "Yangon International", region: "Southeast Asia" },
  { code: "PNH", city: "Phnom Penh", country: "Cambodia", name: "Phnom Penh International", region: "Southeast Asia" },
  { code: "REP", city: "Siem Reap", country: "Cambodia", name: "Siem Reap International", region: "Southeast Asia" },
  { code: "HKT", city: "Phuket", country: "Thailand", name: "Phuket International", region: "Southeast Asia" },
  { code: "CNX", city: "Chiang Mai", country: "Thailand", name: "Chiang Mai International", region: "Southeast Asia" },

  // ─── East Asia ─────────────────────────────────────────────────────────
  { code: "NRT", city: "Tokyo", country: "Japan", name: "Narita International", region: "East Asia" },
  { code: "HND", city: "Tokyo", country: "Japan", name: "Haneda Airport", region: "East Asia" },
  { code: "KIX", city: "Osaka", country: "Japan", name: "Kansai International", region: "East Asia" },
  { code: "ICN", city: "Seoul", country: "South Korea", name: "Incheon International", region: "East Asia" },
  { code: "HKG", city: "Hong Kong", country: "Hong Kong", name: "Hong Kong International", region: "East Asia" },
  { code: "PEK", city: "Beijing", country: "China", name: "Beijing Capital International", region: "East Asia" },
  { code: "PVG", city: "Shanghai", country: "China", name: "Shanghai Pudong International", region: "East Asia" },
  { code: "TPE", city: "Taipei", country: "Taiwan", name: "Taiwan Taoyuan International", region: "East Asia" },

  // ─── Middle East ───────────────────────────────────────────────────────
  { code: "DXB", city: "Dubai", country: "UAE", name: "Dubai International", region: "Middle East" },
  { code: "AUH", city: "Abu Dhabi", country: "UAE", name: "Zayed International", region: "Middle East" },
  { code: "DOH", city: "Doha", country: "Qatar", name: "Hamad International", region: "Middle East" },
  { code: "BAH", city: "Bahrain", country: "Bahrain", name: "Bahrain International", region: "Middle East" },
  { code: "MCT", city: "Muscat", country: "Oman", name: "Muscat International", region: "Middle East" },
  { code: "RUH", city: "Riyadh", country: "Saudi Arabia", name: "King Khalid International", region: "Middle East" },
  { code: "JED", city: "Jeddah", country: "Saudi Arabia", name: "King Abdulaziz International", region: "Middle East" },
  { code: "KWI", city: "Kuwait City", country: "Kuwait", name: "Kuwait International", region: "Middle East" },
  { code: "TLV", city: "Tel Aviv", country: "Israel", name: "Ben Gurion Airport", region: "Middle East" },
  { code: "AMM", city: "Amman", country: "Jordan", name: "Queen Alia International", region: "Middle East" },

  // ─── Europe ────────────────────────────────────────────────────────────
  { code: "LHR", city: "London", country: "United Kingdom", name: "Heathrow Airport", region: "Europe" },
  { code: "LGW", city: "London", country: "United Kingdom", name: "Gatwick Airport", region: "Europe" },
  { code: "CDG", city: "Paris", country: "France", name: "Charles de Gaulle Airport", region: "Europe" },
  { code: "FCO", city: "Rome", country: "Italy", name: "Leonardo da Vinci–Fiumicino", region: "Europe" },
  { code: "MXP", city: "Milan", country: "Italy", name: "Milan Malpensa Airport", region: "Europe" },
  { code: "BCN", city: "Barcelona", country: "Spain", name: "Barcelona–El Prat", region: "Europe" },
  { code: "MAD", city: "Madrid", country: "Spain", name: "Adolfo Suárez Madrid–Barajas", region: "Europe" },
  { code: "AMS", city: "Amsterdam", country: "Netherlands", name: "Schiphol Airport", region: "Europe" },
  { code: "FRA", city: "Frankfurt", country: "Germany", name: "Frankfurt Airport", region: "Europe" },
  { code: "MUC", city: "Munich", country: "Germany", name: "Munich Airport", region: "Europe" },
  { code: "ZRH", city: "Zurich", country: "Switzerland", name: "Zurich Airport", region: "Europe" },
  { code: "GVA", city: "Geneva", country: "Switzerland", name: "Geneva Airport", region: "Europe" },
  { code: "VIE", city: "Vienna", country: "Austria", name: "Vienna International", region: "Europe" },
  { code: "PRG", city: "Prague", country: "Czech Republic", name: "Václav Havel Airport", region: "Europe" },
  { code: "BUD", city: "Budapest", country: "Hungary", name: "Budapest Ferenc Liszt", region: "Europe" },
  { code: "WAW", city: "Warsaw", country: "Poland", name: "Warsaw Chopin Airport", region: "Europe" },
  { code: "CPH", city: "Copenhagen", country: "Denmark", name: "Copenhagen Airport", region: "Europe" },
  { code: "ARN", city: "Stockholm", country: "Sweden", name: "Stockholm Arlanda", region: "Europe" },
  { code: "OSL", city: "Oslo", country: "Norway", name: "Oslo Gardermoen", region: "Europe" },
  { code: "HEL", city: "Helsinki", country: "Finland", name: "Helsinki-Vantaa", region: "Europe" },
  { code: "ATH", city: "Athens", country: "Greece", name: "Athens International", region: "Europe" },
  { code: "IST", city: "Istanbul", country: "Turkey", name: "Istanbul Airport", region: "Europe" },
  { code: "LIS", city: "Lisbon", country: "Portugal", name: "Humberto Delgado Airport", region: "Europe" },
  { code: "DUB", city: "Dublin", country: "Ireland", name: "Dublin Airport", region: "Europe" },
  { code: "EDI", city: "Edinburgh", country: "United Kingdom", name: "Edinburgh Airport", region: "Europe" },
  { code: "BRU", city: "Brussels", country: "Belgium", name: "Brussels Airport", region: "Europe" },

  // ─── Africa ────────────────────────────────────────────────────────────
  { code: "JNB", city: "Johannesburg", country: "South Africa", name: "O.R. Tambo International", region: "Africa" },
  { code: "CPT", city: "Cape Town", country: "South Africa", name: "Cape Town International", region: "Africa" },
  { code: "NBO", city: "Nairobi", country: "Kenya", name: "Jomo Kenyatta International", region: "Africa" },
  { code: "CAI", city: "Cairo", country: "Egypt", name: "Cairo International", region: "Africa" },
  { code: "CMN", city: "Casablanca", country: "Morocco", name: "Mohammed V International", region: "Africa" },
  { code: "ADD", city: "Addis Ababa", country: "Ethiopia", name: "Bole International", region: "Africa" },
  { code: "DAR", city: "Dar es Salaam", country: "Tanzania", name: "Julius Nyerere International", region: "Africa" },
  { code: "MRU", city: "Mauritius", country: "Mauritius", name: "Sir Seewoosagur Ramgoolam International", region: "Africa" },
  { code: "SEZ", city: "Seychelles", country: "Seychelles", name: "Seychelles International", region: "Africa" },

  // ─── North America ─────────────────────────────────────────────────────
  { code: "JFK", city: "New York", country: "United States", name: "John F. Kennedy International", region: "North America" },
  { code: "LAX", city: "Los Angeles", country: "United States", name: "Los Angeles International", region: "North America" },
  { code: "SFO", city: "San Francisco", country: "United States", name: "San Francisco International", region: "North America" },
  { code: "ORD", city: "Chicago", country: "United States", name: "O'Hare International", region: "North America" },
  { code: "MIA", city: "Miami", country: "United States", name: "Miami International", region: "North America" },
  { code: "ATL", city: "Atlanta", country: "United States", name: "Hartsfield-Jackson Atlanta International", region: "North America" },
  { code: "DFW", city: "Dallas", country: "United States", name: "Dallas/Fort Worth International", region: "North America" },
  { code: "SEA", city: "Seattle", country: "United States", name: "Seattle-Tacoma International", region: "North America" },
  { code: "BOS", city: "Boston", country: "United States", name: "Boston Logan International", region: "North America" },
  { code: "IAD", city: "Washington D.C.", country: "United States", name: "Dulles International", region: "North America" },
  { code: "LAS", city: "Las Vegas", country: "United States", name: "Harry Reid International", region: "North America" },
  { code: "HNL", city: "Honolulu", country: "United States", name: "Daniel K. Inouye International", region: "North America" },
  { code: "YYZ", city: "Toronto", country: "Canada", name: "Toronto Pearson International", region: "North America" },
  { code: "YVR", city: "Vancouver", country: "Canada", name: "Vancouver International", region: "North America" },
  { code: "MEX", city: "Mexico City", country: "Mexico", name: "Benito Juárez International", region: "North America" },
  { code: "CUN", city: "Cancún", country: "Mexico", name: "Cancún International", region: "North America" },

  // ─── South America ─────────────────────────────────────────────────────
  { code: "GRU", city: "São Paulo", country: "Brazil", name: "Guarulhos International", region: "South America" },
  { code: "GIG", city: "Rio de Janeiro", country: "Brazil", name: "Galeão International", region: "South America" },
  { code: "EZE", city: "Buenos Aires", country: "Argentina", name: "Ministro Pistarini International", region: "South America" },
  { code: "SCL", city: "Santiago", country: "Chile", name: "Arturo Merino Benítez International", region: "South America" },
  { code: "BOG", city: "Bogotá", country: "Colombia", name: "El Dorado International", region: "South America" },
  { code: "LIM", city: "Lima", country: "Peru", name: "Jorge Chávez International", region: "South America" },

  // ─── Oceania ───────────────────────────────────────────────────────────
  { code: "SYD", city: "Sydney", country: "Australia", name: "Sydney Airport", region: "Oceania" },
  { code: "MEL", city: "Melbourne", country: "Australia", name: "Melbourne Airport", region: "Oceania" },
  { code: "AKL", city: "Auckland", country: "New Zealand", name: "Auckland Airport", region: "Oceania" },
  { code: "NAN", city: "Fiji", country: "Fiji", name: "Nadi International", region: "Oceania" },
];

// ─── Region / Country entries (for broader searches) ─────────────────────

export interface RegionEntry {
  name: string;
  type: "region" | "country";
  description: string;
}

export const regions: RegionEntry[] = [
  { name: "Europe", type: "region", description: "Paris, Rome, London, Barcelona & more" },
  { name: "Southeast Asia", type: "region", description: "Bangkok, Bali, Singapore, Vietnam" },
  { name: "East Asia", type: "region", description: "Tokyo, Seoul, Hong Kong, Taipei" },
  { name: "Middle East", type: "region", description: "Dubai, Doha, Abu Dhabi, Muscat" },
  { name: "Japan", type: "country", description: "Tokyo, Osaka, Kyoto, Hokkaido" },
  { name: "South Korea", type: "country", description: "Seoul, Busan, Jeju Island" },
  { name: "Thailand", type: "country", description: "Bangkok, Phuket, Chiang Mai" },
  { name: "Italy", type: "country", description: "Rome, Milan, Venice, Florence" },
  { name: "France", type: "country", description: "Paris, Nice, Lyon, Marseille" },
  { name: "Spain", type: "country", description: "Barcelona, Madrid, Seville" },
  { name: "United Kingdom", type: "country", description: "London, Edinburgh, Manchester" },
  { name: "United States", type: "country", description: "New York, LA, San Francisco" },
  { name: "Australia", type: "country", description: "Sydney, Melbourne, Gold Coast" },
  { name: "Switzerland", type: "country", description: "Zurich, Geneva, Interlaken" },
  { name: "Turkey", type: "country", description: "Istanbul, Cappadocia, Antalya" },
  { name: "Greece", type: "country", description: "Athens, Santorini, Mykonos" },
  { name: "Indonesia", type: "country", description: "Bali, Jakarta, Yogyakarta" },
  { name: "Vietnam", type: "country", description: "Hanoi, Ho Chi Minh, Da Nang" },
  { name: "Sri Lanka", type: "country", description: "Colombo, Kandy, Galle" },
  { name: "Maldives", type: "country", description: "Malé, overwater villas, atolls" },
];

// ─── Search function ─────────────────────────────────────────────────────

export interface AutocompleteSuggestion {
  type: "airport" | "city" | "region" | "country";
  primary: string;       // Main display text
  secondary: string;     // Subtitle text
  code?: string;         // IATA code for airports
  value: string;         // The value to use
}

export function searchAirportsAndCities(query: string, limit = 8): AutocompleteSuggestion[] {
  if (!query || query.length < 1) return [];

  const q = query.toLowerCase().trim();
  const results: AutocompleteSuggestion[] = [];
  const seen = new Set<string>();

  // Search regions first (for destination field)
  for (const r of regions) {
    if (r.name.toLowerCase().includes(q)) {
      const key = `region:${r.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          type: r.type,
          primary: r.name,
          secondary: r.description,
          value: r.name,
        });
      }
    }
  }

  // Search airports by city name, airport name, IATA code, and country
  for (const a of airports) {
    if (results.length >= limit) break;

    const matches =
      a.city.toLowerCase().includes(q) ||
      a.code.toLowerCase() === q ||
      (a.name && a.name.toLowerCase().includes(q)) ||
      a.country.toLowerCase().includes(q);

    if (matches) {
      // Add city entry (deduplicated)
      const cityKey = `city:${a.city}:${a.country}`;
      if (!seen.has(cityKey)) {
        seen.add(cityKey);
        results.push({
          type: "city",
          primary: a.city,
          secondary: `${a.country}`,
          code: a.code,
          value: a.city,
        });
      }
    }
  }

  return results.slice(0, limit);
}
