# Antigravity Instructions for MPGA (Mafia Party Game Assistant)

## Project Principles & Core Rules

- **Git Commit Standards (Conventional Commits 1.0.0):**
  - ALL commit messages MUST strictly follow the Conventional Commits specification: `<type>(<optional scope>): <imperative summary>`.
  - Allowed types: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `style`.
  - Scopes: `multiplayer`, `playerClient`, `moderator`, `voting`, `roles`, `audio`, `store`, `i18n`, `setup`.
  - Always use lowercase imperative sentences without ending periods (e.g., `feat(multiplayer): add dual-transport cloud MQTT relay`).
  - Refer to `docs/git-workflow.md` for complete guidelines.

- **Internationalization (i18n):**
  - ALL user-facing text MUST be added to both `src/locales/en.json` (English) and `src/locales/fa.json` (Persian).
  - Do NOT hardcode English or Farsi strings in Vue SFC templates or components.
  - Maintain clean separation between languages without mixed parentheticals in dictionary values.
  - Keep RTL/LTR dynamic direction switching in mind for any new UI layout components.
  - Refer to `docs/localization.md` for guidelines.

- **Documentation Updates & Modularity:**
  - Whenever a new feature, phase, gameplay rule, or significant architectural change is introduced, ALWAYS update the corresponding documentation in the `docs/` folder:
    - `docs/how-to-play.md`: Step-by-step game moderator & player instructions.
    - `docs/rules.md`: Complete Iranian Mafia rulebook, roles, and edge-case mechanics.
    - `docs/multiplayer.md`: Networking, Dual-Transport (MQTT Cloud vs WebRTC), and sync protocol.
    - `docs/git-workflow.md`: Version control, branch strategy, Conventional Commits, and CI/CD.
    - `docs/localization.md`: i18n dictionary structure, RTL layout, and glossary.
    - `docs/roadmap.md`: Vision, implemented milestones, and upcoming capabilities.
    - `docs/technology.md`: Architectural overview, tech stack, and state design.

- **Testing & Build Verification:**
  - After modifying services, stores, or game logic, ALWAYS run `npm test -- --run` to ensure all unit test suites pass.
  - ALWAYS run `npm run build` to ensure the production bundle compiles with zero syntax or bundling errors.
