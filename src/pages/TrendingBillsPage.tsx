import React from 'react';
import useBills from '../hooks/useBills';
import BillCard from '../components/BillCard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import BillCardSkeleton from '../components/BillCardSkeleton';



	const quickActions = [
		"Paid Family Leave",
		"Healthcare Reform",
		"Education Bills",
		"Technology",
		"Housing Policy"
	];
 
const TrendingBillsPage: React.FC = () => {
  // Later, you can add filters for "trending"
  const { data, error, isLoading } = useBills(null);

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
        {data.slice(0, 9).map((bill) => (
          <BillCard key={bill.id} bill={bill} showProgressBar={false} showTrendingReason={true} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Legislative Bills Trending  Around The USA
          </h1>
          <p className="text-slate-500">
            Bills that's currently gaining momentum nationwide.
          </p>

					{/* Quick action tags */}
					{/* <div className={'mb-20 transition-all duration-1000 delay-700 ease-out  opacity-100 translate-y-8'}>
						<div className='flex items-center justify-start flex-wrap gap-3 text-sm'>
							<span className='font-medium text-slate-400'>
								Popular bill topics:
							</span>
							{quickActions.map((tag, index) => (
								<button
									key={tag}
									className={`px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-violet-500/50 hover:text-violet-300 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 ${
										index % 2 === 0 ? 'hover:shadow-violet-500/25' : 'hover:shadow-blue-500/25'
									} hover:shadow-lg`}
								>
									{tag}
								</button>
							))}
						</div>
					</div> */}

        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default TrendingBillsPage;
