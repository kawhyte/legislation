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
          <p className="text-8px-rhythm-base text-muted-foreground">No trending bills at the moment. Check back later!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {trendingBills.slice(0, 20).map((bill) => (
          <BillCard key={bill.id} bill={bill} showSource={false} showProgressBar={false} showTrendingReason={true} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="container-legislation container-section">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Legislative Bills Trending Around The USA
          </h1>
          <p className="text-8px-rhythm-lg text-muted-foreground">
            Bills that are currently gaining momentum nationwide.
          </p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default TrendingBillsPage;
