import { ref, computed } from 'vue';
import Peer, { type DataConnection } from 'peerjs';
import mqtt, { type MqttClient } from 'mqtt';
import { encryptPayload, decryptPayload, isEncryptedMessage } from '../utils/crypto';
import type {
  TransportMode,
  ConnectionStatus,
  ConnectedPeer,
  ClientPlayerIdentity,
  ClientPublicState,
  PlayerActionListener,
  Player,
  VotingState,
} from '../types';

// Transport Modes: 'cloud' (MQTT over WSS - ultra-stable) or 'webrtc' (P2P direct)
const transportMode = ref<TransportMode>(
  typeof localStorage !== 'undefined'
    ? (localStorage.getItem('mpga_transport_mode') as TransportMode) || 'cloud'
    : 'cloud'
);

// Reactive Singleton State
const isHost = ref<boolean>(false);
const isClient = ref<boolean>(false);
const roomCode = ref<string>('');
const connectionStatus = ref<ConnectionStatus>('disconnected');
const errorMessage = ref<string>('');
const pingLatency = ref<number | null>(null);

// Host State
let hostPeer: Peer | null = null;
let hostMqttClient: MqttClient | null = null;
const connectedPeers = ref<ConnectedPeer[]>([]);
const roomPasscode = ref<string>(
  typeof localStorage !== 'undefined' ? localStorage.getItem('mpga_room_passcode') || '' : ''
);

// Client State
let clientPeer: Peer | null = null;
let clientConn: DataConnection | null = null;
let clientMqttClient: MqttClient | null = null;
let clientMqttId = '';
const clientPlayerName = ref<string>(
  typeof localStorage !== 'undefined' ? localStorage.getItem('mpga_player_name') || '' : ''
);
const clientPlayerIdentity = ref<ClientPlayerIdentity | null>(null);
const clientPublicState = ref<ClientPublicState | null>(null);
const isInLobby = ref<boolean>(false);
const lobbyPlayers = ref<any[]>([]);

// Multi-subscriber Event Bus for player actions & lifecycle events
const playerActionListeners = new Set<PlayerActionListener>();

export function dispatchPlayerAction(actionData: Record<string, any>) {
  if (!actionData) return;
  playerActionListeners.forEach((listener) => {
    try {
      listener(actionData);
    } catch (err) {
      console.error('[MPGA Multiplayer] Error in player action listener:', err);
    }
  });
}

// Keep-alive timers
let webrtcHeartbeatInterval: ReturnType<typeof setInterval> | null = null;
let clientPingInterval: ReturnType<typeof setInterval> | null = null;
let hostPresenceInterval: ReturnType<typeof setInterval> | null = null;

// MQTT Broker Configuration (Public High-Availability WSS Brokers Pool)
export const CLOUD_BROKER_URLS: string[] = [
  'wss://broker.hivemq.com:8884/mqtt',
  'wss://broker.emqx.io:8084/mqtt',
  'wss://test.mosquitto.org:8081/mqtt',
];
export const CLOUD_BROKER_URL = CLOUD_BROKER_URLS[0];

export function sanitizePlayerPayload(
  player: Player | null | undefined,
  isGameLive: boolean = true
): ClientPlayerIdentity | null {
  if (!player) return null;
  return {
    name: player.name,
    role:
      isGameLive && player.role
        ? {
            id: player.role.id,
            name: player.role.name,
            sideId: player.role.sideId,
            description: player.role.description,
            abilities: (player.role as any).abilities,
          }
        : null,
    isDead: !!player.isDead,
    isSilenced: !!player.isSilenced,
    warnings: player.warnings || 0,
  };
}

export function sanitizePublicGameState(
  store: any,
  claimedPlayerNames: string[] = [],
  speakerInfo?: {
    activeSpeaker?: string | null;
    speakerTimeRemaining?: number;
    isChallengeActive?: boolean;
  }
): ClientPublicState {
  if (!store) {
    return {
      gamePhase: 'mode-selection',
      subPhase: 'day',
      currentDay: 1,
      livingPlayers: [],
      allPlayers: [],
      setupPlayers: [],
      claimedPlayers: [],
      eliminatedPlayer: null,
      drawnLastWordCards: [],
      isGameOver: false,
      winner: null,
      votingState: {
        stage: 'pre-vote',
        qualifiedDefenders: [],
        threshold: 0,
      },
      activeSpeaker: null,
      speakerTimeRemaining: 0,
      isChallengeActive: false,
    };
  }

  const claimedSet = new Set(
    (claimedPlayerNames || [])
      .map((n) => (typeof n === 'string' ? n.trim().toLowerCase() : ''))
      .filter(Boolean)
  );

  const living = (store.livePlayers || [])
    .filter((p: Player) => !p.isDead)
    .map((p: Player, idx: number) => ({
      name: p.name,
      seat: idx + 1,
      isClaimed: claimedSet.has((p.name || '').toLowerCase()),
    }));

  const all = (store.livePlayers || []).map((p: Player, idx: number) => ({
    name: p.name,
    seat: idx + 1,
    isDead: !!p.isDead,
    isSilenced: !!p.isSilenced,
    isClaimed: claimedSet.has((p.name || '').toLowerCase()),
  }));

  const setupPlayers = (store.players || []).map((p: Player, idx: number) => ({
    name: p.name,
    seat: idx + 1,
    isClaimed: claimedSet.has((p.name || '').toLowerCase()),
  }));

  return {
    gamePhase: store.gamePhase,
    subPhase: store.subPhase,
    currentDay: store.currentDay,
    livingPlayers: living,
    allPlayers: all.length > 0 ? all : setupPlayers,
    setupPlayers,
    claimedPlayers: Array.from(claimedSet),
    eliminatedPlayer: store.eliminatedPlayer
      ? { name: store.eliminatedPlayer.name, role: store.eliminatedPlayer.role?.name }
      : null,
    drawnLastWordCards: store.drawnLastWordCards || [],
    isGameOver: !!store.isGameOver,
    winner: store.winner || null,
    votingState: store.votingState || {
      stage: 'pre-vote',
      qualifiedDefenders: [],
      threshold: 0,
    },
    activeSpeaker: speakerInfo?.activeSpeaker ?? store.activeSpeaker ?? null,
    speakerTimeRemaining: speakerInfo?.speakerTimeRemaining ?? store.speakerTimeRemaining ?? 0,
    isChallengeActive: speakerInfo?.isChallengeActive ?? store.isChallengeActive ?? false,
  };
}

