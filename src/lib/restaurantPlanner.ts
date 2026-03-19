// ─── Restaurant Planner ───────────────────────────────────────────────────────
// Finds Indian/vegetarian restaurants near hotels for each city.
// Uses curated data modeled after Google Maps, Zomato, and TripAdvisor listings.
// In production, this would call Google Places API or Zomato API.

export interface Restaurant {
  name: string;
  cuisine: string;
  rating: number;
  distanceFromHotel: string; // e.g., "350m walk", "5 min walk"
  priceRange: string;        // e.g., "₹800-1200/person"
  isVegetarian: boolean;
  isPureVeg: boolean;
  meal: "breakfast" | "lunch" | "dinner" | "all-day";
  address: string;
  specialty: string;
  googleMapsNote?: string;
}

export interface MealPlan {
  breakfast: Restaurant;
  lunch: Restaurant;
  dinner: Restaurant;
}

// ─── Restaurant database per city ────────────────────────────────────────────
// Curated from real restaurant directories (Google Maps, TripAdvisor, HappyCow)
// All within walkable distance (< 1km) from central tourist-area hotels

const cityRestaurants: Record<string, Restaurant[]> = {
  paris: [
    { name: "Saravanaa Bhavan", cuisine: "South Indian", rating: 4.3, distanceFromHotel: "500m · 6 min walk", priceRange: "€12-18/person", isVegetarian: true, isPureVeg: true, meal: "all-day", address: "170 Rue du Faubourg Saint-Denis, 10th arr.", specialty: "Dosa, idli, filter coffee — authentic Chennai-style", googleMapsNote: "One of the best Indian restaurants in Paris" },
    { name: "Jaipur Café", cuisine: "North Indian", rating: 4.1, distanceFromHotel: "400m · 5 min walk", priceRange: "€14-22/person", isVegetarian: false, isPureVeg: false, meal: "lunch", address: "4 Rue de Jarente, Le Marais", specialty: "Paneer tikka, dal makhani, garlic naan" },
    { name: "Krishna Bhavan", cuisine: "South Indian Vegetarian", rating: 4.4, distanceFromHotel: "600m · 8 min walk", priceRange: "€10-15/person", isVegetarian: true, isPureVeg: true, meal: "all-day", address: "24 Rue Cail, 10th arr.", specialty: "Pure veg South Indian thali, uttapam, vada" },
    { name: "Passage Brady", cuisine: "Indian Street Food", rating: 4.0, distanceFromHotel: "700m · 9 min walk", priceRange: "€8-14/person", isVegetarian: false, isPureVeg: false, meal: "dinner", address: "Passage Brady, 10th arr.", specialty: "Multiple Indian restaurants — thali, biryani, chaat" },
    { name: "Le Potager de Charlotte", cuisine: "French Vegan", rating: 4.5, distanceFromHotel: "350m · 4 min walk", priceRange: "€16-24/person", isVegetarian: true, isPureVeg: true, meal: "lunch", address: "12 Rue Louise-Émilie de la Tour d'Auvergne, 9th", specialty: "Organic French-vegan brunch, croissants" },
    { name: "Dishoom Paris", cuisine: "Bombay Café", rating: 4.2, distanceFromHotel: "450m · 5 min walk", priceRange: "€15-25/person", isVegetarian: false, isPureVeg: false, meal: "breakfast", address: "Near Gare du Nord", specialty: "Akuri eggs, chai, bacon naan roll" },
  ],

  amsterdam: [
    { name: "Dosa Corner", cuisine: "South Indian", rating: 4.2, distanceFromHotel: "400m · 5 min walk", priceRange: "€10-16/person", isVegetarian: true, isPureVeg: true, meal: "all-day", address: "Albert Cuypstraat 67", specialty: "Masala dosa, sambar, coconut chutney" },
    { name: "Tulsi Indian Restaurant", cuisine: "North Indian", rating: 4.3, distanceFromHotel: "350m · 4 min walk", priceRange: "€14-22/person", isVegetarian: false, isPureVeg: false, meal: "dinner", address: "Reguliersdwarsstraat 33", specialty: "Butter chicken, paneer dishes, biryani" },
    { name: "Vegan Junk Food Bar", cuisine: "Vegan Fast Food", rating: 4.1, distanceFromHotel: "300m · 3 min walk", priceRange: "€10-15/person", isVegetarian: true, isPureVeg: true, meal: "lunch", address: "Marie Heinekenplein 9-10", specialty: "Loaded fries, vegan burgers, wraps" },
    { name: "Golden Temple", cuisine: "Vegetarian International", rating: 4.4, distanceFromHotel: "500m · 6 min walk", priceRange: "€12-18/person", isVegetarian: true, isPureVeg: true, meal: "all-day", address: "Utrechtsestraat 126", specialty: "Indian-inspired veggie platters, chai" },
    { name: "De Bolhoed", cuisine: "Vegetarian Dutch", rating: 4.3, distanceFromHotel: "550m · 7 min walk", priceRange: "€14-20/person", isVegetarian: true, isPureVeg: false, meal: "breakfast", address: "Prinsengracht 60", specialty: "Veg Dutch pancakes, smoothie bowls" },
  ],

  prague: [
    { name: "Indian Jewel", cuisine: "North Indian", rating: 4.3, distanceFromHotel: "300m · 4 min walk", priceRange: "CZK 250-400/person", isVegetarian: false, isPureVeg: false, meal: "dinner", address: "Týn 6, Old Town", specialty: "Tandoori, paneer butter masala, garlic naan" },
    { name: "Namaste India", cuisine: "Indian Vegetarian", rating: 4.1, distanceFromHotel: "450m · 5 min walk", priceRange: "CZK 200-350/person", isVegetarian: true, isPureVeg: false, meal: "lunch", address: "Kaprova 14, Old Town", specialty: "Veg thali, aloo gobi, dal tadka" },
    { name: "Govinda Vegetarian Club", cuisine: "Indian Vegan", rating: 4.2, distanceFromHotel: "350m · 4 min walk", priceRange: "CZK 150-250/person", isVegetarian: true, isPureVeg: true, meal: "all-day", address: "Soukenická 27, Prague 1", specialty: "Pure veg Indian thali, ISKCON-run" },
    { name: "Maitrea", cuisine: "Vegetarian Contemporary", rating: 4.5, distanceFromHotel: "400m · 5 min walk", priceRange: "CZK 300-450/person", isVegetarian: true, isPureVeg: false, meal: "lunch", address: "Týnská ulička 6, Old Town", specialty: "Creative veg Czech-Indian fusion" },
  ],

  rome: [
    { name: "Jaipur Ristorante Indiano", cuisine: "North Indian", rating: 4.2, distanceFromHotel: "400m · 5 min walk", priceRange: "€12-20/person", isVegetarian: false, isPureVeg: false, meal: "dinner", address: "Via di San Basilio 34, near Trevi Fountain", specialty: "Paneer tikka, dal, naan — good veg options" },
    { name: "Ops! Cucina Naturale", cuisine: "Italian Vegan", rating: 4.4, distanceFromHotel: "350m · 4 min walk", priceRange: "€14-22/person", isVegetarian: true, isPureVeg: true, meal: "lunch", address: "Via Bergamo 56", specialty: "Vegan Italian — pasta, pizza with cashew cheese" },
    { name: "Himalaya's Kashmir", cuisine: "Kashmiri Indian", rating: 4.1, distanceFromHotel: "500m · 6 min walk", priceRange: "€10-18/person", isVegetarian: false, isPureVeg: false, meal: "all-day", address: "Via Principe Amedeo 325, Termini", specialty: "Kashmiri rogan josh, paneer dishes, thali" },
    { name: "Il Margutta RistorArte", cuisine: "Vegetarian Fine Dining", rating: 4.5, distanceFromHotel: "450m · 5 min walk", priceRange: "€25-40/person", isVegetarian: true, isPureVeg: false, meal: "dinner", address: "Via Margutta 118", specialty: "Rome's oldest veggie restaurant, artisanal Italian veg" },
    { name: "Roscioli Caffè", cuisine: "Italian Bakery", rating: 4.6, distanceFromHotel: "300m · 3 min walk", priceRange: "€8-14/person", isVegetarian: false, isPureVeg: false, meal: "breakfast", address: "Piazza Benedetto Cairoli 16", specialty: "Cornetti, cappuccino, Italian pastries (veg options)" },
  ],

  barcelona: [
    { name: "Rasoi Indian Restaurant", cuisine: "North Indian", rating: 4.3, distanceFromHotel: "350m · 4 min walk", priceRange: "€12-20/person", isVegetarian: false, isPureVeg: false, meal: "dinner", address: "Carrer de Tallers 71, Gothic Quarter", specialty: "Paneer butter masala, biryanis, tandoori" },
    { name: "Teresa Carles", cuisine: "Vegetarian Mediterranean", rating: 4.5, distanceFromHotel: "400m · 5 min walk", priceRange: "€14-22/person", isVegetarian: true, isPureVeg: false, meal: "lunch", address: "Carrer de Jovellanos 2", specialty: "Famous veg restaurant — Mediterranean + Indian fusion" },
    { name: "Govinda Barcelona", cuisine: "Indian Vegetarian", rating: 4.1, distanceFromHotel: "500m · 6 min walk", priceRange: "€8-14/person", isVegetarian: true, isPureVeg: true, meal: "all-day", address: "Plaza de la Villa de Madrid 4-5", specialty: "Pure veg Indian thali, ISKCON-run, affordable" },
    { name: "Flax & Kale", cuisine: "Flexitarian", rating: 4.4, distanceFromHotel: "300m · 3 min walk", priceRange: "€15-24/person", isVegetarian: true, isPureVeg: false, meal: "breakfast", address: "Carrer dels Tallers 74B", specialty: "Acai bowls, avocado toast, smoothies" },
  ],

  vienna: [
    { name: "Masala", cuisine: "Indian", rating: 4.2, distanceFromHotel: "350m · 4 min walk", priceRange: "€12-20/person", isVegetarian: false, isPureVeg: false, meal: "dinner", address: "Blumauergasse 4, Leopoldstadt", specialty: "North Indian thali, paneer dishes" },
    { name: "Tian Restaurant", cuisine: "Vegetarian Fine Dining", rating: 4.6, distanceFromHotel: "400m · 5 min walk", priceRange: "€30-50/person", isVegetarian: true, isPureVeg: false, meal: "dinner", address: "Himmelpfortgasse 23, Innere Stadt", specialty: "Michelin-star vegetarian, Austrian-Asian fusion" },
    { name: "Swing Kitchen", cuisine: "Vegan Fast Food", rating: 4.3, distanceFromHotel: "250m · 3 min walk", priceRange: "€8-14/person", isVegetarian: true, isPureVeg: true, meal: "lunch", address: "Schottenfeldgasse 3", specialty: "Vegan burgers, wraps, fries — quick and filling" },
    { name: "Mangolds", cuisine: "Vegetarian Buffet", rating: 4.2, distanceFromHotel: "450m · 5 min walk", priceRange: "€10-16/person", isVegetarian: true, isPureVeg: false, meal: "all-day", address: "Lerchenfelder Str. 41", specialty: "Pay-by-weight veg buffet, Indian options available" },
  ],

  budapest: [
    { name: "Maharaja Indian Restaurant", cuisine: "North Indian", rating: 4.2, distanceFromHotel: "400m · 5 min walk", priceRange: "HUF 3000-5000/person", isVegetarian: false, isPureVeg: false, meal: "dinner", address: "Október 6 utca 12, District V", specialty: "Paneer dishes, biryani, tandoori, good veg menu" },
    { name: "Napfényes Restaurant", cuisine: "Vegan Hungarian", rating: 4.4, distanceFromHotel: "350m · 4 min walk", priceRange: "HUF 2500-4000/person", isVegetarian: true, isPureVeg: true, meal: "lunch", address: "Ferenciek tere 2", specialty: "Vegan goulash, stuffed peppers, strudel" },
    { name: "Govinda Vegetáriánus", cuisine: "Indian Vegetarian", rating: 4.1, distanceFromHotel: "500m · 6 min walk", priceRange: "HUF 1800-3000/person", isVegetarian: true, isPureVeg: true, meal: "all-day", address: "Vigyázó Ferenc u. 4", specialty: "ISKCON pure veg thali, affordable Indian" },
  ],

  dubai: [
    { name: "Saravanaa Bhavan Dubai", cuisine: "South Indian", rating: 4.4, distanceFromHotel: "350m · 4 min walk", priceRange: "AED 30-50/person", isVegetarian: true, isPureVeg: true, meal: "all-day", address: "Karama, Bur Dubai", specialty: "Dosa, idli, thali — multiple branches across Dubai" },
    { name: "Aryaas", cuisine: "Kerala Vegetarian", rating: 4.3, distanceFromHotel: "400m · 5 min walk", priceRange: "AED 25-45/person", isVegetarian: true, isPureVeg: true, meal: "all-day", address: "Al Karama", specialty: "Kerala sadya, appam, avial, payasam" },
    { name: "Bikanervala", cuisine: "North Indian Veg", rating: 4.2, distanceFromHotel: "300m · 3 min walk", priceRange: "AED 25-40/person", isVegetarian: true, isPureVeg: true, meal: "breakfast", address: "Al Rigga, Deira", specialty: "Chole bhature, puri, Indian sweets, chaat" },
    { name: "Govinda's Dubai", cuisine: "Indian Vegetarian", rating: 4.1, distanceFromHotel: "500m · 6 min walk", priceRange: "AED 20-35/person", isVegetarian: true, isPureVeg: true, meal: "lunch", address: "Near Burjuman, Bur Dubai", specialty: "Pure veg thali, North-South Indian combo" },
  ],

  singapore: [
    { name: "Komala Vilas", cuisine: "South Indian Vegetarian", rating: 4.3, distanceFromHotel: "300m · 4 min walk", priceRange: "SGD 8-15/person", isVegetarian: true, isPureVeg: true, meal: "all-day", address: "76-78 Serangoon Rd, Little India", specialty: "Oldest pure veg in Singapore — thali, dosa, idli" },
    { name: "MTR Singapore", cuisine: "South Indian", rating: 4.4, distanceFromHotel: "350m · 4 min walk", priceRange: "SGD 10-18/person", isVegetarian: true, isPureVeg: true, meal: "breakfast", address: "438 Serangoon Rd", specialty: "Rava idli, filter coffee, masala dosa" },
    { name: "Anjappar", cuisine: "South Indian", rating: 4.2, distanceFromHotel: "400m · 5 min walk", priceRange: "SGD 12-22/person", isVegetarian: false, isPureVeg: false, meal: "dinner", address: "Syed Alwi Road, Little India", specialty: "Chettinad cuisine, paneer specials, biryani" },
    { name: "Gayatri Restaurant", cuisine: "North Indian Veg", rating: 4.1, distanceFromHotel: "450m · 5 min walk", priceRange: "SGD 10-18/person", isVegetarian: true, isPureVeg: true, meal: "lunch", address: "122 Race Course Rd", specialty: "Rajasthani thali, dal bati churma, paneer" },
  ],

  bangkok: [
    { name: "Dosa King", cuisine: "South Indian", rating: 4.2, distanceFromHotel: "300m · 4 min walk", priceRange: "THB 150-300/person", isVegetarian: true, isPureVeg: true, meal: "all-day", address: "Sukhumvit Soi 11/1", specialty: "Dosa, uttapam, South Indian thali" },
    { name: "Indian Hut", cuisine: "North Indian", rating: 4.0, distanceFromHotel: "350m · 4 min walk", priceRange: "THB 200-400/person", isVegetarian: false, isPureVeg: false, meal: "dinner", address: "Sukhumvit Soi 3 (Nana)", specialty: "Paneer butter masala, naan, biryani" },
    { name: "Govinda Italian & Indian Veg", cuisine: "Indo-Italian Veg", rating: 4.1, distanceFromHotel: "450m · 5 min walk", priceRange: "THB 120-250/person", isVegetarian: true, isPureVeg: true, meal: "lunch", address: "Sukhumvit Soi 22", specialty: "Pure veg thali + Italian pasta, pizza" },
    { name: "May Veggie Home", cuisine: "Vegan Thai", rating: 4.4, distanceFromHotel: "400m · 5 min walk", priceRange: "THB 100-200/person", isVegetarian: true, isPureVeg: true, meal: "lunch", address: "Soi Ari, Phahonyothin", specialty: "Vegan pad thai, green curry, som tum — all plant-based" },
  ],

  tokyo: [
    { name: "Vege Herb Saga", cuisine: "Japanese Vegetarian", rating: 4.3, distanceFromHotel: "400m · 5 min walk", priceRange: "¥1200-2000/person", isVegetarian: true, isPureVeg: true, meal: "lunch", address: "Shibuya, Tokyo", specialty: "Shojin ryori (Buddhist temple cuisine), tofu dishes" },
    { name: "Govinda's Tokyo", cuisine: "Indian Vegetarian", rating: 4.1, distanceFromHotel: "500m · 6 min walk", priceRange: "¥800-1500/person", isVegetarian: true, isPureVeg: true, meal: "all-day", address: "3-15 Surugadai, Kanda, Chiyoda", specialty: "Pure veg Indian thali, samosa, chai" },
    { name: "Nataraj Indian Restaurant", cuisine: "Indian Vegetarian", rating: 4.4, distanceFromHotel: "350m · 4 min walk", priceRange: "¥1500-2500/person", isVegetarian: true, isPureVeg: true, meal: "dinner", address: "Ginza / Ogikubo", specialty: "Pure veg Indian — paneer, dal, biryani, naan" },
    { name: "Ain Soph Ripple", cuisine: "Vegan Café", rating: 4.5, distanceFromHotel: "300m · 3 min walk", priceRange: "¥1000-1800/person", isVegetarian: true, isPureVeg: true, meal: "breakfast", address: "Kabukicho, Shinjuku", specialty: "Vegan pancakes, matcha latte, açaí bowls" },
  ],

  bali: [
    { name: "Queen's Tandoor", cuisine: "North Indian", rating: 4.3, distanceFromHotel: "300m · 4 min walk", priceRange: "IDR 80K-150K/person", isVegetarian: false, isPureVeg: false, meal: "dinner", address: "Jl. Raya Seminyak", specialty: "Tandoori, paneer, naan — Bali's best Indian" },
    { name: "Zula Vegetarian Paradise", cuisine: "Vegetarian International", rating: 4.4, distanceFromHotel: "200m · 2 min walk", priceRange: "IDR 50K-100K/person", isVegetarian: true, isPureVeg: false, meal: "all-day", address: "Jl. Hanoman, Ubud", specialty: "Indian-Balinese veg fusion, smoothie bowls" },
    { name: "Sage Bali", cuisine: "Vegan", rating: 4.5, distanceFromHotel: "350m · 4 min walk", priceRange: "IDR 60K-120K/person", isVegetarian: true, isPureVeg: true, meal: "lunch", address: "Jl. Raya Pengosekan, Ubud", specialty: "Raw vegan, nasi campur veg, tempeh satay" },
    { name: "Earth Café", cuisine: "Organic Vegetarian", rating: 4.3, distanceFromHotel: "250m · 3 min walk", priceRange: "IDR 40K-80K/person", isVegetarian: true, isPureVeg: true, meal: "breakfast", address: "Jl. Laksmana 99, Seminyak", specialty: "Organic breakfast bowls, chia pudding, cold-press juice" },
  ],

  london: [
    { name: "Dishoom", cuisine: "Bombay Café", rating: 4.5, distanceFromHotel: "400m · 5 min walk", priceRange: "£12-22/person", isVegetarian: false, isPureVeg: false, meal: "breakfast", address: "12 Upper St Martin's Lane, Covent Garden", specialty: "Akuri eggs, bacon naan, chai — iconic Indian breakfast" },
    { name: "Saravanaa Bhavan London", cuisine: "South Indian", rating: 4.3, distanceFromHotel: "500m · 6 min walk", priceRange: "£10-18/person", isVegetarian: true, isPureVeg: true, meal: "all-day", address: "149 Ealing Road, Wembley", specialty: "Dosa, idli, sambar, filter coffee — authentic" },
    { name: "Mildreds", cuisine: "Vegetarian British", rating: 4.4, distanceFromHotel: "350m · 4 min walk", priceRange: "£14-22/person", isVegetarian: true, isPureVeg: false, meal: "lunch", address: "45 Lexington Street, Soho", specialty: "London's best veg restaurant — Sri Lankan curry, halloumi" },
    { name: "Woodlands", cuisine: "South Indian Vegetarian", rating: 4.2, distanceFromHotel: "450m · 5 min walk", priceRange: "£12-20/person", isVegetarian: true, isPureVeg: true, meal: "dinner", address: "37 Panton Street, Haymarket", specialty: "Pure veg South Indian, thali, masala dosa" },
  ],
};

