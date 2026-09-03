import { describe, it, expect } from 'vitest';
import {
  roleGuideData,
  nightResolutionSteps,
  generateRoleGuideData,
  generateNightResolutionSteps,
} from './roleGuideData';
import { mockRoles } from './roles';
import { mockAbilities } from './abilities';
import { roleSvgMap } from './roleIllustrations';
import { useGameService } from '../services/useGameService';
import enLocale from '../locales/en.json';
import faLocale from '../locales/fa.json';

describe('Role Guide Data Integrity & Declarative Engine', () => {
  it('should contain all essential tournament roles', () => {
    const roleIds = roleGuideData.map((r) => r.id);
    expect(roleIds).toContain('godfather');
    expect(roleIds).toContain('matador');
    expect(roleIds).toContain('saul-goodman');
    expect(roleIds).toContain('mafia');
    expect(roleIds).toContain('doctor');
    expect(roleIds).toContain('detective');
    expect(roleIds).toContain('leon');
    expect(roleIds).toContain('constantine');
    expect(roleIds).toContain('nostradamus');
    expect(roleIds).toContain('citizen');
    expect(roleIds).toContain('zero-day');
    expect(roleIds).toContain('firewall-server');
    expect(roleIds).toContain('rogue-ai');
  });

  it('should dynamically generate guide data from mockRoles and mockAbilities', () => {
    const generated = generateRoleGuideData(mockRoles);
    expect(generated.length).toBe(mockRoles.length);
    const doc = generated.find((r) => r.id === 'doctor');
    expect(doc).toBeDefined();
    expect(doc?.abilities.map((a) => a.id)).toContain('treat');
  });

  it('should have matching SVG vector illustrations for every role', () => {
    roleGuideData.forEach((role) => {
      expect(roleSvgMap[role.svgKey]).toBeDefined();
      expect(roleSvgMap[role.svgKey]).toContain('<svg');
    });
  });

  it('should have valid abilities and priority definitions for every role', () => {
    roleGuideData.forEach((role) => {
      expect(role.abilities.length).toBeGreaterThan(0);
      role.abilities.forEach((ability) => {
        expect(ability.id).toBeDefined();
        expect(ability.priority).toBeGreaterThanOrEqual(0);
        expect(ability.priority).toBeLessThanOrEqual(99);
        expect(ability.icon).toBeDefined();
      });
    });
  });

  it('should have valid night resolution steps sorted sequentially with descending priorities', () => {
    expect(nightResolutionSteps.length).toBeGreaterThanOrEqual(5);

    for (let i = 0; i < nightResolutionSteps.length - 1; i++) {
      const current = nightResolutionSteps[i];
      const next = nightResolutionSteps[i + 1];
      expect(current.step).toBe(i + 1);
      expect(current.priority).toBeGreaterThanOrEqual(next.priority);
    }
  });

  it('should verify that all translation keys exist in both en.json and fa.json', () => {
    expect((enLocale as any).roleGuide).toBeDefined();
    expect((faLocale as any).roleGuide).toBeDefined();
    expect((enLocale as any).roleGuide.title).toBeDefined();
    expect((faLocale as any).roleGuide.title).toBeDefined();
    expect((enLocale as any).roleGuide.tabs.roles).toBeDefined();
    expect((faLocale as any).roleGuide.tabs.roles).toBeDefined();
    expect((enLocale as any).roleGuide.tabs.flowchart).toBeDefined();
    expect((faLocale as any).roleGuide.tabs.flowchart).toBeDefined();
    expect((enLocale as any).roleGuide.tabs.rules).toBeDefined();
    expect((faLocale as any).roleGuide.tabs.rules).toBeDefined();
  });

  describe('useGameService Declarative Helpers', () => {
    const gameService = useGameService();

    it('should hydrate role with side and full ability definitions', () => {
      const hydrated = gameService.getFullRoleDetails('doctor');
      expect(hydrated).toBeDefined();
      expect(hydrated?.side?.id).toBe('town');
      expect(hydrated?.abilities.length).toBeGreaterThan(0);
      expect(hydrated?.abilities[0].id).toBe('treat');
      expect(hydrated?.abilities[0].priority).toBe(80);
    });

    it('should derive available night actions with standard pass option', () => {
      const doctorRole = mockRoles.find((r) => r.id === 'doctor');
      const actions = gameService.getAvailableNightActions(doctorRole);
      expect(actions.length).toBe(3); // treat, treat-self, pass
      expect(actions.map((a) => a.id)).toEqual(['treat', 'treat-self', 'pass']);
    });

    it('should provide pass-only for roles without active night abilities like citizen', () => {
      const citizenRole = mockRoles.find((r) => r.id === 'citizen');
      const actions = gameService.getAvailableNightActions(citizenRole);
      expect(actions.length).toBe(1);
      expect(actions[0].id).toBe('pass');
    });
  });
});
