import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from 'date-fns';

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