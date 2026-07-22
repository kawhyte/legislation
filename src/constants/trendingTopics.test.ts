import { describe, it, expect } from 'vitest';
import { FEED_CHIP_TOPICS, TOPIC_WEIGHTS } from './trendingTopics';

describe('FEED_CHIP_TOPICS', () => {
  it('only references topic ids that actually exist', () => {
    // A typo here fails silently in production — the chip would render, boost
    // nothing, and never match a bill. This is the only place it can be caught.
    const known = new Set(TOPIC_WEIGHTS.map(t => t.id));
    for (const chip of FEED_CHIP_TOPICS) {
      expect(known, `chip "${chip.label}" points at unknown topic id "${chip.id}"`).toContain(chip.id);
    }
  });

  it('has no duplicate chips', () => {
    const ids = FEED_CHIP_TOPICS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('TOPIC_WEIGHTS', () => {
  it('gives every topic a unique, stable id', () => {
    const ids = TOPIC_WEIGHTS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z-]+$/);
  });
});
