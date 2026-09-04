import { ref } from 'vue';
import { mockModes } from '../data/modes';
import { mockRoles } from '../data/roles';
import { loadEncoded, saveEncoded } from '../utils/storage';
import {
  cybersecurityPreset,
  godfatherPreset,
  classicMafiaPreset,
  zodiacPreset,
  vendettaPreset,
  tehranProPreset,
  speedBlitzPreset,
} from '../data/presets';
import type {
  GameMode,
  Role,
  GamePack,
  UniversalGamePack,
  GamePackValidationResult,
  UniversalRoleDefinition,
} from '../types';

export const STORAGE_CUSTOM_MODES_KEY = 'mpga_custom_modes';
export const STORAGE_CUSTOM_ROLES_KEY = 'mpga_custom_roles';
export const STORAGE_CUSTOM_PACKS_KEY = 'mpga_custom_game_packs';
export const STORAGE_UNIVERSAL_PACKS_KEY = 'mpga_universal_game_packs';

/**
 * Type guard to check if an unknown object is a UniversalGamePack v2.0.0
 */
export const isUniversalGamePack = (data: unknown): data is UniversalGamePack => {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return Array.isArray(obj.factions);
};

/**
 * Validates a UniversalGamePack (v2.0.0) object, enforcing relational integrity.
 */
