import { describe, it, expect } from 'vitest';
import { computeTrendingScore, topicRelevance, type BillEngagement } from './trendingScore';
import type { Bill, Action } from '@/types';

const NOW = new Date('2026-07-20T00:00:00Z');

function daysBefore(n: number): string {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();
}

function action(date: string, classification: string[] = []): Action {
  return {
    id: `a-${date}`,
    organization: { id: 'o1', name: 'House', classification: 'lower' },
    description: 'Referred to committee',
    date,
    classification,
    order: 0,
  };
}

function makeBill(overrides: Partial<Bill> = {}): Bill {
  return {
    id: `bill-${Math.random()}`,
    title: 'An unremarkable administrative bill',
    introduced: '2026-01-01',
    status: 'active',
    sources: [],
    identifier: 'HB 1',
    latest_action_date: daysBefore(1),
    first_action_date: '2026-01-01',
    last_action_date: daysBefore(1),
    subject: [],
    house_passage_date: '',
    senate_passage_date: '',
    enacted_date: '',
    actions: [],
    ...overrides,
  };
}

describe('topicRelevance', () => {
  it('sums the weight of every matching 21–39 topic', () => {
    const housing = makeBill({ title: 'Rent stabilization and eviction protections' });
    const generic = makeBill({ title: 'An unremarkable administrative bill' });
    expect(topicRelevance(housing)).toBeGreaterThan(0);
    expect(topicRelevance(generic)).toBe(0);
  });

  it('matches against subjects, not just the title', () => {
    const bill = makeBill({ title: 'HB 42', subject: ['Cannabis', 'Taxation'] });
    expect(topicRelevance(bill)).toBeGreaterThan(0);
  });
});

describe('computeTrendingScore', () => {
  it('ranks a fast-moving housing bill above a stale, off-topic bill', () => {
    const movingHousing = makeBill({
      title: 'Affordable housing and tenant protection act',
      actions: [action(daysBefore(1)), action(daysBefore(4)), action(daysBefore(9))],
    });
    const staleGeneric = makeBill({
      title: 'A resolution concerning administrative procedure',
      actions: [action(daysBefore(200))],
    });
    expect(computeTrendingScore(movingHousing, null, NOW))
      .toBeGreaterThan(computeTrendingScore(staleGeneric, null, NOW));
  });

  it('prefers the 21–39-relevant bill when activity is equal', () => {
    const acts = [action(daysBefore(2)), action(daysBefore(6))];
    const onTopic = makeBill({ title: 'Student loan forgiveness and tuition relief', actions: acts });
    const offTopic = makeBill({ title: 'County road naming standards', actions: acts });
    expect(computeTrendingScore(onTopic, null, NOW))
      .toBeGreaterThan(computeTrendingScore(offTopic, null, NOW));
  });

  it('breaks ties in favor of the more-engaged bill', () => {
    const base = { title: 'Clean energy investment act', actions: [action(daysBefore(3))] };
    const billA = makeBill(base);
    const billB = makeBill(base);
    const engagement: BillEngagement = { views: 500, saves: 40, lastActivityAt: NOW.getTime() };
    expect(computeTrendingScore(billB, engagement, NOW))
      .toBeGreaterThan(computeTrendingScore(billA, null, NOW));
  });

  it('caps engagement so hype cannot outweigh real legislative movement', () => {
    const hyped = makeBill({
      title: 'A ceremonial off-topic bill',
      actions: [action(daysBefore(30))],
    });
    const moving = makeBill({
      title: 'Affordable housing and rent relief act',
      actions: [action(daysBefore(1)), action(daysBefore(2)), action(daysBefore(5))],
    });
    const hugeEngagement: BillEngagement = { views: 100000, saves: 9000, lastActivityAt: NOW.getTime() };
    expect(computeTrendingScore(moving, null, NOW))
      .toBeGreaterThan(computeTrendingScore(hyped, hugeEngagement, NOW));
  });
});
