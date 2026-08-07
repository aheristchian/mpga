# Roadmap & Architecture

## Current vs. Future Architecture

```mermaid
graph TD
    subgraph Current State
        A[Vue 3 App Orchestrator] --> B[GameModerator]
        A --> C[PlayerEntry]
        A --> D[RoleSelection]
        B -.-> E[(LocalStorage Persistence)]
    end

    subgraph Phase 1 : Game Logging
        B --> F[Event Logger Module]
        F -.-> E
        F --> F2[Moderator Log UI]
    end

    subgraph Phase 2 : Distributed Multiplayer (Serverless)
        G[Moderator Client] -->|Generates Room ID| H[QR Code / Join Link]
        I[Player Client 1] -->|Scans QR / Enters Password| J((WebRTC P2P Connection))
        I2[Player Client 2] -->|Scans QR / Enters Password| J
        G <-->|Real-time Game State / Auth| J
        J <-->|Role Info / Abilities| I
        J <-->|Role Info / Abilities| I2
    end
```

## Upcoming Milestones

### 1. Event & Action Logging
**Goal**: Keep a historical record of all game actions to help the moderator track complex games.
- **Implementation**: Create a centralized logging composable (`useGameLog.js`).
- **Events**: Dispatch events from `GameModerator` (e.g., "Doctor saved Player X", "Night 1 ended", "Player Y was eliminated").
- **UI**: Add an "Event Log" drawer or sidebar for the Moderator to review past actions.
- **Persistence**: Save the log array to `localStorage` alongside the existing game state.

### 2. "Serverless" Multiplayer (WebRTC)
**Goal**: Allow players to join a session hosted by the Moderator without requiring a dedicated backend server or database.
- **Technology**: **WebRTC** (using a wrapper library like `PeerJS`). WebRTC enables direct Peer-to-Peer (P2P) browser-to-browser data transfer.
- **Flow**:
  1. The Moderator creates a game. The app generates a unique Room ID and a short, random password.
  2. The app uses a library like `qrcode.vue` to generate a QR Code containing the connection URL (e.g., `https://[app-url]?room=12345`).
  3. Players scan the QR code with their phones, opening the app on their device.
  4. The player enters the password. The player's browser establishes a direct WebRTC connection to the Moderator's browser.
  5. The Moderator's device acts as the "Host Server", validating passwords and keeping the master state.

### 3. Player Client View
**Goal**: A specialized, restricted UI for connected players.
- **Restricted State**: The Host (Moderator) only sends the player their specific role, current game phase (Day/Night), and available targets. They do not receive the full game state.
- **Interaction**: Players can cast votes or use abilities from their device. These actions are sent as JSON payloads over the WebRTC data channel back to the Moderator.
- **Moderator Override**: The Moderator always retains the ability to manually override or log actions if a player's phone disconnects.

## TBC (To Be Continued / Future Work)

### Technical Debt: TypeScript Migration
- Migrate the codebase from Vanilla JavaScript to **TypeScript**.
- Define strict interfaces (e.g., `Player`, `Role`, `Ability`) to prevent runtime errors as the state machine grows more complex.
- Update Vue components to `<script setup lang="ts">`.

### UI / UX Improvements (From Testing Feedback)
- **Day Phase Timer Flexibility**: The moderator needs to see timers for *all* players during the Day Phase, allowing them to freely switch between players and keep track of everyone's remaining time, rather than a strict one-by-one queue.
- **Dynamic Reordering**: The `GameModerator` live board must support drag-and-drop reordering of players (similar to `PlayerEntry`). In real life, people physically move seats during the game, and the app's seated order needs to update to reflect this.

### Auto-Win Detection Engine
- Implement logic to automatically detect game-over states.
- **Town Win**: All Mafia are eliminated.
- **Mafia Win**: Living Mafia equal or outnumber living Town.
- **Third Party (Nostradamus)**: Shares the victory with whichever team they allied with on Night 1.

### Enhanced Voting Phase (Eyes Closed)
- Add a specific state during the Final Vote where players must close their eyes.
- This allows players to secretly change their votes while the Moderator tallies the final count without the town seeing the exact moment of shifting alliances.

### Game Cycles & Midday (Nim-Rouz)
- Implement the strict repetition of the game cycle.
- **Last Word Cards (کارت حرکت آخر)**: When a player is eliminated in the vote, they enter the Midday phase.
  - Implement a visual spinner/arrow animation that rotates among available "Last Word" cards.
  - Once a card is drawn by an eliminated player, it is removed from the game deck so subsequent eliminated players draw from the remaining cards.
