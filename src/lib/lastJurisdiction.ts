const KEY = 'billhound:lastJurisdiction';

/** Returns a stored 2-letter state abbreviation, or null. Never throws. */
export function readLastJurisdiction(): string | null {
  try {
    const v = localStorage.getItem(KEY);
    // localStorage is user-writable and this value feeds a state lookup, so the
    // shape is validated on the way out, not just on the way in.
    return v && /^[A-Z]{2}$/.test(v) ? v : null;
  } catch {
    return null; // Safari private mode / storage disabled / SSR
  }
}

export function writeLastJurisdiction(abbr: string): void {
  try {
    localStorage.setItem(KEY, abbr);
  } catch {
    /* best-effort — a failed write just means no personalisation next visit */
  }
}
