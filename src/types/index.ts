import { Sponsorship } from './index';
// src/types/index.ts


// From useBills.ts
export interface Jurisdiction {
	id: string;
	name: string;
	classification: string;
}

export interface Organization {
	id: string;
	name: string;
	classification: 'lower' | 'upper' | string;
}
  
export interface Action {
	id: string;
	organization: Organization;
	description: string;
	date: string;
	classification: string[];
	order: number;
}

export interface Source {
  note: string;
  url: string;
}

export interface Abstract {
  abstract: string;
  note: string;
  date: string;
}

export interface Sponsorship {
    id: string;
    person: {
        id: string;
        name: string;
    };
    organization: {
        id: string;
        name: string;
    };
    primary: boolean;
    type: string;
}

export interface VoteCount {
    option: 'yes' | 'no' | 'other';
    value: number;
}

export interface Vote {
    id: string;
    motion_text: string;
    organization: Organization;
    counts: VoteCount[];
}

export interface Bill {
	id: string;
	title: string;
	introduced: string;
	status: string;
	summary?: string;
	sources: Source[];
	jurisdiction?: Jurisdiction;
	latest_action?: string;
	latest_action_description?: string;
	identifier: string;
	latest_action_date: string;
	first_action_date: string;
	last_action_date: string;
	subject: string[];
	house_passage_date: string;
	senate_passage_date: string;
	enacted_date: string;
	actions?: Action[];
	abstracts?: Abstract[];
	momentum?: MomentumAnalysis;
	trendingReason?: string;
	sponsorships?: Sponsorship[];
	votes?: Vote[];
}

// From useBillSummary.ts
export interface UseBillSummaryOptions {
  maxLength?: number;
  targetAge?: string;
}

export interface UseBillSummaryReturn {
  summary: string | null;
  impacts: string[] | null;
  isLoading: boolean;
  error: string | null;
  generateSummary: () => void;
  cleanup: () => void;
}

// From BillCard.tsx
export interface BillCardProps {
	bill: Bill;
	showProgressBar?: boolean;
	showTrendingReason?: boolean;
	showVotes?: boolean;
	
	showSource:boolean;
}

// From BillProgressStepper.tsx
export interface BillProgressStepperProps {
  bill: Bill;
  className?: string;
}

// From billMomentum.ts
export type MomentumLevel = "Enacted" | "Passed" | "High" | "Medium" | "Low" | "Stalled" | "None";

export interface MomentumAnalysis {
  level: MomentumLevel;
  score: number;
  reasons: string[];
}