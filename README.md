# Mafia Party Game Assistant (MPGA) 🎭

A modern Vue 3 web application designed to assist game moderators (hosts and narrators) in running structured, live in-person games of **Mafia** (including tournament and competitive formats like *Godfather* and *Classic Mafia*).

---

## ✨ Key Features

* **Game Mode Configuration:** Select presets (Godfather, Classic) with custom speaking timers, challenge limits, defense durations, and turn shift rules.
* **Seating Order Arrangement:** Add players and organize them using drag-and-drop to match the physical circular table layout.
* **Role Selection & Balance Validation:** Automatically validate Town-to-Mafia ratios and securely assign randomized roles.
* **Moderator Live Cockpit:**
  * **Day Phase:** Speaking timers with clockwise and counter-clockwise flow and shift offsets.
  * **Voting Phase:** Pre-vote threshold calculation, defense stage timers, and final elimination voting.
  * **Night Phase:** Priority-ordered ability resolution engine (accounting for blocks, heals, shields, investigations, and revives).
* **Dual-Transport Multiplayer Sync:** Connect player phones seamlessly via **☁️ Cloud Relay (MQTT WebSockets)** or **⚡ WebRTC P2P (Direct)**. Live latency indicator, QR code instant pairing, and secret tap-to-reveal role cards.
* **LocalStorage Auto-Sync:** State is serialized continuously to prevent accidental data loss.
* **Full Localization (i18n):** Bilingual support for English and Persian (فارسی) with dynamic RTL/LTR directionality.

---

## 📚 Documentation

For in-depth explanations tailored for players, moderators, developers, and AI assistants, see:

* 📖 **[How to Play & Game Flow Guide](docs/how-to-play.md)** — Comprehensive step-by-step walkthrough of all game phases and cycles.
* ⚖️ **[Mafia Rules & Mechanics](docs/rules.md)** — Detailed role catalog, abilities, faction win conditions, and night action priority resolution tables.
* 🌐 **[Multiplayer Architecture](docs/multiplayer.md)** — Dual-transport engine (Cloud MQTT Relay vs WebRTC P2P), QR pairing, and client sync protocol.
* 🌿 **[Git Workflow & Commit Standards](docs/git-workflow.md)** — Branch strategy, Conventional Commits specification, and CI/CD deployment rules.
* 🌍 **[Localization & i18n](docs/localization.md)** — Bilingual English/Persian dictionaries, dynamic RTL directionality, and translation guidelines.
* 🛠️ **[Technology & Architecture](docs/technology.md)** — Technical design, Pinia state patterns, relational data models, and directory maps.
* 🚀 **[How to Run & Developer Guide](docs/how-to-run.md)** — Installation, development server, Vitest testing, and build scripts.
* 🗺️ **[Roadmap & Future Todos](docs/roadmap.md)** — Architecture milestones (action logging, Midday Last Word cards, and TypeScript migration).

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Run unit tests
npm run test
```

---

## 📄 License & Intellectual Property

Copyright (c) 2026 Ali Heristchian. All Rights Reserved.  
Proprietary software. Unauthorized copying, distribution, modification, or commercial use is strictly prohibited. See [LICENSE](LICENSE) for details.

