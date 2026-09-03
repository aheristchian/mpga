import type { Player, GameLog } from '../types';

/**
 * Win condition evaluator and post-match statistics aggregator for Mafia Party Game Assistant.
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
  winner: 'town' | 'mafia' | 'draw' | 'third-party' | null;
  livingTown: Player[];
  livingMafia: Player[];
  livingThirdParty: Player[];
  nostradamusWins: boolean;
  survivingPlayers?: Player[];
  stats: GameStats;
}

/**
 * Pure function to evaluate current game status and win condition.
 */
export const evaluateGameStatus = (
  livePlayers: Player[] = [],
  gameLogs: GameLog[] = [],
  nostradamusChoice: string | null = null
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
  const livingHostileThirdParty = livingThirdParty.filter((p) => p.role?.id === 'zodiac');

  let isGameOver = false;
  let winner: 'town' | 'mafia' | 'draw' | 'third-party' | null = null;

  const livingNonMafia = livingPlayers.filter((p) => p.role?.sideId !== 'mafia');

  // 1. Town Victory: All Mafia and hostile third-party killers (Zodiac) are eliminated, Town survives
  if (livingMafia.length === 0 && livingHostileThirdParty.length === 0 && livingTown.length > 0) {
    isGameOver = true;
    winner = 'town';
  }
  // 2. Mafia Victory: Living Mafia count >= Living Non-Mafia count (Town + Third-Party)
  else if (livingMafia.length >= livingNonMafia.length && livingMafia.length > 0) {
    isGameOver = true;
    winner = 'mafia';
  }
  // 3. Third-party solo victory: All Town and Mafia are wiped out, Third-party survives
  else if (livingTown.length === 0 && livingMafia.length === 0 && livingThirdParty.length > 0) {
    isGameOver = true;
    winner = 'third-party';
  }
  // 4. Mutual annihilation: Everyone eliminated
  else if (livingTown.length === 0 && livingMafia.length === 0) {
    isGameOver = true;
    winner = 'draw';
  }

  // Check Nostradamus Win Condition
  const nostradamusWins = !!(isGameOver && nostradamusChoice && winner === nostradamusChoice);

  // Aggregate Match Statistics from gameLogs
  const stats = aggregateStats(livePlayers, gameLogs);

  return {
    isGameOver,
    winner,
    livingTown,
    livingMafia,
    livingThirdParty,
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
