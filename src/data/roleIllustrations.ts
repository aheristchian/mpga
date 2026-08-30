/**
 * Curated SVG vector illustrations for Mafia roles.
 * Clean, scalable, high-contrast artwork fitting the dark 1930s noir mafia aesthetic.
 */

export const roleSvgMap: Record<string, string> = {
  godfather: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#1F1515" stroke="#EF4444" stroke-width="2"/>
      <!-- Fedora Hat -->
      <path d="M22 46 C22 46 32 40 50 40 C68 40 78 46 78 46 C84 46 86 48 78 50 C68 52 32 52 22 50 C14 48 16 46 22 46 Z" fill="#EF4444" opacity="0.9"/>
      <path d="M34 42 C34 32 40 26 50 26 C60 26 66 32 66 42 Z" fill="#DC2626"/>
      <path d="M34 40 H66 V43 H34 Z" fill="#7F1D1D"/>
      <!-- Collar & Tuxedo Tie -->
      <path d="M35 56 L50 68 L65 56 L50 82 Z" fill="#111827" stroke="#EF4444" stroke-width="1.5"/>
      <polygon points="46,58 54,58 52,72 48,72" fill="#DC2626"/>
      <!-- Rose Boutonniere -->
      <circle cx="36" cy="64" r="4" fill="#EF4444"/>
      <circle cx="36" cy="64" r="2" fill="#FCA5A5"/>
    </svg>
  `,

  mafia: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#1F1515" stroke="#EF4444" stroke-width="2"/>
      <!-- Dual Tommy Gun / Cross Weapons -->
      <rect x="25" y="46" width="50" height="8" rx="2" fill="#DC2626" opacity="0.8"/>
      <circle cx="36" cy="50" r="10" stroke="#EF4444" stroke-width="2.5" fill="#111827"/>
      <!-- Fedora Silhouette -->
      <path d="M26 42 C30 30 40 24 50 24 C60 24 70 30 74 42 Z" fill="#991B1B"/>
      <line x1="20" y1="42" x2="80" y2="42" stroke="#EF4444" stroke-width="3" stroke-linecap="round"/>
      <!-- Trench Mask -->
      <path d="M34 52 L50 64 L66 52 L50 78 Z" fill="#111827" stroke="#EF4444" stroke-width="1.5"/>
    </svg>
  `,

  detective: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#0F172A" stroke="#3B82F6" stroke-width="2"/>
      <!-- Magnifying Glass -->
      <circle cx="46" cy="44" r="20" stroke="#60A5FA" stroke-width="4" fill="#1E3A8A" fill-opacity="0.3"/>
      <line x1="60" y1="58" x2="78" y2="76" stroke="#93C5FD" stroke-width="6" stroke-linecap="round"/>
      <line x1="60" y1="58" x2="78" y2="76" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round"/>
      <!-- Detective Star Badge -->
      <polygon points="46,32 49,39 56,40 51,45 52,52 46,48 40,52 41,45 36,40 43,39" fill="#FBBF24" stroke="#D97706" stroke-width="1"/>
      <circle cx="46" cy="44" r="2" fill="#78350F"/>
    </svg>
  `,

  doctor: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#0F172A" stroke="#3B82F6" stroke-width="2"/>
      <!-- Medical Shield -->
      <path d="M50 20 L74 30 V52 C74 68 50 82 50 82 C50 82 26 68 26 52 V30 Z" fill="#1E293B" stroke="#60A5FA" stroke-width="2"/>
      <!-- Glowing Red/Green Cross -->
      <rect x="44" y="36" width="12" height="30" rx="3" fill="#10B981"/>
      <rect x="35" y="45" width="30" height="12" rx="3" fill="#10B981"/>
      <circle cx="50" cy="51" r="3" fill="#ECFDF5"/>
    </svg>
  `,

  citizen: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#0F172A" stroke="#64748B" stroke-width="2"/>
      <!-- Newspaper / Town Document -->
      <rect x="30" y="26" width="40" height="48" rx="4" fill="#F8FAFC" stroke="#94A3B8" stroke-width="2"/>
      <rect x="35" y="32" width="30" height="6" fill="#0F172A"/>
      <line x1="35" y1="44" x2="65" y2="44" stroke="#475569" stroke-width="2"/>
      <line x1="35" y1="50" x2="65" y2="50" stroke="#475569" stroke-width="2"/>
      <line x1="35" y1="56" x2="65" y2="56" stroke="#475569" stroke-width="2"/>
      <line x1="35" y1="62" x2="52" y2="62" stroke="#475569" stroke-width="2"/>
      <!-- Town Quill / Pen -->
      <polygon points="68,60 76,22 62,32" fill="#3B82F6" opacity="0.9"/>
    </svg>
  `,

  matador: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#1F1515" stroke="#EF4444" stroke-width="2"/>
      <!-- Red Muleta / Cape Flow -->
      <path d="M26 38 C38 24 62 24 74 38 C78 54 68 76 50 82 C32 76 22 54 26 38 Z" fill="#991B1B" stroke="#EF4444" stroke-width="2"/>
      <!-- Golden Bull Horns / Crest -->
      <path d="M30 46 C34 32 44 26 50 36 C56 26 66 32 70 46 C60 40 40 40 30 46 Z" fill="#F59E0B" stroke="#D97706" stroke-width="1.5"/>
      <circle cx="50" cy="52" r="6" fill="#111827" stroke="#EF4444" stroke-width="1.5"/>
    </svg>
  `,

  'saul-goodman': `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#1F1515" stroke="#EF4444" stroke-width="2"/>
      <!-- Briefcase & Lawyer Scales -->
      <rect x="28" y="42" width="44" height="34" rx="3" fill="#B45309" stroke="#F59E0B" stroke-width="2"/>
      <path d="M42 42 V34 C42 32 44 30 46 30 H54 C56 30 58 32 58 34 V42" stroke="#F59E0B" stroke-width="2" fill="none"/>
      <!-- Scales Icon Inside Briefcase -->
      <line x1="50" y1="48" x2="50" y2="68" stroke="#FEF3C7" stroke-width="2"/>
      <line x1="38" y1="52" x2="62" y2="52" stroke="#FEF3C7" stroke-width="2"/>
      <circle cx="38" cy="58" r="4" fill="#FEF3C7" fill-opacity="0.6"/>
      <circle cx="62" cy="58" r="4" fill="#FEF3C7" fill-opacity="0.6"/>
    </svg>
  `,

  leon: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#0F172A" stroke="#3B82F6" stroke-width="2"/>
      <!-- Sniper Crosshairs / Reticle -->
      <circle cx="50" cy="50" r="28" stroke="#60A5FA" stroke-width="2" stroke-dasharray="4 2"/>
      <circle cx="50" cy="50" r="14" stroke="#93C5FD" stroke-width="2"/>
      <circle cx="50" cy="50" r="3" fill="#EF4444"/>
      <line x1="50" y1="16" x2="50" y2="32" stroke="#60A5FA" stroke-width="2.5"/>
      <line x1="50" y1="68" x2="50" y2="84" stroke="#60A5FA" stroke-width="2.5"/>
      <line x1="16" y1="50" x2="32" y2="50" stroke="#60A5FA" stroke-width="2.5"/>
      <line x1="68" y1="50" x2="84" y2="50" stroke="#60A5FA" stroke-width="2.5"/>
    </svg>
  `,

  constantine: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#0F172A" stroke="#3B82F6" stroke-width="2"/>
      <!-- Resurrection Ankh & Phoenix Wings -->
      <path d="M22 62 C26 40 40 32 50 32 C60 32 74 40 78 62 C68 54 58 56 50 64 C42 56 32 54 22 62 Z" fill="#1D4ED8" opacity="0.6"/>
      <!-- Ankh Cross of Life -->
      <circle cx="50" cy="38" r="9" stroke="#60A5FA" stroke-width="3" fill="none"/>
      <line x1="50" y1="47" x2="50" y2="78" stroke="#60A5FA" stroke-width="4" stroke-linecap="round"/>
      <line x1="36" y1="56" x2="64" y2="56" stroke="#60A5FA" stroke-width="4" stroke-linecap="round"/>
      <circle cx="50" cy="38" r="3" fill="#FDE047"/>
    </svg>
  `,

  nostradamus: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#180F2A" stroke="#A855F7" stroke-width="2"/>
      <!-- Crystal Ball Stand -->
      <path d="M38 78 L62 78 L56 68 L44 68 Z" fill="#6B21A8" stroke="#C084FC" stroke-width="1.5"/>
      <!-- Crystal Ball Sphere -->
      <circle cx="50" cy="46" r="22" fill="#581C87" stroke="#E9D5FF" stroke-width="2"/>
      <!-- All Seeing Eye -->
      <path d="M36 46 C40 38 60 38 64 46 C60 54 40 54 36 46 Z" fill="#F3E8FF"/>
      <circle cx="50" cy="46" r="4" fill="#6B21A8"/>
      <circle cx="51" cy="45" r="1.5" fill="#FFFFFF"/>
      <!-- Mystic Sparkles -->
      <polygon points="32,24 34,28 38,30 34,32 32,36 30,32 26,30 30,28" fill="#FDE047"/>
      <polygon points="70,22 71,25 74,26 71,27 70,30 69,27 66,26 69,25" fill="#FDE047"/>
    </svg>
  `,

  default: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#1E293B" stroke="#64748B" stroke-width="2"/>
      <!-- Shadow Silhouette -->
      <circle cx="50" cy="40" r="14" fill="#475569"/>
      <path d="M28 76 C28 60 38 56 50 56 C62 56 72 60 72 76 Z" fill="#475569"/>
      <circle cx="50" cy="50" r="40" stroke="#94A3B8" stroke-dasharray="4 4" stroke-width="1"/>
    </svg>
  `,
};

/**
 * Returns the SVG string for a given role ID.
 */
export const getRoleIllustration = (roleId?: string | null): string => {
  if (!roleId) return roleSvgMap.default;
  return roleSvgMap[roleId] || roleSvgMap.default;
};
