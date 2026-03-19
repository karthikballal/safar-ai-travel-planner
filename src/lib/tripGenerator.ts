// Dynamic Trip Data Generator
// Generates realistic mock trip data based on user input (origin, destination, dates, etc.)
// In production, this would be replaced by real API responses from the AI agents.

import type { TripData, Flight, Hotel, DayPlan, Activity, VisaDocument, TransportSegment, RouteOverview, CityStay } from "@/data/mockTrip";
import { planRoute, planRouteFromOption, resolveIndianAirport, getIntlFlightCost, isRegion, getRegionKey } from "@/lib/routePlanner";
import type { RouteOption, PlannedRoute } from "@/lib/routePlanner";
import { getCityActivities } from "@/lib/cityActivities";
import { generateMultiDayMealPlans, type MealPlan } from "@/lib/restaurantPlanner";

// ─── Airport Codes ───────────────────────────────────────────────────────────
const airportMap: Record<string, { code: string; city: string }> = {
  mumbai:     { code: "BOM", city: "Mumbai" },
  delhi:      { code: "DEL", city: "New Delhi" },
  bangalore:  { code: "BLR", city: "Bengaluru" },
  bengaluru:  { code: "BLR", city: "Bengaluru" },
  chennai:    { code: "MAA", city: "Chennai" },
  kolkata:    { code: "CCU", city: "Kolkata" },
  hyderabad:  { code: "HYD", city: "Hyderabad" },
  pune:       { code: "PNQ", city: "Pune" },
  ahmedabad:  { code: "AMD", city: "Ahmedabad" },
  kochi:      { code: "COK", city: "Kochi" },
  goa:        { code: "GOI", city: "Goa" },
  jaipur:     { code: "JAI", city: "Jaipur" },
  paris:      { code: "CDG", city: "Paris" },
  london:     { code: "LHR", city: "London" },
  tokyo:      { code: "NRT", city: "Tokyo" },
  japan:      { code: "NRT", city: "Tokyo" },
  osaka:      { code: "KIX", city: "Osaka" },
  dubai:      { code: "DXB", city: "Dubai" },
  singapore:  { code: "SIN", city: "Singapore" },
  new_york:   { code: "JFK", city: "New York" },
  "new york": { code: "JFK", city: "New York" },
  bali:       { code: "DPS", city: "Bali" },
  bangkok:    { code: "BKK", city: "Bangkok" },
  rome:       { code: "FCO", city: "Rome" },
  maldives:   { code: "MLE", city: "Malé" },
  switzerland:{ code: "ZRH", city: "Zürich" },
  zurich:     { code: "ZRH", city: "Zürich" },
  iceland:    { code: "KEF", city: "Reykjavík" },
  santorini:  { code: "JTR", city: "Santorini" },
  greece:     { code: "ATH", city: "Athens" },
  vietnam:    { code: "SGN", city: "Ho Chi Minh City" },
  morocco:    { code: "RAK", city: "Marrakech" },
  australia:  { code: "SYD", city: "Sydney" },
  sydney:     { code: "SYD", city: "Sydney" },
};

function getAirport(city: string): { code: string; city: string } {
  const key = city.toLowerCase().trim();
  return airportMap[key] || { code: key.slice(0, 3).toUpperCase(), city };
}

// ─── Destination Profiles ────────────────────────────────────────────────────
interface DestinationProfile {
  country: string;
  airlines: string[];
  flightDuration: string;
  flightPriceRange: [number, number];
  hotel: Omit<Hotel, "id" | "checkIn" | "checkOut" | "nights" | "totalPrice">;
  landmarks: string[];
  visaType: string;
  visaRequired: boolean;
  visaProcessingTime: string;
  currency: string;
  itineraryTemplates: {
    title: string;
    activities: { morning: Activity[]; afternoon: Activity[]; evening: Activity[] };
  }[];
}

