import usStates from '../data/usStates';
import type { States } from '../components/JurisdictionSelector';

// Session-level cache: zip string → resolved States object (including coords).
// Zip→coords is a stable, deterministic mapping so no TTL is needed.
const zipCache = new Map<string, States>();

export async function getJurisdictionFromZip(zip: string): Promise<States | null> {
  if (zipCache.has(zip)) return zipCache.get(zip)!;

  // Without a timeout a slow or down zippopotam leaves "Find Bills" spinning
  // forever. An abort is reported as "not found" so the caller's existing
  // user-facing error covers both cases.
  let res: Response;
  try {
    res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const place = data?.places?.[0];
  if (!place) return null;
  const abbr: string = place['state abbreviation'];
  const match = usStates.find(s => s.abbreviation === abbr) as States | undefined;
  if (!match) return null;
  const result: States = {
    ...match,
    zipCoords: {
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude),
    },
  };
  zipCache.set(zip, result);
  return result;
}

/**
 * Accepts a zip code, 2-letter abbreviation, or full state name.
 * Returns the matching States object, or throws for unrecognised input.
 */
export async function parseLocationInput(input: string): Promise<States> {
  const trimmed = input.trim();

  // 5-digit zip
  if (/^\d{5}$/.test(trimmed)) {
    const state = await getJurisdictionFromZip(trimmed);
    if (!state) throw new Error('Zip code not found. Please try again.');
    return state;
  }

  // State abbreviation (2 letters) or full state name
  const lower = trimmed.toLowerCase();
  const match = usStates.find(
    s => s.abbreviation.toLowerCase() === lower || s.name.toLowerCase() === lower
  ) as States | undefined;

  if (match) return match;

  throw new Error('Please enter a valid Zip Code or State name.');
}
