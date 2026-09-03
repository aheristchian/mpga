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

  zodiac: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#2E1065" stroke="#A855F7" stroke-width="2"/>
      <!-- Zodiac Constellation Crosshairs -->
      <circle cx="50" cy="50" r="28" stroke="#C084FC" stroke-width="1.5" stroke-dasharray="3 3"/>
      <circle cx="50" cy="50" r="14" stroke="#E9D5FF" stroke-width="1.5"/>
      <line x1="50" y1="16" x2="50" y2="84" stroke="#C084FC" stroke-width="1.5"/>
      <line x1="16" y1="50" x2="84" y2="50" stroke="#C084FC" stroke-width="1.5"/>
      <!-- Golden Arrow / Assassin Dagger -->
      <path d="M50 22 L54 44 L50 48 L46 44 Z" fill="#FBBF24"/>
      <line x1="50" y1="48" x2="50" y2="70" stroke="#FDE047" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="50" cy="72" r="2" fill="#FBBF24"/>
      <!-- Moon & Star Accent -->
      <path d="M72 26 C68 28 66 34 68 38 C64 36 62 30 65 24 Z" fill="#FDE047"/>
    </svg>
  `,

  bodyguard: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#064E3B" stroke="#10B981" stroke-width="2"/>
      <!-- Heavy Aegis Shield -->
      <path d="M50 18 L76 28 V54 C76 72 50 86 50 86 C50 86 24 72 24 54 V28 Z" fill="#047857" stroke="#34D399" stroke-width="2"/>
      <path d="M50 24 L70 32 V52 C70 66 50 78 50 78 C50 78 30 66 30 52 V32 Z" fill="#065F46"/>
      <!-- Star of Protection -->
      <polygon points="50,38 53,46 62,46 55,51 58,59 50,54 42,59 45,51 38,46 47,46" fill="#FDE047" stroke="#F59E0B" stroke-width="1"/>
      <circle cx="50" cy="50" r="3" fill="#D97706"/>
    </svg>
  `,

  silencer: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#1C1917" stroke="#DC2626" stroke-width="2"/>
      <!-- Mute Mask & Zipped Lips -->
      <circle cx="50" cy="45" r="22" fill="#292524" stroke="#78350F" stroke-width="1.5"/>
      <ellipse cx="42" cy="40" rx="3" ry="4" fill="#0C0A09"/>
      <ellipse cx="58" cy="40" rx="3" ry="4" fill="#0C0A09"/>
      <!-- Zipper / Padlock over Mouth -->
      <rect x="36" y="52" width="28" height="6" rx="2" fill="#DC2626"/>
      <line x1="40" y1="52" x2="40" y2="58" stroke="#FFFFFF" stroke-width="1.5"/>
      <line x1="46" y1="52" x2="46" y2="58" stroke="#FFFFFF" stroke-width="1.5"/>
      <line x1="54" y1="52" x2="54" y2="58" stroke="#FFFFFF" stroke-width="1.5"/>
      <line x1="60" y1="52" x2="60" y2="58" stroke="#FFFFFF" stroke-width="1.5"/>
      <!-- Finger on lips gesture silhouette -->
      <path d="M48 46 L52 46 L52 64 L48 64 Z" fill="#78350F" opacity="0.4"/>
      <!-- Cancel / Mute Slash -->
      <line x1="28" y1="72" x2="72" y2="28" stroke="#EF4444" stroke-width="2" stroke-dasharray="4 2"/>
    </svg>
  `,

  priest: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#1E1B4B" stroke="#F59E0B" stroke-width="2"/>
      <!-- Radiant Halo Aura -->
      <circle cx="50" cy="48" r="30" stroke="#FDE047" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/>
      <!-- Holy Dove of Peace & Cleansing -->
      <path d="M50 30 C45 36 32 38 24 34 C30 46 44 46 46 54 C48 50 54 44 68 44 C72 38 62 34 56 36 C54 33 52 30 50 30 Z" fill="#F8FAFC" opacity="0.9"/>
      <!-- Golden Cross of Absolution -->
      <rect x="47" y="44" width="6" height="34" rx="2" fill="#FBBF24"/>
      <rect x="38" y="52" width="24" height="6" rx="2" fill="#FBBF24"/>
      <circle cx="50" cy="55" r="3" fill="#FFFFFF"/>
    </svg>
  `,

  'zero-day': `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#09090B" stroke="#DC2626" stroke-width="2"/>
      <!-- Terminal window frame -->
      <rect x="22" y="24" width="56" height="52" rx="4" fill="#18181B" stroke="#EF4444" stroke-width="1.5"/>
      <rect x="22" y="24" width="56" height="10" rx="4" fill="#27272A"/>
      <circle cx="28" cy="29" r="1.5" fill="#EF4444"/>
      <circle cx="33" cy="29" r="1.5" fill="#FBBF24"/>
      <circle cx="38" cy="29" r="1.5" fill="#10B981"/>
      <!-- Zero Day skull mask -->
      <path d="M38 42 C38 36 44 34 50 34 C56 34 62 36 62 42 C62 48 58 52 58 56 H42 C42 52 38 48 38 42 Z" fill="#DC2626"/>
      <circle cx="45" cy="44" r="2.5" fill="#09090B"/>
      <circle cx="55" cy="44" r="2.5" fill="#09090B"/>
      <!-- Teeth / binary bars -->
      <rect x="44" y="58" width="3" height="4" fill="#DC2626"/>
      <rect x="49" y="58" width="3" height="4" fill="#DC2626"/>
      <rect x="54" y="58" width="3" height="4" fill="#DC2626"/>
      <text x="50" y="71" font-size="7" font-weight="900" fill="#EF4444" text-anchor="middle" font-family="monospace">0-DAY</text>
    </svg>
  `,

  'botnet-op': `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#18181B" stroke="#F97316" stroke-width="2"/>
      <!-- Central Satellite Dish / Transmitter -->
      <path d="M35 60 C35 44 55 35 65 45 C75 55 66 75 50 75" stroke="#FB923C" stroke-width="3" fill="none" stroke-linecap="round"/>
      <line x1="50" y1="52" x2="68" y2="34" stroke="#EA580C" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="68" cy="34" r="3" fill="#EF4444"/>
      <!-- Pulse Attack Waves -->
      <path d="M72 26 C76 30 76 38 72 42" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
      <path d="M78 20 C84 26 84 44 78 50" stroke="#EF4444" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2 2"/>
      <!-- Base stand -->
      <polygon points="40,82 60,82 52,68 48,68" fill="#7C2D12"/>
    </svg>
  `,

  phisher: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#1C1917" stroke="#A855F7" stroke-width="2"/>
      <!-- Digital Fishing Hook -->
      <path d="M50 22 V50 C50 62 38 62 38 52 C38 46 44 46 44 50" stroke="#C084FC" stroke-width="3" stroke-linecap="round" fill="none"/>
      <!-- Snared Padlock / Credentials -->
      <rect x="52" y="44" width="22" height="18" rx="3" fill="#6B21A8" stroke="#E9D5FF" stroke-width="1.5"/>
      <path d="M57 44 V38 C57 34 69 34 69 38 V44" stroke="#E9D5FF" stroke-width="1.8" fill="none"/>
      <circle cx="63" cy="52" r="2" fill="#FDE047"/>
      <!-- Bait sparkles -->
      <circle cx="48" cy="20" r="1.5" fill="#E9D5FF"/>
      <circle cx="34" cy="52" r="1.5" fill="#EF4444"/>
    </svg>
  `,

  'black-hat': `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#111827" stroke="#EF4444" stroke-width="2"/>
      <!-- Black Fedora with Red Cyber Visor -->
      <path d="M30 42 C30 32 38 26 50 26 C62 26 70 32 70 42 Z" fill="#1F2937" stroke="#374151" stroke-width="1.5"/>
      <line x1="20" y1="42" x2="80" y2="42" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
      <!-- Glowing Red Cyber Visor -->
      <rect x="32" y="48" width="36" height="8" rx="2" fill="#DC2626"/>
      <line x1="34" y1="52" x2="66" y2="52" stroke="#FCA5A5" stroke-width="1.5"/>
      <!-- Trench Coat / Hood -->
      <path d="M32 60 L50 74 L68 60 L50 84 Z" fill="#1F2937" stroke="#EF4444" stroke-width="1.2"/>
    </svg>
  `,

  'firewall-server': `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#022C22" stroke="#10B981" stroke-width="2"/>
      <!-- Server Unit -->
      <rect x="26" y="24" width="48" height="52" rx="4" fill="#064E3B" stroke="#059669" stroke-width="1.5"/>
      <line x1="30" y1="36" x2="70" y2="36" stroke="#34D399" stroke-width="1"/>
      <line x1="30" y1="48" x2="70" y2="48" stroke="#34D399" stroke-width="1"/>
      <line x1="30" y1="60" x2="70" y2="60" stroke="#34D399" stroke-width="1"/>
      <!-- Blinking Status LEDs -->
      <circle cx="34" cy="30" r="2" fill="#34D399"/>
      <circle cx="40" cy="30" r="2" fill="#38BDF8"/>
      <circle cx="34" cy="42" r="2" fill="#34D399"/>
      <circle cx="40" cy="42" r="2" fill="#34D399"/>
      <!-- Glowing Shield Core Overlay -->
      <path d="M50 40 L64 46 V58 C64 68 50 74 50 74 C50 74 36 68 36 58 V46 Z" fill="#0F172A" stroke="#10B981" stroke-width="2"/>
      <path d="M50 46 L58 50 V58 C58 64 50 68 50 68 C50 68 42 64 42 58 V50 Z" fill="#10B981" opacity="0.6"/>
    </svg>
  `,

  'sec-analyst': `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#0B132B" stroke="#38BDF8" stroke-width="2"/>
      <!-- Sniffer Radar / Magnifying Glass -->
      <circle cx="45" cy="45" r="20" stroke="#38BDF8" stroke-width="3" fill="#1C2541" fill-opacity="0.5"/>
      <line x1="58" y1="58" x2="76" y2="76" stroke="#38BDF8" stroke-width="5" stroke-linecap="round"/>
      <line x1="58" y1="58" x2="76" y2="76" stroke="#0284C7" stroke-width="2" stroke-linecap="round"/>
      <!-- Pulse Sweep & Target Grid -->
      <line x1="45" y1="30" x2="45" y2="60" stroke="#7DD3FC" stroke-width="1" stroke-dasharray="2 2"/>
      <line x1="30" y1="45" x2="60" y2="45" stroke="#7DD3FC" stroke-width="1" stroke-dasharray="2 2"/>
      <circle cx="45" cy="45" r="8" stroke="#BAE6FD" stroke-width="1.2"/>
      <circle cx="50" cy="40" r="2" fill="#34D399"/>
    </svg>
  `,

  'white-hat': `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#0F172A" stroke="#F8FAFC" stroke-width="2"/>
      <!-- Pure White Hat Crown & Brim -->
      <path d="M30 42 C30 30 38 24 50 24 C62 24 70 30 70 42 Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
      <line x1="18" y1="42" x2="82" y2="42" stroke="#F8FAFC" stroke-width="3.5" stroke-linecap="round"/>
      <rect x="30" y="39" width="40" height="3" fill="#0EA5E9"/>
      <!-- Electric Counter-Strike Lightning Bolt -->
      <polygon points="52,48 44,60 49,60 46,74 58,58 51,58" fill="#38BDF8" stroke="#0284C7" stroke-width="1"/>
    </svg>
  `,

  'devops-admin': `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#1E1B4B" stroke="#F59E0B" stroke-width="2"/>
      <!-- Golden Authentication Key & Credentials Token -->
      <circle cx="40" cy="40" r="14" stroke="#FBBF24" stroke-width="3.5" fill="#312E81"/>
      <circle cx="40" cy="40" r="6" fill="#FDE047"/>
      <!-- Key Stem and Teeth -->
      <path d="M50 50 L72 72 L66 78 L60 72 L58 74 L52 68" stroke="#FBBF24" stroke-width="3" stroke-linecap="round" fill="none"/>
      <!-- Infinite Terminal Infinity Loop -->
      <path d="M34 74 C30 70 30 64 34 60 C38 56 42 64 46 68 C50 72 54 74 58 70" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    </svg>
  `,

  'sys-user': `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#0F172A" stroke="#64748B" stroke-width="2"/>
      <!-- User Head & Torso with Code Brackets -->
      <circle cx="50" cy="38" r="13" fill="#475569" stroke="#94A3B8" stroke-width="1.5"/>
      <path d="M28 72 C28 58 38 54 50 54 C62 54 72 58 72 72 Z" fill="#334155" stroke="#94A3B8" stroke-width="1.5"/>
      <!-- Code Brackets { } -->
      <text x="22" y="52" font-size="20" font-weight="900" fill="#38BDF8" font-family="monospace">{</text>
      <text x="70" y="52" font-size="20" font-weight="900" fill="#38BDF8" font-family="monospace">}</text>
    </svg>
  `,

  'rogue-ai': `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="#180D2B" stroke="#A855F7" stroke-width="2"/>
      <!-- Neural Network Tentacles / Circuit Pathways -->
      <path d="M50 20 L50 32 M24 38 L36 44 M76 38 L64 44 M28 66 L38 58 M72 66 L62 58 M50 80 L50 68" stroke="#C084FC" stroke-width="2" stroke-linecap="round"/>
      <circle cx="50" cy="20" r="2.5" fill="#E879F9"/>
      <circle cx="24" cy="38" r="2.5" fill="#E879F9"/>
      <circle cx="76" cy="38" r="2.5" fill="#E879F9"/>
      <circle cx="28" cy="66" r="2.5" fill="#E879F9"/>
      <circle cx="72" cy="66" r="2.5" fill="#E879F9"/>
      <circle cx="50" cy="80" r="2.5" fill="#E879F9"/>
      <!-- Central Glowing AI Aperture Core -->
      <circle cx="50" cy="50" r="16" fill="#4C1D95" stroke="#A855F7" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="9" fill="#7C3AED" stroke="#E879F9" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="4" fill="#EF4444"/>
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
