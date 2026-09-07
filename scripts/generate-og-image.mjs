/**
 * Génère l'image Open Graph par défaut (public/og-default.png).
 * Usage : node scripts/generate-og-image.mjs
 */
import sharp from 'sharp';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0f16"/>
      <stop offset="55%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#0c4f6e"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15" r="0.6">
      <stop offset="0%" stop-color="#00aded" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#00aded" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(96,150)">
    <rect width="88" height="88" rx="22" fill="#00aded"/>
    <path d="M24 62c11.9 0 20.2-6.6 20.2-18.3V31" fill="none" stroke="#fff" stroke-width="8.2" stroke-linecap="round"/>
    <path d="M44 22.9 57.8 38.5H30.2L44 22.9Z" fill="#fff"/>
  </g>
  <text x="204" y="212" font-family="Helvetica,Arial,sans-serif" font-size="52" font-weight="700" fill="#ffffff">Webmark<tspan fill="#00aded">'</tspan>up</text>
  <text x="96" y="330" font-family="Helvetica,Arial,sans-serif" font-size="72" font-weight="700" fill="#ffffff">Elevons votre présence</text>
  <text x="96" y="416" font-family="Helvetica,Arial,sans-serif" font-size="72" font-weight="700" fill="#ffffff">en ligne</text>
  <text x="96" y="500" font-family="Helvetica,Arial,sans-serif" font-size="34" fill="#94a3b8">Agence web à Rouen — création de site, SEO, SEA, maintenance</text>
  <rect x="96" y="546" width="120" height="6" rx="3" fill="#00aded"/>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile('public/og-default.png');
console.log('og-default.png généré');
