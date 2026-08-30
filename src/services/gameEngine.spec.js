import { describe, it, expect } from 'vitest';
import { resolveNight } from './gameEngine';

describe('Game Engine - resolveNight', () => {
  const createMockPlayer = (name, abilityId = null, passiveAbilityIds = [], sideId = 'town') => ({
    name,
    isDead: false,
    role: {
      name: 'MockRole',
      sideId,
      abilityIds: abilityId ? [abilityId] : [],
      passiveAbilityIds,
    },
  });

  it('should process a basic kill with no saves', () => {
    const players = [
      createMockPlayer('GodfatherPlayer', 'mafia-shot', [], 'mafia'),
      createMockPlayer('TowniePlayer'),
    ];
    const actionMap = {
      GodfatherPlayer: 'TowniePlayer',
    };

    const result = resolveNight(players, actionMap);

    expect(result.deaths).toContain('TowniePlayer');
    expect(result.log.some((l) => l.includes('[DEATH]'))).toBe(true);
  });

  it('should prevent death if Doctor treats the target', () => {
    const players = [
      createMockPlayer('GodfatherPlayer', 'mafia-shot', [], 'mafia'),
      createMockPlayer('DoctorPlayer', 'treat', [], 'town'),
      createMockPlayer('TargetPlayer'),
    ];
    const actionMap = {
      GodfatherPlayer: 'TargetPlayer',
      DoctorPlayer: 'TargetPlayer',
    };

    const result = resolveNight(players, actionMap);

    expect(result.deaths).not.toContain('TargetPlayer');
    expect(result.log.some((l) => l.includes('[SAVE]'))).toBe(true);
  });

  it('should prevent Doctor from saving if Matador blocks the Doctor', () => {
    const players = [
      createMockPlayer('GodfatherPlayer', 'mafia-shot', [], 'mafia'),
      createMockPlayer('MatadorPlayer', 'block', [], 'mafia'),
      createMockPlayer('DoctorPlayer', 'treat', [], 'town'),
      createMockPlayer('TargetPlayer'),
    ];
    const actionMap = {
      GodfatherPlayer: 'TargetPlayer',
      MatadorPlayer: 'DoctorPlayer', // Blocks doctor
      DoctorPlayer: 'TargetPlayer', // Tries to treat, but is blocked
    };

    const result = resolveNight(players, actionMap);

    expect(result.deaths).toContain('TargetPlayer'); // Target dies because doc was blocked
    expect(result.log.some((l) => l.includes('[BLOCKED] DoctorPlayer'))).toBe(true);
  });

  it('should eliminate Mafia when Vigilante shoots Mafia', () => {
    const players = [
      createMockPlayer('VigilantePlayer', 'vigillante-shot', [], 'town'),
      createMockPlayer('MafiaTarget', null, [], 'mafia'),
    ];
    const actionMap = {
      VigilantePlayer: 'MafiaTarget',
    };

    const result = resolveNight(players, actionMap);

    expect(result.deaths).toContain('MafiaTarget');
    expect(result.deaths).not.toContain('VigilantePlayer');
    expect(result.log.some((l) => l.includes('[VIGILANTE_HIT]'))).toBe(true);
  });

  it('should penalize and eliminate Vigilante (Leon) when shooting an innocent Town citizen', () => {
    const players = [
      createMockPlayer('VigilanteLeon', 'vigillante-shot', [], 'town'),
      createMockPlayer('InnocentCitizen', null, [], 'town'),
    ];
    const actionMap = {
      VigilanteLeon: 'InnocentCitizen',
    };

    const result = resolveNight(players, actionMap);

    // Leon dies from penalty, innocent citizen survives!
    expect(result.deaths).toContain('VigilanteLeon');
    expect(result.deaths).not.toContain('InnocentCitizen');
    expect(result.log.some((l) => l.includes('[LEON_PENALTY]'))).toBe(true);
  });

  it('should save a player if they have a passive shield', () => {
    const players = [
      createMockPlayer('GodfatherPlayer', 'mafia-shot', [], 'mafia'),
      createMockPlayer('ShieldedPlayer', null, ['shield'], 'town'),
    ];
    const actionMap = {
      GodfatherPlayer: 'ShieldedPlayer',
    };

    const result = resolveNight(players, actionMap);

    expect(result.deaths).not.toContain('ShieldedPlayer');
    expect(result.log.some((l) => l.includes('their shield saved them'))).toBe(true);
  });

  it('should correctly process investigations', () => {
    const players = [
      createMockPlayer('DetectivePlayer', 'investigate', [], 'town'),
      createMockPlayer('Suspect', null, [], 'mafia'),
    ];
    const actionMap = {
      DetectivePlayer: 'Suspect',
    };

    const result = resolveNight(players, actionMap);

    expect(
      result.log.some((l) => l.includes('Detective found out Suspect is on team: mafia'))
    ).toBe(true);
  });

  it('should support object action payloads with explicit actionId', () => {
    const players = [
      createMockPlayer('GodfatherPlayer', 'mafia-shot', [], 'mafia'),
      createMockPlayer('DoctorPlayer', 'treat', [], 'town'),
      createMockPlayer('TargetPlayer', null, [], 'town'),
    ];
    const actionMap = {
      GodfatherPlayer: { target: 'TargetPlayer', actionId: 'mafia-shot' },
      DoctorPlayer: { target: 'TargetPlayer', actionId: 'treat' },
    };

    const result = resolveNight(players, actionMap);

    expect(result.deaths).not.toContain('TargetPlayer');
    expect(result.log.some((l) => l.includes('[SAVE]'))).toBe(true);
  });

  it('should prioritize block (90) before doctor save (80) and shots (70)', () => {
    const players = [
      createMockPlayer('Matador', 'block', [], 'mafia'),
      createMockPlayer('Doctor', 'treat', [], 'town'),
      createMockPlayer('Godfather', 'mafia-shot', [], 'mafia'),
      createMockPlayer('Citizen', null, [], 'town'),
    ];

    const actionMap = {
      Matador: { target: 'Doctor', actionId: 'block' },
      Doctor: { target: 'Citizen', actionId: 'treat' },
      Godfather: { target: 'Citizen', actionId: 'mafia-shot' },
    };

    const result = resolveNight(players, actionMap);

    // Matador blocks Doctor -> Doctor fails to save -> Godfather kills Citizen
    expect(result.deaths).toContain('Citizen');
    expect(result.log.some((l) => l.includes('[BLOCKED] Doctor'))).toBe(true);
  });
});