const destinationProfiles: Record<string, DestinationProfile> = {
  japan: {
    country: "Japan",
    airlines: ["ANA (All Nippon Airways)", "Japan Airlines"],
    flightDuration: "10h 45m",
    flightPriceRange: [38000, 52000],
    hotel: {
      name: "The Ritz-Carlton, Tokyo",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
      stars: 5,
      rating: 4.9,
      reviews: 3412,
      address: "Tokyo Midtown, 9-7-1 Akasaka, Minato City, Tokyo",
      amenities: ["Free Wi-Fi", "Spa & Wellness", "Rooftop Bar", "Concierge", "Room Service", "Fitness Center", "Restaurant", "Airport Shuttle"],
      pricePerNight: 22000,
    },
    landmarks: ["Tokyo Tower", "Senso-ji Temple", "Meiji Shrine", "Shibuya Crossing", "Mount Fuji", "Fushimi Inari", "Arashiyama Bamboo"],
    visaType: "Japan Tourist Visa (Single Entry)",
    visaRequired: true,
    visaProcessingTime: "5-7 business days (apply at least 21 days before travel)",
    currency: "JPY",
    itineraryTemplates: [
      {
        title: "Arrival in Tokyo & First Impressions",
        activities: {
          morning: [
            { time: "10:00 AM", title: "Arrive at Narita Airport", description: "Clear immigration and take the Narita Express (N'EX) to central Tokyo. Your hotel is a short taxi ride from Tokyo Station.", type: "transport", cost: 2800 },
          ],
          afternoon: [
            { time: "1:00 PM", title: "Check-in at The Ritz-Carlton, Tokyo", description: "Settle into your room on the 53rd floor with panoramic views of Tokyo Tower and Mount Fuji on clear days.", type: "leisure", cost: 0 },
            { time: "2:30 PM", title: "Lunch at Ichiran Ramen (Shibuya)", description: "Experience Japan's famous solo-booth ramen dining. Customize your tonkotsu ramen's richness, spice, and noodle firmness.", type: "dining", cost: 1200, isVeg: false },
          ],
          evening: [
            { time: "5:00 PM", title: "Shibuya Crossing & Hachiko Statue", description: "Stand at the world's busiest pedestrian intersection. Visit the loyal Hachiko statue and explore the neon-lit streets of Shibuya.", type: "sightseeing", cost: 0 },
            { time: "7:30 PM", title: "Dinner at Gonpachi (The Kill Bill Restaurant)", description: "This Roppongi izakaya inspired the famous Kill Bill fight scene. Try the handmade soba noodles and yakitori skewers.", type: "dining", cost: 4500, isVeg: false },
          ],
        },
      },
      {
        title: "Traditional Tokyo — Temples, Shrines & Tea",
        activities: {
          morning: [
            { time: "8:00 AM", title: "Tsukiji Outer Market Breakfast", description: "Sample the freshest sushi, tamagoyaki (Japanese omelette), and matcha in Tokyo's legendary fish market area.", type: "dining", cost: 2000, isVeg: false },
            { time: "10:00 AM", title: "Senso-ji Temple & Asakusa", description: "Tokyo's oldest temple (founded 628 AD). Walk through the iconic Kaminari-mon gate and browse Nakamise shopping street for traditional souvenirs.", type: "sightseeing", cost: 0 },
          ],
          afternoon: [
            { time: "12:30 PM", title: "Lunch at Asakusa Imahan (Sukiyaki)", description: "A century-old restaurant famous for premium wagyu sukiyaki. Vegetarian option: tofu sukiyaki set.", type: "dining", cost: 5500, isVeg: false },
            { time: "2:30 PM", title: "Meiji Shrine & Harajuku", description: "Walk through the towering torii gate and forested path to Meiji Shrine. Then explore Harajuku's Takeshita Street for pop culture.", type: "culture", cost: 0 },
          ],
          evening: [
            { time: "5:30 PM", title: "Traditional Tea Ceremony", description: "Participate in an authentic 45-minute tea ceremony in Shinjuku. Learn the meditative art of matcha preparation from a certified tea master.", type: "culture", cost: 3500 },
            { time: "8:00 PM", title: "Dinner in Shinjuku Omoide Yokocho", description: "Explore 'Memory Lane' — a narrow alley of tiny yakitori stalls unchanged since the 1940s. Grilled chicken skewers and cold sake.", type: "dining", cost: 2500, isVeg: false },
          ],
        },
      },
      {
        title: "Akihabara, Teamlab & Modern Tokyo",
        activities: {
          morning: [
            { time: "9:00 AM", title: "teamLab Borderless (Azabudai Hills)", description: "Immerse yourself in 10,000 sq meters of interactive digital art. The infinity mirror rooms and flowing waterfalls are breathtaking.", type: "culture", cost: 3200 },
          ],
          afternoon: [
            { time: "12:30 PM", title: "Lunch at Afuri (Yuzu Ramen)", description: "Light, citrusy yuzu shio ramen — a refreshing alternative to heavy tonkotsu. The vegan ramen option is excellent.", type: "dining", cost: 1400, isVeg: true },
            { time: "2:00 PM", title: "Akihabara Electric Town", description: "Explore the neon-drenched mecca of anime, manga, retro gaming, and electronics. Visit a multi-story arcade and a themed maid café.", type: "sightseeing", cost: 1500 },
          ],
          evening: [
            { time: "6:00 PM", title: "Tokyo Skytree Observatory", description: "Ascend Japan's tallest structure (634m) for 360° views of the Tokyo sprawl below. On clear evenings, Mount Fuji glows at sunset.", type: "sightseeing", cost: 2100 },
            { time: "8:30 PM", title: "Dinner at Narisawa (2 Michelin Stars)", description: "Chef Yoshihiro Narisawa's innovative 'Satoyama' cuisine blends French technique with Japanese forest ingredients. Reserve months ahead.", type: "dining", cost: 18000, isVeg: false },
          ],
        },
      },
      {
        title: "Day Trip to Mount Fuji & Hakone",
        activities: {
          morning: [
            { time: "7:30 AM", title: "Shinkansen to Odawara", description: "Board the bullet train (35 minutes from Tokyo) for a day amid Japan's most iconic mountain landscape.", type: "transport", cost: 3200 },
            { time: "9:00 AM", title: "Hakone Open-Air Museum", description: "A stunning sculpture park set against mountain vistas. Picasso Pavilion, Henry Moore works, and an iconic stained-glass tower.", type: "culture", cost: 1800 },
          ],
          afternoon: [
            { time: "12:00 PM", title: "Lunch at Hakone Bakery & Table", description: "Freshly baked artisan bread and seasonal soups with views of Lake Ashi. Vegetarian-friendly.", type: "dining", cost: 1600, isVeg: true },
            { time: "1:30 PM", title: "Lake Ashi Pirate Ship Cruise", description: "A scenic 30-minute cruise across Lake Ashi on a replica pirate galleon. On clear days, Mount Fuji is reflected perfectly in the lake.", type: "sightseeing", cost: 1200 },
            { time: "3:00 PM", title: "Owakudani Volcanic Valley", description: "Ride the Hakone Ropeway over steaming sulphur vents. Eat a legendary black egg (kuro-tamago) — said to add 7 years to your life.", type: "sightseeing", cost: 1500 },
          ],
          evening: [
            { time: "5:30 PM", title: "Return to Tokyo via Romance Car", description: "Scenic express train with panoramic windows. Relax and watch the countryside turn golden in the evening light.", type: "transport", cost: 2000 },
            { time: "8:00 PM", title: "Dinner at Ippudo Ramen (Roppongi)", description: "Another legendary ramen institution. Their Shiromaru Classic with silky pork broth is unforgettable.", type: "dining", cost: 1400, isVeg: false },
          ],
        },
      },
      {
        title: "Kyoto Day — Ancient Temples & Geisha District",
        activities: {
          morning: [
            { time: "6:30 AM", title: "Shinkansen to Kyoto (2h 15m)", description: "The Nozomi bullet train covers 476 km in just over two hours. Watch Mount Fuji slide past your window.", type: "transport", cost: 13000 },
            { time: "9:00 AM", title: "Fushimi Inari Shrine (10,000 Torii Gates)", description: "Walk through the mesmerizing tunnel of vermillion torii gates winding up Mount Inari. Arrive early to beat crowds.", type: "sightseeing", cost: 0 },
          ],
          afternoon: [
            { time: "12:00 PM", title: "Lunch at Nishiki Market", description: "Kyoto's 400-year-old 'kitchen' — a narrow covered arcade with 100+ stalls selling pickles, mochi, matcha sweets, and street food.", type: "dining", cost: 2200, isVeg: true },
            { time: "2:00 PM", title: "Arashiyama Bamboo Grove", description: "Walk through the towering bamboo forest as sunlight filters through the canopy. Visit the adjacent Tenryu-ji zen garden.", type: "sightseeing", cost: 600 },
            { time: "4:00 PM", title: "Kinkaku-ji (Golden Pavilion)", description: "The gold-leaf-coated Zen temple reflected in its mirror lake is one of Japan's most photographed landmarks.", type: "culture", cost: 400 },
          ],
          evening: [
            { time: "5:30 PM", title: "Geisha District Walking Tour (Gion)", description: "Guided walk through Kyoto's atmospheric Gion district. If lucky, spot a geiko or maiko heading to an evening engagement.", type: "culture", cost: 3000 },
            { time: "7:00 PM", title: "Kaiseki Dinner & Shinkansen Back", description: "A multi-course kaiseki dinner at a traditional Gion restaurant, then bullet train back to Tokyo by 10 PM.", type: "dining", cost: 8000, isVeg: false },
          ],
        },
      },
      {
        title: "Shopping, Onsen & Farewell Tokyo",
        activities: {
          morning: [
            { time: "9:00 AM", title: "Breakfast at Bills (Omotesando)", description: "Australia-born Bills is Tokyo's brunch institution. Their fluffy ricotta pancakes and scrambled eggs are legendary.", type: "dining", cost: 2200, isVeg: true },
            { time: "10:30 AM", title: "Omotesando & Ginza Shopping", description: "Walk Tokyo's Champs-Élysées (Omotesando) past designer flagships, then Ginza for Uniqlo, Itoya stationery, and the Ginza Six mall.", type: "sightseeing", cost: 0 },
          ],
          afternoon: [
            { time: "1:00 PM", title: "Lunch at Tempura Kondo (Ginza)", description: "One of Tokyo's finest tempura restaurants. Watch the chef fry each piece to crispy perfection before your eyes.", type: "dining", cost: 6000, isVeg: false },
            { time: "3:00 PM", title: "Onsen Experience at Thermae-Yu", description: "A luxurious public onsen in central Shinjuku. Natural hot spring water, multiple baths, and a sauna. Pure relaxation.", type: "leisure", cost: 2200 },
          ],
          evening: [
            { time: "6:00 PM", title: "Golden Gai Bar Hopping", description: "Explore Shinjuku's legendary Golden Gai — six narrow alleys of 200+ tiny bars, each seating 6-8 people. A Tokyo rite of passage.", type: "culture", cost: 3000 },
            { time: "8:30 PM", title: "Farewell Dinner at Sushi Saito (3 Michelin Stars)", description: "An intimate 8-seat omakase counter. Chef Takashi Saito serves the purest expression of Edomae sushi in existence.", type: "dining", cost: 25000, isVeg: false },
          ],
        },
      },
      {
        title: "Departure Day",
        activities: {
          morning: [
            { time: "8:00 AM", title: "Breakfast at Hotel & Checkout", description: "Enjoy a final Japanese breakfast set (grilled salmon, miso soup, rice, pickles) at the hotel's Hinokizaka restaurant.", type: "dining", cost: 3500, isVeg: false },
            { time: "10:00 AM", title: "Last-Minute Shopping at Tokyo Station", description: "Tokyo Station's underground has 100+ shops selling bento boxes, Kit-Kats in 20+ flavors, and beautifully packaged omiyage (souvenirs).", type: "sightseeing", cost: 0 },
          ],
          afternoon: [
            { time: "12:00 PM", title: "Narita Express to Airport", description: "1-hour express train to Narita International Airport. Check in and enjoy duty-free shopping.", type: "transport", cost: 3000 },
          ],
          evening: [],
        },
      },
    ],
  },
  tokyo: {
    // Alias to japan
    country: "Japan",
    airlines: ["ANA (All Nippon Airways)", "Japan Airlines"],
    flightDuration: "10h 45m",
    flightPriceRange: [38000, 52000],
    hotel: {
      name: "The Ritz-Carlton, Tokyo",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
      stars: 5,
      rating: 4.9,
      reviews: 3412,
      address: "Tokyo Midtown, 9-7-1 Akasaka, Minato City, Tokyo",
      amenities: ["Free Wi-Fi", "Spa & Wellness", "Rooftop Bar", "Concierge", "Room Service", "Fitness Center", "Restaurant", "Airport Shuttle"],
      pricePerNight: 22000,
    },
    landmarks: ["Tokyo Tower", "Senso-ji Temple", "Meiji Shrine", "Shibuya Crossing"],
    visaType: "Japan Tourist Visa (Single Entry)",
    visaRequired: true,
    visaProcessingTime: "5-7 business days (apply at least 21 days before travel)",
    currency: "JPY",
    itineraryTemplates: [], // Will fall through to japan
  },
  paris: {
    country: "France",
    airlines: ["Air France", "IndiGo (Codeshare)"],
    flightDuration: "11h 55m",
    flightPriceRange: [39000, 48000],
    hotel: {
      name: "Hôtel Plaza Athénée",
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
      stars: 5,
      rating: 4.8,
      reviews: 2847,
      address: "25 Avenue Montaigne, 75008 Paris, France",
      amenities: ["Free Wi-Fi", "Spa & Wellness", "Rooftop Bar", "Concierge", "Room Service", "Fitness Center", "Restaurant", "Airport Shuttle"],
      pricePerNight: 18500,
    },
    landmarks: ["Eiffel Tower", "Louvre", "Notre-Dame", "Arc de Triomphe", "Versailles"],
    visaType: "Schengen Short-Stay Visa (Type C)",
    visaRequired: true,
    visaProcessingTime: "15 calendar days (apply at least 30 days before travel)",
    currency: "EUR",
    itineraryTemplates: [
      {
        title: "Arrival & Settling In",
        activities: {
          morning: [{ time: "10:00 AM", title: "Arrive at CDG Airport", description: "Clear immigration and customs. Your private transfer meets you at Terminal 2E arrivals.", type: "transport", cost: 3500 }],
          afternoon: [
            { time: "1:00 PM", title: "Check-in at Hôtel Plaza Athénée", description: "Early check-in arranged. Freshen up in your Eiffel Tower-view room.", type: "leisure", cost: 0 },
            { time: "2:30 PM", title: "Lunch at Le Relais Plaza", description: "Refined Art Deco brasserie inside the hotel. Try the Salade Niçoise or Truffle Risotto.", type: "dining", cost: 4200, isVeg: false },
          ],
          evening: [
            { time: "6:00 PM", title: "Seine River Golden Hour Walk", description: "Stroll along the left bank as the sun sets over Notre-Dame. Cross Pont Alexandre III.", type: "sightseeing", cost: 0 },
            { time: "8:00 PM", title: "Dinner at Le Comptoir du Panthéon", description: "Classic French onion soup, coq au vin, and a glass of Bordeaux.", type: "dining", cost: 5800, isVeg: false },
          ],
        },
      },
      {
        title: "Iconic Paris — Eiffel Tower & Trocadéro",
        activities: {
          morning: [
            { time: "8:30 AM", title: "Breakfast at Café de Flore", description: "Legendary Left Bank café. Croissants, pain au chocolat, and café crème.", type: "dining", cost: 1800, isVeg: true },
            { time: "10:00 AM", title: "Eiffel Tower Summit (Skip-the-Line)", description: "Pre-booked skip-the-line tickets to the summit. Audio guide included.", type: "sightseeing", cost: 3400 },
          ],
          afternoon: [
            { time: "1:00 PM", title: "Lunch at Café de l'Homme", description: "Panoramic Eiffel Tower views from the Trocadéro terrace.", type: "dining", cost: 4500, isVeg: true },
            { time: "3:00 PM", title: "Trocadéro Gardens & Musée de l'Homme", description: "Explore the museum and relax in the cascading gardens.", type: "culture", cost: 1200 },
          ],
          evening: [
            { time: "7:30 PM", title: "Seine River Dinner Cruise", description: "2-hour candlelit dinner cruise. Three-course French meal with wine pairing.", type: "dining", cost: 8500, isVeg: false },
          ],
        },
      },
      {
        title: "Art & Culture — The Louvre & Marais",
        activities: {
          morning: [{ time: "9:00 AM", title: "The Louvre Museum (Skip-the-Line)", description: "Curated 3-hour route: Mona Lisa → Winged Victory → Venus de Milo → Crown Jewels.", type: "culture", cost: 2200 }],
          afternoon: [
            { time: "12:30 PM", title: "Lunch at L'As du Fallafel", description: "Best falafel in Paris, in the heart of the Marais. Entirely vegetarian-friendly.", type: "dining", cost: 1200, isVeg: true },
            { time: "2:00 PM", title: "Explore Le Marais", description: "Paris's trendiest neighborhood. Boutiques, Place des Vosges, hidden courtyards.", type: "sightseeing", cost: 0 },
          ],
          evening: [
            { time: "5:00 PM", title: "Artisan Macaron Class", description: "Hands-on 2-hour class with a master pâtissier. Take your creations home.", type: "culture", cost: 6800 },
            { time: "8:00 PM", title: "Dinner at Breizh Café", description: "Gourmet buckwheat galettes. The mushroom-comté galette is legendary.", type: "dining", cost: 3200, isVeg: true },
          ],
        },
      },
      {
        title: "Versailles Day Trip",
        activities: {
          morning: [
            { time: "8:00 AM", title: "Train to Versailles (RER C)", description: "Scenic 40-minute train ride from central Paris.", type: "transport", cost: 800 },
            { time: "9:30 AM", title: "Palace of Versailles (Skip-the-Line)", description: "Hall of Mirrors, King's Grand Apartments, and Chapel Royal.", type: "culture", cost: 2100 },
          ],
          afternoon: [
            { time: "12:30 PM", title: "Lunch at Ore — Ducasse au Château", description: "Alain Ducasse's restaurant inside Versailles. Excellent vegetarian menu.", type: "dining", cost: 5500, isVeg: false },
            { time: "2:00 PM", title: "Gardens of Versailles", description: "Explore the 800-hectare gardens, Grand Canal, and Marie Antoinette's estate.", type: "sightseeing", cost: 1500 },
          ],
          evening: [
            { time: "6:30 PM", title: "Return to Paris", description: "Train back to central Paris.", type: "transport", cost: 0 },
            { time: "8:30 PM", title: "Dinner at Le Bouillon Chartier", description: "A Parisian institution since 1896. Belle Époque dining hall.", type: "dining", cost: 2800, isVeg: false },
          ],
        },
      },
      {
        title: "Montmartre, Sacré-Cœur & Bohemian Paris",
        activities: {
          morning: [
            { time: "9:00 AM", title: "Breakfast at Le Consulat", description: "Charming corner café frequented by Picasso and Van Gogh.", type: "dining", cost: 1600, isVeg: true },
            { time: "10:30 AM", title: "Sacré-Cœur Basilica", description: "Climb the dome for 360° panorama. Free entry; modest dome climb fee.", type: "sightseeing", cost: 600 },
          ],
          afternoon: [
            { time: "12:00 PM", title: "Place du Tertre Artists' Square", description: "Watch painters at work. Commission a charcoal sketch as a souvenir.", type: "culture", cost: 2500 },
            { time: "1:30 PM", title: "Lunch at Le Grenier à Pain", description: "Multiple-time winner of Paris's Best Baguette award.", type: "dining", cost: 1400, isVeg: true },
            { time: "3:00 PM", title: "Musée de l'Orangerie", description: "Monet's immersive Water Lilies murals in purpose-built oval galleries.", type: "culture", cost: 1300 },
          ],
          evening: [
            { time: "7:00 PM", title: "Wine Tasting in Saint-Germain-des-Prés", description: "Guided tasting at Ô Chateau — five premium glasses from top regions.", type: "culture", cost: 4500 },
            { time: "9:30 PM", title: "Dinner at Pink Mamma", description: "Five-story Italian-French trattoria. Most Instagrammed restaurant in Paris.", type: "dining", cost: 3800, isVeg: false },
          ],
        },
      },
      {
        title: "Hidden Paris & Local Experiences",
        activities: {
          morning: [{ time: "9:00 AM", title: "Rue Cler Market Street", description: "Sample artisanal cheeses, fresh fruit, and baked goods.", type: "sightseeing", cost: 2000 }],
          afternoon: [
            { time: "12:00 PM", title: "Picnic at Champ de Mars", description: "Spread your market blanket beneath the Eiffel Tower.", type: "leisure", cost: 0 },
            { time: "2:30 PM", title: "Musée d'Orsay", description: "Greatest Impressionist collection: Monet, Renoir, Van Gogh, Degas.", type: "culture", cost: 1600 },
          ],
          evening: [
            { time: "6:00 PM", title: "Shopping on Champs-Élysées", description: "From Louis Vuitton to Ladurée. End at the Arc de Triomphe.", type: "sightseeing", cost: 0 },
            { time: "8:30 PM", title: "Farewell Dinner at Le Jules Verne", description: "Michelin-starred dining on the Eiffel Tower's second floor.", type: "dining", cost: 15000, isVeg: false },
          ],
        },
      },
      {
        title: "Final Morning & Departure",
        activities: {
          morning: [
            { time: "9:00 AM", title: "Breakfast at Angelina", description: "Famous for the richest hot chocolate in Paris. Mont Blanc pastry is iconic.", type: "dining", cost: 2200, isVeg: true },
            { time: "11:00 AM", title: "Galeries Lafayette Haussmann", description: "Shop under the magnificent Art Nouveau glass dome. Tax-free shopping.", type: "sightseeing", cost: 0 },
          ],
          afternoon: [
            { time: "1:00 PM", title: "Last Lunch at Bouillon Pigalle", description: "Unbeatable value classics in a stunning Art Deco space.", type: "dining", cost: 2000, isVeg: true },
            { time: "3:00 PM", title: "Pack & Check Out", description: "Final packing. Concierge arranges luggage and airport transfer.", type: "leisure", cost: 0 },
          ],
          evening: [
            { time: "6:00 PM", title: "Transfer to CDG Airport", description: "Private car to Charles de Gaulle Airport for your evening flight home.", type: "transport", cost: 3500 },
          ],
        },
      },
    ],
  },
  dubai: {
    country: "UAE",
    airlines: ["Emirates", "Etihad Airways"],
    flightDuration: "4h 10m",
    flightPriceRange: [18000, 32000],
    hotel: {
      name: "Atlantis, The Royal",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
      stars: 5,
      rating: 4.7,
      reviews: 4521,
      address: "Crescent Road, Palm Jumeirah, Dubai, UAE",
      amenities: ["Free Wi-Fi", "Infinity Pool", "Private Beach", "Spa", "Concierge", "Water Park", "Restaurant", "Airport Shuttle"],
      pricePerNight: 16000,
    },
    landmarks: ["Burj Khalifa", "Dubai Mall", "Palm Jumeirah", "Dubai Marina", "Desert Safari"],
    visaType: "UAE Tourist Visa (30-day)",
    visaRequired: true,
    visaProcessingTime: "3-5 business days (e-visa available)",
    currency: "AED",
    itineraryTemplates: [
      {
        title: "Arrival & Dubai Marina",
        activities: {
          morning: [{ time: "10:00 AM", title: "Arrive at DXB Airport", description: "Fast-track immigration with pre-approved e-visa. Private transfer to hotel via Sheikh Zayed Road.", type: "transport", cost: 2000 }],
          afternoon: [
            { time: "1:00 PM", title: "Check-in at Atlantis, The Royal", description: "Welcome drink and room orientation. Enjoy the infinity pool with Palm Jumeirah views.", type: "leisure", cost: 0 },
            { time: "3:00 PM", title: "Lunch at Nobu Dubai", description: "Japanese-Peruvian fusion at the iconic Atlantis restaurant. Try the black cod miso.", type: "dining", cost: 5500, isVeg: false },
          ],
          evening: [
            { time: "6:00 PM", title: "Dubai Marina Walk & JBR Beach", description: "Stroll along the marina, watch luxury yachts, and enjoy the sunset at JBR Beach.", type: "sightseeing", cost: 0 },
            { time: "8:30 PM", title: "Dinner at Pierchic", description: "Fine dining on a pier stretching 300m into the Arabian Gulf. Fresh seafood and ocean views.", type: "dining", cost: 7000, isVeg: false },
          ],
        },
      },
      {
        title: "Burj Khalifa & Downtown Dubai",
        activities: {
          morning: [
            { time: "9:00 AM", title: "Breakfast at Arabian Tea House", description: "Traditional Emirati breakfast in the Al Fahidi historic district. Chebab, balaleet, and karak tea.", type: "dining", cost: 1500, isVeg: true },
            { time: "11:00 AM", title: "At the Top — Burj Khalifa (148th Floor)", description: "Skip-the-line to the world's highest observation deck (555m). 360° views of the entire emirate.", type: "sightseeing", cost: 4000 },
          ],
          afternoon: [
            { time: "1:00 PM", title: "Dubai Mall Exploration", description: "The world's largest mall — visit the aquarium, dinosaur skeleton, and VR theme park.", type: "sightseeing", cost: 2000 },
            { time: "3:00 PM", title: "Lunch at Comptoir 102", description: "Healthy organic café with beautiful garden setting. Excellent vegan and vegetarian options.", type: "dining", cost: 2200, isVeg: true },
          ],
          evening: [
            { time: "6:30 PM", title: "Dubai Fountain Show", description: "Watch the world's largest choreographed fountain system from a prime lakeside position.", type: "sightseeing", cost: 0 },
            { time: "8:00 PM", title: "Dinner at Zuma Dubai", description: "Contemporary Japanese izakaya-style dining. The robata-grilled wagyu is perfection.", type: "dining", cost: 8000, isVeg: false },
          ],
        },
      },
      {
        title: "Desert Safari Adventure",
        activities: {
          morning: [
            { time: "9:00 AM", title: "Pool Morning at Atlantis", description: "Enjoy the hotel's aquaventure water park and private beach.", type: "leisure", cost: 0 },
          ],
          afternoon: [
            { time: "12:00 PM", title: "Lunch at The Maine (DoubleTree JBR)", description: "New England-style seafood and lobster rolls by the beach.", type: "dining", cost: 3500, isVeg: false },
            { time: "3:30 PM", title: "Desert Safari (Premium)", description: "Pick-up from hotel. Dune bashing in a Land Cruiser, sandboarding, and camel rides in the Arabian Desert.", type: "sightseeing", cost: 6000 },
          ],
          evening: [
            { time: "7:00 PM", title: "BBQ Dinner Under the Stars", description: "Traditional Bedouin camp with live music, belly dancing, henna art, shisha, and a lavish BBQ spread.", type: "dining", cost: 0 },
          ],
        },
      },
    ],
  },
  bali: {
    country: "Indonesia",
    airlines: ["IndiGo", "Singapore Airlines (via SIN)"],
    flightDuration: "9h 30m",
    flightPriceRange: [22000, 38000],
    hotel: {
      name: "Four Seasons Resort Bali at Sayan",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
      stars: 5,
      rating: 4.9,
      reviews: 1856,
      address: "Sayan, Ubud, Gianyar, Bali 80571, Indonesia",
      amenities: ["Free Wi-Fi", "Infinity Pool", "Spa", "Yoga Classes", "Concierge", "Rice Paddy Views", "Restaurant", "Shuttle"],
      pricePerNight: 12000,
    },
    landmarks: ["Ubud Rice Terraces", "Tanah Lot Temple", "Uluwatu", "Seminyak Beach"],
    visaType: "Indonesia Visa on Arrival (30-day)",
    visaRequired: false,
    visaProcessingTime: "Visa on arrival — processed at immigration (₹3,500 fee)",
    currency: "IDR",
    itineraryTemplates: [
      {
        title: "Arrival & Ubud Vibes",
        activities: {
          morning: [{ time: "10:00 AM", title: "Arrive at Ngurah Rai Airport", description: "Visa on arrival processing, then private transfer to Ubud through scenic rice terraces.", type: "transport", cost: 2500 }],
          afternoon: [
            { time: "1:00 PM", title: "Check-in at Four Seasons Sayan", description: "Cross the dramatic entrance bridge above the Ayung River gorge to reach your valley villa.", type: "leisure", cost: 0 },
            { time: "3:00 PM", title: "Lunch at Locavore (Ubud)", description: "Asia's 50 Best — hyperlocal Indonesian ingredients with modern technique. Tasting menu.", type: "dining", cost: 4000, isVeg: false },
          ],
          evening: [
            { time: "5:30 PM", title: "Campuhan Ridge Walk at Sunset", description: "A magical ridgeline trail between two valleys. The golden hour light is extraordinary.", type: "sightseeing", cost: 0 },
            { time: "7:30 PM", title: "Dinner at Swept Away", description: "Romantic riverside dining at the resort. Balinese and international cuisine under the stars.", type: "dining", cost: 3500, isVeg: false },
          ],
        },
      },
      {
        title: "Tegallalang Rice Terraces & Temples",
        activities: {
          morning: [
            { time: "8:00 AM", title: "Sunrise Yoga at the Resort", description: "Guided yoga session in the open-air pavilion overlooking the Ayung River valley.", type: "leisure", cost: 0 },
            { time: "10:00 AM", title: "Tegallalang Rice Terraces", description: "UNESCO-recognized subak irrigation terraces carved into the hillside over 1,000 years ago.", type: "sightseeing", cost: 500 },
          ],
          afternoon: [
            { time: "12:30 PM", title: "Lunch at Titi Batu Club", description: "Infinity pool restaurant overlooking the rice terraces. Great nasi goreng and fresh juices.", type: "dining", cost: 1800, isVeg: true },
            { time: "2:30 PM", title: "Tirta Empul Water Temple", description: "Participate in a sacred purification ritual at this 1,000-year-old spring water temple.", type: "culture", cost: 300 },
          ],
          evening: [
            { time: "6:00 PM", title: "Balinese Spa Treatment", description: "Traditional 90-minute Balinese massage with frangipani oil and hot stone therapy.", type: "leisure", cost: 3000 },
            { time: "8:00 PM", title: "Dinner at Room4Dessert", description: "The world's only restaurant dedicated to dessert tasting menus. Magical rainforest setting.", type: "dining", cost: 5000, isVeg: true },
          ],
        },
      },
    ],
  },
  singapore: {
    country: "Singapore",
    airlines: ["Singapore Airlines", "IndiGo"],
    flightDuration: "5h 30m",
    flightPriceRange: [16000, 28000],
    hotel: {
      name: "Marina Bay Sands",
      image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
      stars: 5,
      rating: 4.7,
      reviews: 8492,
      address: "10 Bayfront Avenue, Singapore 018956",
      amenities: ["Free Wi-Fi", "Infinity Pool", "Casino", "Spa", "Concierge", "Room Service", "Sky Park", "Shuttle"],
      pricePerNight: 18000,
    },
    landmarks: ["Gardens by the Bay", "Marina Bay Sands", "Sentosa Island", "Orchard Road"],
    visaType: "Singapore Tourist Visa (30-day)",
    visaRequired: true,
    visaProcessingTime: "3-5 business days (e-visa available)",
    currency: "SGD",
    itineraryTemplates: [
      {
        title: "Arrival & Marina Bay",
        activities: {
          morning: [{ time: "10:00 AM", title: "Arrive at Changi Airport", description: "Named world's best airport — explore the Jewel waterfall before heading to the hotel.", type: "transport", cost: 1500 }],
          afternoon: [
            { time: "1:00 PM", title: "Check-in at Marina Bay Sands", description: "Access the world-famous rooftop infinity pool on Floor 57. Views of the entire Singapore skyline.", type: "leisure", cost: 0 },
            { time: "3:00 PM", title: "Lunch at Lau Pa Sat Hawker Centre", description: "Singapore's most iconic Victorian-era hawker centre. Try Hainanese chicken rice and laksa.", type: "dining", cost: 800, isVeg: false },
          ],
          evening: [
            { time: "6:00 PM", title: "Gardens by the Bay & Supertree Grove", description: "Walk the OCBC Skyway between Supertrees. Stay for the 7:45 PM Garden Rhapsody light show.", type: "sightseeing", cost: 1500 },
            { time: "8:30 PM", title: "Dinner at CÉ LA VI", description: "Sky-high dining on the 57th floor of MBS. Pan-Asian cuisine with 360° skyline views.", type: "dining", cost: 6000, isVeg: false },
          ],
        },
      },
    ],
  },
  bangkok: {
    country: "Thailand",
    airlines: ["Thai Airways", "IndiGo"],
    flightDuration: "4h 15m",
    flightPriceRange: [12000, 22000],
    hotel: {
      name: "Mandarin Oriental, Bangkok",
      image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
      stars: 5,
      rating: 4.8,
      reviews: 3201,
      address: "48 Oriental Avenue, Bang Rak, Bangkok 10500, Thailand",
      amenities: ["Free Wi-Fi", "Riverside Pool", "Spa", "Concierge", "Room Service", "Cooking School", "Restaurant", "Shuttle"],
      pricePerNight: 9000,
    },
    landmarks: ["Grand Palace", "Wat Pho", "Chatuchak Market", "Chao Phraya River"],
    visaType: "Thailand Visa Exemption (30-day)",
    visaRequired: false,
    visaProcessingTime: "Visa-free for Indian passport holders (30-day stay)",
    currency: "THB",
    itineraryTemplates: [
      {
        title: "Arrival & Chao Phraya River",
        activities: {
          morning: [{ time: "10:00 AM", title: "Arrive at Suvarnabhumi Airport", description: "Clear immigration and take the Airport Rail Link + taxi to the hotel along the Chao Phraya River.", type: "transport", cost: 1200 }],
          afternoon: [
            { time: "1:00 PM", title: "Check-in at Mandarin Oriental", description: "The legendary hotel where Somerset Maugham and Joseph Conrad stayed. Riverside colonial elegance.", type: "leisure", cost: 0 },
            { time: "2:30 PM", title: "Lunch at Jay Fai (Michelin Street Food)", description: "The world's only Michelin-starred street food stall. Try the legendary crab omelette.", type: "dining", cost: 3000, isVeg: false },
          ],
          evening: [
            { time: "5:30 PM", title: "Chao Phraya Sunset Long-tail Boat", description: "Private long-tail boat ride past Wat Arun, Grand Palace, and riverside temples at golden hour.", type: "sightseeing", cost: 1800 },
            { time: "8:00 PM", title: "Dinner at Gaggan Anand", description: "Asia's #1 restaurant. Indian-origin chef serves progressive Indian cuisine in 25 emoji courses.", type: "dining", cost: 12000, isVeg: false },
          ],
        },
      },
    ],
  },
  rome: {
    country: "Italy",
    airlines: ["ITA Airways", "Air India"],
    flightDuration: "10h 30m",
    flightPriceRange: [36000, 48000],
    hotel: {
      name: "Hotel de Russie",
      image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
      stars: 5,
      rating: 4.8,
      reviews: 2156,
      address: "Via del Babuino, 9, 00187 Roma, Italy",
      amenities: ["Free Wi-Fi", "Secret Garden", "Spa", "Concierge", "Room Service", "Fitness Center", "Restaurant", "Shuttle"],
      pricePerNight: 20000,
    },
    landmarks: ["Colosseum", "Vatican", "Trevi Fountain", "Pantheon", "Spanish Steps"],
    visaType: "Schengen Short-Stay Visa (Type C)",
    visaRequired: true,
    visaProcessingTime: "15 calendar days (apply at least 30 days before travel)",
    currency: "EUR",
    itineraryTemplates: [
      {
        title: "Arrival & Roman Evening",
        activities: {
          morning: [{ time: "10:00 AM", title: "Arrive at Fiumicino Airport", description: "Take the Leonardo Express to Roma Termini, then taxi to the hotel near Piazza del Popolo.", type: "transport", cost: 2800 }],
          afternoon: [
            { time: "1:00 PM", title: "Check-in at Hotel de Russie", description: "Explore the famous Secret Garden, a leafy oasis between Piazza del Popolo and the Spanish Steps.", type: "leisure", cost: 0 },
            { time: "2:30 PM", title: "Lunch at Roscioli", description: "Rome's legendary deli-restaurant. Cacio e pepe, supplì, and a glass of Frascati wine.", type: "dining", cost: 3500, isVeg: false },
          ],
          evening: [
            { time: "5:30 PM", title: "Trevi Fountain & Spanish Steps", description: "Toss a coin in the Trevi Fountain, then climb the Spanish Steps for a sunset panorama.", type: "sightseeing", cost: 0 },
            { time: "8:00 PM", title: "Dinner at Da Enzo al 29 (Trastevere)", description: "Authentic Roman trattoria. The artichoke alla giudia and tonnarelli cacio e pepe are legendary.", type: "dining", cost: 4200, isVeg: false },
          ],
        },
      },
    ],
  },
  maldives: {
    country: "Maldives",
    airlines: ["IndiGo", "SriLankan Airlines"],
    flightDuration: "4h 30m",
    flightPriceRange: [16000, 28000],
    hotel: {
      name: "Soneva Fushi",
      image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
      stars: 5,
      rating: 4.9,
      reviews: 1432,
      address: "Kunfunadhoo Island, Baa Atoll, Maldives",
      amenities: ["Private Beach", "Overwater Villa", "Spa", "Snorkeling", "Diving Center", "Observatory", "Cinema", "Shuttle"],
      pricePerNight: 42000,
    },
    landmarks: ["Baa Atoll", "Coral Reefs", "Sandbanks", "Bioluminescent Beach"],
    visaType: "Maldives Visa on Arrival (30-day)",
    visaRequired: false,
    visaProcessingTime: "Free visa on arrival for all nationalities (30-day stay)",
    currency: "MVR",
    itineraryTemplates: [
      {
        title: "Arrival in Paradise",
        activities: {
          morning: [{ time: "10:00 AM", title: "Arrive at Velana Airport (MLE)", description: "Transfer via scenic 30-minute seaplane to your private island. The aerial views of atolls are breathtaking.", type: "transport", cost: 8000 }],
          afternoon: [
            { time: "1:00 PM", title: "Check-in at Overwater Villa", description: "Your villa has a glass floor, private infinity pool, and direct lagoon access with steps into turquoise water.", type: "leisure", cost: 0 },
            { time: "3:00 PM", title: "Lunch at Out of the Blue", description: "Barefoot beachfront dining. Fresh-caught fish, tropical fruits, and Maldivian curry.", type: "dining", cost: 5000, isVeg: false },
          ],
          evening: [
            { time: "5:30 PM", title: "Sunset Dolphin Cruise", description: "Private dhoni boat cruise to spot spinner dolphins against a flaming Indian Ocean sunset.", type: "sightseeing", cost: 6000 },
            { time: "8:00 PM", title: "Dinner at Fresh in the Garden", description: "Private garden dining under the stars. Organic farm-to-table cuisine from the island's own gardens.", type: "dining", cost: 8000, isVeg: true },
          ],
        },
      },
    ],
  },
  london: {
    country: "United Kingdom",
    airlines: ["British Airways", "Air India"],
    flightDuration: "10h 15m",
    flightPriceRange: [38000, 50000],
    hotel: {
      name: "The Savoy",
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
      stars: 5,
      rating: 4.8,
      reviews: 4123,
      address: "Strand, London WC2R 0EZ, United Kingdom",
      amenities: ["Free Wi-Fi", "River View", "Spa", "Concierge", "Butler Service", "Fitness Center", "Restaurant", "Shuttle"],
      pricePerNight: 24000,
    },
    landmarks: ["Big Ben", "Tower of London", "Buckingham Palace", "British Museum", "London Eye"],
    visaType: "UK Standard Visitor Visa (6-month)",
    visaRequired: true,
    visaProcessingTime: "15-21 business days (apply at least 6 weeks before travel)",
    currency: "GBP",
    itineraryTemplates: [
      {
        title: "Arrival & West End Evening",
        activities: {
          morning: [{ time: "10:00 AM", title: "Arrive at Heathrow Airport", description: "Take the Heathrow Express (15 min) to Paddington, then taxi to The Savoy on the Strand.", type: "transport", cost: 3000 }],
          afternoon: [
            { time: "1:00 PM", title: "Check-in at The Savoy", description: "London's most legendary hotel since 1889. Art Deco elegance on the banks of the Thames.", type: "leisure", cost: 0 },
            { time: "2:30 PM", title: "Traditional Afternoon Tea", description: "The Savoy's Thames Foyer afternoon tea — finger sandwiches, scones with clotted cream, pastries.", type: "dining", cost: 5500, isVeg: true },
          ],
          evening: [
            { time: "5:30 PM", title: "Walk Along South Bank", description: "Cross Waterloo Bridge for views of Parliament, Big Ben, and the London Eye at twilight.", type: "sightseeing", cost: 0 },
            { time: "7:30 PM", title: "West End Show", description: "Pre-booked premium seats for a top London musical — Les Misérables, Hamilton, or The Phantom.", type: "culture", cost: 8000 },
            { time: "10:00 PM", title: "Late Dinner at The Ivy", description: "A legendary West End institution. Shepherd's pie, fish and chips, or the truffle mac & cheese.", type: "dining", cost: 5000, isVeg: false },
          ],
        },
      },
    ],
  },
};

