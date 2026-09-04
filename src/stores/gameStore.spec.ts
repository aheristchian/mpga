import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from './gameStore';
import type { Player } from '../types';

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

(globalThis as any).localStorage = storageMock;
(globalThis as any).__APP_VERSION__ = '1.0.0';

describe('Game Store (gameStore.ts)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    (globalThis as any).localStorage.clear();
  });

  it('initializes with default values and deck', () => {
    const store = useGameStore();
    expect(store.gamePhase).toBe('mode-selection');
    expect(store.gameMode).toBeNull();
    expect(store.currentDay).toBe(1);
    expect(store.subPhase).toBe('day');
    expect(store.gameLogs).toEqual([]);
    expect(store.lastWordDeck.length).toBeGreaterThan(0);
    expect(store.drawnLastWordCards).toEqual([]);
  });

  it('records logs with addLog', () => {
    const store = useGameStore();
    store.addLog('day', 'Speaker Finished', 'Spoke for 40s', { player: 'Alice' });

    expect(store.gameLogs.length).toBe(1);
    expect(store.gameLogs[0].type).toBe('day');
    expect(store.gameLogs[0].title).toBe('Speaker Finished');
    expect(store.gameLogs[0].player).toBe('Alice');
    expect(store.gameLogs[0].day).toBe(1);
  });

  it('starts playing and initializes live players with warnings and silence', () => {
    const store = useGameStore();
    const mockPlayers: Player[] = [
      { name: 'Alice', role: { id: 'godfather', name: 'Godfather', sideId: 'mafia' } },
      { name: 'Bob', role: { id: 'doctor', name: 'Doctor', sideId: 'town' } },
    ];

    store.startPlaying(mockPlayers);

    expect(store.gamePhase).toBe('playing');
    expect(store.subPhase).toBe('day');
    expect(store.livePlayers.length).toBe(2);
    expect(store.livePlayers[0].isDead).toBe(false);
    expect(store.livePlayers[0].warnings).toBe(0);
    expect(store.livePlayers[0].isSilenced).toBe(false);
    expect(store.gameLogs.length).toBeGreaterThan(0);
  });

  it('updates player death status and logs kill / revive actions', () => {
    const store = useGameStore();
    store.startPlaying([
      { name: 'Alice', role: { id: 'godfather', name: 'Godfather', sideId: 'mafia' } },
      { name: 'Bob', role: { id: 'doctor', name: 'Doctor', sideId: 'town' } },
      { name: 'Charlie', role: { id: 'detective', name: 'Detective', sideId: 'town' } },
      { name: 'Dave', role: { id: 'citizen', name: 'Citizen', sideId: 'town' } },
      { name: 'Eve', role: { id: 'citizen', name: 'Citizen', sideId: 'town' } },
    ]);

    // Kill Eve (Town) -> 1 Mafia vs 3 Town -> Game continues
    store.setPlayerDeathStatus('Eve', true, 'Moderator Penalty');
    expect(store.livePlayers.find((p) => p.name === 'Eve')?.isDead).toBe(true);
    expect(store.gameLogs[0].type).toBe('moderator');
    expect(store.gameLogs[0].title).toContain('Eliminated');
    expect(store.gameLogs[0].detail).toContain('Moderator Penalty');
    expect(store.isGameOver).toBe(false);

    // Revive Eve -> 1 Mafia vs 4 Town -> Game continues
    store.setPlayerDeathStatus('Eve', false, 'Card Revive');
    expect(store.livePlayers.find((p) => p.name === 'Eve')?.isDead).toBe(false);
    expect(store.gameLogs[0].title).toContain('Revived');
    expect(store.isGameOver).toBe(false);
  });

  it('applies penalties and warnings correctly', () => {
    const store = useGameStore();
    store.startPlaying([
      { name: 'Alice', role: { id: 'godfather', name: 'Godfather', sideId: 'mafia' } },
    ]);

    // Add warning
    store.applyPenalty('Alice', { warningDelta: 1 }, 'Speaking out of turn');
    expect(store.livePlayers[0].warnings).toBe(1);

    // Toggle silence
    store.applyPenalty('Alice', { isSilenced: true }, 'Silence card effect');
    expect(store.livePlayers[0].isSilenced).toBe(true);
  });

  it('draws and retires Last Word Cards', () => {
    const store = useGameStore();
    store.startPlaying([
      { name: 'Alice', role: { id: 'citizen', name: 'Citizen', sideId: 'town' } },
    ]);

    const initialDeckCount = store.lastWordDeck.length;
    const drawn = store.drawLastWordCard('Alice');

    expect(drawn).toBeDefined();
    expect(store.lastWordDeck.length).toBe(initialDeckCount - 1);
    expect(store.drawnLastWordCards.length).toBe(1);
    expect(store.drawnLastWordCards[0].playerName).toBe('Alice');
    expect(store.drawnLastWordCards[0].card.id).toBe(drawn?.id);
  });

  it('proceeds to next day, increments day count, and resets temporary silence', () => {
    const store = useGameStore();
    store.startPlaying([
      { name: 'Alice', role: { id: 'citizen', name: 'Citizen', sideId: 'town' } },
    ]);

    store.applyPenalty('Alice', { isSilenced: true });
    expect(store.livePlayers[0].isSilenced).toBe(true);

    store.proceedToNextDay();

    expect(store.currentDay).toBe(2);
    expect(store.subPhase).toBe('day');
    expect(store.livePlayers[0].isSilenced).toBe(false);
  });

  it('triggers win condition automatically on player elimination', () => {
    const store = useGameStore();
    store.startPlaying([
      { name: 'Alice', role: { id: 'citizen', name: 'Citizen', sideId: 'town' } },
      { name: 'Bob', role: { id: 'doctor', name: 'Doctor', sideId: 'town' } },
      { name: 'Dave', role: { id: 'godfather', name: 'Godfather', sideId: 'mafia' } },
    ]);

    expect(store.isGameOver).toBe(false);

    // Eliminate Godfather -> Town wins
    store.setPlayerDeathStatus('Dave', true, 'Night Kill');
    expect(store.isGameOver).toBe(true);
    expect(store.winner).toBe('town');
    expect(store.showGameOverModal).toBe(true);

    // Moderator dismisses and reopens modal
    store.dismissGameOverModal();
    expect(store.showGameOverModal).toBe(false);
    store.reopenGameOverModal();
    expect(store.showGameOverModal).toBe(true);
  });

  it('records Nostradamus secret choice', () => {
    const store = useGameStore();
    store.setNostradamusChoice('mafia');
    expect(store.nostradamusChoice).toBe('mafia');
    expect(store.gameLogs[0].title).toBe('Nostradamus Side Chosen');
  });

  it('supports reactive lobby player management (add, deduplicate, remove, reorder)', () => {
    const store = useGameStore();
    expect(store.players).toEqual([]);

    // Add first player
    const added1 = store.addSetupPlayer('Ali', 'peer-123');
    expect(added1).toBe(true);
    expect(store.players.length).toBe(1);
    expect(store.players[0]).toEqual({ name: 'Ali', role: null, peerId: 'peer-123' });

    // Deduplicate case-insensitive
    const addedDuplicate = store.addSetupPlayer('ali');
    expect(addedDuplicate).toBe(false);
    expect(store.players.length).toBe(1);

    // Add second & third players
    store.addSetupPlayer('Reza');
    store.addSetupPlayer('Sara');
    expect(store.players.length).toBe(3);
    expect(store.players.map((p) => p.name)).toEqual(['Ali', 'Reza', 'Sara']);

    // Reorder players (move Sara from index 2 to index 0)
    store.reorderSetupPlayers(2, 0);
    expect(store.players.map((p) => p.name)).toEqual(['Sara', 'Ali', 'Reza']);

    // Remove player at index 1 (Ali)
    store.removeSetupPlayer(1);
    expect(store.players.map((p) => p.name)).toEqual(['Sara', 'Reza']);
  });

  it('transitions subPhase and resets game completely', () => {
    const store = useGameStore();
    store.startPlaying([
      { name: 'Alice', role: { id: 'citizen', name: 'Citizen', sideId: 'town' } },
    ]);

    store.setSubPhase('voting');
    expect(store.subPhase).toBe('voting');

    store.setSubPhase('night');
    expect(store.subPhase).toBe('night');

    store.resetGame();
    expect(store.gamePhase).toBe('mode-selection');
    expect(store.livePlayers).toEqual([]);
    expect(store.gameLogs).toEqual([]);
    expect(store.isGameOver).toBe(false);
    expect(store.winner).toBeNull();
  });

  it('supports 1-step undo rolling back state mutations', () => {
    const store = useGameStore();
    store.startPlaying([
      { name: 'Alice', role: { id: 'godfather', name: 'Godfather', sideId: 'mafia' } },
      { name: 'Bob', role: { id: 'doctor', name: 'Doctor', sideId: 'town' } },
    ]);

    expect(store.canUndo).toBe(false);
    expect(store.livePlayers[0].isDead).toBe(false);

    // Eliminate Alice -> snapshot created
    store.setPlayerDeathStatus('Alice', true, 'Test kill');
    expect(store.livePlayers[0].isDead).toBe(true);
    expect(store.canUndo).toBe(true);

    // Rollback elimination
    const undone = store.undoLastAction();
    expect(undone).not.toBeNull();
    expect(store.livePlayers[0].isDead).toBe(false);
    expect(store.canUndo).toBe(false);
  });

  describe('UniversalGamePack store integration', () => {
    it('initializes deck as empty when universal pipeline disables exit cards', () => {
      const store = useGameStore();
      store.setActiveUniversalPack({
        version: '2.0.0',
        id: 'no-cards-pack',
        name: 'No Cards Game',
        theme: { primaryColor: '#ef4444' },
        pipeline: {
          enabledPhases: ['day', 'voting', 'night'],
          speakingOrder: 'sequential_shift',
          votingThresholdFormula: 'ceil',
          tieResolution: 'no_elimination',
          enableExitCards: false,
        },
        factions: [],
        abilities: [],
        roles: [],
      });

      store.startPlaying([{ name: 'Alice', role: { id: 'p1', name: 'P1', sideId: 'f1' } }]);

      expect(store.lastWordDeck).toEqual([]);
    });

    it('evaluates declarative faction victory when activeUniversalPack factions are set', () => {
      const store = useGameStore();
      store.setActiveUniversalPack({
        version: '2.0.0',
        id: 'cyber-pack',
        name: 'Cyber War',
        theme: { primaryColor: '#3b82f6' },
        pipeline: {
          enabledPhases: ['day', 'voting', 'night'],
          speakingOrder: 'sequential_shift',
          votingThresholdFormula: 'ceil',
          tieResolution: 'no_elimination',
          enableExitCards: false,
        },
        factions: [
          {
            id: 'blue_team',
            name: 'Blue Team (SOC)',
            color: '#3b82f6',
            badgeIcon: '🛡️',
            alignment: 'uninformed_majority',
            winCondition: { type: 'elimination', targetFactionIds: ['red_team'] },
          },
          {
            id: 'red_team',
            name: 'Red Team (APT)',
            color: '#ef4444',
            badgeIcon: '💀',
            alignment: 'informed_minority',
            winCondition: { type: 'parity', parityAgainstFactionIds: ['blue_team'] },
          },
        ],
        abilities: [],
        roles: [],
      });

      store.startPlaying([
        { name: 'SOC1', role: { id: 'analyst', name: 'Analyst', sideId: 'blue_team' } },
        { name: 'APT1', role: { id: 'infiltrator', name: 'Infiltrator', sideId: 'red_team' } },
      ]);

      expect(store.isGameOver).toBe(false);

      // Kill the only APT member -> Blue Team achieves elimination victory
      store.setPlayerDeathStatus('APT1', true, 'Purged');

      expect(store.isGameOver).toBe(true);
      expect(store.winner).toBe('blue_team');
      expect(store.winningFaction?.name).toBe('Blue Team (SOC)');
    });

    it('mutates player ability charges with applyPlayerCharges', () => {
      const store = useGameStore();
      store.startPlaying([
        { name: 'Alice', role: { id: 'shield_bearer', name: 'Knight', sideId: 'town' } },
      ]);

      store.applyPlayerCharges({
        Alice: { shield: 2, heal: 1 },
      });

      expect(store.livePlayers[0].abilityCharges).toEqual({ shield: 2, heal: 1 });
    });
  });
});
