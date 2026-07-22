'use client';

import React from "react";
import useTrendingBills from "../hooks/useTrendingBills";
import BillCard from "./BillCard";
import BillCardSkeleton from "./BillCardSkeleton";
import { useCachedSummaries } from "../hooks/useCachedSummaries";
import animationData from "../assets/Tumbleweed Rolling.json";
import type { BillViewMode } from "@/types";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Lottie = React.lazy(() => import("lottie-react"));

interface Props {
    viewMode?: BillViewMode;
    // 20 matches the rendered card count on /trending. The homepage passes a
    // smaller number so the loading state is not a screen and a half of pulse.
    skeletonCount?: number;
}

const TrendingBillGrid = ({ viewMode = 'quick', skeletonCount = 20 }: Props) => {
    const { data, error, isLoading } = useTrendingBills();

    const skeletons = Array.from({ length: skeletonCount }, (_, i) => i);

    // useTrendingBills already ranks by topic-weighted activity score and drops
    // junk/stalled bills — render its output directly. The per-card "🔥 Trending"
    // badge still comes from each bill's `trendingReason` (set inside the hook).
    const trendingBills = (data ?? []).slice(0, 20);
    const hasData = !isLoading && trendingBills.length > 0;
    const noData = !isLoading && trendingBills.length === 0;

    // Only the feed variant renders summaries, so only it pays for the reads.
    // Cache-only: no /api/summarize call, no Gemini tokens.
    const summaries = useCachedSummaries(viewMode === 'feed' ? trendingBills : []);

    return (
        <>
            {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Fetching Bills</AlertTitle>
                    <AlertDescription>
                        There was a problem loading the bill data. Please try again later.
                    </AlertDescription>
                </Alert>
            )}

            {noData && (
                <div className="text-center py-20">
                    <React.Suspense fallback={<div>Loading...</div>}>
                        <Lottie
                            animationData={animationData}
                            loop={true}
                            className='w-48 h-48 mx-auto'
                        />
                    </React.Suspense>
                    <h3 className='text-3xl font-bold text-foreground mb-2'>
                        No Trending Bills
                    </h3>
                    <p className='text-lg text-muted-foreground max-w-md mx-auto'>
                        No bills are trending nationwide at the moment. Check back later!
                    </p>
                </div>
            )}

            <div className="">
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4'>
                    {isLoading &&
                        skeletons.map((skeleton) => <BillCardSkeleton key={skeleton} showSource={false} viewMode={viewMode} />)}
                    {hasData &&
                        trendingBills.map((bill, index) => (
                            <BillCard
                                key={bill.id}
                                bill={bill}
                                showSource={false}
                                showTrendingReason={true}
                                viewMode={viewMode}
                                summary={summaries.get(bill.id)}
                                feedName='trending'
                                position={index}
                            />
                        ))}
                </div>
            </div>
        </>
    );
};

export default TrendingBillGrid;