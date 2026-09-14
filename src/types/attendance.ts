export type AttendanceMode = 'percentage' | 'bunks' | 'target';

export type AttendanceStatus =
  | 'safe' // Above required / safe zone
  | 'warning' // Close to or below required
  | 'critical' // Well below requirement
  | 'achieved' // Target already achieved
  | 'impossible' // Target mathematically impossible
  | 'invalid'; // Validation error

export interface AttendancePercentageInput {
  attended: number | string;
  missed: number | string;
}

export interface ClassesCanMissInput {
  attended: number | string;
  totalHeld: number | string;
  requiredPercentage: number | string;
}

export interface ClassesNeededInput {
  attended: number | string;
  missed: number | string;
  targetPercentage: number | string;
}

export interface AttendanceResult {
  mode: AttendanceMode;
  status: AttendanceStatus;
  primaryMetric: string;
  primaryLabel: string;
  statusBadge: string;
  headline: string;
  description: string;
  currentPercentage: number;
  attendedClasses: number;
  missedClasses: number;
  totalClasses: number;
  safeMisses?: number;
  classesNeeded?: number;
  thresholdPercentage?: number;
  isValid: boolean;
  errors: string[];
}

export interface AttendanceValidationError {
  field: string;
  message: string;
}
