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

// Client State
let clientPeer = null;
let clientConn = null;
const clientPlayerName = ref(
  typeof localStorage !== 'undefined' ? localStorage.getItem('mpga_player_name') || '' : ''
);
const clientPlayerIdentity = ref(null); // { name, role, isDead, isSilenced, warnings }
const clientPublicState = ref(null); // { gamePhase, subPhase, currentDay, livingPlayers, allPlayers, activeNightRole, isGameOver, winner }

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

  return {
    gamePhase: store.gamePhase,
    subPhase: store.subPhase,
    currentDay: store.currentDay,
    livingPlayers: living,
    allPlayers: all,
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

export function useMultiplayer() {
  const isConnected = computed(() => connectionStatus.value === 'connected');

  // --- HOST METHODS ---
  const startHost = (code) => {
    if (hostPeer) {
      hostPeer.destroy();
    }

    const hostCode = code || generateRoomCode();
    roomCode.value = hostCode;
    const fullPeerId = `mpga-host-${hostCode.toLowerCase()}`;
    connectionStatus.value = 'connecting';
    isHost.value = true;
    isClient.value = false;
    errorMessage.value = '';

    try {
      hostPeer = new Peer(fullPeerId, {
        debug: 1,
      });

      hostPeer.on('open', () => {
        connectionStatus.value = 'connected';
      });

      hostPeer.on('connection', (conn) => {
        conn.on('open', () => {
          connectedPeers.value.push({
            peerId: conn.peer,
            playerName: '',
            conn,
          });
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
        errorMessage.value = err.message || 'Failed to initialize Host peer';
        connectionStatus.value = 'error';
      });
    } catch (e) {
      errorMessage.value = e.message;
      connectionStatus.value = 'error';
    }
  };

  const handleHostIncomingData = (conn, data) => {
    if (!data || typeof data !== 'object') return;

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
  const joinRoom = (targetRoomCode, preferredPlayerName = '') => {
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

    try {
      clientPeer = new Peer({ debug: 1 });

      clientPeer.on('open', () => {
        clientConn = clientPeer.connect(targetHostPeerId, { reliable: true });

        clientConn.on('open', () => {
          connectionStatus.value = 'connected';
          if (preferredPlayerName) {
            claimSeat(preferredPlayerName);
          }
        });

        clientConn.on('data', (data) => {
          if (data && data.type === 'STATE_UPDATE') {
            clientPlayerIdentity.value = data.player;
            clientPublicState.value = data.public;
          }
        });

        clientConn.on('close', () => {
          connectionStatus.value = 'disconnected';
          errorMessage.value = 'Disconnected from host room.';
        });

        clientConn.on('error', (err) => {
          connectionStatus.value = 'error';
          errorMessage.value = err.message || 'Connection error with host';
        });
      });

      clientPeer.on('error', (err) => {
        connectionStatus.value = 'error';
        errorMessage.value =
          err.type === 'peer-unavailable' ? 'Room not found. Check room code.' : err.message;
      });
    } catch (e) {
      connectionStatus.value = 'error';
      errorMessage.value = e.message;
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
  };

  return {
    isHost,
    isClient,
    roomCode,
    connectionStatus,
    errorMessage,
    connectedPeers,
    clientPlayerName,
    clientPlayerIdentity,
    clientPublicState,
    isConnected,
    startHost,
    broadcastHostState,
    setOnPlayerAction,
    joinRoom,
    claimSeat,
    sendNightAction,
    sendVote,
    disconnect,
  };
}
