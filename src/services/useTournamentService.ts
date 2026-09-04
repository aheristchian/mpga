import { ref, computed, watch } from 'vue';
import type {
  Player,
  GameLog,
  TournamentScoringRules,
  PlayerMatchScoreBreakdown,
  TournamentMatchRecord,
  PlayerTournamentStanding,
  TournamentData,
} from '../types';

export const DEFAULT_TOURNAMENT_RULES: TournamentScoringRules = {
  id: 'iranian-league',
  name: 'Iranian League Standard',
  winPoints: 3.0,
  survivalBonus: 1.0,
  mvpPoints: 2.0,
  secondMvpPoints: 1.0,
  warningDeduction: 0.5,
  disqualificationDeduction: 2.0,
  doctorSaveBonus: 0.5,
  detectiveHitBonus: 0.5,
  leonHitBonus: 0.5,
  leonGuiltDeduction: 1.5,
  beautifulMindBonus: 1.0,
};

export const TOURNAMENT_RULE_PRESETS: Record<string, TournamentScoringRules> = {
  iranianLeague: {
    ...DEFAULT_TOURNAMENT_RULES,
  },
  standardTournament: {
    id: 'standard-tournament',
    name: 'Standard Tournament',
    winPoints: 3.0,
    survivalBonus: 0.0,
    mvpPoints: 1.5,
    secondMvpPoints: 0.5,
    warningDeduction: 0.5,
    disqualificationDeduction: 1.0,
    doctorSaveBonus: 0.5,
    detectiveHitBonus: 0.5,
    leonHitBonus: 0.5,
    leonGuiltDeduction: 1.0,
    beautifulMindBonus: 0.5,
  },
  simplePoints: {
    id: 'simple-points',
    name: 'Simple Points',
    winPoints: 1.0,
    survivalBonus: 0.0,
    mvpPoints: 1.0,
    secondMvpPoints: 0.0,
    warningDeduction: 0.5,
    disqualificationDeduction: 1.0,
    doctorSaveBonus: 0.0,
    detectiveHitBonus: 0.0,
    leonHitBonus: 0.0,
    leonGuiltDeduction: 0.0,
    beautifulMindBonus: 0.0,
  },
};

const STORAGE_KEY = 'mpga_tournament_data';

function loadStoredData(): TournamentData {
  if (typeof localStorage === 'undefined') {
    return {
      version: '1.0.0',
      tournamentName: 'Official MPGA League',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scoringRules: { ...DEFAULT_TOURNAMENT_RULES },
      matches: [],
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.matches)) {
        return {
          version: '1.0.0',
          tournamentName: parsed.tournamentName || 'Official MPGA League',
          createdAt: parsed.createdAt || new Date().toISOString(),
          updatedAt: parsed.updatedAt || new Date().toISOString(),
          scoringRules: parsed.scoringRules
            ? { ...DEFAULT_TOURNAMENT_RULES, ...parsed.scoringRules }
            : { ...DEFAULT_TOURNAMENT_RULES },
          matches: parsed.matches,
        };
      }
    }
  } catch (err) {
    console.error('Failed to load tournament data from localStorage:', err);
  }

  return {
    version: '1.0.0',
    tournamentName: 'Official MPGA League',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scoringRules: { ...DEFAULT_TOURNAMENT_RULES },
    matches: [],
  };
}

/**
 * Pure calculation function that determines points for each player in a match.
 */
