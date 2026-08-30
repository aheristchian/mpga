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

/**
 * Processes a single pre-vote ballot from a voter for a candidate.
 * Toggles the vote (adds if not present, removes if already present).
 * Prevents self-voting and bounds maximum votes.
 *
 * @param {string} voterName
 * @param {string} candidateName
 * @param {Record<string, Set<string>|string[]>} voterMap - voter -> list/set of candidate names
 * @param {Record<string, number>} counts - candidate -> vote count
 * @param {number} aliveCount - Total living players
 * @returns {{ changed: boolean, added: boolean, voterChoices: string[] }}
 */
export function togglePreVote(voterName, candidateName, voterMap, counts, aliveCount) {
  if (!voterName || !candidateName || voterName.trim().toLowerCase() === candidateName.trim().toLowerCase()) {
    return { changed: false, added: false, voterChoices: [] };
  }

  const normalizedVoter = voterName.trim().toLowerCase();
  const normalizedCandidate = candidateName.trim();

  if (!voterMap[normalizedVoter]) {
    voterMap[normalizedVoter] = new Set();
  } else if (Array.isArray(voterMap[normalizedVoter])) {
    voterMap[normalizedVoter] = new Set(voterMap[normalizedVoter]);
  }

  const voterSet = voterMap[normalizedVoter];
  const maxVotes = calculateMaxVotesPerCandidate(aliveCount);
  const currentCandidateVotes = counts[normalizedCandidate] || 0;

  if (voterSet.has(normalizedCandidate)) {
    // Retract vote
    voterSet.delete(normalizedCandidate);
    counts[normalizedCandidate] = Math.max(0, currentCandidateVotes - 1);
    return { changed: true, added: false, voterChoices: Array.from(voterSet) };
  } else {
    // Add vote (if within max limit)
    if (currentCandidateVotes < maxVotes) {
      voterSet.add(normalizedCandidate);
      counts[normalizedCandidate] = currentCandidateVotes + 1;
      return { changed: true, added: true, voterChoices: Array.from(voterSet) };
    }
    return { changed: false, added: false, voterChoices: Array.from(voterSet) };
  }
}

/**
 * Processes a single final-vote ballot from a voter for a candidate.
 * Enforces 1 vote per voter total across all defenders.
 * Tapping the same defender toggles/retracts the vote.
 * Tapping a different defender switches the vote.
 *
 * @param {string} voterName
 * @param {string} defenderName
 * @param {Record<string, string|null>} voterMap - voter -> chosen defender name
 * @param {Record<string, number>} counts - defender -> vote count
 * @param {number} aliveCount - Total living players
 * @returns {{ changed: boolean, chosenDefender: string|null }}
 */
export function castFinalVote(voterName, defenderName, voterMap, counts, aliveCount) {
  if (!voterName || !defenderName || voterName.trim().toLowerCase() === defenderName.trim().toLowerCase()) {
    return { changed: false, chosenDefender: null };
  }

  const normalizedVoter = voterName.trim().toLowerCase();
  const normalizedDefender = defenderName.trim();
  const previousChoice = voterMap[normalizedVoter] || null;
  const maxVotes = calculateMaxVotesPerCandidate(aliveCount);

  if (previousChoice === normalizedDefender) {
    // Retract final vote
    voterMap[normalizedVoter] = null;
    counts[normalizedDefender] = Math.max(0, (counts[normalizedDefender] || 0) - 1);
    return { changed: true, chosenDefender: null };
  }

  // If voter had another choice previously, decrement previous choice
  if (previousChoice) {
    counts[previousChoice] = Math.max(0, (counts[previousChoice] || 0) - 1);
  }

  // Increment new choice (respecting maxVotes)
  const currentDefenderVotes = counts[normalizedDefender] || 0;
  if (currentDefenderVotes < maxVotes) {
    voterMap[normalizedVoter] = normalizedDefender;
    counts[normalizedDefender] = currentDefenderVotes + 1;
    return { changed: true, chosenDefender: normalizedDefender };
  } else {
    voterMap[normalizedVoter] = null;
    return { changed: false, chosenDefender: null };
  }
}
