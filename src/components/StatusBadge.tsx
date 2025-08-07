// components/StatusBadge.tsx - Enhanced with momentum display

import React from 'react';
import { CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { determineBillProgress, getStatusBadgeConfig } from '../utils/billProgress';
import { type MomentumAnalysis } from '../utils/billMomentum';

interface StatusBadgeProps {
  bill: any;
  className?: string;
  showMomentum?: boolean; // New prop to control momentum display
}

/**
 * Enhanced StatusBadge that shows both bill progress and momentum for introduction-stage bills
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  bill, 
  className = "", 
  showMomentum = true 
}) => {
  const progress = determineBillProgress(bill);
  const badgeConfig = getStatusBadgeConfig(progress);
  const momentum: MomentumAnalysis | undefined = bill.momentum;

  // Icon mapping for dynamic icon rendering
  const IconComponent = {
    CheckCircle2,
    XCircle,
    Clock
  }[badgeConfig.icon];

  // If bill is past introduction stage, show standard status badge
  if (!momentum?.isIntroductionStage || !showMomentum) {
    return (
      <Badge className={`${badgeConfig.className} ${className}`}>
        <IconComponent className='h-3.5 w-3.5' />
        {badgeConfig.text}
      </Badge>
    );
  }

  // For introduction stage bills, show momentum-enhanced badge
  const getMomentumConfig = (momentumLevel: string) => {
    switch (momentumLevel) {
      case "High":
        return {
          icon: TrendingUp,
          text: "High Momentum",
          className: "gap-1.5 pl-2.5 pr-3 py-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
        };
      case "Medium":
        return {
          icon: TrendingUp,
          text: "Medium Momentum", 
          className: "gap-1.5 pl-2.5 pr-3 py-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 transition-colors"
        };
      case "Low":
        return {
          icon: Minus,
          text: "Low Activity",
          className: "gap-1.5 pl-2.5 pr-3 py-1.5 bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20 transition-colors"
        };
      default:
        return {
          icon: Clock,
          text: "In Progress",
          className: badgeConfig.className
        };
    }
  };

  const momentumConfig = getMomentumConfig(momentum.level);
  const MomentumIcon = momentumConfig.icon;

  return (
    <div className="flex flex-col gap-1">
      {/* Primary Status Badge */}
      <Badge className={`${badgeConfig.className} ${className}`}>
        <IconComponent className='h-3.5 w-3.5' />
        {badgeConfig.text}
      </Badge>
      
      {/* Momentum Badge */}
      <Badge 
        className={`${momentumConfig.className} text-xs`}
        title={`Momentum Score: ${momentum.score}\nReasons: ${momentum.reasons.join(', ')}`}
      >
        <MomentumIcon className='h-3 w-3' />
        {momentumConfig.text}
      </Badge>
    </div>
  );
};

export default StatusBadge;