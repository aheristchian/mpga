import type { Player, GameLog } from '../types';
import type { FactionDefinition } from '../types/faction';

/**
 * Win condition evaluator and post-match statistics aggregator for Mafia Party Game Assistant.
 * Supports arbitrary factions and declarative win conditions.
 */

export interface GameStats {
  totalDays: number;
  totalEliminated: number;
  doctorSaves: number;
  detectiveHits: number;
  totalLogs: number;
}

export interface GameStatusEvaluation {
  isGameOver: boolean;
  winner: string | null; // e.g. 'town' | 'mafia' | 'draw' | 'third-party' | custom faction ID
  winningFaction?: FactionDefinition | null;
  livingTown: Player[];
  livingMafia: Player[];
  livingThirdParty: Player[];
  livingByFaction?: Record<string, Player[]>;
  nostradamusWins: boolean;
  survivingPlayers?: Player[];
  stats: GameStats;
}

/**
 * Pure function to evaluate current game status and win condition.
 * If customFactions are supplied, evaluates declarative win rules for each faction.
 * Otherwise, falls back to standard Mafia/Town balance rules.
 */
export const evaluateGameStatus = (
  livePlayers: Player[] = [],
  gameLogs: GameLog[] = [],
  nostradamusChoice: string | null = null,
  customFactions?: FactionDefinition[]
): GameStatusEvaluation => {
  if (!livePlayers || livePlayers.length === 0) {
    return {
      isGameOver: false,
      winner: null,
      livingTown: [],
      livingMafia: [],
      livingThirdParty: [],
      nostradamusWins: false,
      stats: getEmptyStats(),
    };
  }

  const livingPlayers = livePlayers.filter((p) => !p.isDead);
  const livingTown = livingPlayers.filter((p) => p.role?.sideId === 'town');
  const livingMafia = livingPlayers.filter((p) => p.role?.sideId === 'mafia');
  const livingThirdParty = livingPlayers.filter((p) => p.role?.sideId === 'third-party');
  const livingHostileThirdParty = livingThirdParty.filter(
    (p) => p.role?.id === 'zodiac' || p.role?.id === 'rogue-ai'
  );

  let isGameOver = false;
  let winner: string | null = null;
  let winningFaction: FactionDefinition | null = null;

  // Group living players by faction ID
  const livingByFaction: Record<string, Player[]> = {};
  for (const player of livingPlayers) {
    const side =
      player.customFactionId || (player.role as any)?.factionId || player.role?.sideId || 'town';
    if (!livingByFaction[side]) {
      livingByFaction[side] = [];
    }
    livingByFaction[side].push(player);
  }

  // --- 1. DECLARATIVE EVALUATION (When custom factions are provided) ---
  if (customFactions && customFactions.length > 0) {
    if (livingPlayers.length === 0) {
      isGameOver = true;
      winner = 'draw';
    } else {
      // Evaluate each faction's win condition
      for (const faction of customFactions) {
        const factionLiving = livingByFaction[faction.id] || [];
        if (factionLiving.length === 0) continue;

        const cond = faction.winCondition;
        if (!cond) continue;

        if (
          cond.type === 'elimination' &&
          cond.targetFactionIds &&
          cond.targetFactionIds.length > 0
        ) {
          // Win if all target factions have 0 living members
          const targetsAlive = cond.targetFactionIds.some((targetId) => {
            return (livingByFaction[targetId] || []).length > 0;
          });
          if (!targetsAlive) {
            isGameOver = true;
            winner = faction.id;
            winningFaction = faction;
            break;
          }
        } else if (cond.type === 'parity' && cond.parityAgainstFactionIds) {
          // Win if this faction alive >= sum of alive members in parityAgainstFactionIds
          let opposingCount = 0;
          for (const opId of cond.parityAgainstFactionIds) {
            opposingCount += (livingByFaction[opId] || []).length;
          }
          if (factionLiving.length >= opposingCount && factionLiving.length > 0) {
            isGameOver = true;
            winner = faction.id;
            winningFaction = faction;
            break;
          }
        } else if (cond.type === 'last_standing') {
          // Win if only members of this faction are alive
          const totalLiving = livingPlayers.length;
          if (factionLiving.length === totalLiving) {
            isGameOver = true;
            winner = faction.id;
            winningFaction = faction;
            break;
          }
        }
      }
    }
  }

  // --- 2. FALLBACK DEFAULT EVALUATION (Standard Mafia/Town) ---
  if (!isGameOver && (!customFactions || customFactions.length === 0)) {
    const livingNonMafia = livingPlayers.filter((p) => p.role?.sideId !== 'mafia');

    // Town Victory: All Mafia and hostile third-party killers (Zodiac) are eliminated, Town survives
    if (livingMafia.length === 0 && livingHostileThirdParty.length === 0 && livingTown.length > 0) {
      isGameOver = true;
      winner = 'town';
    }
    // Mafia Victory: Living Mafia count >= Living Non-Mafia count (Town + Third-Party)
    else if (livingMafia.length >= livingNonMafia.length && livingMafia.length > 0) {
      isGameOver = true;
      winner = 'mafia';
    }
    // Third-party solo victory: All Town and Mafia are wiped out, Third-party survives
    else if (livingTown.length === 0 && livingMafia.length === 0 && livingThirdParty.length > 0) {
      isGameOver = true;
      winner = 'third-party';
    }
    // Mutual annihilation: Everyone eliminated
    else if (livingTown.length === 0 && livingMafia.length === 0) {
      isGameOver = true;
      winner = 'draw';
    }
  }

  // Check Nostradamus Win Condition
  const nostradamusWins = !!(isGameOver && nostradamusChoice && winner === nostradamusChoice);

  // Aggregate Match Statistics from gameLogs
  const stats = aggregateStats(livePlayers, gameLogs);

  return {
    isGameOver,
    winner,
    winningFaction,
    livingTown,
    livingMafia,
    livingThirdParty,
    livingByFaction,
    nostradamusWins,
    survivingPlayers: livingPlayers,
    stats,
  };
};

/**
 * Aggregates game stats and highlights from logs and player roster.
 */
export const aggregateStats = (players: Player[] = [], logs: GameLog[] = []): GameStats => {
  const totalDeaths = players.filter((p) => p.isDead).length;
  let maxDay = 1;
  let doctorSaves = 0;
  let detectiveHits = 0;

  logs.forEach((log) => {
    if (log.day && log.day > maxDay) {
      maxDay = log.day;
    }
    const text = `${log.title} ${log.detail || ''}`.toLowerCase();

    // Doctor saves count
    if (
      text.includes('saved by doctor') ||
      text.includes('protected') ||
      text.includes('doctor saved')
    ) {
      doctorSaves++;
    }
    // Detective successful inquiries
    if (text.includes('guilty') || (text.includes('mafia') && text.includes('investigat'))) {
      detectiveHits++;
    }
  });

  return {
    totalDays: maxDay,
    totalEliminated: totalDeaths,
    doctorSaves,
    detectiveHits,
    totalLogs: logs.length,
  };
};

const getEmptyStats = (): GameStats => ({
  totalDays: 1,
  totalEliminated: 0,
  doctorSaves: 0,
  detectiveHits: 0,
  totalLogs: 0,
});
