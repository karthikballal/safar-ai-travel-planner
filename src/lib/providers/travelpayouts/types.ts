// ─── Travelpayouts Data API Types ─────────────────────────────────────────

export interface TravelpayoutsPrice {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string | null;
  price: number;
  airline: string;
  flightNumber: string;
  transfers: number;
  foundAt: string;
  currency: string;
}

export interface TravelpayoutsCalendarEntry {
  departDate: string;
  returnDate: string;
  origin: string;
  destination: string;
  price: number;
  transfers: number;
  airline: string;
  flightNumber: number;
}

export interface TravelpayoutsPopularRoute {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  price: number;
  transfers: number;
  airline: string;
}
