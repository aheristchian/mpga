import { describe, it, expect } from 'vitest';
import { resolveNight, getActiveMafiaShooter } from './gameEngine';
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

  describe('Cyber Breach Scenarios', () => {
    it('should block night abilities when Botnet Op uses ddos-flood', () => {
      const players: Player[] = [
        createMockPlayer('BotnetPlayer', 'ddos-flood', [], 'mafia'),
        createMockPlayer('FirewallPlayer', 'patch-sandbox', ['shield'], 'town'),
        createMockPlayer('ZeroDayPlayer', 'zero-day-exploit', ['shield', 'clean-inquiry'], 'mafia'),
        createMockPlayer('TargetServer', null, [], 'town'),
      ];

      const actionMap = {
        BotnetPlayer: { target: 'FirewallPlayer', actionId: 'ddos-flood' },
        FirewallPlayer: { target: 'TargetServer', actionId: 'patch-sandbox' },
        ZeroDayPlayer: { target: 'TargetServer', actionId: 'zero-day-exploit' },
      };

      const result = resolveNight(players, actionMap);

      expect(result.deaths).toContain('TargetServer');
      expect(result.log.some((l) => l.includes('[DDOS_FLOOD] BotnetPlayer'))).toBe(true);
      expect(result.log.some((l) => l.includes('[BLOCKED] FirewallPlayer'))).toBe(true);
    });

    it('should protect target from zero-day exploit when Firewall Server uses patch-sandbox', () => {
      const players: Player[] = [
        createMockPlayer('FirewallPlayer', 'patch-sandbox', ['shield'], 'town'),
        createMockPlayer('ZeroDayPlayer', 'zero-day-exploit', ['shield', 'clean-inquiry'], 'mafia'),
        createMockPlayer('TargetServer', null, [], 'town'),
      ];

      const actionMap = {
        FirewallPlayer: { target: 'TargetServer', actionId: 'patch-sandbox' },
        ZeroDayPlayer: { target: 'TargetServer', actionId: 'zero-day-exploit' },
      };

      const result = resolveNight(players, actionMap);

      expect(result.deaths).not.toContain('TargetServer');
      expect(result.log.some((l) => l.includes('[PATCH_SANDBOX]'))).toBe(true);
      expect(result.log.some((l) => l.includes('[SAVE]'))).toBe(true);
    });

    it('should eliminate hostile Black-Hat when White-Hat executes counter-hack', () => {
      const players: Player[] = [
        createMockPlayer('WhiteHatPlayer', 'counter-hack', [], 'town'),
        createMockPlayer('BlackHatPlayer', 'zero-day-exploit', [], 'mafia'),
      ];

      const actionMap = {
        WhiteHatPlayer: { target: 'BlackHatPlayer', actionId: 'counter-hack' },
      };

      const result = resolveNight(players, actionMap);

      expect(result.deaths).toContain('BlackHatPlayer');
      expect(result.deaths).not.toContain('WhiteHatPlayer');
      expect(result.log.some((l) => l.includes('[COUNTER_HACK_HIT]'))).toBe(true);
    });

    it('should eliminate White-Hat with guilt penalty if counter-hack hits innocent system user', () => {
      const players: Player[] = [
        createMockPlayer('WhiteHatPlayer', 'counter-hack', [], 'town'),
        createMockPlayer('SysUserPlayer', null, ['deduction'], 'town'),
      ];

      const actionMap = {
        WhiteHatPlayer: { target: 'SysUserPlayer', actionId: 'counter-hack' },
      };

      const result = resolveNight(players, actionMap);

      expect(result.deaths).toContain('WhiteHatPlayer');
      expect(result.deaths).not.toContain('SysUserPlayer');
      expect(result.log.some((l) => l.includes('[COUNTER_HACK_PENALTY]'))).toBe(true);
    });

    it('should silence target with credential-lock, and restore credentials with auth-restore', () => {
      const playersLocked: Player[] = [
        createMockPlayer('PhisherPlayer', 'credential-lock', [], 'mafia'),
        createMockPlayer('SysUserPlayer', null, [], 'town'),
      ];

      const resultLocked = resolveNight(playersLocked, {
        PhisherPlayer: { target: 'SysUserPlayer', actionId: 'credential-lock' },
      });

      expect(resultLocked.silenced).toContain('SysUserPlayer');
      expect(resultLocked.log.some((l) => l.includes('[CREDENTIAL_LOCK]'))).toBe(true);

      // Now with DevOps Admin restoring credentials
      const playersRestored: Player[] = [
        createMockPlayer('PhisherPlayer', 'credential-lock', [], 'mafia'),
        createMockPlayer('DevOpsPlayer', 'auth-restore', [], 'town'),
        createMockPlayer('SysUserPlayer', null, [], 'town'),
      ];

      const resultRestored = resolveNight(playersRestored, {
        PhisherPlayer: { target: 'SysUserPlayer', actionId: 'credential-lock' },
        DevOpsPlayer: { target: 'SysUserPlayer', actionId: 'auth-restore' },
      });

      expect(resultRestored.silenced).not.toContain('SysUserPlayer');
      expect(resultRestored.log.some((l) => l.includes('[AUTH_RESTORE]'))).toBe(true);
    });

    it('should eliminate target when Rogue AI executes malware-purge', () => {
      const players: Player[] = [
        createMockPlayer(
          'RogueAiPlayer',
          'malware-purge',
          ['shield', 'clean-inquiry'],
          'third-party'
        ),
        createMockPlayer('VictimNode', null, [], 'town'),
      ];

      const actionMap = {
        RogueAiPlayer: { target: 'VictimNode', actionId: 'malware-purge' },
      };

      const result = resolveNight(players, actionMap);

      expect(result.deaths).toContain('VictimNode');
      expect(result.log.some((l) => l.includes('[MALWARE_PURGE]'))).toBe(true);
    });

    it('should perform port-scan correctly identifying Black-Hat as guilty, but Zero-Day and Rogue AI as clean', () => {
      const players: Player[] = [
        createMockPlayer('SecAnalystPlayer', 'port-scan', [], 'town'),
        createMockPlayer('BlackHatPlayer', 'zero-day-exploit', [], 'mafia'),
        {
          name: 'ZeroDayPlayer',
          isDead: false,
          role: {
            id: 'zero-day',
            name: 'Zero-Day',
            sideId: 'mafia',
            abilityIds: ['zero-day-exploit'],
            passiveAbilityIds: ['shield', 'clean-inquiry'],
            inquiryAppearsAs: 'town',
          },
        },
        {
          name: 'RogueAiPlayer',
          isDead: false,
          role: {
            id: 'rogue-ai',
            name: 'Rogue AI',
            sideId: 'third-party',
            abilityIds: ['malware-purge'],
            passiveAbilityIds: ['shield', 'clean-inquiry'],
            inquiryAppearsAs: 'town',
          },
        },
      ];

      const scanBlackHat = resolveNight(players, {
        SecAnalystPlayer: { target: 'BlackHatPlayer', actionId: 'port-scan' },
      });
      expect(scanBlackHat.log.some((l) => l.includes('Guilty (Mafia/Black-Hat)'))).toBe(true);

      const scanZeroDay = resolveNight(players, {
        SecAnalystPlayer: { target: 'ZeroDayPlayer', actionId: 'port-scan' },
      });
      expect(scanZeroDay.log.some((l) => l.includes('Innocent/Clean (Town)'))).toBe(true);

      const scanRogueAi = resolveNight(players, {
        SecAnalystPlayer: { target: 'RogueAiPlayer', actionId: 'port-scan' },
      });
      expect(scanRogueAi.log.some((l) => l.includes('Innocent/Clean (Town)'))).toBe(true);
    });
  });

  describe('Universal Primitive Effects & Dynamic Quotas', () => {
    it('should resolve custom abilities defined purely with primitive effects', () => {
      const customLaserHit = {
        id: 'laser-strike',
        name: 'Orbital Laser',
        description: 'Fires high power beam',
        icon: '🛰️',
        priority: 70,
        executionPhase: 'night' as const,
        isPassive: false,
        targeting: {
          selfAllowed: false,
          targetCount: { min: 1, max: 1 },
          livingState: 'alive' as const,
          factionScope: 'all' as const,
        },
        quota: { totalCharges: 'unlimited' as const },
        effects: [{ type: 'lethal_hit' as const }],
      };

      const customEnergyShield = {
        id: 'force-field',
        name: 'Force Field',
        description: 'Protects target node',
        icon: '⚡',
        priority: 80,
        executionPhase: 'night' as const,
        isPassive: false,
        targeting: {
          selfAllowed: true,
          targetCount: { min: 1, max: 1 },
          livingState: 'alive' as const,
          factionScope: 'all' as const,
        },
        quota: { totalCharges: 'unlimited' as const },
        effects: [{ type: 'protect' as const }],
      };

      const players: Player[] = [
        {
          name: 'Attacker',
          isDead: false,
          role: {
            id: 'attacker',
            name: 'Attacker',
            sideId: 'red-team',
            abilityIds: ['laser-strike'],
            passiveAbilityIds: [],
          },
        },
        {
          name: 'Defender',
          isDead: false,
          role: {
            id: 'defender',
            name: 'Defender',
            sideId: 'blue-team',
            abilityIds: ['force-field'],
            passiveAbilityIds: [],
          },
        },
        {
          name: 'TargetPlayer',
          isDead: false,
          role: {
            id: 'worker',
            name: 'Worker',
            sideId: 'blue-team',
            abilityIds: [],
            passiveAbilityIds: [],
          },
        },
      ];

      // 1. Without shield -> Target dies
      const resultNoShield = resolveNight(
        players,
        { Attacker: { target: 'TargetPlayer', abilityId: 'laser-strike' } },
        [customLaserHit, customEnergyShield]
      );
      expect(resultNoShield.deaths).toContain('TargetPlayer');
      expect(resultNoShield.log.some((l) => l.includes('[LETHAL_HIT]'))).toBe(true);

      // 2. With force-field -> Target saved
      const resultWithShield = resolveNight(
        players,
        {
          Attacker: { target: 'TargetPlayer', abilityId: 'laser-strike' },
          Defender: { target: 'TargetPlayer', abilityId: 'force-field' },
        },
        [customLaserHit, customEnergyShield]
      );
      expect(resultWithShield.deaths).not.toContain('TargetPlayer');
      expect(resultWithShield.log.some((l) => l.includes('[SAVE]'))).toBe(true);
    });

    it('should correctly decrement finite shield quota charges across successive attacks', () => {
      const customHit = {
        id: 'kinetic-slug',
        name: 'Kinetic Slug',
        description: 'Hits target',
        icon: '💥',
        priority: 70,
        executionPhase: 'night' as const,
        isPassive: false,
        targeting: {
          selfAllowed: false,
          targetCount: { min: 1, max: 1 },
          livingState: 'alive' as const,
          factionScope: 'all' as const,
        },
        quota: { totalCharges: 'unlimited' as const },
        effects: [{ type: 'lethal_hit' as const }],
      };

      const shieldedPlayer: Player = {
        name: 'Cyborg',
        isDead: false,
        abilityCharges: { shield: 2 }, // 2 shield charges
        role: {
          id: 'cyborg',
          name: 'Cyborg',
          sideId: 'blue-team',
          abilityIds: [],
          passiveAbilityIds: [],
        },
      };

      const attacker: Player = {
        name: 'Shooter',
        isDead: false,
        role: {
          id: 'shooter',
          name: 'Shooter',
          sideId: 'red-team',
          abilityIds: ['kinetic-slug'],
          passiveAbilityIds: [],
        },
      };

      // Hit 1: 2 charges -> 1 charge remaining, survives
      const res1 = resolveNight(
        [attacker, shieldedPlayer],
        { Shooter: { target: 'Cyborg', abilityId: 'kinetic-slug' } },
        [customHit]
      );
      expect(res1.deaths).not.toContain('Cyborg');
      expect(res1.updatedAbilityCharges?.['Cyborg']?.['shield']).toBe(1);
      expect(res1.brokenShields).not.toContain('Cyborg');

      // Update charges for Hit 2
      shieldedPlayer.abilityCharges = res1.updatedAbilityCharges?.['Cyborg'];

      // Hit 2: 1 charge -> 0 charges remaining, survives, shield breaks
      const res2 = resolveNight(
        [attacker, shieldedPlayer],
        { Shooter: { target: 'Cyborg', abilityId: 'kinetic-slug' } },
        [customHit]
      );
      expect(res2.deaths).not.toContain('Cyborg');
      expect(res2.updatedAbilityCharges?.['Cyborg']?.['shield']).toBe(0);
      expect(res2.brokenShields).toContain('Cyborg');

      // Update charges for Hit 3
      shieldedPlayer.abilityCharges = res2.updatedAbilityCharges?.['Cyborg'];

      // Hit 3: 0 charges -> dies
      const res3 = resolveNight(
        [attacker, shieldedPlayer],
        { Shooter: { target: 'Cyborg', abilityId: 'kinetic-slug' } },
        [customHit]
      );
      expect(res3.deaths).toContain('Cyborg');
    });

    it('should support unlimited shield quota without shattering', () => {
      const customHit = {
        id: 'kinetic-slug',
        name: 'Kinetic Slug',
        description: 'Hits target',
        icon: '💥',
        priority: 70,
        executionPhase: 'night' as const,
        isPassive: false,
        targeting: {
          selfAllowed: false,
          targetCount: { min: 1, max: 1 },
          livingState: 'alive' as const,
          factionScope: 'all' as const,
        },
        quota: { totalCharges: 'unlimited' as const },
        effects: [{ type: 'lethal_hit' as const }],
      };

      const titan: Player = {
        name: 'Titan',
        isDead: false,
        abilityCharges: { shield: 'unlimited' },
        role: {
          id: 'titan',
          name: 'Titan',
          sideId: 'neutral',
          abilityIds: [],
          passiveAbilityIds: [],
        },
      };

      const attacker: Player = {
        name: 'Shooter',
        isDead: false,
        role: {
          id: 'shooter',
          name: 'Shooter',
          sideId: 'red-team',
          abilityIds: ['kinetic-slug'],
          passiveAbilityIds: [],
        },
      };

      const res = resolveNight(
        [attacker, titan],
        { Shooter: { target: 'Titan', abilityId: 'kinetic-slug' } },
        [customHit]
      );
      expect(res.deaths).not.toContain('Titan');
      expect(res.brokenShields).toHaveLength(0);
      expect(res.log.some((l) => l.includes('unlimited shield'))).toBe(true);
    });
  });

  describe('Mafia Shooter Succession (getActiveMafiaShooter)', () => {
    it('returns Godfather as the shooter when alive', () => {
      const players: Player[] = [
        { name: 'GF', isDead: false, role: { id: 'godfather', name: 'Godfather', sideId: 'mafia', abilityIds: ['mafia-shot'], passiveAbilityIds: [] } },
        { name: 'Mat', isDead: false, role: { id: 'matador', name: 'Matador', sideId: 'mafia', abilityIds: ['block'], passiveAbilityIds: [] } },
        { name: 'Saul', isDead: false, role: { id: 'saul-goodman', name: 'Saul Goodman', sideId: 'mafia', abilityIds: ['buy'], passiveAbilityIds: [] } },
      ];
      expect(getActiveMafiaShooter(players)?.name).toBe('GF');
    });

    it('returns Matador when Godfather is eliminated', () => {
      const players: Player[] = [
        { name: 'GF', isDead: true, role: { id: 'godfather', name: 'Godfather', sideId: 'mafia', abilityIds: ['mafia-shot'], passiveAbilityIds: [] } },
        { name: 'Mat', isDead: false, role: { id: 'matador', name: 'Matador', sideId: 'mafia', abilityIds: ['block'], passiveAbilityIds: [] } },
        { name: 'Saul', isDead: false, role: { id: 'saul-goodman', name: 'Saul Goodman', sideId: 'mafia', abilityIds: ['buy'], passiveAbilityIds: [] } },
      ];
      expect(getActiveMafiaShooter(players)?.name).toBe('Mat');
    });

    it('returns Saul Goodman when Godfather and Matador are eliminated', () => {
      const players: Player[] = [
        { name: 'GF', isDead: true, role: { id: 'godfather', name: 'Godfather', sideId: 'mafia', abilityIds: ['mafia-shot'], passiveAbilityIds: [] } },
        { name: 'Mat', isDead: true, role: { id: 'matador', name: 'Matador', sideId: 'mafia', abilityIds: ['block'], passiveAbilityIds: [] } },
        { name: 'Saul', isDead: false, role: { id: 'saul-goodman', name: 'Saul Goodman', sideId: 'mafia', abilityIds: ['buy'], passiveAbilityIds: [] } },
        { name: 'Simp', isDead: false, role: { id: 'mafia', name: 'Simple Mafia', sideId: 'mafia', abilityIds: [], passiveAbilityIds: [] } },
      ];
      expect(getActiveMafiaShooter(players)?.name).toBe('Saul');
    });

    it('returns Simple Mafia when Godfather, Matador, and Saul Goodman are eliminated', () => {
      const players: Player[] = [
        { name: 'GF', isDead: true, role: { id: 'godfather', name: 'Godfather', sideId: 'mafia', abilityIds: ['mafia-shot'], passiveAbilityIds: [] } },
        { name: 'Mat', isDead: true, role: { id: 'matador', name: 'Matador', sideId: 'mafia', abilityIds: ['block'], passiveAbilityIds: [] } },
        { name: 'Saul', isDead: true, role: { id: 'saul-goodman', name: 'Saul Goodman', sideId: 'mafia', abilityIds: ['buy'], passiveAbilityIds: [] } },
        { name: 'Simp', isDead: false, role: { id: 'mafia', name: 'Simple Mafia', sideId: 'mafia', abilityIds: [], passiveAbilityIds: [] } },
      ];
      expect(getActiveMafiaShooter(players)?.name).toBe('Simp');
    });

    it('returns any surviving mafia member if specific hierarchy roles are dead', () => {
      const players: Player[] = [
        { name: 'Hacker', isDead: false, role: { id: 'black-hat', name: 'Black Hat', sideId: 'mafia', abilityIds: [], passiveAbilityIds: [] } },
        { name: 'Townie', isDead: false, role: { id: 'citizen', name: 'Citizen', sideId: 'town', abilityIds: [], passiveAbilityIds: [] } },
      ];
      expect(getActiveMafiaShooter(players)?.name).toBe('Hacker');
    });

    it('returns null if no living mafia players remain', () => {
      const players: Player[] = [
        { name: 'GF', isDead: true, role: { id: 'godfather', name: 'Godfather', sideId: 'mafia', abilityIds: [], passiveAbilityIds: [] } },
        { name: 'Townie', isDead: false, role: { id: 'citizen', name: 'Citizen', sideId: 'town', abilityIds: [], passiveAbilityIds: [] } },
      ];
      expect(getActiveMafiaShooter(players)).toBeNull();
    });
  });

  describe('Godfather Bulletproof Shield (1-Usage Limit)', () => {
    it('absorbs 1 fatal night shot and shatters shield (charge decrements 1 -> 0)', () => {
      const gf: Player = {
        name: 'Vito',
        isDead: false,
        role: {
          id: 'godfather',
          name: 'Godfather',
          sideId: 'mafia',
          abilityIds: ['mafia-shot'],
          passiveAbilityIds: ['shield'],
        },
      };
      const leon: Player = {
        name: 'Leon',
        isDead: false,
        role: {
          id: 'leon',
          name: 'Leon',
          sideId: 'town',
          abilityIds: ['vigillante-shot'],
          passiveAbilityIds: [],
        },
      };

      const result = resolveNight([gf, leon], {
        Leon: 'Vito',
      });

      expect(result.deaths).not.toContain('Vito');
      expect(result.brokenShields).toContain('Vito');
      expect(result.updatedAbilityCharges?.['Vito']?.['shield']).toBe(0);
      expect(result.log.some((l) => l.includes('[SAVE]') && l.includes('shield absorbed'))).toBe(true);
      expect(result.log.some((l) => l.includes('[SHIELD_BROKEN]'))).toBe(true);
    });

    it('eliminates Godfather on 2nd lethal hit in the same night after shield breaks on 1st hit', () => {
      const gf: Player = {
        name: 'Vito',
        isDead: false,
        role: {
          id: 'godfather',
          name: 'Godfather',
          sideId: 'mafia',
          abilityIds: ['mafia-shot'],
          passiveAbilityIds: ['shield'],
        },
      };
      const leon: Player = {
        name: 'Leon',
        isDead: false,
        role: {
          id: 'leon',
          name: 'Leon',
          sideId: 'town',
          abilityIds: ['vigillante-shot'],
          passiveAbilityIds: [],
        },
      };
      const zodiac: Player = {
        name: 'Zodiac',
        isDead: false,
        role: {
          id: 'zodiac',
          name: 'Zodiac',
          sideId: 'town',
          abilityIds: ['zodiac-shot'],
          passiveAbilityIds: [],
        },
      };

      const result = resolveNight([gf, leon, zodiac], {
        Leon: 'Vito',
        Zodiac: 'Vito',
      });

      expect(result.deaths).toContain('Vito');
      expect(result.brokenShields).toContain('Vito');
      expect(result.updatedAbilityCharges?.['Vito']?.['shield']).toBe(0);
      expect(result.log.some((l) => l.includes('[DEATH] Vito was killed.'))).toBe(true);
    });

    it('eliminates Godfather on subsequent night if shield was already shattered', () => {
      const gf: Player = {
        name: 'Vito',
        isDead: false,
        isShieldBroken: true,
        abilityCharges: { shield: 0 },
        role: {
          id: 'godfather',
          name: 'Godfather',
          sideId: 'mafia',
          abilityIds: ['mafia-shot'],
          passiveAbilityIds: [],
        },
      };
      const leon: Player = {
        name: 'Leon',
        isDead: false,
        role: {
          id: 'leon',
          name: 'Leon',
          sideId: 'town',
          abilityIds: ['vigillante-shot'],
          passiveAbilityIds: [],
        },
      };

      const result = resolveNight([gf, leon], {
        Leon: 'Vito',
      });

      expect(result.deaths).toContain('Vito');
      expect(result.log.some((l) => l.includes('[DEATH] Vito was killed.'))).toBe(true);
    });
  });

  describe('Mafia Successor Compound Action Execution', () => {
    it('resolves both personal ability and mafia team shot when performed by successor', () => {
      const matador: Player = {
        name: 'MatadorPlayer',
        isDead: false,
        role: {
          id: 'matador',
          name: 'Matador',
          sideId: 'mafia',
          abilityIds: ['block'],
          passiveAbilityIds: [],
        },
      };
      const doctor: Player = {
        name: 'DoctorPlayer',
        isDead: false,
        role: {
          id: 'doctor',
          name: 'Doctor',
          sideId: 'town',
          abilityIds: ['treat'],
          passiveAbilityIds: [],
        },
      };
      const victim: Player = {
        name: 'VictimPlayer',
        isDead: false,
        role: {
          id: 'citizen',
          name: 'Citizen',
          sideId: 'town',
          abilityIds: [],
          passiveAbilityIds: [],
        },
      };

      const actionMap = {
        MatadorPlayer: { target: 'DoctorPlayer', actionId: 'block' },
        'MatadorPlayer#mafia-shot': { target: 'VictimPlayer', actionId: 'mafia-shot' },
        DoctorPlayer: { target: 'VictimPlayer', actionId: 'treat' },
      };

      const result = resolveNight([matador, doctor, victim], actionMap);

      // Doctor is blocked by Matador, so cannot save Victim
      expect(result.log.some((l) => l.includes('[BLOCKED] DoctorPlayer tried to use treat, but was blocked.'))).toBe(true);
      expect(result.deaths).toContain('VictimPlayer');
      expect(result.log.some((l) => l.includes('[DEATH] VictimPlayer was killed.'))).toBe(true);
    });

    it('blocks both personal action and mafia-shot if the successor shooter is blocked', () => {
      const matador: Player = {
        name: 'MatadorPlayer',
        isDead: false,
        role: {
          id: 'matador',
          name: 'Matador',
          sideId: 'mafia',
          abilityIds: ['block'],
          passiveAbilityIds: [],
        },
      };
      const blocker: Player = {
        name: 'TownBlocker',
        isDead: false,
        role: {
          id: 'guard',
          name: 'Guard',
          sideId: 'town',
          abilityIds: ['block'],
          passiveAbilityIds: [],
        },
      };
      const victim: Player = {
        name: 'VictimPlayer',
        isDead: false,
        role: {
          id: 'citizen',
          name: 'Citizen',
          sideId: 'town',
          abilityIds: [],
          passiveAbilityIds: [],
        },
      };

      const actionMap = {
        TownBlocker: { target: 'MatadorPlayer', actionId: 'block' },
        MatadorPlayer: { target: 'VictimPlayer', actionId: 'block' },
        'MatadorPlayer#mafia-shot': { target: 'VictimPlayer', actionId: 'mafia-shot' },
      };

      const result = resolveNight([matador, blocker, victim], actionMap);

      expect(result.deaths).not.toContain('VictimPlayer');
      expect(result.log.some((l) => l.includes('[BLOCKED] MatadorPlayer tried to use block, but was blocked.'))).toBe(true);
      expect(result.log.some((l) => l.includes('[BLOCKED] MatadorPlayer tried to use mafia-shot, but was blocked.'))).toBe(true);
    });
  });
});
