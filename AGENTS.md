# Antigravity Instructions for MPGA (Mafia Party Game Assistant)

## Project Principles & Core Rules

- **Internationalization (i18n):**
  - ALL user-facing text MUST be added to both `src/locales/en.json` (English) and `src/locales/fa.json` (Persian).
  - Do NOT hardcode English or Farsi strings in Vue SFC templates or components.
  - Maintain clean separation between languages without mixed parentheticals in dictionary values.
  - Keep RTL/LTR dynamic direction switching in mind for any new UI layout components.

- **Documentation Updates:**
  - Whenever a new feature, phase, gameplay rule, or significant architectural change is introduced, ALWAYS update the corresponding documentation in the `docs/` folder (`how-to-play.md`, `rules.md`, `roadmap.md`, `technology.md`).

- **Testing & Build Verification:**
  - After modifying services, stores, or game logic, ALWAYS run `npm test -- --run` to ensure all unit test suites pass.
  - ALWAYS run `npm run build` to ensure the production bundle compiles with zero syntax or bundling errors.
