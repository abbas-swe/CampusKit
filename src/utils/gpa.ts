import type { Course, CourseValidationError, GPACalculationResult, GPAScaleDefinition } from '../types/gpa';
import { GPA_SCALES } from '../data/gpaScales';

export function getPointsForLetterGrade(letter: string, scale: GPAScaleDefinition): number {
  const match = scale.grades.find((g) => g.letter.toUpperCase() === letter.trim().toUpperCase());
  return match ? match.points : 0;
}

export function validateCourse(course: Course, maxScalePoints: number): CourseValidationError[] {
  const errors: CourseValidationError[] = [];

  if (isNaN(course.credits) || course.credits < 0 || course.credits > 30) {
    errors.push({
      courseId: course.id,
      field: 'credits',
      message: 'Credits must be between 0 and 30.',
    });
  }

  if (course.entryMode === 'points') {
    if (isNaN(course.gradePoints) || course.gradePoints < 0 || course.gradePoints > maxScalePoints) {
      errors.push({
        courseId: course.id,
        field: 'gradePoints',
        message: `Grade points must be between 0 and ${maxScalePoints}.`,
      });
    }
  }

  return errors;
}

export function calculateGPA(courses: Course[], scaleDefinition: GPAScaleDefinition = GPA_SCALES['4.0']): GPACalculationResult {
  const errors: string[] = [];
  let totalCredits = 0;
  let totalQualityPoints = 0;
  let validCoursesCount = 0;

  for (const course of courses) {
    const courseErrors = validateCourse(course, scaleDefinition.maxPoints);
    if (courseErrors.length > 0) {
      courseErrors.forEach((e) => errors.push(`${course.name || 'Course'}: ${e.message}`));
      continue;
    }

    const credits = Number(course.credits);
    if (credits <= 0) continue;

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

  const gpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
  const percentage = (gpa / scaleDefinition.maxPoints) * 100;

  let academicStanding = 'Good Standing';
  const ratio = gpa / scaleDefinition.maxPoints;
  if (ratio >= 0.95) {
    academicStanding = "President's List / High Honors";
  } else if (ratio >= 0.875) {
    academicStanding = "Dean's List / Honors";
  } else if (ratio >= 0.7) {
    academicStanding = 'Good Standing';
  } else if (ratio >= 0.5) {
    academicStanding = 'Satisfactory Progress';
  } else if (totalCredits > 0) {
    academicStanding = 'Academic Warning / Probation';
  }

  return {
    gpa: Math.round(gpa * 100) / 100,
    totalCredits,
    totalGradePoints: Math.round(totalQualityPoints * 100) / 100,
    scaleMax: scaleDefinition.maxPoints,
    percentageEquivalent: Math.round(percentage * 10) / 10,
    coursesCount: validCoursesCount,
    academicStanding,
    isValid: errors.length === 0,
    errors,
  };
}
