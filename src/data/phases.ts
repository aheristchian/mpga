import type { SubPhase } from '../types';

export interface PhaseInfo {
  id: SubPhase;
  name: string;
}

export const mockPhases: PhaseInfo[] = [
  { id: 'day', name: 'Day' },
  { id: 'midday', name: 'Midday' },
  { id: 'night', name: 'Night' },
];
