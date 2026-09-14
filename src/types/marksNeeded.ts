export type MarksNeededMode = 'points' | 'weighted';

export type MarksFeasibilityStatus =
  | 'secured' // required <= 0 (already achieved)
  | 'achievable' // 0 < required <= 85%
  | 'challenging' // 85% < required <= 100%
  | 'impossible' // required > 100% or marks needed > marks possible
  | 'invalid'; // validation errors or empty input

export interface PointsModeInput {
  earnedMarks: number | string;
  possibleMarks: number | string;
  upcomingMarks: number | string;
  targetPercent: number | string;
}

export interface WeightedModeInput {
  currentPercent: number | string;
  completedWeight: number | string;
  upcomingWeight: number | string;
  targetPercent: number | string;
}

export interface MarksNeededResult {
  mode: MarksNeededMode;
  status: MarksFeasibilityStatus;
  statusHeadline: string;
  statusDescription: string;
  statusBadge: string;
  requiredPercentage: number;
  requiredMarks?: number;
  upcomingMaxMarks?: number;
  currentScoreSummary: string;
  targetScoreSummary: string;
  isValid: boolean;
  errors: string[];
}

export interface MarksValidationError {
  field: string;
  message: string;
}
