import React, { useMemo } from 'react';
import BillCard from './BillCard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import BillCardSkeleton from './BillCardSkeleton';
import { isBillTrending } from '@/utils/isBillTrending';
import useTrendingBills from '@/hooks/useTrendingBills';

const LEVEL_SCORE: Record<string, number> = {
  'Enacted': 100, 'Passed': 90, 'High': 75, 'Medium': 50, 'Low': 25, 'Stalled': 0,
};

const TrendingBillsTab: React.FC = () => {
  const { data, isLoading, error } = useTrendingBills();

  // Filter to trending only, sort with enacted pinned first, cap at 9
  const trendingBills = useMemo(() => {
    return data
      .filter(isBillTrending)
      .sort((a, b) => {
        const aScore = LEVEL_SCORE[a.momentum?.level ?? ''] ?? 0;
        const bScore = LEVEL_SCORE[b.momentum?.level ?? ''] ?? 0;
        return bScore - aScore;
      })
      .slice(0, 9);
  }, [data]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <BillCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Bills</AlertTitle>
          <AlertDescription>
            There was a problem loading the bill data. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }

    if (trendingBills.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No trending bills at the moment. Check back later!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {trendingBills.map((bill) => (
          <BillCard key={bill.id} bill={bill} showSource={true} showProgressBar={true} showTrendingReason={true} viewMode="detailed" />
        ))}
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          What's Hot Right Now
        </h2>
        <p className="text-base text-muted-foreground">
          Bills gaining momentum across the country — the ones everyone's watching.
        </p>
      </div>

      {renderContent()}
    </div>
  );
};

export default TrendingBillsTab;
