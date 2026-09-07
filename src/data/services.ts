/**
 * Offre de services — textes repris de l'ancien site WordPress
 * (section « features » de la page d'accueil + page « Nos services »).
 */
export type IconName =
  | 'wrench'
  | 'smile'
  | 'search'
  | 'euro'
  | 'cog'
  | 'shield';

export interface Service {
  id: string;
  title: string;
  /** Résumé court affiché sur la page d'accueil. */
  summary: string;
  /** Description complète affichée sur la page « Nos services ». */
  description?: string;
  icon: IconName;
}

export const SERVICES: Service[] = [
  {
    id: 'creation-de-site-internet',
    title: 'Création de site internet',
    summary:
      "Notre équipe de développeurs et de designers expérimentés est là pour vous aider à créer un site internet qui répond parfaitement à vos besoins.",
    description:
      "Notre équipe de développeurs et de designers expérimentés est là pour vous aider à créer un site internet qui répond parfaitement à vos besoins. Nous proposons des services de création de sites vitrines, de sites e-commerce, de landing pages et de sites corporate. Nous nous occupons de toutes les étapes de la création de votre site, de la conception à la mise en ligne. Nous vous accompagnons également pour la sélection de votre nom de domaine et de votre hébergement.",
    icon: 'wrench',
  },
  {
    id: 'gestion-quotidienne',
    title: 'Gestion quotidienne',
    summary:
      "Nous nous occupons de la mise à jour des contenus, de la gestion des utilisateurs, de la sécurité et de la sauvegarde de votre site.",
    description:
      "Notre service de gestion quotidienne de site web vous permet de vous concentrer sur votre activité principale tout en étant sûr que votre site web est à jour et fonctionne correctement. Nous nous occupons de la mise à jour des contenus, de la gestion des utilisateurs, de la sécurité et de la sauvegarde de votre site. Nous vous offrons également un service de veille concurrentielle pour vous tenir informé des dernières tendances et des meilleures pratiques en matière de webmarketing.",
    icon: 'smile',
  },
  {
    id: 'seo',
    title: 'SEO',
    summary:
      "Notre service de SEO vous permet d'améliorer votre visibilité sur les moteurs de recherche.",
    description:
      "Notre service de SEO vous permet d'améliorer votre visibilité sur les moteurs de recherche. Nous utilisons des techniques éprouvées pour optimiser votre site web pour les moteurs de recherche. Nous travaillons sur l'optimisation des balises, la création de contenu de qualité, l'acquisition de liens et l'analyse des données de trafic. Nous vous aidons également à identifier les mots-clés pertinents pour votre activité pour vous positionner sur les requêtes les plus pertinentes pour votre entreprise.",
    icon: 'search',
  },
  {
    id: 'sea',
    title: 'SEA',
    summary:
      "Notre service de publicité en ligne (SEA) vous permet d'atteindre rapidement de nouveaux clients grâce à des campagnes publicitaires ciblées sur les moteurs de recherche.",
    description:
      "Notre service de publicité en ligne (SEA) vous permet d'atteindre rapidement de nouveaux clients grâce à des campagnes publicitaires ciblées sur les moteurs de recherche (Google Adwords, Bing Ads, etc.) et les réseaux sociaux (Facebook Ads, etc.). Nous nous occupons de la création et de la gestion de vos campagnes publicitaires, de l'analyse des données et de l'optimisation des performances.",
    icon: 'euro',
  },
  {
    id: 'maintenance-technique',
    title: 'Maintenance technique',
    summary:
      "Notre service de maintenance technique vous assure que votre site web est toujours en bon état de marche.",
    description:
      "Notre service de maintenance technique vous assure que votre site web est toujours en bon état de marche. Nous nous occupons de la mise à jour des logiciels, de la sécurité, de la sauvegarde de vos données et de la résolution des problèmes techniques. Nous vous offrons également un service de veille technologique pour vous tenir informé des dernières évolutions et des meilleures pratiques en matière de développement web.",
    icon: 'cog',
  },
  {
    id: 'surveillance',
    title: 'Surveillance',
    summary:
      "Depuis 2023 nous proposons un service de surveillance de fuite de vos données (mots de passe, comptes piratés, etc.) sur le dark web.",
    icon: 'shield',
  },
];
