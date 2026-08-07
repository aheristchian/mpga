const abilities = {
  SIXTH_SENSE: {
    name: 'Sixth Sense',
    description: '',
    icon: 'sixth-sense-icon.png',
    target: { self: 0, others: -1, phaseLimit: 1 },
  },
  MAFIA_SHOT: {
    name: 'Shot',
    description: '',
    icon: 'shot-icon.png',
    target: { self: 0, others: -1, phaseLimit: 1 },
  },
  VIGILLANTE_SHOT: {
    name: 'Shot',
    description: '',
    icon: 'shot-icon.png',
    target: { self: 0, others: 2, phaseLimit: 1 },
  },
  REVIVE: {
    name: 'Revive',
    description: '',
    icon: 'revive-icon.png',
    target: { self: 0, others: 1, phaseLimit: 1 },
  },
  INVESTIGATE: {
    name: 'Investigate',
    description: '',
    icon: 'investigate-icon.png',
    target: { self: 0, others: 1, phaseLimit: 1 },
  },
  BLOCK: {
    name: 'Block',
    description: '',
    icon: 'block-icon.png',
    target: { self: 0, others: 1, phaseLimit: 1 },
  },
  BUY: {
    name: 'Buy',
    description: '',
    icon: 'buy-icon.png',
    target: { self: 0, others: -1, phaseLimit: 1 },
  },
  CHOOSE_SIDE: {
    name: 'Choose Side',
    description: '',
    icon: 'choose-side-icon.png',
    target: { self: 0, others: 3, phaseLimit: 3 },
  },
  TREAT: {
    name: 'Treat',
    description: '',
    icon: 'treat-icon.png',
    target: { self: 1, others: -1, phaseLimit: 1 },
  },
  SHIELD: {
    name: 'Shield',
    description: '',
    icon: 'shield-icon.png',
    target: { self: 0, others: -1, phaseLimit: 1 },
  },
  UNLIMITED_SHIELD: {
    name: 'Unlimited Shield',
    description: '',
    icon: 'shield-icon.png',
    target: { self: -1, others: -1, phaseLimit: 1 },
  },
};

export default abilities;
