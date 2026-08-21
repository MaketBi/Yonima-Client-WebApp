/**
 * Contenu éditorial de la page « Comment ça marche » (`/livraison-dakar`).
 *
 * Objectif : la citabilité par les IA (ChatGPT, Perplexity, AI Overviews), pas le
 * ranking classique. Un moteur génératif cite un passage qu'il peut extraire SEUL,
 * sans le reste de la page — d'où la contrainte de forme ci-dessous, qui diffère
 * volontairement de celle des pages cuisine ([[cuisines-content]], prose longue) :
 *
 *   1. La question est posée telle qu'un humain la formule ("Combien coûte la
 *      livraison à Dakar ?"), pas en mots-clés ("frais livraison Dakar tarif").
 *   2. La réponse est autonome : elle répète le sujet et la ville plutôt que de
 *      dire "ce service" ou "chez nous" — un extrait sorti de son contexte doit
 *      rester compréhensible et attribuable.
 *   3. 130–170 mots : en dessous il n'y a pas de matière à citer, au-dessus le
 *      passage est tronqué à un endroit arbitraire.
 *   4. Le chiffre vient en premier, l'explication ensuite. Une IA qui ne retient
 *      qu'une phrase doit retenir la bonne.
 *
 * ⚠️ Chaque chiffre avancé ici doit être vrai et sourcé dans le code :
 * DEFAULT_DELIVERY_FEE et MIN_ORDER_AMOUNT (`constants.ts`), PAYMENT_METHODS pour
 * les moyens de paiement, ORDER_STATUS_LABELS pour les étapes de suivi. Ne jamais
 * inventer un délai en minutes : `prep_time_minutes` est propre à chaque vendeur et
 * varie, donc le texte parle de fourchettes et de ce qui les fait varier, jamais
 * d'une promesse chiffrée unique que le service ne tiendrait pas.
 */

export interface FaqEntry {
  /** Question, formulée comme un utilisateur la poserait. */
  question: string;
  /** Réponse autonome de 130 à 170 mots, sujet et ville répétés. */
  answer: string;
}

