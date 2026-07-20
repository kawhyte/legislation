import { describe, it, expect } from 'vitest';
import { analyzeBillMomentum } from './billMomentum';
import type { Bill } from '@/types';

function makeBill(overrides: Partial<Bill> = {}): Bill {
  return {
    id: 'bill-1',
    title: 'Test Bill',
    introduced: '2026-01-01',
    status: 'active',
    sources: [],
    identifier: 'HB 1',
    latest_action_date: '2026-01-01',
    first_action_date: '2026-01-01',
    last_action_date: '2026-01-01',
    subject: [],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    actions: [],
    ...overrides,
  };
}

describe('analyzeBillMomentum', () => {
  it('marks a bill Enacted when enacted_date is set', () => {
    const bill = makeBill({ enacted_date: '2026-02-01' });
    const result = analyzeBillMomentum(bill);
    expect(result.level).toBe('Enacted');
  });

  it('marks a bill Passed when both chambers have passage dates', () => {
    const bill = makeBill({ house_passage_date: '2026-01-15', senate_passage_date: '2026-01-20' });
    const result = analyzeBillMomentum(bill);
    expect(result.level).toBe('Passed');
  });

  it('marks a bill Stalled on definitive failure keywords', () => {
    const bill = makeBill({
      actions: [
        { id: 'a1', organization: { id: 'o1', name: 'House', classification: 'lower' }, description: 'Vetoed by governor', date: '2026-01-10', classification: [], order: 1 },
      ],
    });
    const result = analyzeBillMomentum(bill);
    expect(result.level).toBe('Stalled');
  });

  it('does not mutate the actions array of the input bill', () => {
    const unsorted = [
      { id: 'a2', organization: { id: 'o1', name: 'House', classification: 'lower' }, description: 'Second', date: '2026-01-20', classification: [], order: 2 },
      { id: 'a1', organization: { id: 'o1', name: 'House', classification: 'lower' }, description: 'First', date: '2026-01-01', classification: [], order: 1 },
    ];
    const bill = makeBill({ actions: [...unsorted] });
    const originalOrder = bill.actions!.map(a => a.id);
    analyzeBillMomentum(bill);
    expect(bill.actions!.map(a => a.id)).toEqual(originalOrder);
  });
});
