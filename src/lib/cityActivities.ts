// ─── City Activities Knowledge Base ──────────────────────────────────────────
// Real, detailed activities for every city in our region database.
// Used by the multi-city trip generator for realistic, time-aware itineraries.
//
// Sources referenced: TripAdvisor, Lonely Planet, Google Travel, Klook, Viator

import type { Activity } from "@/data/mockTrip";

export interface CityDayTemplate {
  theme: string;
  morning: Activity[];
  afternoon: Activity[];
  evening: Activity[];
}

export interface CityActivityData {
  /** Activities for the arrival day (afternoon + evening only — morning is travel + check-in) */
  arrival: { afternoon: Activity[]; evening: Activity[] };
  /** Activities when arriving from another city by train/bus (half-day) */
  transitArrival: { afternoon: Activity[]; evening: Activity[] };
  /** Full exploration days */
  fullDays: CityDayTemplate[];
  /** Departure day (morning only — afternoon is airport transfer) */
  departure: { morning: Activity[] };
  /** Airport transfer info */
  airportTransfer: { mode: string; duration: string; cost: number };
  /** Average hotel check-in time */
  checkInTime: string;
}

const db: Record<string, CityActivityData> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // EUROPE
  // ═══════════════════════════════════════════════════════════════════════════

  Paris: {
    airportTransfer: { mode: "RER B Train from CDG", duration: "45 min", cost: 1100 },
    checkInTime: "2:00 PM",
    arrival: {
      afternoon: [
        { time: "2:30 PM", title: "Hotel Check-in & Freshen Up", description: "Settle into your hotel in central Paris. Take a quick shower after the long flight and get refreshed.", type: "leisure", cost: 0 },
        { time: "4:00 PM", title: "Stroll Along the Seine", description: "Walk along the Left Bank of the Seine. Cross Pont des Arts, browse the bouquinistes (riverside booksellers), and soak in the Parisian atmosphere.", type: "sightseeing", cost: 0 },
      ],
      evening: [
        { time: "6:30 PM", title: "Eiffel Tower at Sunset", description: "Head to Trocadéro for the iconic Eiffel Tower view. Watch it sparkle as the lights turn on at dusk. Pre-book summit tickets to avoid 2-hour queues.", type: "sightseeing", cost: 2600 },
        { time: "8:30 PM", title: "Dinner at Le Bouillon Chartier", description: "A Parisian institution since 1896. Classic French dishes (onion soup, duck confit, crème brûlée) at remarkably affordable prices in a stunning Belle Époque hall.", type: "dining", cost: 2500, isVeg: false },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "2:00 PM", title: "Check-in & Quick Rest", description: "Drop luggage at your Paris hotel and freshen up after the journey.", type: "leisure", cost: 0 },
        { time: "3:30 PM", title: "Montmartre & Sacré-Cœur", description: "Climb the hill to Sacré-Cœur for panoramic views. Wander the cobbled streets of Montmartre, the artists' quarter, past Place du Tertre.", type: "sightseeing", cost: 0 },
      ],
      evening: [
        { time: "7:00 PM", title: "Dinner in Le Marais", description: "Explore the trendy Marais district. Try falafel at L'As du Fallafel on Rue des Rosiers or classic bistro fare at nearby Breizh Café.", type: "dining", cost: 2200, isVeg: false },
      ],
    },
    fullDays: [
      {
        theme: "Iconic Paris — Louvre, Champs-Élysées & River Cruise",
        morning: [
          { time: "8:30 AM", title: "Breakfast at Café de Flore", description: "The legendary Saint-Germain café where Sartre and de Beauvoir held court. Croissants, café crème, and unbeatable people-watching.", type: "dining", cost: 1800, isVeg: true },
          { time: "10:00 AM", title: "The Louvre Museum (3 hours)", description: "See the Mona Lisa, Venus de Milo, and Winged Victory. Pre-book timed entry to skip the pyramid queue. Focus on the Denon Wing for greatest hits.", type: "culture", cost: 1700 },
        ],
        afternoon: [
          { time: "1:00 PM", title: "Lunch at Angelina (Rivoli)", description: "Famous for their Mont-Blanc pastry and rich African hot chocolate. Light salads and club sandwiches for lunch.", type: "dining", cost: 2200, isVeg: true },
          { time: "2:30 PM", title: "Tuileries Garden → Place de la Concorde → Champs-Élysées", description: "Walk through the formal Tuileries gardens to the grand Champs-Élysées. Window-shop at Louis Vuitton's flagship and end at the Arc de Triomphe rooftop.", type: "sightseeing", cost: 1300 },
        ],
        evening: [
          { time: "5:30 PM", title: "Seine River Cruise (Bateaux Mouches)", description: "A 1-hour cruise past Notre-Dame, the Louvre, Musée d'Orsay, and under Paris's beautiful bridges. Best at golden hour.", type: "sightseeing", cost: 1400 },
          { time: "8:00 PM", title: "Dinner at Le Comptoir du Panthéon", description: "Cozy bistro in the Latin Quarter. Try the steak frites, ratatouille, or cheese platter paired with a carafe of Côtes du Rhône.", type: "dining", cost: 3500, isVeg: false },
        ],
      },
      {
        theme: "Versailles & Artistic Paris",
        morning: [
          { time: "8:00 AM", title: "Train to Versailles (40 min)", description: "Take the RER C from central Paris. Arrive early to beat the crowds at the Palace.", type: "transport", cost: 800 },
          { time: "9:30 AM", title: "Palace of Versailles", description: "The Hall of Mirrors, the King's Grand Apartments, and the Chapel Royal. Audio guide included. Marie Antoinette's estate is a short walk.", type: "culture", cost: 2100 },
        ],
        afternoon: [
          { time: "12:30 PM", title: "Lunch at Versailles Market", description: "The Marché Notre-Dame has wonderful cheese shops, crêpe stalls, and rotisserie chicken. Picnic in the palace gardens.", type: "dining", cost: 1800, isVeg: true },
          { time: "2:00 PM", title: "Versailles Gardens & Marie Antoinette's Hamlet", description: "The 2,000-acre gardens with fountains, the Grand Trianon, and the fairy-tale hamlet where Marie Antoinette played at being a shepherdess.", type: "sightseeing", cost: 0 },
          { time: "4:30 PM", title: "Return to Paris & Musée d'Orsay", description: "This converted railway station houses the world's greatest Impressionist collection. Monet's water lilies, Renoir, and Van Gogh's bedroom.", type: "culture", cost: 1600 },
        ],
        evening: [
          { time: "7:30 PM", title: "Dinner at Pink Mamma (Italian-French Fusion)", description: "A 4-floor Italian paradise in the 10th arrondissement. Wood-fired pizza, truffle pasta, and a rooftop terrace. Arrive early — no reservations.", type: "dining", cost: 2800, isVeg: false },
        ],
      },
      {
        theme: "Hidden Paris — Markets, pastries & neighbourhoods",
        morning: [
          { time: "9:00 AM", title: "Pastry Tour of Saint-Germain", description: "Visit 3-4 of Paris's best pâtisseries: Pierre Hermé (macarons), Poilâne (sourdough), and Du Pain et des Idées (pain des amis).", type: "dining", cost: 1200, isVeg: true },
          { time: "11:00 AM", title: "Luxembourg Gardens", description: "Paris's most beautiful park. Watch locals play pétanque, sail model boats, and relax by the Medici Fountain.", type: "leisure", cost: 0 },
        ],
        afternoon: [
          { time: "12:30 PM", title: "Lunch at Marché des Enfants Rouges", description: "Paris's oldest covered market (1615). Moroccan couscous, Japanese bento, Italian pasta — a global food court in a historic market.", type: "dining", cost: 1500, isVeg: false },
          { time: "2:30 PM", title: "Canal Saint-Martin Neighborhood Walk", description: "Iron footbridges, tree-lined quays, and hip boutiques. This is the Paris of Amélie — charming, artistic, and off the tourist trail.", type: "sightseeing", cost: 0 },
        ],
        evening: [
          { time: "6:00 PM", title: "Wine Tasting at Ô Chateau", description: "A fun, English-friendly wine tasting in a vaulted cellar. Sample 5 French wines with expert commentary. Great for beginners.", type: "culture", cost: 3200 },
          { time: "8:30 PM", title: "Farewell Dinner at Le Train Bleu", description: "A jaw-dropping Belle Époque restaurant inside Gare de Lyon. Gilt ceilings, painted murals, and classic French cuisine.", type: "dining", cost: 4500, isVeg: false },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Breakfast & Last-Minute Shopping", description: "Light breakfast at the hotel. Pick up macarons from Ladurée and souvenirs from Galeries Lafayette before heading to CDG.", type: "dining", cost: 1000, isVeg: true },
        { time: "10:00 AM", title: "Transfer to Paris CDG Airport", description: "RER B train (45 min) or pre-booked taxi (€55-65, 45-60 min depending on traffic). Arrive 3 hours before international flights.", type: "transport", cost: 1100 },
      ],
    },
  },

  Amsterdam: {
    airportTransfer: { mode: "Train from Schiphol", duration: "17 min", cost: 550 },
    checkInTime: "3:00 PM",
    arrival: {
      afternoon: [
        { time: "2:30 PM", title: "Hotel Check-in & Settle In", description: "Check into your canal-side hotel in the Jordaan or Dam Square area. Freshen up after the journey.", type: "leisure", cost: 0 },
        { time: "4:00 PM", title: "Canal Belt Walking Tour", description: "Stroll along the UNESCO-listed canal ring — Herengracht, Keizersgracht, and Prinsengracht. Cross the photogenic Seven Bridges viewpoint.", type: "sightseeing", cost: 0 },
      ],
      evening: [
        { time: "6:30 PM", title: "Evening Canal Cruise", description: "A 75-minute cruise through illuminated canals with wine and Dutch cheese. The best way to see Amsterdam from the water.", type: "sightseeing", cost: 2200 },
        { time: "8:30 PM", title: "Dinner at The Pancake Bakery", description: "A cosy restaurant in a 17th-century warehouse. Try Dutch pannenkoeken — savoury and sweet variations. The bacon & cheese pancake is legendary.", type: "dining", cost: 1800, isVeg: false },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "1:30 PM", title: "Check-in & Canal Walk", description: "Drop bags at the hotel and walk along the Jordaan canals. Grab a fresh stroopwafel from a street vendor.", type: "leisure", cost: 300 },
        { time: "3:30 PM", title: "Vondelpark & Museum Square", description: "Relax in Amsterdam's beloved park, then admire the exterior of the Rijksmuseum and the iconic I Amsterdam letters (now at Schiphol).", type: "sightseeing", cost: 0 },
      ],
      evening: [
        { time: "7:00 PM", title: "Dinner in De Pijp (Albert Cuyp Market area)", description: "The multicultural De Pijp neighbourhood has excellent Surinamese, Indonesian, and Dutch restaurants. Try bitterballen and Heineken at a brown café.", type: "dining", cost: 2000, isVeg: false },
      ],
    },
    fullDays: [
      {
        theme: "Art & Culture — Rijksmuseum, Van Gogh & Anne Frank",
        morning: [
          { time: "8:30 AM", title: "Breakfast at Pluk", description: "Trendy all-day brunch spot in the Nine Streets. Avocado toast, fresh juices, and excellent flat whites.", type: "dining", cost: 1500, isVeg: true },
          { time: "10:00 AM", title: "Rijksmuseum (2.5 hours)", description: "The Netherlands' greatest museum. See Rembrandt's Night Watch, Vermeer's Milkmaid, and Delft pottery. Pre-book timed tickets.", type: "culture", cost: 2200 },
        ],
        afternoon: [
          { time: "12:30 PM", title: "Lunch at Foodhallen", description: "Amsterdam's indoor food market in a converted tram depot. Vietnamese bao, Neapolitan pizza, and fresh Dutch herring. 20+ vendors.", type: "dining", cost: 1800, isVeg: false },
          { time: "2:30 PM", title: "Van Gogh Museum", description: "The world's largest Van Gogh collection — 200 paintings including Sunflowers and The Bedroom. The audio guide is outstanding.", type: "culture", cost: 2000 },
          { time: "4:30 PM", title: "Anne Frank House", description: "Walk through the secret annex where Anne Frank and her family hid for two years. Deeply moving — book tickets exactly 6 weeks in advance.", type: "culture", cost: 1600 },
        ],
        evening: [
          { time: "7:00 PM", title: "Dinner at Café Restaurant Amsterdam", description: "A grand waterfront restaurant in a former pumping station. Dutch-French cuisine with stunning harbour views.", type: "dining", cost: 3200, isVeg: false },
        ],
      },
      {
        theme: "Markets, Neighbourhoods & Local Life",
        morning: [
          { time: "9:00 AM", title: "Albert Cuyp Market", description: "Amsterdam's largest outdoor market (since 1905). Fresh stroopwafels, Dutch cheese, flowers, vintage clothes, and street food.", type: "sightseeing", cost: 800 },
          { time: "11:00 AM", title: "Heineken Experience", description: "The interactive brewery tour in the original Heineken building. Learn to pour the perfect pint (includes 2 beers).", type: "culture", cost: 2100 },
        ],
        afternoon: [
          { time: "1:00 PM", title: "Lunch at FEBO (Dutch fast food)", description: "The legendary automat wall — insert coins, open a little door, and grab a hot kroket or frikandel. Uniquely Dutch!", type: "dining", cost: 500, isVeg: false },
          { time: "2:30 PM", title: "Bike Ride Through Vondelpark to Amsterdamse Bos", description: "Rent a bike (the only proper way to see Amsterdam!) and cycle through Vondelpark. Continue to Amsterdamse Bos for pancakes at Meerzicht.", type: "sightseeing", cost: 1200 },
        ],
        evening: [
          { time: "6:00 PM", title: "Jordaan Neighbourhood Food Tour", description: "Guided walking food tour through Amsterdam's prettiest neighbourhood. Sample cheese, herring, bitterballen, apple pie, and local craft beer.", type: "culture", cost: 4500 },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Breakfast & Souvenir Shopping", description: "Quick breakfast at the hotel. Visit a cheese shop on Damstraat for vacuum-packed Gouda, then pick up Delft pottery miniatures.", type: "dining", cost: 800, isVeg: true },
        { time: "10:00 AM", title: "Train to Schiphol Airport", description: "Direct train from Amsterdam Centraal (17 min, €5.60). Schiphol has excellent duty-free — grab some stroopwafels and Gouda.", type: "transport", cost: 550 },
      ],
    },
  },

  Prague: {
    airportTransfer: { mode: "Airport Express bus AE", duration: "35 min", cost: 400 },
    checkInTime: "2:00 PM",
    arrival: {
      afternoon: [
        { time: "2:00 PM", title: "Hotel Check-in in Old Town", description: "Settle into your hotel near Old Town Square. Prague's hotels offer great value compared to Western Europe. Freshen up and grab a coffee.", type: "leisure", cost: 0 },
        { time: "3:30 PM", title: "Old Town Square & Astronomical Clock", description: "Witness the 600-year-old Astronomical Clock's hourly show. Admire the Týn Church's Gothic spires and the pastel Baroque buildings surrounding the square.", type: "sightseeing", cost: 0 },
      ],
      evening: [
        { time: "6:00 PM", title: "Charles Bridge at Sunset", description: "Walk across the iconic 14th-century bridge lined with 30 Baroque statues. At sunset, the Prague Castle glows golden across the Vltava River.", type: "sightseeing", cost: 0 },
        { time: "8:00 PM", title: "Dinner at Lokál Dlouhá", description: "The best Czech pub food in Prague. Try svíčková (beef in cream sauce), smažený sýr (fried cheese), and ice-cold Pilsner Urquell on tap.", type: "dining", cost: 1200, isVeg: false },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "2:30 PM", title: "Check-in & Explore Old Town", description: "Drop bags at the hotel and walk to Old Town Square. Marvel at the Astronomical Clock and the colourful Baroque facades.", type: "leisure", cost: 0 },
        { time: "4:00 PM", title: "Vltava River Walk", description: "Stroll along the riverside towards the Dancing House (Ginger & Fred building). Great photo spots of Prague Castle across the water.", type: "sightseeing", cost: 0 },
      ],
      evening: [
        { time: "7:00 PM", title: "Czech Beer Tasting & Dinner", description: "Prague has the world's highest beer consumption per capita. Visit U Fleků — a 500-year-old brewery — for dark lager and traditional Czech dishes.", type: "dining", cost: 1500, isVeg: false },
      ],
    },
    fullDays: [
      {
        theme: "Prague Castle, Malá Strana & Jewish Quarter",
        morning: [
          { time: "8:30 AM", title: "Breakfast at Café Savoy", description: "Elegant café with vaulted ceilings. Famous for their eggs Benedict and fresh pastries. Coffee is superb.", type: "dining", cost: 800, isVeg: true },
          { time: "10:00 AM", title: "Prague Castle Complex (3 hours)", description: "The world's largest ancient castle. See St. Vitus Cathedral (stunning stained glass by Alphonse Mucha), the Old Royal Palace, and Golden Lane.", type: "culture", cost: 1200 },
        ],
        afternoon: [
          { time: "1:00 PM", title: "Lunch in Malá Strana", description: "The charming Lesser Town below the castle. Try Café Lounge for modern Czech cuisine or koleno (roasted pork knee) at U Malého Glena.", type: "dining", cost: 1000, isVeg: false },
          { time: "2:30 PM", title: "Jewish Quarter (Josefov)", description: "Visit the Old Jewish Cemetery (12,000 tombstones stacked over centuries), the oldest active synagogue in Europe, and the Kafka statue.", type: "culture", cost: 900 },
          { time: "4:30 PM", title: "Letná Park Viewpoint", description: "Climb to the famous Letná beer garden for panoramic views of Prague's bridges and red rooftops. Cold draft beer for ₹150.", type: "sightseeing", cost: 200 },
        ],
        evening: [
          { time: "7:00 PM", title: "Dinner & Jazz at AghaRTA Jazz Club", description: "Prague has a thriving jazz scene. Enjoy live music with Czech wine and a light dinner in this intimate underground club.", type: "culture", cost: 2000 },
        ],
      },
      {
        theme: "Art, Quirky Prague & Day Exploring",
        morning: [
          { time: "9:00 AM", title: "Petřín Hill & Tower", description: "Take the funicular railway up Petřín Hill. The lookout tower (a mini Eiffel Tower) offers 360° views. The Mirror Maze is fun.", type: "sightseeing", cost: 500 },
          { time: "11:00 AM", title: "Lennon Wall & Kampa Island", description: "The ever-changing graffiti wall dedicated to John Lennon. Walk to peaceful Kampa Island to see the David Černý baby sculptures.", type: "sightseeing", cost: 0 },
        ],
        afternoon: [
          { time: "12:30 PM", title: "Lunch at Eska", description: "A modern Czech restaurant using fermentation and local ingredients. The bread alone is worth the visit.", type: "dining", cost: 1200, isVeg: true },
          { time: "2:30 PM", title: "Vyšehrad Fortress", description: "Prague's other castle — peaceful, uncrowded, with beautiful cemetery (resting place of Dvořák). Stunning Vltava views.", type: "culture", cost: 300 },
        ],
        evening: [
          { time: "6:00 PM", title: "Black Light Theatre Show", description: "Prague's unique theatrical tradition — dancers in UV light create magical visual illusions. A must-see Czech experience.", type: "culture", cost: 1500 },
          { time: "8:30 PM", title: "Farewell Dinner at Mincovna", description: "Traditional Czech restaurant near Old Town Square. Hearty portions of duck, dumplings, and sauerkraut with excellent local wine.", type: "dining", cost: 1400, isVeg: false },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Breakfast & Souvenir Shopping", description: "Quick hotel breakfast. Visit Manufaktura for Czech wooden toys, Botanicus for natural cosmetics, and pick up some Becherovka liqueur.", type: "dining", cost: 400, isVeg: true },
        { time: "10:00 AM", title: "Transfer to Prague Airport", description: "Airport Express bus from Praha Hlavní Nádraží (35 min, CZK 100). Budget taxi: ~500 CZK (₹1,700).", type: "transport", cost: 400 },
      ],
    },
  },

  Vienna: {
    airportTransfer: { mode: "CAT (City Airport Train)", duration: "16 min", cost: 1200 },
    checkInTime: "3:00 PM",
    arrival: {
      afternoon: [
        { time: "3:00 PM", title: "Hotel Check-in & Refresh", description: "Check into your hotel near Stephansplatz. Vienna's imperial grandeur hits you instantly. Freshen up and head out.", type: "leisure", cost: 0 },
        { time: "4:30 PM", title: "Stephansdom & Inner City Walk", description: "Visit the stunning Gothic cathedral, then wander the pedestrianised Graben and Kohlmarkt streets past designer shops and Baroque palaces.", type: "sightseeing", cost: 0 },
      ],
      evening: [
        { time: "6:30 PM", title: "Café Central — Viennese Coffee Culture", description: "The most beautiful coffeehouse in the world. Order a Wiener Melange (Vienna's cappuccino) and a slice of Sachertorte. Trotsky used to play chess here.", type: "dining", cost: 1200, isVeg: true },
        { time: "8:00 PM", title: "Dinner at Figlmüller", description: "Vienna's most famous schnitzel restaurant since 1905. Their Wiener Schnitzel hangs over the edge of the plate. Book ahead or queue.", type: "dining", cost: 2000, isVeg: false },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "2:00 PM", title: "Check-in & Refresh", description: "Arrive at your Vienna hotel. Drop bags and take a quick rest.", type: "leisure", cost: 0 },
        { time: "3:30 PM", title: "Ringstrasse Tram Ride", description: "Take Tram 1 or 2 around the famous Ring Road. Pass the Opera House, Parliament, City Hall, Burgtheater, and the University — all in 30 minutes.", type: "sightseeing", cost: 250 },
      ],
      evening: [
        { time: "7:00 PM", title: "Naschmarkt & Dinner", description: "Vienna's biggest outdoor market. Sample Turkish meze, Austrian wine, and fresh produce. Dine at Neni am Naschmarkt for Middle Eastern-Viennese fusion.", type: "dining", cost: 2200, isVeg: false },
      ],
    },
    fullDays: [
      {
        theme: "Imperial Vienna — Schönbrunn, Hofburg & Music",
        morning: [
          { time: "8:30 AM", title: "Breakfast at Vollpension", description: "A charming café where grandmas do the baking. Home-made cakes, strudel, and Austrian breakfast with fresh jam. Heartwarming concept.", type: "dining", cost: 900, isVeg: true },
          { time: "10:00 AM", title: "Schönbrunn Palace & Gardens", description: "The Habsburg summer residence — 1,441 rooms! Tour the Grand Gallery and Mirror Room. Walk the expansive French gardens to the Gloriette for city views.", type: "culture", cost: 2200 },
        ],
        afternoon: [
          { time: "1:00 PM", title: "Lunch at Plachutta (Tafelspitz)", description: "Vienna's signature dish — boiled beef in bone marrow broth with apple horseradish. Plachutta has perfected this since 1860.", type: "dining", cost: 2500, isVeg: false },
          { time: "3:00 PM", title: "Hofburg Imperial Palace", description: "The winter residence of the Habsburgs. See the Imperial Apartments, the Sisi Museum, and the spectacular Imperial Silver Collection.", type: "culture", cost: 1800 },
          { time: "5:00 PM", title: "Hotel Sacher — Original Sachertorte", description: "The world's most famous chocolate cake, at the hotel that invented it in 1832. Rich, dense, with a layer of apricot jam.", type: "dining", cost: 800, isVeg: true },
        ],
        evening: [
          { time: "7:30 PM", title: "Vienna State Opera or Mozart Concert", description: "Standing tickets for the Opera start at €15 — or attend a Mozart & Strauss concert at the Musikverein (golden hall where the NY concert is filmed).", type: "culture", cost: 3000 },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Breakfast & Last Walk", description: "Enjoy a final Viennese breakfast. Walk along the Danube Canal to see the street art, then buy Mozart Kugeln chocolates at the airport.", type: "dining", cost: 700, isVeg: true },
        { time: "10:00 AM", title: "Transfer to Vienna Airport", description: "CAT City Airport Train (16 min, €14.90) from Wien Mitte. Smooth and efficient.", type: "transport", cost: 1200 },
      ],
    },
  },

  Budapest: {
    airportTransfer: { mode: "Airport Bus 100E", duration: "35 min", cost: 350 },
    checkInTime: "2:00 PM",
    arrival: {
      afternoon: [
        { time: "2:00 PM", title: "Hotel Check-in", description: "Settle into your hotel on the Pest side near the river. Budapest's two halves — hilly Buda and flat Pest — are divided by the Danube.", type: "leisure", cost: 0 },
        { time: "3:30 PM", title: "Walk Along the Danube Promenade", description: "Stroll the Pest embankment past the Shoes on the Danube memorial and the beautiful Parliament building. Cross the Chain Bridge to Buda.", type: "sightseeing", cost: 0 },
      ],
      evening: [
        { time: "6:00 PM", title: "Gellért Thermal Bath", description: "Art Nouveau thermal baths fed by natural hot springs. Choose from indoor pools, outdoor wave pools, and steam rooms. Pure relaxation.", type: "leisure", cost: 1000 },
        { time: "8:30 PM", title: "Dinner at Mazel Tov", description: "A trendy Middle Eastern restaurant in the Jewish Quarter with a stunning open-air courtyard. Israeli-Hungarian fusion, great cocktails.", type: "dining", cost: 1500, isVeg: false },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "2:30 PM", title: "Hotel Drop-off & Quick Rest", description: "Arrive from your train journey, check in and freshen up.", type: "leisure", cost: 0 },
        { time: "4:00 PM", title: "Parliament Building Photo Walk", description: "The massive Gothic Revival parliament on the Danube is Hungary's most iconic building. Walk the promenade for the best photos at golden hour.", type: "sightseeing", cost: 0 },
      ],
      evening: [
        { time: "7:00 PM", title: "Ruin Bar Hopping", description: "Budapest invented ruin bars — eclectic pubs in abandoned buildings. Start at Szimpla Kert (the original), then try Instant-Fogas.", type: "culture", cost: 1500 },
      ],
    },
    fullDays: [
      {
        theme: "Buda Castle, Baths & Ruin Bars",
        morning: [
          { time: "9:00 AM", title: "Breakfast at New York Café", description: "The 'most beautiful café in the world' — gilded columns, frescoed ceilings, and chandeliers. Worth it for the atmosphere alone.", type: "dining", cost: 1200, isVeg: true },
          { time: "10:30 AM", title: "Buda Castle & Fisherman's Bastion", description: "Take the funicular up Castle Hill. Fisherman's Bastion offers fairy-tale turrets and the best panoramic views of Pest across the river.", type: "sightseeing", cost: 800 },
        ],
        afternoon: [
          { time: "1:00 PM", title: "Lunch at the Great Market Hall", description: "Budapest's stunning 19th-century market. Ground floor: paprika, salami, pickles. Upper floor: try lángos (deep-fried dough with sour cream).", type: "dining", cost: 700, isVeg: false },
          { time: "2:30 PM", title: "Széchenyi Thermal Baths", description: "The largest medicinal bath in Europe, in a grand Neo-Baroque palace in City Park. Soak in 18 pools ranging from 26°C to 38°C.", type: "leisure", cost: 900 },
        ],
        evening: [
          { time: "6:00 PM", title: "Szimpla Kert — The Original Ruin Bar", description: "A defunct factory turned into the world's most famous ruin bar. Bathtubs for seating, a car cut in half, and 100+ craft cocktails.", type: "culture", cost: 1000 },
          { time: "8:30 PM", title: "Dinner at Menza", description: "Retro-chic restaurant serving updated Hungarian classics. Try chicken paprikash, goulash soup, and chimney cake (kürtőskalács) for dessert.", type: "dining", cost: 1300, isVeg: false },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Breakfast & Market Visit", description: "Quick breakfast at the hotel. Last visit to the Great Market Hall for paprika spice packets and Hungarian salami to take home.", type: "dining", cost: 500, isVeg: true },
        { time: "10:00 AM", title: "Transfer to Budapest Liszt Ferenc Airport", description: "Airport bus 100E from Deák tér (35 min, HUF 2,200 ~₹500). Budget taxi: ~HUF 9,000 (₹2,000).", type: "transport", cost: 350 },
      ],
    },
  },

  Rome: {
    airportTransfer: { mode: "Leonardo Express train from FCO", duration: "32 min", cost: 1500 },
    checkInTime: "2:00 PM",
    arrival: {
      afternoon: [
        { time: "2:00 PM", title: "Hotel Check-in Near Piazza Navona", description: "Settle into your hotel in the historic centre. Rome's ancient wonders are all walkable from here.", type: "leisure", cost: 0 },
        { time: "3:30 PM", title: "Trevi Fountain & Spanish Steps", description: "Toss a coin into the Trevi Fountain (guarantees your return to Rome!), then climb the Spanish Steps. Detour to the Pantheon en route.", type: "sightseeing", cost: 0 },
      ],
      evening: [
        { time: "6:00 PM", title: "Aperitivo in Trastevere", description: "Cross the Tiber to Rome's most charming neighbourhood. An Aperol Spritz and complimentary nibbles at a vine-covered trattoria.", type: "dining", cost: 1200, isVeg: true },
        { time: "8:30 PM", title: "Dinner at Da Enzo al 29", description: "The best cacio e pepe in Rome — a 4-ingredient pasta that achieves perfection. Queue early; they don't take reservations.", type: "dining", cost: 2000, isVeg: false },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "2:00 PM", title: "Hotel Check-in & Rest", description: "Drop bags at the hotel. Rome is intensely walkable but hot — take it easy after your train ride.", type: "leisure", cost: 0 },
        { time: "4:00 PM", title: "Pantheon & Piazza Navona", description: "The 2,000-year-old concrete dome of the Pantheon is free to enter. Then admire Bernini's fountains in Piazza Navona with a gelato.", type: "sightseeing", cost: 0 },
      ],
      evening: [
        { time: "7:30 PM", title: "Dinner in the Jewish Ghetto", description: "Rome's Jewish Quarter has unique dishes: carciofi alla giudia (fried artichokes), supplì (fried risotto balls). Try Nonna Betta.", type: "dining", cost: 2200, isVeg: false },
      ],
    },
    fullDays: [
      {
        theme: "Ancient Rome — Colosseum, Forum & Palatine",
        morning: [
          { time: "8:00 AM", title: "Breakfast at Roscioli Caffè", description: "Roman cornetti (croissants) stuffed with pistachio cream, paired with a perfect Italian espresso. A sublime start.", type: "dining", cost: 800, isVeg: true },
          { time: "9:30 AM", title: "Colosseum (Skip-the-Line Tour)", description: "Enter the 2,000-year-old amphitheatre where gladiators fought. A guided tour includes underground chambers and the arena floor.", type: "sightseeing", cost: 2500 },
        ],
        afternoon: [
          { time: "12:00 PM", title: "Roman Forum & Palatine Hill", description: "Walk through the heart of ancient Rome — the Senate House, Temple of Saturn, and the emperor's palace atop Palatine Hill.", type: "culture", cost: 0 },
          { time: "1:30 PM", title: "Lunch at Pizzeria da Baffetto", description: "Thin, crispy Roman-style pizza since 1959. Queue snaking down the alley means it's good. Cash only.", type: "dining", cost: 1000, isVeg: false },
          { time: "3:30 PM", title: "Piazza Venezia & Capitoline Museums", description: "Admire the Wedding Cake (Vittoriano), then visit the world's oldest museum. The Dying Gaul and She-Wolf with Romulus & Remus.", type: "culture", cost: 1500 },
        ],
        evening: [
          { time: "7:00 PM", title: "Dinner at Armando al Pantheon", description: "Traditional Roman trattoria steps from the Pantheon. Try amatriciana, carbonara, and finish with tiramisù. Book days ahead.", type: "dining", cost: 3000, isVeg: false },
        ],
      },
      {
        theme: "Vatican City & Baroque Rome",
        morning: [
          { time: "7:30 AM", title: "Vatican Museums & Sistine Chapel (Early Access)", description: "Book the 7:30 AM early-entry tour to see Michelangelo's ceiling with only 30 people in the room (vs 20,000 at peak). Life-changing.", type: "culture", cost: 3500 },
        ],
        afternoon: [
          { time: "11:30 AM", title: "St. Peter's Basilica & Dome Climb", description: "The world's largest church. Climb the 551 steps to the dome for breathtaking views over St. Peter's Square and all of Rome.", type: "culture", cost: 800 },
          { time: "1:30 PM", title: "Lunch at Pizzarium (Bonci)", description: "Gabriele Bonci's legendary pizza al taglio — thick, airy Roman slices with inventive toppings. Frequently called the world's best pizza.", type: "dining", cost: 900, isVeg: true },
          { time: "3:30 PM", title: "Villa Borghese Gardens & Gallery", description: "Stroll through Rome's Central Park. The Borghese Gallery houses Bernini's Apollo & Daphne and Caravaggio masterpieces. Must pre-book.", type: "culture", cost: 1800 },
        ],
        evening: [
          { time: "7:00 PM", title: "Sunset from Pincio Terrace", description: "Watch the sun set over Rome's domes and rooftops from the Pincian Hill terrace above Piazza del Popolo. Magical.", type: "sightseeing", cost: 0 },
          { time: "8:30 PM", title: "Dinner at Roscioli Salumeria", description: "Part deli, part restaurant. Outstanding carbonara, an incredible wine list, and you can buy aged cheeses and cured meats to take home.", type: "dining", cost: 3500, isVeg: false },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Breakfast & Last Gelato", description: "Cornetto and cappuccino at a local bar. Stop at Giolitti or Fatamorgana for one last artisanal gelato before heading to the airport.", type: "dining", cost: 600, isVeg: true },
        { time: "10:00 AM", title: "Leonardo Express to Fiumicino Airport", description: "Direct train from Roma Termini (32 min, €14). Runs every 15 minutes. Arrive 3 hours before international flights.", type: "transport", cost: 1500 },
      ],
    },
  },

  Barcelona: {
    airportTransfer: { mode: "Aerobus from El Prat", duration: "35 min", cost: 650 },
    checkInTime: "2:00 PM",
    arrival: {
      afternoon: [
        { time: "2:30 PM", title: "Hotel Check-in in Gothic Quarter", description: "Settle into your hotel in the Barri Gòtic or El Born neighbourhood. These are the city's most atmospheric, walkable areas.", type: "leisure", cost: 0 },
        { time: "4:00 PM", title: "Las Ramblas & La Boqueria Market", description: "Walk down Barcelona's most famous boulevard to La Boqueria — a kaleidoscope of fresh juices, jamón ibérico, and fruit cups. Sample as you go.", type: "sightseeing", cost: 800 },
      ],
      evening: [
        { time: "7:00 PM", title: "Barceloneta Beach & Sunset", description: "Walk along the beachfront promenade. Grab a fresh sangria at a chiringuito (beach bar) and watch the Mediterranean sunset.", type: "leisure", cost: 500 },
        { time: "9:00 PM", title: "Tapas Dinner at El Xampanyet", description: "A tiny, tiled tapas bar in El Born. Patatas bravas, pan con tomate, gambas al ajillo, and cava by the glass. Come early — it fills fast.", type: "dining", cost: 1800, isVeg: false },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "2:00 PM", title: "Check-in & Gothic Quarter Stroll", description: "Drop bags and wander the medieval lanes of the Gothic Quarter: the Cathedral, narrow streets, and tiny plazas.", type: "leisure", cost: 0 },
      ],
      evening: [
        { time: "7:00 PM", title: "Tapas Crawl in El Born", description: "Sample small plates at 3-4 bars: Cal Pep (counter seating), Bormuth (vermouth bar), and Bar del Pla for duck liver tacos.", type: "dining", cost: 2000, isVeg: false },
      ],
    },
    fullDays: [
      {
        theme: "Gaudí's Barcelona — Sagrada Familia & Park Güell",
        morning: [
          { time: "9:00 AM", title: "La Sagrada Familia (Timed Entry)", description: "Gaudí's unfinished masterpiece — a basilica under construction since 1882. The interior's tree-like columns and kaleidoscopic light are jaw-dropping.", type: "culture", cost: 2600 },
        ],
        afternoon: [
          { time: "12:00 PM", title: "Lunch at La Pepita", description: "Creative gourmet sandwiches and tapas in the Gràcia neighbourhood. The bikini trufado (truffle grilled cheese) is divine.", type: "dining", cost: 1200, isVeg: false },
          { time: "2:00 PM", title: "Park Güell", description: "Gaudí's mosaic wonderland on a hilltop. The dragon staircase, the serpentine bench with panoramic views, and the gingerbread houses.", type: "sightseeing", cost: 1000 },
          { time: "4:30 PM", title: "Passeig de Gràcia — Casa Batlló", description: "Walk Barcelona's grand boulevard. Casa Batlló's dragon-scale roof and skeletal balconies are Gaudí at his most fantastical.", type: "culture", cost: 2800 },
        ],
        evening: [
          { time: "7:30 PM", title: "Flamenco Show at Tablao Cordobes", description: "Passionate flamenco on Las Ramblas. The guitar, singing, and footwork in this intimate tablao are electrifying.", type: "culture", cost: 3500 },
          { time: "9:30 PM", title: "Late Dinner at Can Paixano (La Xampanyeria)", description: "A chaotic, standing-room-only cava bar serving cheap bubbly and excellent jamón sandwiches. Quintessentially Barcelona.", type: "dining", cost: 1000, isVeg: false },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Breakfast at Federal Café", description: "Excellent Australian-style brunch in the Gothic Quarter. Sourdough toast, eggs, and bulletproof coffee. A stylish send-off.", type: "dining", cost: 1000, isVeg: true },
        { time: "10:00 AM", title: "Aerobus to El Prat Airport", description: "Aerobus from Plaça Catalunya (35 min, €7.75). Runs every 5 minutes. Barcelona's easiest airport transfer.", type: "transport", cost: 650 },
      ],
    },
  },

  "Zürich": {
    airportTransfer: { mode: "Train from Zürich Airport", duration: "12 min", cost: 600 },
    checkInTime: "2:00 PM",
    arrival: {
      afternoon: [
        { time: "2:00 PM", title: "Hotel Check-in & Freshen Up", description: "Check into your hotel near Paradeplatz or the Old Town. Zürich is compact and walkable.", type: "leisure", cost: 0 },
        { time: "3:30 PM", title: "Bahnhofstrasse & Lake Zürich Promenade", description: "Walk down one of the world's most exclusive shopping streets, then continue to the lake for views of the Alps when clear.", type: "sightseeing", cost: 0 },
      ],
      evening: [
        { time: "6:00 PM", title: "Old Town (Altstadt) Walk", description: "Cobblestone lanes, medieval guild houses, and Grossmünster cathedral. Lindenhof hill offers the best sunset viewpoint.", type: "sightseeing", cost: 0 },
        { time: "8:00 PM", title: "Dinner at Zeughauskeller", description: "A 500-year-old armoury turned restaurant. Swiss classics: Zürich Geschnetzeltes (cream veal), rösti, and local wine.", type: "dining", cost: 3500, isVeg: false },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "2:00 PM", title: "Check-in & Lake Walk", description: "Drop bags and stroll along the Lake Zürich promenade. The Alpine views on clear days are breathtaking.", type: "leisure", cost: 0 },
      ],
      evening: [
        { time: "7:00 PM", title: "Dinner & Swiss Fondue", description: "Swiss Chuchi restaurant serves classic cheese fondue — bubbling Gruyère and Emmental with bread cubes, pickles, and cold white wine.", type: "dining", cost: 4000, isVeg: true },
      ],
    },
    fullDays: [
      {
        theme: "Alps Day Trip & Swiss Culture",
        morning: [
          { time: "7:30 AM", title: "Train to Mount Pilatus or Jungfraujoch", description: "The Golden Round Trip: boat across Lake Lucerne, world's steepest cogwheel train up Pilatus, panoramic gondola down. Stunning Alps scenery.", type: "sightseeing", cost: 8000 },
        ],
        afternoon: [
          { time: "1:00 PM", title: "Lunch at Mountain Restaurant", description: "Fresh-air dining with Alpine panoramas. Try älplermagronen (Alpine mac & cheese with applesauce) — a hearty Swiss mountain staple.", type: "dining", cost: 2500, isVeg: true },
          { time: "4:00 PM", title: "Return to Zürich & Chocolate Tasting", description: "Back in the city, visit Sprüngli (since 1836) for their legendary Luxemburgerli mini-macarons and a Swiss hot chocolate.", type: "culture", cost: 1500 },
        ],
        evening: [
          { time: "7:00 PM", title: "Dinner at Hiltl (World's Oldest Vegetarian Restaurant)", description: "Open since 1898. An incredible vegetarian/vegan buffet and à la carte. Even meat lovers rave about it.", type: "dining", cost: 3000, isVeg: true },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Breakfast & Swiss Chocolate Shopping", description: "Hotel breakfast, then visit Läderach or Sprüngli for beautifully boxed Swiss chocolate gifts.", type: "dining", cost: 800, isVeg: true },
        { time: "9:30 AM", title: "Train to Zürich Airport", description: "Direct S-Bahn from Zürich HB (12 min). Efficient and reliable — classic Switzerland.", type: "transport", cost: 600 },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOUTHEAST ASIA
  // ═══════════════════════════════════════════════════════════════════════════

  Bangkok: {
    airportTransfer: { mode: "Airport Rail Link from BKK", duration: "30 min", cost: 400 },
    checkInTime: "2:00 PM",
    arrival: {
      afternoon: [
        { time: "2:30 PM", title: "Hotel Check-in & Freshen Up", description: "Check into your hotel near Sukhumvit or Silom. Bangkok's heat and humidity call for a cool shower first.", type: "leisure", cost: 0 },
        { time: "4:00 PM", title: "Wat Pho (Reclining Buddha)", description: "See the massive 46-metre gold Reclining Buddha. This temple also houses Thailand's oldest massage school — get a traditional Thai massage here.", type: "culture", cost: 600 },
      ],
      evening: [
        { time: "6:30 PM", title: "Wat Arun at Sunset", description: "Cross the Chao Phraya River by ferry (₹30) for sunset views of the Temple of Dawn. The porcelain-encrusted spires shimmer at golden hour.", type: "sightseeing", cost: 200 },
        { time: "8:00 PM", title: "Dinner at Jay Fai (1 Michelin Star Street Food)", description: "The legendary goggle-wearing chef serves the world's most famous crab omelette and drunken noodles from a street-side wok. Queue 2+ hours (or go at opening).", type: "dining", cost: 2000, isVeg: false },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "2:00 PM", title: "Check-in & Temple Visit", description: "Drop bags and visit the nearby Wat Pho for the magnificent Reclining Buddha.", type: "leisure", cost: 600 },
      ],
      evening: [
        { time: "7:00 PM", title: "Chinatown Street Food (Yaowarat Road)", description: "Bangkok's Chinatown explodes with street food at night. Grilled satay, crispy pork, and mango sticky rice under neon signs.", type: "dining", cost: 800, isVeg: false },
      ],
    },
    fullDays: [
      {
        theme: "Grand Palace, Markets & Thai Culture",
        morning: [
          { time: "8:00 AM", title: "Grand Palace & Emerald Buddha", description: "Thailand's most sacred temple within the dazzling royal complex. Arrive at opening to avoid crowds. Cover shoulders and knees.", type: "culture", cost: 500 },
          { time: "10:30 AM", title: "Khlong Boat Ride", description: "Hire a longtail boat through the canals of Thonburi — the old Bangkok of stilted houses, temples, and orchid farms.", type: "sightseeing", cost: 800 },
        ],
        afternoon: [
          { time: "12:00 PM", title: "Lunch at Or Tor Kor Market", description: "Thailand's best fresh market. Michelin-recommended. Try som tum (papaya salad), pad see ew, and tropical fruits.", type: "dining", cost: 500, isVeg: false },
          { time: "2:30 PM", title: "Chatuchak Weekend Market", description: "15,000+ stalls spread over 35 acres. Vintage clothing, handicrafts, coconut ice cream, and Thai iced tea. A shopper's paradise.", type: "sightseeing", cost: 1000 },
        ],
        evening: [
          { time: "6:00 PM", title: "Rooftop Drinks at Sky Bar", description: "The open-air rooftop bar from The Hangover Part II. Dizzying 63rd-floor views of the Chao Phraya River. Dress smart-casual.", type: "leisure", cost: 1500 },
          { time: "8:30 PM", title: "Dinner at Err (Urban Rustic Thai)", description: "Michelin-recommended with vintage Thai décor. Bold, authentic flavours — crab curry, pork crackling, and fried fish cakes.", type: "dining", cost: 1200, isVeg: false },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Thai Massage & Hotel Checkout", description: "One last 1-hour Thai massage at a local parlour (₹800). Heaven for tired legs. Pack up and check out.", type: "leisure", cost: 800 },
        { time: "10:00 AM", title: "Transfer to Suvarnabhumi Airport", description: "Airport Rail Link (30 min, ₹400) or GrabCar (~₹600, 40 min depending on traffic).", type: "transport", cost: 400 },
      ],
    },
  },

  Singapore: {
    airportTransfer: { mode: "MRT from Changi Airport", duration: "30 min", cost: 250 },
    checkInTime: "3:00 PM",
    arrival: {
      afternoon: [
        { time: "3:00 PM", title: "Hotel Check-in & Refresh", description: "Settle into your hotel in Marina Bay or Bugis. Singapore is ultra-efficient — you'll be checked in and out quickly.", type: "leisure", cost: 0 },
        { time: "4:30 PM", title: "Gardens by the Bay", description: "Walk through the Supertree Grove — 18 towering tree structures. The OCBC Skyway bridge offers stunning Marina Bay views.", type: "sightseeing", cost: 800 },
      ],
      evening: [
        { time: "6:30 PM", title: "Marina Bay Sands Light Show", description: "Watch the free Spectra light and water show at Marina Bay Sands (8:00 PM & 9:00 PM nightly). Best viewed from the Merlion Park.", type: "sightseeing", cost: 0 },
        { time: "8:00 PM", title: "Dinner at Lau Pa Sat Hawker Centre", description: "A Victorian-era cast-iron hawker centre. Best satay in Singapore (Boon Tat Street after 7 PM), plus Hokkien mee and char kway teow.", type: "dining", cost: 600, isVeg: false },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "2:00 PM", title: "Check-in & Neighbourhood Explore", description: "Drop bags at the hotel and wander to nearby Kampong Glam or Chinatown depending on location.", type: "leisure", cost: 0 },
      ],
      evening: [
        { time: "7:00 PM", title: "Clarke Quay Dinner", description: "Riverside dining and drinks. Try chili crab at Jumbo Seafood or go to Chinatown for legendary Liao Fan hawker chicken rice.", type: "dining", cost: 1200, isVeg: false },
      ],
    },
    fullDays: [
      {
        theme: "Culture, Food & Modern Singapore",
        morning: [
          { time: "8:00 AM", title: "Breakfast at Ya Kun Kaya Toast", description: "Singapore's quintessential breakfast: soft-boiled eggs with kaya (coconut jam) toast and thick kopi. Under ₹200 total.", type: "dining", cost: 200, isVeg: true },
          { time: "9:30 AM", title: "Chinatown & Little India Walking Tour", description: "From the ornate Buddha Tooth Relic Temple in Chinatown to the flower garlands and spice shops of Little India's Tekka Market.", type: "culture", cost: 0 },
        ],
        afternoon: [
          { time: "12:00 PM", title: "Lunch at Maxwell Food Centre", description: "Home of the famous Tian Tian Hainanese Chicken Rice (Anthony Bourdain's favourite). Also try oyster omelette and laksa.", type: "dining", cost: 400, isVeg: false },
          { time: "2:00 PM", title: "Cloud Forest & Flower Dome (Gardens by the Bay)", description: "Two climate-controlled conservatories. The Cloud Forest's 35m indoor waterfall is breathtaking. Flower Dome is the world's largest glass greenhouse.", type: "culture", cost: 2800 },
        ],
        evening: [
          { time: "6:00 PM", title: "Marina Bay Sands SkyPark Observation Deck", description: "Go to the top of the iconic 3-tower hotel for 360° views of the Singapore skyline and the infinity pool (observation deck access only).", type: "sightseeing", cost: 2300 },
          { time: "8:00 PM", title: "Dinner at Burnt Ends (1 Michelin Star)", description: "Australia-born chef Dave Pynt's modern BBQ restaurant. Counter seating around the custom wood-fired grill. Book 2 months ahead.", type: "dining", cost: 5000, isVeg: false },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Jewel Changi Airport Visit", description: "Arrive early for the HSBC Rain Vortex — the world's tallest indoor waterfall inside the airport. Shop duty-free and eat at A Noodle Story.", type: "sightseeing", cost: 0 },
        { time: "10:00 AM", title: "MRT to Changi Airport", description: "The airport itself is a destination. MRT takes 30 minutes, or grab a Grab ride (~SGD$20).", type: "transport", cost: 250 },
      ],
    },
  },

  Bali: {
    airportTransfer: { mode: "Pre-booked car from DPS", duration: "45 min", cost: 500 },
    checkInTime: "2:00 PM",
    arrival: {
      afternoon: [
        { time: "2:30 PM", title: "Villa/Hotel Check-in in Seminyak", description: "Settle into your Balinese villa or resort. Many include private pools. The warm tropical air is an instant mood lift.", type: "leisure", cost: 0 },
        { time: "4:30 PM", title: "Seminyak Beach Sunset", description: "Walk to the beach for Bali's legendary sunset. Grab a bean bag at a beach club (La Plancha or Ku De Ta) with a fresh coconut.", type: "leisure", cost: 500 },
      ],
      evening: [
        { time: "7:00 PM", title: "Dinner at Mama San", description: "Asian-fusion dining in a gorgeous converted warehouse. Vietnamese pho, Thai curries, and Indonesian satay on the same table.", type: "dining", cost: 1500, isVeg: false },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "2:00 PM", title: "Check-in & Beach Time", description: "Arrive at your Bali hotel and immediately hit the beach. The Indian Ocean sunsets are unmissable.", type: "leisure", cost: 0 },
      ],
      evening: [
        { time: "7:00 PM", title: "Jimbaran Bay Seafood BBQ", description: "Tables on the sand, fresh-caught seafood grilled over coconut husks, and the sun setting over the bay. Pure Bali magic.", type: "dining", cost: 1200, isVeg: false },
      ],
    },
    fullDays: [
      {
        theme: "Ubud — Rice Terraces, Temples & Monkey Forest",
        morning: [
          { time: "7:00 AM", title: "Drive to Ubud (1.5 hours)", description: "Head inland to Bali's cultural heart. Stop at Tegenungan Waterfall on the way for a swim and photos.", type: "transport", cost: 500 },
          { time: "9:30 AM", title: "Tegallalang Rice Terraces", description: "The iconic cascading rice paddies. Walk among the terraces and swings for photos. Best in morning light before clouds roll in.", type: "sightseeing", cost: 300 },
        ],
        afternoon: [
          { time: "12:00 PM", title: "Lunch at Locavore To", description: "Casual sibling of Bali's top restaurant. Indonesian flavours with local ingredients. Nasi campur and fresh juices.", type: "dining", cost: 800, isVeg: false },
          { time: "2:00 PM", title: "Sacred Monkey Forest Sanctuary", description: "300+ long-tailed macaques in a mossy Hindu temple complex. The ancient banyan trees and stone carvings are magical.", type: "sightseeing", cost: 500 },
          { time: "4:00 PM", title: "Ubud Palace & Art Market", description: "The royal palace (free) and the adjacent traditional art market selling batik, wood carvings, and silver jewellery.", type: "culture", cost: 0 },
        ],
        evening: [
          { time: "6:30 PM", title: "Kecak Fire Dance at Uluwatu Temple", description: "A hypnotic Balinese fire dance performed at sunset on a cliff-edge stage overlooking the Indian Ocean. Unforgettable.", type: "culture", cost: 600 },
          { time: "8:30 PM", title: "Dinner at Single Fin", description: "Clifftop restaurant in Uluwatu with ocean views. Wood-fired pizza, fresh fish tacos, and cold Bintang beer.", type: "dining", cost: 1000, isVeg: false },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Sunrise Yoga & Breakfast", description: "Join a complimentary hotel yoga session, then enjoy a Balinese breakfast: nasi goreng, tropical fruit bowl, and Bali coffee.", type: "leisure", cost: 0 },
        { time: "10:00 AM", title: "Transfer to Ngurah Rai Airport", description: "Pre-booked car to DPS airport (45 min from Seminyak, 25 min from Kuta). Grab last-minute Bali coffee sachets at the airport.", type: "transport", cost: 500 },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EAST ASIA
  // ═══════════════════════════════════════════════════════════════════════════

  Tokyo: {
    airportTransfer: { mode: "Narita Express (N'EX)", duration: "60 min", cost: 2800 },
    checkInTime: "3:00 PM",
    arrival: {
      afternoon: [
        { time: "2:30 PM", title: "Hotel Check-in & Refresh", description: "Check into your hotel in Shinjuku or Shibuya. Grab a famikon (convenience store) onigiri and green tea from 7-Eleven — it's surprisingly amazing.", type: "leisure", cost: 200 },
        { time: "4:00 PM", title: "Shibuya Crossing & Hachiko", description: "The world's busiest pedestrian crossing. Watch from the Starbucks above, then pay respects to the loyal Hachiko statue.", type: "sightseeing", cost: 0 },
      ],
      evening: [
        { time: "6:00 PM", title: "Shinjuku Omoide Yokocho (Memory Lane)", description: "A narrow alley of tiny yakitori stalls unchanged since the 1940s. Grilled chicken skewers, cold sake, and lantern-lit atmosphere.", type: "dining", cost: 2000, isVeg: false },
        { time: "8:30 PM", title: "Golden Gai Bar Hopping", description: "Six narrow alleys with 200+ tiny bars, each seating 6-8 people. Try themed bars: jazz, vinyl records, or cat bars.", type: "culture", cost: 2500 },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "2:00 PM", title: "Check-in & Neighbourhood Walk", description: "Drop bags and explore your Tokyo neighbourhood. Stop at a konbini for Japan's legendary convenience store snacks.", type: "leisure", cost: 500 },
      ],
      evening: [
        { time: "7:00 PM", title: "Ramen at Ichiran Shibuya", description: "Solo-booth ramen dining — customize your tonkotsu broth's richness, spice, noodle firmness. Pure focus on flavour.", type: "dining", cost: 1200, isVeg: false },
      ],
    },
    fullDays: [
      {
        theme: "Traditional Tokyo — Temples, Shrines & Tea",
        morning: [
          { time: "8:00 AM", title: "Tsukiji Outer Market Breakfast", description: "The freshest sushi, tamagoyaki (sweet omelette), and matcha in Tokyo's legendary market area. Arrive early.", type: "dining", cost: 2000, isVeg: false },
          { time: "10:00 AM", title: "Senso-ji Temple & Asakusa", description: "Tokyo's oldest temple (628 AD). Walk through the iconic Kaminari-mon gate, browse Nakamise shopping street.", type: "sightseeing", cost: 0 },
        ],
        afternoon: [
          { time: "12:30 PM", title: "Lunch at Asakusa Imahan (Sukiyaki)", description: "Century-old restaurant famous for premium wagyu sukiyaki. Vegetarian option: tofu sukiyaki set.", type: "dining", cost: 5500, isVeg: false },
          { time: "2:30 PM", title: "Meiji Shrine & Harajuku", description: "Towering torii gate and forested path to Meiji Shrine. Then explore Harajuku's Takeshita Street for pop culture.", type: "culture", cost: 0 },
        ],
        evening: [
          { time: "5:30 PM", title: "Traditional Tea Ceremony", description: "45-minute authentic tea ceremony in Shinjuku. Learn the meditative art of matcha preparation from a certified tea master.", type: "culture", cost: 3500 },
          { time: "8:00 PM", title: "Dinner at Gonpachi (Kill Bill Restaurant)", description: "The Roppongi izakaya that inspired Kill Bill's fight scene. Handmade soba noodles and yakitori skewers.", type: "dining", cost: 4500, isVeg: false },
        ],
      },
      {
        theme: "Modern & Pop Culture Tokyo",
        morning: [
          { time: "9:00 AM", title: "teamLab Borderless", description: "10,000 sq meters of interactive digital art. Infinity mirrors and flowing waterfalls. Sets are constantly changing.", type: "culture", cost: 3200 },
        ],
        afternoon: [
          { time: "12:00 PM", title: "Lunch at Afuri (Yuzu Ramen)", description: "Light, citrusy yuzu shio ramen. Their vegan option is one of Tokyo's best. Modern and refreshing.", type: "dining", cost: 1400, isVeg: true },
          { time: "2:00 PM", title: "Akihabara Electric Town", description: "Neon mecca of anime, manga, retro gaming, and electronics. Multi-story arcades and maid cafés.", type: "sightseeing", cost: 1500 },
          { time: "4:30 PM", title: "Tokyo Skytree Observatory", description: "Japan's tallest structure (634m). 360° views. On clear evenings, Mount Fuji glows at sunset.", type: "sightseeing", cost: 2100 },
        ],
        evening: [
          { time: "7:30 PM", title: "Dinner at Ippudo Ramen (Roppongi)", description: "Legendary ramen institution. Shiromaru Classic with silky pork broth.", type: "dining", cost: 1400, isVeg: false },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Tokyo Station Last-Minute Shopping", description: "100+ shops underground selling bento boxes, Kit-Kats in 20+ flavours, and beautifully packaged omiyage souvenirs.", type: "sightseeing", cost: 0 },
        { time: "10:00 AM", title: "Narita Express to Airport", description: "N'EX from Tokyo Station (60 min). Comfortable reserved seating. Runs every 30 min.", type: "transport", cost: 2800 },
      ],
    },
  },

  Seoul: {
    airportTransfer: { mode: "AREX Express from Incheon", duration: "43 min", cost: 800 },
    checkInTime: "3:00 PM",
    arrival: {
      afternoon: [
        { time: "3:00 PM", title: "Hotel Check-in in Myeongdong", description: "Settle into your hotel in Seoul's most central shopping district. K-beauty shops on every corner.", type: "leisure", cost: 0 },
        { time: "4:30 PM", title: "Myeongdong Street Food & Shopping", description: "Sample Korean street food: hotteok (sweet pancakes), tteokbokki (spicy rice cakes), and egg bread. Browse K-beauty at Innisfree and Olive Young.", type: "sightseeing", cost: 800 },
      ],
      evening: [
        { time: "7:00 PM", title: "Korean BBQ Dinner at Maple Tree House", description: "Premium hanwoo beef grilled at your table. The banchan (side dishes) are unlimited. A must-do Seoul experience.", type: "dining", cost: 3000, isVeg: false },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "2:00 PM", title: "Check-in & Neighbourhood Walk", description: "Drop bags and explore the Insadong area for traditional tea houses and Korean crafts.", type: "leisure", cost: 0 },
      ],
      evening: [
        { time: "7:00 PM", title: "Neon-lit Dinner in Hongdae", description: "Seoul's university/nightlife district. Korean fried chicken and beer (chimaek) at a 24-hour eatery. Vibrant street performers.", type: "dining", cost: 1500, isVeg: false },
      ],
    },
    fullDays: [
      {
        theme: "Palaces, Markets & K-Culture",
        morning: [
          { time: "8:30 AM", title: "Gyeongbokgung Palace & Guard Ceremony", description: "Seoul's grandest palace (1395). The Royal Guard Ceremony at 10 AM is a colourful photo opportunity. Rent a hanbok for free entry.", type: "culture", cost: 300 },
          { time: "10:30 AM", title: "Bukchon Hanok Village", description: "600-year-old traditional Korean houses on narrow hillside streets. A living museum between two palaces.", type: "sightseeing", cost: 0 },
        ],
        afternoon: [
          { time: "12:00 PM", title: "Lunch at Gwangjang Market", description: "Seoul's oldest market. Try bindaetteok (mung bean pancakes), japchae, and kalguksu (knife-cut noodles). Under ₹500 total.", type: "dining", cost: 500, isVeg: false },
          { time: "2:30 PM", title: "N Seoul Tower & Namsan Park", description: "Cable car or hike to the iconic tower. Lock a love padlock on the fence and enjoy panoramic views of the sprawling city below.", type: "sightseeing", cost: 1000 },
        ],
        evening: [
          { time: "6:00 PM", title: "Jimjilbang (Korean Spa)", description: "Dragon Hill Spa: 7 floors of hot pools, saunas, ice rooms, and a rooftop pool. Wear the provided pyjamas and nap on heated floors. Uniquely Korean.", type: "leisure", cost: 1200 },
          { time: "9:00 PM", title: "Dinner at Jungsik (2 Michelin Stars)", description: "Modern Korean fine dining that reimagines traditional dishes. The bibimbap is deconstructed art on a plate.", type: "dining", cost: 8000, isVeg: false },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Breakfast & K-Beauty Shopping", description: "Hotel breakfast, then raid Olive Young for sheet masks, serums, and sunscreens — Korea's best souvenirs.", type: "dining", cost: 500, isVeg: true },
        { time: "10:00 AM", title: "AREX Express to Incheon Airport", description: "Express train from Seoul Station (43 min). Incheon Airport has excellent duty-free and a spa.", type: "transport", cost: 800 },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MIDDLE EAST
  // ═══════════════════════════════════════════════════════════════════════════

  Dubai: {
    airportTransfer: { mode: "Metro Red Line from DXB", duration: "30 min", cost: 300 },
    checkInTime: "2:00 PM",
    arrival: {
      afternoon: [
        { time: "2:00 PM", title: "Hotel Check-in", description: "Check into your hotel in Downtown Dubai or Marina. Many hotels offer stunning Burj Khalifa views.", type: "leisure", cost: 0 },
        { time: "4:00 PM", title: "Dubai Mall & Aquarium", description: "The world's largest mall. Walk past the 10-million-litre aquarium (free from outside), browse 1,200+ shops, or just people-watch.", type: "sightseeing", cost: 0 },
      ],
      evening: [
        { time: "6:00 PM", title: "Burj Khalifa At the Top (Level 124)", description: "Ascend the world's tallest building for sunset views. The city transforms from golden dusk to glittering nightscape. Pre-book.", type: "sightseeing", cost: 1500 },
        { time: "8:00 PM", title: "Dubai Fountain Show & Dinner", description: "Watch the world's largest choreographed fountain (every 30 min after 6 PM). Dine at one of the lakeside restaurants — Zuma, or budget-friendly Baker & Spice.", type: "dining", cost: 2500, isVeg: false },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "2:00 PM", title: "Check-in & Rest", description: "Arrive at your Dubai hotel and freshen up. The air-conditioning is a welcome relief.", type: "leisure", cost: 0 },
      ],
      evening: [
        { time: "7:00 PM", title: "JBR Beach Walk & Dinner", description: "Walk along the beach promenade at Jumeirah Beach Residence. Street food, shops, and views of the Ain Dubai ferris wheel.", type: "dining", cost: 1500, isVeg: false },
      ],
    },
    fullDays: [
      {
        theme: "Desert Safari, Old Dubai & Gold Souk",
        morning: [
          { time: "8:00 AM", title: "Old Dubai — Creek & Heritage Quarter", description: "Take an abra (water taxi, ₹15) across Dubai Creek. Explore Al Fahidi Historical Neighbourhood's wind-tower houses and art galleries.", type: "culture", cost: 100 },
          { time: "10:00 AM", title: "Gold Souk & Spice Souk", description: "Walk through the dazzling Gold Souk in Deira — tonnes of gold on display. The nearby Spice Souk has saffron, frankincense, and oud.", type: "sightseeing", cost: 0 },
        ],
        afternoon: [
          { time: "12:00 PM", title: "Lunch at Al Ustad Special Kabab", description: "A tiny Iranian restaurant in Bur Dubai. The kebabs have been served the same way since 1978. Budget-friendly and delicious.", type: "dining", cost: 800, isVeg: false },
          { time: "3:30 PM", title: "Desert Safari Pickup", description: "Picked up from hotel for the evening desert safari. 4x4 dune bashing, camel rides, sandboarding, and a BBQ dinner under the stars.", type: "sightseeing", cost: 5000 },
        ],
        evening: [
          { time: "7:00 PM", title: "Desert Camp BBQ & Entertainment", description: "Arabic BBQ dinner with belly dancing, tanoura spinning, and henna painting in a Bedouin-style camp. Shisha available.", type: "dining", cost: 0 },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Breakfast & Last-Minute Shopping", description: "Hotel breakfast. Visit Dubai Mall for duty-free purchases or pick up dates, Arabic sweets, and oud perfume at the airport.", type: "dining", cost: 500, isVeg: true },
        { time: "10:00 AM", title: "Transfer to Dubai International Airport", description: "Metro Red Line (30 min, ₹300) or taxi (~₹1,000). DXB Terminal 3 duty-free is excellent.", type: "transport", cost: 300 },
      ],
    },
  },

  "Abu Dhabi": {
    airportTransfer: { mode: "Taxi from AUH", duration: "25 min", cost: 600 },
    checkInTime: "3:00 PM",
    arrival: {
      afternoon: [
        { time: "3:00 PM", title: "Hotel Check-in", description: "Check into your hotel on Saadiyat Island or the Corniche. Abu Dhabi is calmer and more cultural than Dubai.", type: "leisure", cost: 0 },
        { time: "4:30 PM", title: "Corniche Beach Walk", description: "Walk or cycle along the 8km waterfront Corniche. Views of the turquoise Arabian Gulf and the city skyline. Free public beach.", type: "leisure", cost: 0 },
      ],
      evening: [
        { time: "7:00 PM", title: "Dinner at Li Beirut", description: "Stunning Lebanese restaurant at the Jumeirah at Etihad Towers. Views, mezze, grilled meats, and shisha on the terrace.", type: "dining", cost: 2500, isVeg: false },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "2:00 PM", title: "Check-in & Corniche Walk", description: "Quick check-in and stroll along Abu Dhabi's waterfront.", type: "leisure", cost: 0 },
      ],
      evening: [
        { time: "7:00 PM", title: "Yas Marina Circuit Area Dining", description: "Dine near the F1 circuit with views of the illuminated track. Try Cipriani Yas Island for Italian or Yas Hub for casual eats.", type: "dining", cost: 2000, isVeg: false },
      ],
    },
    fullDays: [
      {
        theme: "Grand Mosque, Louvre & Culture Capital",
        morning: [
          { time: "8:00 AM", title: "Sheikh Zayed Grand Mosque", description: "The most visited mosque in the UAE. 82 marble domes, the world's largest hand-knotted carpet, and 7 crystal chandeliers from Swarovski. Free entry.", type: "culture", cost: 0 },
        ],
        afternoon: [
          { time: "11:30 AM", title: "Louvre Abu Dhabi", description: "Jean Nouvel's stunning 'rain of light' dome houses 600+ artworks spanning the entire history of humanity. Da Vinci, Monet, Egyptian antiquities.", type: "culture", cost: 1200 },
          { time: "2:00 PM", title: "Lunch at Saadiyat Beach Club", description: "Beachfront dining with views of the turquoise sea. Fresh seafood, Mediterranean salads, and a stunning infinity pool.", type: "dining", cost: 1800, isVeg: false },
          { time: "4:00 PM", title: "Emirates Palace & Gold Cappuccino", description: "The iconic palace hotel. Visit the mandarin-shaped gold leaf cappuccino at Le Café (₹1,800). The grandeur rivals Versailles.", type: "leisure", cost: 1800 },
        ],
        evening: [
          { time: "7:00 PM", title: "Sheikh Zayed Mosque After Dark", description: "Return to see the mosque illuminated — it reflects the lunar cycle, changing colour from white to blue. Truly spectacular at night.", type: "sightseeing", cost: 0 },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Breakfast & Checkout", description: "Hotel breakfast. Last photos at the Corniche. Abu Dhabi's airport is modern and efficient.", type: "dining", cost: 500, isVeg: true },
        { time: "10:00 AM", title: "Transfer to Abu Dhabi Airport", description: "Taxi (25 min, ~₹600). The new Midfield Terminal is architecturally stunning.", type: "transport", cost: 600 },
      ],
    },
  },
};

// ─── Fallback Generator ──────────────────────────────────────────────────────
// For cities not in the database, generate basic but non-generic activities

function generateFallbackActivities(cityName: string): CityActivityData {
  return {
    airportTransfer: { mode: `Taxi/shuttle from airport`, duration: "30-45 min", cost: 1500 },
    checkInTime: "2:00 PM",
    arrival: {
      afternoon: [
        { time: "2:30 PM", title: "Hotel Check-in & Freshen Up", description: `Settle into your hotel in central ${cityName}. Take some time to rest and refresh after the journey.`, type: "leisure", cost: 0 },
        { time: "4:00 PM", title: `${cityName} Old Town Walk`, description: `Explore the historic centre of ${cityName}. Walk through the main square, admire the architecture, and get your bearings.`, type: "sightseeing", cost: 0 },
      ],
      evening: [
        { time: "7:00 PM", title: "Welcome Dinner", description: `Try the local specialities at a top-rated restaurant in ${cityName}. Ask the concierge for the best neighbourhood recommendation.`, type: "dining", cost: 2500, isVeg: false },
      ],
    },
    transitArrival: {
      afternoon: [
        { time: "2:30 PM", title: "Check-in & Neighbourhood Walk", description: `Drop luggage and explore the streets around your hotel in ${cityName}.`, type: "leisure", cost: 0 },
      ],
      evening: [
        { time: "7:00 PM", title: "Local Dinner", description: `Discover ${cityName}'s food scene at a restaurant recommended by locals.`, type: "dining", cost: 2000, isVeg: false },
      ],
    },
    fullDays: [
      {
        theme: `Exploring ${cityName} — Top Attractions`,
        morning: [
          { time: "9:00 AM", title: "Breakfast at Local Café", description: `Start the day at a popular café. Try the local breakfast speciality.`, type: "dining", cost: 1000, isVeg: true },
          { time: "10:30 AM", title: `Visit ${cityName}'s Top Attraction`, description: `Explore the #1-rated attraction on TripAdvisor. Book skip-the-line tickets in advance.`, type: "sightseeing", cost: 2000 },
        ],
        afternoon: [
          { time: "12:30 PM", title: "Local Lunch", description: `Sample authentic local cuisine at a highly-rated restaurant.`, type: "dining", cost: 1500, isVeg: false },
          { time: "2:30 PM", title: "Museum or Cultural Experience", description: `Visit the premier museum or join a cultural walking tour of the historic district.`, type: "culture", cost: 1500 },
        ],
        evening: [
          { time: "7:00 PM", title: "Evening Experience", description: `Enjoy ${cityName}'s evening scene — a food tour, night market, or rooftop bar.`, type: "culture", cost: 2500 },
        ],
      },
      {
        theme: `${cityName} — Hidden Gems & Local Life`,
        morning: [
          { time: "9:00 AM", title: "Markets & Local Neighbourhood", description: `Explore the morning markets and residential streets for a taste of everyday life in ${cityName}.`, type: "sightseeing", cost: 500 },
          { time: "11:00 AM", title: "Second Major Attraction", description: `Visit another top-rated site — castle, palace, temple, or viewpoint.`, type: "culture", cost: 1500 },
        ],
        afternoon: [
          { time: "1:00 PM", title: "Lunch at Locals' Favourite", description: `Eat where the locals eat. Ask your hotel for off-the-beaten-path recommendations.`, type: "dining", cost: 1200, isVeg: false },
          { time: "3:00 PM", title: "Free Afternoon — Explore or Relax", description: `Wander freely, shop for souvenirs, or relax at a local park/café.`, type: "leisure", cost: 0 },
        ],
        evening: [
          { time: "7:30 PM", title: "Special Farewell Dinner", description: `Book a memorable dinner at one of ${cityName}'s finest restaurants for your last evening.`, type: "dining", cost: 3000, isVeg: false },
        ],
      },
    ],
    departure: {
      morning: [
        { time: "8:00 AM", title: "Breakfast & Checkout", description: `Light breakfast at the hotel. Pack your bags and pick up any last souvenirs nearby.`, type: "dining", cost: 500, isVeg: true },
        { time: "10:00 AM", title: "Transfer to Airport", description: `Taxi or shuttle to the airport. Arrive 3 hours before international flights.`, type: "transport", cost: 1500 },
      ],
    },
  };
}

// ─── Export ──────────────────────────────────────────────────────────────────

export function getCityActivities(cityName: string): CityActivityData {
  return db[cityName] || generateFallbackActivities(cityName);
}

export { db as cityActivitiesDB };
