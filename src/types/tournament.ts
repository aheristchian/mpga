export interface TournamentScoringRules {
  id?: string;
  name?: string;
  winPoints: number; // Points awarded for team victory (e.g. 3.0)
  survivalBonus: number; // Extra bonus for surviving the match (e.g. 1.0)
  mvpPoints: number; // Awarded to Best Player / MVP (e.g. 2.0)
  secondMvpPoints: number; // Awarded to Runner-up MVP (e.g. 1.0)
  warningDeduction: number; // Penalty deducted per yellow card / warning (e.g. 0.5)
  disqualificationDeduction: number; // Penalty deducted for red card / disqualification (e.g. 2.0)
  doctorSaveBonus: number; // Bonus for successful doctor save (e.g. 0.5)
  detectiveHitBonus: number; // Bonus for positive detective inquiry on Mafia (e.g. 0.5)
  leonHitBonus: number; // Bonus for successful vigilante shot on Mafia (e.g. 0.5)
  leonGuiltDeduction: number; // Penalty when Leon shoots an innocent citizen (e.g. 1.5)
  beautifulMindBonus: number; // Bonus for guessing roles on exit card (e.g. 1.0)
}

export interface PlayerMatchScoreBreakdown {
  playerName: string;
  roleId?: string;
  roleName?: string;
  sideId?: string;
  isAlive: boolean;
  isWinner: boolean;
  isMvp: boolean;
  isSecondMvp: boolean;
  warnings: number;
  isDisqualified: boolean;
  doctorSavesCount?: number;
  detectiveHitsCount?: number;
  specialBonusPoints?: number;
  manualAdjustmentPoints?: number;

  // Itemized point calculation
  baseWinPoints: number;
  survivalPoints: number;
  mvpPoints: number;
  warningPenalty: number;
  specialPoints: number;
  totalPoints: number;
}

export interface TournamentMatchRecord {
  id: string;
  matchNumber: number;
  timestamp: string;
  gameModeId: string;
  gameModeName?: string;
  winnerFaction: string;
  totalDays: number;
  scores: PlayerMatchScoreBreakdown[];
  mvpPlayerName?: string;
  secondMvpPlayerName?: string;
  notes?: string;
}

export interface PlayerTournamentStanding {
  playerName: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number; // Percentage (e.g. 75.0)
  mvpCount: number;
  secondMvpCount: number;
  totalWarnings: number;
  totalPoints: number;
  averagePointsPerMatch: number;
  rank?: number;
}

export interface TournamentData {
  version: '1.0.0';
  tournamentName: string;
  createdAt: string;
  updatedAt: string;
  scoringRules: TournamentScoringRules;
  matches: TournamentMatchRecord[];
}