// ─── Helper: date formatting ─────────────────────────────────────────────────
function formatDate(dateStr: string, dayOffset: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + dayOffset);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

// ─── Visa documents (generic — varies per destination) ───────────────────────
function generateVisaDocuments(profile: DestinationProfile): VisaDocument[] {
  const docs: VisaDocument[] = [
    { name: "Valid Passport", status: "required", description: `Must be valid for at least 6 months beyond your departure date, with at least 2 blank pages.` },
    { name: "Visa Application Form", status: "required", description: `Completed and signed application form. Download from the ${profile.country} consulate/embassy website.` },
    { name: "Passport-Sized Photographs (2)", status: "required", description: "Recent photographs (taken within the last 6 months), 35mm x 45mm, white background." },
    { name: "Travel Insurance", status: "required", description: "Minimum coverage of ₹25,00,000 for medical emergencies and repatriation." },
    { name: "Flight Reservation", status: "required", description: "Round-trip flight booking or confirmed itinerary. Do NOT purchase final tickets until visa is approved." },
    { name: "Hotel Booking Confirmation", status: "required", description: "Confirmed reservation for the entire stay with hotel name, address, and dates." },
    { name: "Bank Statements (6 months)", status: "required", description: "Last 6 months of bank statements showing sufficient funds. Minimum recommended: ₹3,00,000." },
    { name: "Cover Letter", status: "required", description: "Formal letter explaining purpose, itinerary, and financial proof. Auto-generated by Voyager AI." },
    { name: "Employment Letter / Business Proof", status: "required", description: "Letter from employer on company letterhead with salary, leave dates, and designation." },
    { name: "Income Tax Returns (3 years)", status: "recommended", description: "Last 3 years of ITRs to demonstrate financial stability and ties to India." },
    { name: "No Objection Certificate (NOC)", status: "optional", description: "NOC from employer confirming approved leave. Optional if employment letter is detailed." },
  ];

  if (!profile.visaRequired) {
    return [
      { name: "Valid Passport", status: "required", description: "Must be valid for at least 6 months beyond your departure date." },
      { name: "Return Flight Ticket", status: "required", description: "Confirmed return ticket or onward travel proof." },
      { name: "Hotel Booking Confirmation", status: "required", description: "Confirmed reservation for your entire stay." },
      { name: "Travel Insurance", status: "recommended", description: "Strongly recommended — minimum ₹25,00,000 medical coverage." },
      { name: "Bank Statements (3 months)", status: "recommended", description: "Proof of sufficient funds for the duration of your stay." },
    ];
  }

  return docs;
}

