import { describe, it, expect } from 'vitest';
import { resolveNight } from './gameEngine';
import type { Player } from '../types';

describe('Game Engine - resolveNight', () => {
  const createMockPlayer = (
    name: string,
    abilityId: string | null = null,
    passiveAbilityIds: string[] = [],
    sideId: string = 'town'
  ): Player => ({
    name,
    isDead: false,
    role: {
      id: name.toLowerCase(),
      name: 'MockRole',
      sideId,
      abilityIds: abilityId ? [abilityId] : [],
      passiveAbilityIds,
    },
  });

  it('should process a basic kill with no saves', () => {
    const players: Player[] = [
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
    const players: Player[] = [
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
    const players: Player[] = [
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
    const players: Player[] = [
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
    const players: Player[] = [
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

  it('should save a player if they have a passive shield and mark the shield broken', () => {
    const players: Player[] = [
      createMockPlayer('GodfatherPlayer', 'mafia-shot', [], 'mafia'),
      createMockPlayer('ShieldedPlayer', null, ['shield'], 'town'),
    ];
    const actionMap = {
      GodfatherPlayer: 'ShieldedPlayer',
    };

    const result = resolveNight(players, actionMap);

    expect(result.deaths).not.toContain('ShieldedPlayer');
    expect(result.brokenShields).toContain('ShieldedPlayer');
    expect(result.log.some((l) => l.includes('their shield saved them'))).toBe(true);
    expect(result.log.some((l) => l.includes('[SHIELD_BROKEN]'))).toBe(true);

    // If shot again with broken shield, player dies
    const playersRound2: Player[] = [
      createMockPlayer('GodfatherPlayer', 'mafia-shot', [], 'mafia'),
      {
        ...createMockPlayer('ShieldedPlayer', null, ['shield'], 'town'),
        isShieldBroken: true,
      },
    ];
    const result2 = resolveNight(playersRound2, actionMap);
    expect(result2.deaths).toContain('ShieldedPlayer');
  });

  it('should not allow Doctor to save Leon from guilt penalty death', () => {
    const players: Player[] = [
      createMockPlayer('VigilanteLeon', 'vigillante-shot', [], 'town'),
      createMockPlayer('InnocentCitizen', null, [], 'town'),
      createMockPlayer('DoctorPlayer', 'treat', [], 'town'),
    ];
    const actionMap = {
      VigilanteLeon: 'InnocentCitizen',
      DoctorPlayer: 'VigilanteLeon', // Doctor tries to save Leon
    };

    const result = resolveNight(players, actionMap);

    // Leon must still die despite Doctor treatment
    expect(result.deaths).toContain('VigilanteLeon');
    expect(result.log.some((l) => l.includes('[LEON_PENALTY]'))).toBe(true);
  });

  it('should recruit innocent town citizen into Mafia via Saul Goodman buy ability', () => {
    const players: Player[] = [
      createMockPlayer('SaulGoodman', 'buy', [], 'mafia'),
      createMockPlayer('TargetCitizen', null, [], 'town'),
    ];
    const actionMap = {
      SaulGoodman: { target: 'TargetCitizen', actionId: 'buy' },
    };

    const result = resolveNight(players, actionMap);

    expect(result.converted).toHaveLength(1);
    expect(result.converted[0].playerName).toBe('TargetCitizen');
    expect(result.converted[0].newSideId).toBe('mafia');
    expect(result.log.some((l) => l.includes('[BRIBE]'))).toBe(true);
  });

  it('should correctly process investigations', () => {
    const players: Player[] = [
      createMockPlayer('DetectivePlayer', 'investigate', [], 'town'),
      createMockPlayer('Suspect', null, [], 'mafia'),
      {
        name: 'GodfatherBoss',
        isDead: false,
        role: {
          id: 'godfather',
          name: 'Godfather',
          sideId: 'mafia',
          abilityIds: ['mafia-shot'],
          passiveAbilityIds: ['shield'],
        },
      },
    ];

    // 1. Investigating regular Mafia member
    const result1 = resolveNight(players, { DetectivePlayer: 'Suspect' });
    expect(result1.log.some((l) => l.includes('Guilty (Mafia)'))).toBe(true);

    // 2. Investigating Godfather returns Innocent / Clean
    const result2 = resolveNight(players, { DetectivePlayer: 'GodfatherBoss' });
    expect(result2.log.some((l) => l.includes('Innocent/Clean (Town)'))).toBe(true);
  });

  it('should support object action payloads with explicit actionId', () => {
    const players: Player[] = [
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
    const players: Player[] = [
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

  it('should silence a player when Silencer uses silence', () => {
    const players: Player[] = [
      createMockPlayer('SilencerPlayer', 'silence', [], 'mafia'),
      createMockPlayer('ChattyTownie', null, [], 'town'),
    ];

    const actionMap = {
      SilencerPlayer: { target: 'ChattyTownie', actionId: 'silence' },
    };

    const result = resolveNight(players, actionMap);

    expect(result.silenced).toContain('ChattyTownie');
    expect(result.log.some((l) => l.includes('[SILENCE]'))).toBe(true);
  });

  it('should remove silence when Priest absolves the silenced player', () => {
    const players: Player[] = [
      createMockPlayer('SilencerPlayer', 'silence', [], 'mafia'),
      createMockPlayer('PriestPlayer', 'absolve', [], 'town'),
      createMockPlayer('TargetTownie', null, [], 'town'),
    ];

    const actionMap = {
      SilencerPlayer: { target: 'TargetTownie', actionId: 'silence' },
      PriestPlayer: { target: 'TargetTownie', actionId: 'absolve' },
    };

    const result = resolveNight(players, actionMap);

    // Priest lifts the silence
    expect(result.silenced).not.toContain('TargetTownie');
    expect(result.log.some((l) => l.includes('[ABSOLVE]'))).toBe(true);
  });

  it('should protect a player from fatal attacks when Bodyguard guards them', () => {
    const players: Player[] = [
      createMockPlayer('GodfatherPlayer', 'mafia-shot', [], 'mafia'),
      createMockPlayer('BodyguardPlayer', 'protect', ['shield'], 'town'),
      createMockPlayer('TargetTownie', null, [], 'town'),
    ];

    const actionMap = {
      GodfatherPlayer: { target: 'TargetTownie', actionId: 'mafia-shot' },
      BodyguardPlayer: { target: 'TargetTownie', actionId: 'protect' },
    };

    const result = resolveNight(players, actionMap);

    expect(result.deaths).not.toContain('TargetTownie');
    expect(result.log.some((l) => l.includes('[PROTECT]'))).toBe(true);
    expect(result.log.some((l) => l.includes('[SAVE]'))).toBe(true);
  });

  it('should eliminate a player when Zodiac delivers a lethal shot', () => {
    const players: Player[] = [
      createMockPlayer('ZodiacKiller', 'zodiac-shot', ['shield', 'clean-inquiry'], 'third-party'),
      createMockPlayer('VictimPlayer', null, [], 'town'),
    ];

    const actionMap = {
      ZodiacKiller: { target: 'VictimPlayer', actionId: 'zodiac-shot' },
    };

    const result = resolveNight(players, actionMap);

    expect(result.deaths).toContain('VictimPlayer');
    expect(result.log.some((l) => l.includes('[ZODIAC_SHOT]'))).toBe(true);
    expect(result.log.some((l) => l.includes('[DEATH]'))).toBe(true);
  });

  it('should return innocent inquiry when Detective investigates Zodiac due to clean-inquiry passive', () => {
    const players: Player[] = [
      createMockPlayer('DetectivePlayer', 'investigate', [], 'town'),
      {
        name: 'ZodiacPlayer',
        isDead: false,
        role: {
          id: 'zodiac',
          name: 'Zodiac',
          sideId: 'third-party',
          abilityIds: ['zodiac-shot'],
          passiveAbilityIds: ['shield', 'clean-inquiry'],
        },
      },
    ];

    const result = resolveNight(players, { DetectivePlayer: 'ZodiacPlayer' });
    expect(result.log.some((l) => l.includes('Innocent/Clean (Town)'))).toBe(true);
  });
});
