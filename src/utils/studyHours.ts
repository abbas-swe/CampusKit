import type {
  DailyModeInput,
  DailyModeResult,
  TotalModeInput,
  TotalModeResult,
  SubjectModeInput,
  SubjectModeResult,
  SubjectAllocation,
  SubjectPriority,
  StudyPaceCategory,
} from '../types/studyHours.ts';

/**
 * Rounds a number to a specified number of decimal places without IEEE-754 precision issues.
 */
export function roundToDecimals(num: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * Formats a decimal hour number into a human-readable "X hrs Y mins" or "Y mins" string.
 * Example: 3.5 -> "3 hrs 30 mins"
 * Example: 0.75 -> "45 mins"
 * Example: 2.0 -> "2 hrs"
 */
export function formatHoursAndMinutes(hours: number): string {
  if (isNaN(hours) || hours <= 0) return '0 hrs';
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h === 0) {
    return `${m} min${m === 1 ? '' : 's'}`;
  }
  if (m === 0) {
    return `${h} hr${h === 1 ? '' : 's'}`;
  }
  return `${h} hr${h === 1 ? '' : 's'} ${m} min${m === 1 ? '' : 's'}`;
}

/**
 * Formats decimal hours into descriptive text.
 * Example: 3.5 -> "3 hours 30 minutes"
 */
export function formatHoursAndMinutesLong(hours: number): string {
  if (isNaN(hours) || hours <= 0) return '0 hours';
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h === 0) {
    return `${m} minute${m === 1 ? '' : 's'}`;
  }
  if (m === 0) {
    return `${h} hour${h === 1 ? '' : 's'}`;
  }
  return `${h} hour${h === 1 ? '' : 's'} ${m} minute${m === 1 ? '' : 's'}`;
}

/**
 * Determines study pace classification based on daily study hours.
 */
export function classifyStudyPace(dailyHours: number): {
  pace: StudyPaceCategory;
  label: string;
  description: string;
} {
  if (dailyHours <= 2) {
    return {
      pace: 'light',
      label: 'Light Pace',
      description: 'Easily manageable and sustainable alongside standard extracurriculars and casual review.',
    };
  }
  if (dailyHours <= 5) {
    return {
      pace: 'moderate',
      label: 'Moderate & Sustainable',
      description: 'Ideal sweet spot for deep cognitive retention without inducing burnout or mental fatigue.',
    };
  }
  if (dailyHours <= 8) {
    return {
      pace: 'intensive',
      label: 'Intensive Exam Pace',
      description: 'High workload. Ensure structured rest intervals (such as 10-minute breaks every hour) to maintain recall.',
    };
  }
  return {
    pace: 'excessive',
    label: 'High Fatigue Risk (>8 hrs/day)',
    description: 'Cognitive research shows studying beyond 8 hours daily causes steep diminishing returns and sleep disruption.',
  };
}

/**
 * Validates a numerical input string.
 */
function validateNumber(
  val: string,
  label: string,
  min: number = 0.1,
  max?: number
): string | null {
  const trimmed = val.trim();
  if (trimmed === '') {
    return `${label} cannot be empty.`;
  }
  const num = Number(trimmed);
  if (isNaN(num)) {
    return `${label} must be a valid number.`;
  }
  if (num < min) {
    return `${label} must be at least ${min}.`;
  }
  if (max !== undefined && num > max) {
    return `${label} cannot exceed ${max}.`;
  }
  return null;
}

// -------------------------------------------------------------
// MODE 1: Daily Study Hours Calculator
// daily hours = total hours needed / study days
// -------------------------------------------------------------
export function calculateDailyStudyHours(input: DailyModeInput): DailyModeResult {
  const errors: string[] = [];

  const rawTotal = String(input.totalHours ?? '').trim();
  const rawDays = String(input.studyDays ?? '').trim();

  const errTotal = validateNumber(rawTotal, 'Total study hours needed', 0.1, 1000);
  if (errTotal) errors.push(errTotal);

  const errDays = validateNumber(rawDays, 'Number of study days', 1, 365);
  if (errDays) errors.push(errDays);

  const total = Number(rawTotal);
  const days = Number(rawDays);

  if (errors.length > 0 || isNaN(total) || isNaN(days) || days <= 0 || total <= 0) {
    return {
      dailyHours: 0,
      dailyFormatted: '0 hrs',
      totalHours: isNaN(total) ? 0 : total,
      studyDays: isNaN(days) ? 0 : days,
      pace: 'light',
      paceLabel: 'Awaiting Input',
      paceDescription: 'Enter total hours needed and study days to calculate your daily target.',
      isValid: false,
      errors,
    };
  }

  const dailyRaw = total / days;
  const dailyHours = roundToDecimals(dailyRaw, 2);
  const paceInfo = classifyStudyPace(dailyHours);

  return {
    dailyHours,
    dailyFormatted: formatHoursAndMinutes(dailyHours),
    totalHours: roundToDecimals(total, 1),
    studyDays: Math.round(days),
    pace: paceInfo.pace,
    paceLabel: paceInfo.label,
    paceDescription: paceInfo.description,
    isValid: true,
    errors: [],
  };
}

