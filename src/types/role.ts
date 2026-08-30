export type RoleId =
  | 'godfather'
  | 'matador'
  | 'saul-goodman'
  | 'mafia'
  | 'doctor'
  | 'detective'
  | 'citizen'
  | 'nostradamus'
  | 'constantine'
  | 'leon'
  | string;

export type SideId = 'town' | 'mafia' | 'third-party' | string;

export type Alignment = 'Town' | 'Mafia' | 'Independent';

export interface AbilityTarget {
  self: number;
  others: number;
  phaseLimit: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: AbilityTarget;
  priority: number;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  image: string;
  limit: number;
  order: number;
  sideId: SideId;
  modeIds: string[];
  abilityIds: string[];
  passiveAbilityIds: string[];
}

export interface Side {
  id: SideId;
  name: string;
}

export interface RoleGuideItem {
  id: string;
  nameKey: string;
  sideKey: string;
  alignment: Alignment;
  descKey: string;
  abilitiesKey: string;
  icon: string;
  color: string;
  badgeColor: string;
  nightActionPriority?: number;
}
