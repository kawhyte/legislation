
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
	date: string;
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
export type BillViewMode = 'detailed' | 'quick';

export interface BillCardProps {
	bill: Bill;
	showProgressBar?: boolean;
	showTrendingReason?: boolean;
	showVotes?: boolean;
	showSource?: boolean;
	viewMode?: BillViewMode;
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

// User Management Types
export interface UserPreferences {
  userId: string;
  displayName: string;
  selectedState: string; // State abbreviation (e.g., "CA", "TX")
  profileSetupCompleted: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// DTO for creating/updating user preferences (excludes auto-generated fields)
export interface CreateUserPreferencesDTO {
  displayName: string;
  selectedState: string;
}

export interface UpdateUserPreferencesDTO {
  displayName?: string;
  selectedState?: string;
  profileSetupCompleted?: boolean;
}

// Saved Bill Types
export interface SavedBill {
  id: string; // Document ID in Firestore
  userId: string;
  billId: string; // OpenStates bill ID
  billData: Bill; // Full bill object for offline access
  savedAt: string; // ISO string
  notes?: string; // User's personal notes about the bill
}

// DTO for saving a bill (excludes auto-generated fields)
export interface SaveBillDTO {
  billId: string;
  billData: Bill;
  notes?: string;
}

// User context types
export interface UserContextType {
  // User preferences
  userPreferences: UserPreferences | null;
  isLoadingPreferences: boolean;
  updateUserPreferences: (preferences: UpdateUserPreferencesDTO) => Promise<void>;
  completeProfileSetup: (preferences: CreateUserPreferencesDTO) => Promise<void>;
  
  // Saved bills
  savedBills: SavedBill[];
  isLoadingSavedBills: boolean;
  saveBill: (billData: SaveBillDTO) => Promise<void>;
  removeSavedBill: (billId: string) => Promise<void>;
  isBillSaved: (billId: string) => boolean;
  
  // Auth state helpers
  isProfileSetupRequired: boolean;
}