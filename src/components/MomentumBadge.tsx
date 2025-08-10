import React from 'react';
import { TrendingUp, TrendingDown, Minus, Zap, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { type MomentumAnalysis } from '../utils/billMomentum';

interface MomentumBadgeProps {
  momentum: MomentumAnalysis;
  className?: string;
}

const MomentumBadge: React.FC<MomentumBadgeProps> = ({ momentum, className = "" }) => {
  const getMomentumConfig = (level: string) => {
    switch (level.toLowerCase()) {
      case "enacted":
        return {
          icon: ShieldCheck,
          text: "Enacted",
          className: "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
        };
      case "passed":
        return {
          icon: CheckCircle2,
          text: "Passed Both Chambers",
          className: "bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20"
        };
      case "high":
        return {
          icon: Zap,
          text: "High Momentum",
          className: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 hover:bg-fuchsia-500/20"
        };
      case "medium":
        return {
          icon: TrendingUp,
          text: "Steady Momentum",
          className: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
        };
      case "low":
        return {
          icon: Minus,
          text: "Slow Momentum",
          className: "bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20"
        };
      case "stalled":
        return {
          icon: XCircle,
          text: "Stalled or Failed",
          className: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
        };
      default:
        return {
          icon: Minus,
          text: "NA",
          className: "bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20"
        };
    }
  };

  const config = getMomentumConfig(momentum.level);
  const IconComponent = config.icon;

  return (
    <Badge
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 h-auto font-medium border transition-colors duration-200 ${config.className} ${className}`}
      title={`Momentum: ${momentum.level}${momentum.score ? ` (${momentum.score})` : ''}`}
    >
      <IconComponent className="h-3 w-3 flex-shrink-0" />
      <span className="truncate">{config.text}</span>
    </Badge>
  );
};

export default MomentumBadge;