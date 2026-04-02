import { createContext, useContext, useState, useCallback } from "react";
import type { States } from "@/components/JurisdictionSelector";
import type { Bill } from "@/types";
import type { Rep } from "@/hooks/useReps";

const SESSION_KEY = "lt-reps-map";

interface SearchCacheState {
  jurisdiction: States | null;
  bills: Bill[];
  reps: Rep[];
  repsMap: Record<string, Rep>;
}

interface SearchCacheContextValue {
  cache: SearchCacheState;
  setJurisdiction: (jurisdiction: States) => void;
  setBills: (bills: Bill[]) => void;
  setReps: (reps: Rep[]) => void;
  isMatch: (jurisdiction: States) => boolean;
}

const SearchCacheContext = createContext<SearchCacheContextValue | null>(null);

const emptyCache: SearchCacheState = {
  jurisdiction: null,
  bills: [],
  reps: [],
  repsMap: {},
};

export const SearchCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cache, setCache] = useState<SearchCacheState>(() => {
    // Pre-populate repsMap from sessionStorage so /rep/:repId survives a page refresh
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const repsMap = JSON.parse(raw) as Record<string, Rep>;
        return { ...emptyCache, repsMap };
      }
    } catch {
      // sessionStorage unavailable or corrupt JSON — start empty
    }
    return emptyCache;
  });

  // Called when user starts a new search; clears stale bills/reps
  const setJurisdiction = useCallback((jurisdiction: States) => {
    setCache(prev => {
      const same =
        prev.jurisdiction?.name === jurisdiction.name &&
        prev.jurisdiction?.zipCoords?.lat === jurisdiction.zipCoords?.lat &&
        prev.jurisdiction?.zipCoords?.lng === jurisdiction.zipCoords?.lng;
      if (same) return prev;
      return { ...prev, jurisdiction, bills: [], reps: [] };
    });
  }, []);

  const setBills = useCallback((bills: Bill[]) => {
    setCache(prev => ({ ...prev, bills }));
  }, []);

  const setReps = useCallback((reps: Rep[]) => {
    const repsMap = Object.fromEntries(reps.map(r => [r.id, r]));
    setCache(prev => ({ ...prev, reps, repsMap }));
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(repsMap));
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  // Returns true when the given jurisdiction matches what's currently cached
  const isMatch = useCallback(
    (jurisdiction: States): boolean => {
      const cached = cache.jurisdiction;
      if (!cached) return false;
      if (cached.name !== jurisdiction.name) return false;
      if (cached.zipCoords && jurisdiction.zipCoords) {
        return (
          cached.zipCoords.lat === jurisdiction.zipCoords.lat &&
          cached.zipCoords.lng === jurisdiction.zipCoords.lng
        );
      }
      // Both have no coords (state-only search) → name match is sufficient
      return !cached.zipCoords && !jurisdiction.zipCoords;
    },
    [cache.jurisdiction],
  );

  return (
    <SearchCacheContext.Provider value={{ cache, setJurisdiction, setBills, setReps, isMatch }}>
      {children}
    </SearchCacheContext.Provider>
  );
};

export function useSearchCache() {
  const ctx = useContext(SearchCacheContext);
  if (!ctx) throw new Error("useSearchCache must be used within SearchCacheProvider");
  return ctx;
}
