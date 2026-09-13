import type { GPAScaleDefinition, GPAScaleType } from '../types/gpa';

export const GPA_SCALES: Record<GPAScaleType, GPAScaleDefinition> = {
  '4.0': {
    type: '4.0',
    name: '4.0 Scale (Standard US / Canada)',
    maxPoints: 4.0,
    description: 'The standard North American university grade point scale. Most widely used across colleges in the United States and Canada.',
    grades: [
      { letter: 'A+', points: 4.0, description: 'Outstanding / High Honors' },
      { letter: 'A', points: 4.0, description: 'Excellent' },
      { letter: 'A-', points: 3.7, description: 'Very Good' },
      { letter: 'B+', points: 3.3, description: 'Good' },
      { letter: 'B', points: 3.0, description: 'Above Average' },
      { letter: 'B-', points: 2.7, description: 'Average' },
      { letter: 'C+', points: 2.3, description: 'Satisfactory' },
      { letter: 'C', points: 2.0, description: 'Passing' },
      { letter: 'C-', points: 1.7, description: 'Marginal Pass' },
      { letter: 'D+', points: 1.3, description: 'Poor' },
      { letter: 'D', points: 1.0, description: 'Minimum Passing' },
      { letter: 'F', points: 0.0, description: 'Failing' },
    ],
  },
  '5.0': {
    type: '5.0',
    name: '5.0 Scale (Honors / Weighted)',
    maxPoints: 5.0,
    description: 'Weighted grade scale utilized in select colleges, international universities, and honors programs.',
    grades: [
      { letter: 'A+', points: 5.0, description: 'Distinction / Highest Honors' },
      { letter: 'A', points: 4.5, description: 'Excellent' },
      { letter: 'B+', points: 4.0, description: 'Very Good' },
      { letter: 'B', points: 3.5, description: 'Good' },
      { letter: 'C+', points: 3.0, description: 'Above Average' },
      { letter: 'C', points: 2.5, description: 'Pass' },
      { letter: 'D', points: 2.0, description: 'Marginal Pass' },
      { letter: 'F', points: 0.0, description: 'Fail' },
    ],
  },
  '10.0': {
    type: '10.0',
    name: '10.0 Scale (International / SGPA)',
    maxPoints: 10.0,
    description: 'Standard 10-point cumulative scale commonly utilized by global engineering and university systems.',
    grades: [
      { letter: 'O', points: 10.0, description: 'Outstanding (90-100%)' },
      { letter: 'A+', points: 9.0, description: 'Excellent (80-89%)' },
      { letter: 'A', points: 8.0, description: 'Very Good (70-79%)' },
      { letter: 'B+', points: 7.0, description: 'Good (60-69%)' },
      { letter: 'B', points: 6.0, description: 'Above Average (55-59%)' },
      { letter: 'C', points: 5.0, description: 'Average (50-54%)' },
      { letter: 'P', points: 4.0, description: 'Pass (40-49%)' },
      { letter: 'F', points: 0.0, description: 'Fail (< 40%)' },
    ],
  },
  'custom': {
    type: 'custom',
    name: 'Custom Scale',
    maxPoints: 4.0,
    description: 'Define custom grade-point mappings according to your university syllabus handbook.',
    grades: [
      { letter: 'A', points: 4.0 },
      { letter: 'B', points: 3.0 },
      { letter: 'C', points: 2.0 },
      { letter: 'D', points: 1.0 },
      { letter: 'F', points: 0.0 },
    ],
  },
};

export const DEFAULT_SCALE_TYPE: GPAScaleType = '4.0';

export const DEFAULT_INITIAL_COURSES = [
  { id: 'course-1', name: 'Course 1', credits: 3, entryMode: 'letter' as const, letterGrade: 'A', gradePoints: 4.0 },
  { id: 'course-2', name: 'Course 2', credits: 3, entryMode: 'letter' as const, letterGrade: 'A-', gradePoints: 3.7 },
  { id: 'course-3', name: 'Course 3', credits: 4, entryMode: 'letter' as const, letterGrade: 'B+', gradePoints: 3.3 },
  { id: 'course-4', name: 'Course 4', credits: 3, entryMode: 'letter' as const, letterGrade: 'A', gradePoints: 4.0 },
];
