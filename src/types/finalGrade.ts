export type FinalGradeMode = 'simple' | 'detailed';

export type FinalGradeStatus =
  | 'secured' // required <= 0%
  | 'achievable' // 0% < required <= 85%
  | 'challenging' // 85% < required < 100%
  | 'exact_100' // required == 100%
  | 'unachievable' // required > 100%
  | 'invalid'; // missing or invalid input data

export interface FinalGradeSimpleInput {
  currentGrade: number | string;
  currentWeight: number | string;
  desiredGrade: number | string;
  examWeight: number | string;
}

export interface GradedAssessment {
  id: string;
  name: string;
  score: number | string;
  weight: number | string;
}

export interface FinalGradeCalculationResult {
  requiredScore: number;
  status: FinalGradeStatus;
  statusHeadline: string;
  statusDescription: string;
  currentGrade: number;
  currentWeight: number;
  desiredGrade: number;
  examWeight: number;
  totalWeight: number;
  isWeight100: boolean;
  weightNotice?: string;
  isValid: boolean;
  errors: string[];
}

export interface FinalGradeValidationError {
  field: string;
  message: string;
}
