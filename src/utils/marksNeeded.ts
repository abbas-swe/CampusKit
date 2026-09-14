import type {
  PointsModeInput,
  WeightedModeInput,
  MarksNeededResult,
  MarksValidationError,
} from '../types/marksNeeded.ts';

/**
 * Rounds a number to a specified number of decimal places avoiding floating-point rounding errors.
 */
export function roundToDecimals(num: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * Validates non-negative numerical inputs.
 */
function validateNumber(
  val: string,
  field: string,
  label: string,
  min: number = 0,
  max?: number,
  disallowZero: boolean = false
): MarksValidationError | null {
  const trimmed = val.trim();
  if (trimmed === '') {
    return { field, message: `${label} cannot be empty.` };
  }
  const num = Number(trimmed);
  if (isNaN(num)) {
    return { field, message: `${label} must be a valid number.` };
  }
  if (disallowZero && num === 0) {
    return { field, message: `${label} must be greater than 0.` };
  }
  if (num < min) {
    return { field, message: `${label} cannot be less than ${min}.` };
  }
  if (max !== undefined && num > max) {
    return { field, message: `${label} cannot exceed ${max}.` };
  }
  return null;
}

/**
 * MODE 2: Calculates Marks Needed using Raw Points
 * Formula: Required Marks X = (Desired % * (Possible + Upcoming) / 100) - Earned
 */
export function calculateMarksNeededPoints(input: PointsModeInput): MarksNeededResult {
  const errors: string[] = [];

  const rawEarned = String(input.earnedMarks ?? '').trim();
  const rawPossible = String(input.possibleMarks ?? '').trim();
  const rawUpcoming = String(input.upcomingMarks ?? '').trim();
  const rawTarget = String(input.targetPercent ?? '').trim();

  const errEarned = validateNumber(rawEarned, 'earnedMarks', 'Current marks earned', 0, 10000);
  if (errEarned) errors.push(errEarned.message);

  const errPossible = validateNumber(rawPossible, 'possibleMarks', 'Current marks possible', 0, 10000, true);
  if (errPossible) errors.push(errPossible.message);

  const errUpcoming = validateNumber(rawUpcoming, 'upcomingMarks', 'Upcoming marks possible', 0, 10000, true);
  if (errUpcoming) errors.push(errUpcoming.message);

  const errTarget = validateNumber(rawTarget, 'targetPercent', 'Desired final percentage', 0, 100);
  if (errTarget) errors.push(errTarget.message);

  const earned = Number(rawEarned);
  const possible = Number(rawPossible);
  const upcoming = Number(rawUpcoming);
  const target = Number(rawTarget);

  if (!isNaN(earned) && !isNaN(possible) && earned > possible) {
    errors.push('Current marks earned cannot exceed current marks possible.');
  }

  const currentSummary = !isNaN(earned) && !isNaN(possible) && possible > 0
    ? `${earned} / ${possible} (${roundToDecimals((earned / possible) * 100, 1)}%)`
    : '-- / --';
  const targetSummary = !isNaN(target) ? `${target}%` : '--%';

  if (errors.length > 0 || possible <= 0 || upcoming <= 0) {
    return {
      mode: 'points',
      status: 'invalid',
      statusHeadline: '-- Marks Needed',
      statusDescription: 'Please enter valid numbers for marks earned, possible marks, and target grade.',
      statusBadge: 'Awaiting Valid Input',
      requiredPercentage: 0,
      currentScoreSummary: currentSummary,
      targetScoreSummary: targetSummary,
      isValid: false,
      errors,
    };
  }

  // Exact points math
  const totalCombined = possible + upcoming;
  const totalPointsNeeded = (target / 100) * totalCombined;
  const rawMarksNeeded = totalPointsNeeded - earned;
  const marksNeeded = roundToDecimals(rawMarksNeeded, 1);
  const reqPercentage = roundToDecimals((rawMarksNeeded / upcoming) * 100, 1);

  if (marksNeeded <= 0) {
    return {
      mode: 'points',
      status: 'secured',
      statusHeadline: "You've already secured your target grade!",
      statusDescription: `Your current ${earned} / ${possible} marks already guarantee at least ${target}% overall. You need 0 / ${upcoming} marks on this assessment.`,
      statusBadge: 'Target Already Secured',
      requiredPercentage: 0,
      requiredMarks: 0,
      upcomingMaxMarks: upcoming,
      currentScoreSummary: currentSummary,
      targetScoreSummary: targetSummary,
      isValid: true,
      errors: [],
    };
  }

  if (marksNeeded > upcoming || reqPercentage > 100) {
    return {
      mode: 'points',
      status: 'impossible',
      statusHeadline: 'Target is not mathematically achievable',
      statusDescription: `Reaching ${target}% would require scoring ${marksNeeded} / ${upcoming} marks (${reqPercentage}%), which exceeds the total ${upcoming} marks available on this assessment.`,
      statusBadge: 'Not Mathematically Achievable',
      requiredPercentage: reqPercentage,
      requiredMarks: marksNeeded,
      upcomingMaxMarks: upcoming,
      currentScoreSummary: currentSummary,
      targetScoreSummary: targetSummary,
      isValid: true,
      errors: [],
    };
  }

  const isChallenging = reqPercentage >= 85;
  return {
    mode: 'points',
    status: isChallenging ? 'challenging' : 'achievable',
    statusHeadline: `You need ${marksNeeded} / ${upcoming} marks`,
    statusDescription: `Scoring ${marksNeeded} out of ${upcoming} marks (${reqPercentage}%) on your upcoming assessment will secure your target overall grade of ${target}%.`,
    statusBadge: isChallenging ? 'Challenging Target' : 'Achievable Target',
    requiredPercentage: reqPercentage,
    requiredMarks: marksNeeded,
    upcomingMaxMarks: upcoming,
    currentScoreSummary: currentSummary,
    targetScoreSummary: targetSummary,
    isValid: true,
    errors: [],
  };
}

/**
 * MODE 1: Calculates Required Percentage using Weighted Assessment
 * Formula: Required % = (Desired % - Current % * CompletedWeight) / RemainingWeight
 */
export function calculateMarksNeededWeighted(input: WeightedModeInput): MarksNeededResult {
  const errors: string[] = [];

  const rawCurrent = String(input.currentPercent ?? '').trim();
  const rawCompWeight = String(input.completedWeight ?? '').trim();
  const rawUpWeight = String(input.upcomingWeight ?? '').trim();
  const rawTarget = String(input.targetPercent ?? '').trim();

  const errCurrent = validateNumber(rawCurrent, 'currentPercent', 'Current overall percentage', 0, 150);
  if (errCurrent) errors.push(errCurrent.message);

  const errCompWeight = validateNumber(rawCompWeight, 'completedWeight', 'Completed course weight', 0, 100);
  if (errCompWeight) errors.push(errCompWeight.message);

  const errUpWeight = validateNumber(rawUpWeight, 'upcomingWeight', 'Upcoming assessment weight', 0, 100, true);
  if (errUpWeight) errors.push(errUpWeight.message);

  const errTarget = validateNumber(rawTarget, 'targetPercent', 'Desired final percentage', 0, 100);
  if (errTarget) errors.push(errTarget.message);

  const current = Number(rawCurrent);
  const compWeight = Number(rawCompWeight);
  const upWeight = Number(rawUpWeight);
  const target = Number(rawTarget);

  if (!isNaN(compWeight) && !isNaN(upWeight) && compWeight + upWeight > 100.01) {
    errors.push('Completed weight and upcoming assessment weight cannot sum to more than 100%.');
  }

  const currentSummary = !isNaN(current) && !isNaN(compWeight)
    ? `${current}% (${compWeight}% completed)`
    : '--%';
  const targetSummary = !isNaN(target) ? `${target}%` : '--%';

  if (errors.length > 0 || upWeight <= 0) {
    return {
      mode: 'weighted',
      status: 'invalid',
      statusHeadline: '--% Required',
      statusDescription: 'Please enter valid percentages and weights to compute your required score.',
      statusBadge: 'Awaiting Valid Input',
      requiredPercentage: 0,
      currentScoreSummary: currentSummary,
      targetScoreSummary: targetSummary,
      isValid: false,
      errors,
    };
  }

  // Exact weighted math: (Desired - Current * (compWeight / 100)) / (upWeight / 100)
  const currentEarnedPoints = current * (compWeight / 100);
  const rawRequired = (target - currentEarnedPoints) / (upWeight / 100);
  const reqPercentage = roundToDecimals(rawRequired, 1);

  if (reqPercentage <= 0) {
    return {
      mode: 'weighted',
      status: 'secured',
      statusHeadline: "You've already secured your target grade!",
      statusDescription: `Your current ${current}% average across ${compWeight}% of the course already guarantees at least ${target}% overall, even with 0% on this assessment.`,
      statusBadge: 'Target Already Secured',
      requiredPercentage: 0,
      currentScoreSummary: currentSummary,
      targetScoreSummary: targetSummary,
      isValid: true,
      errors: [],
    };
  }

  if (reqPercentage > 100) {
    return {
      mode: 'weighted',
      status: 'impossible',
      statusHeadline: 'Target is not mathematically achievable',
      statusDescription: `Reaching an overall ${target}% would require ${reqPercentage}% on this ${upWeight}% assessment, which exceeds 100% without extra credit or a curved scale.`,
      statusBadge: 'Not Mathematically Achievable',
      requiredPercentage: reqPercentage,
      currentScoreSummary: currentSummary,
      targetScoreSummary: targetSummary,
      isValid: true,
      errors: [],
    };
  }

  const isChallenging = reqPercentage >= 85;
  return {
    mode: 'weighted',
    status: isChallenging ? 'challenging' : 'achievable',
    statusHeadline: `You need ${reqPercentage}% on this assessment`,
    statusDescription: `Scoring ${reqPercentage}% or higher on this ${upWeight}% assessment will bring your overall course grade to ${target}%.`,
    statusBadge: isChallenging ? 'Challenging Target' : 'Achievable Target',
    requiredPercentage: reqPercentage,
    currentScoreSummary: currentSummary,
    targetScoreSummary: targetSummary,
    isValid: true,
    errors: [],
  };
}