// -------------------------------------------------------------
// MODE 2: Total Study Hours Calculator
// total hours = daily hours * study days
// -------------------------------------------------------------
export function calculateTotalStudyHours(input: TotalModeInput): TotalModeResult {
  const errors: string[] = [];

  const rawDaily = String(input.dailyHours ?? '').trim();
  const rawDays = String(input.studyDays ?? '').trim();

  const errDaily = validateNumber(rawDaily, 'Study hours per day', 0.1, 24);
  if (errDaily) errors.push(errDaily);

  const errDays = validateNumber(rawDays, 'Number of study days', 1, 365);
  if (errDays) errors.push(errDays);

  const daily = Number(rawDaily);
  const days = Number(rawDays);

  if (errors.length > 0 || isNaN(daily) || isNaN(days) || daily <= 0 || days <= 0) {
    return {
      totalHours: 0,
      totalFormatted: '0 hrs',
      dailyHours: isNaN(daily) ? 0 : daily,
      studyDays: isNaN(days) ? 0 : days,
      weeklyEquivalent: null,
      pace: 'light',
      paceLabel: 'Awaiting Input',
      isValid: false,
      errors,
    };
  }

  const totalRaw = daily * days;
  const totalHours = roundToDecimals(totalRaw, 1);
  const weeklyEquivalent = days >= 7 ? roundToDecimals(daily * 7, 1) : null;
  const paceInfo = classifyStudyPace(daily);

  return {
    totalHours,
    totalFormatted: formatHoursAndMinutes(totalHours),
    dailyHours: roundToDecimals(daily, 2),
    studyDays: Math.round(days),
    weeklyEquivalent,
    pace: paceInfo.pace,
    paceLabel: paceInfo.label,
    isValid: true,
    errors: [],
  };
}

// -------------------------------------------------------------
// MODE 3: Study Plan By Subject
// -------------------------------------------------------------
const PRIORITY_WEIGHT_MAP: Record<SubjectPriority, { weight: number; label: string }> = {
  low: { weight: 1, label: 'Low Priority' },
  medium: { weight: 2, label: 'Medium Priority' },
  high: { weight: 3, label: 'High Priority' },
  'very-high': { weight: 4, label: 'Highest Priority' },
};

export function getPriorityWeight(priority: SubjectPriority): number {
  return PRIORITY_WEIGHT_MAP[priority]?.weight ?? 2;
}

export function getPriorityLabel(priority: SubjectPriority): string {
  return PRIORITY_WEIGHT_MAP[priority]?.label ?? 'Medium Priority';
}

export function calculateSubjectStudyPlan(input: SubjectModeInput): SubjectModeResult {
  const errors: string[] = [];

  const rawTotal = String(input.totalWeeklyHours ?? '').trim();
  const rawDays = String(input.studyDaysPerWeek ?? '').trim();

  const errTotal = validateNumber(rawTotal, 'Total study hours', 0.5, 120);
  if (errTotal) errors.push(errTotal);

  const errDays = validateNumber(rawDays, 'Study days per week', 1, 7);
  if (errDays) errors.push(errDays);

  const totalWeekly = Number(rawTotal);
  const daysPerWeek = Number(rawDays);

  if (!input.subjects || input.subjects.length === 0) {
    errors.push('At least one subject is required.');
  } else if (input.subjects.length > 15) {
    errors.push('Maximum 15 subjects supported for effective schedule planning.');
  }

  if (errors.length > 0 || isNaN(totalWeekly) || isNaN(daysPerWeek) || totalWeekly <= 0 || daysPerWeek <= 0) {
    return {
      totalHours: isNaN(totalWeekly) ? 0 : totalWeekly,
      studyDaysPerWeek: isNaN(daysPerWeek) ? 5 : daysPerWeek,
      allocationType: input.allocationType,
      subjects: [],
      averageHoursPerSubject: 0,
      averageHoursFormatted: '0 hrs',
      isValid: false,
      errors,
    };
  }

  const subjectCount = input.subjects.length;
  const isPriority = input.allocationType === 'priority';

  // Compute total weight
  let totalWeight = 0;
  if (isPriority) {
    input.subjects.forEach((s) => {
      totalWeight += getPriorityWeight(s.priority);
    });
  } else {
    totalWeight = subjectCount;
  }

  // Allocate hours per subject
  const subjects: SubjectAllocation[] = input.subjects.map((sub, idx) => {
    const weight = isPriority ? getPriorityWeight(sub.priority) : 1;
    const shareRatio = totalWeight > 0 ? weight / totalWeight : 1 / subjectCount;
    const subjectHoursRaw = totalWeekly * shareRatio;
    const subjectHours = roundToDecimals(subjectHoursRaw, 1);
    const dailyHours = roundToDecimals(subjectHours / daysPerWeek, 2);
    const percentOfTotal = roundToDecimals(shareRatio * 100, 1);

    const safeName = sub.name.trim() || `Subject ${idx + 1}`;

    return {
      id: sub.id,
      name: safeName,
      priority: sub.priority,
      priorityLabel: getPriorityLabel(sub.priority),
      weight,
      hours: subjectHours,
      hoursFormatted: formatHoursAndMinutes(subjectHours),
      dailyHours,
      dailyFormatted: formatHoursAndMinutes(dailyHours),
      percentOfTotal,
    };
  });

  const avgHours = roundToDecimals(totalWeekly / subjectCount, 1);

  return {
    totalHours: roundToDecimals(totalWeekly, 1),
    studyDaysPerWeek: Math.round(daysPerWeek),
    allocationType: input.allocationType,
    subjects,
    averageHoursPerSubject: avgHours,
    averageHoursFormatted: formatHoursAndMinutes(avgHours),
    isValid: true,
    errors: [],
  };
}
