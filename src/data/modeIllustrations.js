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
          <stop offset="0%" stop-color="#1E3A8A" stop-opacity="0.4" />
          <stop offset="60%" stop-color="#172554" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#09090B" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="cl-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#93C5FD" />
          <stop offset="50%" stop-color="#3B82F6" />
          <stop offset="100%" stop-color="#1D4ED8" />
        </linearGradient>
        <linearGradient id="cl-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE047" />
          <stop offset="50%" stop-color="#F59E0B" />
          <stop offset="100%" stop-color="#B45309" />
        </linearGradient>
        <filter id="cl-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Atmospheric Radial Spotlight & Backdrop -->
      <rect width="200" height="130" rx="12" fill="url(#cl-spot)" />

      <!-- Vintage Town Hall / Clock Tower & Houses -->
      <path d="M12 105 L26 105 L26 78 L40 64 L54 78 L54 105 L78 105 L78 50 L100 28 L122 50 L122 105 L146 105 L146 78 L160 64 L174 78 L174 105 L188 105 Z" fill="#1E293B" opacity="0.65"/>
      <line x1="10" y1="105" x2="190" y2="105" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>

      <!-- Clock Tower Halo & Face -->
      <circle cx="100" cy="56" r="14" fill="#0F172A" stroke="#60A5FA" stroke-width="2"/>
      <line x1="100" y1="56" x2="100" y2="48" stroke="#93C5FD" stroke-width="2" stroke-linecap="round"/>
      <line x1="100" y1="56" x2="106" y2="56" stroke="#93C5FD" stroke-width="2" stroke-linecap="round"/>
      <circle cx="100" cy="56" r="2" fill="#FBBF24"/>

      <!-- Vintage Street Lamppost on Left -->
      <line x1="36" y1="105" x2="36" y2="40" stroke="#64748B" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M30 40 L42 40 L39 30 L33 30 Z" fill="#D97706"/>
      <circle cx="36" cy="35" r="14" fill="#F59E0B" opacity="0.25" filter="url(#cl-glow)"/>
      <circle cx="36" cy="35" r="4" fill="#FEF08A"/>

      <!-- Detective Magnifying Glass & Doctor Cross on Right -->
      <circle cx="156" cy="54" r="18" stroke="#60A5FA" stroke-width="3" fill="#1E3A8A" fill-opacity="0.4"/>
      <line x1="168" y1="67" x2="182" y2="81" stroke="#93C5FD" stroke-width="5" stroke-linecap="round"/>
      <!-- Medical Cross inside lens -->
      <rect x="153.5" y="45" width="5" height="18" rx="2" fill="#34D399"/>
      <rect x="147" y="51.5" width="18" height="5" rx="2" fill="#34D399"/>

      <!-- Golden Scales of Justice in Foreground -->
      <line x1="78" y1="84" x2="122" y2="84" stroke="url(#cl-gold)" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="100" y1="72" x2="100" y2="102" stroke="url(#cl-gold)" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="100" cy="72" r="3.5" fill="url(#cl-gold)"/>
      <!-- Left Pan -->
      <path d="M72 92 L84 92 L78 100 Z" fill="url(#cl-gold)"/>
      <line x1="78" y1="84" x2="78" y2="92" stroke="url(#cl-gold)" stroke-width="1.2"/>
      <!-- Right Pan -->
      <path d="M116 92 L128 92 L122 100 Z" fill="url(#cl-gold)"/>
      <line x1="122" y1="84" x2="122" y2="92" stroke="url(#cl-gold)" stroke-width="1.2"/>
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