export function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const PEER_CONFIG = {
  debug: 1,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun.relay.metered.ca:80' },
      {
        urls: 'turn:global.relay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:global.relay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:global.relay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
    ],
  },
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cleanupAllConnections();
  });
}

function cleanupAllConnections() {
  if (webrtcHeartbeatInterval) {
    clearInterval(webrtcHeartbeatInterval);
    webrtcHeartbeatInterval = null;
  }
  if (clientPingInterval) {
    clearInterval(clientPingInterval);
    clientPingInterval = null;
  }
  if (hostPresenceInterval) {
    clearInterval(hostPresenceInterval);
    hostPresenceInterval = null;
  }
  if (hostPeer && !hostPeer.destroyed) {
    hostPeer.destroy();
    hostPeer = null;
  }
  if (clientPeer && !clientPeer.destroyed) {
    clientPeer.destroy();
    clientPeer = null;
  }
  if (hostMqttClient) {
    try {
      hostMqttClient.end(true);
    } catch {
      // ignore
    }
    hostMqttClient = null;
  }
  if (clientMqttClient) {
    try {
      clientMqttClient.end(true);
    } catch {
      // ignore
    }
    clientMqttClient = null;
  }
}

export function useMultiplayer() {
  const isConnected = computed(() => connectionStatus.value === 'connected');

  const setTransportMode = (mode: TransportMode) => {
    if (mode !== 'cloud' && mode !== 'webrtc') return;
    transportMode.value = mode;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mpga_transport_mode', mode);
    }
    // If currently host, restart host with new transport
    if (isHost.value && roomCode.value) {
      startHost(roomCode.value);
    }
  };

  const setRoomPasscode = (code: string) => {
    const trimmed = (code || '').trim();
    roomPasscode.value = trimmed;
    if (typeof localStorage !== 'undefined') {
      if (trimmed) {
        localStorage.setItem('mpga_room_passcode', trimmed);
      } else {
        localStorage.removeItem('mpga_room_passcode');
      }
    }
  };

  const regenerateRoomCode = () => {
    const freshCode = generateRoomCode();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mpga_room_code', freshCode);
    }
    startHost(freshCode);
  };

  const onPlayerAction = (callback: PlayerActionListener): (() => void) => {
    if (typeof callback !== 'function') return () => {};
    playerActionListeners.add(callback);
    return () => {
      playerActionListeners.delete(callback);
    };
  };

  const addPlayerActionListener = (callback: PlayerActionListener) => {
    return onPlayerAction(callback);
  };

  const setOnPlayerAction = (callback: PlayerActionListener) => {
    return onPlayerAction(callback);
  };

  const isPeerConnected = (playerName: string): boolean => {
    if (!playerName) return false;
    const target = playerName.trim().toLowerCase();
    return connectedPeers.value.some(
      (p) => p.playerName && p.playerName.trim().toLowerCase() === target
    );
  };

  const connectedPlayerNames = computed<string[]>(() => {
    return connectedPeers.value.map((p) => (p.playerName || '').trim()).filter(Boolean);
  });

  // --- HOST METHODS ---
  const startHost = (code?: string) => {
    let hostCode = code || '';
    if (!hostCode && typeof localStorage !== 'undefined') {
      hostCode = localStorage.getItem('mpga_room_code') || '';
    }
    if (!hostCode) {
      hostCode = generateRoomCode();
    }

    // If host is already active on this room code and connected, preserve connections
    if (
      isHost.value &&
      roomCode.value === hostCode &&
      connectionStatus.value === 'connected' &&
      ((transportMode.value === 'cloud' && hostMqttClient && hostMqttClient.connected) ||
        (transportMode.value === 'webrtc' && hostPeer && !hostPeer.destroyed))
    ) {
      return;
    }

    cleanupAllConnections();

    roomCode.value = hostCode;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mpga_room_code', hostCode);
    }

    connectionStatus.value = 'connecting';
    isHost.value = true;
    isClient.value = false;
    errorMessage.value = '';
    connectedPeers.value = [];

    if (transportMode.value === 'cloud') {
      startCloudHost(hostCode);
    } else {
      startWebRTCHost(hostCode);
    }
  };

  // 1. CLOUD HOST (MQTT over WSS with multi-broker failover)
  const startCloudHost = (hostCode: string, brokerIndex: number = 0) => {
    if (brokerIndex >= CLOUD_BROKER_URLS.length) {
      console.warn(
        '[MPGA Multiplayer] All Cloud MQTT brokers unreachable. Auto-switching to WebRTC P2P.'
      );
      startWebRTCHost(hostCode);
      return;
    }

    const currentBroker = CLOUD_BROKER_URLS[brokerIndex];
    const topicHost = `mpga/${hostCode.toLowerCase()}/host`;
    const clientId = `mpga_host_${hostCode.toLowerCase()}_${Math.random().toString(16).slice(2, 8)}`;

    let hasConnected = false;
    let failoverTimeout: ReturnType<typeof setTimeout> | null = null;

    try {
      if (hostMqttClient) {
        try {
          hostMqttClient.end(true);
        } catch {
          /* ignore client end error */
        }
        hostMqttClient = null;
      }

      hostMqttClient = mqtt.connect(currentBroker, {
        clientId,
        clean: true,
        reconnectPeriod: 2500,
        connectTimeout: 4000,
      });

      failoverTimeout = setTimeout(() => {
        if (!hasConnected && isHost.value && transportMode.value === 'cloud') {
          console.warn(`[MPGA Multiplayer] Host broker ${currentBroker} timeout, trying next...`);
          try {
            hostMqttClient?.end(true);
          } catch {
            /* ignore client end error */
          }
          startCloudHost(hostCode, brokerIndex + 1);
        }
      }, 4500);

      hostMqttClient.on('connect', () => {
        hasConnected = true;
        if (failoverTimeout) clearTimeout(failoverTimeout);
        connectionStatus.value = 'connected';
        errorMessage.value = '';
        hostMqttClient?.subscribe(topicHost, { qos: 0 });
      });

      hostMqttClient.on('message', (_topic, payload) => {
        try {
          const msg = JSON.parse(payload.toString());
          handleCloudHostIncomingData(hostCode, msg);
        } catch {
          // invalid json payload
        }
      });

      hostMqttClient.on('error', (err: Error) => {
        if (!hasConnected && isHost.value && transportMode.value === 'cloud') {
          if (failoverTimeout) clearTimeout(failoverTimeout);
          try {
            hostMqttClient?.end(true);
          } catch {
            /* ignore client end error */
          }
          startCloudHost(hostCode, brokerIndex + 1);
        } else if (hasConnected) {
          errorMessage.value = err.message || 'Cloud broker error';
          connectionStatus.value = 'error';
        }
      });

      hostMqttClient.on('close', () => {
        if (isHost.value && hasConnected) {
          connectionStatus.value = 'connecting';
        }
      });

      // Presence cleanup: purge clients inactive for > 35s
      if (hostPresenceInterval) clearInterval(hostPresenceInterval);
      hostPresenceInterval = setInterval(() => {
        const now = Date.now();
        const beforeCount = connectedPeers.value.length;
        connectedPeers.value = connectedPeers.value.filter((p) => {
          return !p.lastSeen || now - p.lastSeen < 35000;
        });
        if (connectedPeers.value.length !== beforeCount) {
          dispatchPlayerAction({
            action: 'PEERS_UPDATED',
            connectedPeers: connectedPeers.value,
          });
        }
      }, 5000);
    } catch {
      if (brokerIndex + 1 < CLOUD_BROKER_URLS.length) {
        startCloudHost(hostCode, brokerIndex + 1);
      } else {
        startWebRTCHost(hostCode);
      }
    }
  };

  const handleCloudHostIncomingData = (hostCode: string, data: any) => {
    if (!data || typeof data !== 'object') return;
    const senderId = data.senderId;
    if (!senderId) return;

    // Update peer presence timestamp or register newly connected peer immediately
    const existingIndex = connectedPeers.value.findIndex((p) => p.peerId === senderId);
    const incomingPlayerName = (data.playerName || '').trim();

    if (existingIndex !== -1) {
      const updated: ConnectedPeer = {
        ...connectedPeers.value[existingIndex],
        lastSeen: Date.now(),
      };
      if (incomingPlayerName) {
        updated.playerName = incomingPlayerName;
      }
      connectedPeers.value[existingIndex] = updated;
      connectedPeers.value = [...connectedPeers.value];
    } else {
      connectedPeers.value = [
        ...connectedPeers.value,
        {
          peerId: senderId,
          playerName: incomingPlayerName,
          lastSeen: Date.now(),
        },
      ];
      dispatchPlayerAction({
        action: 'PEER_CONNECTED',
        type: 'PEER_CONNECTED',
        peerId: senderId,
        playerName: incomingPlayerName,
      });
    }

    // Request State / Ping
    if (data.type === 'GET_STATE') {
      const reqName = (data.playerName || '').trim();
      const isClaimedByOther =
        reqName &&
        connectedPeers.value.some(
          (p) =>
            p.peerId !== senderId &&
            p.playerName &&
            p.playerName.trim().toLowerCase() === reqName.toLowerCase()
        );
      if (isClaimedByOther) {
        sendCloudDirect(hostCode, senderId, {
          type: 'LOBBY_ERROR',
          message: 'NAME_ALREADY_CLAIMED',
        });
      }
      dispatchPlayerAction({
        action: 'CLIENT_REQUESTED_STATE',
        type: 'CLIENT_REQUESTED_STATE',
        senderId,
        playerName: isClaimedByOther ? '' : reqName,
      });
      return;
    }

    if (data.type === 'PING') {
      sendCloudDirect(hostCode, senderId, {
        type: 'PONG',
        clientTime: data.clientTime,
      });
      return;
    }

    // Lobby Joining
    if (data.type === 'JOIN_LOBBY') {
      if (roomPasscode.value && data.passcode !== roomPasscode.value) {
        sendCloudDirect(hostCode, senderId, {
          type: 'LOBBY_ERROR',
          message: 'INVALID_PASSCODE',
        });
        return;
      }

      const playerName = (data.playerName || '').trim();
      if (!playerName) {
        sendCloudDirect(hostCode, senderId, {
          type: 'LOBBY_ERROR',
          message: 'INVALID_NAME',
        });
        return;
      }

      const isClaimedByOther = connectedPeers.value.some(
        (p) =>
          p.peerId !== senderId &&
          p.playerName &&
          p.playerName.trim().toLowerCase() === playerName.toLowerCase()
      );
      if (isClaimedByOther) {
        sendCloudDirect(hostCode, senderId, {
          type: 'LOBBY_ERROR',
          message: 'NAME_ALREADY_CLAIMED',
        });
        return;
      }

      const peerIdx = connectedPeers.value.findIndex((p) => p.peerId === senderId);
      if (peerIdx !== -1) {
        connectedPeers.value[peerIdx] = {
          ...connectedPeers.value[peerIdx],
          playerName,
          lastSeen: Date.now(),
        };
        connectedPeers.value = [...connectedPeers.value];
      }

      sendCloudDirect(hostCode, senderId, {
        type: 'LOBBY_JOINED',
        playerName,
        roomCode: hostCode,
      });

      dispatchPlayerAction({
        action: 'JOIN_LOBBY',
        type: 'JOIN_LOBBY',
        playerName,
        peerId: senderId,
      });
      return;
    }

    if (data.type === 'CLAIM_SEAT') {
      const playerName = (data.playerName || '').trim();
      if (!playerName) return;

      const isClaimedByOther = connectedPeers.value.some(
        (p) =>
          p.peerId !== senderId &&
          p.playerName &&
          p.playerName.trim().toLowerCase() === playerName.toLowerCase()
      );
      if (isClaimedByOther) {
        sendCloudDirect(hostCode, senderId, {
          type: 'LOBBY_ERROR',
          message: 'NAME_ALREADY_CLAIMED',
        });
        return;
      }

      const peerIdx = connectedPeers.value.findIndex((p) => p.peerId === senderId);
      if (peerIdx !== -1) {
        connectedPeers.value[peerIdx] = {
          ...connectedPeers.value[peerIdx],
          playerName,
          lastSeen: Date.now(),
        };
        connectedPeers.value = [...connectedPeers.value];
      }

      sendCloudDirect(hostCode, senderId, {
        type: 'LOBBY_JOINED',
        playerName,
        roomCode: hostCode,
      });

      dispatchPlayerAction({
        action: 'CLAIM_SEAT',
        type: 'CLAIM_SEAT',
        playerName,
        peerId: senderId,
      });
      return;
    }

    if (data.type === 'NIGHT_ACTION') {
      const peer = connectedPeers.value.find((p) => p.peerId === senderId);
      const actorName = (data.actorName || '').trim();
      if (!peer || !peer.playerName || peer.playerName.toLowerCase() !== actorName.toLowerCase()) {
        console.warn(
          `[SECURITY] Cloud spoofed NIGHT_ACTION rejected: sender ${senderId} claimed to be ${actorName}`
        );
        return;
      }
      dispatchPlayerAction({
        action: 'NIGHT_ACTION',
        type: 'NIGHT_ACTION',
        actorName: data.actorName,
        actor: data.actorName,
        actorRole: data.actorRole,
        targetPlayerName: data.targetPlayerName,
        target: data.targetPlayerName,
        actionId: data.actionId,
        peerId: senderId,
      });
      return;
    }

    if (data.type === 'CAST_VOTE') {
      const peer = connectedPeers.value.find((p) => p.peerId === senderId);
      const voterName = (data.voterName || '').trim();
      if (!peer || !peer.playerName || peer.playerName.toLowerCase() !== voterName.toLowerCase()) {
        console.warn(
          `[SECURITY] Cloud spoofed CAST_VOTE rejected: sender ${senderId} claimed to be ${voterName}`
        );
        return;
      }
      dispatchPlayerAction({
        action: 'CAST_VOTE',
        type: 'CAST_VOTE',
        voterName: data.voterName,
        candidateName: data.candidateName,
        voteType: data.voteType,
        peerId: senderId,
      });
    }
  };

  const sendCloudDirect = (hostCode: string, targetClientId: string, messageObj: any) => {
    if (hostMqttClient && hostMqttClient.connected) {
      const topic = `mpga/${hostCode.toLowerCase()}/client/${targetClientId}`;
      hostMqttClient.publish(topic, JSON.stringify(messageObj), { qos: 0 });
    }
  };

  // 2. HARDENED WEBRTC HOST
  const startWebRTCHost = (hostCode: string) => {
    const fullPeerId = `mpga-host-${hostCode.toLowerCase()}`;

    try {
      hostPeer = new Peer(fullPeerId, PEER_CONFIG);

      hostPeer.on('open', () => {
        connectionStatus.value = 'connected';
      });

      hostPeer.on('disconnected', () => {
        if (hostPeer && !hostPeer.destroyed) {
          setTimeout(() => {
            if (hostPeer && !hostPeer.destroyed && hostPeer.disconnected) {
              hostPeer.reconnect();
            }
          }, 1500);
        }
      });

      hostPeer.on('connection', (conn: DataConnection) => {
        conn.on('open', () => {
          const existingIdx = connectedPeers.value.findIndex((p) => p.peerId === conn.peer);
          if (existingIdx === -1) {
            connectedPeers.value = [
              ...connectedPeers.value,
              {
                peerId: conn.peer,
                playerName: '',
                conn,
                lastSeen: Date.now(),
              },
            ];
          } else {
            connectedPeers.value[existingIdx] = {
              ...connectedPeers.value[existingIdx],
              conn,
              lastSeen: Date.now(),
            };
            connectedPeers.value = [...connectedPeers.value];
          }

          dispatchPlayerAction({
            action: 'PEER_CONNECTED',
            type: 'PEER_CONNECTED',
            peerId: conn.peer,
          });
        });

        conn.on('data', (data: any) => {
          handleWebRTCHostIncomingData(conn, data);
        });

        conn.on('close', () => {
          connectedPeers.value = connectedPeers.value.filter((p) => p.peerId !== conn.peer);
          dispatchPlayerAction({
            action: 'PEER_DISCONNECTED',
            type: 'PEER_DISCONNECTED',
            peerId: conn.peer,
          });
        });

        conn.on('error', () => {
          connectedPeers.value = connectedPeers.value.filter((p) => p.peerId !== conn.peer);
          dispatchPlayerAction({
            action: 'PEER_DISCONNECTED',
            type: 'PEER_DISCONNECTED',
            peerId: conn.peer,
          });
        });
      });

      hostPeer.on('error', (err: any) => {
        if (err.type === 'unavailable-id') {
          // Keep attempting reconnect on the same ID without resetting code
          setTimeout(() => {
            if (hostPeer && !hostPeer.destroyed && hostPeer.disconnected) {
              hostPeer.reconnect();
            }
          }, 2000);
          return;
        }
        errorMessage.value = err.message || 'Host peer error';
        connectionStatus.value = 'error';
      });

      // DataChannel Keep-Alive Ping (every 3 seconds)
      if (webrtcHeartbeatInterval) clearInterval(webrtcHeartbeatInterval);
      webrtcHeartbeatInterval = setInterval(() => {
        connectedPeers.value.forEach((p) => {
          if (p.conn && p.conn.open) {
            try {
              p.conn.send({ type: 'PING', time: Date.now() });
            } catch {
              // ignore
            }
          }
        });
      }, 3000);
    } catch (e: any) {
      errorMessage.value = e.message;
      connectionStatus.value = 'error';
    }
  };

  const handleWebRTCHostIncomingData = (conn: DataConnection, data: any) => {
    if (!data || typeof data !== 'object') return;

    const existingIdx = connectedPeers.value.findIndex((p) => p.peerId === conn.peer);
    const incomingPlayerName = (data.playerName || '').trim();
    if (existingIdx !== -1) {
      const updated: ConnectedPeer = { ...connectedPeers.value[existingIdx], lastSeen: Date.now() };
      if (incomingPlayerName) {
        updated.playerName = incomingPlayerName;
      }
      connectedPeers.value[existingIdx] = updated;
      connectedPeers.value = [...connectedPeers.value];
    }

    if (data.type === 'GET_STATE') {
      const reqName = (data.playerName || '').trim();
      const isClaimedByOther =
        reqName &&
        connectedPeers.value.some(
          (p) =>
            p.peerId !== conn.peer &&
            p.playerName &&
            p.playerName.trim().toLowerCase() === reqName.toLowerCase()
        );
      if (isClaimedByOther) {
        try {
          conn.send({
            type: 'LOBBY_ERROR',
            message: 'NAME_ALREADY_CLAIMED',
          });
        } catch {
          // ignore
        }
      }
      dispatchPlayerAction({
        action: 'CLIENT_REQUESTED_STATE',
        type: 'CLIENT_REQUESTED_STATE',
        peerId: conn.peer,
        playerName: isClaimedByOther ? '' : reqName,
      });
      return;
    }

    if (data.type === 'PONG') {
      return;
    }

    if (data.type === 'JOIN_LOBBY') {
      if (roomPasscode.value && data.passcode !== roomPasscode.value) {
        try {
          conn.send({
            type: 'LOBBY_ERROR',
            message: 'INVALID_PASSCODE',
          });
        } catch {
          // ignore
        }
        return;
      }

      const playerName = (data.playerName || '').trim();
      if (!playerName) {
        try {
          conn.send({
            type: 'LOBBY_ERROR',
            message: 'INVALID_NAME',
          });
        } catch {
          // ignore
        }
        return;
      }

      const isClaimedByOther = connectedPeers.value.some(
        (p) =>
          p.peerId !== conn.peer &&
          p.playerName &&
          p.playerName.trim().toLowerCase() === playerName.toLowerCase()
      );
      if (isClaimedByOther) {
        try {
          conn.send({
            type: 'LOBBY_ERROR',
            message: 'NAME_ALREADY_CLAIMED',
          });
        } catch {
          // ignore
        }
        return;
      }

      const peerIdx = connectedPeers.value.findIndex((p) => p.peerId === conn.peer);
      if (peerIdx !== -1) {
        connectedPeers.value[peerIdx] = {
          ...connectedPeers.value[peerIdx],
          playerName,
          lastSeen: Date.now(),
        };
        connectedPeers.value = [...connectedPeers.value];
      }

      try {
        conn.send({
          type: 'LOBBY_JOINED',
          playerName,
          roomCode: roomCode.value,
        });
      } catch {
        // ignore
      }

      dispatchPlayerAction({
        action: 'JOIN_LOBBY',
        type: 'JOIN_LOBBY',
        playerName,
        peerId: conn.peer,
      });
      return;
    }

    if (data.type === 'CLAIM_SEAT') {
      const playerName = (data.playerName || '').trim();
      if (!playerName) return;

      const isClaimedByOther = connectedPeers.value.some(
        (p) =>
          p.peerId !== conn.peer &&
          p.playerName &&
          p.playerName.trim().toLowerCase() === playerName.toLowerCase()
      );
      if (isClaimedByOther) {
        try {
          conn.send({
            type: 'LOBBY_ERROR',
            message: 'NAME_ALREADY_CLAIMED',
          });
        } catch {
          // ignore
        }
        return;
      }

      const peerIdx = connectedPeers.value.findIndex((p) => p.peerId === conn.peer);
      if (peerIdx !== -1) {
        connectedPeers.value[peerIdx] = {
          ...connectedPeers.value[peerIdx],
          playerName,
          lastSeen: Date.now(),
        };
        connectedPeers.value = [...connectedPeers.value];
      }

      try {
        conn.send({
          type: 'LOBBY_JOINED',
          playerName,
          roomCode: roomCode.value,
        });
      } catch {
        // ignore
      }

      dispatchPlayerAction({
        action: 'CLAIM_SEAT',
        type: 'CLAIM_SEAT',
        playerName,
        peerId: conn.peer,
      });
      return;
    }

    if (data.type === 'NIGHT_ACTION') {
      const peer = connectedPeers.value.find((p) => p.peerId === conn.peer);
      const actorName = (data.actorName || '').trim();
      if (!peer || !peer.playerName || peer.playerName.toLowerCase() !== actorName.toLowerCase()) {
        console.warn(
          `[SECURITY] WebRTC spoofed NIGHT_ACTION rejected: peer ${conn.peer} claimed to be ${actorName}`
        );
        return;
      }
      dispatchPlayerAction({
        action: 'NIGHT_ACTION',
        type: 'NIGHT_ACTION',
        actorName: data.actorName,
        actor: data.actorName,
        actorRole: data.actorRole,
        targetPlayerName: data.targetPlayerName,
        target: data.targetPlayerName,
        actionId: data.actionId,
        peerId: conn.peer,
      });
      return;
    }

    if (data.type === 'CAST_VOTE') {
      const peer = connectedPeers.value.find((p) => p.peerId === conn.peer);
      const voterName = (data.voterName || '').trim();
      if (!peer || !peer.playerName || peer.playerName.toLowerCase() !== voterName.toLowerCase()) {
        console.warn(
          `[SECURITY] WebRTC spoofed CAST_VOTE rejected: peer ${conn.peer} claimed to be ${voterName}`
        );
        return;
      }
      dispatchPlayerAction({
        action: 'CAST_VOTE',
        type: 'CAST_VOTE',
        voterName: data.voterName,
        candidateName: data.candidateName,
        voteType: data.voteType,
        peerId: conn.peer,
      });
    }
  };

  // Broadcast state to all connected devices
  const broadcastHostState = async (
    store: any,
    speakerInfo?: {
      activeSpeaker?: string | null;
      speakerTimeRemaining?: number;
      isChallengeActive?: boolean;
    }
  ) => {
    if (!store) return;
    const isGameLive = store.gamePhase === 'playing';
    const claimedPlayerNames = connectedPeers.value
      .map((p) => p.playerName)
      .filter((n): n is string => Boolean(n && n.trim()));

    const publicState = sanitizePublicGameState(store, claimedPlayerNames, speakerInfo);
    const rawPlayers: Player[] =
      store.livePlayers && store.livePlayers.length > 0 ? store.livePlayers : store.players || [];

    const secret = `${roomCode.value}:${roomPasscode.value || ''}`;

    if (transportMode.value === 'cloud') {
      if (hostMqttClient && hostMqttClient.connected) {
        const topicPublic = `mpga/${roomCode.value.toLowerCase()}/public`;
        hostMqttClient.publish(topicPublic, JSON.stringify(publicState), { qos: 0 });

        for (const p of connectedPeers.value) {
          const rawPlayer = rawPlayers.find(
            (rp) => rp.name && p.playerName && rp.name.toLowerCase() === p.playerName.toLowerCase()
          );
          const privateIdentity = rawPlayer ? sanitizePlayerPayload(rawPlayer, isGameLive) : null;
          let playerPayload: any = privateIdentity;
          if (privateIdentity) {
            try {
              playerPayload = await encryptPayload(privateIdentity, secret);
            } catch {
              playerPayload = privateIdentity;
            }
          }
          sendCloudDirect(roomCode.value, p.peerId, {
            type: 'STATE_UPDATE',
            player: playerPayload,
            public: publicState,
          });
        }
      }
    } else {
      for (const p of connectedPeers.value) {
        if (!p.conn || !p.conn.open) continue;
        const rawPlayer = rawPlayers.find(
          (rp) => rp.name && p.playerName && rp.name.toLowerCase() === p.playerName.toLowerCase()
        );
        const privateIdentity = rawPlayer ? sanitizePlayerPayload(rawPlayer, isGameLive) : null;
        let playerPayload: any = privateIdentity;
        if (privateIdentity) {
          try {
            playerPayload = await encryptPayload(privateIdentity, secret);
          } catch {
            playerPayload = privateIdentity;
          }
        }
        try {
          p.conn.send({
            type: 'STATE_UPDATE',
            player: playerPayload,
            public: publicState,
          });
        } catch {
          // Send error catch
        }
      }
    }
  };

  // --- CLIENT (PLAYER) METHODS ---
  const joinRoom = (
    targetRoomCode: string,
    preferredPlayerName: string = '',
    passcode: string = '',
    targetTransport: string = ''
  ) => {
    cleanupAllConnections();

    if (targetTransport && (targetTransport === 'cloud' || targetTransport === 'webrtc')) {
      transportMode.value = targetTransport as TransportMode;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mpga_transport_mode', targetTransport);
      }
    }

    const cleanCode = targetRoomCode.trim().toLowerCase();
    roomCode.value = cleanCode.toUpperCase();

    isHost.value = false;
    isClient.value = true;
    connectionStatus.value = 'connecting';
    errorMessage.value = '';

    if (transportMode.value === 'cloud') {
      joinCloudRoom(cleanCode, preferredPlayerName, passcode);
    } else {
      joinWebRTCRoom(cleanCode, preferredPlayerName, passcode);
    }
  };

  // 1. CLOUD CLIENT (MQTT over WSS with multi-broker failover)
  const joinCloudRoom = (
    cleanCode: string,
    preferredPlayerName: string,
    passcode: string,
    brokerIndex: number = 0
  ) => {
    if (brokerIndex >= CLOUD_BROKER_URLS.length) {
      console.warn(
        '[MPGA Multiplayer] All Cloud MQTT brokers unreachable. Auto-switching to WebRTC P2P.'
      );
      joinWebRTCRoom(cleanCode, preferredPlayerName, passcode);
      return;
    }

    const currentBroker = CLOUD_BROKER_URLS[brokerIndex];
    clientMqttId = `mpga_c_${Math.random().toString(16).slice(2, 10)}`;
    const topicPublic = `mpga/${cleanCode}/public`;
    const topicDirect = `mpga/${cleanCode}/client/${clientMqttId}`;
    const topicHost = `mpga/${cleanCode}/host`;

    let hasConnected = false;
    let failoverTimeout: ReturnType<typeof setTimeout> | null = null;

    try {
      if (clientMqttClient) {
        try {
          clientMqttClient.end(true);
        } catch {
          /* ignore client end error */
        }
        clientMqttClient = null;
      }

      clientMqttClient = mqtt.connect(currentBroker, {
        clientId: clientMqttId,
        clean: true,
        reconnectPeriod: 2000,
        connectTimeout: 4000,
      });

      failoverTimeout = setTimeout(() => {
        if (!hasConnected && isClient.value && transportMode.value === 'cloud') {
          console.warn(`[MPGA Multiplayer] Client broker ${currentBroker} timeout, trying next...`);
          try {
            clientMqttClient?.end(true);
          } catch {
            /* ignore client end error */
          }
          joinCloudRoom(cleanCode, preferredPlayerName, passcode, brokerIndex + 1);
        }
      }, 4500);

      clientMqttClient.on('connect', () => {
        hasConnected = true;
        if (failoverTimeout) clearTimeout(failoverTimeout);
        connectionStatus.value = 'connected';
        errorMessage.value = '';

        clientMqttClient?.subscribe(topicPublic, { qos: 0 });
        clientMqttClient?.subscribe(topicDirect, { qos: 0 });

        // Request initial state from host
        clientMqttClient?.publish(
          topicHost,
          JSON.stringify({
            type: 'GET_STATE',
            senderId: clientMqttId,
            playerName: preferredPlayerName || clientPlayerName.value,
          }),
          { qos: 0 }
        );

        if (preferredPlayerName) {
          joinLobby(preferredPlayerName, passcode);
        }

        // Start ping heartbeat
        if (clientPingInterval) clearInterval(clientPingInterval);
        clientPingInterval = setInterval(() => {
          if (clientMqttClient && clientMqttClient.connected) {
            clientMqttClient.publish(
              topicHost,
              JSON.stringify({
                type: 'PING',
                senderId: clientMqttId,
                playerName: clientPlayerName.value,
                clientTime: Date.now(),
              }),
              { qos: 0 }
            );
          }
        }, 3500);
      });

      clientMqttClient.on('message', (topic, payload) => {
        try {
          const data = JSON.parse(payload.toString());
          if (topic === topicPublic) {
            clientPublicState.value = data;
            if (data.setupPlayers) lobbyPlayers.value = data.setupPlayers;
            if (data.gamePhase === 'playing' && clientPlayerIdentity.value) {
              isInLobby.value = false;
            }
          } else if (topic === topicDirect) {
            if (data.type === 'PONG' && data.clientTime) {
              pingLatency.value = Date.now() - data.clientTime;
            } else if (data.type === 'STATE_UPDATE') {
              const applyState = (playerIdentity: any) => {
                clientPlayerIdentity.value = playerIdentity;
                clientPublicState.value = data.public;
                if (data.public?.setupPlayers) lobbyPlayers.value = data.public.setupPlayers;
                if (data.public?.gamePhase === 'playing' && playerIdentity) {
                  isInLobby.value = false;
                }
              };

              if (isEncryptedMessage(data.player)) {
                const secret = `${roomCode.value}:${roomPasscode.value || ''}`;
                decryptPayload(data.player, secret)
                  .then((decrypted) => {
                    applyState(decrypted);
                  })
                  .catch((err) => {
                    console.error('[SECURITY] Failed to decrypt player payload:', err);
                    applyState(null);
                  });
              } else {
                applyState(data.player);
              }
            } else if (data.type === 'LOBBY_JOINED') {
              isInLobby.value = true;
              clientPlayerName.value = data.playerName;
              errorMessage.value = '';
            } else if (data.type === 'LOBBY_ERROR') {
              if (data.message === 'INVALID_PASSCODE') {
                errorMessage.value = 'WRONG_PASSCODE';
              } else {
                errorMessage.value = data.message || 'Lobby error';
              }
            }
          }
        } catch {
          // ignore
        }
      });

      clientMqttClient.on('error', (err: Error) => {
        if (!hasConnected && isClient.value && transportMode.value === 'cloud') {
          if (failoverTimeout) clearTimeout(failoverTimeout);
          try {
            clientMqttClient?.end(true);
          } catch {
            /* ignore client end error */
          }
          joinCloudRoom(cleanCode, preferredPlayerName, passcode, brokerIndex + 1);
        } else if (hasConnected) {
          connectionStatus.value = 'error';
          errorMessage.value = err.message || 'Connection error';
        }
      });

      clientMqttClient.on('close', () => {
        if (isClient.value && connectionStatus.value === 'connected') {
          connectionStatus.value = 'connecting';
        }
      });
    } catch {
      if (brokerIndex + 1 < CLOUD_BROKER_URLS.length) {
        joinCloudRoom(cleanCode, preferredPlayerName, passcode, brokerIndex + 1);
      } else {
        joinWebRTCRoom(cleanCode, preferredPlayerName, passcode);
      }
    }
  };

  // 2. HARDENED WEBRTC CLIENT
  const joinWebRTCRoom = (cleanCode: string, preferredPlayerName: string, passcode: string) => {
    const targetHostPeerId = `mpga-host-${cleanCode}`;

    let connectTimeout: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      if (connectionStatus.value === 'connecting') {
        connectionStatus.value = 'error';
        errorMessage.value =
          'Connecting timed out. Please check that the host room code is active on the moderator screen.';
      }
    }, 12000);

    try {
      clientPeer = new Peer(PEER_CONFIG);

      clientPeer.on('open', () => {
        clientConn = clientPeer!.connect(targetHostPeerId, { reliable: true });

        clientConn.on('open', () => {
          if (connectTimeout) clearTimeout(connectTimeout);
          connectionStatus.value = 'connected';
          try {
            clientConn?.send({
              type: 'GET_STATE',
              playerName: preferredPlayerName || clientPlayerName.value,
            });
          } catch {
            // ignore
          }
          if (preferredPlayerName) {
            joinLobby(preferredPlayerName, passcode);
          }
        });

        clientConn.on('data', (data: any) => {
          if (data && data.type === 'PING') {
            try {
              clientConn?.send({ type: 'PONG', time: data.time });
            } catch {
              // ignore
            }
            if (data.time) {
              pingLatency.value = Date.now() - data.time;
            }
          } else if (data && data.type === 'STATE_UPDATE') {
            const applyState = (playerIdentity: any) => {
              clientPlayerIdentity.value = playerIdentity;
              clientPublicState.value = data.public;
              if (data.public?.setupPlayers) {
                lobbyPlayers.value = data.public.setupPlayers;
              }
              if (data.public?.gamePhase === 'playing' && playerIdentity) {
                isInLobby.value = false;
              }
            };

            if (isEncryptedMessage(data.player)) {
              const secret = `${roomCode.value}:${roomPasscode.value || ''}`;
              decryptPayload(data.player, secret)
                .then((decrypted) => {
                  applyState(decrypted);
                })
                .catch((err) => {
                  console.error('[SECURITY] Failed to decrypt WebRTC player payload:', err);
                  applyState(null);
                });
            } else {
              applyState(data.player);
            }
          } else if (data && data.type === 'LOBBY_JOINED') {
            isInLobby.value = true;
            clientPlayerName.value = data.playerName;
            errorMessage.value = '';
          } else if (data && data.type === 'LOBBY_ERROR') {
            if (data.message === 'INVALID_PASSCODE') {
              errorMessage.value = 'WRONG_PASSCODE';
            } else {
              errorMessage.value = data.message || 'Lobby error';
            }
          }
        });

        clientConn.on('close', () => {
          if (connectTimeout) clearTimeout(connectTimeout);
          connectionStatus.value = 'disconnected';
          errorMessage.value = 'Disconnected from host room.';
          isInLobby.value = false;
        });

        clientConn.on('error', (err: any) => {
          if (connectTimeout) clearTimeout(connectTimeout);
          connectionStatus.value = 'error';
          errorMessage.value = err.message || 'Connection error with host';
        });
      });

      clientPeer.on('disconnected', () => {
        if (clientPeer && !clientPeer.destroyed) {
          clientPeer.reconnect();
        }
      });

      clientPeer.on('error', (err: any) => {
        if (connectTimeout) clearTimeout(connectTimeout);
        connectionStatus.value = 'error';
        errorMessage.value =
          err.type === 'peer-unavailable'
            ? `Room '${cleanCode.toUpperCase()}' not found on server. Please check the moderator screen code.`
            : err.message;
      });
    } catch (e: any) {
      if (connectTimeout) clearTimeout(connectTimeout);
      connectionStatus.value = 'error';
      errorMessage.value = e.message;
    }
  };

  const joinLobby = (playerName: string, passcode: string = '') => {
    const trimmed = (playerName || '').trim();
    if (!trimmed) return;
    clientPlayerName.value = trimmed;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mpga_player_name', trimmed);
    }

    if (transportMode.value === 'cloud') {
      if (clientMqttClient && clientMqttClient.connected) {
        clientMqttClient.publish(
          `mpga/${roomCode.value.toLowerCase()}/host`,
          JSON.stringify({
            type: 'JOIN_LOBBY',
            senderId: clientMqttId,
            playerName: trimmed,
            passcode,
          }),
          { qos: 0 }
        );
      }
    } else {
      if (clientConn && clientConn.open) {
        clientConn.send({
          type: 'JOIN_LOBBY',
          playerName: trimmed,
          passcode,
        });
      }
    }
  };

  const claimSeat = (playerName: string) => {
    clientPlayerName.value = playerName;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mpga_player_name', playerName);
    }

    if (transportMode.value === 'cloud') {
      if (clientMqttClient && clientMqttClient.connected) {
        clientMqttClient.publish(
          `mpga/${roomCode.value.toLowerCase()}/host`,
          JSON.stringify({
            type: 'CLAIM_SEAT',
            senderId: clientMqttId,
            playerName,
          }),
          { qos: 0 }
        );
      }
    } else {
      if (clientConn && clientConn.open) {
        clientConn.send({
          type: 'CLAIM_SEAT',
          playerName,
        });
      }
    }
  };

  const sendNightAction = (targetPlayerName: string, actionId: string | null = null) => {
    if (!clientPlayerIdentity.value) return;

    if (transportMode.value === 'cloud') {
      if (clientMqttClient && clientMqttClient.connected) {
        clientMqttClient.publish(
          `mpga/${roomCode.value.toLowerCase()}/host`,
          JSON.stringify({
            type: 'NIGHT_ACTION',
            senderId: clientMqttId,
            actorName: clientPlayerIdentity.value.name,
            actorRole: clientPlayerIdentity.value.role?.name,
            targetPlayerName,
            actionId,
          }),
          { qos: 0 }
        );
      }
    } else {
      if (clientConn && clientConn.open) {
        clientConn.send({
          type: 'NIGHT_ACTION',
          actorName: clientPlayerIdentity.value.name,
          actorRole: clientPlayerIdentity.value.role?.name,
          targetPlayerName,
          actionId,
        });
      }
    }
  };

  const sendVote = (candidateName: string, voteType: string = 'pre') => {
    if (!clientPlayerIdentity.value) return;

    if (transportMode.value === 'cloud') {
      if (clientMqttClient && clientMqttClient.connected) {
        clientMqttClient.publish(
          `mpga/${roomCode.value.toLowerCase()}/host`,
          JSON.stringify({
            type: 'CAST_VOTE',
            senderId: clientMqttId,
            voterName: clientPlayerIdentity.value.name,
            candidateName,
            voteType,
          }),
          { qos: 0 }
        );
      }
    } else {
      if (clientConn && clientConn.open) {
        clientConn.send({
          type: 'CAST_VOTE',
          voterName: clientPlayerIdentity.value.name,
          candidateName,
          voteType,
        });
      }
    }
  };

  const reconnectClient = () => {
    if (!isClient.value || !roomCode.value) return;
    const name =
      clientPlayerName.value ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('mpga_player_name') || '' : '');
    const code = roomCode.value;
    const passcode =
      roomPasscode.value ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('mpga_room_passcode') || '' : '');
    joinRoom(code, name, passcode, transportMode.value);
  };

  const disconnect = () => {
    cleanupAllConnections();
    connectionStatus.value = 'disconnected';
    connectedPeers.value = [];
    isHost.value = false;
    isClient.value = false;
    isInLobby.value = false;
    lobbyPlayers.value = [];
    clientPlayerIdentity.value = null;
    pingLatency.value = null;
  };

  return {
    transportMode,
    pingLatency,
    isHost,
    isClient,
    roomCode,
    roomPasscode,
    connectionStatus,
    errorMessage,
    connectedPeers,
    clientPlayerName,
    clientPlayerIdentity,
    clientPublicState,
    isInLobby,
    lobbyPlayers,
    isConnected,
    isPeerConnected,
    connectedPlayerNames,
    setTransportMode,
    startHost,
    setRoomPasscode,
    regenerateRoomCode,
    broadcastHostState,
    onPlayerAction,
    addPlayerActionListener,
    setOnPlayerAction,
    joinRoom,
    joinLobby,
    claimSeat,
    sendNightAction,
    sendVote,
    reconnectClient,
    disconnect,
  };
}
