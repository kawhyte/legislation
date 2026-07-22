'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BillCard from '@/components/BillCard';
import BillCardSkeleton from '@/components/BillCardSkeleton';
import YourRepsWidget from '@/components/YourRepsWidget';
import Hero, { JURISDICTION_TRIGGER_ID } from '@/components/Hero';
import LocationChip, { type LocationSource } from '@/components/LocationChip';
import TrendingBillGrid from '@/components/TrendingBillGrid';
import useBills from '@/hooks/useBills';
import { useCachedSummaries } from '@/hooks/useCachedSummaries';
import { useSearchCache } from '@/contexts/SearchCacheContext';
import { parseLocationInput } from '@/utils/zipToJurisdiction';
import type { States } from '@/components/JurisdictionSelector';
import type { Bill } from '@/types';
import type { Rep } from '@/hooks/useReps';
import { track } from '@/lib/analytics';
import { readLastJurisdiction } from '@/lib/lastJurisdiction';
import { useUserData } from '@/contexts/UserContext';
import { useUser } from '@/hooks/useAuth';
import usStates from '@/data/usStates';

const Lottie = React.lazy(() => import('lottie-react'));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tumbleweedData = require('@/assets/Tumbleweed Rolling.json');

// ── Pure rendering layer ──────────────────────────────────────────────────────

interface DisplayProps {
  jurisdiction: States;
  bills: Bill[] | null;
  isLoading: boolean;
  error?: string;
  cachedReps?: Rep[];
}

