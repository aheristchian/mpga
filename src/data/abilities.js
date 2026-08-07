export const mockAbilities = [
  {
    id: 'sixth-sense',
    name: 'Sixth Sense',
    description: 'Sense danger',
    icon: 'sixth-sense-icon.png',
    target: { self: 0, others: -1, phaseLimit: 1 },
    priority: 99, // Passive / Informational
  },
  {
    id: 'mafia-shot',
    name: 'Shot',
    description: 'A deadly shot',
    icon: 'shot-icon.png',
    target: { self: 0, others: -1, phaseLimit: 1 },
    priority: 2, // Kills after side selection, before blocks
  },
  {
    id: 'vigillante-shot',
    name: 'Shot',
    description: 'Town justice',
    icon: 'shot-icon.png',
    target: { self: 0, others: 2, phaseLimit: 1 },
    priority: 4, // Kills after blocks
  },
  {
    id: 'revive',
    name: 'Revive',
    description: 'Bring a player back',
    icon: 'revive-icon.png',
    target: { self: 0, others: 1, phaseLimit: 1 },
    priority: 6, // Happens at the very end
  },
  {
    id: 'investigate',
    name: 'Investigate',
    description: 'Check a player',
    icon: 'investigate-icon.png',
    target: { self: 0, others: 1, phaseLimit: 1 },
    priority: 5, // Happens after kills are resolved
  },
  {
    id: 'block',
    name: 'Block',
    description: 'Stop an ability',
    icon: 'block-icon.png',
    target: { self: 0, others: 1, phaseLimit: 1 },
    priority: 3, // Blocks happen after mafia shot, before vig/doc
  },
  {
    id: 'buy',
    name: 'Buy',
    description: 'Bribe someone',
    icon: 'buy-icon.png',
    target: { self: 0, others: -1, phaseLimit: 1 },
    priority: 3, // Similar timing to block
  },
  {
    id: 'choose-side',
    name: 'Choose Side',
    description: 'Pick your allegiance',
    icon: 'choose-side-icon.png',
    target: { self: 0, others: 3, phaseLimit: 3 },
    priority: 1, // Absolute highest priority
  },
  {
    id: 'treat',
    name: 'Treat',
    description: 'Save someone',
    icon: 'treat-icon.png',
    target: { self: 0, others: 1, phaseLimit: 1 },
    priority: 4, // Happens alongside vigilante shot (to prevent it)
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'Immunity to shots',
    icon: 'shield-icon.png',
    target: { self: 0, others: 0, phaseLimit: -1 }, // Passive
    priority: 0, // Always active
  },
  {
    id: 'unlimited-shield',
    name: 'Unlimited Shield',
    description: 'Complete immunity',
    icon: 'shield-icon.png',
    target: { self: -1, others: -1, phaseLimit: 1 }, // Passive
    priority: 0, // Always active
  },
];
