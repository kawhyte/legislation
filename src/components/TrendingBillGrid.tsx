'use client';

import React from "react";
import useTrendingBills from "../hooks/useTrendingBills";
import BillCard from "./BillCard";
import BillCardSkeleton from "./BillCardSkeleton";
import animationData from "../assets/Tumbleweed Rolling.json";
import type { BillViewMode } from "@/types";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Lottie = React.lazy(() => import("lottie-react"));

interface Props {
    viewMode?: BillViewMode;
}

const TrendingBillGrid = ({ viewMode = 'quick' }: Props) => {
    const { data, error, isLoading } = useTrendingBills();

    const skeletons = Array.from({ length: 20 }, (_, i) => i);

    // useTrendingBills already ranks by topic-weighted activity score and drops
    // junk/stalled bills — render its output directly. The per-card "🔥 Trending"
    // badge still comes from each bill's `trendingReason` (set inside the hook).
    const trendingBills = data ?? [];
    const hasData = !isLoading && trendingBills.length > 0;
    const noData = !isLoading && trendingBills.length === 0;

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
                        skeletons.map((skeleton) => <BillCardSkeleton key={skeleton} />)}
                    {hasData &&
                        trendingBills.slice(0, 20).map((bill) => (
                            <BillCard
                                key={bill.id}
                                bill={bill}
                                showSource={false}
                                showVotes={false}
                                showTrendingReason={true}
                                viewMode={viewMode}
                            />
                        ))}
                </div>
            </div>
        </>
    );
};

export default TrendingBillGrid;