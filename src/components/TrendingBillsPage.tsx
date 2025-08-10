import React from 'react';
import useBills from '../hooks/useBills';
import TrendingBillCard from './TrendingBillCard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import BillCardSkeleton from './BillCardSkeleton';

const TrendingBillsPage: React.FC = () => {
  // Later, you can add filters for "trending"
  const { data, error, isLoading } = useBills('Florida');

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

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.map((bill) => (
          <TrendingBillCard key={bill.id} bill={bill} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Trending Bills
          </h1>
          <p className="text-slate-400">
            Discover legislation that's gaining momentum nationwide.
          </p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default TrendingBillsPage;
