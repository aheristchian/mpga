export const mockAbilities = [
  {
    id: 'sixth-sense',
    name: 'Sixth Sense',
    description: 'Sense danger',
    icon: 'sixth-sense-icon.png',
    target: { self: 0, others: -1, phaseLimit: 1 },
  },
  {
    id: 'mafia-shot',
    name: 'Shot',
    description: 'A deadly shot',
    icon: 'shot-icon.png',
    target: { self: 0, others: -1, phaseLimit: 1 },
  },
  {
    id: 'vigillante-shot',
    name: 'Shot',
    description: 'Town justice',
    icon: 'shot-icon.png',
    target: { self: 0, others: 2, phaseLimit: 1 },
  },
  {
    id: 'revive',
    name: 'Revive',
    description: 'Bring a player back',
    icon: 'revive-icon.png',
    target: { self: 0, others: 1, phaseLimit: 1 },
  },
  {
    id: 'investigate',
    name: 'Investigate',
    description: 'Check a player',
    icon: 'investigate-icon.png',
    target: { self: 0, others: 1, phaseLimit: 1 },
  },
  {
    id: 'block',
    name: 'Block',
    description: 'Stop an ability',
    icon: 'block-icon.png',
    target: { self: 0, others: 1, phaseLimit: 1 },
  },
  {
    id: 'buy',
    name: 'Buy',
    description: 'Bribe someone',
    icon: 'buy-icon.png',
    target: { self: 0, others: -1, phaseLimit: 1 },
  },
  {
    id: 'choose-side',
    name: 'Choose Side',
    description: 'Pick your allegiance',
    icon: 'choose-side-icon.png',
    target: { self: 0, others: 3, phaseLimit: 3 },
  },
  {
    id: 'treat',
    name: 'Treat',
    description: 'Save someone',
    icon: 'treat-icon.png',
    target: { self: 0, others: 1, phaseLimit: 1 },
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'Immunity to shots',
    icon: 'shield-icon.png',
    target: { self: 0, others: 0, phaseLimit: -1 }, // Passive
  },
  {
    id: 'unlimited-shield',
    name: 'Unlimited Shield',
    description: 'Complete immunity',
    icon: 'shield-icon.png',
    target: { self: -1, others: -1, phaseLimit: 1 }, // Passive
  },
];
