import { ref, computed } from 'vue';
import Peer from 'peerjs';

// Reactive Singleton State
const isHost = ref(false);
const isClient = ref(false);
const roomCode = ref('');
const connectionStatus = ref('disconnected'); // 'disconnected', 'connecting', 'connected', 'error'
const errorMessage = ref('');

// Host State
let hostPeer = null;
const connectedPeers = ref([]); // [{ peerId, playerName, conn }]
const roomPasscode = ref(
  typeof localStorage !== 'undefined' ? localStorage.getItem('mpga_room_passcode') || '' : ''
);

// Client State
let clientPeer = null;
let clientConn = null;
const clientPlayerName = ref(
  typeof localStorage !== 'undefined' ? localStorage.getItem('mpga_player_name') || '' : ''
);
const clientPlayerIdentity = ref(null); // { name, role, isDead, isSilenced, warnings }
const clientPublicState = ref(null); // { gamePhase, subPhase, currentDay, livingPlayers, allPlayers, setupPlayers, isGameOver, winner }
const isInLobby = ref(false);
const lobbyPlayers = ref([]);

// Event callbacks (for host to hook into store)
let onPlayerActionCallback = null;

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

let heartbeatInterval = null;
const setupPeerKeepAlive = (peer) => {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  if (typeof window === 'undefined') return;
  heartbeatInterval = setInterval(() => {
    if (peer && !peer.destroyed && !peer.disconnected) {
      if (peer.socket && typeof peer.socket._send === 'function') {
        try {
          peer.socket._send({ type: 'HEARTBEAT' });
        } catch {
          // ignore
        }
      }
    }
  }, 20000);
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (hostPeer && !hostPeer.destroyed) {
      hostPeer.destroy();
    }
    if (clientPeer && !clientPeer.destroyed) {
      clientPeer.destroy();
    }
  });
}

