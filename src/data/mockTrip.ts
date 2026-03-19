export interface Flight {
  id: string;
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  departure: { city: string; code: string; time: string; date: string };
  arrival: { city: string; code: string; time: string; date: string };
  duration: string;
  layover?: { city: string; duration: string };
  class: string;
  price: number;
  priceVerified?: boolean;
  priceCurrency?: string;
  priceLabel?: string;
  priceBundleId?: string;
  priceIsTripTotal?: boolean;
  bookingUrl?: string;
}

export interface HotelAggregatorPrice {
  aggregator: string;
  pricePerNight: number;
  totalPrice: number;
  url: string;
  logo: string; // emoji
}

export interface Hotel {
  id: string;
  name: string;
  image: string;
  stars: number;
  rating: number;
  reviews: number;
  address: string;
  amenities: string[];
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  aggregatorPrices?: HotelAggregatorPrice[];
  priceVerified?: boolean;
  priceLabel?: string;
  bookingUrl?: string;
  placeId?: string;
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  type: "sightseeing" | "dining" | "transport" | "leisure" | "culture";
  cost: number;
  isVeg?: boolean;
}

export interface TransportSegment {
  id: string;
  mode: "flight" | "train" | "bus" | "ferry" | "car";
  operator: string;
  from: { city: string; code: string; station?: string };
  to: { city: string; code: string; station?: string };
  departureTime: string;
  arrivalTime: string;
  date: string;
  duration: string;
  price: number;
  notes?: string;
}

export interface CityStay {
  city: string;
  country: string;
  days: number;
  arrivalDate: string;
  departureDate: string;
}

export interface RouteOverview {
  isMultiCity: boolean;
  isRegionTrip: boolean;
  cities: CityStay[];
  arrivalAirport: { city: string; code: string };
  departureAirport: { city: string; code: string };
}

export interface DayPlan {
  day: number;
  date: string;
  title: string;
  city?: string;
  country?: string;
  isTransitDay?: boolean;
  activities: {
    morning: Activity[];
    afternoon: Activity[];
    evening: Activity[];
  };
}

export interface VisaDocument {
  name: string;
  status: "required" | "recommended" | "optional";
  description: string;
}

export interface TripData {
  flights: { outbound: Flight; inbound: Flight };
  flightOptions?: { outbound: Flight[]; inbound: Flight[] };
  hotel: Hotel;
  hotels: Hotel[];
  hotelOptions?: Hotel[][];  // per city, array of alternatives
  internalTransport: TransportSegment[];
  route: RouteOverview;
  itinerary: DayPlan[];
  visa: {
    required: boolean;
    type: string;
    processingTime: string;
    documents: VisaDocument[];
    coverLetter: string;
  };
  summary: {
    flightTotal: number;
    hotelTotal: number;
    activitiesTotal: number;
    transportTotal: number;
    grandTotal: number;
  };
}

