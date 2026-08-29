# Multiplayer Architecture & Protocols

This document details the architecture, transport protocols, room security, and synchronization mechanics powering the real-time multiplayer system in **Mafia Party Game Assistant (MPGA)**.

---

## 1. Dual-Transport Engine Architecture

MPGA features a modular **Dual-Transport Multiplayer Engine** (`useMultiplayerService.js`) designed to provide zero-friction local and remote connectivity across modern browsers and mobile devices.

```mermaid
graph TD
    subgraph Host / Moderator Cockpit
        HE[Host Engine Controller]
        HE -->|Transport Mode: Cloud| MQTT_H[MQTT Pub/Sub Host Client]
        HE -->|Transport Mode: WebRTC| RTC_H[WebRTC PeerJS Host Mesh]
        QR[QR Code Generator: &t=cloud or &t=webrtc]
    end

    subgraph Network Layer
        MQTT_H <-->|WSS wss://broker.hivemq.com:8884/mqtt| CLOUD_BROKER((Public HiveMQ Broker))
        RTC_H <-->|STUN/TURN + DataChannels| P2P_NET((Direct WebRTC Channels))
    end

    subgraph Mobile Player Clients
        P1[Player 1 Device]
        P2[Player 2 Device]
        CLOUD_BROKER <-->|Topic: mpga/{roomCode}/*| P1
        P2P_NET <-->|Keep-Alive 3s DataChannel| P2
    end
```

### ☁️ Engine 1: Cloud Relay (MQTT over Secure WebSockets — Recommended)
* **High Availability & Zero Drops:** Connects via `wss://broker.hivemq.com:8884/mqtt` over TLS port 8884.
* **Carrier CGNAT & Mobile 4G/5G Resilient:** Cellular data networks and restrictive corporate Wi-Fi firewalls often block direct P2P connections; Cloud Relay provides instant, 100% reliable packet routing.
* **Pub/Sub Topic Isolation:**
  * Host broadcasts public state: `mpga/{roomCode}/public`
  * Host sends private role cards: `mpga/{roomCode}/client/{senderId}`
  * Clients send player actions & votes: `mpga/{roomCode}/host`
* **Real-Time Telemetry & Latency:** Continuous 3.5s ping/pong telemetry calculates round-trip ping (`pingLatency` in milliseconds) displayed live on mobile client headers.

### ⚡ Engine 2: Hardened WebRTC P2P (Direct)
* **100% Serverless:** Direct peer-to-peer data transmission using WebRTC DataChannels.
* **Fixed Room Code Persistence:** Eliminates room code mutation on temporary signaling reconnects (`unavailable-id` error handling).
* **3-Second Keep-Alive Pings:** Regular heartbeat packets prevent home routers and stateful firewalls from terminating idle peer data channels.
* **Public STUN Fallbacks:** Uses Google STUN servers (`stun.l.google.com:19302`) for NAT discovery.

---

## 2. Room Pairing, Passcodes & QR Code Flow

```mermaid
sequenceDiagram
    autonumber
    actor Host as Moderator Screen
    actor Player as Player Mobile Device

    Host->>Host: Generates Room Code (e.g. 7842) & Optional PIN
    Host->>Host: Renders QR Code (?join=7842&pin=1234&t=cloud)
    Player->>Player: Scans QR code with camera
    Player->>Player: Auto-populates Room Code, PIN, and Transport
    alt First Time Player
        Player->>Player: Enters Display Name and taps "Join Lobby"
    else Returning Player
        Player->>Player: Auto-connects with saved name
    end
    Player->>Host: Sends JOIN_LOBBY (Name, Passcode)
    Host->>Host: Validates PIN & registers player into roster (🟢)
    Host->>Player: Broadcasts current lobby state (GET_STATE response)
```

1. **Room Codes:** 4 to 6 character alphanumeric uppercase codes (e.g., `9N8J`, `7842`).
2. **Room PIN / Passcode:** An optional 4 to 8 character passcode configured by the moderator to prevent unauthorized room joins.
3. **URL Parameter Schema:**
   * `?join=ROOM_CODE` — Room code to connect to.
   * `&pin=PASSCODE` — Pre-filled room PIN.
   * `&t=cloud` or `&t=webrtc` — Desired transport engine.

---

## 3. Communication Protocol & Action Types

All messages exchanged between clients and the host are serialized JSON envelopes:

```json
{
  "type": "JOIN_LOBBY",
  "name": "Ali",
  "passcode": "1234",
  "senderId": "player-peer-xyz"
}
```

### Supported Action Types:

| Action Type | Direction | Payload Description |
| :--- | :--- | :--- |
| `GET_STATE` | Client $\to$ Host | Requests immediate broadcast of public state and setup roster upon initial connect. |
| `JOIN_LOBBY` | Client $\to$ Host | Player display name and passcode for registration in the pre-game lobby. |
| `CLAIM_SEAT` | Client $\to$ Host | Binds device peer ID to an existing seated player name. |
| `SYNC_FULL_STATE` | Host $\to$ Client | Broadcasts current phase, living player roster, day count, and public game status. |
| `ASSIGN_ROLE` | Host $\to$ Client | Direct private message delivering secret role details and abilities to a specific player. |
| `NIGHT_ACTION` | Client $\to$ Host | Submits secret night target (e.g., Doctor heal, Mafia shot, Detective inquiry). |
| `CAST_VOTE` | Client $\to$ Host | Submits vote against a player during the voting subphase. |
| `CHALLENGE_REQUEST` | Client $\to$ Host | Requests challenge speaking time from the active day speaker. |
| `PING` / `PONG` | Both | Lightweight keep-alive and network roundtrip latency measurement. |

---

## 4. Privacy & Anti-Cheating Architecture

1. **Client-Side Obfuscation & Encrypted Local Storage:**
   * Secret roles are never embedded in the public broadcast payload (`SYNC_FULL_STATE`).
   * The host sends role payloads individually via direct private messages (`ASSIGN_ROLE`).
2. **Tap-to-Reveal Privacy Blur:**
   * Player screens initialize with an opaque frosted privacy shield (`🔒 Tap to Reveal Role`).
   * Players can tap once to inspect their secret role and tap again to immediately re-hide it from bystanders.