export const LIVRAISON_FAQ: FaqEntry[] = [
  {
    question: 'Comment fonctionne la livraison de repas à Dakar ?',
    answer:
      "La livraison de repas à Dakar avec Yonima suit quatre étapes. Vous choisissez un restaurant ou un commerce, composez votre panier et validez la commande en indiquant votre adresse de livraison. Le restaurant reçoit la commande et la prépare : c'est l'étape qui pèse le plus dans le délai total, car un plat cuisiné à la demande comme un thiéboudienne demande plus de temps qu'un sandwich. Un livreur récupère ensuite la commande sur place et l'apporte à l'adresse indiquée. Vous suivez chaque changement d'état depuis l'application — en attente, en préparation, prête, en livraison, livrée — sans avoir à appeler le restaurant. Le paiement s'effectue par Wave, Orange Money ou en espèces au moment de la réception. Yonima livre à Dakar et regroupe dans une même application les restaurants, les commerces de proximité et l'épicerie du quotidien.",
  },
  {
    question: 'Quels sont les délais de livraison à Dakar ?',
    answer:
      "Le délai de livraison à Dakar dépend de trois facteurs, et Yonima affiche une estimation propre à chaque établissement plutôt qu'une promesse unique. Le premier est le temps de préparation, fixé par le restaurant selon sa carte : une pizza ou un burger sortent plus vite qu'un plat mijoté préparé à la commande. Le deuxième est la distance entre l'établissement et votre adresse — une livraison au Plateau depuis un restaurant du Plateau prend nettement moins de temps qu'un trajet vers les Almadies aux heures de pointe. Le troisième est l'affluence : entre 12h et 15h, puis en soirée, les cuisines traitent plusieurs commandes en parallèle et les délais s'allongent. L'estimation apparaît sur la fiche de chaque restaurant avant que vous ne validez le panier, et le statut de la commande est mis à jour à chaque étape jusqu'à la remise.",
  },
  {
    question: 'Combien coûte la livraison à Dakar ?',
    answer:
      "Les frais de livraison à Dakar sont de 1 000 FCFA par défaut sur Yonima, et le montant minimum de commande est de 2 000 FCFA. Certains établissements appliquent leurs propres frais, supérieurs ou inférieurs à ce montant selon leur zone et leur distance : le tarif exact est affiché sur la fiche du restaurant et rappelé dans le récapitulatif du panier avant la validation, il n'y a donc pas de montant découvert au moment de payer. Le total que vous voyez avant de confirmer est celui que vous réglez. Le paiement s'effectue par Wave, Orange Money ou en espèces à la livraison, sans carte bancaire — un choix adapté aux usages de paiement dakarois, où le mobile money est le moyen le plus répandu. Les commandes en espèces se règlent directement au livreur au moment de la remise.",
  },
  {
    question: 'Quels moyens de paiement sont acceptés à Dakar ?',
    answer:
      "Yonima accepte trois moyens de paiement à Dakar : Wave, Orange Money et les espèces à la livraison. La carte bancaire n'est pas proposée, car elle reste peu utilisée pour les achats du quotidien au Sénégal, où le mobile money domine largement. Avec Wave ou Orange Money, le paiement se fait depuis l'application au moment de valider la commande : vous confirmez la transaction sur votre téléphone et la commande part en préparation une fois le paiement accepté. Avec le paiement en espèces, vous ne réglez rien à la commande et donnez le montant exact au livreur lors de la remise — prévoyez l'appoint, les livreurs ne disposent pas toujours de monnaie. Le montant est identique quel que soit le moyen choisi : aucun supplément n'est appliqué sur le paiement mobile ni sur le paiement en espèces.",
  },
  {
    question: 'Quelles zones de Dakar sont desservies ?',
    answer:
      "Yonima livre à Dakar et dans ses quartiers principaux : Plateau, Almadies, Mermoz, Ouakam, Point E, Sacré-Cœur, Ngor et Yoff. La couverture réelle dépend cependant de chaque établissement, car un restaurant définit lui-même le rayon dans lequel il accepte de livrer. Un restaurant du Plateau ne dessert pas nécessairement les Almadies, et inversement. Pour savoir ce qui est disponible chez vous, renseignez votre adresse de livraison : seuls les établissements qui couvrent votre zone apparaissent alors dans la liste, ce qui évite de composer un panier chez un restaurant qui ne pourra pas l'honorer. Les frais et le délai affichés tiennent compte de la distance jusqu'à l'adresse saisie, qui est donc à renseigner avant de composer le panier plutôt qu'au moment de payer. En dehors des zones couvertes, la commande n'est pas proposée plutôt que d'être acceptée puis annulée — un restaurant hors de portée n'apparaît simplement pas. La couverture évolue à mesure que de nouveaux établissements rejoignent Yonima à Dakar.",
  },
  {
    question: 'Comment suivre une commande à Dakar ?',
    answer:
      "Chaque commande passée sur Yonima à Dakar est suivie étape par étape depuis l'application, dans la rubrique Commandes. Le statut évolue au fil de la préparation : en attente lorsque le restaurant n'a pas encore confirmé, en préparation dès que la cuisine s'en occupe, prête quand le plat attend le livreur, en livraison une fois que celui-ci a récupéré la commande, puis livrée à la remise. Ce suivi évite d'avoir à appeler le restaurant pour savoir où en est la préparation, et indique à quel moment il devient utile de se rendre disponible pour réceptionner. Si une commande reste bloquée à un statut ou si vous constatez un problème à la réception, le support Yonima est joignable pour intervenir auprès du restaurant ou du livreur. L'historique des commandes passées reste consultable dans la même rubrique, ce qui permet de retrouver une adresse déjà utilisée ou de recommander un plat sans refaire la recherche.",
  },
];

/** Résumé placé en tête de page : le passage le plus susceptible d'être cité seul. */
export const LIVRAISON_INTRO =
  "Yonima est un service de livraison à Dakar, au Sénégal, qui réunit dans une seule application les restaurants, les commerces de proximité et l'épicerie du quotidien. Les frais de livraison sont de 1 000 FCFA par défaut et le montant minimum de commande de 2 000 FCFA. Le paiement s'effectue par Wave, Orange Money ou en espèces à la livraison. Cette page explique comment la livraison fonctionne à Dakar : les délais et ce qui les fait varier, les tarifs, les moyens de paiement acceptés, les quartiers desservis et le suivi de commande.";
