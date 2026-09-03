import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateGamePack,
  useGamePackService,
  STORAGE_CUSTOM_MODES_KEY,
  STORAGE_CUSTOM_ROLES_KEY,
} from './useGamePackService';
import type { GamePack, GameMode, Role } from '../types';

// Mock localStorage for node test runner
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: any) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i: number) => Object.keys(store)[i] || null,
  };
})();

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: storageMock,
    writable: true,
  });
}

describe('useGamePackService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('validateGamePack', () => {
    it('rejects null or non-object payloads', () => {
      const res1 = validateGamePack(null);
      expect(res1.valid).toBe(false);
      expect(res1.errors.length).toBeGreaterThan(0);

      const res2 = validateGamePack([]);
      expect(res2.valid).toBe(false);
    });

    it('rejects payloads missing required fields', () => {
      const res = validateGamePack({
        name: '',
        version: '',
      });
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('Game pack must have a non-empty string "name".');
      expect(res.errors).toContain('Game pack must specify a "version" string (e.g. "1.0.0").');
      expect(res.errors).toContain('Game pack must include at least one valid GameMode in "modes".');
    });

    it('validates a correct GamePack object and generates an ID if missing', () => {
      const sample = {
        name: 'Test Tournament',
        version: '1.0.0',
        modes: [
          {
            id: 'custom-pro',
            timeToTalk: 45,
            minPlayers: 6,
          },
        ],
      };
      const res = validateGamePack(sample);
      expect(res.valid).toBe(true);
      expect(res.pack).toBeDefined();
      expect(res.pack?.name).toBe('Test Tournament');
      expect(res.pack?.id).toMatch(/^pack-/);
    });
  });

  describe('custom mode and role persistence', () => {
    it('returns default mockModes and mockRoles when storage is empty', () => {
      const service = useGamePackService();
      const modes = service.getAllModes();
      expect(modes.length).toBeGreaterThanOrEqual(4);

      const roles = service.getAllRoles();
      expect(roles.length).toBeGreaterThanOrEqual(20);
    });

    it('saves and retrieves custom game mode', () => {
      const service = useGamePackService();
      const customMode: GameMode = {
        id: 'super-speed',
        name: 'Super Speed',
        minPlayers: 5,
        timeToTalk: 25,
        borrowedTimeToTalk: 15,
        defenseTimeToTalk: 30,
        challengesPerDay: 3,
        nextDayShift: 1,
        votingThresholdRounding: 'half',
      };

      service.saveCustomMode(customMode);
      const allModes = service.getAllModes();
      const found = allModes.find((m) => m.id === 'super-speed');
      expect(found).toBeDefined();
      expect(found?.timeToTalk).toBe(25);

      service.deleteCustomMode('super-speed');
      expect(service.getAllModes().find((m) => m.id === 'super-speed')).toBeUndefined();
    });

    it('saves and retrieves custom character role', () => {
      const service = useGamePackService();
      const customRole: Role = {
        id: 'hacker-overlord',
        name: 'Hacker Overlord',
        nameKey: 'roles.hackerOverlord.name',
        descriptionKey: 'roles.hackerOverlord.desc',
        tacticsKey: 'roles.hackerOverlord.tactics',
        badgeKey: 'roles.hackerOverlord.badge',
        sideId: 'third-party',
        modeIds: ['cyber-breach'],
        limit: 1,
        order: 99,
        image: 'overlord.svg',
        svgKey: 'overlord',
        abilityIds: ['kill'],
        passiveAbilityIds: [],
      };

      service.saveCustomRole(customRole);
      const allRoles = service.getAllRoles();
      const found = allRoles.find((r) => r.id === 'hacker-overlord');
      expect(found).toBeDefined();
      expect(found?.sideId).toBe('third-party');

      service.deleteCustomRole('hacker-overlord');
      expect(service.getAllRoles().find((r) => r.id === 'hacker-overlord')).toBeUndefined();
    });

    it('imports pack from valid JSON string and merges modes and roles', () => {
      const service = useGamePackService();
      const packJson = JSON.stringify({
        id: 'imported-championship',
        name: 'Championship 2026',
        version: '2.0.0',
        modes: [
          {
            id: 'championship-mode',
            name: 'Championship Mode',
            minPlayers: 8,
            timeToTalk: 50,
          },
        ],
        customRoles: [
          {
            id: 'grand-master',
            name: 'Grand Master',
            sideId: 'town',
            limit: 1,
            order: 1,
            abilityIds: [],
            passiveAbilityIds: [],
          },
        ],
      });

      const result = service.importPackFromJson(packJson);
      expect(result.valid).toBe(true);
      expect(result.pack?.name).toBe('Championship 2026');

      expect(service.getAllModes().some((m) => m.id === 'championship-mode')).toBe(true);
      expect(service.getAllRoles().some((r) => r.id === 'grand-master')).toBe(true);

      service.resetCustomizations();
      expect(service.getAllModes().some((m) => m.id === 'championship-mode')).toBe(false);
      expect(service.getAllRoles().some((r) => r.id === 'grand-master')).toBe(false);
    });
  });
});
