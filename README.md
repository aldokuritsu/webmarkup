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
├── data/services.ts   offre de services (accueil + page « Nos services »)
├── layouts/           BaseLayout, MarkdownPage
├── pages/             routes du site (voir plan d'URL ci-dessous)
├── consts.ts          titre, description, coordonnées, menu
└── styles/global.css  thème Tailwind CSS v4 (couleurs de marque)
scripts/
├── scrape-wordpress.mjs   régénère les contenus depuis l'API REST WordPress
└── generate-og-image.mjs  régénère public/og-default.png
```

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
- **Images de fond du thème** (`bg-welcome.jpg`, `bg-cta.jpg`) : elles
  appartenaient au thème *Integral* et n'ont pas été reprises ; les sections
  concernées utilisent désormais des dégradés aux couleurs de la marque.
- **Réseaux sociaux** : aucun lien n'était renseigné sur l'ancien site, aucun
  n'a donc été ajouté au pied de page.
