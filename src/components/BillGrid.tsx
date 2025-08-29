import React from "react";
import useBills from "../hooks/useBills";
import BillCard from "./BillCard";
import BillCardSkeleton from "./BillCardSkeleton";
import type { States } from "./JurisdictionSelector";
import SectionHeader from "./SectionHeader";
import animationData from "../assets/Tumbleweed Rolling.json";

const Lottie = React.lazy(() => import("lottie-react"));

interface Props {
    selectedJurisdiction: States | null;
    selectedTopic: string | null;
}

const BillGrid = ({ selectedJurisdiction, selectedTopic }: Props) => {
    const { data, error, isLoading } = useBills(
        selectedJurisdiction,
        selectedTopic
    );

    const skeletons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const hasData = !isLoading && data && data.length > 0;
    const noData = !isLoading && data && data.length === 0;

    return (
        <>
            {/* UPDATED: Added styling to the error message for consistency */}
            {error && (
                <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
                    <p className="font-medium">An error occurred while fetching bills.</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {noData && (
                // UPDATED: Replaced all slate-* dark theme colors with your new light theme variables
                <div className='flex flex-col items-center justify-center text-center py-24 bg-muted border border-border rounded-2xl mt-6'>
                    <React.Suspense fallback={<div>Loading...</div>}>
                        <Lottie
                            animationData={animationData}
                            loop={true}
                            className='w-48 h-48'
                        />
                    </React.Suspense>
                    <h3 className='text-3xl font-bold text-foreground mb-2'>
                        Tumbleweeds...
                    </h3>
                    <p className='text-lg text-muted-foreground max-w-md'>
                        {
                            "Looks like it's quiet in this corner of the legislation. No bills match your criteria right now."
                        }
                    </p>
                </div>
            )}

            <div>
                {/* NOTE: Ensure your SectionHeader component uses themed text colors like text-foreground */}
                {hasData && <SectionHeader jurisdiction={selectedJurisdiction} />}
                <div className='grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-6 mt-6'>
                    {/* NOTE: Ensure your BillCardSkeleton uses themed background colors like bg-muted */}
                    {isLoading &&
                        skeletons.map((skeleton) => <BillCardSkeleton key={skeleton} />)}
                    {hasData &&
                        data.map((bill) => (
                            <BillCard
                                key={bill.id}
                                bill={bill}
                                showSource={true}
                                showVotes={false}
                                showTrendingReason={true}
                            />
                        ))}
                </div>
            </div>
        </>
    );
};

export default BillGrid;