export const validateUniversalGamePack = (
  data: unknown
): { valid: boolean; errors: string[]; pack?: UniversalGamePack } => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, errors: ['Invalid JSON: Expected a root object.'] };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.name !== 'string' || !obj.name.trim()) {
    errors.push('Game pack must have a non-empty string "name".');
  }

  if (typeof obj.version !== 'string' || !obj.version.trim()) {
    errors.push('Game pack must specify a "version" string (e.g. "2.0.0").');
  }

  // 1. Factions validation
  if (!Array.isArray(obj.factions) || obj.factions.length === 0) {
    errors.push('Universal game pack must define at least one faction in "factions".');
  } else {
    obj.factions.forEach((f, idx) => {
      if (!f || typeof f !== 'object') {
        errors.push(`Faction at index ${idx} is not an object.`);
      } else {
        const fac = f as Record<string, unknown>;
        if (typeof fac.id !== 'string' || !fac.id.trim()) {
          errors.push(`Faction at index ${idx} is missing a string "id".`);
        }
        if (typeof fac.name !== 'string' || !fac.name.trim()) {
          errors.push(`Faction at index ${idx} is missing a string "name".`);
        }
        if (typeof fac.color !== 'string' || !fac.color.trim()) {
          errors.push(`Faction "${fac.id || idx}" is missing a "color".`);
        }
        if (!fac.winCondition || typeof fac.winCondition !== 'object') {
          errors.push(`Faction "${fac.id || idx}" must specify a "winCondition" object.`);
        }
      }
    });
  }

  // Known faction IDs for relational integrity
  const factionIds = new Set<string>(
    Array.isArray(obj.factions) ? obj.factions.map((f: any) => f?.id).filter(Boolean) : []
  );

  // 2. Abilities validation
  const abilityIds = new Set<string>();
  if (obj.abilities !== undefined) {
    if (!Array.isArray(obj.abilities)) {
      errors.push('"abilities" must be an array of Ability objects if provided.');
    } else {
      obj.abilities.forEach((a, idx) => {
        if (!a || typeof a !== 'object') {
          errors.push(`Ability at index ${idx} is not an object.`);
        } else {
          const ab = a as Record<string, unknown>;
          if (typeof ab.id !== 'string' || !ab.id.trim()) {
            errors.push(`Ability at index ${idx} is missing a string "id".`);
          } else {
            abilityIds.add(ab.id.trim());
          }
          if (!Array.isArray(ab.effects)) {
            errors.push(`Ability "${ab.id || idx}" must define an array of "effects".`);
          }
        }
      });
    }
  }

  // 3. Roles validation & Relational Integrity
  if (!Array.isArray(obj.roles) || obj.roles.length === 0) {
    errors.push('Universal game pack must include at least one character in "roles".');
  } else {
    obj.roles.forEach((r, idx) => {
      if (!r || typeof r !== 'object') {
        errors.push(`Role at index ${idx} is not an object.`);
      } else {
        const role = r as Record<string, unknown>;
        if (typeof role.id !== 'string' || !role.id.trim()) {
          errors.push(`Role at index ${idx} is missing a string "id".`);
        }
        if (typeof role.factionId !== 'string' || !role.factionId.trim()) {
          errors.push(`Role "${role.id || idx}" is missing "factionId".`);
        } else if (!factionIds.has(role.factionId.trim())) {
          errors.push(`Role "${role.id}" references unknown factionId "${role.factionId}".`);
        }

        // Relational check: abilities
        if (Array.isArray(role.abilities) && obj.abilities !== undefined) {
          role.abilities.forEach((abRef: any) => {
            const abId = typeof abRef === 'string' ? abRef : abRef?.abilityId;
            if (abId && !abilityIds.has(abId)) {
              errors.push(`Role "${role.id}" references undeclared abilityId "${abId}".`);
            }
          });
        }
      }
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const universalPack: UniversalGamePack = {
    $schema:
      typeof obj.$schema === 'string'
        ? obj.$schema
        : 'https://mpga.app/schemas/universal-game-pack.v2.json',
    version: '2.0.0',
    id: typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim() : `pack-${Date.now()}`,
    name: (obj.name as string).trim(),
    author: typeof obj.author === 'string' ? obj.author.trim() : undefined,
    description: typeof obj.description === 'string' ? obj.description.trim() : undefined,
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    theme: (obj.theme as any) || { primaryColor: '#ef4444' },
    pipeline: (obj.pipeline as any) || {
      enabledPhases: ['day', 'voting', 'midday', 'night'],
      speakingOrder: 'sequential_shift',
      dailySpeakerShift: 1,
      allowChallenges: true,
      challengesPerDay: 1,
      speakingDurationSec: 60,
      challengeDurationSec: 30,
      defenseDurationSec: 60,
      votingThresholdFormula: 'ceil',
      tieResolution: 'roulette',
      enableExitCards: true,
      penaltyWarningLimit: 2,
    },
    factions: obj.factions as any[],
    abilities: (obj.abilities as any[]) || [],
    roles: obj.roles as UniversalRoleDefinition[],
    exitCards: Array.isArray(obj.exitCards) ? (obj.exitCards as any[]) : undefined,
  };

  return { valid: true, errors: [], pack: universalPack };
};

/**
 * Converts a UniversalGamePack (v2.0.0) into a backward-compatible GamePack (v1.0.0)
 * so existing UI views and stores can consume it seamlessly.
 */
export const universalPackToLegacyPack = (uPack: UniversalGamePack): GamePack => {
  const mode: GameMode = {
    id: uPack.id,
    nameKey: uPack.name,
    minPlayers: 6,
    timeToTalk: uPack.pipeline?.speakingDurationSec || 45,
    borrowedTimeToTalk: 15,
    defenseTimeToTalk: uPack.pipeline?.defenseDurationSec || 60,
    challengesPerDay: uPack.pipeline?.challengesPerDay || 1,
    nextDayShift: uPack.pipeline?.dailySpeakerShift || 1,
    votingThresholdRounding: uPack.pipeline?.votingThresholdFormula || 'ceil',
  };

  const customRoles: Role[] = uPack.roles.map((r, idx) => ({
    id: r.id,
    nameKey: r.nameKey || r.name,
    name: r.name,
    descriptionKey: r.descriptionKey || r.description,
    description: r.description,
    sideId: r.factionId as any,
    modeIds: [uPack.id],
    limit: r.limit || 1,
    order: idx + 1,
    image: 'custom.svg',
    svgKey: r.icon || 'custom',
    abilityIds: r.abilities.map((a) => (typeof a === 'string' ? a : a.abilityId)),
    passiveAbilityIds: [],
    inquiryAppearsAs: r.inquiryAppearsAsFactionId as any,
  }));

  return {
    id: uPack.id,
    name: uPack.name,
    version: uPack.version,
    author: uPack.author,
    description: uPack.description,
    createdAt: uPack.createdAt,
    modes: [mode],
    customRoles,
    universal: uPack,
  };
};

/**
 * Validates whether an unknown parsed JSON object adheres to the GamePack or UniversalGamePack schema.
 */
export const validateGamePack = (data: unknown): GamePackValidationResult => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, errors: ['Invalid JSON: Expected a root object.'] };
  }

  // Check if this is a Universal Game Pack v2.0.0
  if (isUniversalGamePack(data)) {
    const univRes = validateUniversalGamePack(data);
    if (!univRes.valid || !univRes.pack) {
      return { valid: false, errors: univRes.errors };
    }
    const legacyCompatiblePack = universalPackToLegacyPack(univRes.pack);
    return { valid: true, errors: [], pack: legacyCompatiblePack, universalPack: univRes.pack };
  }

  const errors: string[] = [];
  const obj = data as Record<string, unknown>;

  if (typeof obj.name !== 'string' || !obj.name.trim()) {
    errors.push('Game pack must have a non-empty string "name".');
  }

  if (typeof obj.version !== 'string' || !obj.version.trim()) {
    errors.push('Game pack must specify a "version" string (e.g. "1.0.0").');
  }

  if (!Array.isArray(obj.modes) || obj.modes.length === 0) {
    errors.push('Game pack must include at least one valid GameMode in "modes".');
  } else {
    obj.modes.forEach((m, idx) => {
      if (!m || typeof m !== 'object') {
        errors.push(`Mode at index ${idx} is not an object.`);
      } else {
        const mode = m as Record<string, unknown>;
        if (typeof mode.id !== 'string' || !mode.id.trim()) {
          errors.push(`Mode at index ${idx} is missing a string "id".`);
        }
        if (typeof mode.timeToTalk !== 'number' || mode.timeToTalk <= 0) {
          errors.push(`Mode "${mode.id || idx}" must specify a positive number for "timeToTalk".`);
        }
      }
    });
  }

  if (obj.customRoles !== undefined) {
    if (!Array.isArray(obj.customRoles)) {
      errors.push('"customRoles" must be an array of Role objects if provided.');
    } else {
      obj.customRoles.forEach((r, idx) => {
        if (!r || typeof r !== 'object') {
          errors.push(`Custom role at index ${idx} is not an object.`);
        } else {
          const role = r as Record<string, unknown>;
          if (typeof role.id !== 'string' || !role.id.trim()) {
            errors.push(`Custom role at index ${idx} is missing a string "id".`);
          }
          if (typeof role.sideId !== 'string' || !role.sideId.trim()) {
            errors.push(`Custom role "${role.id || idx}" is missing "sideId".`);
          }
        }
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const pack: GamePack = {
    id: typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim() : `pack-${Date.now()}`,
    name: (obj.name as string).trim(),
    version: (obj.version as string).trim(),
    author: typeof obj.author === 'string' ? obj.author.trim() : undefined,
    description: typeof obj.description === 'string' ? obj.description.trim() : undefined,
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    modes: obj.modes as GameMode[],
    customRoles: Array.isArray(obj.customRoles) ? (obj.customRoles as Role[]) : [],
  };

  return { valid: true, errors: [], pack };
};

/**
 * Built-in native Universal Game Pack presets (v2.0.0).
 * Every scenario in MPGA is modeled declaratively through this schema.
 */
export const communityUniversalPresets: UniversalGamePack[] = [
  godfatherPreset,
  classicMafiaPreset,
  zodiacPreset,
  vendettaPreset,
  tehranProPreset,
  speedBlitzPreset,
  cybersecurityPreset,
];

/**
 * Built-in community rulepacks available for one-tap import,
 * projected into legacy GamePack format for backward-compatible views.
 */
export const communityPresets: GamePack[] =
  communityUniversalPresets.map(universalPackToLegacyPack);

export function useGamePackService() {
  const customModes = ref<GameMode[]>(loadEncoded<GameMode[]>(STORAGE_CUSTOM_MODES_KEY) || []);
  const customRoles = ref<Role[]>(loadEncoded<Role[]>(STORAGE_CUSTOM_ROLES_KEY) || []);
  const customPacks = ref<GamePack[]>(loadEncoded<GamePack[]>(STORAGE_CUSTOM_PACKS_KEY) || []);

  const refreshState = () => {
    customModes.value = loadEncoded<GameMode[]>(STORAGE_CUSTOM_MODES_KEY) || [];
    customRoles.value = loadEncoded<Role[]>(STORAGE_CUSTOM_ROLES_KEY) || [];
    customPacks.value = loadEncoded<GamePack[]>(STORAGE_CUSTOM_PACKS_KEY) || [];
  };

  /**
   * Retrieves all available game modes: built-in defaults merged with user custom modes.
   */
  const getAllModes = (): GameMode[] => {
    const modesMap = new Map<string, GameMode>();
    // Built-in modes first
    mockModes.forEach((m) => modesMap.set(m.id, { ...m }));
    // Custom modes override or extend
    customModes.value.forEach((m) => modesMap.set(m.id, { ...m }));
    return Array.from(modesMap.values());
  };

  /**
   * Retrieves all available roles: built-in defaults merged with custom created roles.
   */
  const getAllRoles = (): Role[] => {
    const rolesMap = new Map<string, Role>();
    mockRoles.forEach((r) => rolesMap.set(r.id, { ...r }));
    customRoles.value.forEach((r) => rolesMap.set(r.id, { ...r }));
    return Array.from(rolesMap.values());
  };

  /**
   * Saves or updates a custom game mode.
   */
  const saveCustomMode = (mode: GameMode): void => {
    const existingIdx = customModes.value.findIndex((m) => m.id === mode.id);
    if (existingIdx >= 0) {
      customModes.value[existingIdx] = { ...mode };
    } else {
      customModes.value.push({ ...mode });
    }
    saveEncoded(STORAGE_CUSTOM_MODES_KEY, customModes.value);
  };

  /**
   * Deletes a custom game mode.
   */
  const deleteCustomMode = (modeId: string): void => {
    customModes.value = customModes.value.filter((m) => m.id !== modeId);
    saveEncoded(STORAGE_CUSTOM_MODES_KEY, customModes.value);
  };

  /**
   * Saves or updates a custom character role.
   */
  const saveCustomRole = (role: Role): void => {
    const existingIdx = customRoles.value.findIndex((r) => r.id === role.id);
    if (existingIdx >= 0) {
      customRoles.value[existingIdx] = { ...role };
    } else {
      customRoles.value.push({ ...role });
    }
    saveEncoded(STORAGE_CUSTOM_ROLES_KEY, customRoles.value);
  };

  /**
   * Deletes a custom character role.
   */
  const deleteCustomRole = (roleId: string): void => {
    customRoles.value = customRoles.value.filter((r) => r.id !== roleId);
    saveEncoded(STORAGE_CUSTOM_ROLES_KEY, customRoles.value);
  };

  /**
   * Exports a GamePack or UniversalGamePack object as a downloadable .json file.
   */
  const exportPackAsJson = (pack: GamePack | UniversalGamePack): void => {
    const jsonStr = JSON.stringify(pack, null, 2);
    if (typeof window === 'undefined') return;

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mpga-pack-${pack.id || 'custom'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Validates and imports a GamePack from a raw JSON string.
   */
  const importPackFromJson = (jsonText: string): GamePackValidationResult => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return { valid: false, errors: ['Failed to parse JSON text. Please check file format.'] };
    }

    const validation = validateGamePack(parsed);
    if (!validation.valid || !validation.pack) {
      return validation;
    }

    const pack = validation.pack;

    // Persist pack
    const existingPackIdx = customPacks.value.findIndex((p) => p.id === pack.id);
    if (existingPackIdx >= 0) {
      customPacks.value[existingPackIdx] = pack;
    } else {
      customPacks.value.push(pack);
    }
    saveEncoded(STORAGE_CUSTOM_PACKS_KEY, customPacks.value);

    // Merge modes
    pack.modes.forEach((mode) => {
      saveCustomMode(mode);
    });

    // Merge roles
    if (pack.customRoles && pack.customRoles.length > 0) {
      pack.customRoles.forEach((role) => {
        saveCustomRole(role);
      });
    }

    refreshState();
    return { valid: true, errors: [], pack, universalPack: validation.universalPack };
  };

  /**
   * Resets all custom rules, modes, and character roles to factory defaults.
   */
  const resetCustomizations = (): void => {
    customModes.value = [];
    customRoles.value = [];
    customPacks.value = [];
    saveEncoded(STORAGE_CUSTOM_MODES_KEY, []);
    saveEncoded(STORAGE_CUSTOM_ROLES_KEY, []);
    saveEncoded(STORAGE_CUSTOM_PACKS_KEY, []);
  };

  return {
    customModes,
    customRoles,
    customPacks,
    communityPresets,
    communityUniversalPresets,
    getAllModes,
    getAllRoles,
    saveCustomMode,
    deleteCustomMode,
    saveCustomRole,
    deleteCustomRole,
    exportPackAsJson,
    importPackFromJson,
    resetCustomizations,
    refreshState,
  };
}
