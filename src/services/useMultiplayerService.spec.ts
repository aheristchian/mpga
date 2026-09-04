import { describe, it, expect } from 'vitest';
import {
  generateRoomCode,
  sanitizePlayerPayload,
  sanitizePublicGameState,
} from './useMultiplayerService';
import type { Player } from '../types';

describe('useMultiplayerService', () => {
  it('generates a valid 6-character uppercase alphanumeric room code', () => {
    const code = generateRoomCode();
    expect(code).toBeDefined();
    expect(code.length).toBe(6);
    expect(/^[A-Z0-9]{6}$/.test(code)).toBe(true);
  });

  it('sanitizes personal player payload without leaking extraneous attributes', () => {
    const player: any = {
      name: 'Alice',
      role: {
        id: 'godfather',
        name: 'Godfather',
        sideId: 'mafia',
        description: 'Leader of the mafia',
        abilities: ['kill'],
      },
      isDead: false,
      isSilenced: true,
      warnings: 1,
      secretPrivateNotes: 'Do not leak this',
    };

    const payload = sanitizePlayerPayload(player);
    expect(payload?.name).toBe('Alice');
    expect(payload?.role?.name).toBe('Godfather');
    expect(payload?.role?.sideId).toBe('mafia');
    expect(payload?.isDead).toBe(false);
    expect(payload?.isSilenced).toBe(true);
    expect(payload?.warnings).toBe(1);
    expect((payload as any)?.secretPrivateNotes).toBeUndefined();
  });

  it('sanitizes public game state and NEVER leaks secret roles of other players in public roster', () => {
    const store: any = {
      gamePhase: 'playing',
      subPhase: 'night',
      currentDay: 2,
      livePlayers: [
        { name: 'Alice', isDead: false, role: { name: 'Godfather', sideId: 'mafia' } },
        { name: 'Bob', isDead: false, role: { name: 'Doctor', sideId: 'town' } },
        { name: 'Charlie', isDead: true, role: { name: 'Citizen', sideId: 'town' } },
      ],
      eliminatedPlayer: { name: 'Charlie', role: { name: 'Citizen' } },
      drawnLastWordCards: [{ name: 'Silence' }],
      isGameOver: false,
      winner: null,
    };

    const publicState = sanitizePublicGameState(store);
    expect(publicState.gamePhase).toBe('playing');
    expect(publicState.subPhase).toBe('night');
    expect(publicState.currentDay).toBe(2);
    expect(publicState.livingPlayers.length).toBe(2);
    expect(publicState.livingPlayers[0].name).toBe('Alice');
    // CRITICAL: Ensure no role information is present in public roster list
    expect((publicState.livingPlayers[0] as any).role).toBeUndefined();
    expect((publicState.livingPlayers[0] as any).sideId).toBeUndefined();
    expect((publicState.allPlayers[0] as any).role).toBeUndefined();
    expect((publicState.allPlayers[0] as any).sideId).toBeUndefined();
  });

  it('sanitizes public state with setupPlayers during setup phase', () => {
    const store: any = {
      gamePhase: 'setup',
      subPhase: 'day',
      currentDay: 1,
      players: [
        { name: 'Ali', role: null },
        { name: 'Sara', role: null },
      ],
      livePlayers: [],
      eliminatedPlayer: null,
      drawnLastWordCards: [],
      isGameOver: false,
      winner: null,
    };

    const publicState = sanitizePublicGameState(store);
    expect(publicState.gamePhase).toBe('setup');
    expect(publicState.setupPlayers?.length).toBe(2);
    expect(publicState.setupPlayers?.[0]).toEqual({ name: 'Ali', seat: 1, isClaimed: false });
    expect(publicState.setupPlayers?.[1]).toEqual({ name: 'Sara', seat: 2, isClaimed: false });
    expect(publicState.allPlayers.length).toBe(2);
  });

  it('manages transportMode switching and passcode settings via composable', async () => {
    const { useMultiplayer } = await import('./useMultiplayerService');
    const mp = useMultiplayer();

    expect(mp.transportMode.value).toBe('cloud');
    mp.setTransportMode('webrtc');
    expect(mp.transportMode.value).toBe('webrtc');

    mp.setTransportMode('cloud');
    expect(mp.transportMode.value).toBe('cloud');

    mp.setRoomPasscode('9988');
    expect(mp.roomPasscode.value).toBe('9988');
  });

  it('supports multiple action bus subscribers and clean unsubscriptions', async () => {
    const { useMultiplayer, dispatchPlayerAction } = await import('./useMultiplayerService');
    const mp = useMultiplayer();

    const receivedA: any[] = [];
    const receivedB: any[] = [];

    const unsubA = mp.onPlayerAction((data) => receivedA.push(data));
    const unsubB = mp.onPlayerAction((data) => receivedB.push(data));

    dispatchPlayerAction({ action: 'TEST_EVENT', value: 123 });

    expect(receivedA.length).toBe(1);
    expect(receivedA[0]).toEqual({ action: 'TEST_EVENT', value: 123 });
    expect(receivedB.length).toBe(1);
    expect(receivedB[0]).toEqual({ action: 'TEST_EVENT', value: 123 });

    // Unsubscribe listener A
    unsubA();

    dispatchPlayerAction({ action: 'SECOND_EVENT', value: 456 });

    expect(receivedA.length).toBe(1); // Not called again
    expect(receivedB.length).toBe(2);
    expect(receivedB[1]).toEqual({ action: 'SECOND_EVENT', value: 456 });

    // Cleanup listener B
    unsubB();
  });

  it('withholds role in sanitizePlayerPayload when isGameLive is false (pre-game / lobby)', () => {
    const player: Player = {
      name: 'Ali',
      isDead: false,
      role: {
        id: 'detective',
        name: 'Detective',
        sideId: 'town',
        description: 'Investigates players',
        abilities: ['investigate'],
      },
    };

    // Pre-game: isGameLive = false
    const preGamePayload = sanitizePlayerPayload(player, false);
    expect(preGamePayload?.name).toBe('Ali');
    expect(preGamePayload?.role).toBeNull();

    // In-game: isGameLive = true
    const inGamePayload = sanitizePlayerPayload(player, true);
    expect(inGamePayload?.name).toBe('Ali');
    expect(inGamePayload?.role).toBeDefined();
    expect(inGamePayload?.role?.id).toBe('detective');
  });

  it('includes shield state and ability charges in sanitizePlayerPayload', () => {
    const gf: Player = {
      name: 'Vito',
      isDead: false,
      isShieldBroken: true,
      abilityCharges: { shield: 0 },
      role: {
        id: 'godfather',
        name: 'Godfather',
        sideId: 'mafia',
        abilities: ['mafia-shot'],
      },
    };

    const payload = sanitizePlayerPayload(gf, true, [gf]);
    expect(payload?.isShieldBroken).toBe(true);
    expect(payload?.abilityCharges).toEqual({ shield: 0 });
    expect(payload?.isMafiaShooter).toBe(true);
  });

  it('delegates mafia-shot to living successor when Godfather is dead', () => {
    const deadGf: Player = {
      name: 'DeadVito',
      isDead: true,
      role: {
        id: 'godfather',
        name: 'Godfather',
        sideId: 'mafia',
        abilities: ['mafia-shot'],
      },
    };
    const matador: Player = {
      name: 'MatadorPlayer',
      isDead: false,
      role: {
        id: 'matador',
        name: 'Matador',
        sideId: 'mafia',
        abilities: ['block'],
      },
    };
    const saul: Player = {
      name: 'SaulPlayer',
      isDead: false,
      role: {
        id: 'saul-goodman',
        name: 'Saul Goodman',
        sideId: 'mafia',
        abilities: ['buy'],
      },
    };

    const roster = [deadGf, matador, saul];

    // Matador is 1st in line after Godfather dies
    const matadorPayload = sanitizePlayerPayload(matador, true, roster);
    expect(matadorPayload?.isMafiaShooter).toBe(true);
    expect(matadorPayload?.role?.abilities).toContain('mafia-shot');
    expect(matadorPayload?.role?.abilities).toContain('block');

    // Saul is 2nd in line, so when Matador is alive Saul is NOT the shooter
    const saulPayload = sanitizePlayerPayload(saul, true, roster);
    expect(saulPayload?.isMafiaShooter).toBe(false);
    expect(saulPayload?.role?.abilities).not.toContain('mafia-shot');
    expect(saulPayload?.role?.abilities).toContain('buy');
  });

  it('marks isClaimed accurately in sanitizePublicGameState based on claimed player roster', () => {
    const store: any = {
      gamePhase: 'setup',
      players: [{ name: 'Ali' }, { name: 'Sara' }, { name: 'Reza' }],
      livePlayers: [],
    };

    const claimed = ['Ali', 'reza'];
    const publicState = sanitizePublicGameState(store, claimed);

    expect(publicState.claimedPlayers).toEqual(['ali', 'reza']);
    expect(publicState.setupPlayers?.[0]).toEqual({ name: 'Ali', seat: 1, isClaimed: true });
    expect(publicState.setupPlayers?.[1]).toEqual({ name: 'Sara', seat: 2, isClaimed: false });
    expect(publicState.setupPlayers?.[2]).toEqual({ name: 'Reza', seat: 3, isClaimed: true });
  });

  it('correctly tracks isPeerConnected and connectedPlayerNames', async () => {
    const { useMultiplayer } = await import('./useMultiplayerService');
    const mp = useMultiplayer();

    mp.connectedPeers.value = [
      { peerId: 'p1', playerName: 'Alice', lastSeen: Date.now() },
      { peerId: 'p2', playerName: 'Bob', lastSeen: Date.now() },
    ];

    expect(mp.isPeerConnected('Alice')).toBe(true);
    expect(mp.isPeerConnected('alice')).toBe(true);
    expect(mp.isPeerConnected('Bob')).toBe(true);
    expect(mp.isPeerConnected('Charlie')).toBe(false);
    expect(mp.connectedPlayerNames.value).toEqual(['Alice', 'Bob']);
  });

  it('exports valid CLOUD_BROKER_URLS fallback pool', async () => {
    const { CLOUD_BROKER_URLS, CLOUD_BROKER_URL } = await import('./useMultiplayerService');
    expect(Array.isArray(CLOUD_BROKER_URLS)).toBe(true);
    expect(CLOUD_BROKER_URLS.length).toBeGreaterThanOrEqual(2);
    expect(CLOUD_BROKER_URL).toBe(CLOUD_BROKER_URLS[0]);
    expect(CLOUD_BROKER_URLS[0]).toContain('wss://');
  });

  it('includes activeSpeaker and speech timer in public state', () => {
    const mockStore: any = {
      gamePhase: 'playing',
      subPhase: 'day',
      currentDay: 2,
      livePlayers: [{ name: 'Alice', isDead: false }],
      players: [{ name: 'Alice' }],
      votingState: { stage: 'discussion', qualifiedDefenders: [], threshold: 0 },
    };

    const state = sanitizePublicGameState(mockStore, ['Alice'], {
      activeSpeaker: 'Alice',
      speakerTimeRemaining: 25,
      isChallengeActive: true,
    });

    expect(state.activeSpeaker).toBe('Alice');
    expect(state.speakerTimeRemaining).toBe(25);
    expect(state.isChallengeActive).toBe(true);
  });
});
