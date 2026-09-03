import type { GameMode } from './game';
import type { Role, Ability } from './role';

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
}

export interface GamePackValidationResult {
  valid: boolean;
  errors: string[];
  pack?: GamePack;
}