// ─── Cover letter generator ──────────────────────────────────────────────────
function generateCoverLetter(
  origin: string,
  destination: string,
  profile: DestinationProfile,
  startDate: string,
  duration: number,
  airline: string,
  hotelName: string
): string {
  const endDate = formatDate(startDate, duration);
  const start = formatDate(startDate, 0);

  if (!profile.visaRequired) {
    return `No visa cover letter required for ${profile.country}.

${profile.country} offers visa-free entry / visa on arrival for Indian passport holders.

TRAVEL DETAILS
Destination: ${destination}, ${profile.country}
Travel Dates: ${start} – ${endDate} (${duration} nights)
Accommodation: ${hotelName}
Airline: ${airline}

RECOMMENDED DOCUMENTS TO CARRY
1. Valid passport (6+ months validity)
2. Confirmed return flight tickets
3. Hotel booking confirmation
4. Travel insurance policy
5. Sufficient funds proof (bank statement / credit cards)

These documents may be checked at immigration. Keep printed copies handy.`;
  }

  return `To,
The Visa Officer
Embassy / Consulate General of ${profile.country}

Date: [Application Date]

Subject: Application for ${profile.visaType}

Dear Sir/Madam,

I am writing to respectfully request a ${profile.visaType} to visit ${profile.country} for tourism purposes.

PERSONAL DETAILS
Full Name: [Applicant Full Name]
Passport Number: [Passport Number]
Date of Birth: [Date of Birth]
Nationality: Indian
Occupation: [Occupation / Designation]
Employer: [Employer Name & Address]

TRAVEL DETAILS
Destination: ${destination}, ${profile.country}
Travel Dates: ${start} – ${endDate} (${duration} nights, ${duration + 1} days)
Port of Entry: ${getAirport(destination).code} Airport
Port of Exit: ${getAirport(destination).code} Airport
Mode of Travel: ${airline} (${origin} → ${destination}) and return

ACCOMMODATION
Hotel: ${hotelName}
Address: ${profile.hotel.address}
Duration: ${start} – ${endDate}

FINANCIAL DETAILS
I have enclosed my bank statements for the last six months, demonstrating sufficient funds to cover all expenses during my stay.

PURPOSE OF VISIT
This trip is purely for tourism and leisure. I have no intention of seeking employment or overstaying my visa. I have strong personal, professional, and financial ties to India that ensure my return.

TIES TO HOME COUNTRY
• I am currently employed at [Employer Name] with approved leave for this period.
• I have a confirmed return flight back to ${origin}, India.
• I own [property / have family ties] in India.

I kindly request you to grant me the tourist visa for the above-mentioned travel dates.

Yours faithfully,
[Applicant Full Name]
[Contact Number]
[Email Address]`;
}

