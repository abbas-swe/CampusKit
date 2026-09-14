import type { Semester, SemesterValidationError, CGPACalculationResult } from '../types/cgpa.ts';
import { roundToTwoDecimals } from './gpa.ts';

/**
 * Validates an individual semester entry.
 */
export function validateSemester(semester: Semester, maxScaleGPA: number): SemesterValidationError[] {
  const errors: SemesterValidationError[] = [];

  // 1. Validate Credits
  const rawCredits = String(semester.credits ?? '').trim();
  if (rawCredits === '') {
    errors.push({
      semesterId: semester.id,
      field: 'credits',
      message: 'Credits cannot be empty.',
    });
  } else if (isNaN(Number(rawCredits))) {
    errors.push({
      semesterId: semester.id,
      field: 'credits',
      message: 'Credits must be a valid number.',
    });
  } else {
    const creditsNum = Number(rawCredits);
    if (creditsNum <= 0) {
      errors.push({
        semesterId: semester.id,
        field: 'credits',
        message: 'Credits must be greater than 0.',
      });
    } else if (creditsNum > 60) {
      errors.push({
        semesterId: semester.id,
        field: 'credits',
        message: 'Credits cannot exceed 60 per semester.',
      });
    }
  }

  // 2. Validate GPA
  const rawGpa = String(semester.gpa ?? '').trim();
  if (rawGpa === '') {
    errors.push({
      semesterId: semester.id,
      field: 'gpa',
      message: 'GPA cannot be empty.',
    });
  } else if (isNaN(Number(rawGpa))) {
    errors.push({
      semesterId: semester.id,
      field: 'gpa',
      message: 'GPA must be a valid number.',
    });
  } else {
    const gpaNum = Number(rawGpa);
    if (gpaNum < 0) {
      errors.push({
        semesterId: semester.id,
        field: 'gpa',
        message: 'GPA cannot be negative.',
      });
    } else if (gpaNum > maxScaleGPA) {
      errors.push({
        semesterId: semester.id,
        field: 'gpa',
        message: `GPA cannot exceed the maximum scale limit of ${maxScaleGPA.toFixed(1)}.`,
      });
    }
  }

  return errors;
}

/**
 * Formats a CGPA value safely for display (always 2 decimal places, avoids NaN/Infinity).
 */
export function formatCGPADisplay(cgpa: number): string {
  if (isNaN(cgpa) || !isFinite(cgpa) || cgpa < 0) return '0.00';
  return cgpa.toFixed(2);
}

/**
 * Calculates cumulative CGPA from semester GPAs and credit hours.
 * CGPA = Sum(Semester GPA * Semester Credits) / Sum(Semester Credits)
 */
export function calculateCGPAFromSemesters(
  semesters: Semester[],
  scaleMax: number = 4.0
): CGPACalculationResult {
  const errors: string[] = [];
  let totalCredits = 0;
  let totalQualityPoints = 0;
  let validSemestersCount = 0;

  for (const semester of semesters) {
    const semErrors = validateSemester(semester, scaleMax);
    const semLabel = semester.name.trim() || 'Semester';

    if (semErrors.length > 0) {
      semErrors.forEach((e) => errors.push(`${semLabel}: ${e.message}`));
      continue;
    }

    const credits = Number(semester.credits);
    const gpa = Number(semester.gpa);

    if (credits <= 0) continue;

    totalCredits += credits;
    totalQualityPoints += gpa * credits;
    validSemestersCount += 1;
  }

  if (totalCredits <= 0 || validSemestersCount === 0) {
    return {
      cgpa: 0,
      totalCredits: 0,
      totalQualityPoints: 0,
      scaleMax,
      percentageEquivalent: 0,
      itemsCount: 0,
      mode: 'semester',
      academicStanding: 'No Valid Semesters',
      isValid: errors.length === 0,
      errors,
    };
  }

  const rawCgpa = totalQualityPoints / totalCredits;
  const roundedCgpa = roundToTwoDecimals(rawCgpa);
  const percentage = scaleMax > 0 ? (roundedCgpa / scaleMax) * 100 : 0;

  let academicStanding = 'Good Standing';
  const ratio = scaleMax > 0 ? roundedCgpa / scaleMax : 0;
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
    cgpa: roundedCgpa,
    totalCredits: roundToTwoDecimals(totalCredits),
    totalQualityPoints: roundToTwoDecimals(totalQualityPoints),
    scaleMax,
    percentageEquivalent: roundToTwoDecimals(percentage),
    itemsCount: validSemestersCount,
    mode: 'semester',
    academicStanding,
    isValid: errors.length === 0,
    errors,
  };
}
