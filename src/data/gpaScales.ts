import type { GPAScaleDefinition, GPAScaleType } from '../types/gpa';

export const GPA_SCALES: Record<GPAScaleType, GPAScaleDefinition> = {
  '4.0': {
    type: '4.0',
    name: '4.0 Scale (Standard US / Canada)',
    maxPoints: 4.0,
    description:
      'The standard North American university scale. Most widely used across colleges in the United States and Canada.',
    grades: [
      { letter: 'A+', points: 4.0, description: 'High Honors / Exceptional' },
      { letter: 'A', points: 4.0, description: 'Excellent' },
      { letter: 'A-', points: 3.7, description: 'Very Good' },
      { letter: 'B+', points: 3.3, description: 'Good' },
      { letter: 'B', points: 3.0, description: 'Above Average' },
      { letter: 'B-', points: 2.7, description: 'Average' },
      { letter: 'C+', points: 2.3, description: 'Satisfactory' },
      { letter: 'C', points: 2.0, description: 'Competent / Minimum Degree Standard' },
      { letter: 'C-', points: 1.7, description: 'Marginal Pass' },
      { letter: 'D+', points: 1.3, description: 'Poor' },
      { letter: 'D', points: 1.0, description: 'Minimum Passing' },
      { letter: 'D-', points: 0.7, description: 'Lowest Passing Grade' },
      { letter: 'F', points: 0.0, description: 'Failing (Zero Credit)' },
    ],
  },
  '5.0': {
    type: '5.0',
    name: '5.0 Scale (Honors / Weighted)',
    maxPoints: 5.0,
    description:
      'Commonly used in honors curricula, weighted college programs, and select international universities.',
    grades: [
      { letter: 'A+', points: 5.0, description: 'Highest Honors / Distinction' },
      { letter: 'A', points: 4.5, description: 'Excellent' },
      { letter: 'B+', points: 4.0, description: 'Very Good' },
      { letter: 'B', points: 3.5, description: 'Good' },
      { letter: 'C+', points: 3.0, description: 'Average' },
      { letter: 'C', points: 2.5, description: 'Passing' },
      { letter: 'D', points: 2.0, description: 'Marginal Pass' },
      { letter: 'F', points: 0.0, description: 'Failing' },
    ],
  },
  '10.0': {
    type: '10.0',
    name: '10.0 Scale (International / SGPA)',
    maxPoints: 10.0,
    description:
      'Standard 10-point cumulative grading scale commonly used across European, Canadian percentage systems, and international engineering faculties.',
    grades: [
      { letter: 'O', points: 10.0, description: 'Outstanding (90% – 100%)' },
      { letter: 'A+', points: 9.0, description: 'Excellent (80% – 89%)' },
      { letter: 'A', points: 8.0, description: 'Very Good (70% – 79%)' },
      { letter: 'B+', points: 7.0, description: 'Good (60% – 69%)' },
      { letter: 'B', points: 6.0, description: 'Above Average (55% – 59%)' },
      { letter: 'C', points: 5.0, description: 'Average (50% – 54%)' },
      { letter: 'P', points: 4.0, description: 'Pass (40% – 49%)' },
      { letter: 'F', points: 0.0, description: 'Fail (Below 40%)' },
    ],
  },
  'custom': {
    type: 'custom',
    name: 'Custom Scale (Direct Grade Points)',
    maxPoints: 4.0,
    description:
      'Set your university’s specific maximum GPA ceiling and input grade points directly for each course.',
    grades: [],
  },
};

export const DEFAULT_SCALE_TYPE: GPAScaleType = '4.0';

export interface InitialCourseTemplate {
  name: string;
  credits: number;
  grade: string;
}

export const INITIAL_COURSES_DATA: InitialCourseTemplate[] = [
  { name: 'Calculus I', credits: 4, grade: 'A' },
  { name: 'Introduction to Computer Science', credits: 3, grade: 'A-' },
  { name: 'Academic Writing & Rhetoric', credits: 3, grade: 'B+' },
  { name: 'Physics Mechanics & Lab', credits: 4, grade: 'A' },
];
