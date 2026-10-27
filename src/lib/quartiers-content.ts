/**
 * Contenu éditorial des pages quartier (`/livraison-dakar/[quartier]`).
 *
 * Ces pages visent les requêtes « livraison <quartier> », beaucoup moins
 * disputées que « livraison Dakar » et portées par une intention d'achat plus
 * forte : on cherche un quartier précis quand on sait déjà où l'on mange.
 *
 * `slug` est la forme URL (sans accent) ; `name` doit correspondre à la valeur
 * stockée dans `vendors.neighborhood` — la jointure se fait dessus, via un
 * `ilike` sans joker (insensible à la casse, cf. getVendorsByType).
 *
 * Règles de rédaction, reprises de `livraison-content.ts` :
 *   1. Le texte décrit le quartier tel qu'il est, pas tel qu'un argumentaire
 *      voudrait qu'il soit.
 *   2. Chaque affirmation sur l'offre doit être vérifiable dans le catalogue :
 *      les plats cités ci-dessous proviennent des menus réellement publiés.
 *   3. Aucun chiffre de délai ou de prix ici — ils vivent dans
 *      DEFAULT_DELIVERY_FEE / MIN_ORDER_AMOUNT et sur chaque fiche. Les
 *      dupliquer en prose, c'est garantir qu'ils seront faux un jour.
 *
 * ⚠️ N'ajouter un quartier ici QUE s'il compte au moins 3 restaurants actifs.
 * En dessous, la page est du contenu mince : elle dilue le site au lieu de
 * l'enrichir.
 */

