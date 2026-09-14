export type CountdownStatus = 'upcoming' | 'due-now' | 'passed' | 'invalid';

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMilliseconds: number;
  studyDaysRemaining: number;
  status: CountdownStatus;
}

export interface ExamCountdownInput {
  examName?: string;
  dateStr: string;
  timeStr: string;
}

export interface QuickDateOption {
  label: string;
  daysFromNow: number;
  defaultTime: string;
}
