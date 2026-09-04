export type FactionWinConditionType =
  'elimination' | 'parity' | 'survive' | 'last_standing' | 'custom';

export interface FactionWinCondition {
  type: FactionWinConditionType;
  targetFactionIds?: string[]; // e.g. Win if all 'mafia' or all 'red_team' are dead
  parityAgainstFactionIds?: string[]; // e.g. Win if alive members >= sum of alive in these factions
  customDescription?: string;
}

export type FactionAlignment =
  | 'uninformed_majority' // e.g. Town, Citizens, Blue Team
  | 'informed_minority' // e.g. Mafia, Impostors, Red Team
  | 'independent' // e.g. Serial Killer, Zodiac, Rogue AI
  | 'neutral'; // e.g. Jester, Survivor, Executioner

export interface FactionDefinition {
  id: string; // e.g. 'town', 'mafia', 'blue_team', 'red_team', 'third-party'
  name: string;
  nameKey?: string;
  color: string; // Hex color (e.g. '#3b82f6') or CSS color
  badgeIcon: string; // Emoji or SVG key
  description?: string;
  alignment: FactionAlignment;
  sharedNightVision?: boolean; // Whether members wake up together and see each other's identities
  winCondition: FactionWinCondition;
}
