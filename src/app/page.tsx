'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BillCard from '@/components/BillCard';
import BillCardSkeleton from '@/components/BillCardSkeleton';
import YourRepsWidget from '@/components/YourRepsWidget';
import Hero from '@/components/Hero';
import useBills from '@/hooks/useBills';
import { useSearchCache } from '@/contexts/SearchCacheContext';
import { parseLocationInput } from '@/utils/zipToJurisdiction';
import type { States } from '@/components/JurisdictionSelector';
import type { Bill } from '@/types';
import type { Rep } from '@/hooks/useReps';

const Lottie = React.lazy(() => import('lottie-react'));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tumbleweedData = require('@/assets/Tumbleweed Rolling.json');

// ── Pure rendering layer ──────────────────────────────────────────────────────

interface DisplayProps {
  jurisdiction: States;
  bills: Bill[] | null;
  isLoading: boolean;
  cachedReps?: Rep[];
}

const ZipBillResultsDisplay: React.FC<DisplayProps> = ({ jurisdiction, bills, isLoading, cachedReps }) => {
  if (isLoading) {
    return (
      <section className="container-legislation py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <BillCardSkeleton key={i} />)}
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
            {bills.map(bill => (
              <BillCard key={bill.id} bill={bill} showSource showProgressBar viewMode="detailed" />
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
  const { data: bills, isLoading } = useBills(jurisdiction, null);

  useEffect(() => {
    setJurisdiction(jurisdiction);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jurisdiction.name, jurisdiction.zipCoords?.lat, jurisdiction.zipCoords?.lng]);

  useEffect(() => {
    if (bills && bills.length > 0) setBills(bills);
  }, [bills, setBills]);

  return <ZipBillResultsDisplay jurisdiction={jurisdiction} bills={bills} isLoading={isLoading} />;
};

// ── Smart cache wrapper ───────────────────────────────────────────────────────

const ZipBillResults: React.FC<{ jurisdiction: States }> = ({ jurisdiction }) => {
  const { isMatch, cache } = useSearchCache();
  const cacheHit = isMatch(jurisdiction) && cache.bills.length > 0;

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

function HomePageInner() {
  const [jurisdiction, setJurisdiction] = useState<States | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const didRestore = useRef(false);

  useEffect(() => {
    if (didRestore.current || jurisdiction) return;
    const q = searchParams.get('q');
    if (!q) return;
    didRestore.current = true;
    parseLocationInput(q)
      .then(setJurisdiction)
      .catch(() => router.replace('/'));
  // Only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-background text-foreground">
      <Hero onSelectState={setJurisdiction} />
      {jurisdiction && <ZipBillResults jurisdiction={jurisdiction} />}
    </div>
  );
}

// ── Page export wrapped in Suspense (required for useSearchParams) ─────────────

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="bg-background text-foreground">
        <div className="min-h-[65vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <HomePageInner />
    </Suspense>
  );
}
