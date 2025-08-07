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

