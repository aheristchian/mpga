import type { GameMode, LastWordCard } from './game';
import type { Role, Ability } from './role';
import type { FactionDefinition } from './faction';
import type { UniversalAbilityDefinition, AbilityUsageQuota } from './ability';

export interface UniversalThemeConfig {
  primaryColor: string;
  accentColor?: string;
  phasePalettes?: {
    lobby?: string;
    day?: string;
    voting?: string;
    midday?: string;
    night?: string;
    gameOver?: string;
  };
  soundtracks?: {
    lobbyStemUrl?: string;
    dayStemUrl?: string;
    votingStemUrl?: string;
    middayStemUrl?: string;
    nightStemUrl?: string;
    victoryStemUrl?: string;
  };
}

export type SpeakingOrderType = 'sequential_shift' | 'random' | 'nomination' | 'free_floor';
export type VotingThresholdType = 'ceil' | 'half' | 'floor' | 'plurality' | 'supermajority';
export type TieResolutionType = 'roulette' | 'no_elimination' | 'revote' | 'moderator_choice';

export interface UniversalPipelineConfig {
  enabledPhases: ('day' | 'voting' | 'midday' | 'night')[];
  speakingOrder: SpeakingOrderType;
  dailySpeakerShift: number;
  allowChallenges: boolean;
  challengesPerDay: number;
  speakingDurationSec: number;
  challengeDurationSec: number;
  defenseDurationSec: number;
  votingThresholdFormula: VotingThresholdType;
  tieResolution: TieResolutionType;
  enableExitCards: boolean; // Enables/disables Midday Last Word card deck
  penaltyWarningLimit: number; // Yellow cards before kick (default: 2)
}

export interface UniversalRoleAssignment {
  abilityId: string;
  overrideQuota?: Partial<AbilityUsageQuota>;
}

export interface UniversalRoleDefinition {
  id: string;
  name: string;
  nameKey?: string;
  description: string;
  descriptionKey?: string;
  tactics?: string;
  tacticsKey?: string;
  factionId: string;
  limit: number;
  icon: string;
  abilities: (string | UniversalRoleAssignment)[];
  inquiryAppearsAsFactionId?: string;
  narrationWakeupCue?: string;
}

export interface UniversalGamePack {
  $schema?: string;
  version: '2.0.0';
  id: string;
  name: string;
  author?: string;
  description?: string;
  createdAt: string;
  theme: UniversalThemeConfig;
  pipeline: UniversalPipelineConfig;
  factions: FactionDefinition[];
  abilities: UniversalAbilityDefinition[];
  roles: UniversalRoleDefinition[];
  exitCards?: LastWordCard[];
}

// Backward-compatible V1 Game Pack structure
export interface GamePack {
  id: string;
  name: string;
  version: string;
  author?: string;
  description?: string;
  createdAt: string;
  modes: GameMode[];
  customRoles?: Role[];
  customAbilities?: Ability[];
  // Optional V2 fields for hybrid packs:
  universal?: UniversalGamePack;
}

export interface GamePackValidationResult {
  valid: boolean;
  errors: string[];
  pack?: GamePack;
  universalPack?: UniversalGamePack;
}
