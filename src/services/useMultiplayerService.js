import { ref, computed } from 'vue';
import Peer from 'peerjs';
import mqtt from 'mqtt';

// Transport Modes: 'cloud' (MQTT over WSS - ultra-stable) or 'webrtc' (P2P direct)
const transportMode = ref(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('mpga_transport_mode') || 'cloud'
    : 'cloud'
);

// Reactive Singleton State
const isHost = ref(false);
const isClient = ref(false);
const roomCode = ref('');
const connectionStatus = ref('disconnected'); // 'disconnected', 'connecting', 'connected', 'error'
const errorMessage = ref('');
const pingLatency = ref(null);

// Host State
let hostPeer = null;
let hostMqttClient = null;
const connectedPeers = ref([]); // [{ peerId, playerName, conn, lastSeen }]
const roomPasscode = ref(
  typeof localStorage !== 'undefined' ? localStorage.getItem('mpga_room_passcode') || '' : ''
);

// Client State
let clientPeer = null;
let clientConn = null;
let clientMqttClient = null;
let clientMqttId = '';
const clientPlayerName = ref(
  typeof localStorage !== 'undefined' ? localStorage.getItem('mpga_player_name') || '' : ''
);
const clientPlayerIdentity = ref(null); // { name, role, isDead, isSilenced, warnings }
const clientPublicState = ref(null); // { gamePhase, subPhase, currentDay, livingPlayers, allPlayers, setupPlayers, isGameOver, winner }
const isInLobby = ref(false);
const lobbyPlayers = ref([]);

// Event callbacks (for host to hook into store)
let onPlayerActionCallback = null;

// Keep-alive timers
let webrtcHeartbeatInterval = null;
let clientPingInterval = null;
let hostPresenceInterval = null;

// MQTT Broker Configuration (Public High-Availability WSS Brokers)
const CLOUD_BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';

export function sanitizePlayerPayload(player) {
  if (!player) return null;
  return {
    name: player.name,
    role: player.role
      ? {
          id: player.role.id,
          name: player.role.name,
          sideId: player.role.sideId,
          description: player.role.description,
          abilities: player.role.abilities,
        }
      : null,
    isDead: !!player.isDead,
    isSilenced: !!player.isSilenced,
    warnings: player.warnings || 0,
  };
}

export function sanitizePublicGameState(store) {
  if (!store) return {};
  const living = (store.livePlayers || [])
    .filter((p) => !p.isDead)
    .map((p, idx) => ({ name: p.name, seat: idx + 1 }));

  const all = (store.livePlayers || []).map((p, idx) => ({
    name: p.name,
    seat: idx + 1,
    isDead: !!p.isDead,
    isSilenced: !!p.isSilenced,
  }));

  const setupPlayers = (store.players || []).map((p, idx) => ({
    name: p.name,
    seat: idx + 1,
  }));

  return {
    gamePhase: store.gamePhase,
    subPhase: store.subPhase,
    currentDay: store.currentDay,
    livingPlayers: living,
    allPlayers: all.length > 0 ? all : setupPlayers,
    setupPlayers: setupPlayers,
    eliminatedPlayer: store.eliminatedPlayer
      ? { name: store.eliminatedPlayer.name, role: store.eliminatedPlayer.role?.name }
      : null,
    drawnLastWordCards: store.drawnLastWordCards || [],
    isGameOver: !!store.isGameOver,
    winner: store.winner || null,
  };
}

