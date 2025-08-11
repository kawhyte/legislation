// components/BillProgressBar.tsx - Improved Version
import React from 'react';
import { Gavel, CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { determineBillProgress } from '../utils/billProgress';
import { Progress } from "@/components/ui/progress";
import { formatDate } from '../lib/utils';

interface BillProgressBarProps {
  bill: any;
  className?: string;
}

const BillProgressBar: React.FC<BillProgressBarProps> = ({ bill, className = "" }) => {
  const progress = determineBillProgress(bill);
  
  const dates = {
    introduced: progress.stages.introduced.date || bill.first_action_date,
    house: progress.stages.house.date,
    senate: progress.stages.senate.date, 
    enacted: progress.stages.enacted.date
  };

  const stages = [
    { 
      key: 'introduced', 
      label: 'Introduced', 
      shortLabel: 'Intro',
      date: dates.introduced,
      completed: progress.stages.introduced.completed 
    },
    { 
      key: 'house', 
      label: 'House', 
      shortLabel: 'House',
      date: dates.house,
      completed: progress.stages.house.completed 
    },
    { 
      key: 'senate', 
      label: 'Senate', 
      shortLabel: 'Senate',
      date: dates.senate,
      completed: progress.stages.senate.completed 
    },
    { 
      key: 'enacted', 
      label: 'Enacted', 
      shortLabel: 'Law',
      date: dates.enacted,
      completed: progress.stages.enacted.completed 
    }
  ];

  const getStageIcon = (completed: boolean, isActive: boolean, isFailureStage: boolean) => {
    if (isFailureStage) {
      return <XCircle className="h-3 w-3 text-red-400" />;
    }
    if (completed) {
      return <CheckCircle2 className="h-3 w-3 text-emerald-400" />;
    }
    if (isActive) {
      return <Clock className="h-3 w-3 text-violet-400" />;
    }
    return <Circle className="h-3 w-3 text-slate-500" />;
  };

  const getProgressBarColor = () => {
    switch (progress.current.status) {
      case 'Passed':
        return '[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-500';
      case 'Failed':
        return '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-rose-500';
      default:
        return '[&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-blue-500';
    }
  };

  const currentStageIndex = stages.findIndex(stage => !stage.completed);
  
  return (
    <div className={`bg-slate-800/30 border border-slate-600/30 rounded-lg p-3 ${className}`}>
      <div className='flex items-center gap-2 mb-3'>
        <Gavel className='h-4 w-4 text-slate-400' />
        <span className='text-sm font-medium text-slate-300'>Progress</span>
        <div className='ml-auto text-[.65rem] text-slate-500'>
          {progress.current.percentage.toFixed(0)}% complete
        </div>
      </div>
      
      {/* Progress bar */}
      <div className='mb-3'>
        <Progress
          value={progress.current.percentage}
          className={`h-2 w-full bg-slate-700/50 ${getProgressBarColor()} [&>div]:transition-all [&>div]:duration-300`}
        />
      </div>
      
      {/* Stage indicators */}
      <div className='grid grid-cols-4 gap-2'>
        {stages.map((stage, index) => {
          const isActive = index === currentStageIndex;
          const isFailureStage = progress.current.status === 'Failed' && progress.current.stage === stage.label;

          const stageTextColor = isFailureStage
            ? 'text-red-400'
            : stage.completed
              ? 'text-emerald-400'
              : isActive
                ? 'text-violet-400'
                : 'text-slate-500';
          
          return (
            <div key={stage.key} className='flex flex-col items-center gap-1'>
              <div className='flex items-center justify-center'>
                {getStageIcon(stage.completed, isActive, isFailureStage)}
              </div>
              <div className='text-center'>
                <div className={`text-xs font-medium leading-tight ${stageTextColor}`}>
                  <span className="hidden sm:inline">{stage.label}</span>
                  <span className="sm:hidden">{stage.shortLabel}</span>
                </div>
                <div className='text-[.65rem] text-slate-500 mt-0.5'>
                  {stage.date ? formatDate(stage.date) : "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current status */}
      {progress.current.description && (
        <div className="mt-3 pt-2 border-t border-slate-700/30">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${progress.current.status === 'Failed' ? 'bg-red-400' : 'bg-violet-400 animate-pulse'}`}></div>
            <p className="text-xs text-slate-400">
              {progress.current.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillProgressBar;