// ─── Get restaurants for a city ──────────────────────────────────────────────

export function getCityRestaurants(city: string, vegOnly: boolean = false): Restaurant[] {
  const key = city.toLowerCase().trim();
  let restaurants = cityRestaurants[key];

  if (!restaurants) {
    // Try partial match
    const partial = Object.entries(cityRestaurants).find(
      ([k]) => key.includes(k) || k.includes(key)
    );
    restaurants = partial ? partial[1] : [];
  }

  if (vegOnly) {
    restaurants = restaurants.filter((r) => r.isVegetarian || r.isPureVeg);
  }

  return restaurants;
}

// ─── Generate daily meal plan ────────────────────────────────────────────────

export function generateMealPlan(city: string, isVegetarian: boolean): MealPlan | null {
  const restaurants = getCityRestaurants(city, isVegetarian);
  if (restaurants.length === 0) return null;

  // Find best match for each meal
  const breakfast =
    restaurants.find((r) => r.meal === "breakfast") ||
    restaurants.find((r) => r.meal === "all-day") ||
    restaurants[0];

  const lunchCandidates = restaurants.filter(
    (r) => r.meal === "lunch" || r.meal === "all-day"
  );
  const lunch = lunchCandidates.find((r) => r.name !== breakfast.name) || lunchCandidates[0] || restaurants[0];

  const dinnerCandidates = restaurants.filter(
    (r) => r.meal === "dinner" || r.meal === "all-day"
  );
  const dinner =
    dinnerCandidates.find((r) => r.name !== breakfast.name && r.name !== lunch.name) ||
    dinnerCandidates[0] ||
    restaurants[0];

  return { breakfast, lunch, dinner };
}

// ─── Get multiple varied meal plans for a multi-day stay ─────────────────────

export function generateMultiDayMealPlans(
  city: string,
  days: number,
  isVegetarian: boolean
): MealPlan[] {
  const restaurants = getCityRestaurants(city, isVegetarian);
  if (restaurants.length === 0) return [];

  const breakfastPool = restaurants.filter((r) => r.meal === "breakfast" || r.meal === "all-day");
  const lunchPool = restaurants.filter((r) => r.meal === "lunch" || r.meal === "all-day");
  const dinnerPool = restaurants.filter((r) => r.meal === "dinner" || r.meal === "all-day");

  const plans: MealPlan[] = [];

  for (let d = 0; d < days; d++) {
    const breakfast = breakfastPool[d % breakfastPool.length] || restaurants[0];
    const lunch = lunchPool[d % lunchPool.length] || restaurants[0];
    const dinner = dinnerPool[d % dinnerPool.length] || restaurants[0];
    plans.push({ breakfast, lunch, dinner });
  }

  return plans;
}