export function calculatePlayerScores(
  players: Player[] = [],
  gameLogs: GameLog[] = [],
  winnerFaction: string | null = 'town',
  options: {
    mvpPlayerName?: string;
    secondMvpPlayerName?: string;
    rules?: TournamentScoringRules;
    nostradamusChoice?: string | null;
    manualAdjustments?: Record<string, number>;
  } = {}
): PlayerMatchScoreBreakdown[] {
  const rules = options.rules || DEFAULT_TOURNAMENT_RULES;
  const winner = winnerFaction?.toLowerCase() || '';

  // Count doctor saves and detective hits from game logs
  let doctorSaves = 0;
  let detectiveHits = 0;

  (gameLogs || []).forEach((log) => {
    const detailLower = (log.detail || '').toLowerCase();
    const titleLower = (log.title || '').toLowerCase();
    if (
      detailLower.includes('doctor saved') ||
      detailLower.includes('saved by doctor') ||
      titleLower.includes('doctor save')
    ) {
      doctorSaves++;
    }
    if (
      detailLower.includes('positive') ||
      detailLower.includes('thumbs up') ||
      titleLower.includes('investigation: mafia')
    ) {
      detectiveHits++;
    }
  });

  return players.map((player) => {
    const roleId = player.role?.id || '';
    const sideId = (player.role?.sideId || player.customFactionId || 'town').toLowerCase();
    const isDead = !!player.isDead;
    const warnings = player.warnings || 0;
    const isDisqualified = warnings >= 3;

    // Victory evaluation:
    // If Nostradamus, check if pledged alignment matches the winner
    const isWinner =
      roleId === 'nostradamus'
        ? (options.nostradamusChoice || '').toLowerCase() === winner
        : sideId === winner;

    const isMvp = options.mvpPlayerName === player.name;
    const isSecondMvp = options.secondMvpPlayerName === player.name;

    // Itemized points
    const baseWinPoints = isWinner ? rules.winPoints : 0;
    const survivalPoints = !isDead ? rules.survivalBonus : 0;
    const mvpPoints = isMvp ? rules.mvpPoints : isSecondMvp ? rules.secondMvpPoints : 0;

    // Penalties
    let warningPenalty = warnings * rules.warningDeduction;
    if (isDisqualified) {
      warningPenalty += rules.disqualificationDeduction;
    }

    // Role specific bonuses
    let specialPoints = 0;
    let doctorSavesCount = 0;
    let detectiveHitsCount = 0;

    if (roleId === 'doctor' && doctorSaves > 0) {
      doctorSavesCount = doctorSaves;
      specialPoints += doctorSaves * (rules.doctorSaveBonus || 0);
    }
    if (roleId === 'detective' && detectiveHits > 0) {
      detectiveHitsCount = detectiveHits;
      specialPoints += detectiveHits * (rules.detectiveHitBonus || 0);
    }

    const manualAdj = options.manualAdjustments?.[player.name] || 0;
    specialPoints += manualAdj;

    const totalPoints =
      Math.round(
        (baseWinPoints + survivalPoints + mvpPoints - warningPenalty + specialPoints) * 100
      ) / 100;

    return {
      playerName: player.name,
      roleId,
      roleName: player.role?.name || roleId,
      sideId,
      isAlive: !isDead,
      isWinner,
      isMvp,
      isSecondMvp,
      warnings,
      isDisqualified,
      doctorSavesCount,
      detectiveHitsCount,
      specialBonusPoints: specialPoints,
      manualAdjustmentPoints: manualAdj,
      baseWinPoints,
      survivalPoints,
      mvpPoints,
      warningPenalty,
      specialPoints,
      totalPoints,
    };
  });
}

/**
 * Pure function to aggregate tournament standings across matches.
 */
export function buildStandingsFromMatches(
  matches: TournamentMatchRecord[] = []
): PlayerTournamentStanding[] {
  const map: Record<
    string,
    {
      playerName: string;
      matchesPlayed: number;
      wins: number;
      losses: number;
      mvpCount: number;
      secondMvpCount: number;
      totalWarnings: number;
      totalPoints: number;
    }
  > = {};

  matches.forEach((match) => {
    (match.scores || []).forEach((score) => {
      const name = score.playerName;
      if (!map[name]) {
        map[name] = {
          playerName: name,
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          mvpCount: 0,
          secondMvpCount: 0,
          totalWarnings: 0,
          totalPoints: 0,
        };
      }

      const rec = map[name];
      rec.matchesPlayed++;
      if (score.isWinner) {
        rec.wins++;
      } else {
        rec.losses++;
      }
      if (score.isMvp) rec.mvpCount++;
      if (score.isSecondMvp) rec.secondMvpCount++;
      rec.totalWarnings += score.warnings || 0;
      rec.totalPoints += score.totalPoints || 0;
    });
  });

  const list: PlayerTournamentStanding[] = Object.values(map).map((rec) => {
    const winRate =
      rec.matchesPlayed > 0 ? Math.round((rec.wins / rec.matchesPlayed) * 1000) / 10 : 0;
    const averagePointsPerMatch =
      rec.matchesPlayed > 0 ? Math.round((rec.totalPoints / rec.matchesPlayed) * 100) / 100 : 0;
    const roundedPoints = Math.round(rec.totalPoints * 100) / 100;

    return {
      playerName: rec.playerName,
      matchesPlayed: rec.matchesPlayed,
      wins: rec.wins,
      losses: rec.losses,
      winRate,
      mvpCount: rec.mvpCount,
      secondMvpCount: rec.secondMvpCount,
      totalWarnings: rec.totalWarnings,
      totalPoints: roundedPoints,
      averagePointsPerMatch,
    };
  });

  // Sort descending: totalPoints -> wins -> winRate -> alphabetical
  list.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    if (b.winRate !== a.winRate) {
      return b.winRate - a.winRate;
    }
    return a.playerName.localeCompare(b.playerName);
  });

  // Assign ranks
  list.forEach((item, index) => {
    item.rank = index + 1;
  });

  return list;
}

