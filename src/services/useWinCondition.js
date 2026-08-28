/**
 * Win condition evaluator and post-match statistics aggregator for Mafia Party Game Assistant.
 */

/**
 * Pure function to evaluate current game status and win condition.
 *
 * @param {Array} livePlayers - List of players with { name, isDead, role: { sideId, name, id } }
 * @param {Array} gameLogs - Array of recorded game logs
 * @param {String|null} nostradamusChoice - 'town' | 'mafia' | null
 * @returns {Object} evaluation object
 */
export const evaluateGameStatus = (livePlayers = [], gameLogs = [], nostradamusChoice = null) => {
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

  let isGameOver = false;
  let winner = null;

  // 1. Town Victory: All Mafia players are eliminated
  if (livingMafia.length === 0 && livingTown.length > 0) {
    isGameOver = true;
    winner = 'town';
  }
  // 2. Mafia Victory: Living Mafia count >= Living Town count
  else if (livingMafia.length >= livingTown.length && livingMafia.length > 0) {
    isGameOver = true;
    winner = 'mafia';
  }
  // 3. Mutual annihilation edge case
  else if (livingPlayers.length === 0) {
    isGameOver = true;
    winner = 'draw';
  }

  // Check Nostradamus Win Condition
  const nostradamusWins = isGameOver && nostradamusChoice && winner === nostradamusChoice;

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
export const aggregateStats = (players = [], logs = []) => {
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

const getEmptyStats = () => ({
  totalDays: 1,
  totalEliminated: 0,
  doctorSaves: 0,
  detectiveHits: 0,
  totalLogs: 0,
});
