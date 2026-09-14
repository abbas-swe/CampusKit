export type PomodoroMode = 'focus' | 'short-break' | 'long-break';

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  soundEnabled: boolean;
}

export interface PomodoroState {
  mode: PomodoroMode;
  isRunning: boolean;
  remainingSeconds: number;
  totalDurationSeconds: number;
  completedFocusSessions: number;
  currentCycleSession: number;
  totalFocusSecondsCompleted: number;
}
