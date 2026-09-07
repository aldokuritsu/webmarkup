/**
 * Télécharge les photos d'illustration listées dans photos.config.json
 * vers src/assets/photos/, où le composant <Photo /> les récupère.
 *
 * Usage : node scripts/fetch-photos.mjs
 *
 * Tant qu'une URL est vide, <Photo /> affiche une composition graphique aux
 * couleurs de la marque : le site reste complet.
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEST = path.join(ROOT, 'src/assets/photos');
const CREDITS = path.join(ROOT, 'src/data/photo-credits.json');

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/avif': '.avif' };

const config = JSON.parse(await readFile(path.join(ROOT, 'photos.config.json'), 'utf8'));
await mkdir(DEST, { recursive: true });

const credits = {};
let downloaded = 0;

for (const [name, entry] of Object.entries(config.photos)) {
  if (!entry.url) {
    console.log(`· ${name} : pas d'URL renseignée, on garde le visuel de repli`);
    continue;
  }

  const res = await fetch(entry.url, {
    headers: { 'User-Agent': 'webmarkup-site-build' },
  });
  if (!res.ok) {
    console.warn(`⚠ ${name} : ${entry.url} → ${res.status}`);
    continue;
  }

  const ext = EXT[res.headers.get('content-type')?.split(';')[0] ?? ''] ?? '.jpg';
  const file = path.join(DEST, `${name}${ext}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  console.log(`✓ ${name}${ext}`);
  downloaded += 1;

  if (entry.credit) credits[name] = entry.credit;
}

if (Object.keys(credits).length > 0) {
  await writeFile(CREDITS, `${JSON.stringify(credits, null, 2)}\n`);
  console.log(`✓ crédits écrits dans src/data/photo-credits.json`);
}

console.log(`\n${downloaded} photo(s) téléchargée(s).`);
