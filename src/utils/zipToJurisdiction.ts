import usStates from '../data/usStates';
import type { States } from '../components/JurisdictionSelector';

export async function getJurisdictionFromZip(zip: string): Promise<States | null> {
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!res.ok) return null;
  const data = await res.json();
  const abbr: string = data.places[0]['state abbreviation'];
  return (usStates.find(s => s.abbreviation === abbr) as States) ?? null;
}