export function useMultiplayer() {
  const isConnected = computed(() => connectionStatus.value === 'connected');

  // --- HOST METHODS ---
  const startHost = (code) => {
    if (hostPeer && !hostPeer.destroyed) {
      if (!code || roomCode.value === code) {
        return; // Already hosting
      }
      hostPeer.destroy();
      hostPeer = null;
    }

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

    const fullPeerId = `mpga-host-${hostCode.toLowerCase()}`;
    connectionStatus.value = 'connecting';
    isHost.value = true;
    isClient.value = false;
    errorMessage.value = '';

    try {
      hostPeer = new Peer(fullPeerId, PEER_CONFIG);
      setupPeerKeepAlive(hostPeer);

      hostPeer.on('open', () => {
        connectionStatus.value = 'connected';
      });

      hostPeer.on('disconnected', () => {
        if (hostPeer && !hostPeer.destroyed) {
          hostPeer.reconnect();
        }
      });

      hostPeer.on('connection', (conn) => {
        conn.on('open', () => {
          connectedPeers.value.push({
            peerId: conn.peer,
            playerName: '',
            conn,
          });

          // Immediate handshake broadcast to newly joined device
          if (onPlayerActionCallback) {
            onPlayerActionCallback({
              action: 'PEER_CONNECTED',
              peerId: conn.peer,
            });
          }
        });

        conn.on('data', (data) => {
          handleHostIncomingData(conn, data);
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
          // ID in use (e.g. from previous tab session); generate a fresh code
          const freshCode = generateRoomCode();
          roomCode.value = freshCode;
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('mpga_room_code', freshCode);
          }
          startHost(freshCode);
          return;
        }
        errorMessage.value = err.message || 'Failed to initialize Host peer';
        connectionStatus.value = 'error';
      });
    } catch (e) {
      errorMessage.value = e.message;
      connectionStatus.value = 'error';
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
    if (hostPeer && !hostPeer.destroyed) {
      hostPeer.destroy();
      hostPeer = null;
    }
    startHost(freshCode);
  };

  const handleHostIncomingData = (conn, data) => {
    if (!data || typeof data !== 'object') return;

    if (data.type === 'JOIN_LOBBY') {
      // Validate Passcode if host has a passcode set
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

      if (onPlayerActionCallback) {
        onPlayerActionCallback({
          action: 'JOIN_LOBBY',
          playerName,
          peerId: conn.peer,
        });
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
    } else if (data.type === 'CLAIM_SEAT') {
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
    } else if (data.type === 'NIGHT_ACTION' || data.type === 'CAST_VOTE') {
      if (onPlayerActionCallback) {
        onPlayerActionCallback(data);
      }
    }
  };

  const broadcastHostState = (store) => {
    if (!isHost.value || !store) return;
    const publicState = sanitizePublicGameState(store);

    connectedPeers.value.forEach(({ playerName, conn }) => {
      if (!conn || !conn.open) return;

      const playerObj = (store.livePlayers || []).find((p) => p.name === playerName);
      const privateIdentity = sanitizePlayerPayload(playerObj, store);

      try {
        conn.send({
          type: 'STATE_UPDATE',
          player: privateIdentity,
          public: publicState,
        });
      } catch {
        // Send error catch
      }
    });
  };

  const setOnPlayerAction = (callback) => {
    onPlayerActionCallback = callback;
  };

  // --- CLIENT (PLAYER) METHODS ---
  const joinRoom = (targetRoomCode, preferredPlayerName = '', passcode = '') => {
    if (clientPeer) {
      clientPeer.destroy();
    }

    const cleanCode = targetRoomCode.trim().toLowerCase();
    roomCode.value = cleanCode.toUpperCase();
    const targetHostPeerId = `mpga-host-${cleanCode}`;

    isHost.value = false;
    isClient.value = true;
    connectionStatus.value = 'connecting';
    errorMessage.value = '';

    let connectTimeout = setTimeout(() => {
      if (connectionStatus.value === 'connecting') {
        connectionStatus.value = 'error';
        errorMessage.value =
          'Connecting timed out. Please check that the host room code is active on the moderator screen.';
      }
    }, 12000);

    try {
      clientPeer = new Peer(PEER_CONFIG);
      setupPeerKeepAlive(clientPeer);

      clientPeer.on('open', () => {
        clientConn = clientPeer.connect(targetHostPeerId, { reliable: true });

        clientConn.on('open', () => {
          clearTimeout(connectTimeout);
          connectionStatus.value = 'connected';
          if (preferredPlayerName) {
            joinLobby(preferredPlayerName, passcode);
          }
        });

        clientConn.on('data', (data) => {
          if (data && data.type === 'STATE_UPDATE') {
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
    if (clientConn && clientConn.open) {
      clientConn.send({
        type: 'JOIN_LOBBY',
        playerName: trimmed,
        passcode,
      });
    }
  };

  const claimSeat = (playerName) => {
    clientPlayerName.value = playerName;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mpga_player_name', playerName);
    }
    if (clientConn && clientConn.open) {
      clientConn.send({
        type: 'CLAIM_SEAT',
        playerName,
      });
    }
  };

  const sendNightAction = (targetPlayerName) => {
    if (clientConn && clientConn.open && clientPlayerIdentity.value) {
      clientConn.send({
        type: 'NIGHT_ACTION',
        actorName: clientPlayerIdentity.value.name,
        actorRole: clientPlayerIdentity.value.role?.name,
        targetPlayerName,
      });
    }
  };

  const sendVote = (candidateName, voteType = 'pre') => {
    if (clientConn && clientConn.open && clientPlayerIdentity.value) {
      clientConn.send({
        type: 'CAST_VOTE',
        voterName: clientPlayerIdentity.value.name,
        candidateName,
        voteType,
      });
    }
  };

  const disconnect = () => {
    if (hostPeer) {
      hostPeer.destroy();
      hostPeer = null;
    }
    if (clientPeer) {
      clientPeer.destroy();
      clientPeer = null;
    }
    connectionStatus.value = 'disconnected';
    connectedPeers.value = [];
    isHost.value = false;
    isClient.value = false;
    isInLobby.value = false;
    lobbyPlayers.value = [];
    clientPlayerIdentity.value = null;
  };

  return {
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
