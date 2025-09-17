import React, { useState } from 'react';
import useBills from '../hooks/useBills';
import BillCard from './BillCard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import BillCardSkeleton from './BillCardSkeleton';
import BillViewSwitcher from './BillViewSwitcher';
import { isBillTrending } from '@/utils/isBillTrending';
import type { BillViewMode } from '@/types';

const TrendingBillsTab: React.FC = () => {
  const { data, error, isLoading } = useBills(null, null);
  const [viewMode, setViewMode] = useState<BillViewMode>('quick');

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

    const trendingBills = data?.filter(isBillTrending) ?? [];

    if (trendingBills.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No trending bills at the moment. Check back later!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {trendingBills.slice(0, 9).map((bill) => (
          <BillCard key={bill.id} bill={bill} showSource={true} showProgressBar={true} showTrendingReason={true} viewMode={viewMode} />
        ))}
      </div>
    );
  };

  return (
    <div className='space-y-12'>
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Legislative Bills Trending Around The USA
        </h2>
        <p className="text-lg text-muted-foreground">
          Bills that are currently gaining momentum nationwide.
        </p>
      </div>

      {/* View Switcher */}
      <div className="flex justify-between items-center">
        <BillViewSwitcher 
          value={viewMode}
          onValueChange={setViewMode}
        />
      </div>

      {renderContent()}
    </div>
  );
};

export default TrendingBillsTab;