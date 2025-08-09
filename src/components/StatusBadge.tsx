import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { determineBillProgress, getStatusBadgeConfig } from '../utils/billProgress';

interface StatusBadgeProps {
  bill: any;
  showMomentum?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ bill, showMomentum = false, className = "" }) => {
  const progress = determineBillProgress(bill);
  const badgeConfig = getStatusBadgeConfig(progress);

  const getIconAndColors = (status: string) => {
    switch (status.toLowerCase()) {
      case 'became law':
      case 'enacted':
      case 'passed':
        return {
          icon: CheckCircle2,
          className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
        };
      case 'failed':
      case 'dead':
      case 'withdrawn':
        return {
          icon: XCircle,
          className: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
        };
      case 'stalled':
      case 'committee':
        return {
          icon: AlertCircle,
          className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
        };
      default:
        return {
          icon: Clock,
          className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
        };
    }
  };

  const config = getIconAndColors(badgeConfig.text);
  const IconComponent = config.icon;

  return (
    <Badge
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 h-auto font-medium border transition-colors duration-200 ${config.className} ${className}`}
    >
      <IconComponent className="h-3 w-3 flex-shrink-0" />
      <span className="truncate">{badgeConfig.text}</span>
    </Badge>
  );
};

export default StatusBadge;