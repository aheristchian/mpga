/**
 * Curated SVG vector illustrations for MPGA Game Modes.
 * High-contrast, scalable vector artwork fitting the dark 1930s noir mafia aesthetic.
 * Seamless vector art without redundant outer card borders.
 */

export const modeSvgMap = {
  godfather: `
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <radialGradient id="gf-spot" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#7F1D1D" stop-opacity="0.45" />
          <stop offset="60%" stop-color="#450A0A" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#09090B" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="gf-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE047" />
          <stop offset="50%" stop-color="#EAB308" />
          <stop offset="100%" stop-color="#A16207" />
        </linearGradient>
        <linearGradient id="gf-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F87171" />
          <stop offset="40%" stop-color="#DC2626" />
          <stop offset="100%" stop-color="#7F1D1D" />
        </linearGradient>
        <linearGradient id="gf-suit" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#27272A" />
          <stop offset="100%" stop-color="#09090B" />
        </linearGradient>
        <filter id="gf-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Atmospheric Radial Spotlight & Backdrop -->
      <rect width="200" height="130" rx="12" fill="url(#gf-spot)" />

      <!-- Noir City Skyline in Distance -->
      <path d="M10 105 L22 105 L22 82 L34 82 L34 92 L46 92 L46 72 L58 72 L58 105 L142 105 L142 76 L154 76 L154 68 L166 68 L166 86 L178 86 L178 98 L190 98 L190 105 Z" fill="#18181B" opacity="0.65"/>
      <line x1="10" y1="105" x2="190" y2="105" stroke="#3F3F46" stroke-width="1.5" stroke-linecap="round"/>

      <!-- Ambient Glow Halo behind Mobster -->
      <circle cx="100" cy="52" r="38" fill="#EF4444" opacity="0.1" filter="url(#gf-glow)" />

      <!-- Center Godfather Fedora & Silhouette -->
      <!-- Hat Crown -->
      <path d="M72 44 C72 26 80 18 100 18 C120 18 128 26 128 44 Z" fill="url(#gf-red)"/>
      <path d="M80 20 C88 17 112 17 120 20 C114 26 86 26 80 20 Z" fill="#991B1B" opacity="0.6"/>
      <!-- Gold Ribbon Accent -->
      <path d="M72 41 H128 V46 H72 Z" fill="url(#gf-gold)"/>
      <!-- Hat Brim with 3D Curve -->
      <path d="M52 48 C52 48 74 38 100 38 C126 38 148 48 148 48 C158 48 158 53 148 55 C128 58 72 58 52 55 C42 53 42 48 52 48 Z" fill="url(#gf-red)"/>

      <!-- Sunglasses / Shadow of Mystery -->
      <path d="M78 60 L92 60 L90 68 L80 68 Z" fill="#09090B" stroke="#EF4444" stroke-width="1.2"/>
      <path d="M108 60 L122 60 L120 68 L110 68 Z" fill="#09090B" stroke="#EF4444" stroke-width="1.2"/>
      <line x1="92" y1="62" x2="108" y2="62" stroke="#EF4444" stroke-width="1.2"/>
      <!-- Lens Reflections -->
      <line x1="82" y1="62" x2="88" y2="66" stroke="#FCA5A5" stroke-width="0.8" opacity="0.7"/>
      <line x1="112" y1="62" x2="118" y2="66" stroke="#FCA5A5" stroke-width="0.8" opacity="0.7"/>

      <!-- Tuxedo Silhouette & Lapels -->
      <path d="M72 74 L100 94 L128 74 L138 118 L62 118 Z" fill="url(#gf-suit)" stroke="#52525B" stroke-width="1.2"/>
      <path d="M86 76 L100 96 L114 76 Z" fill="#FAFAFA"/>
      <!-- Red Silk Tie -->
      <polygon points="96,78 104,78 102,102 98,102" fill="url(#gf-red)"/>
      <polygon points="98,102 102,102 100,108" fill="#991B1B"/>

      <!-- Red Rose Boutonniere with Leaf -->
      <path d="M71 88 C69 86 67 90 71 92 Z" fill="#15803D" />
      <circle cx="75" cy="88" r="5" fill="#DC2626"/>
      <circle cx="75" cy="88" r="3" fill="#EF4444"/>
      <circle cx="74" cy="87" r="1.5" fill="#FECACA"/>

      <!-- Subtle Gold Star Emblems -->
      <polygon points="32,24 34,29 39,29 35,32 37,37 32,34 27,37 29,32 25,29 30,29" fill="url(#gf-gold)" opacity="0.85"/>
      <polygon points="168,24 170,29 175,29 171,32 173,37 168,34 163,37 165,32 161,29 166,29" fill="url(#gf-gold)" opacity="0.85"/>
    </svg>
  `,

  classic: `
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <radialGradient id="cl-spot" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#1E3A8A" stop-opacity="0.45" />
          <stop offset="60%" stop-color="#172554" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#09090B" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="cl-lamp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FBBF24" stop-opacity="0.5" />
          <stop offset="50%" stop-color="#F59E0B" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#F59E0B" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="cl-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#93C5FD" />
          <stop offset="50%" stop-color="#3B82F6" />
          <stop offset="100%" stop-color="#1D4ED8" />
        </linearGradient>
        <linearGradient id="cl-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FEF08A" />
          <stop offset="40%" stop-color="#FBBF24" />
          <stop offset="75%" stop-color="#D97706" />
          <stop offset="100%" stop-color="#92400E" />
        </linearGradient>
        <filter id="cl-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Atmospheric Radial Spotlight & Backdrop -->
      <rect width="200" height="130" rx="12" fill="url(#cl-spot)" />

      <!-- City Skyline in Distance with Lit Windows -->
      <path d="M10 105 L24 105 L24 74 L38 74 L38 88 L52 88 L52 64 L68 64 L68 105 L132 105 L132 70 L146 70 L146 60 L160 60 L160 82 L176 82 L176 96 L190 96 L190 105 Z" fill="#18181B" opacity="0.75"/>
      <!-- Distant Windows -->
      <rect x="28" y="78" width="3" height="4" rx="0.5" fill="#FEF08A" opacity="0.4"/>
      <rect x="33" y="78" width="3" height="4" rx="0.5" fill="#FEF08A" opacity="0.3"/>
      <rect x="56" y="68" width="3" height="4" rx="0.5" fill="#FEF08A" opacity="0.5"/>
      <rect x="61" y="68" width="3" height="4" rx="0.5" fill="#FEF08A" opacity="0.3"/>
      <rect x="56" y="76" width="3" height="4" rx="0.5" fill="#FEF08A" opacity="0.4"/>
      <rect x="136" y="74" width="3" height="4" rx="0.5" fill="#FEF08A" opacity="0.4"/>
      <rect x="150" y="65" width="3" height="4" rx="0.5" fill="#FEF08A" opacity="0.5"/>
      <line x1="10" y1="105" x2="190" y2="105" stroke="#334155" stroke-width="1.5" stroke-linecap="round"/>

      <!-- Ambient Glow Halo -->
      <circle cx="100" cy="54" r="38" fill="#3B82F6" opacity="0.12" filter="url(#cl-glow)" />

      <!-- Vintage Streetlamp on Left Casting Warm Conic Glow -->
      <polygon points="32,28 14,105 50,105" fill="#FBBF24" opacity="0.08"/>
      <line x1="32" y1="105" x2="32" y2="28" stroke="#64748B" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M26 28 L38 28 L35 18 L29 18 Z" fill="#B45309"/>
      <circle cx="32" cy="23" r="16" fill="url(#cl-lamp-glow)"/>
      <circle cx="32" cy="23" r="3.5" fill="#FEF08A"/>

      <!-- Center Iconic Element: Scales of Justice with Balanced Factions -->
      <!-- Scales of Justice Center Column -->
      <rect x="98.5" y="36" width="3" height="66" rx="1.5" fill="url(#cl-gold)"/>
      <path d="M88 102 C88 98 112 98 112 102 L116 105 H84 Z" fill="url(#cl-gold)"/>
      <!-- Top Finial & Sheriff Star Badge -->
      <circle cx="100" cy="34" r="4.5" fill="url(#cl-gold)"/>
      <polygon points="100,30 101.5,33 105,33.5 102.5,36 103,39.5 100,37.5 97,39.5 97.5,36 95,33.5 98.5,33" fill="#FEF08A"/>

      <!-- Balance Beam (Curved Ornate Brass) -->
      <path d="M64 45 C78 40 122 40 136 45 L134 49 C122 44 78 44 66 49 Z" fill="url(#cl-gold)"/>

      <!-- Left Pan (Town Shield / Innocent Symbol) -->
      <line x1="66" y1="47" x2="56" y2="68" stroke="url(#cl-gold)" stroke-width="1.2"/>
      <line x1="72" y1="47" x2="82" y2="68" stroke="url(#cl-gold)" stroke-width="1.2"/>
      <path d="M54 68 C54 77 84 77 84 68 Z" fill="url(#cl-gold)"/>
      <!-- Blue Citizen / Detective Crest inside Left Pan -->
      <circle cx="69" cy="67" r="4.5" fill="#1D4ED8" stroke="#93C5FD" stroke-width="0.8"/>
      <path d="M66.5 67 L68.5 69 L71.5 65" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Right Pan (Mafia Threat Symbol) -->
      <line x1="128" y1="47" x2="118" y2="68" stroke="url(#cl-gold)" stroke-width="1.2"/>
      <line x1="134" y1="47" x2="144" y2="68" stroke="url(#cl-gold)" stroke-width="1.2"/>
      <path d="M116 68 C116 77 146 77 146 68 Z" fill="url(#cl-gold)"/>
      <!-- Crimson Mafia Target inside Right Pan -->
      <circle cx="131" cy="67" r="4.5" fill="#7F1D1D" stroke="#F87171" stroke-width="0.8"/>
      <line x1="128.5" y1="64.5" x2="133.5" y2="69.5" stroke="#FCA5A5" stroke-width="1" stroke-linecap="round"/>
      <line x1="133.5" y1="64.5" x2="128.5" y2="69.5" stroke="#FCA5A5" stroke-width="1" stroke-linecap="round"/>

      <!-- Detective Magnifying Glass on Right with Clue Reflection -->
      <g transform="translate(150, 36)">
        <circle cx="16" cy="16" r="14" stroke="url(#cl-blue)" stroke-width="2.5" fill="#1E3A8A" fill-opacity="0.35"/>
        <circle cx="16" cy="16" r="11" stroke="#93C5FD" stroke-width="0.8" opacity="0.6"/>
        <line x1="26" y1="26" x2="36" y2="36" stroke="url(#cl-gold)" stroke-width="4" stroke-linecap="round"/>
        <path d="M9 13 C10 9 14 7 18 7" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
        <text x="16" y="21" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="900" fill="#60A5FA" text-anchor="middle">🔍</text>
      </g>

      <!-- Golden Stars in Sky -->
      <polygon points="48,18 49.5,22 53.5,22 50.5,24.5 52,28.5 48,26 44,28.5 45.5,24.5 42.5,22 46.5,22" fill="url(#cl-gold)" opacity="0.8"/>
      <polygon points="162,18 163.5,22 167.5,22 164.5,24.5 166,28.5 162,26 158,28.5 159.5,24.5 156.5,22 160.5,22" fill="url(#cl-gold)" opacity="0.8"/>
    </svg>
  `,
};