// ─── Flight Option Generator ─────────────────────────────────────────────────
// Generates 3 alternative flights per direction with different airlines, prices, layovers
const airlineData: { name: string; hub: string; style: "budget" | "premium" | "luxury" }[] = [
  { name: "Air India", hub: "DEL", style: "premium" },
  { name: "Emirates", hub: "DXB", style: "luxury" },
  { name: "Qatar Airways", hub: "DOH", style: "luxury" },
  { name: "Lufthansa", hub: "FRA", style: "premium" },
  { name: "Singapore Airlines", hub: "SIN", style: "luxury" },
  { name: "Etihad Airways", hub: "AUH", style: "premium" },
  { name: "Turkish Airlines", hub: "IST", style: "premium" },
  { name: "IndiGo (Codeshare)", hub: "DEL", style: "budget" },
  { name: "Vistara", hub: "DEL", style: "premium" },
  { name: "Thai Airways", hub: "BKK", style: "premium" },
  { name: "KLM Royal Dutch", hub: "AMS", style: "premium" },
  { name: "British Airways", hub: "LHR", style: "premium" },
];

function generateFlightOptions(
  sourceAirport: { code: string; city: string },
  destAirport: { code: string; city: string },
  basePrice: number,
  date: string,
  direction: "outbound" | "inbound"
): Flight[] {
  // Pick 3 distinct airlines
  const shuffled = [...airlineData].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  return selected.map((airline, i) => {
    const priceMul = airline.style === "budget" ? 0.75 : airline.style === "luxury" ? 1.25 : 1.0;
    const variance = 0.9 + Math.random() * 0.2;
    const price = Math.round(basePrice * priceMul * variance / 100) * 100;

    const isDirect = i === 0 && airline.style !== "budget";
    const depHour = direction === "outbound" ? (1 + i * 3) : (10 + i * 4);
    const arrHour = depHour + 8 + (isDirect ? 0 : 3) + Math.floor(Math.random() * 3);
    const durationH = arrHour - depHour;
    const durationM = Math.floor(Math.random() * 50) + 10;

    const layover = isDirect ? undefined : {
      city: airline.hub === sourceAirport.code ? "Dubai" : airline.hub === "DXB" ? "Dubai" : airline.hub === "DOH" ? "Doha" : airline.hub === "IST" ? "Istanbul" : airline.hub === "FRA" ? "Frankfurt" : airline.hub === "SIN" ? "Singapore" : airline.hub === "AMS" ? "Amsterdam" : "Delhi",
      duration: `${1 + Math.floor(Math.random() * 3)}h ${Math.floor(Math.random() * 50) + 10}m`,
    };

    return {
      id: `fl-${direction}-${i + 1}`,
      airline: airline.name,
      airlineLogo: "",
      flightNumber: `${airline.name.slice(0, 2).toUpperCase()} ${100 + Math.floor(Math.random() * 900)}`,
      departure: {
        city: direction === "outbound" ? sourceAirport.city : destAirport.city,
        code: direction === "outbound" ? sourceAirport.code : destAirport.code,
        time: formatTime(depHour % 24, Math.floor(Math.random() * 50) + 5),
        date,
      },
      arrival: {
        city: direction === "outbound" ? destAirport.city : sourceAirport.city,
        code: direction === "outbound" ? destAirport.code : sourceAirport.code,
        time: formatTime(arrHour % 24, Math.floor(Math.random() * 50) + 5),
        date,
      },
      duration: `${durationH}h ${durationM}m`,
      layover,
      class: airline.style === "luxury" ? "Business" : airline.style === "budget" ? "Economy" : "Economy Plus",
      price,
    };
  }).sort((a, b) => a.price - b.price); // Cheapest first
}

