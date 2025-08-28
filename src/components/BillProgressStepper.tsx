import React from 'react';
import { Gavel, Check, X } from 'lucide-react';
import { determineBillProgress } from '../utils/billProgress';
import type { BillProgressStepperProps } from '@/types';

const BillProgressStepper: React.FC<BillProgressStepperProps> = ({ bill, className = "" }) => {
  const progress = determineBillProgress(bill);
 console.log("Bill", bill)
console.log("Progress", progress)

  
  const originalStages = [
    { key: 'introduced', label: 'Introduced' },
    { key: 'house', label: 'House' },
    { key: 'senate', label: 'Senate' }, 
    { key: 'enacted', label: 'Enacted' }
  ];

  const stages = originalStages.map((stageKey) => {
    const stageProgress = progress.stages[stageKey.key as keyof typeof progress.stages];
    const isActive = progress.current.stage === stageProgress.label && !stageProgress.completed;
    const isFailed = progress.current.status === 'Failed' && progress.current.stage === stageProgress.label;

    let status: 'Completed' | 'In Progress' | 'Pending' | 'Failed' = 'Pending';
    if (isFailed) {
      status = 'Failed';
    } else if (stageProgress.completed) {
      status = 'Completed';
    } else if (isActive) {
      status = 'In Progress';
    }

    return { ...stageKey, status };
  });

  let lastCompletedIndex = -1;
  stages.forEach((s, i) => {
    if (s.status === 'Completed') lastCompletedIndex = i;
  });

  let progressWidth = '0%';
  if (lastCompletedIndex === stages.length - 1) {
    progressWidth = '100%';
  } else if (lastCompletedIndex !== -1) {
    progressWidth = `${(lastCompletedIndex / (stages.length - 1)) * 100}%`;
  }
  
  const statusDotColor = {
    "Failed": "bg-red-500",
    "Passed": "bg-emerald-600",
    "In Progress": "bg-blue-600"
  }[progress.current.status] ?? "bg-gray-400";

  return (
    <div className={`bg-slate-100/30 border border-slate-600/30 rounded-lg p-3 ${className}`}>
      <div className='flex items-center gap-2 mb-3'>
        <Gavel className='h-3.5 w-3.5 text-slate-700' />
        <span className='text-xs font-medium text-slate-700'>Progress</span>
      </div>
      
      <div className="relative">
        <div className="absolute top-3 left-0 w-full h-0.5 bg-slate-300" aria-hidden="true" />
        <div 
          className="absolute top-3 left-0 h-0.5 bg-emerald-600" 
          style={{ width: progressWidth }} 
          aria-hidden="true" 
        />

        <div className="relative flex justify-between">
          {/* FIX 1: Added 'index' to the map function arguments */}
          {stages.map((stage, index) => {
            const isCompleted = stage.status === 'Completed';
            const isInProgress = stage.status === 'In Progress';
            const isFailed = stage.status === 'Failed';
            
            const colors = {
              completed: 'text-emerald-600',
              inProgress: 'text-blue-600',
              pending: 'text-slate-500',
              failed: 'text-red-500'
            };
            
            const statusColor = isFailed ? colors.failed : isCompleted ? colors.completed : isInProgress ? colors.inProgress : colors.pending;

            return (
              <div key={stage.key} className="flex flex-col items-center">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center
                  ${isFailed ? 'bg-red-500' : ''}
                  ${isCompleted ? 'bg-emerald-600' : ''}
                  ${isInProgress ? 'bg-white border-2 border-blue-600' : ''}
                  ${stage.status === 'Pending' ? 'bg-slate-300' : ''}
                `}>
                  {isFailed && <X className="w-3.5 h-3.5 text-white" />}
                  {isCompleted && <Check className="w-3.5 h-3.5 text-white" />}
                  {isInProgress && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                </div>
                
                <div className="text-center mt-1.5">
                  <p className="text-[9px] text-slate-500 tracking-wider font-medium">STEP {index + 1}</p>
                  <p className="text-[11px] font-semibold text-slate-800">{stage.label}</p>
                  <p className={`text-[10px] font-medium ${statusColor}`}>{stage.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {progress.current.description && (
        <div className="mt-3 pt-2 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusDotColor}`}></div>
            <p className="text-[11px] text-slate-700">
              {progress.current.description}
           
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillProgressStepper;