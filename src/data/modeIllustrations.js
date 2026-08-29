/**
 * Curated SVG vector illustrations for MPGA Game Modes.
 * High-contrast, scalable vector artwork fitting the dark 1930s noir mafia aesthetic.
 */

export const modeSvgMap = {
  godfather: `
    <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <linearGradient id="gf-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b0712" />
          <stop offset="50%" stop-color="#18181b" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <linearGradient id="gf-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE047" />
          <stop offset="100%" stop-color="#CA8A04" />
        </linearGradient>
        <linearGradient id="gf-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#EF4444" />
          <stop offset="100%" stop-color="#991B1B" />
        </linearGradient>
      </defs>

      <!-- Background Crest Card -->
      <rect x="4" y="4" width="152" height="112" rx="16" fill="url(#gf-bg)" stroke="#DC2626" stroke-width="1.5" stroke-opacity="0.4"/>
      
      <!-- Noir City Skyline Silhouette in Background -->
      <path d="M12 90 L24 90 L24 64 L34 64 L34 76 L44 76 L44 52 L54 52 L54 90 L106 90 L106 58 L116 58 L116 48 L126 48 L126 68 L136 68 L136 84 L148 84 L148 90 Z" fill="#27272a" opacity="0.45"/>
      <line x1="12" y1="90" x2="148" y2="90" stroke="#52525b" stroke-width="1.5"/>

      <!-- Moonlight / Spotlight Glow -->
      <circle cx="80" cy="46" r="34" fill="#EF4444" opacity="0.12" />
      <circle cx="80" cy="46" r="24" fill="#F59E0B" opacity="0.08" />

      <!-- Center Godfather Fedora & Silhouette -->
      <!-- Hat Brim -->
      <path d="M42 46 C42 46 58 38 80 38 C102 38 118 46 118 46 C126 46 128 49 118 52 C104 55 56 55 42 52 C32 49 34 46 42 46 Z" fill="url(#gf-red)"/>
      <!-- Hat Crown -->
      <path d="M56 42 C56 26 64 20 80 20 C96 20 104 26 104 42 Z" fill="#991B1B"/>
      <!-- Hat Ribbon Gold Accent -->
      <path d="M56 39 H104 V43 H56 Z" fill="url(#gf-gold)"/>

      <!-- Sunglasses / Eyes of Mystery -->
      <polygon points="62,56 74,56 72,64 64,64" fill="#18181b" stroke="#EF4444" stroke-width="1"/>
      <polygon points="86,56 98,56 96,64 88,64" fill="#18181b" stroke="#EF4444" stroke-width="1"/>
      <line x1="74" y1="58" x2="86" y2="58" stroke="#EF4444" stroke-width="1"/>

      <!-- Tuxedo Lapels and Red Rose -->
      <path d="M58 68 L80 84 L102 68 L80 102 Z" fill="#09090b" stroke="#71717a" stroke-width="1.5"/>
      <polygon points="75,70 85,70 83,88 77,88" fill="#DC2626"/>
      <!-- Rose Boutonniere -->
      <circle cx="60" cy="78" r="4.5" fill="#EF4444"/>
      <circle cx="60" cy="78" r="2" fill="#FECACA"/>

      <!-- Gold Tournament Star Badges -->
      <polygon points="26,20 28,26 34,26 29,30 31,36 26,32 21,36 23,30 18,26 24,26" fill="url(#gf-gold)"/>
      <polygon points="134,20 136,26 142,26 137,30 139,36 134,32 129,36 131,30 126,26 132,26" fill="url(#gf-gold)"/>
    </svg>
  `,

  classic: `
    <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <linearGradient id="cl-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="50%" stop-color="#18181b" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <linearGradient id="cl-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#60A5FA" />
          <stop offset="100%" stop-color="#2563EB" />
        </linearGradient>
        <linearGradient id="cl-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FCD34D" />
          <stop offset="100%" stop-color="#D97706" />
        </linearGradient>
      </defs>

      <!-- Background Crest Card -->
      <rect x="4" y="4" width="152" height="112" rx="16" fill="url(#cl-bg)" stroke="#3B82F6" stroke-width="1.5" stroke-opacity="0.4"/>
      
      <!-- Vintage Town Hall / Clock Tower & Houses -->
      <path d="M12 90 L24 90 L24 68 L36 54 L48 68 L48 90 L70 90 L70 42 L80 24 L90 42 L90 90 L112 90 L112 68 L124 54 L136 68 L136 90 L148 90 Z" fill="#1e293b" opacity="0.6"/>
      <!-- Clock Tower Face -->
      <circle cx="80" cy="46" r="9" fill="#0f172a" stroke="#60A5FA" stroke-width="1.5"/>
      <line x1="80" y1="46" x2="80" y2="41" stroke="#93C5FD" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="80" y1="46" x2="84" y2="46" stroke="#93C5FD" stroke-width="1.5" stroke-linecap="round"/>
      
      <!-- Vintage Street Lamppost on Left -->
      <line x1="30" y1="90" x2="30" y2="34" stroke="#64748B" stroke-width="2"/>
      <path d="M25 34 L35 34 L33 26 L27 26 Z" fill="#F59E0B"/>
      <!-- Glowing Lantern Halo -->
      <circle cx="30" cy="30" r="10" fill="#FBBF24" opacity="0.25"/>

      <!-- Detective Magnifying Glass & Doctor Cross Balance on Right -->
      <!-- Magnifying Glass -->
      <circle cx="120" cy="46" r="14" stroke="#60A5FA" stroke-width="3" fill="#1E3A8A" fill-opacity="0.4"/>
      <line x1="130" y1="56" x2="142" y2="68" stroke="#93C5FD" stroke-width="4" stroke-linecap="round"/>
      <!-- Medical Plus in lens -->
      <rect x="117.5" y="40" width="5" height="12" rx="1.5" fill="#34D399"/>
      <rect x="114" y="43.5" width="12" height="5" rx="1.5" fill="#34D399"/>

      <!-- Central Scales of Justice / Fair Play Balance -->
      <circle cx="80" cy="74" r="18" fill="#1e1b4b" opacity="0.6"/>
      <line x1="64" y1="72" x2="96" y2="72" stroke="url(#cl-gold)" stroke-width="2"/>
      <line x1="80" y1="62" x2="80" y2="86" stroke="url(#cl-gold)" stroke-width="2"/>
      <!-- Left Pan -->
      <path d="M60 78 L68 78 L64 84 Z" fill="url(#cl-gold)"/>
      <line x1="64" y1="72" x2="64" y2="78" stroke="url(#cl-gold)" stroke-width="1"/>
      <!-- Right Pan -->
      <path d="M92 78 L100 78 L96 84 Z" fill="url(#cl-gold)"/>
      <line x1="96" y1="72" x2="96" y2="78" stroke="url(#cl-gold)" stroke-width="1"/>

      <!-- Ground Base Line -->
      <line x1="12" y1="90" x2="148" y2="90" stroke="#475569" stroke-width="1.5"/>
    </svg>
  `,
};

/**
 * Helper to fetch game mode illustration SVG string
 * @param {string} modeId - 'godfather' | 'classic'
 * @returns {string|null}
 */
export function getModeIllustration(modeId) {
  return modeSvgMap[modeId] || null;
}
