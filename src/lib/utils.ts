import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from 'date-fns';


export const TimeUnits = {
  DAYS: 'days',
  MONTHS: 'months',
};



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



// HELPER FUNCTION FOR FORMATTING DATES
export const formatDate = (dateString: string | null | undefined): string => {
  // If the date string is null, undefined, or empty, return the placeholder
  if (!dateString) {
    return "—";
  }

  try {
    // parseISO converts a string like "2023-10-26" into a Date object
    const date = parseISO(dateString);
    // format the date into a more readable "MM/dd/yy" format (e.g., "10/26/23")
    return format(date, 'MM/dd/yy');
  } catch (error) {
    // If the date string is invalid, log the error and return the placeholder
    console.error("Failed to parse date:", dateString, error);
    return "—";
  }
};

// HELPER FUNCTION FOR CONVERTING TO SENTENCE CASE

export const toSentenceCase = (text: string) => {
	if (!text) return "";
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};


/**
 * Gemini's `whoItAffects` is a fragment, not a sentence ("homeowners", "small
 * businesses in rural counties"). Rendered raw it reads as a label; composed
 * with "Affects" it reads as the hook the feed card leads with.
 *
 * Deliberately does NOT editorialise beyond that prefix — the summary is
 * bill-level, not user-level, so the copy must never claim to know what a bill
 * does to *this* reader.
 */
export const formatHook = (whoItAffects: string | null | undefined): string => {
	if (!whoItAffects) return "";
	const trimmed = whoItAffects.trim().replace(/[.\s]+$/, "");
	if (!trimmed) return "";
	// Already a sentence about who it affects — don't stack a second "Affects".
	if (/^affects\b/i.test(trimmed)) {
		return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
	}
	return `Affects ${trimmed.charAt(0).toLowerCase() + trimmed.slice(1)}`;
};

/**
 * OpenStates `subject` arrays are per-state and inconsistent. Some states return
 * clean topics ("Housing"), others dump their statute index verbatim — single
 * letters used as index headers (";", "A", "H"), "see also" cross-references,
 * and SHOUTING CAPS. Normalize at the data boundary so every consumer gets a
 * short list of display-ready topics.
 */
export const cleanSubjects = (subjects: string[] | undefined | null): string[] => {
	if (!Array.isArray(subjects)) return [];

	const seen = new Set<string>();
	const cleaned: string[] = [];

	for (const raw of subjects) {
		if (typeof raw !== "string") continue;
		const subject = raw.replace(/\s+/g, " ").replace(/[\s;,]+$/, "").replace(/^\s+/, "");

		// Index-header noise: single letters, punctuation, anything too short to read.
		if (subject.length < 3) continue;
		if (!/[a-zA-Z]/.test(subject)) continue;
		// Statute-index cross-references, not topics.
		if (/\bsee also\b/i.test(subject)) continue;

		// Shouty entries ("CIVIL PROCEDURE") get title-cased; mixed-case is left alone.
		const display =
			subject === subject.toUpperCase()
				? subject
						.toLowerCase()
						.replace(/(^|[\s\-—/(])([a-z])/g, (_, prefix, letter) => prefix + letter.toUpperCase())
				: subject;

		const key = display.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		cleaned.push(display);
	}

	return cleaned;
};

export const getPastDate = (value:number, unit:string) => {
  // Ensure the input is a valid number
  if (typeof value !== 'number' || value < 0) {
    return "Invalid input: Please provide a positive number for the value.";
  }

  // Create a new Date object to work with, representing the current moment.
  const date = new Date();

  // Subtract the specified amount of time based on the unit
  switch (unit) {
    case 'months':
      date.setMonth(date.getMonth() - value);
      break;
    case 'days':
      date.setDate(date.getDate() - value);
      break;
    default:
      return "Invalid input: Please provide 'days' or 'months' as the unit.";
  }

  // Extract the year, month, and day from the newly calculated date.
  const year = date.getFullYear();

  // getMonth() returns a zero-based index (0 for January, 11 for December),
  // so we add 1 to get the standard month number (1-12).
  // padStart(2, '0') ensures the month is always two digits (e.g., '01', '09', '12').
  const month = String(date.getMonth() + 1).padStart(2, '0');

  // padStart(2, '0') ensures the day is always two digits.
  const day = String(date.getDate()).padStart(2, '0');

  // Combine the parts into the final YYYY-MM-DD format.
  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
};

