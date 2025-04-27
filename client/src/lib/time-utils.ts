/**
 * Utility functions for handling time and duration formatting
 */

/**
 * Format a time duration in seconds to a human-readable string
 * @param seconds - Duration in seconds
 * @param format - Format style: 'compact' or 'verbose'
 * @returns Formatted time string
 */
export function formatTimeDuration(seconds: number, format: 'compact' | 'verbose' = 'compact'): string {
  if (seconds <= 0) return format === 'compact' ? '0s' : '0 seconds';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (format === 'verbose') {
    // For display as watch time
    if (hours > 0) {
      return `${hours.toFixed(1)} hours`;
    } else if (minutes > 0) {
      return `${minutes} minutes`;
    } else {
      return `${remainingSeconds} seconds`;
    }
  } else {
    // For uptime display
    let result = '';
    if (hours > 0) {
      result += `${hours}h `;
    }
    if (minutes > 0 || hours > 0) {
      result += `${minutes}m`;
    }
    if (hours === 0 && minutes === 0) {
      result += `${remainingSeconds}s`;
    }
    return result.trim();
  }
}

/**
 * Format a date to a human-readable relative time string
 * @param date - Date to format
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const pastDate = typeof date === 'string' ? new Date(date) : date;
  
  const diffMs = now.getTime() - pastDate.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin}m ago`;
  } else if (diffHour < 24) {
    return `${diffHour}h ago`;
  } else if (diffDay < 30) {
    return `${diffDay}d ago`;
  } else {
    // Return formatted date for older dates
    return pastDate.toLocaleDateString();
  }
}

/**
 * Format hours as a decimal to hours and minutes
 * @param hours - Hours as a decimal (e.g., 1.5 for 1 hour 30 minutes)
 * @returns Formatted hours and minutes string
 */
export function formatHoursDecimal(hours: number): string {
  if (hours <= 0) return '0h';
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  } else {
    return `${wholeHours}h ${minutes}m`;
  }
}

/**
 * Format a date for display in the logs table
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatLogDate(date: Date | string): string {
  const logDate = typeof date === 'string' ? new Date(date) : date;
  
  return logDate.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}