export function generateRoomCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
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

  const setTransportMode = (mode) => {
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

  const setRoomPasscode = (code) => {
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

  const setOnPlayerAction = (callback) => {
    onPlayerActionCallback = callback;
  };

  // --- HOST METHODS ---
  const startHost = (code) => {
    cleanupAllConnections();

    let hostCode = code;
    if (!hostCode && typeof localStorage !== 'undefined') {
      hostCode = localStorage.getItem('mpga_room_code') || '';
    }
    if (!hostCode) {
      hostCode = generateRoomCode();
    }

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

  // 1. CLOUD HOST (MQTT over WSS)
  const startCloudHost = (hostCode) => {
    const topicHost = `mpga/${hostCode.toLowerCase()}/host`;
    const clientId = `mpga_host_${hostCode.toLowerCase()}_${Math.random().toString(16).slice(2, 8)}`;

    try {
      hostMqttClient = mqtt.connect(CLOUD_BROKER_URL, {
        clientId,
        clean: true,
        reconnectPeriod: 2500,
        connectTimeout: 8000,
      });

      hostMqttClient.on('connect', () => {
        connectionStatus.value = 'connected';
        hostMqttClient.subscribe(topicHost, { qos: 0 });
      });

      hostMqttClient.on('message', (topic, payload) => {
        try {
          const msg = JSON.parse(payload.toString());
          handleCloudHostIncomingData(hostCode, msg);
        } catch {
          // invalid json payload
        }
      });

      hostMqttClient.on('error', (err) => {
        errorMessage.value = err.message || 'Cloud broker error';
        connectionStatus.value = 'error';
      });

      hostMqttClient.on('close', () => {
        if (isHost.value) {
          connectionStatus.value = 'connecting';
        }
      });

      // Presence cleanup: purge clients inactive for > 30s
      if (hostPresenceInterval) clearInterval(hostPresenceInterval);
      hostPresenceInterval = setInterval(() => {
        const now = Date.now();
        connectedPeers.value = connectedPeers.value.filter((p) => {
          return !p.lastSeen || now - p.lastSeen < 30000;
        });
      }, 8000);
    } catch (e) {
      errorMessage.value = e.message;
      connectionStatus.value = 'error';
    }
  };

  const handleCloudHostIncomingData = (hostCode, data) => {
    if (!data || typeof data !== 'object') return;
    const senderId = data.senderId;
    if (!senderId) return;

    // Update peer presence timestamp
    const existing = connectedPeers.value.find((p) => p.peerId === senderId);
    if (existing) {
      existing.lastSeen = Date.now();
      if (data.playerName) existing.playerName = data.playerName;
    }

    // Request State / Ping
    if (data.type === 'GET_STATE') {
      if (onPlayerActionCallback) {
        onPlayerActionCallback({
          action: 'CLIENT_REQUESTED_STATE',
          senderId,
          playerName: data.playerName,
        });
      }
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

      if (!existing) {
        connectedPeers.value.push({
          peerId: senderId,
          playerName,
          lastSeen: Date.now(),
        });
      } else {
        existing.playerName = playerName;
      }

      sendCloudDirect(hostCode, senderId, {
        type: 'LOBBY_JOINED',
        playerName,
        roomCode: hostCode,
      });

      if (onPlayerActionCallback) {
        onPlayerActionCallback({
          action: 'JOIN_LOBBY',
          playerName,
          peerId: senderId,
        });
      }
      return;
    }

    if (data.type === 'CLAIM_SEAT') {
      if (existing) {
        existing.playerName = data.playerName;
      }
      if (onPlayerActionCallback) {
        onPlayerActionCallback({
          action: 'CLAIM_SEAT',
          playerName: data.playerName,
          peerId: senderId,
        });
      }
      return;
    }

    if (data.type === 'NIGHT_ACTION') {
      if (onPlayerActionCallback) {
        onPlayerActionCallback({
          action: 'NIGHT_ACTION',
          actorName: data.actorName,
          actorRole: data.actorRole,
          targetPlayerName: data.targetPlayerName,
          peerId: senderId,
        });
      }
      return;
    }

    if (data.type === 'CAST_VOTE') {
      if (onPlayerActionCallback) {
        onPlayerActionCallback({
          action: 'CAST_VOTE',
          voterName: data.voterName,
          candidateName: data.candidateName,
          voteType: data.voteType,
          peerId: senderId,
        });
      }
    }
  };

  const sendCloudDirect = (hostCode, targetClientId, messageObj) => {
    if (hostMqttClient && hostMqttClient.connected) {
      const topic = `mpga/${hostCode.toLowerCase()}/client/${targetClientId}`;
      hostMqttClient.publish(topic, JSON.stringify(messageObj), { qos: 0 });
    }
  };

  // 2. HARDENED WEBRTC HOST
  const startWebRTCHost = (hostCode) => {
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

      hostPeer.on('connection', (conn) => {
        conn.on('open', () => {
          connectedPeers.value.push({
            peerId: conn.peer,
            playerName: '',
            conn,
            lastSeen: Date.now(),
          });

          if (onPlayerActionCallback) {
            onPlayerActionCallback({
              action: 'PEER_CONNECTED',
              peerId: conn.peer,
            });
          }
        });

        conn.on('data', (data) => {
          handleWebRTCHostIncomingData(conn, data);
        });

        conn.on('close', () => {
          connectedPeers.value = connectedPeers.value.filter((p) => p.peerId !== conn.peer);
        });

        conn.on('error', () => {
          connectedPeers.value = connectedPeers.value.filter((p) => p.peerId !== conn.peer);
        });
      });

      hostPeer.on('error', (err) => {
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
    } catch (e) {
      errorMessage.value = e.message;
      connectionStatus.value = 'error';
    }
  };

  const handleWebRTCHostIncomingData = (conn, data) => {
    if (data.type === 'GET_STATE') {
      if (onPlayerActionCallback) {
        onPlayerActionCallback({
          action: 'CLIENT_REQUESTED_STATE',
          peerId: conn.peer,
          playerName: data.playerName,
        });
      }
      return;
    }

    if (data.type === 'PONG') {
      const p = connectedPeers.value.find((peer) => peer.peerId === conn.peer);
      if (p) p.lastSeen = Date.now();
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

      const peerEntry = connectedPeers.value.find((p) => p.peerId === conn.peer);
      if (peerEntry) {
        peerEntry.playerName = playerName;
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

      if (onPlayerActionCallback) {
        onPlayerActionCallback({
          action: 'JOIN_LOBBY',
          playerName,
          peerId: conn.peer,
        });
      }
      return;
    }

    if (data.type === 'CLAIM_SEAT') {
      const peerEntry = connectedPeers.value.find((p) => p.peerId === conn.peer);
      if (peerEntry) {
        peerEntry.playerName = data.playerName;
      }
      if (onPlayerActionCallback) {
        onPlayerActionCallback({
          action: 'CLAIM_SEAT',
          playerName: data.playerName,
          peerId: conn.peer,
        });
      }
      return;
    }

    if (data.type === 'NIGHT_ACTION') {
      if (onPlayerActionCallback) {
        onPlayerActionCallback({
          action: 'NIGHT_ACTION',
          actorName: data.actorName,
          actorRole: data.actorRole,
          targetPlayerName: data.targetPlayerName,
          peerId: conn.peer,
        });
      }
      return;
    }

    if (data.type === 'CAST_VOTE') {
      if (onPlayerActionCallback) {
        onPlayerActionCallback({
          action: 'CAST_VOTE',
          voterName: data.voterName,
          candidateName: data.candidateName,
          voteType: data.voteType,
          peerId: conn.peer,
        });
      }
    }
  };

  // Broadcast state to all connected devices
  const broadcastHostState = (store) => {
    if (!store) return;
    const publicState = sanitizePublicGameState(store);
    const rawPlayers = store.livePlayers && store.livePlayers.length > 0 ? store.livePlayers : store.players || [];

    if (transportMode.value === 'cloud') {
      if (hostMqttClient && hostMqttClient.connected) {
        const topicPublic = `mpga/${roomCode.value.toLowerCase()}/public`;
        hostMqttClient.publish(topicPublic, JSON.stringify(publicState), { qos: 0 });

        connectedPeers.value.forEach((p) => {
          const rawPlayer = rawPlayers.find((rp) => rp.name === p.playerName);
          const privateIdentity = rawPlayer ? sanitizePlayerPayload(rawPlayer) : null;
          sendCloudDirect(roomCode.value, p.peerId, {
            type: 'STATE_UPDATE',
            player: privateIdentity,
            public: publicState,
          });
        });
      }
    } else {
      connectedPeers.value.forEach((p) => {
        if (!p.conn || !p.conn.open) return;
        const rawPlayer = rawPlayers.find((rp) => rp.name === p.playerName);
        const privateIdentity = rawPlayer ? sanitizePlayerPayload(rawPlayer) : null;

        try {
          p.conn.send({
            type: 'STATE_UPDATE',
            player: privateIdentity,
            public: publicState,
          });
        } catch {
          // Send error catch
        }
      });
    }
  };

  // --- CLIENT (PLAYER) METHODS ---
  const joinRoom = (targetRoomCode, preferredPlayerName = '', passcode = '', targetTransport = '') => {
    cleanupAllConnections();

    if (targetTransport && (targetTransport === 'cloud' || targetTransport === 'webrtc')) {
      transportMode.value = targetTransport;
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

  // 1. CLOUD CLIENT (MQTT over WSS)
  const joinCloudRoom = (cleanCode, preferredPlayerName, passcode) => {
    clientMqttId = `mpga_c_${Math.random().toString(16).slice(2, 10)}`;
    const topicPublic = `mpga/${cleanCode}/public`;
    const topicDirect = `mpga/${cleanCode}/client/${clientMqttId}`;
    const topicHost = `mpga/${cleanCode}/host`;

    try {
      clientMqttClient = mqtt.connect(CLOUD_BROKER_URL, {
        clientId: clientMqttId,
        clean: true,
        reconnectPeriod: 2000,
        connectTimeout: 8000,
      });

      let connectTimeout = setTimeout(() => {
        if (connectionStatus.value === 'connecting') {
          connectionStatus.value = 'error';
          errorMessage.value = 'Connecting timed out. Please verify the room code and try again.';
        }
      }, 10000);

      clientMqttClient.on('connect', () => {
        clearTimeout(connectTimeout);
        connectionStatus.value = 'connected';
        errorMessage.value = '';

        clientMqttClient.subscribe(topicPublic, { qos: 0 });
        clientMqttClient.subscribe(topicDirect, { qos: 0 });

        // Request initial state from host
        clientMqttClient.publish(
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
              clientPlayerIdentity.value = data.player;
              clientPublicState.value = data.public;
              if (data.public?.setupPlayers) lobbyPlayers.value = data.public.setupPlayers;
              if (data.public?.gamePhase === 'playing' && data.player) {
                isInLobby.value = false;
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

      clientMqttClient.on('error', (err) => {
        clearTimeout(connectTimeout);
        connectionStatus.value = 'error';
        errorMessage.value = err.message || 'Connection error';
      });

      clientMqttClient.on('close', () => {
        if (isClient.value && connectionStatus.value === 'connected') {
          connectionStatus.value = 'connecting';
        }
      });
    } catch (e) {
      errorMessage.value = e.message;
      connectionStatus.value = 'error';
    }
  };

  // 2. HARDENED WEBRTC CLIENT
  const joinWebRTCRoom = (cleanCode, preferredPlayerName, passcode) => {
    const targetHostPeerId = `mpga-host-${cleanCode}`;

    let connectTimeout = setTimeout(() => {
      if (connectionStatus.value === 'connecting') {
        connectionStatus.value = 'error';
        errorMessage.value =
          'Connecting timed out. Please check that the host room code is active on the moderator screen.';
      }
    }, 12000);

    try {
      clientPeer = new Peer(PEER_CONFIG);

      clientPeer.on('open', () => {
        clientConn = clientPeer.connect(targetHostPeerId, { reliable: true });

        clientConn.on('open', () => {
          clearTimeout(connectTimeout);
          connectionStatus.value = 'connected';
          try {
            clientConn.send({
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

        clientConn.on('data', (data) => {
          if (data && data.type === 'PING') {
            try {
              clientConn.send({ type: 'PONG', time: data.time });
            } catch {
              // ignore
            }
            if (data.time) {
              pingLatency.value = Date.now() - data.time;
            }
          } else if (data && data.type === 'STATE_UPDATE') {
            clientPlayerIdentity.value = data.player;
            clientPublicState.value = data.public;
            if (data.public?.setupPlayers) {
              lobbyPlayers.value = data.public.setupPlayers;
            }
            if (data.public?.gamePhase === 'playing' && data.player) {
              isInLobby.value = false;
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
          clearTimeout(connectTimeout);
          connectionStatus.value = 'disconnected';
          errorMessage.value = 'Disconnected from host room.';
          isInLobby.value = false;
        });

        clientConn.on('error', (err) => {
          clearTimeout(connectTimeout);
          connectionStatus.value = 'error';
          errorMessage.value = err.message || 'Connection error with host';
        });
      });

      clientPeer.on('disconnected', () => {
        if (clientPeer && !clientPeer.destroyed) {
          clientPeer.reconnect();
        }
      });

      clientPeer.on('error', (err) => {
        clearTimeout(connectTimeout);
        connectionStatus.value = 'error';
        errorMessage.value =
          err.type === 'peer-unavailable'
            ? `Room '${cleanCode.toUpperCase()}' not found on server. Please check the moderator screen code.`
            : err.message;
      });
    } catch (e) {
      clearTimeout(connectTimeout);
      connectionStatus.value = 'error';
      errorMessage.value = e.message;
    }
  };

  const joinLobby = (playerName, passcode = '') => {
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

  const claimSeat = (playerName) => {
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

  const sendNightAction = (targetPlayerName) => {
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
        });
      }
    }
  };

  const sendVote = (candidateName, voteType = 'pre') => {
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
    setTransportMode,
    startHost,
    setRoomPasscode,
    regenerateRoomCode,
    broadcastHostState,
    setOnPlayerAction,
    joinRoom,
    joinLobby,
    claimSeat,
    sendNightAction,
    sendVote,
    disconnect,
  };
}
