// utils/billProgress.ts

export type ProgressStage = "Introduced" | "House" | "Senate" | "Enacted";

export interface ProgressInfo {
  stage: ProgressStage;
  percentage: number;
  isComplete: boolean;
  description: string;
}

export interface BillProgress {
  current: ProgressInfo;
  stages: {
    introduced: { completed: boolean; date?: string };
    house: { completed: boolean; date?: string };
    senate: { completed: boolean; date?: string };
    enacted: { completed: boolean; date?: string };
  };
}

/**
 * Determines bill progress stage based on OpenStates API data
 * This function analyzes the available bill data to determine current progress
 */
export function determineBillProgress(bill: any): BillProgress {
  const stages = {
    introduced: { completed: false, date: undefined as string | undefined },
    house: { completed: false, date: undefined as string | undefined },
    senate: { completed: false, date: undefined as string | undefined },
    enacted: { completed: false, date: undefined as string | undefined },
  };

  // Stage 1: Introduced - Always true if we have the bill
  if (bill.first_action_date) {
    stages.introduced.completed = true;
    stages.introduced.date = bill.first_action_date;
  }

  // Analyze latest_action_description for key indicators
  const actionDescription = bill.latest_action_description?.toLowerCase() || "";
  const classification = bill.classification?.[0]?.toLowerCase() || "";
  
  // Stage 4: Enacted/Became Law - Check for enactment indicators
  const enactedIndicators = [
    "signed by governor",
    "became law",
    "enacted",
    "effective",
    "signed by officers and filed",
    "approved by governor",
    "chapter"
  ];

  const isEnacted = enactedIndicators.some(indicator => 
    actionDescription.includes(indicator)
  );

  if (isEnacted || bill.latest_passage_date) {
    stages.enacted.completed = true;
    stages.enacted.date = bill.latest_passage_date || bill.latest_action_date;
    stages.senate.completed = true; // Must have passed senate to be enacted
    stages.house.completed = true;  // Must have passed house to be enacted
  }

  // Stage 2 & 3: House and Senate passage
  // Check for passage indicators
  const passageIndicators = [
    "passed",
    "adopted",
    "concurred",
    "agreed to"
  ];

  const hasPassageAction = passageIndicators.some(indicator => 
    actionDescription.includes(indicator)
  );

  if (hasPassageAction && !stages.enacted.completed) {
    // Determine which chamber based on from_organization or action description
    const fromOrganization = bill.from_organization?.classification?.toLowerCase();
    
    if (fromOrganization === "lower" || actionDescription.includes("house")) {
      stages.house.completed = true;
      stages.house.date = bill.latest_action_date;
    } else if (fromOrganization === "upper" || actionDescription.includes("senate")) {
      stages.senate.completed = true;
      stages.senate.date = bill.latest_action_date;
      stages.house.completed = true; // Assume house passed first
    }
  }

  // Check for failure indicators
  const failureIndicators = [
    "died",
    "failed",
    "rejected",
    "withdrawn",
    "indefinitely postponed"
  ];

  const hasFailed = failureIndicators.some(indicator => 
    actionDescription.includes(indicator)
  );

  // Determine current stage
  let currentStage: ProgressStage = "Introduced";
  let percentage = 25;

  if (stages.enacted.completed) {
    currentStage = "Enacted";
    percentage = 100;
  } else if (stages.senate.completed) {
    currentStage = "Senate";
    percentage = 75;
  } else if (stages.house.completed) {
    currentStage = "House";
    percentage = 50;
  }

  // If bill failed, keep the last successful stage but mark as failed
  const description = hasFailed 
    ? `Failed in ${currentStage}`
    : `${currentStage}`;

  return {
    current: {
      stage: currentStage,
      percentage,
      isComplete: stages.enacted.completed,
      description
    },
    stages
  };
}

/**
 * Gets appropriate color classes for progress stage
 */
export function getProgressColors(stage: ProgressStage, isFailed: boolean = false): {
  primary: string;
  secondary: string;
  background: string;
  text: string;
} {
  if (isFailed) {
    return {
      primary: "bg-rose-400",
      secondary: "bg-rose-200",
      background: "bg-rose-50",
      text: "text-rose-700"
    };
  }

  switch (stage) {
    case "Introduced":
      return {
        primary: "bg-blue-400",
        secondary: "bg-blue-200", 
        background: "bg-blue-50",
        text: "text-blue-700"
      };
    case "House":
      return {
        primary: "bg-amber-400",
        secondary: "bg-amber-200",
        background: "bg-amber-50", 
        text: "text-amber-700"
      };
    case "Senate":
      return {
        primary: "bg-purple-400",
        secondary: "bg-purple-200",
        background: "bg-purple-50",
        text: "text-purple-700"
      };
    case "Enacted":
      return {
        primary: "bg-emerald-400", 
        secondary: "bg-emerald-200",
        background: "bg-emerald-50",
        text: "text-emerald-700"
      };
    default:
      return {
        primary: "bg-gray-400",
        secondary: "bg-gray-200",
        background: "bg-gray-50",
        text: "text-gray-700"
      };
  }
}