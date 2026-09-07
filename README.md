# Webmark'up — site Astro

Refonte du site [webmark-up.com](https://webmark-up.com) : migration de WordPress
(thème *Integral*) vers un site statique **Astro**, déployé sur **Netlify**.

## Démarrage

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # génère dist/
npm run preview  # sert dist/ localement
npm run check    # vérification des types Astro/TypeScript
```

Node 22.12 ou supérieur est requis.

## Structure

```
src/
├── assets/images/     visuels rapatriés depuis WordPress (optimisés au build)
├── components/        Header, Footer, PostCard, Icon, CtaBand…
├── content/
│   ├── blog/          9 articles migrés (Markdown + frontmatter)
│   └── pages/         pages éditoriales simples (confidentialité, page héritée)
├── assets/photos/     photos d'illustration (voir « Photos » ci-dessous)
├── data/services.ts   offre de services (accueil + page « Nos services »)
├── layouts/           BaseLayout, MarkdownPage
├── pages/             routes du site (voir plan d'URL ci-dessous)
├── consts.ts          titre, description, coordonnées, menu
└── styles/global.css  charte Tailwind CSS v4 (couleurs, grain, duotone, marquee)
scripts/
├── scrape-wordpress.mjs      régénère les contenus depuis l'API REST WordPress
├── fetch-photos.mjs          télécharge les photos listées dans photos.config.json
└── generate-brand-assets.mjs régénère favicons et image Open Graph
```

## Direction artistique

La charte reprend le **violet et le vert** historiques, ainsi que la **courbe
statistique en flèche montante** — devenue le pictogramme de la marque
(`src/components/Logo.astro`) et un motif réutilisé en grand
(`src/components/RisingCurve.astro`).

| Rôle | Valeur |
| --- | --- |
| Violet principal | `--color-violet-600` `#7c1fff` |
| Vert accent | `--color-spring-400` `#14e894` |
| Encre violacée | `--color-ink-950` `#0b0413` |
| Crème | `--color-cream` `#f7f4ff` |

Typographie : **Bricolage Grotesque** pour les titres, **Inter** pour le texte —
auto-hébergées via Fontsource, aucune requête vers Google Fonts.

Les partis pris visuels sont rassemblés dans `src/styles/global.css` sous forme
d'utilitaires Tailwind réutilisables : `grain` (bruit sur les fonds sombres),
`duotone` (photos en bichromie violet/vert, couleur d'origine révélée au survol),
`shadow-hard` / `shadow-hard-violet` (ombres décalées façon sérigraphie),
`underline-sketch` (surlignage vert d'un mot clé). S'y ajoutent le bandeau
défilant (`Marquee.astro`) et les pastilles inclinées (`Sticker.astro`).

## Photos

Les visuels d'illustration passent par `<Photo name="…" />`, qui charge
`src/assets/photos/<name>.<ext>` et applique la bichromie violet/vert. **Tant
qu'un fichier est absent, une composition graphique aux couleurs de la marque
prend sa place** : aucune page n'est jamais cassée.

| Emplacement | Utilisé sur |
| --- | --- |
| `equipe` | accueil (section « A propos »), page A propos |
| `atelier` | page Nos services |
| `echange` | page Nous contacter |

Les sources sont déclarées dans `photos.config.json` ; `node scripts/fetch-photos.mjs`
les télécharge dans `src/assets/photos/` et consigne l'origine dans
`src/data/photo-credits.json`. Les trois photos actuelles viennent d'Unsplash
(licence Unsplash : usage commercial autorisé, attribution non obligatoire) —
ajoutez le nom du photographe dans `credit` si vous souhaitez l'afficher.

Pour changer une photo : remplacer l'URL dans `photos.config.json`, relancer le
script, rebuild. Astro se charge du redimensionnement et de la conversion WebP.

## Plan d'URL

Toutes les URL de l'ancien site sont conservées à l'identique, afin de ne perdre
ni le référencement ni les liens entrants.

| URL | Source |
| --- | --- |
| `/` | gabarit `template_home.php` (accueil) |
| `/services/` | page « Nos services » |
| `/a-propos/` | page « A propos » |
| `/nous-contacter/` | page « Nous contacter » (+ formulaire, nouveau) |
| `/blog/` | page « Blog » |
| `/<slug-article>/` | les 9 articles, à la racine comme sous WordPress |
| `/category/<slug>/` | les 7 catégories |
| `/privacy-policy/` | page « Privacy Policy » |
| `/un-webmaster-dedie-corps-et-ame-a-votre-projet/` | page héritée |

Ajouts : `/nous-contacter/merci/` (confirmation d'envoi), `/rss.xml`,
`/sitemap-index.xml`, une page 404. Les redirections des anciennes URL techniques
WordPress (`/feed/`, `/wp-sitemap.xml`, `/wp-admin/*`…) sont dans `netlify.toml`.

## Contenus

`scripts/scrape-wordpress.mjs` interroge l'API REST de l'ancien site, convertit
les articles et pages en Markdown, télécharge les images en pleine résolution et
réécrit les images insérées dans le corps du texte vers `src/assets/images`.

```bash
node scripts/scrape-wordpress.mjs                       # source par défaut : webmark-up.com
node scripts/scrape-wordpress.mjs --source=https://…    # autre origine
```

Le script est idempotent : il réécrit `src/content/blog` et `src/content/pages`.
Les pages à mise en forme spécifique (accueil, services, à propos, contact) sont
des gabarits Astro et ne sont pas régénérées — leurs textes vivent dans
`src/pages/` et `src/data/services.ts`.

Une fois le site en production, ce script n'a plus lieu d'être : les contenus
s'éditent directement dans `src/content/`.

## Déploiement Netlify

`netlify.toml` contient déjà la configuration : commande `npm run build`,
dossier publié `dist`, Node 22, redirections et en-têtes de cache.

1. Sur Netlify : **Add new site → Import an existing project**, puis sélectionner
   ce dépôt GitHub. Les réglages sont lus depuis `netlify.toml`.
2. Vérifier le déploiement sur l'URL `*.netlify.app`.
3. **Domain management → Add a domain** : `webmark-up.com` et `www.webmark-up.com`.
4. Faire pointer le DNS vers Netlify, puis activer le certificat HTTPS (Let's
   Encrypt) et la redirection HTTPS.

Le formulaire de contact utilise **Netlify Forms** (`data-netlify="true"`) : il
fonctionne dès le premier déploiement, sans backend. Les messages arrivent dans
*Forms* sur le tableau de bord Netlify — penser à y ajouter une notification par
e-mail vers `contact@webmark-up.com`.

## Points à valider côté éditorial

- **Page « A propos »** : l'ancien texte contenait des marqueurs non remplis
  (`[nom du dirigeant]`, `[nom des membres de l'équipe]`). Ils ont été retirés ;
  le paragraphe correspondant reste à réécrire avec les vrais noms.
- **Politique de confidentialité** : il s'agit du texte type de WordPress, en
  anglais, qui évoque des fonctionnalités inexistantes ici (commentaires,
  comptes). À remplacer par une vraie politique en français, mentionnant le
  formulaire de contact et l'hébergement Netlify.
- **Photos d'illustration** : les trois visuels actuels sont des photos de banque
  d'images. À remplacer par de vraies photos de l'équipe et des locaux dès que
  possible — c'est ce qui fera la différence sur une page « A propos ».
- **Images de fond du thème** (`bg-welcome.jpg`, `bg-cta.jpg`) : elles
  appartenaient au thème *Integral* et n'ont pas été reprises.
- **Réseaux sociaux** : aucun lien n'était renseigné sur l'ancien site, aucun
  n'a donc été ajouté au pied de page.
