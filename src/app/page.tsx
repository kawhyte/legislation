import type { Metadata } from 'next';
import { headers } from 'next/headers';
import HomePageView from '@/views/HomePageView';
import usStates from '@/data/usStates';

export const metadata: Metadata = {
  title: 'Billhound — Legislation That Matters',
  description: 'Track the bills that affect you, explained in plain English. Pick your state to see what your legislature is working on right now.',
};

export default async function Page() {
  const h = await headers();
  // Vercel injects these on every request in production. Absent in `next dev`
  // and on any non-Vercel host — the app must work identically without them.
  const country = h.get('x-vercel-ip-country');
  const region = h.get('x-vercel-ip-country-region'); // e.g. "FL"
  // `x-vercel-ip-country-region` is populated for other countries too, so a
  // Canadian "ON" or a German "BE" would otherwise be read as a US state.
  // The usStates lookup is the second guard.
  const geoStateAbbr =
    country === 'US' && region && usStates.some(s => s.abbreviation === region)
      ? region
      : null;

  return <HomePageView geoStateAbbr={geoStateAbbr} />;
}
