import type {
  AttendanceMode,
  AttendanceResult,
  AttendanceStatus,
  AttendanceValidationError,
} from '../types/attendance.ts';

/**
 * Rounds a number to a specified number of decimal places avoiding floating-point inaccuracies.
 */
export function roundToDecimals(num: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * Validates integer class counts.
 */
function validateClassCount(val: string, fieldName: string, label: string): AttendanceValidationError | null {
  const trimmed = val.trim();
  if (trimmed === '') {
    return { field: fieldName, message: `${label} cannot be empty.` };
  }
  const num = Number(trimmed);
  if (isNaN(num)) {
    return { field: fieldName, message: `${label} must be a valid number.` };
  }
  if (!Number.isInteger(num)) {
    return { field: fieldName, message: `${label} must be a whole integer number.` };
  }
  if (num < 0) {
    return { field: fieldName, message: `${label} cannot be negative.` };
  }
  if (num > 500) {
    return { field: fieldName, message: `${label} exceeds practical semester limits (max 500).` };
  }
  return null;
}

/**
 * Validates percentage input (0 to 100).
 */
function validatePercentage(val: string, fieldName: string, label: string): AttendanceValidationError | null {
  const trimmed = val.trim();
  if (trimmed === '') {
    return { field: fieldName, message: `${label} cannot be empty.` };
  }
  const num = Number(trimmed);
  if (isNaN(num)) {
    return { field: fieldName, message: `${label} must be a valid number.` };
  }
  if (num < 0) {
    return { field: fieldName, message: `${label} cannot be negative.` };
  }
  if (num > 100) {
    return { field: fieldName, message: `${label} cannot exceed 100%.` };
  }
  return null;
}

/**
 * CALCULATOR 1 — Calculates Current Attendance Percentage
 */
export function calculateAttendancePercentage(
  rawAttended: string | number,
  rawMissed: string | number
): AttendanceResult {
  const errors: string[] = [];

  const errAttended = validateClassCount(String(rawAttended ?? ''), 'attended', 'Classes attended');
  if (errAttended) errors.push(errAttended.message);

  const errMissed = validateClassCount(String(rawMissed ?? ''), 'missed', 'Classes missed');
  if (errMissed) errors.push(errMissed.message);

  const attended = Number(rawAttended);
  const missed = Number(rawMissed);
  const total = (isNaN(attended) ? 0 : attended) + (isNaN(missed) ? 0 : missed);

  if (errors.length > 0) {
    return {
      mode: 'percentage',
      status: 'invalid',
      primaryMetric: '--.--%',
      primaryLabel: 'Current Attendance',
      statusBadge: 'Awaiting Valid Input',
      headline: 'Invalid class numbers',
      description: 'Please input valid non-negative integer numbers for attended and missed classes.',
      currentPercentage: 0,
      attendedClasses: isNaN(attended) ? 0 : attended,
      missedClasses: isNaN(missed) ? 0 : missed,
      totalClasses: total,
      isValid: false,
      errors,
    };
  }

  if (total === 0) {
    return {
      mode: 'percentage',
      status: 'safe',
      primaryMetric: '0.0%',
      primaryLabel: 'Current Attendance',
      statusBadge: 'No Classes Held',
      headline: 'No classes have been recorded yet',
      description: 'Enter your attended and missed lecture counts to compute your attendance percentage.',
      currentPercentage: 0,
      attendedClasses: 0,
      missedClasses: 0,
      totalClasses: 0,
      isValid: true,
      errors: [],
    };
  }

  const rawPercent = (attended / total) * 100;
  const currentPercentage = roundToDecimals(rawPercent, 1);

  let status: AttendanceStatus = 'safe';
  let statusBadge = 'In Safe Zone';
  let headline = `Current attendance: ${currentPercentage.toFixed(1)}%`;
  let description = `You have attended ${attended} out of ${total} total classes held so far.`;

  if (currentPercentage >= 85) {
    status = 'safe';
    statusBadge = 'Excellent Standing';
    headline = `Excellent attendance: ${currentPercentage.toFixed(1)}%`;
    description = `You have attended ${attended} of ${total} classes (${currentPercentage.toFixed(1)}%), well above standard university mandates.`;
  } else if (currentPercentage >= 75) {
    status = 'safe';
    statusBadge = 'In Safe Zone (≥75%)';
    headline = `In Safe Zone: ${currentPercentage.toFixed(1)}%`;
    description = `You meet the common 75% university attendance threshold (${attended}/${total} classes attended).`;
  } else if (currentPercentage >= 65) {
    status = 'warning';
    statusBadge = 'Attendance Warning';
    headline = `Warning: ${currentPercentage.toFixed(1)}% Attendance`;
    description = `Your attendance is below 75%. You risk debarment from final exams unless you attend upcoming classes.`;
  } else {
    status = 'critical';
    statusBadge = 'Critical (<65%)';
    headline = `Critical: ${currentPercentage.toFixed(1)}% Attendance`;
    description = `Your attendance is severely low. Immediate consecutive attendance is required to regain exam eligibility.`;
  }

  return {
    mode: 'percentage',
    status,
    primaryMetric: `${currentPercentage.toFixed(1)}%`,
    primaryLabel: 'Attendance Percentage',
    statusBadge,
    headline,
    description,
    currentPercentage,
    attendedClasses: attended,
    missedClasses: missed,
    totalClasses: total,
    isValid: true,
    errors: [],
  };
}

/**
 * CALCULATOR 2 — Calculates How Many Classes a Student Can Miss (Safe Bunks)
 * Formula: x = floor( (100 * Attended / RequiredPercentage) - TotalHeld )
 */
export function calculateClassesCanMiss(
  rawAttended: string | number,
  rawTotalHeld: string | number,
  rawRequired: string | number
): AttendanceResult {
  const errors: string[] = [];

  const errAttended = validateClassCount(String(rawAttended ?? ''), 'attended', 'Classes attended');
  if (errAttended) errors.push(errAttended.message);

  const errTotal = validateClassCount(String(rawTotalHeld ?? ''), 'totalHeld', 'Total classes held');
  if (errTotal) errors.push(errTotal.message);

  const errReq = validatePercentage(String(rawRequired ?? ''), 'requiredPercentage', 'Required attendance percentage');
  if (errReq) errors.push(errReq.message);

  const attended = Number(rawAttended);
  const totalHeld = Number(rawTotalHeld);
  const required = Number(rawRequired);

  if (!isNaN(attended) && !isNaN(totalHeld) && attended > totalHeld) {
    errors.push('Classes attended cannot exceed total classes held so far.');
  }

  if (required <= 0) {
    errors.push('Required attendance percentage must be greater than 0%.');
  }

  const missed = (!isNaN(totalHeld) && !isNaN(attended)) ? Math.max(0, totalHeld - attended) : 0;

  if (errors.length > 0) {
    return {
      mode: 'bunks',
      status: 'invalid',
      primaryMetric: '-- Classes',
      primaryLabel: 'Safe Absences',
      statusBadge: 'Awaiting Input',
      headline: 'Invalid attendance parameters',
      description: 'Please correct the highlighted inputs above to calculate your safe absences.',
      currentPercentage: 0,
      attendedClasses: isNaN(attended) ? 0 : attended,
      missedClasses: missed,
      totalClasses: isNaN(totalHeld) ? 0 : totalHeld,
      thresholdPercentage: isNaN(required) ? 75 : required,
      isValid: false,
      errors,
    };
  }

  if (totalHeld === 0) {
    return {
      mode: 'bunks',
      status: 'safe',
      primaryMetric: '0 Classes',
      primaryLabel: 'Safe Absences',
      statusBadge: 'Term Not Started',
      headline: 'No classes have occurred yet',
      description: 'Record your first attended or missed lectures to calculate safe absences.',
      currentPercentage: 0,
      attendedClasses: 0,
      missedClasses: 0,
      totalClasses: 0,
      safeMisses: 0,
      thresholdPercentage: required,
      isValid: true,
      errors: [],
    };
  }

  const currentPercent = roundToDecimals((attended / totalHeld) * 100, 1);

  // Exact Formula: x = floor((100 * A / R) - T)
  const rawMaxMiss = (100 * attended) / required - totalHeld;
  // Account for floating-point precision issues with epsilon
  const safeMissesCalculated = Math.floor(rawMaxMiss + 1e-9);

  if (safeMissesCalculated < 0 || currentPercent < required) {
    // Current attendance is below requirement -> 0 safe misses
    // Calculate how many they need to attend to catch up:
    let neededToCatchUp = 0;
    if (required < 100) {
      const numerator = (required * totalHeld) - (100 * attended);
      const denominator = 100 - required;
      neededToCatchUp = Math.max(1, Math.ceil((numerator / denominator) - 1e-9));
    }

    return {
      mode: 'bunks',
      status: 'critical',
      primaryMetric: '0 Classes',
      primaryLabel: 'Classes You Can Miss',
      statusBadge: 'Zero Absences Allowed',
      headline: `You cannot miss any classes.`,
      description: `Your current attendance (${currentPercent.toFixed(1)}%) is below your required ${required}%. You need to attend ${neededToCatchUp} consecutive classes to restore compliance.`,
      currentPercentage: currentPercent,
      attendedClasses: attended,
      missedClasses: missed,
      totalClasses: totalHeld,
      safeMisses: 0,
      thresholdPercentage: required,
      isValid: true,
      errors: [],
    };
  }

  if (safeMissesCalculated === 0) {
    return {
      mode: 'bunks',
      status: 'warning',
      primaryMetric: '0 Classes',
      primaryLabel: 'Classes You Can Miss',
      statusBadge: 'On The Brink',
      headline: `You cannot afford to miss any classes right now.`,
      description: `Your current attendance (${currentPercent.toFixed(1)}%) is exactly on the margin of your ${required}% threshold. Missing even 1 class will drop you into penalty territory.`,
      currentPercentage: currentPercent,
      attendedClasses: attended,
      missedClasses: missed,
      totalClasses: totalHeld,
      safeMisses: 0,
      thresholdPercentage: required,
      isValid: true,
      errors: [],
    };
  }

  // Safe misses > 0
  const projectedTotal = totalHeld + safeMissesCalculated;
  const projectedPercent = roundToDecimals((attended / projectedTotal) * 100, 1);

  return {
    mode: 'bunks',
    status: 'safe',
    primaryMetric: `${safeMissesCalculated} ${safeMissesCalculated === 1 ? 'Class' : 'Classes'}`,
    primaryLabel: 'Safe Absences Available',
    statusBadge: 'Safe to Miss',
    headline: `You can miss ${safeMissesCalculated} more ${safeMissesCalculated === 1 ? 'class' : 'classes'} and remain at ${required}%.`,
    description: `If you miss ${safeMissesCalculated} future classes without attending, your attendance will be ${projectedPercent.toFixed(1)}%, safely meeting your ${required}% policy requirement.`,
    currentPercentage: currentPercent,
    attendedClasses: attended,
    missedClasses: missed,
    totalClasses: totalHeld,
    safeMisses: safeMissesCalculated,
    thresholdPercentage: required,
    isValid: true,
    errors: [],
  };
}

/**
 * CALCULATOR 3 — Calculates Classes Needed to Reach Target Attendance
 * Formula: y = ceil( (Target * TotalHeld - 100 * Attended) / (100 - Target) )
 */
export function calculateClassesNeeded(
  rawAttended: string | number,
  rawMissed: string | number,
  rawTarget: string | number
): AttendanceResult {
  const errors: string[] = [];

  const errAttended = validateClassCount(String(rawAttended ?? ''), 'attended', 'Classes attended');
  if (errAttended) errors.push(errAttended.message);

  const errMissed = validateClassCount(String(rawMissed ?? ''), 'missed', 'Classes missed');
  if (errMissed) errors.push(errMissed.message);

  const errTarget = validatePercentage(String(rawTarget ?? ''), 'targetPercentage', 'Target attendance percentage');
  if (errTarget) errors.push(errTarget.message);

  const attended = Number(rawAttended);
  const missed = Number(rawMissed);
  const target = Number(rawTarget);
  const total = (isNaN(attended) ? 0 : attended) + (isNaN(missed) ? 0 : missed);

  if (target <= 0) {
    errors.push('Target attendance percentage must be greater than 0%.');
  }

  if (errors.length > 0) {
    return {
      mode: 'target',
      status: 'invalid',
      primaryMetric: '-- Classes',
      primaryLabel: 'Classes to Attend',
      statusBadge: 'Awaiting Input',
      headline: 'Invalid target parameters',
      description: 'Please correct the highlighted inputs above to calculate required classes.',
      currentPercentage: 0,
      attendedClasses: isNaN(attended) ? 0 : attended,
      missedClasses: isNaN(missed) ? 0 : missed,
      totalClasses: total,
      thresholdPercentage: isNaN(target) ? 80 : target,
      isValid: false,
      errors,
    };
  }

  if (total === 0) {
    return {
      mode: 'target',
      status: 'safe',
      primaryMetric: '0 Classes',
      primaryLabel: 'Classes to Attend',
      statusBadge: 'Term Not Started',
      headline: 'No classes have taken place yet',
      description: 'Enter your attended and missed counts to project upcoming attendance requirements.',
      currentPercentage: 0,
      attendedClasses: 0,
      missedClasses: 0,
      totalClasses: 0,
      classesNeeded: 0,
      thresholdPercentage: target,
      isValid: true,
      errors: [],
    };
  }

  const currentPercent = roundToDecimals((attended / total) * 100, 1);

  // Special Case 1: Target is 100%
  if (Math.abs(target - 100) < 0.001) {
    if (missed > 0) {
      return {
        mode: 'target',
        status: 'impossible',
        primaryMetric: 'Impossible',
        primaryLabel: 'Required Classes',
        statusBadge: 'Mathematically Impossible',
        headline: `100.0% attendance is mathematically impossible.`,
        description: `Because you have already missed ${missed} ${missed === 1 ? 'class' : 'classes'}, your cumulative attendance can never reach 100.0% unless previous absences are officially pardoned.`,
        currentPercentage: currentPercent,
        attendedClasses: attended,
        missedClasses: missed,
        totalClasses: total,
        classesNeeded: 0,
        thresholdPercentage: 100,
        isValid: true,
        errors: [],
      };
    } else {
      return {
        mode: 'target',
        status: 'achieved',
        primaryMetric: '0 Classes',
        primaryLabel: 'Required Classes',
        statusBadge: 'Target Achieved',
        headline: `Target already achieved!`,
        description: `You have attended 100.0% of your classes (${attended}/${total}).`,
        currentPercentage: 100,
        attendedClasses: attended,
        missedClasses: 0,
        totalClasses: total,
        classesNeeded: 0,
        thresholdPercentage: 100,
        isValid: true,
        errors: [],
      };
    }
  }

  // Special Case 2: Target is already achieved
  if (currentPercent >= target) {
    return {
      mode: 'target',
      status: 'achieved',
      primaryMetric: '0 Classes',
      primaryLabel: 'Required Classes',
      statusBadge: 'Target Already Met',
      headline: `Target already achieved!`,
      description: `Your current attendance (${currentPercent.toFixed(1)}%) already satisfies or exceeds your target of ${target}%.`,
      currentPercentage: currentPercent,
      attendedClasses: attended,
      missedClasses: missed,
      totalClasses: total,
      classesNeeded: 0,
      thresholdPercentage: target,
      isValid: true,
      errors: [],
    };
  }

  // Normal Case: Current < Target < 100
  // Formula: y = ceil((target * total - 100 * attended) / (100 - target))
  const numerator = (target * total) - (100 * attended);
  const denominator = 100 - target;
  const rawNeeded = numerator / denominator;
  const classesNeeded = Math.max(1, Math.ceil(rawNeeded - 1e-9));

  const newAttended = attended + classesNeeded;
  const newTotal = total + classesNeeded;
  const projectedPercent = roundToDecimals((newAttended / newTotal) * 100, 1);

  return {
    mode: 'target',
    status: 'warning',
    primaryMetric: `${classesNeeded} ${classesNeeded === 1 ? 'Class' : 'Classes'}`,
    primaryLabel: 'Classes You Must Attend',
    statusBadge: 'Action Required',
    headline: `You need to attend ${classesNeeded} consecutive ${classesNeeded === 1 ? 'class' : 'classes'} to reach ${target}%.`,
    description: `Attending the next ${classesNeeded} ${classesNeeded === 1 ? 'lecture' : 'lectures'} without missing will bring your overall attendance to ${projectedPercent.toFixed(1)}%.`,
    currentPercentage: currentPercent,
    attendedClasses: attended,
    missedClasses: missed,
    totalClasses: total,
    classesNeeded,
    thresholdPercentage: target,
    isValid: true,
    errors: [],
  };
}
