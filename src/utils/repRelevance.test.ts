import { describe, it, expect } from 'vitest';
import { stateRepIds, matchRep, partitionByRep } from './repRelevance';
import type { Bill, Sponsorship } from '@/types';
import type { Rep } from '@/hooks/useReps';

const rep = (id: string, classification = 'state'): Rep =>
  ({ id, name: id, party: 'Democratic', jurisdiction: { id: 'j', name: 'Texas', classification } }) as Rep;

const sponsorship = (over: Partial<Sponsorship>): Sponsorship =>
  ({ id: 's', person: null, primary: false, classification: 'cosponsor', ...over }) as Sponsorship;

const bill = (sponsorships: Sponsorship[], id = 'ocd-bill/1'): Bill =>
  ({ id, sponsorships }) as unknown as Bill;

describe('stateRepIds', () => {
  it('excludes federal reps — they can never sponsor a state bill', () => {
    const ids = stateRepIds([rep('state-1'), rep('fed-1', 'country'), rep('state-2')]);
    expect([...ids]).toEqual(['state-1', 'state-2']);
  });

  it('tolerates null, undefined and empty input', () => {
    expect(stateRepIds(null).size).toBe(0);
    expect(stateRepIds(undefined).size).toBe(0);
    expect(stateRepIds([]).size).toBe(0);
  });

  it('drops reps with no jurisdiction at all', () => {
    expect(stateRepIds([{ id: 'x', name: 'X', party: 'Republican' } as Rep]).size).toBe(0);
  });
});

describe('matchRep', () => {
  const ids = new Set(['ocd-person/mine']);

  it('returns null when every sponsorship has a null person', () => {
    // This guard is what stops "undefined sponsored this" reaching a user.
    expect(matchRep(bill([sponsorship({ name: 'Wright' }), sponsorship({ name: 'Diaz' })]), ids)).toBeNull();
  });

  it('returns null when no sponsor is one of the user reps', () => {
    expect(matchRep(bill([sponsorship({ person: { id: 'ocd-person/other', name: 'Other' } })]), ids)).toBeNull();
  });

  it('treats primary: true as primary even when classified a cosponsor', () => {
    const match = matchRep(
      bill([sponsorship({ person: { id: 'ocd-person/mine', name: 'Dana Rivers' }, primary: true })]),
      ids,
    );
    expect(match).toEqual({ sponsorName: 'Dana Rivers', repId: 'ocd-person/mine', isPrimary: true });
  });

  it('treats classification: "primary" as primary even when `primary` is absent', () => {
    const s = { id: 's', person: { id: 'ocd-person/mine', name: 'Dana Rivers' }, classification: 'primary' };
    expect(matchRep(bill([s as unknown as Sponsorship]), ids)?.isPrimary).toBe(true);
  });

  it('reports a plain cosponsor as not primary', () => {
    const match = matchRep(
      bill([sponsorship({ person: { id: 'ocd-person/mine', name: 'Dana Rivers' } })]),
      ids,
    );
    expect(match?.isPrimary).toBe(false);
  });

  it('handles a bill with no sponsorships array', () => {
    expect(matchRep({ id: 'b' } as Bill, ids)).toBeNull();
  });
});

describe('partitionByRep', () => {
  it('puts everything in rest when the rep set is empty', () => {
    const bills = [bill([], 'a'), bill([], 'b')];
    const { fromReps, rest } = partitionByRep(bills, new Set());
    expect(fromReps).toEqual([]);
    expect(rest).toEqual(bills);
  });

  it('never touches sponsorships when the rep set is empty', () => {
    // The getter would throw if the empty-set short-circuit were removed.
    const trap = { id: 'trap', get sponsorships(): Sponsorship[] { throw new Error('read sponsorships'); } };
    expect(() => partitionByRep([trap as unknown as Bill], new Set())).not.toThrow();
  });

  it('yields exactly one entry for a bill sponsored by two matching reps', () => {
    const both = bill([
      sponsorship({ person: { id: 'r1', name: 'First Rep' }, primary: true }),
      sponsorship({ person: { id: 'r2', name: 'Second Rep' } }),
    ]);
    const { fromReps, rest } = partitionByRep([both], new Set(['r1', 'r2']));
    expect(fromReps).toHaveLength(1);
    expect(fromReps[0].match.sponsorName).toBe('First Rep');
    expect(rest).toEqual([]);
  });

  it('splits matched and unmatched bills while preserving order', () => {
    const mine = bill([sponsorship({ person: { id: 'r1', name: 'Mine' } })], 'mine');
    const other = bill([sponsorship({ person: { id: 'r9', name: 'Other' } })], 'other');
    const { fromReps, rest } = partitionByRep([other, mine], new Set(['r1']));
    expect(fromReps.map(f => f.bill.id)).toEqual(['mine']);
    expect(rest.map(b => b.id)).toEqual(['other']);
  });
});
