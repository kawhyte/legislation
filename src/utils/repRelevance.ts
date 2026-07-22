import type { Bill, Sponsorship } from '@/types';
import type { Rep } from '@/hooks/useReps';

/**
 * Only STATE legislators can sponsor state bills. /people.geo returns federal
 * reps too; including them just dilutes the set and can never produce a match.
 */
export function stateRepIds(reps: Rep[] | null | undefined): Set<string> {
  return new Set(
    (reps ?? [])
      .filter(r => r.jurisdiction?.classification === 'state')
      .map(r => r.id)
  );
}

export interface RepMatch {
  sponsorName: string;
  repId: string;
  /** true when this rep is the primary sponsor, false when a co-sponsor. */
  isPrimary: boolean;
}

/** The first sponsorship on this bill by one of the user's reps, or null. */
export function matchRep(bill: Bill, repIds: Set<string>): RepMatch | null {
  const hit = (bill.sponsorships ?? []).find(
    (s: Sponsorship) => s.person?.id != null && repIds.has(s.person.id)
  );
  if (!hit?.person) return null;
  return {
    sponsorName: hit.person.name,
    repId: hit.person.id,
    // Some states set `primary: true` without `classification: "primary"`,
    // and others do the reverse — either one means they filed it.
    isPrimary: hit.primary === true || hit.classification === 'primary',
  };
}

export function partitionByRep(bills: Bill[], repIds: Set<string>) {
  const fromReps: Array<{ bill: Bill; match: RepMatch }> = [];
  const rest: Bill[] = [];
  for (const bill of bills) {
    // Short-circuit on an empty set: the common case is a visitor with no
    // reps at all, and there is nothing to intersect against.
    const match = repIds.size > 0 ? matchRep(bill, repIds) : null;
    if (match) fromReps.push({ bill, match });
    else rest.push(bill);
  }
  return { fromReps, rest };
}
