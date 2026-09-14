import type { TimeRemaining, CountdownStatus } from '../types/examCountdown.ts';

/**
 * Pads single-digit numbers with a leading zero for clock displays.
 * Example: 4 -> "04"
 */
export function formatPadZero(num: number): string {
  const rounded = Math.floor(Math.max(0, num));
  return rounded < 10 ? `0${rounded}` : String(rounded);
}

/**
 * Safely parses HTML date ('YYYY-MM-DD') and time ('HH:MM') inputs into a local Date object.
 * Returns null if the inputs do not represent a valid date.
 */
export function parseLocalDateTime(dateStr: string, timeStr: string = '09:00'): Date | null {
  const trimmedDate = dateStr.trim();
  const trimmedTime = timeStr.trim() || '09:00';

  if (!trimmedDate) return null;

  // Split date into parts to prevent UTC offset shifting
  const dateParts = trimmedDate.split('-');
  if (dateParts.length !== 3) return null;

  const year = parseInt(dateParts[0] ?? '', 10);
  const month = parseInt(dateParts[1] ?? '', 10) - 1; // 0-indexed
  const day = parseInt(dateParts[2] ?? '', 10);

  const timeParts = trimmedTime.split(':');
  const hours = parseInt(timeParts[0] ?? '9', 10);
  const minutes = parseInt(timeParts[1] ?? '0', 10);

  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
    return null;
  }

  const parsed = new Date(year, month, day, hours, minutes, 0, 0);
  if (isNaN(parsed.getTime())) return null;

  return parsed;
}

/**
 * Calculates remaining days, hours, minutes, seconds, and status.
 */
export function calculateTimeRemaining(
  targetDate: Date | null,
  now: Date = new Date()
): TimeRemaining {
  if (!targetDate || isNaN(targetDate.getTime())) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: 0,
      studyDaysRemaining: 0,
      status: 'invalid',
    };
  }

  const diffMs = targetDate.getTime() - now.getTime();

  // If exam was scheduled more than 1 minute ago, mark as passed
  if (diffMs < -60000) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: diffMs,
      studyDaysRemaining: 0,
      status: 'passed',
    };
  }

  // If exam is right now (within -60s to +60s or exactly 0)
  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: 0,
      studyDaysRemaining: 0,
      status: 'due-now',
    };
  }

  // Active upcoming countdown
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Study days: calendar days remaining until target date (inclusive of today)
  const studyDaysRemaining = Math.max(1, Math.ceil(diffMs / 86400000));

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMilliseconds: diffMs,
    studyDaysRemaining,
    status: 'upcoming',
  };
}

/**
 * Generates local date & time strings for quick preset buttons.
 */
export function getQuickDateStrings(
  daysFromNow: number,
  defaultTime: string = '09:00',
  baseDate: Date = new Date()
): { dateStr: string; timeStr: string } {
  const target = new Date(baseDate.getTime());
  target.setDate(target.getDate() + daysFromNow);

  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');

  return {
    dateStr: `${year}-${month}-${day}`,
    timeStr: defaultTime,
  };
}

/**
 * Formats a Date object into human-readable local representation.
 * Example: "Monday, Dec 14, 2026 at 9:00 AM"
 */
export function formatDisplayDateTime(date: Date): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}
