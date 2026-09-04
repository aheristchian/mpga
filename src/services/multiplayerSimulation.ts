/**
 * Multiplayer Simulation Harness for MPGA
 *
 * Simulates a full multi-device topology:
 * - 1 Moderator Host broadcasting sanitized state and receiving mobile actions.
 * - N Virtual Connected Player Clients claiming seats, receiving secret encrypted roles,
 *   casting daytime ballots, and submitting nocturnal ability targets.
 */

import {
  generateRoomCode,
  sanitizePublicGameState,
  sanitizePlayerPayload,
  type ClientPublicState,
  type ClientPrivatePayload,
} from './useMultiplayerService';
import type { Player } from '../types';

export interface SimulationEventLog {
  timestamp: number;
  source: 'host' | 'client';
  clientId?: string;
  type: string;
  details: any;
}

export class VirtualPlayerClient {
  public readonly peerId: string;
  public name: string;
  public isConnected: boolean = false;
  public currentPublicState: ClientPublicState | null = null;
  public privatePayload: ClientPrivatePayload | null = null;
  public actionHistory: any[] = [];
  public host: MultiplayerSimulationHost | null = null;

  constructor(name: string, peerId?: string) {
    this.name = name;
    this.peerId =
      peerId || `peer_${name.toLowerCase()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  public connect(host: MultiplayerSimulationHost): void {
    this.host = host;
    this.isConnected = true;
    this.host.registerClient(this);
  }

  public disconnect(): void {
    if (this.host) {
      this.host.unregisterClient(this.peerId);
      this.host = null;
    }
    this.isConnected = false;
  }

  public claimSeat(seatName?: string): void {
    if (!this.host)
      throw new Error(`[VirtualClient ${this.name}] Cannot claim seat: not connected to host.`);
    const targetName = seatName || this.name;
    this.name = targetName;
    const action = {
      type: 'CLAIM_SEAT',
      action: 'CLAIM_SEAT',
      playerName: targetName,
      peerId: this.peerId,
      timestamp: Date.now(),
    };
    this.actionHistory.push(action);
    this.host.handleClientAction(this.peerId, action);
  }

  public castVote(candidateName: string, voteType: 'pre' | 'final' = 'pre'): void {
    if (!this.host)
      throw new Error(`[VirtualClient ${this.name}] Cannot vote: not connected to host.`);
    const action = {
      type: 'CAST_VOTE',
      action: 'CAST_VOTE',
      voterName: this.name,
      candidateName,
      voteType,
      peerId: this.peerId,
      timestamp: Date.now(),
    };
    this.actionHistory.push(action);
    this.host.handleClientAction(this.peerId, action);
  }

  public submitNightAction(actionId: string, targetPlayerName: string): void {
    if (!this.host)
      throw new Error(
        `[VirtualClient ${this.name}] Cannot submit night action: not connected to host.`
      );
    const action = {
      type: 'NIGHT_ACTION',
      action: 'NIGHT_ACTION',
      actor: this.name,
      actorName: this.name,
      actorRole: this.privatePayload?.role?.name || 'Unknown',
      target: targetPlayerName,
      targetPlayerName,
      actionId,
      peerId: this.peerId,
      timestamp: Date.now(),
    };
    this.actionHistory.push(action);
    this.host.handleClientAction(this.peerId, action);
  }

  public requestChallenge(): void {
    if (!this.host)
      throw new Error(`[VirtualClient ${this.name}] Cannot request challenge: not connected.`);
    const action = {
      type: 'CHALLENGE_REQUEST',
      action: 'CHALLENGE_REQUEST',
      playerName: this.name,
      peerId: this.peerId,
      timestamp: Date.now(),
    };
    this.actionHistory.push(action);
    this.host.handleClientAction(this.peerId, action);
  }

  public receivePublicState(state: ClientPublicState): void {
    this.currentPublicState = JSON.parse(JSON.stringify(state));
  }

  public receivePrivatePayload(payload: ClientPrivatePayload): void {
    this.privatePayload = JSON.parse(JSON.stringify(payload));
  }
}

export class MultiplayerSimulationHost {
  public readonly roomCode: string;
  public readonly clients: Map<string, VirtualPlayerClient> = new Map();
  public readonly claimedSeats: Map<string, string> = new Map(); // peerId -> playerName
  public readonly logs: SimulationEventLog[] = [];
  private listeners: ((data: any) => void)[] = [];

  constructor(roomCode?: string) {
    this.roomCode = roomCode || generateRoomCode();
  }

  public onPlayerAction(callback: (data: any) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public registerClient(client: VirtualPlayerClient): void {
    this.clients.set(client.peerId, client);
    this.logs.push({
      timestamp: Date.now(),
      source: 'client',
      clientId: client.peerId,
      type: 'CLIENT_CONNECTED',
      details: { name: client.name, peerId: client.peerId },
    });
    this.dispatchAction({
      action: 'PEER_CONNECTED',
      type: 'PEER_CONNECTED',
      peerId: client.peerId,
    });
  }

  public unregisterClient(peerId: string): void {
    const client = this.clients.get(peerId);
    if (client) {
      this.clients.delete(peerId);
      this.claimedSeats.delete(peerId);
      this.logs.push({
        timestamp: Date.now(),
        source: 'client',
        clientId: peerId,
        type: 'CLIENT_DISCONNECTED',
        details: { name: client.name },
      });
      this.dispatchAction({
        action: 'PEER_DISCONNECTED',
        type: 'PEER_DISCONNECTED',
        peerId,
      });
    }
  }

  public handleClientAction(peerId: string, action: any): void {
    this.logs.push({
      timestamp: Date.now(),
      source: 'client',
      clientId: peerId,
      type: action.type,
      details: action,
    });

    if (action.type === 'CLAIM_SEAT') {
      this.claimedSeats.set(peerId, action.playerName);
    }

    this.dispatchAction(action);
  }

  private dispatchAction(action: any): void {
    for (const listener of this.listeners) {
      try {
        listener(action);
      } catch (err) {
        console.error('[MultiplayerSimulationHost] Listener error:', err);
      }
    }
  }

  /**
   * Broadcasts sanitized public state to all connected virtual clients
   */
  public broadcastPublicState(
    store: any,
    speakerInfo?: {
      activeSpeaker?: string | null;
      speakerTimeRemaining?: number;
      isChallengeActive?: boolean;
    }
  ): ClientPublicState {
    const claimedPlayerNames = Array.from(this.claimedSeats.values());
    const publicState = sanitizePublicGameState(store, claimedPlayerNames, speakerInfo);

    for (const client of this.clients.values()) {
      client.receivePublicState(publicState);
    }

    this.logs.push({
      timestamp: Date.now(),
      source: 'host',
      type: 'PUBLIC_STATE_BROADCAST',
      details: {
        gamePhase: publicState.gamePhase,
        subPhase: publicState.subPhase,
        livingCount: publicState.livingPlayers.length,
      },
    });

    return publicState;
  }

  /**
   * Sends personalized secret payload to each claimed player
   */
  public broadcastPrivatePayloads(store: any, isGameLive: boolean): void {
    const players: Player[] =
      store.livePlayers && store.livePlayers.length > 0 ? store.livePlayers : store.players || [];

    for (const client of this.clients.values()) {
      const targetPlayer = players.find(
        (p) => p.name.trim().toLowerCase() === client.name.trim().toLowerCase()
      );
      if (targetPlayer) {
        const payload = sanitizePlayerPayload(targetPlayer, isGameLive);
        if (payload) {
          client.receivePrivatePayload(payload);
        }
      }
    }

    this.logs.push({
      timestamp: Date.now(),
      source: 'host',
      type: 'PRIVATE_PAYLOADS_DISTRIBUTED',
      details: { clientCount: this.clients.size, isGameLive },
    });
  }
}
