// AI Agent System — Simulates a multi-agent architecture where each agent
// specialises in a specific travel-planning domain. In production, each agent
// would hit real APIs (Amadeus, Booking, Google Places, embassy sites, etc.).
// For the MVP we simulate latency & return curated mock intelligence.

export interface AgentTask {
  id: string;
  agentName: string;
  agentRole: string;
  icon: string;
  color: string;
  status: "pending" | "running" | "done" | "error";
  progress: number; // 0-100
  steps: string[];
  currentStepIndex: number;
  result?: string;
  sources?: string[];
}

// ---------- Budget Intelligence ----------

export interface BudgetEstimate {
  minimum: number;   // bare-bones backpacker
  comfortable: number; // mid-range
  premium: number;     // luxury
  currency: string;
}

// Per-person, per-night baseline budgets (INR) for popular destinations
const destinationBudgets: Record<string, BudgetEstimate> = {
  paris:       { minimum: 18000, comfortable: 35000, premium: 65000, currency: "INR" },
  london:      { minimum: 20000, comfortable: 38000, premium: 70000, currency: "INR" },
  tokyo:       { minimum: 14000, comfortable: 28000, premium: 55000, currency: "INR" },
  new_york:    { minimum: 22000, comfortable: 40000, premium: 75000, currency: "INR" },
  dubai:       { minimum: 12000, comfortable: 25000, premium: 50000, currency: "INR" },
  bali:        { minimum: 5000,  comfortable: 12000, premium: 28000, currency: "INR" },
  singapore:   { minimum: 14000, comfortable: 26000, premium: 48000, currency: "INR" },
  rome:        { minimum: 15000, comfortable: 30000, premium: 58000, currency: "INR" },
  bangkok:     { minimum: 4000,  comfortable: 9000,  premium: 22000, currency: "INR" },
  maldives:    { minimum: 20000, comfortable: 45000, premium: 90000, currency: "INR" },
  switzerland: { minimum: 22000, comfortable: 42000, premium: 80000, currency: "INR" },
  iceland:     { minimum: 24000, comfortable: 45000, premium: 85000, currency: "INR" },
  greece:      { minimum: 12000, comfortable: 25000, premium: 50000, currency: "INR" },
  vietnam:     { minimum: 3500,  comfortable: 8000,  premium: 18000, currency: "INR" },
  australia:   { minimum: 18000, comfortable: 35000, premium: 65000, currency: "INR" },
  brazil:      { minimum: 10000, comfortable: 22000, premium: 45000, currency: "INR" },
  morocco:     { minimum: 6000,  comfortable: 14000, premium: 30000, currency: "INR" },
  japan:       { minimum: 14000, comfortable: 28000, premium: 55000, currency: "INR" },
  spain:       { minimum: 12000, comfortable: 26000, premium: 52000, currency: "INR" },
  portugal:    { minimum: 10000, comfortable: 22000, premium: 45000, currency: "INR" },
};

