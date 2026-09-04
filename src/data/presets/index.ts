import type { UniversalGamePack } from '../../types';
import { cybersecurityPreset } from './cybersecurity';
import { godfatherPreset } from './godfather';
import { classicMafiaPreset } from './classic';
import { zodiacPreset } from './zodiac';
import { vendettaPreset } from './vendetta';
import { tehranProPreset } from './tehranPro';
import { speedBlitzPreset } from './speedBlitz';

export { cybersecurityPreset } from './cybersecurity';
export { godfatherPreset } from './godfather';
export { classicMafiaPreset } from './classic';
export { zodiacPreset } from './zodiac';
export { vendettaPreset } from './vendetta';
export { tehranProPreset } from './tehranPro';
export { speedBlitzPreset } from './speedBlitz';

export const MODE_TO_UNIVERSAL_PACK_MAP: Record<string, UniversalGamePack> = {
  godfather: godfatherPreset,
  classic: classicMafiaPreset,
  zodiac: zodiacPreset,
  vendetta: vendettaPreset,
  'cyber-breach': cybersecurityPreset,
  'tehran-pro': tehranProPreset,
  'tehran-pro-league': tehranProPreset,
  'speed-blitz': speedBlitzPreset,
  'speed-blitz-mafia': speedBlitzPreset,
};
