import { describe, it, expect } from 'vitest';
import {
  cybersecurityPreset,
  godfatherPreset,
  classicMafiaPreset,
  zodiacPreset,
  vendettaPreset,
  tehranProPreset,
  speedBlitzPreset,
} from '../data/presets';
import {
  validateUniversalGamePack,
  universalPackToLegacyPack,
  communityUniversalPresets,
} from './useGamePackService';
import { resolveNight } from './gameEngine';
import { evaluateGameStatus } from './useWinCondition';
import type { Player, ActionMap } from '../types';

describe('Universal Configurable Game Engine', () => {
  describe('Universal Pack Validation & Schema Integrity', () => {
    it('validates all built-in communityUniversalPresets with 100% integrity', () => {
      expect(communityUniversalPresets).toHaveLength(7);
      for (const preset of communityUniversalPresets) {
        const result = validateUniversalGamePack(preset);
        expect(result.valid, `Preset "${preset.name}" failed: ${result.errors.join(', ')}`).toBe(
          true
        );
        expect(result.errors).toHaveLength(0);
        expect(result.pack?.factions.length).toBeGreaterThanOrEqual(2);
        expect(result.pack?.roles.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('validates cybersecurityPreset with 100% integrity', () => {
      const result = validateUniversalGamePack(cybersecurityPreset);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.pack?.factions).toHaveLength(3);
      expect(result.pack?.abilities).toHaveLength(7);
      expect(result.pack?.roles).toHaveLength(7);
    });

    it('validates godfatherPreset with 100% integrity and independent alignment', () => {
      const result = validateUniversalGamePack(godfatherPreset);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.pack?.factions.some((f) => f.alignment === 'independent')).toBe(true);
    });

    it('validates zodiacPreset with 100% integrity and 3-way conflict', () => {
      const result = validateUniversalGamePack(zodiacPreset);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.pack?.factions.some((f) => f.id === 'zodiac')).toBe(true);
    });

    it('validates vendettaPreset with 100% integrity', () => {
      const result = validateUniversalGamePack(vendettaPreset);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.pack?.roles.some((r) => r.id === 'silencer')).toBe(true);
    });

    it('validates tehranProPreset with tournament pipeline settings', () => {
      const result = validateUniversalGamePack(tehranProPreset);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.pack?.pipeline.speakingDurationSec).toBe(45);
      expect(result.pack?.pipeline.challengesPerDay).toBe(1);
    });

    it('validates speedBlitzPreset with 30s speaking duration', () => {
      const result = validateUniversalGamePack(speedBlitzPreset);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.pack?.pipeline.speakingDurationSec).toBe(30);
    });

    it('rejects a pack with an invalid role faction reference', () => {
      const corruptedPack = JSON.parse(JSON.stringify(cybersecurityPreset));
      corruptedPack.roles[0].factionId = 'non-existent-faction-xyz';

      const result = validateUniversalGamePack(corruptedPack);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e: string) => e.includes('unknown factionId'))).toBe(true);
    });

    it('rejects a pack with an invalid ability reference on a role', () => {
      const corruptedPack = JSON.parse(JSON.stringify(cybersecurityPreset));
      corruptedPack.roles[0].abilities = ['non-existent-ability-xyz'];

      const result = validateUniversalGamePack(corruptedPack);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e: string) => e.includes('undeclared abilityId'))).toBe(true);
    });

    it('converts universal pack into legacy backward-compatible pack structure', () => {
      const legacyPack = universalPackToLegacyPack(cybersecurityPreset);
      expect(legacyPack.id).toBe(cybersecurityPreset.id);
      expect(legacyPack.name).toBe(cybersecurityPreset.name);
      expect(legacyPack.modes.length).toBeGreaterThan(0);
      expect(legacyPack.customRoles?.length).toBe(cybersecurityPreset.roles.length);
    });
  });

  describe('Dynamic Multi-Faction Win Condition Evaluation', () => {
    const factions = cybersecurityPreset.factions;

    it('evaluates Blue Team elimination victory when Red Team and Rogue AI are wiped out', () => {
      const players: Player[] = [
        {
          name: 'Alice',
          isDead: false,
          role: { id: 'sec-analyst', name: 'SOC Analyst', sideId: 'blue_team' },
          customFactionId: 'blue_team',
        },
        {
          name: 'Bob',
          isDead: false,
          role: { id: 'incident-commander', name: 'Incident Commander', sideId: 'blue_team' },
          customFactionId: 'blue_team',
        },
        {
          name: 'Charlie',
          isDead: true,
          role: { id: 'apt-infiltrator', name: 'APT Infiltrator', sideId: 'red_team' },
          customFactionId: 'red_team',
        },
        {
          name: 'David',
          isDead: true,
          role: { id: 'ransomware-operator', name: 'Ransomware Operator', sideId: 'red_team' },
          customFactionId: 'red_team',
        },
        {
          name: 'Eve',
          isDead: true,
          role: { id: 'rogue-ai', name: 'Rogue AI', sideId: 'rogue_ai' },
          customFactionId: 'rogue_ai',
        },
      ];

      const result = evaluateGameStatus(players, [], null, factions);
      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe('blue_team');
      expect(result.winningFaction?.id).toBe('blue_team');
    });

    it('evaluates Red Team parity victory when alive count meets parity ratio', () => {
      const players: Player[] = [
        {
          name: 'Alice',
          isDead: false,
          role: { id: 'sec-analyst', name: 'SOC Analyst', sideId: 'blue_team' },
          customFactionId: 'blue_team',
        },
        {
          name: 'Charlie',
          isDead: false,
          role: { id: 'apt-infiltrator', name: 'APT Infiltrator', sideId: 'red_team' },
          customFactionId: 'red_team',
        },
        {
          name: 'David',
          isDead: true,
          role: { id: 'ransomware-operator', name: 'Ransomware Operator', sideId: 'red_team' },
          customFactionId: 'red_team',
        },
        {
          name: 'Eve',
          isDead: true,
          role: { id: 'rogue-ai', name: 'Rogue AI', sideId: 'rogue_ai' },
          customFactionId: 'rogue_ai',
        },
      ];

      // Total alive: 2 (1 Blue Team, 1 Red Team -> Red Team ratio is 1/2 = 50% >= 0.5)
      const result = evaluateGameStatus(players, [], null, factions);
      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe('red_team');
      expect(result.winningFaction?.id).toBe('red_team');
    });

    it('evaluates Rogue AI solo survivor victory when sole remaining alive player', () => {
      const players: Player[] = [
        {
          name: 'Alice',
          isDead: true,
          role: { id: 'sec-analyst', name: 'SOC Analyst', sideId: 'blue_team' },
          customFactionId: 'blue_team',
        },
        {
          name: 'Charlie',
          isDead: true,
          role: { id: 'apt-infiltrator', name: 'APT Infiltrator', sideId: 'red_team' },
          customFactionId: 'red_team',
        },
        {
          name: 'Eve',
          isDead: false,
          role: { id: 'rogue-ai', name: 'Rogue AI', sideId: 'rogue_ai' },
          customFactionId: 'rogue_ai',
        },
      ];

      const result = evaluateGameStatus(players, [], null, factions);
      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe('rogue_ai');
      expect(result.winningFaction?.id).toBe('rogue_ai');
    });
  });

  describe('Finite vs Unlimited Ability Charges & Quota Mechanics', () => {
    it('decrements finite shield charges on lethal hit and breaks when reaching 0', () => {
      const defender: Player = {
        name: 'Defender',
        isDead: false,
        role: { id: 'soc-analyst', name: 'SOC Analyst', sideId: 'blue-team' },
        abilityCharges: { firewall: 1 }, // 1 charge remaining
      };

      const attacker: Player = {
        name: 'Attacker',
        isDead: false,
        role: { id: 'apt-infiltrator', name: 'APT Infiltrator', sideId: 'red-team' },
      };

      // Attacker executes lethal hit on defender
      const actionMap: ActionMap = {
        [attacker.name]: {
          target: defender.name,
          abilityId: 'zero-day-exploit',
        },
      };

      const result = resolveNight([defender, attacker], actionMap, cybersecurityPreset.abilities);

      // Shield absorbed the hit: defender lives, but shield broke!
      expect(result.deaths).toEqual([]);
      expect(result.brokenShields).toContain(defender.name);
      expect(result.updatedAbilityCharges[defender.name]?.firewall).toBe(0);
    });

    it('unlimited shield absorbs hits indefinitely without breaking', () => {
      const defender: Player = {
        name: 'Ironclad',
        isDead: false,
        role: { id: 'firewall-sentry', name: 'Firewall Sentry', sideId: 'blue-team' },
        abilityCharges: { firewall: 'unlimited' },
      };

      const attacker: Player = {
        name: 'Attacker',
        isDead: false,
        role: { id: 'apt-infiltrator', name: 'APT Infiltrator', sideId: 'red-team' },
      };

      const actionMap: ActionMap = {
        [attacker.name]: {
          target: defender.name,
          abilityId: 'zero-day-exploit',
        },
      };

      const result = resolveNight([defender, attacker], actionMap, cybersecurityPreset.abilities);

      expect(result.deaths).toEqual([]);
      expect(result.brokenShields).not.toContain(defender.name);
      expect(result.updatedAbilityCharges[defender.name]?.firewall).toBe('unlimited');
    });
  });
});