export const mockTripData: TripData = {
  flights: {
    outbound: {
      id: "fl-out-001",
      airline: "Air France",
      airlineLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Air_France_Logo.svg/200px-Air_France_Logo.svg.png",
      flightNumber: "AF 218",
      departure: {
        city: "Mumbai",
        code: "BOM",
        time: "02:15",
        date: "March 15, 2026",
      },
      arrival: {
        city: "Paris",
        code: "CDG",
        time: "09:40",
        date: "March 15, 2026",
      },
      duration: "11h 55m",
      layover: undefined,
      class: "Economy Plus",
      price: 42500,
    },
    inbound: {
      id: "fl-in-001",
      airline: "Air France",
      airlineLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Air_France_Logo.svg/200px-Air_France_Logo.svg.png",
      flightNumber: "AF 217",
      departure: {
        city: "Paris",
        code: "CDG",
        time: "13:50",
        date: "March 22, 2026",
      },
      arrival: {
        city: "Mumbai",
        code: "BOM",
        time: "02:30",
        date: "March 23, 2026",
      },
      duration: "9h 10m",
      class: "Economy Plus",
      price: 39800,
    },
  },
  hotel: {
    id: "htl-001",
    name: "Hôtel Plaza Athénée",
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    stars: 5,
    rating: 4.8,
    reviews: 2847,
    address: "25 Avenue Montaigne, 75008 Paris, France",
    amenities: [
      "Free Wi-Fi",
      "Spa & Wellness",
      "Rooftop Bar",
      "Concierge",
      "Room Service",
      "Fitness Center",
      "Restaurant",
      "Airport Shuttle",
    ],
    checkIn: "March 15, 2026",
    checkOut: "March 22, 2026",
    nights: 7,
    pricePerNight: 18500,
    totalPrice: 129500,
  },
  hotels: [{
    id: "htl-001",
    name: "Hôtel Plaza Athénée",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    stars: 5,
    rating: 4.8,
    reviews: 2847,
    address: "25 Avenue Montaigne, 75008 Paris, France",
    amenities: ["Free Wi-Fi", "Spa & Wellness", "Rooftop Bar", "Concierge", "Room Service", "Fitness Center", "Restaurant", "Airport Shuttle"],
    checkIn: "March 15, 2026",
    checkOut: "March 22, 2026",
    nights: 7,
    pricePerNight: 18500,
    totalPrice: 129500,
  }],
  internalTransport: [],
  route: {
    isMultiCity: false,
    isRegionTrip: false,
    cities: [{ city: "Paris", country: "France", days: 7, arrivalDate: "March 15, 2026", departureDate: "March 22, 2026" }],
    arrivalAirport: { city: "Paris", code: "CDG" },
    departureAirport: { city: "Paris", code: "CDG" },
  },
  itinerary: [
    {
      day: 1,
      date: "March 15, 2026",
      title: "Arrival & Settling In",
      activities: {
        morning: [
          {
            time: "10:00 AM",
            title: "Arrive at CDG Airport",
            description:
              "Clear immigration and customs. Your private transfer will meet you at Terminal 2E arrivals with a welcome sign.",
            type: "transport",
            cost: 3500,
          },
        ],
        afternoon: [
          {
            time: "1:00 PM",
            title: "Check-in at Hôtel Plaza Athénée",
            description:
              "Early check-in arranged. Freshen up in your Eiffel Tower-view room and enjoy the welcome basket with French macarons.",
            type: "leisure",
            cost: 0,
          },
          {
            time: "2:30 PM",
            title: "Lunch at Le Relais Plaza",
            description:
              "A refined Art Deco brasserie inside the hotel. Try the Salade Niçoise or the exquisite Truffle Risotto (vegetarian-friendly options available).",
            type: "dining",
            cost: 4200,
            isVeg: false,
          },
        ],
        evening: [
          {
            time: "6:00 PM",
            title: "Seine River Golden Hour Walk",
            description:
              "Stroll along the left bank of the Seine as the sun sets over Notre-Dame. Cross Pont Alexandre III — the most ornate bridge in Paris.",
            type: "sightseeing",
            cost: 0,
          },
          {
            time: "8:00 PM",
            title: "Dinner at Le Comptoir du Panthéon",
            description:
              "A quintessential Parisian bistro. Enjoy classic French onion soup, coq au vin, and a glass of Bordeaux.",
            type: "dining",
            cost: 5800,
            isVeg: false,
          },
        ],
      },
    },
    {
      day: 2,
      date: "March 16, 2026",
      title: "Iconic Paris — The Eiffel Tower & Trocadéro",
      activities: {
        morning: [
          {
            time: "8:30 AM",
            title: "Breakfast at Café de Flore",
            description:
              "Start the day at this legendary Left Bank café. Croissants, pain au chocolat, and a café crème — the Parisian breakfast trifecta.",
            type: "dining",
            cost: 1800,
            isVeg: true,
          },
          {
            time: "10:00 AM",
            title: "Eiffel Tower Summit (Skip-the-Line)",
            description:
              "Pre-booked skip-the-line tickets to the summit. On a clear March morning, visibility reaches 70 km. Audio guide included.",
            type: "sightseeing",
            cost: 3400,
          },
        ],
        afternoon: [
          {
            time: "1:00 PM",
            title: "Lunch at Café de l'Homme",
            description:
              "Panoramic Eiffel Tower views from the Trocadéro terrace. The vegetarian tasting plate is spectacular.",
            type: "dining",
            cost: 4500,
            isVeg: true,
          },
          {
            time: "3:00 PM",
            title: "Musée de l'Homme & Trocadéro Gardens",
            description:
              "Explore the Museum of Mankind's anthropology exhibits, then relax in the cascading gardens of Trocadéro.",
            type: "culture",
            cost: 1200,
          },
        ],
        evening: [
          {
            time: "7:30 PM",
            title: "Seine River Dinner Cruise",
            description:
              "A 2-hour candlelit dinner cruise passing illuminated Notre-Dame, the Louvre, and Musée d'Orsay. Three-course French meal with wine pairing.",
            type: "dining",
            cost: 8500,
            isVeg: false,
          },
        ],
      },
    },
    {
      day: 3,
      date: "March 17, 2026",
      title: "Art & Culture — The Louvre & Marais",
      activities: {
        morning: [
          {
            time: "9:00 AM",
            title: "The Louvre Museum (Skip-the-Line)",
            description:
              "Pre-booked morning entry. Follow our curated 3-hour route: Mona Lisa → Winged Victory → Venus de Milo → Napoleon's Apartments → French Crown Jewels.",
            type: "culture",
            cost: 2200,
          },
        ],
        afternoon: [
          {
            time: "12:30 PM",
            title: "Lunch at L'As du Fallafel",
            description:
              "The best falafel in Paris, in the heart of the Marais district. Anthony Bourdain's all-time favorite. Entirely vegetarian-friendly.",
            type: "dining",
            cost: 1200,
            isVeg: true,
          },
          {
            time: "2:00 PM",
            title: "Explore Le Marais",
            description:
              "Wander through Paris's trendiest neighborhood. Browse independent boutiques on Rue des Francs-Bourgeois, visit Place des Vosges, and discover hidden courtyards.",
            type: "sightseeing",
            cost: 0,
          },
        ],
        evening: [
          {
            time: "5:00 PM",
            title: "Artisan Macaron Class at La Cuisine Paris",
            description:
              "A hands-on 2-hour class with a master pâtissier. Learn to make perfect Parisian macarons — and take your creations home.",
            type: "culture",
            cost: 6800,
          },
          {
            time: "8:00 PM",
            title: "Dinner at Breizh Café",
            description:
              "Gourmet buckwheat galettes (naturally gluten-free and vegetarian options). The mushroom-comté galette is legendary.",
            type: "dining",
            cost: 3200,
            isVeg: true,
          },
        ],
      },
    },
    {
      day: 4,
      date: "March 18, 2026",
      title: "Versailles Day Trip",
      activities: {
        morning: [
          {
            time: "8:00 AM",
            title: "Express Train to Versailles (RER C)",
            description:
              "A scenic 40-minute train ride from central Paris. Your Navigo pass covers the fare.",
            type: "transport",
            cost: 800,
          },
          {
            time: "9:30 AM",
            title: "Palace of Versailles (Skip-the-Line)",
            description:
              "Walk through the Hall of Mirrors, the King's Grand Apartments, and the Chapel Royal. Audio guide narrates 300 years of French royal history.",
            type: "culture",
            cost: 2100,
          },
        ],
        afternoon: [
          {
            time: "12:30 PM",
            title: "Lunch at Ore — Ducasse au Château",
            description:
              "Alain Ducasse's restaurant inside Versailles. Seasonal French cuisine with views of the Parterre d'Eau. Excellent vegetarian menu available.",
            type: "dining",
            cost: 5500,
            isVeg: false,
          },
          {
            time: "2:00 PM",
            title: "Gardens of Versailles & Grand Trianon",
            description:
              "Explore the 800-hectare gardens, the Grand Canal, Marie Antoinette's private estate, and the Petit Trianon. Rent a golf cart or bicycles.",
            type: "sightseeing",
            cost: 1500,
          },
        ],
        evening: [
          {
            time: "6:30 PM",
            title: "Return to Paris",
            description:
              "Train back to central Paris. Rest at hotel before dinner.",
            type: "transport",
            cost: 0,
          },
          {
            time: "8:30 PM",
            title: "Dinner at Le Bouillon Chartier",
            description:
              "A Parisian institution since 1896. Classic French comfort food at incredibly fair prices — in a stunning Belle Époque dining hall.",
            type: "dining",
            cost: 2800,
            isVeg: false,
          },
        ],
      },
    },
    {
      day: 5,
      date: "March 19, 2026",
      title: "Montmartre, Sacré-Cœur & Bohemian Paris",
      activities: {
        morning: [
          {
            time: "9:00 AM",
            title: "Breakfast at Le Consulat",
            description:
              "A charming corner café on Montmartre's cobblestoned streets, frequented by Picasso and Van Gogh in the early 1900s.",
            type: "dining",
            cost: 1600,
            isVeg: true,
          },
          {
            time: "10:30 AM",
            title: "Sacré-Cœur Basilica",
            description:
              "Climb the dome for a 360° panorama of Paris, then descend into the crypt. Free entry; dome climb is a modest fee.",
            type: "sightseeing",
            cost: 600,
          },
        ],
        afternoon: [
          {
            time: "12:00 PM",
            title: "Place du Tertre Artists' Square",
            description:
              "Watch painters and portraitists at work. Commission a charcoal sketch as a unique souvenir.",
            type: "culture",
            cost: 2500,
          },
          {
            time: "1:30 PM",
            title: "Lunch at Le Grenier à Pain",
            description:
              "Winner of Paris's Best Baguette award multiple times. Order a jambon-beurre sandwich or the vegetable quiche Lorraine.",
            type: "dining",
            cost: 1400,
            isVeg: true,
          },
          {
            time: "3:00 PM",
            title: "Musée de l'Orangerie",
            description:
              "Monet's immersive Water Lilies murals in purpose-built oval galleries. One of the most serene art experiences in the world.",
            type: "culture",
            cost: 1300,
          },
        ],
        evening: [
          {
            time: "7:00 PM",
            title: "Wine Tasting in Saint-Germain-des-Prés",
            description:
              "A guided tasting at Ô Chateau, France's most acclaimed wine school. Five premium glasses from Burgundy, Bordeaux, and Champagne.",
            type: "culture",
            cost: 4500,
          },
          {
            time: "9:30 PM",
            title: "Dinner at Pink Mamma",
            description:
              "A five-story Italian-French trattoria that is the most Instagrammed restaurant in Paris. Book the rooftop terrace. Excellent truffle pasta (veg).",
            type: "dining",
            cost: 3800,
            isVeg: false,
          },
        ],
      },
    },
    {
      day: 6,
      date: "March 20, 2026",
      title: "Hidden Paris & Local Experiences",
      activities: {
        morning: [
          {
            time: "9:00 AM",
            title: "Rue Cler Market Street",
            description:
              "A local-favorite pedestrian market street. Sample artisanal cheeses, fresh fruit, baked goods, and gather supplies for a Seine-side picnic.",
            type: "sightseeing",
            cost: 2000,
          },
        ],
        afternoon: [
          {
            time: "12:00 PM",
            title: "Picnic at Champ de Mars",
            description:
              "Spread your market blanket beneath the Eiffel Tower. This is the most Parisian experience possible.",
            type: "leisure",
            cost: 0,
          },
          {
            time: "2:30 PM",
            title: "Musée d'Orsay",
            description:
              "Housed in a grand 1900 railway station. Home to the world's greatest Impressionist and Post-Impressionist collection: Monet, Renoir, Van Gogh, Degas.",
            type: "culture",
            cost: 1600,
          },
        ],
        evening: [
          {
            time: "6:00 PM",
            title: "Shopping on Champs-Élysées",
            description:
              "From Louis Vuitton's flagship to Ladurée macarons. End at the Arc de Triomphe for sunset views.",
            type: "sightseeing",
            cost: 0,
          },
          {
            time: "8:30 PM",
            title: "Farewell Dinner at Le Jules Verne",
            description:
              "Michelin-starred dining on the Eiffel Tower's second floor. The 7-course tasting menu is transcendent. Vegetarian tasting menu available.",
            type: "dining",
            cost: 15000,
            isVeg: false,
          },
        ],
      },
    },
    {
      day: 7,
      date: "March 21, 2026",
      title: "Final Morning & Shopping",
      activities: {
        morning: [
          {
            time: "9:00 AM",
            title: "Breakfast at Angelina",
            description:
              "Famous for the richest hot chocolate in Paris. The Mont Blanc pastry is iconic. A decadent farewell breakfast.",
            type: "dining",
            cost: 2200,
            isVeg: true,
          },
          {
            time: "11:00 AM",
            title: "Galeries Lafayette Haussmann",
            description:
              "Shop under the magnificent Art Nouveau glass dome. Tax-free shopping for non-EU visitors — claim at the détaxe counter.",
            type: "sightseeing",
            cost: 0,
          },
        ],
        afternoon: [
          {
            time: "1:00 PM",
            title: "Last Lunch at Bouillon Pigalle",
            description:
              "Unbeatable value French classics in a gorgeous Art Deco space. The mushroom vol-au-vent is a vegetarian favorite.",
            type: "dining",
            cost: 2000,
            isVeg: true,
          },
          {
            time: "3:00 PM",
            title: "Pack & Check Out",
            description:
              "Final packing. The concierge will arrange luggage storage if needed and book your airport transfer.",
            type: "leisure",
            cost: 0,
          },
          {
            time: "5:00 PM",
            title: "Relax at Hotel Spa",
            description:
              "Complimentary farewell spa treatment. A Dior-scented steam room and relaxation pool to end the trip in pure bliss.",
            type: "leisure",
            cost: 0,
          },
        ],
        evening: [
          {
            time: "8:00 PM",
            title: "Light Dinner at Le Petit Cler",
            description:
              "A cozy neighborhood bistro for a light, no-fuss final dinner. Perfect to end the week before an early morning flight.",
            type: "dining",
            cost: 2400,
            isVeg: false,
          },
        ],
      },
    },
  ],
  visa: {
    required: true,
    type: "Schengen Short-Stay Visa (Type C)",
    processingTime: "15 calendar days (apply at least 30 days before travel)",
    documents: [
      {
        name: "Valid Passport",
        status: "required",
        description:
          "Must be valid for at least 3 months beyond your intended departure date from the Schengen area, with at least 2 blank pages.",
      },
      {
        name: "Visa Application Form",
        status: "required",
        description:
          "Completed and signed Schengen visa application form. Download from the French consulate website.",
      },
      {
        name: "Passport-Sized Photographs (2)",
        status: "required",
        description:
          "Recent photographs (taken within the last 6 months), 35mm x 45mm, white background, no glasses.",
      },
      {
        name: "Travel Insurance",
        status: "required",
        description:
          "Minimum coverage of €30,000 for medical emergencies and repatriation. Must be valid for the entire Schengen area.",
      },
      {
        name: "Flight Reservation",
        status: "required",
        description:
          "Round-trip flight booking or confirmed itinerary. Do NOT purchase final tickets until visa is approved.",
      },
      {
        name: "Hotel Booking Confirmation",
        status: "required",
        description:
          "Confirmed hotel reservation for the entire duration of stay with hotel name, address, and dates.",
      },
      {
        name: "Bank Statements (6 months)",
        status: "required",
        description:
          "Last 6 months of bank statements showing a healthy balance. Minimum recommended: ₹3,00,000 or equivalent.",
      },
      {
        name: "Cover Letter",
        status: "required",
        description:
          "A formal letter explaining the purpose, itinerary, and financial proof for your visit. We generate this for you automatically.",
      },
      {
        name: "Employment Letter / Business Proof",
        status: "required",
        description:
          "Letter from employer on company letterhead with salary details, approved leave dates, and designation. Self-employed: business registration + ITR.",
      },
      {
        name: "Income Tax Returns (3 years)",
        status: "recommended",
        description:
          "Last 3 years of filed ITRs to demonstrate financial stability and ties to India.",
      },
      {
        name: "No Objection Certificate (NOC)",
        status: "optional",
        description:
          "If employed, an NOC from your employer confirming your approved leave. Some consulates consider this optional if the employment letter is detailed.",
      },
    ],
    coverLetter: `To,
The Visa Officer
Consulate General of France
Mumbai, India

Date: February 15, 2026

Subject: Application for Schengen Short-Stay Tourist Visa (Type C)

Dear Sir/Madam,

I am writing to respectfully request a Schengen Short-Stay Tourist Visa (Type C) to visit France for tourism purposes. Below, I present the full details of my planned trip for your kind consideration.

PERSONAL DETAILS
Full Name: [Applicant Full Name]
Passport Number: [Passport Number]
Date of Birth: [Date of Birth]
Nationality: Indian
Occupation: [Occupation / Designation]
Employer: [Employer Name & Address]
Monthly Salary: [Monthly Salary]

TRAVEL DETAILS
Destination: Paris, France
Travel Dates: March 15, 2026 – March 22, 2026 (7 nights, 8 days)
Port of Entry: Charles de Gaulle Airport (CDG), Paris
Port of Exit: Charles de Gaulle Airport (CDG), Paris
Mode of Travel: Air France Flight AF 218 (Mumbai → Paris) and AF 217 (Paris → Mumbai)

ACCOMMODATION
Hotel: Hôtel Plaza Athénée
Address: 25 Avenue Montaigne, 75008 Paris, France
Reservation Confirmation Number: [To be attached]
Duration: March 15, 2026 – March 22, 2026

DETAILED ITINERARY
Day 1 (March 15): Arrival at CDG, hotel check-in, Seine River walk, dinner at Le Comptoir
Day 2 (March 16): Eiffel Tower summit visit, Trocadéro Gardens, Seine dinner cruise
Day 3 (March 17): Louvre Museum, Le Marais district, macaron-making class
Day 4 (March 18): Day trip to Palace of Versailles and gardens
Day 5 (March 19): Sacré-Cœur, Montmartre, Musée de l'Orangerie, wine tasting
Day 6 (March 20): Rue Cler market, Musée d'Orsay, Champs-Élysées, farewell dinner at Le Jules Verne
Day 7 (March 21): Galeries Lafayette, final shopping, hotel spa
Day 8 (March 22): Departure from CDG via Air France AF 217 back to Mumbai

FINANCIAL DETAILS
I have enclosed my bank statements for the last six months, which demonstrate sufficient funds to cover all expenses during my stay. My estimated total trip cost is approximately ₹2,55,000 (inclusive of flights, accommodation, food, transport, and activities), which is well within my financial capacity.

PURPOSE OF VISIT
This trip is purely for tourism and leisure. I am a passionate traveler and have long wished to experience the art, architecture, cuisine, and culture of Paris. I have no intention of seeking employment or overstaying my visa. I have strong personal, professional, and financial ties to India that ensure my return.

TIES TO HOME COUNTRY
• I am currently employed at [Employer Name] and have been granted approved leave for this period.
• I own [property / have family obligations] in [City, India].
• I have a confirmed return flight (AF 217, March 22, 2026) back to Mumbai, India.

I kindly request you to grant me a Schengen tourist visa for the above-mentioned travel dates. I assure you of my full compliance with all visa regulations and my timely return to India.

All supporting documents — including passport copies, photographs, bank statements, travel insurance, flight reservations, hotel booking, employment letter, and income tax returns — are enclosed herewith for your perusal.

Thank you for your time and consideration. I look forward to a favorable decision.

Yours faithfully,

[Applicant Full Name]
[Contact Number]
[Email Address]
[Residential Address]`,
  },
  summary: {
    flightTotal: 82300,
    hotelTotal: 129500,
    activitiesTotal: 101800,
    transportTotal: 0,
    grandTotal: 313600,
  },
};
