// App Constants - Correspondance avec Android SecureConfig

export const APP_NAME = 'Yonima';
export const APP_DESCRIPTION = 'Livraison rapide à Dakar';

// Currency
export const CURRENCY = 'FCFA';
export const CURRENCY_LOCALE = 'fr-SN';

// Default values
export const DEFAULT_DELIVERY_FEE = 1000; // FCFA
export const MIN_ORDER_AMOUNT = 2000; // FCFA

// Pagination
export const PAGE_SIZE = 20;

// OTP
export const OTP_LENGTH = 6;
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
