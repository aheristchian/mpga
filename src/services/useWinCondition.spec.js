import { describe, it, expect } from 'vitest';
import { evaluateGameStatus, aggregateStats } from './useWinCondition';

describe('Win Condition Evaluator (useWinCondition.js)', () => {
  const townCitizen = {
    name: 'Alice',
    isDead: false,
    role: { id: 'citizen', name: 'Citizen', sideId: 'town' },
  };
  const townDoctor = {
    name: 'Bob',
    isDead: false,
    role: { id: 'doctor', name: 'Doctor', sideId: 'town' },
  };
  const townDetective = {
    name: 'Charlie',
    isDead: false,
    role: { id: 'detective', name: 'Detective', sideId: 'town' },
  };
  const mafiaGodfather = {
    name: 'Dave',
    isDead: false,
    role: { id: 'godfather', name: 'Godfather', sideId: 'mafia' },
  };
  const mafiaGrunt = {
    name: 'Eve',
    isDead: false,
    role: { id: 'mafia', name: 'Mafia', sideId: 'mafia' },
  };
  const nostradamus = {
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
    const players = [
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
    const players = [
      { ...townCitizen, isDead: false },
      { ...townDoctor, isDead: true },
      { ...mafiaGodfather, isDead: false },
      { ...mafiaGrunt, isDead: false },
    ];
    const result = evaluateGameStatus(players, []);

    expect(result.isGameOver).toBe(true);
    expect(result.winner).toBe('mafia');
  });

  it('awards Nostradamus victory if their pledged side matches winning faction', () => {
    const players = [
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
    const players = [
      { ...townCitizen, isDead: false },
      { ...mafiaGodfather, isDead: true },
    ];
    const logs = [
      { day: 1, type: 'night', title: 'Target Saved by Doctor', detail: 'Alice was saved' },
      { day: 2, type: 'night', title: 'Detective Inquiry', detail: 'Dave is guilty Mafia' },
    ];

    const stats = aggregateStats(players, logs);
    expect(stats.totalDays).toBe(2);
    expect(stats.totalEliminated).toBe(1);
    expect(stats.doctorSaves).toBe(1);
    expect(stats.detectiveHits).toBe(1);
  });
});
