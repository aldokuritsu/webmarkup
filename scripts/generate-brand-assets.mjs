/**
 * Génère les visuels de marque à partir du logo (courbe statistique montante) :
 * favicons et image Open Graph par défaut.
 *
 * Usage : node scripts/generate-brand-assets.mjs
 */
import sharp from 'sharp';

const INK = '#0b0413';
const VIOLET = ['#a674ff', '#8b3dff', '#7c1fff', '#6a0fdb'];
const SPRING = '#14e894';

/** Le pictogramme seul, sur fond encre — lisible jusqu'à 32 px. */
const markSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="11" fill="${INK}"/>
  <rect x="7"  y="30" width="6.5" height="11" rx="2.2" fill="${VIOLET[0]}"/>
  <rect x="16" y="25" width="6.5" height="16" rx="2.2" fill="${VIOLET[1]}"/>
  <rect x="25" y="20" width="6.5" height="21" rx="2.2" fill="${VIOLET[2]}"/>
  <rect x="34" y="14" width="6.5" height="27" rx="2.2" fill="${VIOLET[3]}"/>
  <path d="M6 32C12.5 32 16.5 23.5 22.5 18C27 13.9 32 10.6 39 8.5"
        fill="none" stroke="${SPRING}" stroke-width="4" stroke-linecap="round"/>
  <path d="M32 7.5H41V16.5" fill="none" stroke="${SPRING}" stroke-width="4"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0413"/>
      <stop offset="55%" stop-color="#22064a"/>
      <stop offset="100%" stop-color="#3a0b72"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.88" cy="0.12" r="0.62">
      <stop offset="0%" stop-color="${SPRING}" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="${SPRING}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bar" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#6a0fdb" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#a674ff"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- courbe de marque, en grand, côté droit -->
  <g opacity="0.9" transform="translate(770,150)">
    <rect x="0"   y="230" width="52" height="120" rx="14" fill="url(#bar)"/>
    <rect x="80"  y="180" width="52" height="170" rx="14" fill="url(#bar)"/>
    <rect x="160" y="120" width="52" height="230" rx="14" fill="url(#bar)"/>
    <rect x="240" y="50"  width="52" height="300" rx="14" fill="url(#bar)"/>
    <path d="M-14 320C50 320 90 250 150 200C215 146 260 100 300 40"
          fill="none" stroke="${SPRING}" stroke-width="12" stroke-linecap="round"/>
    <path d="M266 26H310V70" fill="none" stroke="${SPRING}" stroke-width="12"
          stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- pictogramme + nom -->
  <g transform="translate(88,86) scale(1.45)">
    <rect x="4"  y="31" width="7" height="12" rx="2.5" fill="${VIOLET[0]}"/>
    <rect x="14" y="25" width="7" height="18" rx="2.5" fill="${VIOLET[1]}"/>
    <rect x="24" y="19" width="7" height="24" rx="2.5" fill="${VIOLET[2]}"/>
    <rect x="34" y="11" width="7" height="32" rx="2.5" fill="${VIOLET[3]}"/>
    <path d="M3 34C11 34 15.5 23.5 23 16.5C28.5 11.4 34.5 7.5 43 5"
          fill="none" stroke="${SPRING}" stroke-width="4.2" stroke-linecap="round"/>
    <path d="M34.5 4.5H44V14" fill="none" stroke="${SPRING}" stroke-width="4.2"
          stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="188" y="152" font-family="Helvetica,Arial,sans-serif" font-size="46" font-weight="700"
        fill="#ffffff" letter-spacing="-1">Webmark<tspan fill="${SPRING}">'</tspan>up</text>

  <text x="88" y="330" font-family="Helvetica,Arial,sans-serif" font-size="86" font-weight="700"
        fill="#ffffff" letter-spacing="-3">Elevons votre</text>
  <text x="88" y="420" font-family="Helvetica,Arial,sans-serif" font-size="86" font-weight="700"
        letter-spacing="-3" xml:space="preserve"><tspan fill="${SPRING}">présence</tspan><tspan fill="#ffffff"> en ligne</tspan></text>

  <text x="88" y="502" font-family="Helvetica,Arial,sans-serif" font-size="30" fill="#c2a4ff">
    Agence web à Rouen — création de site, SEO, SEA, maintenance
  </text>
  <rect x="88" y="540" width="128" height="8" rx="4" fill="${SPRING}"/>
</svg>`;

const targets = [
  ['public/favicon-32.png', markSvg(32)],
  ['public/favicon-512.png', markSvg(512)],
  ['public/apple-touch-icon.png', markSvg(180)],
];

for (const [file, svg] of targets) {
  await sharp(Buffer.from(svg)).png().toFile(file);
  console.log(`✓ ${file}`);
}

await sharp(Buffer.from(ogSvg)).png().toFile('public/og-default.png');
console.log('✓ public/og-default.png');
