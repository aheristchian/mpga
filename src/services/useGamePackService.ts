import { ref } from 'vue';
import { mockModes } from '../data/modes';
import { mockRoles } from '../data/roles';
import { loadEncoded, saveEncoded } from '../utils/storage';
import type { GameMode, Role, GamePack, GamePackValidationResult } from '../types';

export const STORAGE_CUSTOM_MODES_KEY = 'mpga_custom_modes';
export const STORAGE_CUSTOM_ROLES_KEY = 'mpga_custom_roles';
export const STORAGE_CUSTOM_PACKS_KEY = 'mpga_custom_game_packs';

/**
 * Validates whether an unknown parsed JSON object adheres to the GamePack schema.
 */
export const validateGamePack = (data: unknown): GamePackValidationResult => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, errors: ['Invalid JSON: Expected a root object.'] };
  }

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
    id: (typeof obj.id === 'string' && obj.id.trim()) ? obj.id.trim() : `pack-${Date.now()}`,
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
 * Built-in community rulepacks available for one-tap import.
 */
export const communityPresets: GamePack[] = [
  {
    id: 'tehran-pro-league',
    name: 'Official Tehran Tournament 2026',
    version: '1.0.0',
    author: 'MPGA Pro League',
    description: 'Competitive ruleset with 45s speaking turns, 1 challenge per day, strict ceiling threshold, and balanced role limits.',
    createdAt: '2026-09-01T00:00:00.000Z',
    modes: [
      {
        id: 'tehran-pro',
        nameKey: 'modes.tehranPro.name',
        name: 'Tehran Pro League',
        minPlayers: 10,
        timeToTalk: 45,
        borrowedTimeToTalk: 25,
        defenseTimeToTalk: 60,
        challengesPerDay: 1,
        nextDayShift: 2,
        votingThresholdRounding: 'ceil',
        balanceRules: {
          warnIfSideExceedsRatio: {
            sideId: 'mafia',
            maxRatio: 0.33,
          },
        },
      },
    ],
    customRoles: [
      {
        id: 'judge',
        nameKey: 'roles.judge.name',
        name: 'Judge',
        descriptionKey: 'roles.judge.description',
        description: 'Independent arbiter who can absolve one accused defender from final execution once per tournament.',
        tacticsKey: 'roles.judge.tactics',
        badgeKey: 'roles.judge.badge',
        sideId: 'third-party',
        modeIds: ['tehran-pro'],
        limit: 1,
        order: 15,
        image: 'judge.svg',
        svgKey: 'judge',
        abilityIds: ['absolve'],
        passiveAbilityIds: [],
        inquiryAppearsAs: 'town',
      },
    ],
  },
  {
    id: 'speed-blitz-mafia',
    name: 'Speed Blitz (Fast 30s)',
    version: '1.0.0',
    author: 'MPGA Fast Match',
    description: 'High-octane quick rounds with 30s speaking turns and 2 daily challenges for rapid games.',
    createdAt: '2026-09-01T00:00:00.000Z',
    modes: [
      {
        id: 'speed-blitz',
        nameKey: 'modes.speedBlitz.name',
        name: 'Speed Blitz',
        minPlayers: 6,
        timeToTalk: 30,
        borrowedTimeToTalk: 15,
        defenseTimeToTalk: 45,
        challengesPerDay: 2,
        nextDayShift: 1,
        votingThresholdRounding: 'half',
        balanceRules: {
          warnIfSideExceedsRatio: {
            sideId: 'mafia',
            maxRatio: 0.34,
          },
        },
      },
    ],
    customRoles: [],
  },
];

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
   * Exports a GamePack object as a downloadable .json file.
   */
  const exportPackAsJson = (pack: GamePack): void => {
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
    return { valid: true, errors: [], pack };
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
