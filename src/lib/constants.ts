// App Constants - Correspondance avec Android SecureConfig

export const APP_NAME = 'Yonima';
export const APP_DESCRIPTION = 'Livraison rapide à Dakar';

// Liens de téléchargement des apps mobiles (source unique de vérité).
// URLs publiques figées, codées 100% en dur : PAS d'env var (sinon une variable
// Vercel obsolète prendrait le dessus et casserait les liens en prod).
export const IOS_APP_URL =
  'https://apps.apple.com/fr/app/yonima-plus/id6756845915';
export const ANDROID_APP_URL =
  'https://play.google.com/store/apps/details?id=com.poulzz.yonima.client&pcampaignid=web_share';

// Coordonnées & informations légales de l'entreprise (source unique de vérité).
// Utilisé par les pages Contact / Conditions / Confidentialité / À propos et le footer.
// Note : l'email de contact est sur le domaine poulzz.com (≠ domaine du site poulzz.store).
export const COMPANY = {
  legalName: 'POULZZ - SUARL',
  legalForm: 'Société Unipersonnelle à Responsabilité Limitée (SUARL)',
  capital: '100 000 F CFA',
  email: 'contact@poulzz.com',
  phone: '+221 76 295 70 97',
  whatsapp: '+221 76 295 70 97',
  address: 'Bene Baraque, Ainoumady 2, Dakar 11000, Sénégal',
  city: 'Dakar',
  country: 'Sénégal',
  publisher: 'Mamadou Diop', // gérant + directeur de la publication
  host: 'Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA',
  ninea: '012814647',
  rccm: 'SN DKR 2026 B 5030',
  // Données personnelles : pas de DPO formel. Contact données ci-dessous ; autorité : CDP Sénégal.
  dataProtectionAuthority: 'Commission de protection des données personnelles (CDP) du Sénégal',
} as const;

// Currency
export const CURRENCY = 'FCFA';
export const CURRENCY_LOCALE = 'fr-SN';

// Default values
export const DEFAULT_DELIVERY_FEE = 1000; // FCFA
export const MIN_ORDER_AMOUNT = 2000; // FCFA

// Pagination
export const PAGE_SIZE = 20;

// OTP — 4-digit code (matches the iOS app; see spec §15)
export const OTP_LENGTH = 4;
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;

// Session
export const SESSION_TIMEOUT_MINUTES = 30;

// Maps - Dakar center
export const DEFAULT_LATITUDE = 14.6928;
export const DEFAULT_LONGITUDE = -17.4467;
export const DEFAULT_ZOOM = 13;

// Vendor types
export const VENDOR_TYPES = {
  grocery: 'Épicerie',
  restaurant: 'Restaurant',
  store: 'Commerce',
  legacy: 'Autre',
} as const;

/**
 * Cuisine → emoji mapping for the home "Choisis ta cuisine" grid.
 * Cuisines are stored as free tags on `vendors.tags`; this maps common labels
 * to a glyph. Keys are matched case-insensitively; unknown tags fall back to 🍽️.
 */
export const CUISINE_EMOJI: Record<string, string> = {
  'fast food': '🍟',
  burger: '🍔',
  poulet: '🍗',
  pizza: '🍕',
  senegalais: '🥘',
  sénégalais: '🥘',
  'petit dej': '🥐',
  'petit déj': '🥐',
  africain: '🍲',
  desserts: '🍰',
  dessert: '🍰',
  tacos: '🌮',
  vietnamien: '🍜',
  indien: '🍛',
  italien: '🍝',
  grillades: '🍖',
  dibi: '🍖',
  poisson: '🐟',
  boissons: '🥤',
  sushi: '🍣',
  libanais: '🥙',
  crepes: '🥞',
  crêpes: '🥞',
  glaces: '🍦',
  glace: '🍦',
} as const;

/** Emoji for a cuisine tag, case/space-insensitive, with a plate fallback. */
export function cuisineEmoji(tag: string): string {
  return CUISINE_EMOJI[tag.trim().toLowerCase()] ?? '🍽️';
}

// Order status labels (French)
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  driver_assigned: 'Livreur assigné',
  driver_on_the_way: 'Livreur en route',
  delivering: 'En livraison',
  arrived: 'Arrivé',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

// Order status colors
export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-green-100 text-green-800',
  driver_assigned: 'bg-purple-100 text-purple-800',
  driver_on_the_way: 'bg-indigo-100 text-indigo-800',
  delivering: 'bg-cyan-100 text-cyan-800',
  arrived: 'bg-teal-100 text-teal-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

// Payment methods (Wave, Orange Money, Cash - pas de carte bancaire)
export const PAYMENT_METHODS = {
  wave: { label: 'Wave', color: '#1BA0E1' },
  orange_money: { label: 'Orange Money', color: '#FF6600' },
  cash: { label: 'Espèces', color: '#22C55E' },
} as const;

// Payment method type (without card)
export type PaymentMethodType = keyof typeof PAYMENT_METHODS;

// Days of week (French)
export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export const DAYS_OF_WEEK_LABELS: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

// Routes
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  restaurants: '/restaurants',
  commerces: '/commerces',
  epicerie: '/epicerie',
  panier: '/panier',
  commandes: '/commandes',
  profil: '/profil',
  fidelite: '/fidelite',
  notifications: '/notifications',
  apropos: '/apropos', // page locale à la webapp client (≠ poulzz.com/about, autre sujet)
} as const;

// Pages légales & informationnelles : elles vivent sur le site vitrine
// www.poulzz.com (app CLIENT → variantes /terms/client, /privacy/client).
// La webapp (poulzz.store) pointe vers ces URLs externes, on ne duplique pas.
export const LEGAL_URLS = {
  terms: 'https://www.poulzz.com/terms/client',
  privacy: 'https://www.poulzz.com/privacy/client',
  mentionsLegales: 'https://www.poulzz.com/legal/mentions-legales',
  contact: 'https://www.poulzz.com/contact',
  support: 'https://www.poulzz.com/support',
  getApp: 'https://www.poulzz.com/get',
  home: 'https://www.poulzz.com/',
} as const;

// API endpoints (Edge Functions)
export const API_ENDPOINTS = {
  simpleOtp: '/functions/v1/simple-otp',
  simpleVerify: '/functions/v1/simple-verify',
  validatePromo: '/functions/v1/validate-promo',
  createOrder: '/functions/v1/create-order',
  mobilePayment: '/functions/v1/mobile-payment',
  checkPaymentStatus: '/functions/v1/check-payment-status',
} as const;
