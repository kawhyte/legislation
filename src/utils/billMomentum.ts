// utils/billMomentum.ts

import type { Bill, MomentumAnalysis } from "@/types";

/**
 * Analyzes bill momentum based on its entire lifecycle.
 */
export function analyzeBillMomentum(bill: Bill): MomentumAnalysis {
  const actions = bill.actions || [];
  const sortedActions = actions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // --- Check 1: Definitive FAILURE outcome (must come first) ---
  const failureKeywords = ["died", "failed", "rejected", "vetoed", "indefinitely postponed", "withdrawn"];
  if (actions.some(a => failureKeywords.some(kw => a.description.toLowerCase().includes(kw)))) {
    return { level: "Stalled", score: -100, reasons: ["Bill has failed or stalled"] };
  }

  // --- Check 2: Definitive SUCCESS outcome ---
  if (bill.enacted_date || actions.some(a => a.classification.includes("became-law"))) {
    return { level: "Enacted", score: 100, reasons: ["Enacted into law"] };
  }

  // --- Check 3: Major Legislative Milestones ---
  if (bill.house_passage_date && bill.senate_passage_date) {
    return { level: "Passed", score: 90, reasons: ["Passed both chambers"] };
  }
  if (bill.house_passage_date || bill.senate_passage_date) {
    const chamber = bill.house_passage_date ? "House" : "Senate";
    return { level: "High", score: 75, reasons: [`Passed the ${chamber}`] };
  }

  // --- Check 3: In-Progress Scoring Model ---
  let score = 0;
  const reasons: string[] = [];

  // Scoring based on action classifications
  for (const action of sortedActions) {
    const classifications = action.classification || [];
    if (classifications.includes("committee-passage")) {
      score += 5;
      reasons.push("Passed a committee");
    }
    if (classifications.includes("reading-3")) {
      score += 3;
      reasons.push("Advanced to 3rd reading");
    }
    if (classifications.includes("referral-committee")) {
      score += 1;
      reasons.push("Referred to committee");
    }
  }

  // Factor in Action Velocity (actions in the last 14 days)
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const recentActions = sortedActions.filter(a => new Date(a.date) > twoWeeksAgo).length;
  if (recentActions > 0) {
    score += recentActions * 2;
    reasons.push(`${recentActions} recent action(s)`);
  }

  // Time decay factor
  const daysSinceIntro = bill.first_action_date ? Math.ceil((new Date().getTime() - new Date(bill.first_action_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  if (daysSinceIntro > 120) {
    score -= 3; // Penalize bills that are very old and haven't passed
  }

  // Determine level based on score
  if (score >= 10) {
    return { level: "High", score, reasons };
  }
  if (score >= 5) {
    return { level: "Medium", score, reasons };
  }
  if (score > 0) {
    return { level: "Low", score, reasons };
  }

  return { level: "Low", score: 0, reasons: ["Introduced"] };
}

/**
 * This function is no longer needed for the primary display logic but can be kept for other filtering if necessary.
 * The new model displays all bills and their momentum, rather than pre-filtering.
 */
export function filterBillsByMomentum(bills: Bill[]): Bill[] {
  // For now, let's return all bills enriched with new momentum data
  return bills;
}

/**
 * Adds momentum data to bill objects using the new analysis model.
 */
export function enrichBillsWithMomentum(bills: Bill[]): Bill[] {
  return bills.map(bill => ({
    ...bill,
    momentum: analyzeBillMomentum(bill)
  }));
}
