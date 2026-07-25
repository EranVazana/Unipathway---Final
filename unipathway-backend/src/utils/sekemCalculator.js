/**
 * sekemCalculator.js
 * Core Sekem scoring logic for UniPathway.
 * Used by validators (for eligibility checks) and controllers (for storing results).
 */

// Maps a weighted psychometric sub-score (50-150 scale) to the standard 200-800 scale.
function toPsychometricScale(subScore) {
  return ((subScore - 50) / 100) * 600 + 200;
}

/**
 * Calculates the user's Sekem score for a given threshold.
 *
 * Step 1 - Bagrut average (weighted by units), range 0-100:
 *   bagrutAvg = sum(grade × units) / sum(units)
 *
 * Step 2 - Psychometric composite (depends on sekemType), range 200-800:
 *   general:      40% Quant + 40% Verbal + 20% English
 *   quantitative: 60% Quant + 20% Verbal + 20% English
 *   verbal:       20% Quant + 60% Verbal + 20% English
 *   (the weighted sub-score, on a 50-150 scale, is then mapped to 200-800)
 *
 * Step 3 - Combine using the threshold's weights:
 *   sekem = (bagrutAvg × bagrutWeight) + (psychometric × psychometricWeight)
 *
 * Step 4 - Apply bagrut-related bonuses from threshold.sekemBonuses
 *
 * Returns the score rounded to 2 decimal places, or null if scores are missing.
 */
function calculateUserSekem(user, threshold) {
  const { psychometricScores, bagrutScores } = user;
  const { sekemType, sekemWeights, sekemBonuses } = threshold;

  if (!psychometricScores || !bagrutScores) return null;

  // Step 1 — Bagrut weighted average (0-100)
  let totalPoints = 0;
  let totalUnits = 0;
  for (const { grade, units } of Object.values(bagrutScores)) {
    totalPoints += grade * units;
    totalUnits += units;
  }
  let bagrutAvg = totalUnits > 0 ? totalPoints / totalUnits : 0;

  // Step 2 — Psychometric composite (mapped to 200-800)
  const { verbal, quantitative, english } = psychometricScores;
  let weightedSubScore;
  if (sekemType === 'quantitative') {
    weightedSubScore = 0.60 * quantitative + 0.20 * verbal + 0.20 * english;
  } else if (sekemType === 'verbal') {
    weightedSubScore = 0.20 * quantitative + 0.60 * verbal + 0.20 * english;
  } else { // general
    weightedSubScore = 0.40 * quantitative + 0.40 * verbal + 0.20 * english;
  }
  const psychometric = toPsychometricScale(weightedSubScore);

  // Step 3 — Apply bagrut-related bonuses
  for (const bonus of (sekemBonuses || [])) {
    if (bonus.condition === '5-unit Math'    && bagrutScores.mathematics?.units === 5) bagrutAvg += bonus.points;
    if (bonus.condition === '5-unit English' && bagrutScores.english?.units    === 5) bagrutAvg += bonus.points;
    if (bonus.condition === '5-unit Physics' && bagrutScores.physics?.units    === 5) bagrutAvg += bonus.points;
  }

  // Step 4 — Combine
  let sekem = (bagrutAvg * sekemWeights.bagrutWeight) + (psychometric * sekemWeights.psychometricWeight);

  return Math.round(sekem * 100) / 100;
}

/**
 * Derives the sekemStatus string from a user's score vs a threshold.
 * Always called server-side — never provided by the client.
 *
 * Returns:
 *   'passed-required-acceptance-score'  — user Sekem >= minSekem
 *   'below-required-acceptance-score'   — user Sekem < minSekem
 *   'no-data'                           — missing scores or threshold
 */
function deriveSekemStatus(user, threshold) {
  if (!threshold || !user.psychometricScores || !user.bagrutScores) {
    return 'no-data';
  }
  const userSekem = calculateUserSekem(user, threshold);
  return userSekem >= threshold.minSekem
    ? 'passed-required-acceptance-score'
    : 'below-required-acceptance-score';
}

/**
 * Returns the most recent threshold for a given departmentId.
 */
function getLatestThreshold(admissionThresholds, departmentId) {
  return admissionThresholds
    .filter(t => t.departmentId === departmentId)
    .sort((a, b) => b.year - a.year)[0] || null;
}

module.exports = { calculateUserSekem, deriveSekemStatus, getLatestThreshold };