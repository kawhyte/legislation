// utils/billProgress.ts

export type ProgressStage = "Introduced" | "House" | "Senate" | "Enacted";
export type BillStatus = "Passed" | "Failed" | "In Progress";

export interface ProgressInfo {
  stage: ProgressStage;
  percentage: number;
  isComplete: boolean;
  description: string;
  status: BillStatus;
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
 * Determines bill progress stage and status based on OpenStates API data
 * This function analyzes action classifications and descriptions to determine accurate progress
 */
export function determineBillProgress(bill: any): BillProgress {
  const stages = {
    introduced: { completed: false, date: undefined as string | undefined },
    house: { completed: false, date: undefined as string | undefined },
    senate: { completed: false, date: undefined as string | undefined },
    enacted: { completed: false, date: undefined as string | undefined },
  };

  // Always mark introduced if we have a first action date
  if (bill.first_action_date) {
    stages.introduced.completed = true;
    stages.introduced.date = bill.first_action_date;
  }

  // Sort actions by date to process chronologically
  const sortedActions = (bill.actions || []).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let hasFailureIndicator = false;
  let housePassageDate: string | undefined;
  let senatePassageDate: string | undefined;
  let enactmentDate: string | undefined;

  // Process each action chronologically
  for (const action of sortedActions) {
    const classifications = action.classification || [];
    const description = action.description?.toLowerCase() || "";
    const orgClassification = action.organization?.classification?.toLowerCase();

    // Check for failure indicators
    const failureKeywords = [
      "died", "failed", "rejected", "withdrawn", "indefinitely postponed",
      "tabled", "killed", "vetoed", "do not pass"
    ];
    
    if (failureKeywords.some(keyword => description.includes(keyword))) {
      hasFailureIndicator = true;
      continue;
    }

    // Check for enactment (final step)
    const enactmentClassifications = ["became-law", "executive-signature"];
    const enactmentKeywords = [
      "chaptered by secretary of state",
      "signed by governor",
      "became law",
      "enacted",
      "approved by governor",
      "signed into law"
    ];

    if (enactmentClassifications.some(cls => classifications.includes(cls)) ||
        enactmentKeywords.some(keyword => description.includes(keyword))) {
      enactmentDate = action.date;
      stages.enacted.completed = true;
      stages.enacted.date = action.date;
      // If enacted, both chambers must have passed
      stages.house.completed = true;
      stages.senate.completed = true;
      if (!housePassageDate) housePassageDate = action.date;
      if (!senatePassageDate) senatePassageDate = action.date;
      continue;
    }

    // Check for chamber passage
    if (classifications.includes("passage")) {
      if (orgClassification === "lower" || description.includes("assembly")) {
        // House/Assembly passage
        if (!housePassageDate) {
          housePassageDate = action.date;
          stages.house.completed = true;
          stages.house.date = action.date;
        }
      } else if (orgClassification === "upper" || description.includes("senate")) {
        // Senate passage
        if (!senatePassageDate) {
          senatePassageDate = action.date;
          stages.senate.completed = true;
          stages.senate.date = action.date;
        }
      }
    }

    // Special handling for concurrent resolutions and other types
    // that might use "adopted" instead of "passed"
    if (classifications.includes("amendment-passage") && 
        (description.includes("adopted") || description.includes("passed"))) {
      
      if (orgClassification === "lower" || description.includes("assembly")) {
        if (!housePassageDate) {
          housePassageDate = action.date;
          stages.house.completed = true;
          stages.house.date = action.date;
        }
      } else if (orgClassification === "upper" || description.includes("senate")) {
        if (!senatePassageDate) {
          senatePassageDate = action.date;
          stages.senate.completed = true;
          stages.senate.date = action.date;
        }
      }
    }
  }

  // Determine current stage and percentage
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

  // Determine status
  let status: BillStatus = "In Progress";
  let description = `Currently in ${currentStage.toLowerCase()} stage`;

  if (hasFailureIndicator) {
    status = "Failed";
    description = `Failed during ${currentStage.toLowerCase()} stage`;
  } else if (stages.enacted.completed) {
    status = "Passed";
    description = "Enacted into law";
  } else if (stages.senate.completed && !stages.enacted.completed) {
    description = "Passed both chambers, awaiting governor's action";
  }

  return {
    current: {
      stage: currentStage,
      percentage,
      isComplete: stages.enacted.completed,
      description,
      status
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

/**
 * Gets status badge configuration based on bill progress
 */
export function getStatusBadgeConfig(progress: BillProgress): {
  text: string;
  className: string;
  icon: 'CheckCircle2' | 'XCircle' | 'Clock';
} {
  switch (progress.current.status) {
    case "Passed":
      return {
        text: "Became Law",
        className: "gap-1.5 pl-2.5 pr-3 py-1.5 bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 transition-colors",
        icon: "CheckCircle2"
      };
    case "Failed":
      return {
        text: "Failed",
        className: "gap-1.5 pl-2.5 pr-3 py-1.5 bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 transition-colors",
        icon: "XCircle"
      };
    case "In Progress":
    default:
      return {
        text: "In Progress",
        className: "gap-1.5 pl-2.5 pr-3 py-1.5 bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20 transition-colors",
        icon: "Clock"
      };
  }
}