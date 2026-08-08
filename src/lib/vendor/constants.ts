// Constantes du back-office vendeur.
// Routes en français, conformes à la barre d'URL du design (poulzz.store/vendeur/...).

import type { AssistantPermissions } from '@/types/vendor';

export const VENDOR_APP_NAME = 'Yonima Business';
export const VENDOR_TAGLINE = 'Gérer vos commandes en toute simplicité';

/** Support vendeur — numéro dédié (≠ support client). */
export const VENDOR_SUPPORT_PHONE = '+221762957097';
export const VENDOR_SUPPORT_WHATSAPP_MESSAGE =
  "Bonjour, j'ai besoin d'aide avec mon espace vendeur Yonima Business.";

export const VENDOR_ROUTES = {
  root: '/vendeur',
  connexion: '/vendeur/connexion',
  commandes: '/vendeur/commandes',
  commande: (id: string) => `/vendeur/commandes/${id}`,
  produits: '/vendeur/produits',
  produitNouveau: '/vendeur/produits/nouveau',
  categories: '/vendeur/produits/categories',
  statistiques: '/vendeur/statistiques',
  finances: '/vendeur/finances',
  transactions: '/vendeur/finances/transactions',
  paiements: '/vendeur/finances/paiements',
  avis: '/vendeur/avis',
  horaires: '/vendeur/horaires',
  assistants: '/vendeur/assistants',
  livreurs: '/vendeur/livreurs',
  caisse: '/vendeur/caisse-livreurs',
  parametresLivraison: '/vendeur/parametres-livraison',
  profil: '/vendeur/profil',
  notifications: '/vendeur/notifications',
} as const;

/** Routes proxy internes — contournent le CORS des Edge Functions. */
export const VENDOR_API = {
  assignDriver: '/api/vendeur/assign-driver',
  cancelOrder: '/api/vendeur/cancel-order',
} as const;

/** Pages légales business (≠ variantes client). */
export const VENDOR_LEGAL_URLS = {
  terms: 'https://www.poulzz.com/terms/business',
  privacy: 'https://www.poulzz.com/privacy/business',
  deleteAccount: 'https://www.poulzz.com/delete-account',
} as const;

// ============================================
// NAVIGATION
// ============================================

/** Icône = nom d'export lucide-react (le design fournit les mêmes SVG Lucide). */
export interface VendorNavItem {
  href: string;
  label: string;
  icon: string;
  /** Permission requise ; `undefined` = toujours visible pour un admin. */
  permission?: keyof AssistantPermissions;
  /** Réservé au propriétaire (`user.id === vendor.owner_id`). */
  ownerOnly?: boolean;
  /** Masqué si le vendeur est en `pool_only` (pas de livreurs propres). */
  internalDeliveryOnly?: boolean;
  /** Pas encore implémenté → affiché grisé, non cliquable (comportement du design). */
  comingSoon?: boolean;
}

export interface VendorNavGroup {
  title: string;
  items: VendorNavItem[];
}

/** Sidebar desktop — 3 groupes, ordre exact du design. */
export const VENDOR_NAV_GROUPS: VendorNavGroup[] = [
  {
    title: 'Principal',
    items: [
      {
        href: VENDOR_ROUTES.commandes,
        label: 'Commandes',
        icon: 'ClipboardList',
        permission: 'can_view_orders',
      },
      {
        href: VENDOR_ROUTES.produits,
        label: 'Produits',
        icon: 'ShoppingBag',
        permission: 'can_view_products',
      },
      {
        href: VENDOR_ROUTES.statistiques,
        label: 'Statistiques',
        icon: 'BarChart3',
        permission: 'can_view_analytics',
      },
    ],
  },
  {
    title: 'Ma boutique',
    items: [
      { href: VENDOR_ROUTES.finances, label: 'Finances', icon: 'Wallet', ownerOnly: true },
      { href: VENDOR_ROUTES.avis, label: 'Avis clients', icon: 'Star', ownerOnly: true },
      { href: VENDOR_ROUTES.horaires, label: 'Horaires', icon: 'Clock', ownerOnly: true },
      { href: VENDOR_ROUTES.assistants, label: 'Assistants', icon: 'Users', ownerOnly: true },
    ],
  },
  {
    title: 'Livraison',
    items: [
      {
        href: VENDOR_ROUTES.livreurs,
        label: 'Mes livreurs',
        icon: 'Bike',
        permission: 'can_view_drivers',
        internalDeliveryOnly: true,
      },
      {
        href: VENDOR_ROUTES.caisse,
        label: 'Caisse livreurs',
        icon: 'Banknote',
        permission: 'can_view_drivers',
        internalDeliveryOnly: true,
      },
      {
        href: VENDOR_ROUTES.parametresLivraison,
        label: 'Paramètres livraison',
        icon: 'Package',
        ownerOnly: true,
      },
    ],
  },
];

/** Barre d'onglets mobile — 4 entrées, comme le TabView iOS. */
export const VENDOR_MOBILE_TABS: VendorNavItem[] = [
  {
    href: VENDOR_ROUTES.commandes,
    label: 'Commandes',
    icon: 'ClipboardList',
    permission: 'can_view_orders',
  },
  {
    href: VENDOR_ROUTES.produits,
    label: 'Produits',
    icon: 'ShoppingBag',
    permission: 'can_view_products',
  },
  {
    href: VENDOR_ROUTES.statistiques,
    label: 'Stats',
    icon: 'BarChart3',
    permission: 'can_view_analytics',
  },
  { href: VENDOR_ROUTES.profil, label: 'Profil', icon: 'User' },
];

/** Titre de la topbar par route (le plus spécifique gagne). */
export const VENDOR_PAGE_TITLES: Record<string, string> = {
  [VENDOR_ROUTES.commandes]: 'Commandes',
  [VENDOR_ROUTES.produits]: 'Catalogue',
  [VENDOR_ROUTES.produitNouveau]: 'Nouveau produit',
  [VENDOR_ROUTES.categories]: 'Catégories',
  [VENDOR_ROUTES.statistiques]: 'Statistiques',
  [VENDOR_ROUTES.finances]: 'Mes finances',
  [VENDOR_ROUTES.transactions]: 'Transactions',
  [VENDOR_ROUTES.paiements]: 'Paiements reçus',
  [VENDOR_ROUTES.avis]: 'Avis clients',
  [VENDOR_ROUTES.horaires]: "Horaires d'ouverture",
  [VENDOR_ROUTES.assistants]: 'Assistants',
  [VENDOR_ROUTES.livreurs]: 'Mes livreurs',
  [VENDOR_ROUTES.caisse]: 'Caisse livreurs',
  [VENDOR_ROUTES.parametresLivraison]: 'Paramètres de livraison',
  [VENDOR_ROUTES.profil]: 'Profil & réglages',
  [VENDOR_ROUTES.notifications]: 'Notifications',
};
