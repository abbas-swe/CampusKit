import type { GPAScaleType, GradeOption } from './gpa.ts';

export type CGPAMode = 'semester' | 'course';

export interface Semester {
  id: string;
  name: string;
  gpa: number | string;
  credits: number | string;
}

export interface SemesterValidationError {
  semesterId: string;
  field: 'name' | 'gpa' | 'credits';
  message: string;
}

export interface CGPACalculationResult {
  cgpa: number;
  totalCredits: number;
  totalQualityPoints: number;
  scaleMax: number;
  percentageEquivalent?: number;
  itemsCount: number;
  mode: CGPAMode;
  academicStanding: string;
  isValid: boolean;
  errors: string[];
}
