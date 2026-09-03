export type TransportMode = 'cloud' | 'webrtc';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ConnectedPeer {
  peerId: string;
  playerName: string | null;
  conn?: any;
  lastSeen: number;
  pingMs?: number | null;
}

export interface ClientPlayerIdentity {
  name: string;
  role?: any;
  isDead: boolean;
  isSilenced: boolean;
  warnings: number;
}

export interface PublicPlayerInfo {
  name: string;
  seat: number;
  isClaimed: boolean;
  isDead: boolean;
  isSilenced: boolean;
  warnings: number;
}

export interface ClientPublicState {
  gamePhase: string;
  subPhase: string;
  currentDay: number;
  livingPlayers: PublicPlayerInfo[];
  allPlayers: PublicPlayerInfo[];
  setupPlayers: any[];
  claimedPlayers?: string[];
  eliminatedPlayer?: { name: string; role?: string } | null;
  drawnLastWordCards?: any[];
  isGameOver: boolean;
  winner: string | null;
  votingState?: any;
  activeSpeaker?: string | null;
  speakerTimeRemaining?: number;
  isChallengeActive?: boolean;
}

export interface MultiplayerPacket {
  type: string;
  senderId?: string;
  roomId?: string;
  payload?: any;
  passcode?: string;
  timestamp?: number;
  [key: string]: any;
}

export type PlayerActionListener = (actionData: any) => void;
