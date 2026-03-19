// ─── Geolocation → Nearest International Airport ─────────────────────────────
// Uses the browser Geolocation API to detect the user's current location,
// then maps it to the nearest Indian international airport city.

"use client";

import { useState, useEffect } from "react";

interface AirportInfo {
  city: string;
  code: string;
  lat: number;
  lon: number;
}

// All Indian international airports with coordinates
const indianIntlAirports: AirportInfo[] = [
  { city: "Mumbai", code: "BOM", lat: 19.0896, lon: 72.8656 },
  { city: "Delhi", code: "DEL", lat: 28.5562, lon: 77.1000 },
  { city: "Bengaluru", code: "BLR", lat: 13.1986, lon: 77.7066 },
  { city: "Chennai", code: "MAA", lat: 12.9941, lon: 80.1709 },
  { city: "Kolkata", code: "CCU", lat: 22.6547, lon: 88.4467 },
  { city: "Hyderabad", code: "HYD", lat: 17.2403, lon: 78.4294 },
  { city: "Kochi", code: "COK", lat: 10.1520, lon: 76.4019 },
  { city: "Ahmedabad", code: "AMD", lat: 23.0772, lon: 72.6347 },
  { city: "Pune", code: "PNQ", lat: 18.5822, lon: 73.9197 },
  { city: "Goa", code: "GOI", lat: 15.3808, lon: 73.8314 },
  { city: "Jaipur", code: "JAI", lat: 26.8242, lon: 75.8122 },
  { city: "Thiruvananthapuram", code: "TRV", lat: 8.4821, lon: 76.9199 },
  { city: "Lucknow", code: "LKO", lat: 26.7606, lon: 80.8893 },
  { city: "Chandigarh", code: "IXC", lat: 30.6735, lon: 76.7885 },
  { city: "Coimbatore", code: "CJB", lat: 11.0300, lon: 77.0437 },
  { city: "Mangalore", code: "IXE", lat: 12.9613, lon: 74.8900 },
  { city: "Amritsar", code: "ATQ", lat: 31.7096, lon: 74.7973 },
  { city: "Varanasi", code: "VNS", lat: 25.4515, lon: 82.8593 },
  { city: "Nagpur", code: "NAG", lat: 21.0922, lon: 79.0472 },
  { city: "Calicut", code: "CCJ", lat: 11.1368, lon: 75.9553 },
  { city: "Bhubaneswar", code: "BBI", lat: 20.2444, lon: 85.8178 },
  { city: "Indore", code: "IDR", lat: 22.7218, lon: 75.8011 },
  { city: "Patna", code: "PAT", lat: 25.5913, lon: 85.0880 },
  { city: "Srinagar", code: "SXR", lat: 33.9871, lon: 74.7742 },
];

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestAirport(lat: number, lon: number): AirportInfo {
  let nearest = indianIntlAirports[0];
  let minDist = Infinity;

  for (const airport of indianIntlAirports) {
    const dist = haversine(lat, lon, airport.lat, airport.lon);
    if (dist < minDist) {
      minDist = dist;
      nearest = airport;
    }
  }

  return nearest;
}

export interface GeoLocation {
  city: string;
  airportCode: string;
  isDetecting: boolean;
  error: string | null;
}

export function useGeolocation(): GeoLocation & { detect: () => void } {
  const [state, setState] = useState<GeoLocation>({
    city: "",
    airportCode: "",
    isDetecting: false,
    error: null,
  });

  const detect = () => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation not supported" }));
      return;
    }

    setState((s) => ({ ...s, isDetecting: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const airport = findNearestAirport(latitude, longitude);
        setState({
          city: airport.city,
          airportCode: airport.code,
          isDetecting: false,
          error: null,
        });
      },
      (err) => {
        // Fallback: try IP-based geolocation
        fetchIPLocation().then((result) => {
          if (result) {
            setState({
              city: result.city,
              airportCode: result.airportCode,
              isDetecting: false,
              error: null,
            });
          } else {
            setState({
              city: "",
              airportCode: "",
              isDetecting: false,
              error: err.message || "Location access denied",
            });
          }
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000, // Cache for 5 min
      }
    );
  };

  // Auto-detect on mount
  useEffect(() => {
    detect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, detect };
}

// IP-based fallback using free ipapi.co
async function fetchIPLocation(): Promise<{ city: string; airportCode: string } | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();

    if (data.latitude && data.longitude) {
      const airport = findNearestAirport(data.latitude, data.longitude);
      return { city: airport.city, airportCode: airport.code };
    }

    // Try matching city name directly
    const cityKey = (data.city || "").toLowerCase();
    const match = indianIntlAirports.find(
      (a) => a.city.toLowerCase() === cityKey
    );
    if (match) return { city: match.city, airportCode: match.code };

    return null;
  } catch {
    return null;
  }
}

// Export for direct use
export { findNearestAirport, indianIntlAirports };
