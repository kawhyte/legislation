import React from 'react';
import { TrendingUp, TrendingDown, Flame, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import type { Bill } from '@/types';

interface BillStatusPillProps {
  bill: Bill;
  className?: string;
}

/**
 * The feed variant's single status line. This is a restyle of MomentumBadge's
 * level map with feed-appropriate copy ("Now law", not "Enacted/Became Law") —
 * it deliberately does NOT recompute momentum; every feed path already attaches
 * `bill.momentum` via analyzeBillMomentum().
 *
 * `None` renders nothing: a badge that says "no momentum" is noise on a card
 * whose job is to answer "what does this do to me?".
 */
const getPillConfig = (level: string) => {
  switch (level.toLowerCase()) {
    case "enacted":
      return {
        icon: ShieldCheck,
        text: "Now law",
        className: "bg-success/10 text-success border-success/20",
      };
    case "passed":
      return {
        icon: CheckCircle2,
        text: "Passed both chambers",
        className: "bg-info/10 text-info border-info/20",
      };
    case "high":
      return {
        icon: Flame,
        text: "Moving fast",
        // accent-yellow is a plain utility, not a Tailwind color scale, so it
        // takes no /10 opacity modifier — the solid fill is the token pairing.
        className: "bg-accent-yellow text-on-yellow border-foreground/20",
      };
    case "medium":
      return {
        icon: TrendingUp,
        text: "In progress",
        className: "bg-muted text-muted-foreground border-border",
      };
    case "low":
      return {
        icon: TrendingDown,
        text: "Early stage",
        className: "bg-muted text-muted-foreground border-border",
      };
    case "stalled":
      return {
        icon: XCircle,
        text: "Stalled",
        className: "bg-destructive/10 text-destructive border-destructive/20",
      };
    default:
      return null;
  }
};

const BillStatusPill: React.FC<BillStatusPillProps> = ({ bill, className = "" }) => {
  if (!bill.momentum) return null;

  const config = getPillConfig(bill.momentum.level);
  if (!config) return null;

  const IconComponent = config.icon;

  return (
    <Badge
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 h-auto font-medium border ${config.className} ${className}`}
    >
      <IconComponent className="h-3 w-3 flex-shrink-0" />
      <span className="truncate">{config.text}</span>
    </Badge>
  );
};

export default BillStatusPill;
