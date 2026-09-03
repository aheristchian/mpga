import { describe, it, expect } from 'vitest';
import { evaluateGameStatus, aggregateStats } from './useWinCondition';
import type { Player, GameLog } from '../types';

describe('Win Condition Evaluator (useWinCondition.ts)', () => {
  const townCitizen: Player = {
    name: 'Alice',
    isDead: false,
    role: { id: 'citizen', name: 'Citizen', sideId: 'town' },
  };
  const townDoctor: Player = {
    name: 'Bob',
    isDead: false,
    role: { id: 'doctor', name: 'Doctor', sideId: 'town' },
  };
  const townDetective: Player = {
    name: 'Charlie',
    isDead: false,
    role: { id: 'detective', name: 'Detective', sideId: 'town' },
  };
  const mafiaGodfather: Player = {
    name: 'Dave',
    isDead: false,
    role: { id: 'godfather', name: 'Godfather', sideId: 'mafia' },
  };
  const mafiaGrunt: Player = {
    name: 'Eve',
    isDead: false,
    role: { id: 'mafia', name: 'Mafia', sideId: 'mafia' },
  };
  const nostradamus: Player = {
    name: 'Frank',
    isDead: false,
    role: { id: 'nostradamus', name: 'Nostradamus', sideId: 'third-party' },
  };

  it('detects in-progress games when both factions are alive', () => {
    const players = [townCitizen, townDoctor, townDetective, mafiaGodfather, mafiaGrunt];
    const result = evaluateGameStatus(players, []);

    expect(result.isGameOver).toBe(false);
    expect(result.winner).toBeNull();
    expect(result.livingTown.length).toBe(3);
    expect(result.livingMafia.length).toBe(2);
  });

  it('detects Town victory when all Mafia members are dead', () => {
    const players: Player[] = [
      { ...townCitizen, isDead: false },
      { ...townDoctor, isDead: false },
      { ...mafiaGodfather, isDead: true },
      { ...mafiaGrunt, isDead: true },
    ];
    const result = evaluateGameStatus(players, []);

    expect(result.isGameOver).toBe(true);
    expect(result.winner).toBe('town');
    expect(result.survivingPlayers.map((p) => p.name)).toEqual(['Alice', 'Bob']);
  });

  it('detects Mafia victory when living Mafia >= living Town', () => {
    const players: Player[] = [
      { ...townCitizen, isDead: false },
      { ...townDoctor, isDead: true },
      { ...mafiaGodfather, isDead: false },
      { ...mafiaGrunt, isDead: false },
    ];
    const result = evaluateGameStatus(players, []);

    expect(result.isGameOver).toBe(true);
    expect(result.winner).toBe('mafia');
  });

  it('does not declare early Mafia victory when living third-party roles maintain non-mafia majority', () => {
    // 2 Mafia vs 1 Town + 2 Third-Party (Total non-mafia = 3 > 2 mafia)
    const players: Player[] = [
      { ...townCitizen, isDead: false },
      { ...nostradamus, isDead: false },
      {
        name: 'Nostradamus2',
        isDead: false,
        role: { id: 'nostradamus', name: 'Nostradamus', sideId: 'third-party' },
      },
      { ...mafiaGodfather, isDead: false },
      { ...mafiaGrunt, isDead: false },
    ];
    const result = evaluateGameStatus(players, []);

    expect(result.isGameOver).toBe(false);
    expect(result.winner).toBeNull();
  });

  it('awards Nostradamus victory if their pledged side matches winning faction', () => {
    const players: Player[] = [
      { ...townCitizen, isDead: false },
      { ...nostradamus, isDead: false },
      { ...mafiaGodfather, isDead: true },
    ];
    const result = evaluateGameStatus(players, [], 'town');

    expect(result.isGameOver).toBe(true);
    expect(result.winner).toBe('town');
    expect(result.nostradamusWins).toBe(true);
  });

  it('aggregates match statistics correctly from logs', () => {
    const players: Player[] = [
      { ...townCitizen, isDead: false },
      { ...mafiaGodfather, isDead: true },
    ];
    const logs: GameLog[] = [
      {
        id: '1',
        day: 1,
        type: 'night',
        title: 'Target Saved by Doctor',
        detail: 'Alice was saved',
      },
      {
        id: '2',
        day: 2,
        type: 'night',
        title: 'Detective Inquiry',
        detail: 'Dave is guilty Mafia',
      },
    ];

    const stats = aggregateStats(players, logs);
    expect(stats.totalDays).toBe(2);
    expect(stats.totalEliminated).toBe(1);
    expect(stats.doctorSaves).toBe(1);
    expect(stats.detectiveHits).toBe(1);
  });

  it('prevents Town victory when all Mafia are dead but Zodiac (hostile third-party) is alive', () => {
    const zodiac: Player = {
      name: 'KillerZodiac',
      isDead: false,
      role: { id: 'zodiac', name: 'Zodiac', sideId: 'third-party' },
    };

    const players: Player[] = [
      { ...townCitizen, isDead: false },
      { ...townDoctor, isDead: false },
      { ...mafiaGodfather, isDead: true },
      { ...mafiaGrunt, isDead: true },
      zodiac,
    ];

    const result = evaluateGameStatus(players, []);

    // Game should NOT be over with Town win while Zodiac lives
    expect(result.isGameOver).toBe(false);
    expect(result.winner).toBeNull();
  });

  it('declares third-party victory when Zodiac is the last player alive', () => {
    const zodiac: Player = {
      name: 'KillerZodiac',
      isDead: false,
      role: { id: 'zodiac', name: 'Zodiac', sideId: 'third-party' },
    };

    const players: Player[] = [
      { ...townCitizen, isDead: true },
      { ...townDoctor, isDead: true },
      { ...mafiaGodfather, isDead: true },
      { ...mafiaGrunt, isDead: true },
      zodiac,
    ];

    const result = evaluateGameStatus(players, []);

    expect(result.isGameOver).toBe(true);
    expect(result.winner).toBe('third-party');
    expect(result.survivingPlayers.map((p) => p.name)).toEqual(['KillerZodiac']);
  });
});