// ─── Hotel Option Generator ──────────────────────────────────────────────────
// Generates 3 hotel alternatives per city: budget, comfort, luxury

interface HotelTemplate {
  suffix: string;
  tier: "budget" | "comfort" | "luxury";
  stars: number;
  ratingRange: [number, number];
  reviewRange: [number, number];
  priceMul: number;
  amenities: string[];
  image: string;
}

const hotelTiers: HotelTemplate[] = [
  {
    suffix: "Inn & Suites",
    tier: "budget",
    stars: 3,
    ratingRange: [4.0, 4.3],
    reviewRange: [800, 2000],
    priceMul: 0.5,
    amenities: ["Free Wi-Fi", "Restaurant", "Room Service", "Fitness Center"],
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
  },
  {
    suffix: "Hotel & Spa",
    tier: "comfort",
    stars: 4,
    ratingRange: [4.3, 4.6],
    reviewRange: [1500, 4000],
    priceMul: 0.85,
    amenities: ["Free Wi-Fi", "Spa & Wellness", "Concierge", "Room Service", "Fitness Center", "Restaurant"],
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  },
  {
    suffix: "Luxury Collection",
    tier: "luxury",
    stars: 5,
    ratingRange: [4.6, 4.9],
    reviewRange: [2000, 6000],
    priceMul: 1.4,
    amenities: ["Free Wi-Fi", "Spa & Wellness", "Rooftop Bar", "Concierge", "Room Service", "Fitness Center", "Restaurant", "Airport Shuttle"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
  },
];

const cityHotelNames: Record<string, string[]> = {
  paris: ["Hôtel Le Marais", "Maison Albar – Champs-Élysées", "Le Grand Hôtel Paris"],
  amsterdam: ["Hotel V Nesplein", "Pulitzer Amsterdam", "Waldorf Astoria Amsterdam"],
  prague: ["Hotel Černý Slon", "Art Nouveau Palace Hotel", "Four Seasons Prague"],
  rome: ["Hotel Artemide", "Hotel de Russie", "Palazzo Manfredi"],
  barcelona: ["Hotel Jazz", "El Palace Barcelona", "Hotel Arts Barcelona"],
  vienna: ["Hotel Topazz", "Park Hyatt Vienna", "Hotel Sacher Wien"],
  budapest: ["Aria Hotel Budapest", "Kempinski Corvinus", "Matild Palace Budapest"],
  dubai: ["Rove Downtown", "Address Downtown", "Burj Al Arab Jumeirah"],
  singapore: ["Hotel Jen Tanglin", "Fullerton Bay Hotel", "Marina Bay Sands"],
  bangkok: ["Ibis Styles Sukhumvit", "Centara Grand", "Mandarin Oriental Bangkok"],
  tokyo: ["Hotel Gracery Shinjuku", "Park Hotel Tokyo", "The Ritz-Carlton Tokyo"],
  bali: ["Aloft Bali Seminyak", "Padma Resort Ubud", "AYANA Resort Bali"],
  london: ["Hub by Premier Inn", "The Savoy", "The Ritz London"],
};

function generateHotelOptions(
  city: string,
  checkIn: string,
  checkOut: string,
  nights: number,
  basePrice: number,
  cityIdx: number
): Hotel[] {
  const cityKey = city.toLowerCase();
  const names = cityHotelNames[cityKey] || [`${city} Central Inn`, `${city} Grand Hotel`, `${city} Palace`];

  return hotelTiers.map((tier, i) => {
    const ppn = Math.round(basePrice * tier.priceMul / 100) * 100;
    const rating = tier.ratingRange[0] + Math.random() * (tier.ratingRange[1] - tier.ratingRange[0]);
    const reviews = tier.reviewRange[0] + Math.floor(Math.random() * (tier.reviewRange[1] - tier.reviewRange[0]));

    return {
      id: `htl-${cityIdx}-opt-${i + 1}`,
      name: names[i] || `${city} ${tier.suffix}`,
      image: tier.image,
      stars: tier.stars,
      rating: Math.round(rating * 10) / 10,
      reviews,
      address: `Central ${city}`,
      amenities: tier.amenities,
      checkIn,
      checkOut,
      nights,
      pricePerNight: ppn,
      totalPrice: ppn * nights,
    };
  });
}

// ─── Main generator ──────────────────────────────────────────────────────────
export function generateTripData(input: {
  origin: string;
  destination: string;
  startDate: string;
  duration: number;
  adults: number;
  children: number;
  rooms: number;
  budget: number;
}): TripData {
  const travelers = input.adults + input.children;

  // ─── Use the route planner for multi-city/region trips ───
  const route = planRoute({
    origin: input.origin,
    destination: input.destination,
    duration: input.duration,
    budget: input.budget,
    adults: input.adults,
    children: input.children,
  });

  if (route.isMultiCity) {
    return generateMultiCityTrip(input, route, travelers);
  }

  // ─── Single-city trip (original behavior, now with new fields) ───
  return generateSingleCityTrip(input, travelers);
}

// ─── Generate trip from a user-selected route option ─────────────────────────
export function generateTripFromRouteOption(
  input: {
    origin: string;
    destination: string;
    startDate: string;
    duration: number;
    adults: number;
    children: number;
    rooms: number;
    budget: number;
  },
  option: RouteOption
): TripData {
  const travelers = input.adults + input.children;
  const regionKey = getRegionKey(input.destination);
  if (!regionKey) {
    // Fallback — shouldn't happen since route options only exist for regions
    return generateSingleCityTrip(input, travelers);
  }
  const route = planRouteFromOption(option, regionKey);
  return generateMultiCityTrip(input, route, travelers);
}

// ─── Multi-City Trip Generator ───────────────────────────────────────────────
function generateMultiCityTrip(
  input: { origin: string; destination: string; startDate: string; duration: number; adults: number; children: number; rooms: number; budget: number },
  route: ReturnType<typeof planRoute>,
  travelers: number
): TripData {
  const sourceAirport = resolveIndianAirport(input.origin);
  const arrivalAirportCode = route.arrivalAirport;
  const departureAirportCode = route.departureAirport;

  // Look up city names for arrival/departure airports
  const arrivalCity = route.cities[0];
  const departureCity = route.cities[route.cities.length - 1];

  // International flights
  const outboundPrice = getIntlFlightCost(sourceAirport.code, arrivalAirportCode);
  const inboundPrice = getIntlFlightCost(sourceAirport.code, departureAirportCode);

  const outbound: Flight = {
    id: "fl-out-001",
    airline: "Air India",
    airlineLogo: "",
    flightNumber: `AI ${100 + Math.floor(Math.random() * 900)}`,
    departure: {
      city: sourceAirport.city,
      code: sourceAirport.code,
      time: "01:30",
      date: formatDate(input.startDate, 0),
    },
    arrival: {
      city: arrivalCity.city,
      code: arrivalAirportCode,
      time: "08:15",
      date: formatDate(input.startDate, 0),
    },
    duration: "10h 45m",
    class: "Economy Plus",
    price: outboundPrice,
  };

  const inbound: Flight = {
    id: "fl-in-001",
    airline: arrivalAirportCode === departureAirportCode ? "Air India" : "Lufthansa",
    airlineLogo: "",
    flightNumber: arrivalAirportCode === departureAirportCode
      ? `AI ${100 + Math.floor(Math.random() * 900)}`
      : `LH ${100 + Math.floor(Math.random() * 900)}`,
    departure: {
      city: departureCity.city,
      code: departureAirportCode,
      time: "14:20",
      date: formatDate(input.startDate, input.duration),
    },
    arrival: {
      city: sourceAirport.city,
      code: sourceAirport.code,
      time: "03:45",
      date: formatDate(input.startDate, input.duration + 1),
    },
    duration: "11h 25m",
    class: "Economy Plus",
    price: inboundPrice,
  };

  // Internal transport segments
  const internalTransport: TransportSegment[] = route.internalRoutes.map((r, i) => ({
    id: `tr-${i + 1}`,
    mode: r.mode,
    operator: r.operator,
    from: { city: r.from, code: route.cities.find(c => c.city === r.from)?.airportCode || "" },
    to: { city: r.to, code: route.cities.find(c => c.city === r.to)?.airportCode || "" },
    departureTime: "09:00",
    arrivalTime: r.mode === "train" ? "12:30" : "11:00",
    date: formatDate(input.startDate, route.cities.find(c => c.city === r.from)?.departureDay || 0),
    duration: r.duration,
    price: r.pricePerPerson * travelers,
    notes: r.notes,
  }));

  // Hotels — one per city
  const hotels: Hotel[] = route.cities.map((cityStop, i) => {
    const cityKey = cityStop.city.toLowerCase();
    const profile = destinationProfiles[cityKey];
    const hotelData = profile ? profile.hotel : {
      name: `Hotel ${cityStop.city}`,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      stars: 4,
      rating: 4.5,
      reviews: 1200,
      address: `Central ${cityStop.city}`,
      amenities: ["Free Wi-Fi", "Pool", "Spa", "Concierge", "Room Service", "Fitness Center", "Restaurant", "Shuttle"],
      pricePerNight: 10000,
    };
    return {
      id: `htl-${i + 1}`,
      ...hotelData,
      checkIn: formatDate(input.startDate, cityStop.arrivalDay),
      checkOut: formatDate(input.startDate, cityStop.departureDay),
      nights: cityStop.nights,
      totalPrice: hotelData.pricePerNight * cityStop.nights,
    };
  });

  // Itinerary — build per city with city labels, time-aware planning
  const itinerary: DayPlan[] = [];
  let dayNum = 1;
  const totalCities = route.cities.length;

  route.cities.forEach((cityStop, cityIdx) => {
    const cityData = getCityActivities(cityStop.city);
    const isFirstCity = cityIdx === 0;
    const isLastCity = cityIdx === totalCities - 1;

    for (let d = 0; d < cityStop.nights; d++) {
      const isArrivalDay = d === 0 && isFirstCity; // Very first day of the trip
      const isTransitArrivalDay = d === 0 && !isFirstCity; // Arriving from another city
      const isDepartureDay = d === cityStop.nights - 1 && isLastCity && cityStop.nights > 1; // Last day of last city (only if >1 night)
      const isFullDay = !isArrivalDay && !isTransitArrivalDay && !(isDepartureDay && d === cityStop.nights - 1 && isLastCity);

      let activities: { morning: Activity[]; afternoon: Activity[]; evening: Activity[] };
      let title: string;

      if (isArrivalDay) {
        // ─── Day 1: International arrival ───
        // Morning: flight lands, airport transfer, check-in
        const arrivalActivities: Activity[] = [
          {
            time: "8:15 AM",
            title: `✈️ Arrive at ${cityStop.city} Airport`,
            description: `Land at ${route.arrivalAirport}. Clear immigration and customs (allow 45-60 min). ${cityData.airportTransfer.mode} to city centre (${cityData.airportTransfer.duration}).`,
            type: "transport",
            cost: cityData.airportTransfer.cost,
          },
          {
            time: "10:30 AM",
            title: `Check-in at Hotel & Freshen Up`,
            description: `Arrive at your hotel. Early check-in may be available (usually after ${cityData.checkInTime}). Drop luggage, take a shower, and rest after the long flight.`,
            type: "leisure",
            cost: 0,
          },
        ];

        activities = {
          morning: arrivalActivities,
          afternoon: cityData.arrival.afternoon,
          evening: cityData.arrival.evening,
        };
        title = `Arrival in ${cityStop.city} ✈️`;
      } else if (isTransitArrivalDay) {
        // ─── Transit day: arriving from another city ───
        const prevCity = route.cities[cityIdx - 1].city;
        const transport = route.internalRoutes[cityIdx - 1];
        const modeEmoji = transport?.mode === "train" ? "🚄" : transport?.mode === "bus" ? "🚌" : transport?.mode === "ferry" ? "⛴️" : "✈️";

        const transitActivity: Activity = {
          time: "8:30 AM",
          title: `${modeEmoji} ${prevCity} → ${cityStop.city}`,
          description: `Check out of your ${prevCity} hotel. ${transport?.operator || "Transport"} (${transport?.duration || "~2h"}). ${transport?.notes || "Arrive by early afternoon."}`,
          type: "transport",
          cost: 0, // Already counted in transport segments
        };

        activities = {
          morning: [transitActivity],
          afternoon: cityData.transitArrival.afternoon,
          evening: cityData.transitArrival.evening,
        };
        title = `${prevCity} → ${cityStop.city} ${modeEmoji}`;
      } else if (isDepartureDay) {
        // ─── Departure day: last day of last city ───
        activities = {
          morning: cityData.departure.morning,
          afternoon: [
            {
              time: "12:00 PM",
              title: "Transfer to Airport",
              description: `Head to ${route.departureAirport} airport for your international flight home. Arrive 3 hours before departure for check-in and duty-free shopping.`,
              type: "transport",
              cost: cityData.airportTransfer.cost,
            },
          ],
          evening: [],
        };
        title = `Farewell ${cityStop.city} — Departure Day ✈️`;
      } else {
        // ─── Full exploration day ───
        const fullDayIdx = isFirstCity
          ? d - 1 // Skip arrival day
          : d - 1; // Skip transit arrival day
        const template = cityData.fullDays[fullDayIdx % cityData.fullDays.length];
        activities = {
          morning: template.morning,
          afternoon: template.afternoon,
          evening: template.evening,
        };
        title = template.theme;
      }

      itinerary.push({
        day: dayNum,
        date: formatDate(input.startDate, dayNum - 1),
        title,
        city: cityStop.city,
        country: cityStop.country,
        isTransitDay: isTransitArrivalDay,
        activities,
      });
      dayNum++;
    }
  });

  // If the last city only has 1 night (arrival = departure), add departure info to evening
  const lastCity = route.cities[totalCities - 1];
  if (lastCity.nights === 1 && itinerary.length > 0) {
    const lastDay = itinerary[itinerary.length - 1];
    const cityData = getCityActivities(lastCity.city);
    // Replace evening with departure prep
    lastDay.activities.evening = [
      {
        time: "6:00 PM",
        title: "Early Dinner & Pack Up",
        description: `Quick dinner near the hotel. Pack your bags for tomorrow's early departure. Rest well — early airport transfer tomorrow.`,
        type: "dining",
        cost: 1500,
        isVeg: false,
      },
    ];
    // Note: actual departure will be next morning (flight day, counted in flight timing)
  }

  // Calculate totals
  const flightTotal = outbound.price + inbound.price;
  const hotelTotal = hotels.reduce((s, h) => s + h.totalPrice, 0);
  let activitiesTotal = 0;
  itinerary.forEach((day) => {
    [...day.activities.morning, ...day.activities.afternoon, ...day.activities.evening].forEach((a) => {
      activitiesTotal += a.cost;
    });
  });
  const transportTotal = internalTransport.reduce((s, t) => s + t.price, 0);

  // Visa — use first city's profile, or Schengen for Europe
  const firstCityKey = route.cities[0].city.toLowerCase();
  const firstProfile = destinationProfiles[firstCityKey];
  const visaType = firstProfile?.visaType || "Tourist Visa";
  const visaRequired = firstProfile?.visaRequired ?? true;
  const visaProcessingTime = firstProfile?.visaProcessingTime || "15 business days";
  const visaDocs = generateVisaDocuments(firstProfile || {
    country: input.destination, airlines: [], flightDuration: "",
    flightPriceRange: [0, 0], hotel: {} as any, landmarks: [],
    visaType: "Tourist Visa", visaRequired: true, visaProcessingTime: "15 days",
    currency: "USD", itineraryTemplates: [],
  });

  const countriesVisited = [...new Set(route.cities.map(c => c.country))].join(", ");
  const coverLetter = `To,
The Visa Officer
Embassy / Consulate General

Date: [Application Date]

Subject: Application for ${visaType} — Multi-City Trip

Dear Sir/Madam,

I am writing to request a tourist visa for a multi-city trip through ${countriesVisited}.

ITINERARY SUMMARY
${route.cities.map((c, i) => `${i + 1}. ${c.city}, ${c.country} — ${c.nights} nights (${formatDate(input.startDate, c.arrivalDay)} to ${formatDate(input.startDate, c.departureDay)})`).join("\n")}

TRAVEL DETAILS
Origin: ${input.origin}, India
Arrival: ${arrivalCity.city} (${arrivalAirportCode})
Departure: ${departureCity.city} (${departureAirportCode})
Total Duration: ${input.duration} nights

INTERNAL TRANSPORT
${route.internalRoutes.map(r => `• ${r.from} → ${r.to} via ${r.operator} (${r.mode}, ${r.duration})`).join("\n")}

I have enclosed bank statements, flight bookings, hotel reservations, and employer NOC.

Yours faithfully,
[Applicant Full Name]
[Contact Number]
[Email Address]`;

  // Route overview
  const routeOverview: RouteOverview = {
    isMultiCity: true,
    isRegionTrip: route.isRegionTrip ?? true,
    cities: route.cities.map(c => ({
      city: c.city,
      country: c.country,
      days: c.nights,
      arrivalDate: formatDate(input.startDate, c.arrivalDay),
      departureDate: formatDate(input.startDate, c.departureDay),
    })),
    arrivalAirport: { city: arrivalCity.city, code: arrivalAirportCode },
    departureAirport: { city: departureCity.city, code: departureAirportCode },
  };

  return {
    flights: { outbound, inbound },
    flightOptions: {
      outbound: generateFlightOptions(sourceAirport, { code: arrivalAirportCode, city: arrivalCity.city }, outbound.price, outbound.departure.date, "outbound"),
      inbound: generateFlightOptions({ code: departureAirportCode, city: departureCity.city }, sourceAirport, inbound.price, inbound.departure.date, "inbound"),
    },
    hotel: hotels[0], // primary hotel (backward compat)
    hotels,
    hotelOptions: hotels.map((h, i) => generateHotelOptions(
      route.cities[i].city,
      h.checkIn,
      h.checkOut,
      h.nights,
      h.pricePerNight,
      i
    )),
    internalTransport,
    route: routeOverview,
    itinerary,
    visa: {
      required: visaRequired,
      type: visaType,
      processingTime: visaProcessingTime,
      documents: visaDocs,
      coverLetter,
    },
    summary: {
      flightTotal,
      hotelTotal,
      activitiesTotal,
      transportTotal,
      grandTotal: flightTotal + hotelTotal + activitiesTotal + transportTotal,
    },
  };
}

// ─── Single-City Trip Generator (original behavior) ──────────────────────────
function generateSingleCityTrip(
  input: { origin: string; destination: string; startDate: string; duration: number; adults: number; children: number; rooms: number; budget: number },
  travelers: number
): TripData {
  const destKey = input.destination.toLowerCase().trim().replace(/\s+/g, "_");

  // Resolve profile — try exact match, then partial match, then fallback
  let profile = destinationProfiles[destKey];
  if (!profile) {
    const partialMatch = Object.entries(destinationProfiles).find(
      ([k]) => destKey.includes(k) || k.includes(destKey)
    );
    profile = partialMatch ? partialMatch[1] : undefined as unknown as DestinationProfile;
  }

  // If the matched profile has no itinerary templates (e.g. "tokyo"), 
  // check if a parent (e.g. "japan") has them
  if (profile && profile.itineraryTemplates.length === 0) {
    const parent = Object.values(destinationProfiles).find(
      (p) => p.country === profile.country && p.itineraryTemplates.length > 0
    );
    if (parent) profile = parent;
  }

  // Generic fallback for unknown destinations
  if (!profile) {
    profile = {
      country: input.destination,
      airlines: ["Air India", "IndiGo"],
      flightDuration: "8h 00m",
      flightPriceRange: [30000, 45000],
      hotel: {
        name: `Grand Hotel ${input.destination}`,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
        stars: 4,
        rating: 4.5,
        reviews: 1200,
        address: `Central ${input.destination}`,
        amenities: ["Free Wi-Fi", "Pool", "Spa", "Concierge", "Room Service", "Fitness Center", "Restaurant", "Shuttle"],
        pricePerNight: 14000,
      },
      landmarks: [],
      visaType: "Tourist Visa",
      visaRequired: true,
      visaProcessingTime: "10-15 business days",
      currency: "USD",
      itineraryTemplates: [
        {
          title: `Arrival in ${input.destination}`,
          activities: {
            morning: [{ time: "10:00 AM", title: "Arrive at Airport", description: `Clear immigration and transfer to your hotel in ${input.destination}.`, type: "transport", cost: 2500 }],
            afternoon: [
              { time: "1:00 PM", title: "Hotel Check-in & Explore", description: "Settle in and explore the neighborhood around your hotel.", type: "leisure", cost: 0 },
              { time: "3:00 PM", title: "Local Lunch", description: `Sample authentic local cuisine at a top-rated restaurant in ${input.destination}.`, type: "dining", cost: 3000, isVeg: false },
            ],
            evening: [
              { time: "6:00 PM", title: "City Walk & Sunset", description: `Explore the main attractions and enjoy the sunset over ${input.destination}.`, type: "sightseeing", cost: 0 },
              { time: "8:00 PM", title: "Welcome Dinner", description: "Fine dining at one of the city's best restaurants.", type: "dining", cost: 5000, isVeg: false },
            ],
          },
        },
        {
          title: "Cultural Exploration",
          activities: {
            morning: [
              { time: "8:30 AM", title: "Local Breakfast", description: "Start the day at a popular local café.", type: "dining", cost: 1500, isVeg: true },
              { time: "10:00 AM", title: "Visit Top Attraction", description: `Explore the most famous landmark in ${input.destination} with skip-the-line access.`, type: "sightseeing", cost: 2500 },
            ],
            afternoon: [
              { time: "12:30 PM", title: "Authentic Lunch", description: "A local favorite restaurant recommended by our AI agents.", type: "dining", cost: 2500, isVeg: false },
              { time: "2:30 PM", title: "Museum & Culture Walk", description: "Visit the premier museum and explore the cultural district.", type: "culture", cost: 1800 },
            ],
            evening: [
              { time: "7:00 PM", title: "Evening Experience", description: "A unique local experience — cooking class, show, or night tour.", type: "culture", cost: 4000 },
              { time: "9:00 PM", title: "Dinner", description: "Dinner at a highly-rated restaurant.", type: "dining", cost: 4500, isVeg: false },
            ],
          },
        },
        {
          title: "Adventure & Discovery",
          activities: {
            morning: [
              { time: "9:00 AM", title: "Day Trip or Excursion", description: `Full-day excursion to a must-see destination near ${input.destination}.`, type: "sightseeing", cost: 5000 },
            ],
            afternoon: [
              { time: "12:30 PM", title: "Lunch En Route", description: "Discover local eateries off the beaten path.", type: "dining", cost: 2000, isVeg: true },
              { time: "2:00 PM", title: "Afternoon Activity", description: "Continue exploration — markets, nature walks, or historical sites.", type: "sightseeing", cost: 1500 },
            ],
            evening: [
              { time: "7:30 PM", title: "Special Dinner", description: "A memorable dining experience at one of the destination's finest.", type: "dining", cost: 6000, isVeg: false },
            ],
          },
        },
      ],
    };
  }

  const originAirport = getAirport(input.origin);
  const destAirport = getAirport(input.destination);

  const outboundPrice = Math.round(
    profile.flightPriceRange[0] + Math.random() * (profile.flightPriceRange[1] - profile.flightPriceRange[0])
  );
  const inboundPrice = Math.round(outboundPrice * (0.88 + Math.random() * 0.18));

  // Flights
  const outbound: Flight = {
    id: "fl-out-001",
    airline: profile.airlines[0],
    airlineLogo: "",
    flightNumber: `${profile.airlines[0].slice(0, 2).toUpperCase()} ${100 + Math.floor(Math.random() * 900)}`,
    departure: {
      city: originAirport.city,
      code: originAirport.code,
      time: "02:15",
      date: formatDate(input.startDate, 0),
    },
    arrival: {
      city: destAirport.city,
      code: destAirport.code,
      time: "09:40",
      date: formatDate(input.startDate, 0),
    },
    duration: profile.flightDuration,
    class: "Economy Plus",
    price: outboundPrice,
  };

  const inbound: Flight = {
    id: "fl-in-001",
    airline: profile.airlines[0],
    airlineLogo: "",
    flightNumber: `${profile.airlines[0].slice(0, 2).toUpperCase()} ${100 + Math.floor(Math.random() * 900)}`,
    departure: {
      city: destAirport.city,
      code: destAirport.code,
      time: "13:50",
      date: formatDate(input.startDate, input.duration),
    },
    arrival: {
      city: originAirport.city,
      code: originAirport.code,
      time: "02:30",
      date: formatDate(input.startDate, input.duration + 1),
    },
    duration: profile.flightDuration,
    class: "Economy Plus",
    price: inboundPrice,
  };

  // Hotel
  const hotel: Hotel = {
    id: "htl-001",
    ...profile.hotel,
    checkIn: formatDate(input.startDate, 0),
    checkOut: formatDate(input.startDate, input.duration),
    nights: input.duration,
    totalPrice: profile.hotel.pricePerNight * input.duration,
  };

  // Itinerary — cycle through templates for the number of days
  const templates = profile.itineraryTemplates;
  const itinerary: DayPlan[] = [];
  for (let i = 0; i < input.duration; i++) {
    const template = templates[i % templates.length];
    itinerary.push({
      day: i + 1,
      date: formatDate(input.startDate, i),
      title: i < templates.length ? template.title : `Day ${i + 1} — Exploring ${input.destination}`,
      activities: template.activities,
    });
  }

  // Calculate activity totals
  let activitiesTotal = 0;
  itinerary.forEach((day) => {
    [...day.activities.morning, ...day.activities.afternoon, ...day.activities.evening].forEach((a) => {
      activitiesTotal += a.cost;
    });
  });

  const flightTotal = outbound.price + inbound.price;
  const hotelTotal = hotel.totalPrice;

  // Visa
  const visaDocs = generateVisaDocuments(profile);
  const coverLetter = generateCoverLetter(
    input.origin,
    input.destination,
    profile,
    input.startDate,
    input.duration,
    profile.airlines[0],
    hotel.name
  );

  return {
    flights: { outbound, inbound },
    flightOptions: {
      outbound: generateFlightOptions(originAirport, destAirport, outbound.price, outbound.departure.date, "outbound"),
      inbound: generateFlightOptions(destAirport, originAirport, inbound.price, inbound.departure.date, "inbound"),
    },
    hotel,
    hotels: [hotel],
    hotelOptions: [generateHotelOptions(
      input.destination,
      hotel.checkIn,
      hotel.checkOut,
      hotel.nights,
      hotel.pricePerNight,
      0
    )],
    internalTransport: [],
    route: {
      isMultiCity: false,
      isRegionTrip: false,
      cities: [{
        city: input.destination,
        country: profile.country,
        days: input.duration,
        arrivalDate: formatDate(input.startDate, 0),
        departureDate: formatDate(input.startDate, input.duration),
      }],
      arrivalAirport: { city: destAirport.city, code: destAirport.code },
      departureAirport: { city: destAirport.city, code: destAirport.code },
    },
    itinerary,
    visa: {
      required: profile.visaRequired,
      type: profile.visaType,
      processingTime: profile.visaProcessingTime,
      documents: visaDocs,
      coverLetter,
    },
    summary: {
      flightTotal,
      hotelTotal,
      activitiesTotal,
      transportTotal: 0,
      grandTotal: flightTotal + hotelTotal + activitiesTotal,
    },
  };
}

// ─── Restaurant-Enhanced Itinerary ──────────────────────────────────────────
// Enhances existing itinerary with curated restaurant recommendations for veg travelers
export function enhanceItineraryWithRestaurants(
  tripData: TripData,
  foodPreference: "any" | "veg" | "nonveg"
): TripData {
  if (foodPreference !== "veg") return tripData;

  const enhanced = { ...tripData, itinerary: [...tripData.itinerary] };

  // Group days by city
  const cityDays: Record<string, number[]> = {};
  enhanced.itinerary.forEach((day, idx) => {
    const city = day.city || tripData.route.cities[0]?.city || "Paris";
    if (!cityDays[city]) cityDays[city] = [];
    cityDays[city].push(idx);
  });

  // Generate meal plans per city and inject into itinerary
  Object.entries(cityDays).forEach(([city, dayIdxs]) => {
    const mealPlans = generateMultiDayMealPlans(city, dayIdxs.length, true);

    dayIdxs.forEach((dayIdx, planIdx) => {
      const plan = mealPlans[planIdx];
      if (!plan) return;

      const day = { ...enhanced.itinerary[dayIdx] };
      day.activities = { ...day.activities };

      // Add breakfast restaurant as first morning activity
      const breakfastActivity: Activity = {
        time: "8:00 AM",
        title: `🥣 Breakfast — ${plan.breakfast.name}`,
        description: `${plan.breakfast.cuisine} · ${plan.breakfast.distanceFromHotel} from hotel · ${plan.breakfast.priceRange} · "${plan.breakfast.specialty}"`,
        type: "dining",
        cost: parsePriceRange(plan.breakfast.priceRange),
        isVeg: true,
      };

      // Add lunch restaurant as first afternoon activity
      const lunchActivity: Activity = {
        time: "12:30 PM",
        title: `🍽️ Lunch — ${plan.lunch.name}`,
        description: `${plan.lunch.cuisine} · ${plan.lunch.distanceFromHotel} from hotel · ${plan.lunch.priceRange} · "${plan.lunch.specialty}"`,
        type: "dining",
        cost: parsePriceRange(plan.lunch.priceRange),
        isVeg: true,
      };

      // Add dinner restaurant as first evening activity
      const dinnerActivity: Activity = {
        time: "7:30 PM",
        title: `🍛 Dinner — ${plan.dinner.name}`,
        description: `${plan.dinner.cuisine} · ${plan.dinner.distanceFromHotel} from hotel · ${plan.dinner.priceRange} · "${plan.dinner.specialty}"`,
        type: "dining",
        cost: parsePriceRange(plan.dinner.priceRange),
        isVeg: true,
      };

      // Inject meals into their respective time blocks
      day.activities.morning = [breakfastActivity, ...day.activities.morning.filter(a => a.type !== "dining")];
      day.activities.afternoon = [lunchActivity, ...day.activities.afternoon.filter(a => a.type !== "dining")];
      day.activities.evening = [dinnerActivity, ...day.activities.evening.filter(a => a.type !== "dining")];

      enhanced.itinerary[dayIdx] = day;
    });
  });

  return enhanced;
}

// Helper: Parse price range string to approximate INR cost
function parsePriceRange(priceStr: string): number {
  const match = priceStr.match(/[\d,]+/g);
  if (!match) return 1000;
  const nums = match.map(n => parseInt(n.replace(/,/g, "")));
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  // If price is in EUR (€), GBP (£), or other foreign currency, convert to INR approx
  if (priceStr.includes("€")) return Math.round(avg * 92);
  if (priceStr.includes("£")) return Math.round(avg * 107);
  if (priceStr.includes("$")) return Math.round(avg * 84);
  if (priceStr.includes("CZK")) return Math.round(avg * 3.7);
  if (priceStr.includes("฿") || priceStr.includes("THB")) return Math.round(avg * 2.4);
  if (priceStr.includes("¥") || priceStr.includes("JPY")) return Math.round(avg * 0.57);
  if (priceStr.includes("AED")) return Math.round(avg * 23);
  if (priceStr.includes("S$") || priceStr.includes("SGD")) return Math.round(avg * 63);
  if (priceStr.includes("₹")) return avg;
  return Math.round(avg * 92); // Default: assume EUR
}
