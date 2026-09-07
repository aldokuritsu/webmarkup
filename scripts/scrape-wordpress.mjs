/**
 * Récupère les contenus de l'ancien site WordPress (webmark-up.com) via l'API REST
 * et les convertit en fichiers Markdown + images locales consommés par Astro.
 *
 * Usage : node scripts/scrape-wordpress.mjs [--source https://webmark-up.com]
 *
 * Le script est idempotent : il réécrit `src/content/blog`, `src/content/pages`
 * et télécharge les images manquantes dans `src/assets/images`.
 */
import { mkdir, writeFile, readdir, unlink, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE =
  process.argv.find((a) => a.startsWith('--source='))?.split('=')[1] ?? 'https://webmark-up.com';

const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const PAGES_DIR = path.join(ROOT, 'src/content/pages');
const IMG_DIR = path.join(ROOT, 'src/assets/images');

/** Pages exportées en Markdown (les autres sont des gabarits Astro sur mesure). */
const MARKDOWN_PAGES = new Set(['privacy-policy', 'un-webmaster-dedie-corps-et-ame-a-votre-projet']);

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
});

/** Récupère toutes les pages d'une collection paginée. */
async function apiAll(type, params = '') {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`${SOURCE}/wp-json/wp/v2/${type}?per_page=100&page=${page}${params}`);
    if (res.status === 400) break; // plus de pages
    if (!res.ok) throw new Error(`GET ${type} page ${page} → ${res.status}`);
    const batch = await res.json();
    out.push(...batch);
    const total = Number(res.headers.get('x-wp-totalpages') ?? '1');
    if (page >= total) break;
  }
  return out;
}

const decodeEntities = (s = '') =>
  s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&hellip;/g, '…')
    .replace(/&eacute;/g, 'é')
    .trim();

/** Le contenu WP contient des résidus d'extension navigateur (simple-translate) : on les retire. */
const stripJunk = (html) =>
  html
    .replace(/<div id="simple-translate"[\s\S]*$/i, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

/** `image-768x513.jpg` → `image.jpg` : on veut toujours le fichier d'origine. */
const originalName = (url) =>
  decodeURIComponent(path.basename(new URL(url).pathname)).replace(
    /-\d+x\d+(\.[a-z0-9]+)$/i,
    '$1',
  );

const toMarkdown = (html) => turndown.turndown(stripJunk(html)).replace(/\n{3,}/g, '\n\n').trim();

/** Résumé court et propre à partir du contenu (les excerpts WP embarquent un « Continue Reading »). */
function makeDescription(html, max = 165) {
  const text = decodeEntities(
    stripJunk(html)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' '),
  );
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 0)).replace(/[,;:.\s]+$/, '')}…`;
}

const yaml = (value) => `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** Télécharge une image (en pleine résolution) et renvoie son nom de fichier local. */
async function downloadImage(url) {
  if (!url) return undefined;
  const name = originalName(url);
  const dest = path.join(IMG_DIR, name);
  if (await exists(dest)) return name;
  const fullSize = url.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1');
  const res = await fetch(fullSize);
  if (!res.ok) {
    console.warn(`  ⚠ image ${fullSize} → ${res.status}`);
    return undefined;
  }
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  console.log(`  ↓ ${name}`);
  return name;
}

/**
 * Rapatrie les images insérées dans le corps du contenu et réécrit leur `src`
 * vers `src/assets/images` (Astro les optimise ensuite). Une image identique à
 * l'image mise en avant est retirée : elle ferait doublon avec le visuel d'entête.
 */
