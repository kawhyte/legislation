import usStates from '../data/usStates';
import type { States } from '../components/JurisdictionSelector';

export async function getJurisdictionFromZip(zip: string): Promise<States | null> {
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!res.ok) return null;
  const data = await res.json();
  const abbr: string = data.places[0]['state abbreviation'];
  return (usStates.find(s => s.abbreviation === abbr) as States) ?? null;
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
