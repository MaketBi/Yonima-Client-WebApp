/**
 * Contenu éditorial des pages cuisine (`/restaurants/cuisine/[slug]`).
 *
 * Ces pages existent pour capter les requêtes génériques (« livraison pizza Dakar »)
 * que la webapp ne captait pas : elle ne rankait que sur les noms de marque de ses
 * vendeurs. Le texte doit donc être réellement informatif et ancré à Dakar — une
 * page de liste sans prose ne se distingue pas de la page /restaurants et n'apporte
 * aucun signal nouveau.
 *
 * `slug` est la forme URL (sans accent) ; `tag` doit correspondre exactement à la
 * valeur stockée dans `vendors.tags` (comparaison insensible à la casse côté requête).
 */

export interface CuisineContent {
  /** Segment d'URL, sans accent ni espace. */
  slug: string;
  /** Tag tel qu'il existe dans `vendors.tags`. */
  tag: string;
  /** Nom affiché dans le H1 et le fil d'ariane. */
  label: string;
  /** <title> de la page. */
  title: string;
  /** Meta description (~155 caractères). */
  description: string;
  /** Sous-titre affiché sous le H1. */
  tagline: string;
  /** Corps éditorial : un paragraphe par entrée. */
  body: string[];
}

export const CUISINES_CONTENT: CuisineContent[] = [
  {
    slug: 'senegalais',
    tag: 'Senegalais',
    label: 'Sénégalais',
    title: 'Livraison de cuisine sénégalaise à Dakar',
    description:
      'Thiéboudienne, yassa, mafé, thiou : commandez les grands classiques de la cuisine sénégalaise et faites-vous livrer partout à Dakar.',
    tagline: 'Thiéboudienne, yassa, mafé — les classiques livrés chez vous',
    body: [
      "La cuisine sénégalaise se mange rarement seule. Autour du bol partagé, le thiéboudienne du midi rassemble collègues et familles, et c'est souvent le plat qui décide de la journée. Les restaurants qui la préparent à Dakar ont chacun leur tour de main : un riz plus ou moins coloré, un poisson farci au rof, des légumes qui varient selon l'arrivage du marché.",
      "Sur Yonima, les adresses de cuisine sénégalaise couvrent aussi bien les tables installées depuis des décennies que les cuisines de quartier ouvertes récemment. Vous y trouverez le yassa poulet mariné aux oignons et au citron, le mafé à la pâte d'arachide, le thiou à la tomate, et le domoda pour ceux qui préfèrent une sauce plus douce.",
      "Le thiéboudienne se commande plutôt entre 12h et 15h : préparé en grande quantité le matin, il s'épuise vite. Le yassa et le mafé restent disponibles plus tard dans la journée. Pour un dîner, les grillades et le dibi prennent le relais dans la plupart des établissements.",
      "La livraison couvre Dakar : Plateau, Almadies, Mermoz, Ouakam, Point E, Sacré-Cœur, Ngor et Yoff. Le paiement se fait par Wave, Orange Money ou en espèces à la réception de la commande.",
    ],
  },
  {
    slug: 'pizza',
    tag: 'Pizza',
    label: 'Pizza',
    title: 'Livraison de pizza à Dakar',
    description:
      'Commandez une pizza à Dakar et faites-vous livrer en moins de 30 minutes. Pizzerias sélectionnées, paiement Wave, Orange Money ou espèces.',
    tagline: 'Pâte fine ou généreuse, livrée chaude',
    body: [
      "La pizza est devenue l'un des repas du soir les plus commandés à Dakar, en particulier dans les quartiers résidentiels où elle nourrit facilement toute une tablée. Les pizzerias de la ville se répartissent entre deux écoles : la pâte fine et croustillante d'inspiration italienne, et la pâte plus épaisse et garnie qui rassasie davantage.",
      "Les adresses disponibles sur Yonima proposent les grands classiques — margherita, reine, quatre fromages, végétarienne — mais aussi des versions adaptées aux goûts locaux, avec du poulet mariné, du thon ou des merguez. Plusieurs établissements font également des calzones et des pizzas format familial.",
      "Le créneau de forte demande se situe entre 19h et 22h, particulièrement les jeudis et vendredis soir. Commander un peu avant permet souvent de réduire l'attente. Le temps de livraison indiqué sur chaque fiche tient compte de la cuisson, qui démarre à la réception de la commande.",
      "La livraison couvre l'ensemble de Dakar. Les frais et le délai estimé sont affichés sur chaque restaurant avant validation du panier.",
    ],
  },
  {
    slug: 'poulet',
    tag: 'Poulet',
    label: 'Poulet',
    title: 'Livraison de poulet à Dakar',
    description:
      'Poulet braisé, yassa, grillé ou pané : commandez votre poulet à Dakar et faites-vous livrer rapidement, à toute heure.',
    tagline: 'Braisé, yassa, grillé ou pané',
    body: [
      "Le poulet est sans doute le plat le plus consensuel de Dakar : il se décline dans presque toutes les cuisines de la ville et convient aussi bien à un déjeuner rapide qu'à un repas partagé le soir. Le poulet braisé, cuit au feu de bois et servi avec des oignons et de la moutarde, reste le plus demandé.",
      "Les restaurants disponibles ici couvrent l'ensemble des préparations : le yassa poulet aux oignons confits et au citron, le poulet grillé simple accompagné de frites ou d'alloco, le poulet pané des enseignes de restauration rapide, et le poulet DG pour les portions plus copieuses.",
      "Selon les adresses, le poulet est vendu entier, en demi ou en quarts — pratique pour ajuster la commande au nombre de convives. Les accompagnements les plus courants sont les frites, l'attiéké, le riz et la salade.",
      "La plupart de ces établissements livrent jusqu'en fin de soirée, ce qui en fait une option fiable quand les cuisines traditionnelles ont fermé. Livraison sur tout Dakar, paiement Wave, Orange Money ou espèces.",
    ],
  },
  {
    slug: 'burger',
    tag: 'Burger',
    label: 'Burger',
    title: 'Livraison de burgers à Dakar',
    description:
      'Commandez un burger à Dakar : smash, poulet croustillant ou végétarien, livré chaud avec ses frites. Paiement Wave, Orange Money ou espèces.',
    tagline: 'Bœuf, poulet croustillant ou végétarien',
    body: [
      "Le burger s'est solidement installé à Dakar, porté autant par les enseignes internationales que par des adresses locales qui proposent leurs propres recettes. La différence se joue souvent sur le pain, la cuisson de la viande et la générosité des sauces.",
      "Les restaurants référencés sur Yonima couvrent l'éventail complet : burgers au bœuf simple ou double, versions au poulet croustillant, recettes végétariennes, et formules complètes avec frites et boisson. Plusieurs adresses proposent aussi des tenders et des wraps.",
      "Le burger est un plat qui supporte mal l'attente : il est préparé au moment de la commande et part immédiatement en livraison. Le délai affiché sur chaque fiche restaurant intègre ce temps de préparation.",
      "La demande est la plus forte en soirée et le week-end. Livraison sur tout Dakar — Plateau, Almadies, Mermoz, Ouakam, Point E, Sacré-Cœur, Ngor, Yoff.",
    ],
  },
  {
    slug: 'libanais',
    tag: 'Libanais',
    label: 'Libanais',
    title: 'Livraison de cuisine libanaise à Dakar',
    description:
      'Chawarma, mezze, grillades et pâtisseries orientales : commandez libanais à Dakar et faites-vous livrer rapidement.',
    tagline: 'Chawarma, mezze et grillades',
    body: [
      "La cuisine libanaise fait partie du paysage culinaire dakarois depuis longtemps, portée par une communauté installée de longue date. Elle a donné à la ville quelques-unes de ses adresses les plus constantes, et le chawarma est devenu un repas du soir courant bien au-delà de la communauté d'origine.",
      "Les restaurants disponibles ici proposent les mezze — houmous, moutabal, taboulé, fatayer, kebbé — ainsi que les grillades : chiche taouk, kafta, brochettes d'agneau. Le chawarma se commande en sandwich ou en assiette, au poulet ou à la viande.",
      "Les mezze se prêtent particulièrement bien à une commande groupée : plusieurs établissements proposent des plateaux à partager, pratiques pour un repas à plusieurs sans avoir à choisir un plat unique.",
      "Beaucoup de ces adresses complètent leur carte par des pâtisseries orientales — baklava, maamoul, knafeh. Livraison sur tout Dakar, paiement Wave, Orange Money ou espèces.",
    ],
  },
  {
    slug: 'fast-food',
    tag: 'Fast Food',
    label: 'Fast food',
    title: 'Livraison de fast food à Dakar',
    description:
      'Burgers, tacos, sandwichs, frites : commandez un repas rapide à Dakar et faites-vous livrer en quelques minutes.',
    tagline: 'Rapide, chaud, livré',
    body: [
      "Le fast food répond à un besoin simple à Dakar : manger vite, sans se poser de question, et souvent tard. C'est la catégorie la plus sollicitée en fin de journée et en soirée, quand les cuisines traditionnelles ont terminé leur service.",
      "Les adresses regroupées ici couvrent les burgers, les tacos, les sandwichs, les wraps, le poulet pané et les accompagnements — frites, alloco, nuggets. Plusieurs proposent des formules complètes avec boisson, généralement plus avantageuses que les plats à l'unité.",
      "Ces restaurants ont en commun des temps de préparation courts. C'est ce qui explique les délais de livraison les plus rapides du catalogue, en particulier pour les adresses situées près de votre quartier.",
      "Livraison sur tout Dakar. Les frais et le délai sont affichés sur chaque fiche avant la commande.",
    ],
  },
];

/** Retrouve le contenu éditorial d'une cuisine par son slug d'URL. */
export function getCuisineContent(slug: string): CuisineContent | undefined {
  return CUISINES_CONTENT.find((c) => c.slug === slug);
}
