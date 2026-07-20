import type { Bill } from '@/types';

/**
 * Server-only direct OpenStates fetch for single-bill lookups.
 * Used exclusively from Server Components (e.g. src/app/bill/[id]/page.tsx) —
 * NEVER import this from a 'use client' file, since it reads OPENSTATES_API_KEY.
 */
export async function fetchBillById(billId: string): Promise<Bill | null> {
  const url = `https://v3.openstates.org/bills/${encodeURIComponent(billId)}?include=actions&include=sources&include=abstracts&include=votes&include=sponsorships`;

  const res = await fetch(url, {
    headers: { 'X-API-KEY': process.env.OPENSTATES_API_KEY ?? '' },
    next: { revalidate: 600 }, // matches the 'bills' TTL from PLAN-03
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    console.error(`[openstatesServer] fetchBillById failed: ${res.status}`);
    return null;
  }

  return (await res.json()) as Bill;
}
