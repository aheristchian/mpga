import { describe, it, expect } from 'vitest';
import { roleGuideData, nightResolutionSteps } from './roleGuideData';
import { roleSvgMap } from './roleIllustrations';
import enLocale from '../locales/en.json';
import faLocale from '../locales/fa.json';

describe('Role Guide Data Integrity', () => {
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
    expect(enLocale.roleGuide).toBeDefined();
    expect(faLocale.roleGuide).toBeDefined();
    expect(enLocale.roleGuide.title).toBeDefined();
    expect(faLocale.roleGuide.title).toBeDefined();
    expect(enLocale.roleGuide.tabs.roles).toBeDefined();
    expect(faLocale.roleGuide.tabs.roles).toBeDefined();
    expect(enLocale.roleGuide.tabs.flowchart).toBeDefined();
    expect(faLocale.roleGuide.tabs.flowchart).toBeDefined();
    expect(enLocale.roleGuide.tabs.rules).toBeDefined();
    expect(faLocale.roleGuide.tabs.rules).toBeDefined();
  });
});
