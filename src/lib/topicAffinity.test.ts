import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { readTaps, recordTap, clearTaps, tapsToBoosts, MAX_BOOST } from './topicAffinity';

const KEY = 'billhound:topicAffinity';

describe('readTaps', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('returns {} when nothing is stored', () => {
    expect(readTaps()).toEqual({});
  });

  it('reads back what recordTap wrote', () => {
    recordTap('housing');
    recordTap('housing');
    recordTap('guns');
    expect(readTaps()).toEqual({ housing: 2, guns: 1 });
  });

  it('drops values that are not sane positive numbers', () => {
    // localStorage is user-writable and these values multiply a sort key.
    localStorage.setItem(
      KEY,
      JSON.stringify({ housing: 3, a: 'abc', b: -5, c: null, d: 0, e: {} })
    );
    expect(readTaps()).toEqual({ housing: 3 });
  });

  it('drops Infinity, which JSON stringifies to null', () => {
    localStorage.setItem(KEY, `{"housing": 1e999, "guns": 2}`);
    expect(readTaps()).toEqual({ guns: 2 });
  });

  it('clamps an absurd hand-edited count', () => {
    localStorage.setItem(KEY, JSON.stringify({ housing: 1_000_000 }));
    expect(readTaps().housing).toBe(50);
  });

  it('returns {} for non-object and malformed JSON', () => {
    localStorage.setItem(KEY, '"just a string"');
    expect(readTaps()).toEqual({});
    localStorage.setItem(KEY, '[1,2,3]');
    expect(readTaps()).toEqual({});
    localStorage.setItem(KEY, '{not json');
    expect(readTaps()).toEqual({});
  });

  it('returns {} when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Safari private mode');
    });
    expect(readTaps()).toEqual({});
  });
});

describe('recordTap', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('returns the updated counts', () => {
    expect(recordTap('guns')).toEqual({ guns: 1 });
    expect(recordTap('guns')).toEqual({ guns: 2 });
  });

  it('does not throw when the write fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(() => recordTap('guns')).not.toThrow();
  });
});

describe('clearTaps', () => {
  it('empties the store', () => {
    recordTap('housing');
    clearTaps();
    expect(readTaps()).toEqual({});
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});

describe('tapsToBoosts', () => {
  it('boosts nothing when nothing has been tapped', () => {
    expect(tapsToBoosts({})).toEqual({});
  });

  it('gives one tap a modest nudge, not a takeover', () => {
    // ~1.43×: enough to visibly reorder, nowhere near enough to make the feed
    // single-topic on the first tap.
    const one = tapsToBoosts({ housing: 1 }).housing;
    expect(one).toBeGreaterThan(1.2);
    expect(one).toBeLessThan(1.6);
  });

  it('is monotonic and asymptotic — more taps never reach MAX_BOOST', () => {
    const at = (n: number) => tapsToBoosts({ housing: n }).housing;
    expect(at(1)).toBeLessThan(at(5));
    expect(at(5)).toBeLessThan(at(10));
    expect(at(10)).toBeLessThan(MAX_BOOST);
    expect(at(50)).toBeLessThan(MAX_BOOST);
  });
});
