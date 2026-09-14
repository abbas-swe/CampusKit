export type StudyHoursMode = 'daily' | 'total' | 'subject';

export type StudyPaceCategory = 'light' | 'moderate' | 'intensive' | 'excessive';

export interface DailyModeInput {
  totalHours: string | number;
  studyDays: string | number;
}

export interface DailyModeResult {
  dailyHours: number;
  dailyFormatted: string;
  totalHours: number;
  studyDays: number;
  pace: StudyPaceCategory;
  paceLabel: string;
  paceDescription: string;
  isValid: boolean;
  errors: string[];
}

export interface TotalModeInput {
  dailyHours: string | number;
  studyDays: string | number;
}

export interface TotalModeResult {
  totalHours: number;
  totalFormatted: string;
  dailyHours: number;
  studyDays: number;
  weeklyEquivalent: number | null;
  pace: StudyPaceCategory;
  paceLabel: string;
  isValid: boolean;
  errors: string[];
}

export type SubjectPriority = 'low' | 'medium' | 'high' | 'very-high';

export interface SubjectItem {
  id: string;
  name: string;
  priority: SubjectPriority;
  weight: number;
}

export interface SubjectAllocation {
  id: string;
  name: string;
  priority: SubjectPriority;
  priorityLabel: string;
  weight: number;
  hours: number;
  hoursFormatted: string;
  dailyHours: number;
  dailyFormatted: string;
  percentOfTotal: number;
}

export interface SubjectModeInput {
  totalWeeklyHours: string | number;
  studyDaysPerWeek: string | number;
  allocationType: 'equal' | 'priority';
  subjects: {
    id: string;
    name: string;
    priority: SubjectPriority;
  }[];
}

export interface SubjectModeResult {
  totalHours: number;
  studyDaysPerWeek: number;
  allocationType: 'equal' | 'priority';
  subjects: SubjectAllocation[];
  averageHoursPerSubject: number;
  averageHoursFormatted: string;
  isValid: boolean;
  errors: string[];
}
