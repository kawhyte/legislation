'use client';

import React, { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BillCard from '@/components/BillCard';
import BillCardSkeleton from '@/components/BillCardSkeleton';
import YourRepsWidget from '@/components/YourRepsWidget';
import FeedSection from '@/components/FeedSection';
import Hero, { JURISDICTION_TRIGGER_ID } from '@/components/Hero';
import LocationChip, { type LocationSource } from '@/components/LocationChip';
import TopicChipRow from '@/components/TopicChipRow';
import TrendingBillGrid from '@/components/TrendingBillGrid';
import useBills from '@/hooks/useBills';
import { useCachedSummaries } from '@/hooks/useCachedSummaries';
import { useSearchCache } from '@/contexts/SearchCacheContext';
import { parseLocationInput } from '@/utils/zipToJurisdiction';
import { partitionByRep, stateRepIds } from '@/utils/repRelevance';
import type { States } from '@/components/JurisdictionSelector';
import type { Bill } from '@/types';
import type { Rep } from '@/hooks/useReps';
import { track } from '@/lib/analytics';
import { readLastJurisdiction } from '@/lib/lastJurisdiction';
import { readTaps, recordTap, clearTaps, tapsToBoosts, type Taps } from '@/lib/topicAffinity';
import { computeTrendingScore, type TopicBoosts } from '@/utils/trendingScore';
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
  /**
   * Per-topic multipliers from the viewer's chip taps, or undefined when no
   * topic is active. Undefined leaves the feed in its server order — the exact
   * PLAN-19/20 ordering — so "Clear" is a true restore, not an approximation.
   */
  boosts?: TopicBoosts;
  /** Topic chip row, rendered above the feed only when there are bills. */
  chips?: React.ReactNode;
}

const FEED_GRID = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6';

