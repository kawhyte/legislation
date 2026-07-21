import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCached, setCached, makeCacheKey } from './apiCache';

describe('apiCache', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('returns null for a key that was never set', () => {
    expect(getCached(makeCacheKey('/never-set', {}))).toBeNull();
  });

  it('returns cached data before the TTL expires', () => {
    const key = makeCacheKey('/bills', { jurisdiction: 'Texas' });
    setCached(key, [{ id: 1 }]);
    expect(getCached(key)).toEqual([{ id: 1 }]);
  });

  it('expires data after the given ttlMs', async () => {
    const key = makeCacheKey('/bills', { jurisdiction: 'expiring-test' });
    setCached(key, [{ id: 2 }]);
    // Use a 1ms TTL and wait slightly longer to force expiry deterministically
    await new Promise(resolve => setTimeout(resolve, 5));
    expect(getCached(key, 1)).toBeNull();
  });

  it('produces distinct keys for different params', () => {
    const keyA = makeCacheKey('/bills', { jurisdiction: 'Texas' });
    const keyB = makeCacheKey('/bills', { jurisdiction: 'California' });
    expect(keyA).not.toBe(keyB);
  });
});
