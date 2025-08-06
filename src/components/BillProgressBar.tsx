// components/BillProgressBar.tsx
import React from 'react';
import { Gavel } from 'lucide-react';
import { determineBillProgress } from '../utils/billProgress';
import { Progress } from "@/components/ui/progress";
import { formatDate } from '../lib/utils';

interface BillProgressBarProps {
  bill: any; // Your Bill type
  className?: string;
}

const BillProgressBar: React.FC<BillProgressBarProps> = ({ bill, className = "" }) => {
  const progress = determineBillProgress(bill);
  
  // Extract dates from progress stages for display
  const dates = {
    introduced: progress.stages.introduced.date || bill.first_action_date,
    house: progress.stages.house.date,
    senate: progress.stages.senate.date, 
    enacted: progress.stages.enacted.date
  };

  return (
    <div className={`space-y-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 ${className}`}>
      <h3 className='text-sm font-medium text-slate-300 flex items-center'>
        <Gavel className='mr-2 h-4 w-4 text-slate-400' />
        Legislative Progress
      </h3>
      
      <div className='relative flex justify-between text-[10px] font-medium text-slate-500 mb-2'>
        <span className='text-center w-1/4'>Introduced</span>
        <span className='text-center w-1/4'>House</span>
        <span className='text-center w-1/4'>Senate</span>
        <span className='text-center w-1/4'>Enacted</span>
      </div>
      
      <Progress
        value={progress.current.percentage}
        className='h-2.5 w-full bg-slate-700/50 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-blue-500'
      />
      
      <div className='relative flex justify-between text-xs text-slate-400 mt-2'>
        <span className='text-center w-1/4'>
          {formatDate(dates.introduced) || "—"}
        </span>
        <span className='text-center w-1/4'>
          {formatDate(dates.house) || "—"}
        </span>
        <span className='text-center w-1/4'>
          {formatDate(dates.senate) || "—"}
        </span>
        <span className='text-center w-1/4'>
          {formatDate(dates.enacted) || "—"}
        </span>
      </div>

      {/* Optional: Show current status as subtle indicator */}
      {progress.current.description && (
        <div className="pt-2 border-t border-slate-700/30">
          <p className="text-xs text-slate-400">
            Status: {progress.current.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default BillProgressBar;