const ZipBillResultsDisplay: React.FC<DisplayProps> = ({ jurisdiction, bills, isLoading, error, cachedReps, boosts, chips }) => {
  // Called before the early returns below — hooks cannot live behind a branch.
  // Cache-only reads, so a state feed costs zero Gemini tokens.
  const summaries = useCachedSummaries(bills ?? []);

  // A chip tap re-sorts what is already in memory. No refetch, no request, no
  // tokens — and the sort runs before partitionByRep so both tiers reorder.
  const ordered = useMemo(() => {
    if (!bills || !boosts) return bills ?? [];
    return [...bills].sort(
      (a, b) =>
        computeTrendingScore(b, undefined, undefined, boosts) -
        computeTrendingScore(a, undefined, undefined, boosts)
    );
  }, [bills, boosts]);

  // Reuse the reps YourRepsWidget already fetched — never a second /people.geo.
  const { cache } = useSearchCache();
  const reps = cachedReps ?? cache.reps;
  const repIds = useMemo(() => stateRepIds(reps), [reps]);
  const { fromReps, rest } = useMemo(() => partitionByRep(ordered, repIds), [ordered, repIds]);

  // Reps land a beat after bills, and a card that jumps from "More in Texas" up
  // to "From your reps" mid-read is worse than a brief unsectioned feed. So the
  // headings wait. A location with no coords can never have reps, so it never
  // waits; a coords lookup that comes back empty simply keeps the flat feed,
  // which is exactly the pre-PLAN-20 layout.
  const repsPending = Boolean(jurisdiction.zipCoords) && reps.length === 0;

  const whyReps = jurisdiction.zip
    ? `Bills sponsored by the state legislators who represent ZIP ${jurisdiction.zip}.`
    : 'Bills sponsored by the state legislators who represent your district.';

  if (isLoading) {
    return (
      <section className="container-legislation py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {/* Same chips, same heading, same column, same offset as the loaded
                state — the jurisdiction and the viewer's topics are both known
                before the fetch resolves, so holding their space keeps the grid
                from jumping. */}
            {chips && <div className="mb-6">{chips}</div>}
            <h2 className="text-4xl font-black text-foreground mb-8 border-b-4 border-foreground pb-4">
              Latest Bills in {jurisdiction.name}
            </h2>
            <div className={FEED_GRID}>
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Above every tier: the chips steer the whole feed, not one band.
              Outside the `space-y-12` below so the gap under them matches the
              loading state's exactly — this column must not shift on load. */}
          {chips && <div className="mb-6">{chips}</div>}
          <div className="space-y-12">
          {repsPending ? (
            <div>
              <h2 className="text-4xl font-black text-foreground mb-8 border-b-4 border-foreground pb-4">
                Latest Bills in {jurisdiction.name}
              </h2>
              <div className={FEED_GRID}>
                {ordered.map((bill, i) => (
                  // `showSource`/`showProgressBar` are deliberately absent: the feed
                  // variant ignores both, and passing them would imply otherwise.
                  <BillCard key={bill.id} bill={bill} viewMode="feed" summary={summaries.get(bill.id)} feedName="state" position={i} />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* No match means no heading at all. A permanently empty "From your
                  reps" band is worse than never promising one. */}
              {fromReps.length > 0 && (
                <FeedSection title="From your reps" why={whyReps}>
                  <div className={FEED_GRID}>
                    {fromReps.map(({ bill, match }, i) => (
                      <BillCard
                        key={bill.id}
                        bill={bill}
                        viewMode="feed"
                        summary={summaries.get(bill.id)}
                        feedName="state"
                        position={i}
                        attribution={match}
                      />
                    ))}
                  </div>
                </FeedSection>
              )}

              <FeedSection
                title={`More in ${jurisdiction.name}`}
                why={`Recent activity in the ${jurisdiction.name} legislature.`}
              >
                <div className={FEED_GRID}>
                  {rest.map((bill, i) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      viewMode="feed"
                      summary={summaries.get(bill.id)}
                      feedName="state"
                      position={fromReps.length + i}
                    />
                  ))}
                </div>
              </FeedSection>

              {/* Backfill only — a thin state session still gets a full screen. */}
              {fromReps.length + rest.length < 6 && (
                <FeedSection title="Trending nationwide" why="Moving fastest across all 50 states right now.">
                  <TrendingBillGrid viewMode="feed" skeletonCount={3} />
                </FeedSection>
              )}
            </>
          )}
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

interface FeedProps {
  jurisdiction: States;
  boosts?: TopicBoosts;
  chips?: React.ReactNode;
}

const ZipBillResultsFetch: React.FC<FeedProps> = ({ jurisdiction, boosts, chips }) => {
  const { setJurisdiction, setBills } = useSearchCache();
  const { data: bills, isLoading, error } = useBills(jurisdiction, null);

  useEffect(() => {
    setJurisdiction(jurisdiction);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jurisdiction.name, jurisdiction.zipCoords?.lat, jurisdiction.zipCoords?.lng]);

  useEffect(() => {
    if (bills && bills.length > 0) setBills(bills);
  }, [bills, setBills]);

  return (
    <ZipBillResultsDisplay
      jurisdiction={jurisdiction}
      bills={bills}
      isLoading={isLoading}
      error={error}
      boosts={boosts}
      chips={chips}
    />
  );
};

// ── Smart cache wrapper ───────────────────────────────────────────────────────

const ZipBillResults: React.FC<FeedProps> = ({ jurisdiction, boosts, chips }) => {
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
        boosts={boosts}
        chips={chips}
      />
    );
  }

  return <ZipBillResultsFetch jurisdiction={jurisdiction} boosts={boosts} chips={chips} />;
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

  // ── Topic affinity (PLAN-21) ───────────────────────────────────────────────
  // Read in an effect, never during render: localStorage does not exist on the
  // server, so reading it inline would produce different server and client HTML
  // and React would throw a hydration error. The first paint is therefore
  // always the unboosted order.
  const [taps, setTaps] = useState<Taps>({});
  useEffect(() => { setTaps(readTaps()); }, []);

  // Memoised — a fresh object identity every render would re-sort the feed on
  // every unrelated state change. Undefined when nothing is active, which is
  // what leaves the default ordering completely untouched.
  const boosts = useMemo(() => {
    const b = tapsToBoosts(taps);
    return Object.keys(b).length > 0 ? b : undefined;
  }, [taps]);

  const chips = (
    <TopicChipRow
      taps={taps}
      onTap={id => {
        setTaps(recordTap(id));
        track('topic_chip_tap', { topic: id });
      }}
      onClear={() => {
        clearTaps();
        setTaps({});
      }}
    />
  );

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
        <ZipBillResults jurisdiction={jurisdiction} boosts={boosts} chips={chips} />
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
          <TrendingBillGrid viewMode="feed" skeletonCount={6} boosts={boosts} chips={chips} />
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
