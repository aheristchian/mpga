import type { Role } from './role';
import type { LastWordCard } from './cards';

export type GamePhase = 'mode-selection' | 'setup' | 'role-selection' | 'playing' | 'game-over';

export type SubPhase = 'day' | 'voting' | 'midday' | 'night';

export type VotingStage = 'pre-vote' | 'defense' | 'final-vote';

export interface BalanceRules {
  warnIfSideExceedsRatio?: {
    sideId: string;
    maxRatio: number;
  };
}

export interface GameMode {
  id: string;
  nameKey: string;
  minPlayers: number;
  timeToTalk: number;
  borrowedTimeToTalk: number;
  defenseTimeToTalk: number;
  challengesPerDay: number;
  nextDayShift: number;
  votingThresholdRounding: 'ceil' | 'floor' | 'half' | string;
  balanceRules?: BalanceRules;
}

export interface Player {
  name: string;
  role?: Role | null;
  peerId?: string | null;
  isDead?: boolean;
  warnings?: number;
  isSilenced?: boolean;
  isShieldBroken?: boolean;
}

export interface GameLog {
  id: string;
  timestamp: string;
  day: number;
  phase: string;
  type: string;
  title: string;
  detail: string;
  [key: string]: any;
}

export interface DrawnCardRecord {
  card: LastWordCard;
  playerName: string;
  day: number;
  timestamp: string;
}

export interface VotingState {
  stage: VotingStage | string;
  qualifiedDefenders: string[];
  threshold: number;
}

export interface GameStateSnapshot {
  description: string;
  timestamp: number;
  gamePhase: GamePhase;
  gameMode: GameMode | null;
  players: Player[];
  livePlayers: Player[];
  subPhase: SubPhase;
  currentDay: number;
  gameLogs: GameLog[];
  lastWordDeck: LastWordCard[];
  drawnLastWordCards: DrawnCardRecord[];
  eliminatedPlayer: Player | null;
  isGameOver: boolean;
  winner: string | null;
  nostradamusChoice: string | null;
  votingState: VotingState;
  silencedPlayers?: string[];
}

export interface WinResult {
  isGameOver: boolean;
  winner: 'town' | 'mafia' | 'third-party' | null;
  reasonKey?: string;
  message?: string;
}
