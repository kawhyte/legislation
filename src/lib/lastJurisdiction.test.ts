import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readLastJurisdiction, writeLastJurisdiction } from './lastJurisdiction';

const KEY = 'billhound:lastJurisdiction';

describe('lastJurisdiction', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('round-trips a valid abbreviation', () => {
    writeLastJurisdiction('TX');
    expect(readLastJurisdiction()).toBe('TX');
  });

  it('returns null when nothing is stored', () => {
    expect(readLastJurisdiction()).toBeNull();
  });

  // localStorage is user-writable, so anything not shaped like an abbreviation
  // must be rejected rather than handed to a state lookup.
  it.each(['florida', 'XYZ', '', 'T', 'tx', '12', '<script>'])(
    'returns null for garbage: %j',
    stored => {
      localStorage.setItem(KEY, stored);
      expect(readLastJurisdiction()).toBeNull();
    }
  );

  it('returns null when localStorage throws (Safari private mode)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readLastJurisdiction()).toBeNull();
  });

  it('does not throw when a write is rejected', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => writeLastJurisdiction('FL')).not.toThrow();
  });
});
