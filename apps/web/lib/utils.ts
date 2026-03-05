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

/**
 * Format a time string (HH:mm or HH:mm:ss) to 12-hour AM/PM format
 * @param timeStr - Time string in 24-hour format (e.g., "09:00:00", "13:30")
 * @returns Formatted string in 12-hour format (e.g., "9:00 AM", "1:30 PM")
 */
export function formatTimeTo12Hour(timeStr: string | null | undefined): string {
  if (!timeStr || timeStr === "N/A" || timeStr.trim() === "") {
    return "N/A";
  }
  const parts = timeStr.split(":");
  const hour = parseInt(parts[0], 10);
  const minute = parts[1] ? parseInt(parts[1], 10) : 0;
  if (isNaN(hour)) return timeStr;

  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const period = hour < 12 ? "AM" : "PM";
  const minuteStr = minute.toString().padStart(2, "0");
  return `${displayHour}:${minuteStr} ${period}`;
}

/**
 * Format an hour number (0-23) to 12-hour AM/PM format
 * @param hour - Hour in 24-hour format (0-23)
 * @returns Formatted string (e.g., "9:00 AM", "1:00 PM"), or "N/A" for invalid input
 */
export function formatHourTo12Hour(hour: number): string {
  if (hour == null || isNaN(hour) || hour < 0 || hour > 23) {
    return "N/A";
  }
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const period = hour < 12 ? "AM" : "PM";
  return `${displayHour}:00 ${period}`;
}

/**
 * Get today's date in Bangkok timezone (YYYY-MM-DD format)
 * Bookings use book_for date in Bangkok time, so we must compare against Bangkok date
 */
export function getTodayInBangkok(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}
