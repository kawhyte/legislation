import { BrainCircuit, HeartPulse, GraduationCap, Leaf, Home, LayoutGrid, type LucideIcon } from 'lucide-react';

export interface Topic {
  label: string;
  value: string;
  icon: LucideIcon;
}

/** The single source of truth for topic filtering across the app.
 *  `value` is passed as the OpenStates `q` search param (see useBills.ts) —
 *  changing a value changes what actually gets queried, not just cosmetic. */
export const TOPICS: Topic[] = [
  { label: "Technology",  value: "ai",          icon: BrainCircuit },
  { label: "Housing",     value: "housing",     icon: Home },
  { label: "Healthcare",  value: "healthcare",  icon: HeartPulse },
  { label: "Education",   value: "education",   icon: GraduationCap },
  { label: "Environment", value: "environment", icon: Leaf },
];

export const ALL_TOPICS_OPTION: Topic = { label: "All Topics", value: "all", icon: LayoutGrid };
