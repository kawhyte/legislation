import React from "react";
import useBills from "../hooks/useBills";
import BillCard from "./BillCard";
import BillCardSkeleton from "./BillCardSkeleton";
import animationData from "../assets/Tumbleweed Rolling.json";
import { isBillTrending } from '@/utils/isBillTrending';
import type { BillViewMode } from "@/types";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Lottie = React.lazy(() => import("lottie-react"));

interface Props {
    viewMode?: BillViewMode;
}

const TrendingBillGrid = ({ viewMode = 'quick' }: Props) => {
    const { data, error, isLoading } = useBills(null, null);

    const skeletons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    // Filter for trending bills
    const trendingBills = data?.filter(isBillTrending) ?? [];
    const hasData = !isLoading && trendingBills && trendingBills.length > 0;
    const noData = !isLoading && trendingBills && trendingBills.length === 0;

    return (
        <>
            {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
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