/**
 * Curated scenario header icon SVGs (replaces plain emojis in scenario headers).
 */
export const scenarioIconSvgMap = {
  godfather: `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <linearGradient id="ic-gf-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#EF4444" />
          <stop offset="100%" stop-color="#991B1B" />
        </linearGradient>
        <linearGradient id="ic-gf-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE047" />
          <stop offset="100%" stop-color="#CA8A04" />
        </linearGradient>
      </defs>
      <!-- Fedora Crown -->
      <path d="M12 18 C12 9 15 6 20 6 C25 6 28 9 28 18 Z" fill="url(#ic-gf-red)"/>
      <!-- Gold Band -->
      <path d="M12 16 H28 V19 H12 Z" fill="url(#ic-gf-gold)"/>
      <!-- Fedora Brim -->
      <path d="M5 20 C5 20 12 16 20 16 C28 16 35 20 35 20 C38 20 38 22 35 23 C29 25 11 25 5 23 C2 22 2 20 5 20 Z" fill="url(#ic-gf-red)"/>
      <!-- Rose Accent -->
      <circle cx="28" cy="28" r="3.5" fill="#EF4444"/>
      <circle cx="28" cy="28" r="1.5" fill="#FECACA"/>
      <!-- Bow Tie / Lapel -->
      <path d="M14 26 L20 31 L26 26 L20 36 Z" fill="#18181B" stroke="#71717A" stroke-width="1"/>
      <polygon points="18,27 22,27 21,34 19,34" fill="#DC2626"/>
    </svg>
  `,

  classic: `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <linearGradient id="ic-cl-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE047" />
          <stop offset="50%" stop-color="#F59E0B" />
          <stop offset="100%" stop-color="#B45309" />
        </linearGradient>
        <linearGradient id="ic-cl-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#93C5FD" />
          <stop offset="50%" stop-color="#3B82F6" />
          <stop offset="100%" stop-color="#1D4ED8" />
        </linearGradient>
      </defs>
      <!-- Central Pillar & Stand Base -->
      <path d="M13 33 C13 31 27 31 27 33 L29 36 H11 Z" fill="url(#ic-cl-gold)"/>
      <rect x="18.5" y="8" width="3" height="24" rx="1.5" fill="url(#ic-cl-gold)"/>
      <circle cx="20" cy="8" r="3.5" fill="url(#ic-cl-gold)"/>

      <!-- Sturdy Balance Beam -->
      <path d="M6 13 C12 11 28 11 34 13 L33 16 C27 14 13 14 7 16 Z" fill="url(#ic-cl-gold)"/>

      <!-- Left Hanging Pan -->
      <line x1="7" y1="15" x2="4" y2="23" stroke="url(#ic-cl-gold)" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="11" y1="15" x2="14" y2="23" stroke="url(#ic-cl-gold)" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M3 23 C3 27.5 15 27.5 15 23 Z" fill="url(#ic-cl-gold)"/>

      <!-- Right Hanging Pan -->
      <line x1="29" y1="15" x2="26" y2="23" stroke="url(#ic-cl-gold)" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="33" y1="15" x2="36" y2="23" stroke="url(#ic-cl-gold)" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M25 23 C25 27.5 37 27.5 37 23 Z" fill="url(#ic-cl-gold)"/>

      <!-- Detective Center Gem / Badge -->
      <circle cx="20" cy="20" r="4.5" fill="#0F172A" stroke="url(#ic-cl-blue)" stroke-width="1.5"/>
      <circle cx="20" cy="20" r="2" fill="#93C5FD"/>
    </svg>
  `,
};

