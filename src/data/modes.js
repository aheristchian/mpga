export const mockModes = [
  {
    id: 'godfather',
    name: 'Godfather',
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
];
