import type { Ability } from '../types';

export const mockAbilities: Ability[] = [
  {
    id: 'sixth-sense',
    name: 'Sixth Sense',
    description: 'Sense danger',
    icon: 'sixth-sense-icon.png',
    target: { self: 0, others: -1, phaseLimit: 1 },
    priority: 99, // Passive / Informational
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'Immunity to shots',
    icon: 'shield-icon.png',
    target: { self: 0, others: 0, phaseLimit: -1 }, // Passive
    priority: 99, // Always active
  },
  {
    id: 'unlimited-shield',
    name: 'Unlimited Shield',
    description: 'Complete immunity',
    icon: 'shield-icon.png',
    target: { self: -1, others: -1, phaseLimit: 1 }, // Passive
    priority: 99, // Always active
  },
  {
    id: 'block',
    name: 'Block',
    description: 'Stop an ability',
    icon: 'block-icon.png',
    target: { self: 0, others: 1, phaseLimit: 1 },
    priority: 90, // Blocks happen first before targets can act
  },
  {
    id: 'buy',
    name: 'Buy',
    description: 'Bribe someone',
    icon: 'buy-icon.png',
    target: { self: 0, others: -1, phaseLimit: 1 },
    priority: 90, // Saul Goodman recruit / buy
  },
  {
    id: 'treat',
    name: 'Treat',
    description: 'Save someone',
    icon: 'treat-icon.png',
    target: { self: 1, others: 1, phaseLimit: 1 },
    priority: 80, // Doctor treatment shields before shots land
  },
  {
    id: 'mafia-shot',
    name: 'Shot',
    description: 'A deadly shot',
    icon: 'shot-icon.png',
    target: { self: 0, others: -1, phaseLimit: 1 },
    priority: 70, // Night lethal shots
  },
  {
    id: 'vigillante-shot',
    name: 'Shot',
    description: 'Town justice',
    icon: 'shot-icon.png',
    target: { self: 0, others: 2, phaseLimit: 1 },
    priority: 70, // Vigilante shot
  },
  {
    id: 'investigate',
    name: 'Investigate',
    description: 'Check a player',
    icon: 'investigate-icon.png',
    target: { self: 0, others: 1, phaseLimit: 1 },
    priority: 50, // Detective inquiry
  },
  {
    id: 'choose-side',
    name: 'Choose Side',
    description: 'Pick your allegiance',
    icon: 'choose-side-icon.png',
    target: { self: 0, others: 3, phaseLimit: 3 },
    priority: 50, // Nostradamus alignment inquiry
  },
  {
    id: 'revive',
    name: 'Revive',
    description: 'Bring a player back',
    icon: 'revive-icon.png',
    target: { self: 0, others: 1, phaseLimit: 1 },
    priority: 10, // Constantine revival executes last
  },
];