const ZipBillResultsDisplay: React.FC<DisplayProps> = ({ jurisdiction, bills, isLoading, error, cachedReps }) => {
  // Called before the early returns below — hooks cannot live behind a branch.
  // Cache-only reads, so a state feed costs zero Gemini tokens.
  const summaries = useCachedSummaries(bills ?? []);

  if (isLoading) {
    return (
      <section className="container-legislation py-12">
        {/* Same heading as the loaded state — the jurisdiction is known before the
            fetch resolves, so holding its space keeps the grid from jumping. */}
        <h2 className="text-4xl font-black text-foreground mb-8 border-b-4 border-foreground pb-4">
          Latest Bills in {jurisdiction.name}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <BillCardSkeleton key={i} viewMode="feed" showSource={false} />)}
            </div>
          </div>
          <div className="lg:col-span-1 order-first lg:order-last">
            <YourRepsWidget coords={jurisdiction.zipCoords} stateName={jurisdiction.name} cachedReps={cachedReps} />
          </div>
        </div>
      </section>
    );
  }

  if (error && (!bills || bills.length === 0)) {
    return (
      <section className="container-legislation py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 py-4 text-center">
            <div className="max-w-xs mx-auto">
              <h3 className="text-xl font-bold text-foreground mt-2">Something went wrong.</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                We couldn&apos;t load bills for {jurisdiction.name} right now. Please try again in a moment.
              </p>
            </div>
          </div>
          <div className="lg:col-span-1 order-first lg:order-last">
            <YourRepsWidget coords={jurisdiction.zipCoords} stateName={jurisdiction.name} cachedReps={cachedReps} />
          </div>
        </div>
      </section>
    );
  }

  if (!bills || bills.length === 0) {
    return (
      <section className="container-legislation py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 py-4 text-center">
            <div className="max-w-xs mx-auto">
              <Suspense fallback={null}>
                <Lottie animationData={tumbleweedData} loop className="w-full" />
              </Suspense>
              <h3 className="text-xl font-bold text-foreground mt-2">Quiet out here.</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                The {jurisdiction.name} legislature is pretty quiet right now. Try a different zip code!
              </p>
            </div>
          </div>
          <div className="lg:col-span-1 order-first lg:order-last">
            <YourRepsWidget coords={jurisdiction.zipCoords} stateName={jurisdiction.name} cachedReps={cachedReps} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-legislation py-12">
      <h2 className="text-4xl font-black text-foreground mb-8 border-b-4 border-foreground pb-4">
        Latest Bills in {jurisdiction.name}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bills.map((bill, i) => (
              // `showSource`/`showProgressBar` are deliberately absent: the feed
              // variant ignores both, and passing them would imply otherwise.
              <BillCard key={bill.id} bill={bill} viewMode="feed" summary={summaries.get(bill.id)} feedName="state" position={i} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1 order-first lg:order-last lg:sticky lg:top-6 lg:self-start">
          <YourRepsWidget coords={jurisdiction.zipCoords} stateName={jurisdiction.name} cachedReps={cachedReps} />
        </div>
      </div>
    </section>
  );
};

// ── Fetching layer ────────────────────────────────────────────────────────────

const ZipBillResultsFetch: React.FC<{ jurisdiction: States }> = ({ jurisdiction }) => {
  const { setJurisdiction, setBills } = useSearchCache();
  const { data: bills, isLoading, error } = useBills(jurisdiction, null);

  useEffect(() => {
    setJurisdiction(jurisdiction);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jurisdiction.name, jurisdiction.zipCoords?.lat, jurisdiction.zipCoords?.lng]);

  useEffect(() => {
    if (bills && bills.length > 0) setBills(bills);
  }, [bills, setBills]);

  return <ZipBillResultsDisplay jurisdiction={jurisdiction} bills={bills} isLoading={isLoading} error={error} />;
};

// ── Smart cache wrapper ───────────────────────────────────────────────────────

const ZipBillResults: React.FC<{ jurisdiction: States }> = ({ jurisdiction }) => {
  const { isMatch, cache } = useSearchCache();
  const cacheHit = isMatch(jurisdiction) && cache.bills.length > 0;

  // Tracked here rather than in the display: this wrapper is the only component
  // that survives the fetch→cache swap. The display below it unmounts and
  // remounts on that swap, which would reset a ref guard and double-fire.
  // The fetch path populates the same cache once bills load, so both paths land
  // here exactly once per jurisdiction.
  const trackedFeed = useRef<string | null>(null);
  useEffect(() => {
    if (!cacheHit || trackedFeed.current === jurisdiction.name) return;
    trackedFeed.current = jurisdiction.name;
    track('feed_view', { feed: 'state', count: cache.bills.length });
  }, [cacheHit, jurisdiction.name, cache.bills.length]);

  if (cacheHit) {
    return (
      <ZipBillResultsDisplay
        jurisdiction={jurisdiction}
        bills={cache.bills}
        isLoading={false}
        cachedReps={cache.reps.length > 0 ? cache.reps : undefined}
      />
    );
  }

  return <ZipBillResultsFetch jurisdiction={jurisdiction} />;
};

// ── Inner page — uses useSearchParams ─────────────────────────────────────────

function HomePageInner({ geoStateAbbr }: { geoStateAbbr?: string | null }) {
  const [jurisdiction, setJurisdiction] = useState<States | null>(null);
  const [source, setSource] = useState<LocationSource>('none');
  const searchParams = useSearchParams();
  const router = useRouter();
  const didRestore = useRef(false);
  const didResolve = useRef(false);
  const { userPreferences } = useUserData();
  const { isLoaded: isAuthLoaded, isSignedIn } = useUser();

  // A shared /?q=33028 link resolves its jurisdiction asynchronously, so
  // `jurisdiction` is null for the first few hundred ms of that load. Without
  // this flag the trending feed would flash before the state feed replaced it.
  // Initialised from the URL during the first render — not in the effect — so
  // there is no null-and-not-restoring frame to paint.
  const [isRestoring, setIsRestoring] = useState(() => searchParams.get('q') != null);

  useEffect(() => {
    if (didRestore.current || jurisdiction) return;
    const q = searchParams.get('q');
    if (!q) return;
    didRestore.current = true;
    setIsRestoring(true);
    parseLocationInput(q)
      .then(state => {
        // A shared link is as explicit a choice as using the picker.
        didResolve.current = true;
        setSource('explicit');
        setJurisdiction(state);
        setIsRestoring(false);
      })
      .catch(() => { setIsRestoring(false); router.replace('/'); });
  // Only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Default-location resolution ────────────────────────────────────────────
  // Strict priority: profile state > last visited > IP geo > national feed.
  //
  // `didResolve` is set only once a jurisdiction is actually applied, not on
  // every pass. That matters: `setJurisdiction` clears the bill/rep cache when
  // the jurisdiction differs, so a resolution that re-fires would thrash the
  // cache into a fetch loop — while a pass that finds nothing must stay open,
  // because Firestore preferences arrive several renders after mount (child
  // effects run before the provider's, so `isLoadingPreferences` is still false
  // on the first pass and cannot be relied on alone).
  useEffect(() => {
    if (didResolve.current) return;
    if (jurisdiction) return;                 // an explicit pick or ?q= already won
    if (searchParams.get('q')) return;        // ?q= restore is in flight — let it win
    if (!isAuthLoaded) return;                // don't guess before we know who this is

    const profileAbbr = isSignedIn ? userPreferences?.selectedState ?? null : null;
    const recentAbbr = readLastJurisdiction();
    const abbr = profileAbbr ?? recentAbbr ?? geoStateAbbr ?? null;
    if (!abbr) return;                        // stay on the national feed, keep listening

    const match = usStates.find(s => s.abbreviation === abbr);
    if (!match) return;

    didResolve.current = true;
    setSource(profileAbbr ? 'profile' : recentAbbr ? 'recent' : 'guess');
    setJurisdiction(match as States);
  }, [isAuthLoaded, isSignedIn, userPreferences?.selectedState, geoStateAbbr, jurisdiction, searchParams]);

  const handleExplicitSelect = (state: States) => {
    // Any explicit pick closes resolution for good — including a sign-out that
    // nulls preferences afterwards, which must not yank the feed away.
    didResolve.current = true;
    setSource('explicit');
    setJurisdiction(state);
  };

  const focusJurisdictionPicker = () => {
    const trigger = document.getElementById(JURISDICTION_TRIGGER_ID);
    if (!trigger) return;
    trigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
    trigger.focus({ preventScroll: true });
  };

  return (
    <div className="bg-background text-foreground">
      <Hero onSelectState={handleExplicitSelect} selectedState={jurisdiction} />
      {/* Withheld mid-restore: announcing "Set your state" for the moment before
          a shared link resolves would be both wrong and read aloud. */}
      {!isRestoring && (
        <LocationChip
          source={jurisdiction ? source : 'none'}
          stateName={jurisdiction?.name ?? null}
          onChangeLocation={focusJurisdictionPicker}
        />
      )}
      {jurisdiction ? (
        <ZipBillResults jurisdiction={jurisdiction} />
      ) : isRestoring ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <section className="container-legislation py-12">
          <h2 className="text-4xl font-black text-foreground mb-2 border-b-4 border-foreground pb-4">
            Trending across the US
          </h2>
          <p className="text-muted-foreground mb-8">
            What state legislatures are actually moving on right now. Pick your state above to make
            this local.
          </p>
          <TrendingBillGrid viewMode="feed" skeletonCount={6} />
        </section>
      )}
    </div>
  );
}

// ── Page export wrapped in Suspense (required for useSearchParams) ─────────────

export default function HomePageView({ geoStateAbbr }: { geoStateAbbr?: string | null }) {
  return (
    <Suspense fallback={
      <div className="bg-background text-foreground">
        <div className="min-h-[52vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <HomePageInner geoStateAbbr={geoStateAbbr} />
    </Suspense>
  );
}
