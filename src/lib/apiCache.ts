/**
 * Session-level in-memory API response cache.
 * Entries expire after TTL_MS and are evicted on next read.
 * The store lives in module scope — wiped on page close/refresh.
 */

const TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
	data: unknown[];
	timestamp: number;
}

const store = new Map<string, CacheEntry>();

/** Build a stable cache key from an endpoint path + params object. */
export const makeCacheKey = (endpoint: string, params: object): string =>
	`${endpoint}::${JSON.stringify(params)}`;

/** Return cached data if present and not expired; otherwise null. */
export const getCached = <T>(key: string): T[] | null => {
	const entry = store.get(key);
	if (!entry) return null;
	if (Date.now() - entry.timestamp > TTL_MS) {
		store.delete(key);
		return null;
	}
	return entry.data as T[];
};

/** Store data in the cache with the current timestamp. */
export const setCached = <T>(key: string, data: T[]): void => {
	store.set(key, { data: data as unknown[], timestamp: Date.now() });
};