async function localiseInlineImages(html, featuredName) {
  const sources = [...html.matchAll(/<img[^>]+src="([^"]+)"/gi)].map((m) => m[1]);
  let out = html;

  for (const src of new Set(sources)) {
    if (!src.startsWith('http')) continue;
    const name = originalName(src);

    if (featuredName && name === featuredName) {
      // supprime la balise <img> (et le lien/figure qui l'enveloppe éventuellement)
      out = out.replace(
        new RegExp(`<a[^>]*>\\s*<img[^>]+src="${escapeRegExp(src)}"[^>]*>\\s*</a>`, 'gi'),
        '',
      );
      out = out.replace(new RegExp(`<img[^>]+src="${escapeRegExp(src)}"[^>]*>`, 'gi'), '');
      continue;
    }

    const local = await downloadImage(src);
    if (local) out = out.split(src).join(`../../assets/images/${local}`);
  }

  // les srcset pointent encore vers l'ancien domaine : ils n'ont plus lieu d'être
  return out.replace(/\ssrcset="[^"]*"/gi, '').replace(/\ssizes="[^"]*"/gi, '');
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function emptyDir(dir) {
  await mkdir(dir, { recursive: true });
  for (const f of await readdir(dir)) {
    if (f.endsWith('.md')) await unlink(path.join(dir, f));
  }
}

async function main() {
  console.log(`Source : ${SOURCE}`);
  await mkdir(IMG_DIR, { recursive: true });
  await emptyDir(BLOG_DIR);
  await emptyDir(PAGES_DIR);

  const [posts, pages, categories, media] = await Promise.all([
    apiAll('posts'),
    apiAll('pages'),
    apiAll('categories'),
    apiAll('media'),
  ]);
  const mediaById = new Map(media.map((m) => [m.id, m]));
  const catById = new Map(categories.map((c) => [c.id, c]));

  console.log(`\n${posts.length} articles, ${pages.length} pages, ${categories.length} catégories`);

  console.log('\nArticles :');
  for (const post of posts) {
    const featured = mediaById.get(post.featured_media);
    const image = await downloadImage(featured?.source_url);
    const category = catById.get(post.categories?.[0]);
    const front = [
      '---',
      `title: ${yaml(decodeEntities(post.title.rendered))}`,
      `description: ${yaml(makeDescription(post.content.rendered))}`,
      `pubDate: ${post.date.slice(0, 10)}`,
      post.modified?.slice(0, 10) !== post.date.slice(0, 10)
        ? `updatedDate: ${post.modified.slice(0, 10)}`
        : null,
      category ? `category: ${yaml(decodeEntities(category.name))}` : null,
      category ? `categorySlug: ${yaml(category.slug)}` : null,
      image ? `heroImage: ${yaml(`../../assets/images/${image}`)}` : null,
      image ? `heroImageAlt: ${yaml(decodeEntities(featured.alt_text || post.title.rendered))}` : null,
      '---',
    ]
      .filter(Boolean)
      .join('\n');
    const body = await localiseInlineImages(stripJunk(post.content.rendered), image);
    const file = path.join(BLOG_DIR, `${post.slug}.md`);
    await writeFile(file, `${front}\n\n${toMarkdown(body)}\n`);
    console.log(`  ✓ ${post.slug}.md`);
  }

  console.log('\nPages :');
  for (const page of pages) {
    if (!MARKDOWN_PAGES.has(page.slug)) continue;
    const front = [
      '---',
      `title: ${yaml(decodeEntities(page.title.rendered))}`,
      `description: ${yaml(makeDescription(page.content.rendered))}`,
      `updatedDate: ${page.modified.slice(0, 10)}`,
      '---',
    ].join('\n');
    const body = await localiseInlineImages(stripJunk(page.content.rendered));
    await writeFile(path.join(PAGES_DIR, `${page.slug}.md`), `${front}\n\n${toMarkdown(body)}\n`);
    console.log(`  ✓ ${page.slug}.md`);
  }

  // Les pages restantes servent de référence pour les gabarits Astro sur mesure.
  const custom = pages.filter((p) => !MARKDOWN_PAGES.has(p.slug)).map((p) => p.slug);
  console.log(`\nPages gérées par un gabarit Astro (non regénérées) : ${custom.join(', ')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
