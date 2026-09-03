import type { GameMode } from '../types';

export const mockModes: GameMode[] = [
  {
    id: 'godfather',
    nameKey: 'modes.godfather.name',
    minPlayers: 4,
    timeToTalk: 40,
    borrowedTimeToTalk: 25,
    defenseTimeToTalk: 60,
    challengesPerDay: 1,
    nextDayShift: 2, // Shifts starting player by 2 each day
    votingThresholdRounding: 'ceil', // 'ceil', 'floor', or 'half'
    balanceRules: {
      warnIfSideExceedsRatio: {
        sideId: 'mafia',
        maxRatio: 0.34, // e.g., Mafia should not be more than roughly 1/3 of the game
      },
    },
  },
  {
    id: 'classic',
    nameKey: 'modes.classic.name',
    minPlayers: 4,
    timeToTalk: 60,
    borrowedTimeToTalk: 30,
    defenseTimeToTalk: 60,
    challengesPerDay: 1,
    nextDayShift: 1,
    votingThresholdRounding: 'half',
    balanceRules: {
      warnIfSideExceedsRatio: {
        sideId: 'mafia',
        maxRatio: 0.33,
      },
    },
  },
  {
    id: 'zodiac',
    nameKey: 'modes.zodiac.name',
    minPlayers: 6,
    timeToTalk: 45,
    borrowedTimeToTalk: 25,
    defenseTimeToTalk: 60,
    challengesPerDay: 2,
    nextDayShift: 2,
    votingThresholdRounding: 'ceil',
    balanceRules: {
      warnIfSideExceedsRatio: {
        sideId: 'mafia',
        maxRatio: 0.34,
      },
    },
  },
  {
    id: 'vendetta',
    nameKey: 'modes.vendetta.name',
    minPlayers: 6,
    timeToTalk: 50,
    borrowedTimeToTalk: 25,
    defenseTimeToTalk: 60,
    challengesPerDay: 1,
    nextDayShift: 1,
    votingThresholdRounding: 'ceil',
    balanceRules: {
      warnIfSideExceedsRatio: {
        sideId: 'mafia',
        maxRatio: 0.34,
      },
    },
  },
  {
    id: 'cyber-breach',
    nameKey: 'modes.cyberBreach.name',
    minPlayers: 6,
    timeToTalk: 45,
    borrowedTimeToTalk: 25,
    defenseTimeToTalk: 60,
    challengesPerDay: 2,
    nextDayShift: 2,
    votingThresholdRounding: 'ceil',
    balanceRules: {
      warnIfSideExceedsRatio: {
        sideId: 'mafia',
        maxRatio: 0.34,
      },
    },
  },
];
