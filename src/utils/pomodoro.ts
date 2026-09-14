import type { PomodoroMode, PomodoroSettings } from '../types/pomodoro.ts';

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  soundEnabled: true,
};

/**
 * Formats seconds into MM:SS display format.
 * Example: 1500 -> "25:00", 299 -> "04:59"
 */
export function formatTimerDisplay(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safeSec / 60);
  const s = safeSec % 60;
  const mm = m < 10 ? `0${m}` : String(m);
  const ss = s < 10 ? `0${s}` : String(s);
  return `${mm}:${ss}`;
}

/**
 * Formats total seconds into human-readable focus time (e.g. "1h 15m" or "45m").
 */
export function formatFocusDuration(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  if (safeSec === 0) return '0m';

  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Determines the next mode according to completed focus sessions.
 */
export function getNextMode(
  currentMode: PomodoroMode,
  completedFocusSessions: number,
  sessionsBeforeLongBreak: number
): PomodoroMode {
  if (currentMode === 'focus') {
    // Session just finished, check if long break is due
    const nextCount = completedFocusSessions + 1;
    if (nextCount > 0 && nextCount % sessionsBeforeLongBreak === 0) {
      return 'long-break';
    }
    return 'short-break';
  }
  // From any break, return to focus
  return 'focus';
}

/**
 * Gets a clean, user-facing label for each mode.
 */
export function getModeLabel(mode: PomodoroMode): string {
  switch (mode) {
    case 'focus':
      return 'Focus Session';
    case 'short-break':
      return 'Short Break';
    case 'long-break':
      return 'Long Break';
  }
}

/**
 * Validates custom duration settings.
 */
export function validateSettings(settings: Partial<PomodoroSettings>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const focus = Number(settings.focusMinutes);
  const shortBreak = Number(settings.shortBreakMinutes);
  const longBreak = Number(settings.longBreakMinutes);
  const cycleCount = Number(settings.sessionsBeforeLongBreak);

  if (isNaN(focus) || focus < 1 || focus > 120) {
    errors.push('Focus duration must be between 1 and 120 minutes.');
  }

  if (isNaN(shortBreak) || shortBreak < 1 || shortBreak > 60) {
    errors.push('Short break must be between 1 and 60 minutes.');
  }

  if (isNaN(longBreak) || longBreak < 1 || longBreak > 90) {
    errors.push('Long break must be between 1 and 90 minutes.');
  }

  if (isNaN(cycleCount) || cycleCount < 1 || cycleCount > 12) {
    errors.push('Sessions before long break must be between 1 and 12.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
