export type EffectPrimitiveType =
  | 'lethal_hit' // Kills target unless protected or shielded
  | 'shield' // Absorbs incoming lethal hits (charges: 1, 2, ..., 'unlimited')
  | 'protect' // Protects target from lethal hits during current resolution
  | 'block' // Prevents target's active ability from executing
  | 'silence' // Prevents target from speaking in next day phase
  | 'absolve' // Cleanses silence or negative status effects
  | 'inquire' // Reveals target's faction/alignment to actor
  | 'count_faction_inquiry' // Counts how many of selected targets belong to a faction (e.g. Nostradamus)
  | 'convert' // Converts target to another faction (e.g. Saul Goodman bribe)
  | 'status_effect'; // Custom status modifier

export interface EffectPrimitive {
  type: EffectPrimitiveType;
  value?: number | string | boolean; // e.g. target faction ID for conversion, shield count, etc.
  isUnpreventable?: boolean; // e.g. Leon self-guilt shot bypasses doctor saves
}

export interface TargetingFilter {
  selfAllowed: boolean;
  selfOnly?: boolean;
  targetCount: { min: number; max: number }; // min/max required targets
  livingState: 'alive' | 'dead' | 'any';
  factionScope: 'all' | 'allies' | 'enemies' | 'specific';
  allowedFactionIds?: string[];
}

export interface AbilityUsageQuota {
  totalCharges: number | 'unlimited';
  chargesPerPhase?: number;
  cooldownPhases?: number;
}

export interface UniversalAbilityDefinition {
  id: string;
  name: string;
  nameKey?: string;
  description: string;
  descriptionKey?: string;
  icon: string;
  priority: number; // 99: Shield/Immunity, 90: Block, 85: Absolve, 80: Protect, 70: Kill, 50: Inquire, 10: Revive
  executionPhase: 'night' | 'day' | 'voting' | 'passive';
  isPassive: boolean;
  passiveDuration?: {
    type: 'permanent' | 'phases';
    count?: number;
  };
  targeting: TargetingFilter;
  quota: AbilityUsageQuota;
  effects: EffectPrimitive[];
  narrationCue?: string; // Spoken TTS prompt when waking this ability
}