/**
 * Tournament Service Composable.
 */
export function useTournamentService() {
  const tournamentData = ref<TournamentData>(loadStoredData());

  const saveToStorage = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      tournamentData.value.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tournamentData.value));
    } catch (err) {
      console.error('Failed to save tournament data:', err);
    }
  };

  const scoringRules = computed(() => tournamentData.value.scoringRules);
  const matches = computed(() => tournamentData.value.matches);
  const tournamentName = computed(() => tournamentData.value.tournamentName);

  const standings = computed(() => buildStandingsFromMatches(tournamentData.value.matches));

  const totalMatchesCount = computed(() => tournamentData.value.matches.length);

  const setTournamentName = (name: string) => {
    tournamentData.value.tournamentName = name.trim() || 'Official MPGA League';
    saveToStorage();
  };

  const updateScoringRules = (newRules: Partial<TournamentScoringRules>) => {
    tournamentData.value.scoringRules = {
      ...tournamentData.value.scoringRules,
      ...newRules,
    };
    saveToStorage();
  };

  const applyRulePreset = (presetKey: keyof typeof TOURNAMENT_RULE_PRESETS) => {
    const preset = TOURNAMENT_RULE_PRESETS[presetKey];
    if (preset) {
      tournamentData.value.scoringRules = { ...preset };
      saveToStorage();
    }
  };

  const recordMatch = (
    matchData: Omit<TournamentMatchRecord, 'id' | 'matchNumber' | 'timestamp'>
  ): TournamentMatchRecord => {
    const matchNumber = tournamentData.value.matches.length + 1;
    const newMatch: TournamentMatchRecord = {
      ...matchData,
      id: `match_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      matchNumber,
      timestamp: new Date().toISOString(),
    };

    tournamentData.value.matches.push(newMatch);
    saveToStorage();
    return newMatch;
  };

  const deleteMatch = (matchId: string): boolean => {
    const initialLen = tournamentData.value.matches.length;
    tournamentData.value.matches = tournamentData.value.matches.filter((m) => m.id !== matchId);

    // Re-index match numbers
    tournamentData.value.matches.forEach((m, idx) => {
      m.matchNumber = idx + 1;
    });

    if (tournamentData.value.matches.length !== initialLen) {
      saveToStorage();
      return true;
    }
    return false;
  };

  const resetTournament = () => {
    tournamentData.value.matches = [];
    tournamentData.value.updatedAt = new Date().toISOString();
    saveToStorage();
  };

  const exportAsJson = (): string => {
    return JSON.stringify(tournamentData.value, null, 2);
  };

  const importFromJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && Array.isArray(parsed.matches)) {
        tournamentData.value = {
          version: '1.0.0',
          tournamentName: parsed.tournamentName || 'Imported MPGA League',
          createdAt: parsed.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          scoringRules: parsed.scoringRules
            ? { ...DEFAULT_TOURNAMENT_RULES, ...parsed.scoringRules }
            : { ...DEFAULT_TOURNAMENT_RULES },
          matches: parsed.matches,
        };
        saveToStorage();
        return true;
      }
    } catch (err) {
      console.error('Failed to import tournament JSON:', err);
    }
    return false;
  };

  const exportAsCsv = (): string => {
    const currentStandings = standings.value;
    const headers = [
      'Rank',
      'Player Name',
      'Matches Played',
      'Wins',
      'Losses',
      'Win Rate (%)',
      'MVPs',
      'Runner-ups',
      'Warnings',
      'Average Points',
      'Total Points',
    ];

    const rows = currentStandings.map((s) => [
      s.rank || '',
      `"${s.playerName.replace(/"/g, '""')}"`,
      s.matchesPlayed,
      s.wins,
      s.losses,
      `${s.winRate}%`,
      s.mvpCount,
      s.secondMvpCount,
      s.totalWarnings,
      s.averagePointsPerMatch,
      s.totalPoints,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  return {
    tournamentData,
    scoringRules,
    matches,
    tournamentName,
    standings,
    totalMatchesCount,
    setTournamentName,
    updateScoringRules,
    applyRulePreset,
    calculatePlayerScores,
    recordMatch,
    deleteMatch,
    resetTournament,
    exportAsJson,
    importFromJson,
    exportAsCsv,
  };
}
