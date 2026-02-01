import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency with thousand separators
 * @param value - The number or string to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with thousand separators (e.g., "60,000.00")
 */
export function formatCurrency(value: number | string | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || value === "") {
    return "0.00";
  }
  
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return "0.00";
  }
  
  return numValue.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}


