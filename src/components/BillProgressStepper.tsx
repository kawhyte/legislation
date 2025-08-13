import React from 'react';
import { Gavel, CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { determineBillProgress } from '../utils/billProgress';
import { formatDate } from '../lib/utils';
import type { Bill, BillProgressStepperProps } from '@/types';

const BillProgressStepper: React.FC<BillProgressStepperProps> = ({ bill, className = "" }) => {
  const progress = determineBillProgress(bill);
  
  const dates = {
    introduced: progress.stages.introduced.date || bill.first_action_date,
    house: progress.stages.house.date,
    senate: progress.stages.senate.date, 
    enacted: progress.stages.enacted.date
  };

  const stages = [
    { key: 'introduced', label: 'Introduced', date: dates.introduced, completed: progress.stages.introduced.completed },
    { key: 'house', label: 'House', date: dates.house, completed: progress.stages.house.completed },
    { key: 'senate', label: 'Senate', date: dates.senate, completed: progress.stages.senate.completed },
    { key: 'enacted', label: 'Enacted', date: dates.enacted, completed: progress.stages.enacted.completed }
  ];

  const getStageIcon = (completed: boolean, isActive: boolean, isFailureStage: boolean) => {
    if (isFailureStage) {
      return <XCircle className="h-5 w-5 text-red-400" />;
    }
    if (completed) {
      return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
    }
    if (isActive) {
      return <Clock className="h-5 w-5 text-violet-400 animate-pulse" />;
    }
    return <Circle className="h-5 w-5 text-slate-600" />;
  };

  const currentStageIndex = stages.findIndex(stage => !stage.completed);

  return (
    <div className={`bg-slate-800/30 border border-slate-600/30 rounded-lg p-4 ${className}`}>
      <div className='flex items-center gap-2 mb-4'>
        <Gavel className='h-4 w-4 text-slate-400' />
        <span className='text-sm font-medium text-slate-300'>Progress</span>
      </div>
      
      {/* --- Horizontal Stepper UI Starts Here --- */}
      <div className="relative">
        {/* The horizontal line connecting the steps */}
        <div className="absolute left-0 right-0 top-[9px] h-0.5 w-full bg-slate-700" aria-hidden="true"></div>

        <div className="grid grid-cols-4">
          {stages.map((stage, index) => {
            const isActive = index === currentStageIndex;
            const isFailureStage = progress.current.status === 'Failed' && progress.current.stage === stage.label;

            const stageTextColor = isFailureStage
              ? 'text-red-400'
              : stage.completed
                ? 'text-emerald-400'
                : isActive
                  ? 'text-violet-400'
                  : 'text-slate-400';
            
            return (
              <div key={stage.key} className="relative flex flex-col items-center gap-2">
                {/* Icon Circle - positioned over the connecting line */}
                <div className="z-10 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800">
                  {getStageIcon(stage.completed, isActive, isFailureStage)}
                </div>
                
                {/* Stage Label and Date */}
                <div className="text-center">
                  <div className={`text-xs font-medium leading-tight ${stageTextColor}`}>
                    {stage.label}
                  </div>
                  <div className='text-[.65rem] text-slate-500 mt-0.5'>
                    {stage.date ? formatDate(stage.date) : "—"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* --- Horizontal Stepper UI Ends Here --- */}

      {progress.current.description && (
        <div className="mt-4 pt-3 border-t border-slate-700/50">
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

export default BillProgressStepper;