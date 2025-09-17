import React from 'react';
import { FileText, Zap } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { BillViewMode } from '@/types';

interface BillViewSwitcherProps {
  value: BillViewMode;
  onValueChange: (value: BillViewMode) => void;
  className?: string;
}

const BillViewSwitcher: React.FC<BillViewSwitcherProps> = ({
  value,
  onValueChange,
  className = ""
}) => {
  return (
    <ToggleGroup 
      type="single" 
      value={value}
      onValueChange={(newValue) => {
        if (newValue) onValueChange(newValue as BillViewMode);
      }}
      className={`bg-white border border-border rounded-lg p-1 ${className}`}
    >
      <ToggleGroupItem 
        value="detailed" 
        className="gap-2 px-4 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        aria-label="Detailed view - shows complete bill information including progress and sources"
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Detailed View</span>
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="quick" 
        className="gap-2 px-4 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        aria-label="Quick view - shows essential bill information for fast browsing"
      >
        <Zap className="h-4 w-4" />
        <span className="hidden sm:inline">Quick View</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default BillViewSwitcher;