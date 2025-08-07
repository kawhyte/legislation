// utils/billMomentum.ts

export type MomentumLevel = "High" | "Medium" | "Low" | "None";

export interface MomentumAnalysis {
  level: MomentumLevel;
  score: number;
  reasons: string[];
  shouldDisplay: boolean;
  isIntroductionStage: boolean;
}

/**
 * Analyzes bill momentum based on actions and descriptions
 * Only applies momentum logic to bills in introduction stage
 */
export function analyzeBillMomentum(bill: any): MomentumAnalysis {
  const actions = bill.actions || [];
  const latestAction = bill.latest_action_description?.toLowerCase() || "";
  
  // First, check if bill is past introduction stage
  const isIntroductionStage = checkIfIntroductionStage(bill);
  
  // If not in introduction stage, always display (let existing progress logic handle it)
  if (!isIntroductionStage) {
    return {
      level: "None",
      score: 0,
      reasons: ["Bill has progressed beyond introduction stage"],
      shouldDisplay: true,
      isIntroductionStage: false
    };
  }

  // For introduction stage bills, analyze momentum
  let score = 0;
  const reasons: string[] = [];

  // Analyze action classifications (chronologically)
  const sortedActions = actions.sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const action of sortedActions) {
    const classifications = action.classification || [];
    const description = action.description?.toLowerCase() || "";

    // High momentum indicators (+3 points each)
    if (classifications.includes("committee-passage")) {
      score += 3;
      reasons.push("Committee approved the bill");
    }
    
    if (classifications.includes("reading-1") || classifications.includes("reading-2")) {
      score += 2;
      reasons.push("Floor reading occurred");
    }

    if (classifications.includes("amendment-passage")) {
      score += 1;
      reasons.push("Amendments were adopted");
    }

    // Medium momentum indicators (+2 points each)
    if (classifications.includes("referral-committee")) {
      score += 1;
      reasons.push("Referred to committee for review");
    }

    // Check for positive movement in description
    if (description.includes("ordered to third reading")) {
      score += 2;
      reasons.push("Ordered to third reading - likely to be voted on");
    }

    if (description.includes("ordered to second reading")) {
      score += 1;
      reasons.push("Ordered to second reading");
    }

    // Negative momentum indicators
    if (description.includes("held at desk")) {
      score -= 1;
      reasons.push("Currently held at desk (waiting)");
    }

    if (description.includes("indefinitely postponed") || 
        description.includes("tabled") || 
        description.includes("withdrawn")) {
      score -= 5;
      reasons.push("Bill has stalled or been withdrawn");
    }
  }

  // Latest action analysis
  if (latestAction.includes("ordered to third reading")) {
    score += 2;
    if (!reasons.some(r => r.includes("third reading"))) {
      reasons.push("Latest: Ordered to third reading");
    }
  }

  if (latestAction.includes("committee") && !latestAction.includes("held")) {
    score += 1;
    reasons.push("Latest: Active committee involvement");
  }

  // Time factor - newer bills might still gain momentum
  const daysSinceIntroduction = getDaysSinceIntroduction(bill);
  if (daysSinceIntroduction <= 30) {
    score += 1;
    reasons.push("Recently introduced (within 30 days)");
  } else if (daysSinceIntroduction > 180) {
    score -= 2;
    reasons.push("Introduced over 6 months ago");
  }

  // Determine momentum level and display decision
  let level: MomentumLevel;
  let shouldDisplay: boolean;
console.log("SCORE***", score)


  if (score >= 5) {
    level = "High";
    shouldDisplay = true;
  } else if (score >= 2) {
    level = "Medium";
    shouldDisplay = true;
  } else if (score >= 0) {
    level = "Low";
    shouldDisplay = false; // Don't display low momentum introduction bills
  } else {
    level = "None";
    shouldDisplay = false; // Don't display stalled bills
  }

  return {
    level,
    score,
    reasons: reasons.slice(0, 3), // Limit to top 3 reasons
    shouldDisplay,
    isIntroductionStage: true
  };
}

/**
 * Checks if a bill is still in the introduction stage
 */
function checkIfIntroductionStage(bill: any): boolean {
  const actions = bill.actions || [];
  
  // Look for signs that bill has moved beyond introduction
  const progressIndicators = [
    "passage", // Passed a chamber
    "became-law", // Enacted
    "executive-signature" // Signed by governor
  ];

  const hasProgressed = actions.some((action: any) => {
    const classifications = action.classification || [];
    return progressIndicators.some(indicator => 
      classifications.includes(indicator)
    );
  });

  // Also check for chamber-specific passage
  const hasPassedChamber = actions.some((action: any) => {
    const description = action.description?.toLowerCase() || "";
    const orgClass = action.organization?.classification?.toLowerCase();
    
    return (description.includes("passed") || description.includes("adopted")) &&
           (orgClass === "upper" || orgClass === "lower");
  });

  return !hasProgressed && !hasPassedChamber;
}

/**
 * Gets days since bill introduction
 */
function getDaysSinceIntroduction(bill: any): number {
  if (!bill.first_action_date) return 0;
  
  const introDate = new Date(bill.first_action_date);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - introDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Filters bills array to only include those with sufficient momentum
 */
export function filterBillsByMomentum(bills: any[]): any[] {
  return bills.filter(bill => {
    const momentum = analyzeBillMomentum(bill);
    return momentum.shouldDisplay;
  });
}

/**
 * Adds momentum data to bill objects
 */
export function enrichBillsWithMomentum(bills: any[]): any[] {
  return bills.map(bill => ({
    ...bill,
    momentum: analyzeBillMomentum(bill)
  }));
}