// Normalise the user's destination input and match against known budgets
function normaliseKey(dest: string): string {
  return dest
    .toLowerCase()
    .replace(/[^a-z]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export function getDestinationBudget(
  destination: string,
  nights: number,
  travelers: number
): { estimate: BudgetEstimate; totalMinimum: number; totalComfortable: number; totalPremium: number; known: boolean } {
  const key = normaliseKey(destination);
  const match = Object.entries(destinationBudgets).find(
    ([k]) => key.includes(k) || k.includes(key)
  );

  const estimate: BudgetEstimate = match
    ? match[1]
    : { minimum: 12000, comfortable: 25000, premium: 50000, currency: "INR" };

  return {
    estimate,
    totalMinimum: estimate.minimum * nights * travelers,
    totalComfortable: estimate.comfortable * nights * travelers,
    totalPremium: estimate.premium * nights * travelers,
    known: !!match,
  };
}

export function isBudgetUnrealistic(
  budget: number,
  destination: string,
  nights: number,
  travelers: number
): { unrealistic: boolean; suggestion: number; message: string } {
  const { totalMinimum, totalComfortable } = getDestinationBudget(
    destination,
    nights,
    travelers
  );

  if (budget < totalMinimum) {
    return {
      unrealistic: true,
      suggestion: totalComfortable,
      message: `For ${travelers} traveler${travelers > 1 ? "s" : ""} spending ${nights} nights in ${destination}, the minimum realistic budget is ₹${totalMinimum.toLocaleString("en-IN")}. We recommend at least ₹${totalComfortable.toLocaleString("en-IN")} for a comfortable trip.`,
    };
  }
  return { unrealistic: false, suggestion: budget, message: "" };
}

// ---------- Agent Definitions ----------

export function createAgentTasks(destination: string): AgentTask[] {
  const dest = destination.charAt(0).toUpperCase() + destination.slice(1);
  const today = new Date();
  const monthName = today.toLocaleString("en-US", { month: "long" });
  
  return [
    {
      id: "flight-agent",
      agentName: "Flight Intelligence",
      agentRole: "AI Route & Pricing Analyst",
      icon: "✈️",
      color: "text-blue-400",
      status: "pending",
      progress: 0,
      currentStepIndex: 0,
      steps: [
        `Analyzing ${monthName} flight routes: India → ${dest} — checking direct & 1-stop options`,
        `Querying Gemini AI for real airline schedules on this route pair...`,
        `Processing seasonal pricing data — ${monthName} demand curves & advance purchase discounts`,
        `Identified 5+ airlines for this route. Comparing economy, premium & business fares`,
        `Cross-referencing: day-of-week pricing (Tues cheapest), holiday surcharges, fuel fees`,
        `Generating aggregator comparison links: MakeMyTrip, Skyscanner, Google Flights, Kayak`,
        `Building return flight options with realistic layover routing through major hubs`,
        `Flight research complete — ${dest} routes mapped with price-optimized options ✓`,
      ],
      sources: ["Gemini AI", "Google Flights", "Skyscanner", "MakeMyTrip"],
    },
    {
      id: "hotel-agent",
      agentName: "Hotel Researcher",
      agentRole: "AI Accommodation Analyst",
      icon: "🏨",
      color: "text-purple-400",
      status: "pending",
      progress: 0,
      currentStepIndex: 0,
      steps: [
        `Researching accommodations in ${dest} — analyzing location, ratings & prices`,
        `Querying Gemini AI for hotel knowledge: budget hostels to luxury properties...`,
        `Comparing per-platform prices: Booking.com vs Agoda vs MakeMyTrip vs Goibibo`,
        `Filtering: 4★+ rating, central location, free cancellation, breakfast options`,
        `Analyzing 3 tiers: Budget (₹4-6K), Mid-Range (₹8-12K), Luxury (₹18K+) per night`,
        `Generating booking links for each platform with estimated prices`,
        `Identifying cheapest platform for each hotel — savings of 5-20% between sites`,
        `Hotel dossier complete — multi-platform price comparison ready ✓`,
      ],
      sources: ["Gemini AI", "Booking.com", "Agoda", "MakeMyTrip", "Goibibo"],
    },
    {
      id: "dining-agent",
      agentName: "Restaurant Finder",
      agentRole: "AI Culinary Analyst",
      icon: "🍽️",
      color: "text-amber-400",
      status: "pending",
      progress: 0,
      currentStepIndex: 0,
      steps: [
        `Researching dining in ${dest} — Indian-friendly & vegetarian restaurants`,
        `Querying Gemini AI for restaurant knowledge within walkable distance...`,
        `Filtering by cuisine: Indian, vegetarian, vegan, halal options near attractions`,
        `Cross-referencing Google Maps data for ratings, hours & price bands`,
        `Building meal plans: 3 meals/day optimized by location & sightseeing schedule`,
        `Identifying Indian restaurants: Saravanaa Bhavan, local desi spots, veg-friendly chains`,
        `Mapping Google Maps links for each restaurant with directions`,
        `Restaurant guide complete — daily dining plan with Indian options built ✓`,
      ],
      sources: ["Gemini AI", "Google Maps", "Zomato", "TripAdvisor"],
    },
    {
      id: "activity-agent",
      agentName: "Experiences Curator",
      agentRole: "AI Attractions & Activities Expert",
      icon: "🗺️",
      color: "text-teal-400",
      status: "pending",
      progress: 0,
      currentStepIndex: 0,
      steps: [
        `Discovering top attractions in ${dest} — ONLY real, named places with exact locations`,
        `Querying Gemini AI for landmark-level specifics: names, neighborhoods, entry fees...`,
        `Analyzing: museums, temples, markets, viewpoints, food streets — each with Google Maps link`,
        `Building day-by-day itinerary with route optimization between attractions`,
        `Validating entry fees: converting local currency to INR for ${monthName} pricing`,
        `Generating booking links via Viator, GetYourGuide & direct official sites`,
        `Adding practical tips: best visiting hours, crowd levels, transport to each site`,
        `Activities mapped — every place verified with real names & Google Maps locations ✓`,
      ],
      sources: ["Gemini AI", "Google Maps", "Viator", "GetYourGuide"],
    },
    {
      id: "visa-agent",
      agentName: "Visa Intelligence",
      agentRole: "Documentation & Requirements Expert",
      icon: "📋",
      color: "text-red-400",
      status: "pending",
      progress: 0,
      currentStepIndex: 0,
      steps: [
        `Checking visa requirements: Indian passport → ${dest} entry regulations`,
        `Querying Gemini AI for latest visa policy, processing times & biometric needs`,
        `Analyzing: tourist visa type, validity, max stay, re-entry rules`,
        `Compiling document checklist: passport, photos, bank statements, ITR, cover letter`,
        `Checking VFS Global & embassy appointment availability in major Indian cities`,
        `Computing optimal application timeline based on your travel dates`,
        `Visa package ready — complete checklist, timeline & application steps ✓`,
      ],
      sources: ["Gemini AI", "VFS Global", "MEA India"],
    },
    {
      id: "deal-agent",
      agentName: "Price Optimizer",
      agentRole: "AI Savings & Deal Finder",
      icon: "💰",
      color: "text-emerald-400",
      status: "pending",
      progress: 0,
      currentStepIndex: 0,
      steps: [
        `Scanning for ${dest} travel deals — comparing 12+ Indian booking platforms`,
        `Analyzing: MakeMyTrip Super Saver, Goibibo Go+, Cleartrip FlexiFare offers`,
        `Checking credit card portal deals: HDFC SmartBuy, ICICI Amazon Pay, SBI offers`,
        `Calculating bundle savings: flight + hotel combos vs separate booking`,
        `Factoring forex rates, travel insurance, airport lounge access costs`,
        `Generating deep links to each platform's best price for your exact dates`,
        `Budget optimization complete — identified 15-20% savings vs standard booking ✓`,
      ],
      sources: ["Gemini AI", "MakeMyTrip", "Goibibo", "Cleartrip", "EaseMyTrip"],
    },
    {
      id: "transport-agent",
      agentName: "Ground Transport",
      agentRole: "AI Local Transit Planner",
      icon: "🚇",
      color: "text-cyan-400",
      status: "pending",
      progress: 0,
      currentStepIndex: 0,
      steps: [
        `Mapping local transport in ${dest} — metro, bus, taxi & walking routes`,
        `Analyzing: airport transfer options, day passes, multi-city train connections`,
        `Calculating: transit pass vs Uber vs walking for your specific itinerary`,
        `Checking inter-city transport if multi-city: high-speed rail, budget flights, buses`,
        `Querying Rome2Rio & Google Maps for optimal route between hotel and attractions`,
        `Local transport plan complete — most cost-effective routes mapped ✓`,
      ],
      sources: ["Gemini AI", "Google Maps", "Rome2Rio"],
    },
  ];
}

// Simulate agent execution — agents run in waves (some parallel) for realism.
// Wave 1: Flight + Hotel + Visa (independent research, can run simultaneously)
// Wave 2: Dining + Activities (depend on hotel location)
// Wave 3: Transport + DealHunter (depend on all above)
export function simulateAgentExecution(
  tasks: AgentTask[],
  onUpdate: (tasks: AgentTask[]) => void,
  onComplete: () => void
): () => void {
  let cancelled = false;
  const updated = tasks.map((t) => ({ ...t }));

  // Define execution waves — agents in same wave run in parallel
  const waves: string[][] = [
    ["flight-agent", "hotel-agent", "visa-agent"],        // Wave 1: Independent research
    ["dining-agent", "activity-agent"],                    // Wave 2: Location-dependent
    ["transport-agent", "deal-agent"],                     // Wave 3: Final optimization
  ];

  const runAgent = (agent: AgentTask): Promise<void> => {
    return new Promise((resolve) => {
      if (cancelled) { resolve(); return; }

      agent.status = "running";
      agent.progress = 0;
      agent.currentStepIndex = 0;
      onUpdate([...updated]);

      let stepIdx = 0;
      const totalSteps = agent.steps.length;
      // Vary speed per agent — "thinking" steps are slower, "action" steps faster
      const getStepDelay = (idx: number): number => {
        const step = agent.steps[idx] || "";
        if (step.startsWith("Thinking:")) return 900 + Math.random() * 400;  // Slower for thinking
        if (step.includes("Decision:") || step.includes("Complete")) return 600;
        return 500 + Math.random() * 300;  // Normal speed
      };

      const advanceStep = () => {
        if (cancelled) { resolve(); return; }

        stepIdx++;
        if (stepIdx >= totalSteps) {
          agent.progress = 100;
          agent.status = "done";
          agent.currentStepIndex = totalSteps - 1;
          agent.result = agent.steps[totalSteps - 1];
          onUpdate([...updated]);
          resolve();
          return;
        }

        agent.currentStepIndex = stepIdx;
        agent.progress = Math.round((stepIdx / (totalSteps - 1)) * 100);
        onUpdate([...updated]);
        setTimeout(advanceStep, getStepDelay(stepIdx));
      };

      setTimeout(advanceStep, getStepDelay(0));
    });
  };

  const runWaves = async () => {
    for (const wave of waves) {
      if (cancelled) return;

      // Find agents in this wave
      const waveAgents = wave
        .map(id => updated.find(t => t.id === id))
        .filter((a): a is AgentTask => !!a);

      // Run all agents in this wave in parallel
      await Promise.all(waveAgents.map(agent => runAgent(agent)));

      // Brief pause between waves
      if (!cancelled) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    if (!cancelled) onComplete();
  };

  runWaves();

  return () => {
    cancelled = true;
  };
}
