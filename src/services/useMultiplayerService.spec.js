import { describe, it, expect } from 'vitest';
import {
  generateRoomCode,
  sanitizePlayerPayload,
  sanitizePublicGameState,
} from './useMultiplayerService';

describe('useMultiplayerService', () => {
  it('generates a valid 4-character uppercase alphanumeric room code', () => {
    const code = generateRoomCode();
    expect(code).toBeDefined();
    expect(code.length).toBe(4);
    expect(/^[A-Z0-9]{4}$/.test(code)).toBe(true);
  });

  it('sanitizes personal player payload without leaking extraneous attributes', () => {
    const player = {
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
    expect(payload.name).toBe('Alice');
    expect(payload.role.name).toBe('Godfather');
    expect(payload.role.sideId).toBe('mafia');
    expect(payload.isDead).toBe(false);
    expect(payload.isSilenced).toBe(true);
    expect(payload.warnings).toBe(1);
    expect(payload.secretPrivateNotes).toBeUndefined();
  });

  it('sanitizes public game state and NEVER leaks secret roles of other players in public roster', () => {
    const store = {
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
    expect(publicState.livingPlayers[0].role).toBeUndefined();
    expect(publicState.livingPlayers[0].sideId).toBeUndefined();
    expect(publicState.allPlayers[0].role).toBeUndefined();
    expect(publicState.allPlayers[0].sideId).toBeUndefined();
  });

  it('sanitizes public state with setupPlayers during setup phase', () => {
    const store = {
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
    expect(publicState.setupPlayers.length).toBe(2);
    expect(publicState.setupPlayers[0]).toEqual({ name: 'Ali', seat: 1 });
    expect(publicState.setupPlayers[1]).toEqual({ name: 'Sara', seat: 2 });
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
});
