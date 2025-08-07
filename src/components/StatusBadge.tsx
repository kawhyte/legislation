// components/StatusBadge.tsx
import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { determineBillProgress, getStatusBadgeConfig, type BillProgress } from '../utils/billProgress';

interface StatusBadgeProps {
  bill: any; // Your Bill type
  className?: string;
}

/**
 * StatusBadge component that automatically determines status based on bill progress
 * Uses centralized logic from billProgress utilities for consistency
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ bill, className = "" }) => {
  const progress = determineBillProgress(bill);
  const badgeConfig = getStatusBadgeConfig(progress);

  // Icon mapping for dynamic icon rendering
  const IconComponent = {
    CheckCircle2,
    XCircle,
    Clock
  }[badgeConfig.icon];

  return (
    <Badge className={`${badgeConfig.className} ${className}`}>
      <IconComponent className='h-3.5 w-3.5' />
      {badgeConfig.text}
    </Badge>
  );
};

export default StatusBadge;