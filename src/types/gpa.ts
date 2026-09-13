export type GPAScaleType = '4.0' | '5.0' | '10.0' | 'custom';

export type GradeEntryMode = 'letter' | 'points';

export interface GradeOption {
  letter: string;
  points: number;
  description?: string;
}

export interface GPAScaleDefinition {
  type: GPAScaleType;
  name: string;
  maxPoints: number;
  description: string;
  grades: GradeOption[];
}

export interface Course {
  id: string;
  name: string;
  credits: number | string;
  entryMode: GradeEntryMode;
  letterGrade: string;
  gradePoints: number | string;
}

export interface GPACalculationResult {
  gpa: number;
  totalCredits: number;
  totalGradePoints: number;
  scaleMax: number;
  percentageEquivalent?: number;
  coursesCount: number;
  academicStanding: string;
  isValid: boolean;
  errors: string[];
}

export interface CourseValidationError {
  courseId: string;
  field: 'name' | 'credits' | 'gradePoints' | 'letterGrade';
  message: string;
}
