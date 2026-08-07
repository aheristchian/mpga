export const mockModes = [
  {
    id: 'godfather',
    nameKey: 'modes.godfather.name',
    minPlayers: 4,
    timeToTalk: 40,
    borrowedTimeToTalk: 25,
    // Data-driven rules for validation
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
    balanceRules: {
      warnIfSideExceedsRatio: {
        sideId: 'mafia',
        maxRatio: 0.33,
      },
    },
  },
];