export interface QuartierContent {
  /** Segment d'URL, sans accent ni espace. */
  slug: string;
  /** Valeur exacte de `vendors.neighborhood`, utilisée pour la jointure. */
  name: string;
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

export const QUARTIERS_CONTENT: QuartierContent[] = [
  {
    slug: 'ouest-foire',
    name: 'Ouest Foire',
    label: 'Ouest Foire',
    title: 'Livraison de repas à Ouest Foire',
    description:
      "Commandez auprès des restaurants d'Ouest Foire et faites-vous livrer : cuisine sénégalaise, pizza, crêpes, shawarma et petit-déjeuner.",
    tagline: 'Le quartier le mieux desservi du catalogue',
    body: [
      "Ouest Foire est le quartier où Yonima compte le plus d'adresses. Sa proximité avec l'aéroport et les Almadies en a fait une zone de restauration dense, où les cuisines de quartier côtoient des enseignes plus récentes tournées vers la livraison.",
      "L'offre y est large : thiéboudienne et thiébou yapp dans les cuisines traditionnelles, pizzas et shawarma dans les adresses de fin de journée, crêpes sucrées et salées, sandwichs, tacos. Plusieurs établissements servent aussi le petit-déjeuner, ce qui est plus rare ailleurs à Dakar.",
      "La densité du quartier a un effet concret sur la livraison : les restaurants étant proches les uns des autres, les délais y comptent parmi les plus courts du catalogue, et le choix reste fourni y compris en soirée.",
      "Le délai et les frais exacts sont affichés sur chaque fiche avant la validation de la commande. Paiement par Wave, Orange Money ou en espèces à la réception.",
    ],
  },
  {
    slug: 'plateau',
    name: 'Plateau',
    label: 'Plateau',
    title: 'Livraison de repas au Plateau à Dakar',
    description:
      'Commandez auprès des restaurants du Plateau à Dakar : yassa, grillades, brochettes, pâtisserie et formules du midi livrées au bureau.',
    tagline: 'La livraison au bureau, au centre de Dakar',
    body: [
      "Le Plateau est le centre administratif et commerçant de Dakar. La demande y suit les horaires de bureau : une pointe marquée le midi, puis un creux en soirée quand le quartier se vide. Les restaurants du secteur s'organisent autour de ce rythme.",
      "Les adresses disponibles couvrent la cuisine sénégalaise — yassa poulet, yassa poisson, kaldou — ainsi que les grillades, brochettes et poissons sautés. Plusieurs établissements proposent des viennoiseries, des tartines et des plateaux sucrés-salés, pensés pour les commandes groupées de bureau.",
      "Pour une livraison au bureau le midi, commander avant le pic de la mi-journée reste le meilleur moyen d'obtenir un délai court : c'est le créneau où les cuisines du Plateau sont les plus sollicitées.",
      'Le délai et les frais sont indiqués sur chaque fiche. Paiement par Wave, Orange Money ou en espèces à la livraison.',
    ],
  },
  {
    slug: 'yoff',
    name: 'Yoff',
    label: 'Yoff',
    title: 'Livraison de repas à Yoff',
    description:
      'Commandez auprès des restaurants de Yoff et faites-vous livrer : mafé, thiou, chawarma, crêpes et sandwichs, avec paiement Wave ou Orange Money.',
    tagline: 'Des cuisines de quartier aux adresses de bord de mer',
    body: [
      "Yoff mêle un tissu ancien de cuisines de quartier et des adresses plus récentes installées le long de la côte. Cette double nature se lit dans le catalogue : on y trouve aussi bien des plats mijotés que de la restauration rapide.",
      'Côté traditionnel, les cartes proposent le mafé, le thiou tomate ou curry, le yassa guinaar et le lakh. Côté rapide, les adresses du quartier servent chawarma, tacos, crêpes sucrées, sandwichs et boxes à partager.',
      "La proximité de l'aéroport et de Ouest Foire élargit le choix réel : depuis Yoff, plusieurs adresses des quartiers voisins restent accessibles à la livraison.",
      'Le délai et les frais apparaissent sur chaque fiche avant commande. Paiement par Wave, Orange Money ou en espèces.',
    ],
  },
  {
    slug: 'dieuppeul',
    name: 'Dieuppeul',
    label: 'Dieuppeul',
    title: 'Livraison de repas à Dieuppeul',
    description:
      'Commandez auprès des restaurants de Dieuppeul : dibi, poulet braisé, yassa, thiébou yapp et jus naturels livrés à domicile.',
    tagline: 'Dibi, grillades et poulet braisé',
    body: [
      "Dieuppeul est un quartier résidentiel dense, où la restauration s'est construite autour de la demande du soir plutôt que du déjeuner d'affaires. Les grillades y occupent une place centrale.",
      'Le dibi y est bien représenté, avec des portions au quart, au demi ou au mouton entier, accompagnements compris. À côté, les adresses du quartier servent du poulet braisé, des ailes épicées, du yassa poulet, du thiébou yapp et des formules complètes entrée-plat.',
      "Le quartier compte aussi des adresses spécialisées dans les jus naturels — bissap, bouye, gingembre — commandés en bouteille d'un litre, souvent en complément d'un plat.",
      'Le délai et les frais sont affichés sur chaque fiche. Paiement par Wave, Orange Money ou en espèces à la réception.',
    ],
  },
  {
    slug: 'biscuiterie',
    name: 'Biscuiterie',
    label: 'Biscuiterie',
    title: 'Livraison de repas à Biscuiterie',
    description:
      'Commandez auprès des restaurants de Biscuiterie à Dakar : thiéboudienne, thiou viande, poulet DG, fataya et brochettes livrés chez vous.',
    tagline: 'La cuisine sénégalaise du quotidien',
    body: [
      "Biscuiterie est un quartier de cuisines familiales, où la restauration répond d'abord à la demande du déjeuner. Les cartes y sont courtes et changent selon l'arrivage, ce qui est caractéristique des adresses de quartier à Dakar.",
      "Le thiéboudienne y est le plat le plus présent, décliné en version rouge ou blanche selon les cuisines. On y trouve également le thiou viande, le poulet DG, les brochettes de boeuf et les fataya vendus à l'unité.",
      'Plusieurs adresses proposent aussi des jus naturels pressés sur place et des accompagnements à partager, pratiques pour un repas familial commandé en une seule fois.',
      'Le délai et les frais exacts sont indiqués sur chaque fiche avant commande. Paiement par Wave, Orange Money ou en espèces.',
    ],
  },
  {
    slug: 'hann-mariste',
    name: 'Hann Mariste',
    label: 'Hann Mariste',
    title: 'Livraison de repas à Hann Mariste',
    description:
      'Commandez auprès des restaurants de Hann Mariste : poulet pané, burgers, lasagnes, attiéké et soupe kandia livrés à domicile.',
    tagline: 'Poulet pané, burgers et plats mijotés',
    body: [
      "Hann Mariste est un quartier résidentiel dont l'offre de restauration s'est orientée vers les formats rapides, sans abandonner les plats mijotés. Les deux cohabitent sur des cartes souvent mixtes.",
      'Le poulet y est très présent : pané, grillé, en crispy ou en hamburger. À côté, les adresses du quartier proposent des lasagnes, de l\'attiéké poulet avec alloco, des pâtes aux gambas et de la soupe kandia.',
      "Le quartier compte moins d'adresses que Ouest Foire ou le Plateau, mais la proximité de Hann et des Maristes élargit le choix réel à la livraison.",
      'Le délai et les frais sont affichés sur chaque fiche. Paiement par Wave, Orange Money ou en espèces à la livraison.',
    ],
  },
  {
    slug: 'yeumbeul-sud',
    name: 'Yeumbeul Sud',
    label: 'Yeumbeul Sud',
    title: 'Livraison de repas à Yeumbeul Sud',
    description:
      'Commandez auprès des restaurants de Yeumbeul Sud : dibi guinaar, shawarma, sandwichs et jus naturels livrés chez vous.',
    tagline: 'Dibi et sandwichs en banlieue dakaroise',
    body: [
      "Yeumbeul Sud fait partie de la banlieue est de Dakar, longtemps mal desservie par les services de livraison. Le quartier est couvert par Yonima, avec une offre encore resserrée mais régulière.",
      'Le dibi guinaar et les sandwichs à la viande ou au poulet constituent le coeur de l\'offre, aux côtés du shawarma et du laak. Plusieurs adresses servent également des jus naturels, notamment le bouye.',
      "L'offre du quartier est plus limitée que dans le centre de Dakar : vérifier les horaires d'ouverture sur la fiche avant de commander évite une commande sans suite, en particulier en soirée.",
      'Le délai et les frais sont indiqués sur chaque fiche avant la validation. Paiement par Wave, Orange Money ou en espèces.',
    ],
  },
];

/** Retrouve le contenu éditorial d'un quartier par son slug d'URL. */
export function getQuartierContent(slug: string): QuartierContent | undefined {
  return QUARTIERS_CONTENT.find((q) => q.slug === slug);
}
