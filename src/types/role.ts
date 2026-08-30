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

export type AbilityType =
  | 'kill'
  | 'heal'
  | 'shield'
  | 'inquire'
  | 'block'
  | 'bribe'
  | 'revive'
  | 'prophecy'
  | 'passive';

export type AbilityTypeColor = 'red' | 'emerald' | 'blue' | 'purple' | 'amber';

export interface AbilityTargetRules {
  selfAllowed: boolean;
  othersCount: number; // -1 for any, 0 for none, 1+ for count
  phaseLimit: number;
  livingOnly: boolean;
  deadOnly?: boolean;
}

export interface Ability {
  id: string;
  nameKey: string;
  descriptionKey: string;
  actionNameKey?: string;
  actionDescKey?: string;
  icon: string;
  priority: number;
  type: AbilityType;
  typeKey: string;
  typeColor: AbilityTypeColor;
  chargesKey: string;
  target: AbilityTargetRules;
  isPassive?: boolean;
}

export interface Role {
  id: RoleId;
  nameKey: string;
  descriptionKey: string;
  tacticsKey: string;
  badgeKey: string;
  sideId: SideId;
  modeIds: string[];
  limit: number;
  order: number;
  image: string;
  svgKey: string;
  abilityIds: string[];
  passiveAbilityIds: string[];
  inquiryAppearsAs?: SideId;
  name?: string;
  description?: string;
}

export interface Side {
  id: SideId;
  name: string;
  nameKey?: string;
}

export interface HydratedRole extends Role {
  side: Side | null;
  abilities: Ability[];
  passiveAbilities: Ability[];
}

export interface NightActionOption {
  id: string;
  nameKey: string;
  icon: string;
  descriptionKey?: string;
  ability?: Ability;
}

export interface GuideAbility {
  id: string;
  nameKey: string;
  descKey: string;
  typeKey: string;
  typeColor: string;
  priority: number;
  icon: string;
  selfAllowed: boolean;
  livingOnly: boolean;
  chargesKey: string;
}

export interface GuideRole {
  id: string;
  sideId: string;
  nameKey: string;
  descKey: string;
  badgeKey: string;
  svgKey: string;
  abilities: GuideAbility[];
  tacticsKey: string;
}

export interface NightResolutionStep {
  step: number;
  priority: number;
  titleKey: string;
  descKey: string;
  icon: string;
  actors: string[];
  color: string;
}
