/**
 * Voting Service & Calculation Utilities
 *
 * Implements standard Mafia voting rules:
 * - A player under vote cannot vote for themselves: max votes = Math.max(0, aliveCount - 1).
 * - Threshold qualification based on mode rounding rules ('ceil', 'floor', 'half').
 */

/**
 * Calculates the qualification voting threshold based on mode rounding rules.
 * @param {number} aliveCount - Total number of living players
 * @param {'ceil'|'floor'|'half'} [rounding='ceil'] - Rounding rule from gameMode
 * @returns {number}
 */
export function calculateVotingThreshold(aliveCount, rounding = 'ceil') {
  if (aliveCount <= 0) return 0;
  if (rounding === 'ceil') return Math.ceil(aliveCount / 2);
  if (rounding === 'floor') return Math.floor(aliveCount / 2);
  return Math.round(aliveCount / 2);
}

/**
 * Calculates the maximum votes a single candidate can receive.
 * In Mafia, a player cannot vote for themselves, so max votes = aliveCount - 1.
 * @param {number} aliveCount - Total number of living players
 * @returns {number}
 */
export function calculateMaxVotesPerCandidate(aliveCount) {
  return Math.max(0, aliveCount - 1);
}

/**
 * Clamps a vote tally between 0 and the maximum allowed votes.
 * @param {number} currentVotes - Current vote count
 * @param {number} delta - Vote adjustment (+1 or -1)
 * @param {number} aliveCount - Total number of living players
 * @returns {number}
 */
export function clampVotes(currentVotes, delta, aliveCount) {
  const max = calculateMaxVotesPerCandidate(aliveCount);
  return Math.min(max, Math.max(0, (currentVotes || 0) + delta));
}
