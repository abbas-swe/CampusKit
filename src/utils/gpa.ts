import type { Course, CourseValidationError, GPACalculationResult, GPAScaleDefinition } from '../types/gpa.ts';
import { GPA_SCALES } from '../data/gpaScales.ts';

/**
 * Returns numeric points for a given letter grade on the specified scale.
 */
export function getPointsForLetterGrade(letter: string, scale: GPAScaleDefinition): number {
  const match = scale.grades.find((g) => g.letter.toUpperCase() === letter.trim().toUpperCase());
  return match ? match.points : 0;
}

/**
 * Validates a single course entry.
 */
export function validateCourse(course: Course, maxScalePoints: number): CourseValidationError[] {
  const errors: CourseValidationError[] = [];

  const rawCredits = String(course.credits).trim();
  if (rawCredits === '' || isNaN(Number(rawCredits))) {
    errors.push({
      courseId: course.id,
      field: 'credits',
      message: 'Credits must be a valid number.',
    });
  } else {
    const creditsNum = Number(rawCredits);
    if (creditsNum < 0) {
      errors.push({
        courseId: course.id,
        field: 'credits',
        message: 'Credits cannot be negative.',
      });
    } else if (creditsNum > 30) {
      errors.push({
        courseId: course.id,
        field: 'credits',
        message: 'Credits per course cannot exceed 30.',
      });
    }
  }

  if (course.entryMode === 'points') {
    const rawPoints = String(course.gradePoints).trim();
    if (rawPoints === '' || isNaN(Number(rawPoints))) {
      errors.push({
        courseId: course.id,
        field: 'gradePoints',
        message: 'Grade points must be a valid number.',
      });
    } else {
      const pointsNum = Number(rawPoints);
      if (pointsNum < 0) {
        errors.push({
          courseId: course.id,
          field: 'gradePoints',
          message: 'Grade points cannot be negative.',
        });
      } else if (pointsNum > maxScalePoints) {
        errors.push({
          courseId: course.id,
          field: 'gradePoints',
          message: `Grade points cannot exceed ${maxScalePoints.toFixed(1)}.`,
        });
      }
    }
  }

  return errors;
}

/**
 * Rounds a number to exactly two decimal places avoiding standard binary floating-point errors.
 */
export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a GPA value consistently to two decimal places (e.g. 3.5 -> "3.50").
 */
export function formatGPADisplay(gpa: number): string {
  if (isNaN(gpa) || gpa < 0) return '0.00';
  return gpa.toFixed(2);
}

/**
 * Computes the weighted GPA: Sum(grade points * credits) / Sum(credits).
 */
export function calculateGPA(
  courses: Course[],
  scaleDefinition: GPAScaleDefinition = GPA_SCALES['4.0']
): GPACalculationResult {
  const errors: string[] = [];
  let totalCredits = 0;
  let totalQualityPoints = 0;
  let validCoursesCount = 0;

  for (const course of courses) {
    const courseErrors = validateCourse(course, scaleDefinition.maxPoints);
    if (courseErrors.length > 0) {
      courseErrors.forEach((e) => errors.push(`${course.name.trim() || 'Course'}: ${e.message}`));
      continue;
    }

    const credits = Number(course.credits);
    if (credits <= 0) {
      // Zero credits courses (audit / pass-fail) don't count toward GPA denominator
      continue;
    }

    let points = 0;
    if (course.entryMode === 'letter') {
      points = getPointsForLetterGrade(course.letterGrade, scaleDefinition);
    } else {
      points = Number(course.gradePoints);
    }

    totalCredits += credits;
    totalQualityPoints += credits * points;
    validCoursesCount += 1;
  }

  if (totalCredits <= 0) {
    return {
      gpa: 0,
      totalCredits: 0,
      totalGradePoints: 0,
      scaleMax: scaleDefinition.maxPoints,
      percentageEquivalent: 0,
      coursesCount: 0,
      academicStanding: 'No Valid Courses',
      isValid: errors.length === 0,
      errors,
    };
  }

  const rawGpa = totalQualityPoints / totalCredits;
  const roundedGpa = roundToTwoDecimals(rawGpa);
  const percentage = (roundedGpa / scaleDefinition.maxPoints) * 100;

  let academicStanding = 'Good Standing';
  const ratio = roundedGpa / scaleDefinition.maxPoints;
  if (ratio >= 0.95) {
    academicStanding = "President's List / High Honors";
  } else if (ratio >= 0.875) {
    academicStanding = "Dean's List / Honors";
  } else if (ratio >= 0.7) {
    academicStanding = 'Good Standing';
  } else if (ratio >= 0.5) {
    academicStanding = 'Satisfactory Progress';
  } else {
    academicStanding = 'Academic Warning / Probation';
  }

  return {
    gpa: roundedGpa,
    totalCredits: roundToTwoDecimals(totalCredits),
    totalGradePoints: roundToTwoDecimals(totalQualityPoints),
    scaleMax: scaleDefinition.maxPoints,
    percentageEquivalent: roundToTwoDecimals(percentage),
    coursesCount: validCoursesCount,
    academicStanding,
    isValid: errors.length === 0,
    errors,
  };
}
