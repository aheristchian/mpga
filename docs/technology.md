# Technology & Architecture

## Stack & Tooling
* **Framework:** Vue 3 (Composition API)
* **Build Tool:** Vite (Replaced Webpack for faster HMR and simpler configuration)
* **Styling:** Tailwind CSS v3 (Replaced global SCSS, though scoped SCSS is still supported in Vue SFCs)
* **Internationalization:** Vue-I18n v11 (All hardcoded strings extracted to `src/locales/`)
* **Linting/Formatting:** ESLint v9 (Flat config with Globals) + Prettier

## Key Architectural Decisions

### 1. Data Modeling & Headless CMS Prep
We migrated the data to a relational format in `src/data/`:
* Used String IDs (`sideId: 'mafia'`).
* Stored data in flat Arrays (JSON-serializable).
* Created a Service Layer (`src/services/useGameService.js`) to "hydrate" relations. This prepares the app to easily swap out the mock arrays for a `fetch()` call to a CMS like Strapi in the future.

### 2. Vue Component Structure
We broke the imperative logic into declarative Vue components:
* **`App.vue`:** The orchestrator. It holds the global state (`gamePhase`, `gamePlayers`) and handles the transitions between screens.
* **`PlayerEntry.vue`:** Uses two-way binding (`v-model`) and HTML5 Drag-and-Drop for seating order sorting.
* **`RoleSelection.vue`:** Uses a reactive dictionary (`roleCounts`) to track limits and grouped layouts (`computed` properties) to arrange roles cleanly by Side.
* **`BaseModal.vue`:** A reusable `<Teleport>` component with `<slot>` injection.

### 3. Internationalization (i18n)
All user-facing text is managed via `vue-i18n`.
* Text strings live in `src/locales/en.json`.
* Components use the `$t('key')` helper.

### 4. Game Balance Validation
Game rules (like the maximum allowable ratio of Mafia to Town) are defined in the data model (`src/data/modes.js`), *not* hardcoded in the Vue components.
