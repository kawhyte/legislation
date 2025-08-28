import React from 'react';
import { TrendingUp, TrendingDown, Minus, Flame, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import type { MomentumAnalysis } from '@/types';

interface MomentumBadgeProps {
  momentum: MomentumAnalysis;
  className?: string;
}

const MomentumBadge: React.FC<MomentumBadgeProps> = ({ momentum, className = "" }) => {
  const getMomentumConfig = (level: string) => {
    // UPDATED: All hardcoded colors have been replaced with your theme's semantic variables.
    switch (level.toLowerCase()) {
      case "enacted":
        return {
          icon: ShieldCheck,
          text: "Enacted/Became Law",
          className: "bg-success/10 text-success border-success/20 hover:bg-success/20"
        };
      case "passed":
        return {
          icon: CheckCircle2,
          text: "Passed Both Chambers",
          className: "bg-info/10 text-info border-info/20 hover:bg-info/20"
        };
      case "high":
        return {
          icon: Flame,
          text: "High Momentum",
          className: "bg-accent text-accent-foreground border-border hover:bg-muted"
        };
      case "medium":
        return {
          icon: TrendingUp,
          text: "Steady Momentum",
          className: "bg-accent text-accent-foreground border-border hover:bg-muted"
        };
      case "low":
        return {
          icon: TrendingDown,
          text: "Slow Momentum",
          className: "bg-accent text-accent-foreground border-border hover:bg-muted"
        };
      case "stalled":
        return {
          icon: XCircle,
          text: "Stalled or Failed",
          className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
        };
      default:
        return {
          icon: Minus,
          text: "NA",
          className: "bg-muted text-muted-foreground border-border"
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