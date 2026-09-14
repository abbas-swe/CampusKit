import type {
  FinalGradeSimpleInput,
  FinalGradeCalculationResult,
  FinalGradeValidationError,
  GradedAssessment,
  FinalGradeStatus,
} from '../types/finalGrade.ts';

/**
 * Rounds a number to a specified number of decimal places avoiding floating point precision errors.
 */
export function roundToDecimals(num: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * Validates simple final grade inputs.
 */
export function validateFinalGradeInputs(input: FinalGradeSimpleInput): FinalGradeValidationError[] {
  const errors: FinalGradeValidationError[] = [];

  // Current Grade
  const rawCurrentGrade = String(input.currentGrade ?? '').trim();
  if (rawCurrentGrade === '') {
    errors.push({ field: 'currentGrade', message: 'Current grade cannot be empty.' });
  } else if (isNaN(Number(rawCurrentGrade))) {
    errors.push({ field: 'currentGrade', message: 'Current grade must be a valid number.' });
  } else {
    const val = Number(rawCurrentGrade);
    if (val < 0) {
      errors.push({ field: 'currentGrade', message: 'Current grade cannot be negative.' });
    } else if (val > 150) {
      errors.push({ field: 'currentGrade', message: 'Current grade cannot exceed 150%.' });
    }
  }

  // Current Weight
  const rawCurrentWeight = String(input.currentWeight ?? '').trim();
  if (rawCurrentWeight === '') {
    errors.push({ field: 'currentWeight', message: 'Current weight cannot be empty.' });
  } else if (isNaN(Number(rawCurrentWeight))) {
    errors.push({ field: 'currentWeight', message: 'Current weight must be a valid number.' });
  } else {
    const val = Number(rawCurrentWeight);
    if (val < 0) {
      errors.push({ field: 'currentWeight', message: 'Current weight cannot be negative.' });
    } else if (val > 100) {
      errors.push({ field: 'currentWeight', message: 'Current weight cannot exceed 100%.' });
    }
  }

  // Desired Grade
  const rawDesiredGrade = String(input.desiredGrade ?? '').trim();
  if (rawDesiredGrade === '') {
    errors.push({ field: 'desiredGrade', message: 'Desired final grade cannot be empty.' });
  } else if (isNaN(Number(rawDesiredGrade))) {
    errors.push({ field: 'desiredGrade', message: 'Desired final grade must be a valid number.' });
  } else {
    const val = Number(rawDesiredGrade);
    if (val < 0) {
      errors.push({ field: 'desiredGrade', message: 'Desired final grade cannot be negative.' });
    } else if (val > 100) {
      errors.push({ field: 'desiredGrade', message: 'Desired final grade cannot exceed 100%.' });
    }
  }

  // Final Exam Weight
  const rawExamWeight = String(input.examWeight ?? '').trim();
  if (rawExamWeight === '') {
    errors.push({ field: 'examWeight', message: 'Final exam weight cannot be empty.' });
  } else if (isNaN(Number(rawExamWeight))) {
    errors.push({ field: 'examWeight', message: 'Final exam weight must be a valid number.' });
  } else {
    const val = Number(rawExamWeight);
    if (val <= 0) {
      errors.push({ field: 'examWeight', message: 'Final exam weight must be greater than 0%.' });
    } else if (val > 100) {
      errors.push({ field: 'examWeight', message: 'Final exam weight cannot exceed 100%.' });
    }
  }

  return errors;
}

/**
 * Calculates the required final exam grade given simple inputs.
 * Formula: Required = (Desired - Current * CurrentWeight) / FinalExamWeight
 * Weights in percentage form (e.g. 70 and 30, or decimal 0.70 and 0.30).
 */
export function calculateFinalGradeRequired(input: FinalGradeSimpleInput): FinalGradeCalculationResult {
  const validationErrors = validateFinalGradeInputs(input);
  const errorMessages = validationErrors.map((e) => e.message);

  const currentGrade = Number(input.currentGrade);
  const currentWeight = Number(input.currentWeight);
  const desiredGrade = Number(input.desiredGrade);
  const examWeight = Number(input.examWeight);

  const totalWeight = roundToDecimals(currentWeight + examWeight, 1);
  const isWeight100 = Math.abs(totalWeight - 100) < 0.01;
  let weightNotice: string | undefined = undefined;

  if (
    !isNaN(currentWeight) &&
    !isNaN(examWeight) &&
    currentWeight > 0 &&
    examWeight > 0 &&
    !isWeight100
  ) {
    weightNotice = `Notice: Current coursework (${currentWeight}%) and final exam (${examWeight}%) sum to ${totalWeight}%. Typical course syllabi total 100%.`;
  }

  if (validationErrors.length > 0 || examWeight <= 0) {
    return {
      requiredScore: 0,
      status: 'invalid',
      statusHeadline: '--.--%',
      statusDescription: 'Enter valid course grades and weights to calculate your required score.',
      currentGrade: isNaN(currentGrade) ? 0 : currentGrade,
      currentWeight: isNaN(currentWeight) ? 0 : currentWeight,
      desiredGrade: isNaN(desiredGrade) ? 0 : desiredGrade,
      examWeight: isNaN(examWeight) ? 0 : examWeight,
      totalWeight: isNaN(totalWeight) ? 0 : totalWeight,
      isWeight100,
      weightNotice,
      isValid: false,
      errors: errorMessages,
    };
  }

  // Calculation: (Desired - Current * (CurrentWeight / 100)) / (ExamWeight / 100)
  const currentContribution = currentGrade * (currentWeight / 100);
  const rawRequired = (desiredGrade - currentContribution) / (examWeight / 100);
  const requiredScore = roundToDecimals(rawRequired, 1);

  let status: FinalGradeStatus;
  let statusHeadline: string;
  let statusDescription: string;

  if (requiredScore <= 0) {
    status = 'secured';
    statusHeadline = "You've already secured your target grade!";
    statusDescription = `Based on your current score of ${currentGrade}%, you have already secured at least ${desiredGrade}% overall, even if you score 0% on the final.`;
  } else if (Math.abs(requiredScore - 100.0) < 0.05) {
    status = 'exact_100';
    statusHeadline = 'You need exactly 100.0% on the final exam';
    statusDescription = `You must achieve a perfect score of 100.0% on your final exam to reach your target grade of ${desiredGrade}%.`;
  } else if (requiredScore > 100) {
    status = 'unachievable';
    statusHeadline = "Your target grade isn't mathematically achievable";
    statusDescription = `With the remaining ${examWeight}% exam weight, reaching ${desiredGrade}% would require ${requiredScore.toFixed(1)}% on the final exam, which exceeds 100% without extra credit or a curved grading scale.`;
  } else if (requiredScore > 85) {
    status = 'challenging';
    statusHeadline = `You need ${requiredScore.toFixed(1)}% on the final exam`;
    statusDescription = `Achieving your target of ${desiredGrade}% requires a high score of ${requiredScore.toFixed(1)}% on the final exam.`;
  } else {
    status = 'achievable';
    statusHeadline = `You need ${requiredScore.toFixed(1)}% on the final exam`;
    statusDescription = `Scoring ${requiredScore.toFixed(1)}% or higher on your final exam will secure your desired course grade of ${desiredGrade}%.`;
  }

  return {
    requiredScore,
    status,
    statusHeadline,
    statusDescription,
    currentGrade: roundToDecimals(currentGrade, 1),
    currentWeight: roundToDecimals(currentWeight, 1),
    desiredGrade: roundToDecimals(desiredGrade, 1),
    examWeight: roundToDecimals(examWeight, 1),
    totalWeight,
    isWeight100,
    weightNotice,
    isValid: true,
    errors: [],
  };
}

/**
 * Calculates required final exam score based on multiple completed components.
 */
export function calculateDetailedFinalGrade(
  assessments: GradedAssessment[],
  desiredGrade: number | string,
  examWeight: number | string
): FinalGradeCalculationResult {
  const errors: string[] = [];

  let completedWeight = 0;
  let earnedPoints = 0;
  let validCount = 0;

  assessments.forEach((item, index) => {
    const rawScore = String(item.score ?? '').trim();
    const rawWeight = String(item.weight ?? '').trim();
    const itemLabel = item.name.trim() || `Assessment ${index + 1}`;

    if (rawScore === '' || rawWeight === '') {
      errors.push(`${itemLabel}: Score and weight are required.`);
      return;
    }

    const s = Number(rawScore);
    const w = Number(rawWeight);

    if (isNaN(s) || s < 0 || s > 150) {
      errors.push(`${itemLabel}: Score must be a valid number between 0% and 150%.`);
      return;
    }
    if (isNaN(w) || w <= 0 || w > 100) {
      errors.push(`${itemLabel}: Weight must be a valid number between 0.1% and 100%.`);
      return;
    }

    completedWeight += w;
    earnedPoints += s * (w / 100);
    validCount++;
  });

  const des = Number(desiredGrade);
  const examW = Number(examWeight);

  if (isNaN(des) || des < 0 || des > 100) {
    errors.push('Desired final grade must be between 0% and 100%.');
  }
  if (isNaN(examW) || examW <= 0 || examW > 100) {
    errors.push('Final exam weight must be between 0.1% and 100%.');
  }

  const totalWeight = roundToDecimals(completedWeight + examW, 1);
  const isWeight100 = Math.abs(totalWeight - 100) < 0.01;
  let weightNotice: string | undefined = undefined;

  if (completedWeight > 0 && examW > 0 && !isWeight100) {
    weightNotice = `Notice: Graded components (${roundToDecimals(completedWeight, 1)}%) and final exam (${examW}%) sum to ${totalWeight}%. Standard syllabi total 100%.`;
  }

  if (errors.length > 0 || validCount === 0 || examW <= 0) {
    return {
      requiredScore: 0,
      status: 'invalid',
      statusHeadline: '--.--%',
      statusDescription: 'Enter your completed coursework scores and final exam weight.',
      currentGrade: 0,
      currentWeight: roundToDecimals(completedWeight, 1),
      desiredGrade: isNaN(des) ? 0 : des,
      examWeight: isNaN(examW) ? 0 : examW,
      totalWeight,
      isWeight100,
      weightNotice,
      isValid: false,
      errors,
    };
  }

  // Calculate equivalent current grade across completed components
  const equivalentCurrentGrade = completedWeight > 0 ? (earnedPoints / (completedWeight / 100)) : 0;

  // Required on final exam = (Desired - Points already earned) / (ExamWeight / 100)
  const rawRequired = (des - earnedPoints) / (examW / 100);
  const requiredScore = roundToDecimals(rawRequired, 1);

  let status: FinalGradeStatus;
  let statusHeadline: string;
  let statusDescription: string;

  if (requiredScore <= 0) {
    status = 'secured';
    statusHeadline = "You've already secured your target grade!";
    statusDescription = `Based on your completed assessments (${roundToDecimals(equivalentCurrentGrade, 1)}% average across ${roundToDecimals(completedWeight, 1)}% of the course), you have already secured at least ${des}%, even with a 0% on the final.`;
  } else if (Math.abs(requiredScore - 100.0) < 0.05) {
    status = 'exact_100';
    statusHeadline = 'You need exactly 100.0% on the final exam';
    statusDescription = `A perfect score of 100.0% on your final exam is required to achieve your target grade of ${des}%.`;
  } else if (requiredScore > 100) {
    status = 'unachievable';
    statusHeadline = "Your target grade isn't mathematically achievable";
    statusDescription = `Reaching ${des}% would mathematically require ${requiredScore.toFixed(1)}% on the final exam, which exceeds 100% without extra credit or a grading curve.`;
  } else if (requiredScore > 85) {
    status = 'challenging';
    statusHeadline = `You need ${requiredScore.toFixed(1)}% on the final exam`;
    statusDescription = `Achieving your target of ${des}% requires a high score of ${requiredScore.toFixed(1)}% on your final exam.`;
  } else {
    status = 'achievable';
    statusHeadline = `You need ${requiredScore.toFixed(1)}% on the final exam`;
    statusDescription = `Scoring ${requiredScore.toFixed(1)}% or higher on your final exam will secure your desired course grade of ${des}%.`;
  }

  return {
    requiredScore,
    status,
    statusHeadline,
    statusDescription,
    currentGrade: roundToDecimals(equivalentCurrentGrade, 1),
    currentWeight: roundToDecimals(completedWeight, 1),
    desiredGrade: roundToDecimals(des, 1),
    examWeight: roundToDecimals(examW, 1),
    totalWeight,
    isWeight100,
    weightNotice,
    isValid: true,
    errors: [],
  };
}