/**
 * Sleek MPGA brand logo SVG emblem
 */
export const mpgaLogoSvg = `
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
    <defs>
      <linearGradient id="mpga-red" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#EF4444" />
        <stop offset="50%" stop-color="#DC2626" />
        <stop offset="100%" stop-color="#991B1B" />
      </linearGradient>
      <linearGradient id="mpga-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE047" />
        <stop offset="50%" stop-color="#EAB308" />
        <stop offset="100%" stop-color="#A16207" />
      </linearGradient>
      <filter id="mpga-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#EF4444" flood-opacity="0.3"/>
      </filter>
    </defs>
    <!-- Background Shield Badge -->
    <path d="M24 4 L40 10 V24 C40 33 24 42 24 42 C24 42 8 33 8 24 V10 Z" fill="#18181B" stroke="url(#mpga-red)" stroke-width="2" filter="url(#mpga-shadow)"/>
    <!-- Noir Fedora Silhouette -->
    <path d="M17 21 C17 14 19 11 24 11 C29 11 31 14 31 21 Z" fill="url(#mpga-red)"/>
    <path d="M17 19 H31 V21.5 H17 Z" fill="url(#mpga-gold)"/>
    <path d="M12 23 C12 23 17 19.5 24 19.5 C31 19.5 36 23 36 23 C38 23 38 24.5 36 25.5 C31 27 17 27 12 25.5 C10 24.5 10 23 12 23 Z" fill="url(#mpga-red)"/>
    <!-- Mystery Sunglasses / Spotlight -->
    <path d="M19 28 L23 28 L22.5 31.5 L19.5 31.5 Z" fill="#09090B" stroke="#EF4444" stroke-width="0.8"/>
    <path d="M25 28 L29 28 L28.5 31.5 L25.5 31.5 Z" fill="#09090B" stroke="#EF4444" stroke-width="0.8"/>
    <line x1="23" y1="28.5" x2="25" y2="28.5" stroke="#EF4444" stroke-width="0.8"/>
    <!-- Rose Accent -->
    <circle cx="28.5" cy="34.5" r="2" fill="#EF4444"/>
    <circle cx="28.5" cy="34.5" r="0.8" fill="#FCA5A5"/>
  </svg>
`;

/**
 * Helper to fetch game mode illustration SVG string
 * @param {string} modeId - 'godfather' | 'classic'
 * @returns {string|null}
 */
export function getModeIllustration(modeId) {
  return modeSvgMap[modeId] || null;
}

/**
 * Helper to fetch game mode header icon SVG string
 * @param {string} modeId - 'godfather' | 'classic'
 * @returns {string|null}
 */
export function getScenarioIcon(modeId) {
  return scenarioIconSvgMap[modeId] || null;
}

/**
 * Helper to fetch MPGA brand logo SVG string
 * @returns {string}
 */
export function getMpgaLogo() {
  return mpgaLogoSvg;
}
