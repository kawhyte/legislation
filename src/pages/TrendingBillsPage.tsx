import React from 'react';
import useBills from '../hooks/useBills';
import BillCard from '../components/BillCard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import BillCardSkeleton from '../components/BillCardSkeleton';
import { isBillTrending } from '@/utils/isBillTrending';

const TrendingBillsPage: React.FC = () => {
  const { data, error, isLoading } = useBills(null, null);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-6">
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
          <p className="text-slate-500">No trending bills at the moment. Check back later!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {trendingBills.slice(0, 9).map((bill) => (
          <BillCard key={bill.id} bill={bill} showSource={false} showProgressBar={false} showTrendingReason={true} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Legislative Bills Trending Around The USA
          </h1>
          <p className="text-slate-500">
            Bills that are currently gaining momentum nationwide.
          </p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default TrendingBillsPage;
