import React from 'react';
import { Gavel, Check, X } from 'lucide-react';
import { determineBillProgress } from '../utils/billProgress';
import type { BillProgressStepperProps } from '@/types';

const BillProgressStepper: React.FC<BillProgressStepperProps> = ({ bill, className = "" }) => {
  const progress = determineBillProgress(bill);


  
  const originalStages = [
    { key: 'introduced', label: 'Introduced' },
    { key: 'house', label: 'House' },
    { key: 'senate', label: 'Senate' }, 
    { key: 'enacted', label: 'Enacted' }
  ];

  const stages = originalStages.map((stageKey) => {
    const stageProgress = progress.stages[stageKey.key as keyof typeof progress.stages];
    const isActive = progress.current.stage === stageKey.label && !stageProgress.completed;
    const isFailed = progress.current.status === 'Failed' && progress.current.stage === stageKey.label;

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
    "Failed": "bg-destructive",
    "Passed": "bg-success",
    "In Progress": "bg-success"
  }[progress.current.status] ?? "bg-border";

  return (
    <div className={` border border-border rounded-lg p-3 ${className}`}>
      <div className='flex items-center gap-2 mb-3'>
      <Gavel className='h-3.5 w-3.5 text-muted-foreground' />
        <span className='text-xs font-medium text-muted-foreground'>Progress</span>
      </div>
      
      <div className="relative">
        <div className="absolute top-3 left-0 w-full h-0.5 bg-border" aria-hidden="true" />
       <div 
          className="absolute top-3 left-0 h-0.5 bg-success" 
          style={{ width: progressWidth }} 
          aria-hidden="true" 
        />

        <div className="relative flex justify-between">
       
          {stages.map((stage, index) => {
            const isCompleted = stage.status === 'Completed';
            const isInProgress = stage.status === 'In Progress';
            const isFailed = stage.status === 'Failed';
            
            const colors = {
              completed: 'text-success',
              inProgress: 'text-success',
              pending: 'text-success',
              failed: 'text-destructive'
            };
            
            const statusColor = isFailed ? colors.failed : isCompleted ? colors.completed : isInProgress ? colors.inProgress : colors.pending;

            return (
              <div key={stage.key} className="flex flex-col items-center">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center
                  ${/* UPDATED: Replaced hardcoded backgrounds with theme variables */''}
                  ${isFailed ? 'bg-destructive' : ''}
                  ${isCompleted ? 'bg-success' : ''}
                  ${isInProgress ? 'bg-card border-2 border-info' : ''}
                  ${stage.status === 'Pending' ? 'bg-border' : ''}
                `}>
              {isFailed && <X className="w-3.5 h-3.5 text-primary-foreground" />}
                  {isCompleted && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                  {isInProgress && <div className="w-2 h-2 rounded-full bg-info"></div>}
                </div>
                
                <div className="text-center mt-1.5">
                <p className="text-[9px] text-muted-foreground tracking-wider font-medium">STEP {index + 1}</p>
                  <p className="text-[11px] font-semibold text-foreground">{stage.label}</p>
                  <p className={`text-[10px] font-medium ${statusColor}`}>{stage.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {progress.current.description && (
       <div className="mt-3 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusDotColor}`}></div>
            <p className="text-[11px] text-muted-foreground">
              {progress.current.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillProgressStepper;