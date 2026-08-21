# How to Run & Developer Guide

This document covers project setup, local development workflows, testing, linting, and production builds.

---

## Prerequisites
* **Node.js:** v18.0.0 or higher (v20+ recommended)
* **npm:** v9.0.0 or higher

---

## Installation

1. Clone the repository and navigate into the root directory:
   ```bash
   cd mpga
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```

---

## Available Scripts

### 1. Development Server
Starts the Vite dev server with Hot Module Replacement (HMR):
```bash
npm run dev
```
* Default URL: `http://localhost:5173`

### 2. Run Tests (Vitest)
Executes all unit tests in [`src/services/`](file:///Users/ali.heristchian/Documents/learning/mpga/src/services/):
```bash
npm run test
```
To run tests once without watch mode:
```bash
npx vitest run
```

### 3. Linting & Code Quality
Runs ESLint v9 flat config with automatic fixes:
```bash
npm run lint
```

### 4. Code Formatting
Formats all JavaScript, Vue SFCs, and JSON files with Prettier:
```bash
npm run format
```

### 5. Production Build & Preview
Compile and bundle optimized assets for deployment:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```
