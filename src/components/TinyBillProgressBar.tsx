import React from 'react';
import { determineBillProgress } from '../utils/billProgress';
import { Progress } from "@/components/ui/progress";
import { type Bill } from '../hooks/useBills';

interface TinyBillProgressBarProps {
  bill: Bill;
}

const TinyBillProgressBar: React.FC<TinyBillProgressBarProps> = ({ bill }) => {
  const progress = determineBillProgress(bill);

  const getProgressColor = () => {
    switch (progress.current.status) {
      case 'Passed':
        return '[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-500';
      case 'Failed':
        return '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-rose-500';
      case 'In Progress':
      default:
        return '[&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-blue-500';
    }
  };

  return (
    <div className='w-full'>
      <div className='flex justify-between items-center mb-1'>
        <span className='text-xs font-medium text-slate-300'>{progress.current.description}</span>
        <span className='text-xs font-bold text-slate-200'>{progress.current.percentage.toFixed(0)}%</span>
      </div>
      <Progress
        value={progress.current.percentage}
        className={`h-1.5 w-full bg-slate-700/50 ${getProgressColor()}`}
      />
    </div>
  );
};

export default TinyBillProgressBar;