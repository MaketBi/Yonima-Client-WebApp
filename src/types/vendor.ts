// Types du back-office vendeur (routes /vendeur).
// Source de vérité : app iOS `saas-platform/ios-dkr/YonimaBusiness/` + schéma Supabase prod.

import type { Vendor } from './models';

// ============================================
// RÔLES & PERMISSIONS
// ============================================

export type VendorRole = 'vendor_admin' | 'vendor_assistant';

/**
 * Les 8 permissions d'un assistant (`assistant_users.permissions`, JSONB).
 * ⚠️ Le DEFAULT en base est `'{}'` : toute clé absente vaut `false`.
 * Ne jamais lire une clé sans passer par `normalizePermissions()`.
 *
 * ⚠️ Aucune policy RLS ne lit ces permissions : c'est du gating d'interface,
 * jamais une frontière de sécurité.
 */
export interface AssistantPermissions {
  can_view_orders: boolean;
  can_manage_orders: boolean;
  can_view_products: boolean;
  can_manage_products: boolean;
  can_view_drivers: boolean;
  can_assign_drivers: boolean;
  can_view_analytics: boolean;
  can_view_crm: boolean;
}

export const NO_PERMISSIONS: AssistantPermissions = {
  can_view_orders: false,
  can_manage_orders: false,
  can_view_products: false,
  can_manage_products: false,
  can_view_drivers: false,
  can_assign_drivers: false,
  can_view_analytics: false,
  can_view_crm: false,
};

export const FULL_PERMISSIONS: AssistantPermissions = {
  can_view_orders: true,
  can_manage_orders: true,
  can_view_products: true,
  can_manage_products: true,
  can_view_drivers: true,
  can_assign_drivers: true,
  can_view_analytics: true,
  can_view_crm: true,
};

/** Complète un JSONB partiel : toute clé absente devient `false`. */
export function normalizePermissions(
  raw: Partial<AssistantPermissions> | null | undefined
): AssistantPermissions {
  return { ...NO_PERMISSIONS, ...(raw ?? {}) };
}

// ============================================
// SESSION VENDEUR
// ============================================

/** Pourquoi l'accès au back-office est refusé — chaque cas a son écran dédié. */
export type VendorAccessDenial =
  | 'not_authenticated'
  | 'not_a_vendor'
  | 'assistant_not_supported' // v1 admin-only
  | 'assistant_deactivated'
  | 'no_vendor_linked'; // `owner_id`/`vendor_id` absent → back-office vide et silencieux

export interface VendorSession {
  userId: string;
  fullName: string | null;
  phone: string;
  role: VendorRole;
  isOwner: boolean;
  vendor: Vendor;
  permissions: AssistantPermissions;
}

export type VendorSessionResult =
  | { ok: true; session: VendorSession }
  | { ok: false; reason: VendorAccessDenial };

// ============================================
// COMMANDES
// ============================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'offered'
  | 'no_driver_available'
  | 'driver_assigned'
  | 'driver_on_the_way'
  | 'delivering'
  | 'arrived'
  | 'delivered'
  | 'cancelled'
  | 'delivery_failed';

/**
 * « À traiter » : tout ce qui précède l'assignation d'un livreur.
 * ⚠️ `confirmed`, `offered` et `no_driver_available` sont absents des deux
 * listes côté iOS (les commandes y deviennent invisibles). Choix web validé
 * par le backend : on les range ici.
 */
export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'offered',
  'no_driver_available',
];

/** « Historique » : dès qu'un livreur est assigné, la suite lui appartient. */
export const HISTORY_ORDER_STATUSES: OrderStatus[] = [
  'driver_assigned',
  'driver_on_the_way',
  'delivering',
  'arrived',
  'delivered',
  'cancelled',
  'delivery_failed',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  offered: 'Proposée aux livreurs',
  no_driver_available: 'Aucun livreur disponible',
  driver_assigned: 'Livreur assigné',
  driver_on_the_way: 'Livreur en route',
  delivering: 'En livraison',
  arrived: 'Livreur arrivé',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  delivery_failed: 'Échec livraison',
};

/** Couleurs de statut — hex exacts du design (§0 de la spec). */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  preparing: '#3B82F6',
  ready: '#8B5CF6',
  offered: '#F59E0B',
  no_driver_available: '#EF4444',
  driver_assigned: '#6366F1',
  driver_on_the_way: '#6366F1',
  delivering: '#06B6D4',
  arrived: '#14B8A6',
  delivered: '#10B981',
  cancelled: '#EF4444',
  delivery_failed: '#EF4444',
};

export type PaymentMethod = 'wave' | 'orange_money' | 'cash' | 'especes';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  wave: 'Wave',
  orange_money: 'Orange Money',
  cash: 'Espèces',
  especes: 'Espèces',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'En attente',
  paid: 'Payé',
  failed: 'Échoué',
  refunded: 'Remboursé',
};

/** Ligne de commande — vient de la vue `order_items_detailed`. */
export interface VendorOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  pack_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_name: string | null;
  item_type: string | null;
  display_name: string | null;
  display_image: string | null;
}

export interface VendorOrderCustomer {
  id: string;
  phone: string | null;
  full_name: string | null;
}

export interface VendorOrderDriver {
  id: string;
  name: string | null;
  phone: string | null;
}

export interface VendorOrder {
  id: string;
  order_number: string;
  vendor_id: string;
  user_id: string | null;
  status: OrderStatus;

  subtotal: number;
  delivery_fee: number;
  total: number;

  customer_name: string | null;
  phone: string | null;
  delivery_address: string | null;
  delivery_note: string | null;

  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus | null;

  /** ⚠️ `assigned_driver_id` fait foi — `orders.driver_id` est mort. */
  assigned_driver_id: string | null;
  delivery_mode: DeliveryMode | null;

  created_at: string;
  driver_assigned_at: string | null;
  prepared_at: string | null;
  ready_at: string | null;
  driver_on_the_way_at: string | null;
  arrived_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;

  order_items: VendorOrderItem[] | null;
  user: VendorOrderCustomer | null;
  driver: VendorOrderDriver | null;
}

/** Transitions déclenchables par le vendeur. Au-delà, c'est le livreur qui pilote. */
export const NEXT_ORDER_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'preparing',
  preparing: 'ready',
};

/** Bandeau coloré en tête de carte active (libellé surchargé, pas le label de statut). */
export const ORDER_BANNER: Partial<
  Record<OrderStatus, { label: string; color: string }>
> = {
  pending: { label: 'NOUVELLE COMMANDE', color: '#EF4444' },
  preparing: { label: 'EN PRÉPARATION', color: '#3B82F6' },
  ready: { label: 'PRÊTE', color: '#2E6A3B' },
};

/** Bouton d'action contextuel en pied de carte active. */
export const ORDER_ACTION: Partial<
  Record<OrderStatus, { label: string; color: string }>
> = {
  pending: { label: 'COMMENCER', color: '#2E6A3B' },
  preparing: { label: "C'EST PRÊT", color: '#10B981' },
  ready: { label: 'ASSIGNER LIVREUR', color: '#3B82F6' },
};

/** Raisons d'annulation acceptées par `cancel-order-by-restaurant`. */
export const CANCEL_REASONS = [
  { value: 'out_of_stock', label: 'Rupture de stock' },
  { value: 'restaurant_closed', label: 'Restaurant fermé' },
  { value: 'too_many_orders', label: 'Trop de commandes en cours' },
  { value: 'price_error', label: 'Erreur de prix' },
  { value: 'item_unavailable', label: 'Article indisponible' },
  { value: 'other', label: 'Autre (précisez)' },
] as const;

export type CancelReason = (typeof CANCEL_REASONS)[number]['value'];

/** Statuts sur lesquels `cancel-order-by-restaurant` accepte une annulation. */
export const CANCELLABLE_STATUSES: OrderStatus[] = ['pending', 'confirmed'];

// ============================================
// PRODUITS & CATÉGORIES
// ============================================

export interface VendorProduct {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  /** Prix de vente client — **dérivé par trigger**, jamais écrit par le web. */
  price: number;
  /** Prix net que touche le vendeur — **la seule source de vérité en écriture**. */
  vendor_net_price: number | null;
  unit: string | null;
  image_url: string | null;
  stock_quantity: number | null;
  is_available: boolean;
  is_active: boolean;
  is_published: boolean;
  vendor_menu_category_id: string | null;
  created_at: string;
}

/**
 * Payload d'écriture produit — liste exhaustive (identique à l'app iOS).
 * ⚠️ `price` en est volontairement absent : l'envoyer serait ignoré, et laisser
 * croire qu'on pilote le prix client.
 */
export interface VendorProductInput {
  vendor_id: string;
  name: string;
  description: string | null;
  vendor_net_price: number;
  unit: string | null;
  image_url: string | null;
  stock_quantity: number | null;
  is_available: boolean;
  is_active: boolean;
  is_published: boolean;
  vendor_menu_category_id: string | null;
}

/** Catégorie du vendeur, telle que renvoyée par `get_vendor_menu_categories`. */
export interface VendorMenuCategory {
  id: string;
  vendor_id: string;
  menu_category_id: string;
  kind: string;
  /** Déjà résolu backend : `COALESCE(display_name, menu_categories.name)`. */
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

/** Référentiel global des ~9 « kinds » (`menu_categories`). */
export interface MenuCategoryRef {
  id: string;
  kind: string;
  name: string;
  icon_url: string | null;
  sort_order: number;
}

/**
 * Unités de vente. Masquées pour `restaurant` et `store` (spec §7).
 */
export const PRODUCT_UNITS = [
  'Unité',
  'Plat',
  'Portion',
  'Pièce',
  'Kg',
  'Litre',
  'Verre',
  'Bouteille',
] as const;

/** Le stock n'a de sens que pour une épicerie. */
export function usesStockManagement(vendorType: string | null): boolean {
  return vendorType === 'grocery';
}

/** L'unité de vente est masquée pour les restaurants et commerces. */
export function usesSaleUnit(vendorType: string | null): boolean {
  return vendorType !== 'restaurant' && vendorType !== 'store';
}

// ============================================
// LIVREURS & LIVRAISON
// ============================================

export type DeliveryMode = 'internal_only' | 'pool_only';
export type VehicleType = 'moto' | 'velo' | 'voiture' | 'pied';
export type DriverStatus = 'available' | 'online' | 'offline' | 'busy' | 'on_delivery';

export interface VendorDriver {
  id: string;
  user_id: string | null;
  vendor_id: string | null;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  vehicle_type: VehicleType | null;
  license_plate: string | null;
  is_online: boolean | null;
  is_active: boolean | null;
  is_platform_driver: boolean | null;
  status: DriverStatus | null;
  current_order_id: string | null;
}

/** Un livreur peut être « en ligne » via `is_online` ou via `status`. */
export function isDriverOnline(driver: VendorDriver): boolean {
  return (
    driver.is_online === true ||
    driver.status === 'available' ||
    driver.status === 'online'
  );
}

export function isDriverAvailable(driver: VendorDriver): boolean {
  return isDriverOnline(driver) && driver.is_active !== false && !driver.current_order_id;
}

export function driverStatusText(driver: VendorDriver): string {
  if (driver.is_active === false) return 'Inactif';
  if (driver.current_order_id) return 'En course';
  if (isDriverOnline(driver)) return 'Disponible';
  return 'Hors ligne';
}

/** Le formulaire n'expose que Moto et Voiture (comme l'app iOS). */
export const DRIVER_VEHICLE_OPTIONS = [
  { value: 'moto' as const, label: 'Moto' },
  { value: 'voiture' as const, label: 'Voiture' },
];

/** Validation sénégalaise, identique à `DriverFormSheet.swift`. */
export const DRIVER_PHONE_REGEX = /^(\+221)?(7[0678]\d{7})$/;

// ============================================
// NOTIFICATIONS
// ============================================

export interface VendorNotification {
  id: string;
  type: string | null;
  title: string;
  body: string | null;
  /** JSONB : peut porter `order_id` pour ouvrir la commande concernée. */
  data: Record<string, unknown> | null;
  is_read: boolean | null;
  created_at: string;
}

/** Couleur de la pastille par type de notification. */
export const NOTIFICATION_COLORS: Record<string, string> = {
  new_order: '#2E6A3B',
  order_update: '#3B82F6',
  order_status: '#3B82F6',
  order_cancelled: '#EF4444',
  driver_assigned: '#2E6A3B',
  review: '#F59E0B',
  promotion: '#2E6A3B',
  payout_received: '#2E6A3B',
  system: '#A0A0A0',
};

/** `data.order_id` — permet d'ouvrir le détail depuis une notification. */
export function notificationOrderId(
  notification: VendorNotification
): string | null {
  const id = notification.data?.order_id;
  return typeof id === 'string' ? id : null;
}

// ============================================
// FINANCES
// ============================================

export type PayoutFrequency = 'weekly' | 'twice_weekly' | 'manual';

export const PAYOUT_FREQUENCY_LABELS: Record<PayoutFrequency, string> = {
  weekly: 'Hebdomadaire',
  twice_weekly: '2x / semaine',
  manual: 'Manuel',
};

export const PAYOUT_FREQUENCY_HINTS: Record<PayoutFrequency, string> = {
  weekly: 'Tous les lundis',
  twice_weekly: 'Mardi et vendredi',
  manual: 'Sur décision de Yonima',
};

export interface VendorWallet {
  id: string;
  vendor_id: string;
  balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  payout_frequency: PayoutFrequency | null;
  min_payout_amount: number | null;
  is_active: boolean | null;
  is_blocked: boolean | null;
  blocked_reason: string | null;
  last_payout_at: string | null;
}

export type TransactionType =
  | 'order_credit'
  | 'order_refund'
  | 'payout'
  | 'payout_reversal'
  | 'adjustment_credit'
  | 'adjustment_debit'
  | 'bonus'
  | 'fee';

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  order_credit: 'Commande',
  order_refund: 'Remboursement',
  payout: 'Paiement envoyé',
  payout_reversal: 'Paiement annulé',
  adjustment_credit: 'Ajustement',
  adjustment_debit: 'Ajustement',
  bonus: 'Bonus',
  fee: 'Frais',
};

export interface WalletTransaction {
  id: string;
  reference: string | null;
  type: TransactionType;
  amount: number;
  direction: 'credit' | 'debit';
  balance_after: number | null;
  description: string | null;
  created_at: string;
}

export type PayoutStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'on_hold';

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  pending: 'En attente',
  processing: 'En cours',
  completed: 'Reçu',
  failed: 'Échoué',
  cancelled: 'Annulé',
  on_hold: 'En pause',
};

export const PAYOUT_STATUS_COLORS: Record<PayoutStatus, string> = {
  pending: '#F59E0B',
  processing: '#3B82F6',
  completed: '#10B981',
  failed: '#EF4444',
  cancelled: '#A0A0A0',
  on_hold: '#8B5CF6',
};

export type PayoutMethod = 'wave' | 'orange_money' | 'manual';

export const PAYOUT_METHOD_LABELS: Record<PayoutMethod, string> = {
  wave: 'Wave',
  orange_money: 'Orange Money',
  manual: 'Manuel',
};

export interface VendorPayout {
  id: string;
  payout_reference: string | null;
  period_start: string | null;
  period_end: string | null;
  gross_amount: number;
  total_commissions: number;
  total_adjustments: number;
  fee: number;
  /** Garanti par un CHECK DB : `gross_amount + total_adjustments - fee`. */
  net_amount: number;
  order_count: number | null;
  status: PayoutStatus;
  payout_method: PayoutMethod | null;
  payout_phone: string | null;
  payout_name: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface VendorPaymentInfo {
  vendor_id: string;
  wave_phone: string | null;
  wave_name: string | null;
  wave_verified: boolean | null;
  orange_money_phone: string | null;
  orange_money_name: string | null;
  orange_money_verified: boolean | null;
  preferred_method: 'wave' | 'orange_money' | null;
}

/** `771234567` → `77 ••• •• 67` — on n'affiche jamais le numéro complet. */
export function maskPayoutPhone(phone: string | null): string {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '').replace(/^221/, '');
  if (digits.length !== 9) return phone;
  return `${digits.slice(0, 2)} ••• •• ${digits.slice(7)}`;
}

// ============================================
// ASSISTANTS
// ============================================

export interface VendorAssistant {
  id: string;
  user_id: string;
  vendor_id: string;
  permissions: AssistantPermissions;
  is_active: boolean | null;
  created_at: string;
  user: { id: string; phone: string | null; full_name: string | null } | null;
}

/** Les 8 permissions, groupées comme dans le formulaire iOS. */
export const PERMISSION_GROUPS: {
  title: string;
  items: { key: keyof AssistantPermissions; label: string; hint?: string }[];
}[] = [
  {
    title: 'Commandes',
    items: [
      { key: 'can_view_orders', label: 'Voir les commandes' },
      {
        key: 'can_manage_orders',
        label: 'Gérer les commandes',
        hint: 'Confirmer, annuler',
      },
    ],
  },
  {
    title: 'Produits',
    items: [
      { key: 'can_view_products', label: 'Voir les produits' },
      {
        key: 'can_manage_products',
        label: 'Gérer les produits',
        hint: 'Ajouter, modifier, supprimer',
      },
    ],
  },
  {
    title: 'Livreurs',
    items: [
      { key: 'can_view_drivers', label: 'Voir les livreurs' },
      {
        key: 'can_assign_drivers',
        label: 'Assigner les livreurs',
        hint: 'Attribuer un livreur aux commandes',
      },
    ],
  },
  {
    title: 'Autres',
    items: [
      { key: 'can_view_analytics', label: 'Voir les statistiques' },
      { key: 'can_view_crm', label: 'Accéder au CRM', hint: 'Infos clients' },
    ],
  },
];

/** Preset appliqué à un nouvel assistant (4 permissions sur 8). */
export const DEFAULT_ASSISTANT_PERMISSIONS: AssistantPermissions = {
  can_view_orders: true,
  can_manage_orders: true,
  can_view_products: false,
  can_manage_products: false,
  can_view_drivers: true,
  can_assign_drivers: true,
  can_view_analytics: false,
  can_view_crm: false,
};

/** Chips résumées sur la carte : uniquement les droits de lecture. */
export function permissionSummary(permissions: AssistantPermissions): string[] {
  const chips: string[] = [];
  if (permissions.can_view_orders) chips.push('Commandes');
  if (permissions.can_view_products) chips.push('Produits');
  if (permissions.can_view_drivers) chips.push('Livreurs');
  if (permissions.can_view_analytics) chips.push('Stats');
  return chips;
}

export function countActivePermissions(
  permissions: AssistantPermissions
): number {
  return Object.values(permissions).filter(Boolean).length;
}

// ============================================
// AVIS
// ============================================

export interface VendorReview {
  id: string;
  user_id: string | null;
  order_id: string | null;
  vendor_rating: number | null;
  food_rating: number | null;
  delivery_rating: number | null;
  comment: string | null;
  vendor_response: string | null;
  vendor_response_at: string | null;
  is_verified_purchase: boolean | null;
  is_anonymous: boolean | null;
  created_at: string;
  user: { id: string; phone: string | null; full_name: string | null } | null;
}

export type ReviewFilter = 'all' | 'needsResponse' | 'responded' | 'negative';

export const REVIEW_FILTERS: { value: ReviewFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'needsResponse', label: 'À répondre' },
  { value: 'responded', label: 'Répondus' },
  { value: 'negative', label: 'Négatifs' },
];

/** Note affichée : `vendor_rating`, sinon `food_rating`. */
export function reviewDisplayRating(review: VendorReview): number {
  return review.vendor_rating ?? review.food_rating ?? 0;
}

export function reviewNeedsResponse(review: VendorReview): boolean {
  return !review.vendor_response?.trim();
}

/** Nom respectant l'anonymat, avec repli sur un téléphone masqué. */
export function reviewDisplayName(review: VendorReview): string {
  if (review.is_anonymous) return 'Client anonyme';
  if (review.user?.full_name?.trim()) return review.user.full_name;
  if (review.user?.phone) return `*** ${review.user.phone.slice(-4)}`;
  return 'Client';
}

/** Vert à 5 étoiles, rouge à 1 — dégradé identique à l'app iOS. */
export function reviewRatingColor(rating: number): string {
  if (rating >= 5) return '#10B981';
  if (rating === 4) return '#84CC16';
  if (rating === 3) return '#F59E0B';
  if (rating === 2) return '#F97316';
  if (rating === 1) return '#EF4444';
  return '#A0A0A0';
}

/** Réponses préremplies, jeux distincts selon la tonalité de l'avis. */
export const SUGGESTED_RESPONSES = {
  negative: [
    "Merci pour votre retour. Nous sommes désolés que votre expérience n'ait pas été à la hauteur de vos attentes. Nous prenons vos commentaires très au sérieux.",
    "Nous vous remercions d'avoir pris le temps de nous faire part de votre avis. Nous allons travailler à améliorer ce point.",
    'Toutes nos excuses pour cette expérience décevante. N\'hésitez pas à nous contacter pour que nous puissions rectifier la situation.',
  ],
  positive: [
    'Merci beaucoup pour votre avis ! Nous sommes ravis que vous ayez apprécié votre expérience.',
    "Un grand merci pour votre retour positif ! C'est un plaisir de vous servir.",
    "Merci pour ces étoiles ! Toute l'équipe est heureuse de savoir que vous avez été satisfait(e).",
  ],
} as const;

// ============================================
// HORAIRES
// ============================================

export type WeekDayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface DayHours {
  open: string;
  close: string;
}

/** `vendors.opening_hours` — un jour absent ou `null` = fermé. */
export type OpeningHours = Partial<Record<WeekDayKey, DayHours | null>>;

/** Ordre d'affichage : lundi → dimanche (≠ ordre JS où dimanche = 0). */
export const WEEK_DAYS: { key: WeekDayKey; label: string }[] = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
];

export const DEFAULT_DAY_HOURS: DayHours = { open: '09:00', close: '18:00' };

function toMinutes(time: string): number | null {
  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

/**
 * Le créneau du jour est-il ouvert maintenant ?
 * Gère la fermeture après minuit : si `close <= open`, on ajoute 24 h.
 */
export function isDayOpenNow(day: DayHours, now = new Date()): boolean {
  const open = toMinutes(day.open);
  let close = toMinutes(day.close);
  if (open === null || close === null) return false;

  if (close <= open) close += 24 * 60;

  const current = now.getHours() * 60 + now.getMinutes();
  return current >= open && current < close;
}

/** Clé du jour courant, depuis `Date.getDay()` (0 = dimanche). */
export function currentDayKey(now = new Date()): WeekDayKey {
  const keys: WeekDayKey[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return keys[now.getDay()];
}

/**
 * Statut réel de la boutique.
 * `is_open = false` est un kill-switch prioritaire sur les horaires.
 */
export function isVendorCurrentlyOpen(
  isOpen: boolean | null,
  hours: OpeningHours | null,
  now = new Date()
): boolean {
  if (isOpen === false) return false;
  if (!hours) return isOpen ?? true;

  const today = hours[currentDayKey(now)];
  if (!today) return false;

  return isDayOpenNow(today, now);
}

// ============================================
// STATISTIQUES
// ============================================

export type StatsPeriod =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'last3months'
  | 'thisYear';

export const STATS_PERIODS: { value: StatsPeriod; label: string }[] = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'yesterday', label: 'Hier' },
  { value: 'last7days', label: '7 jours' },
  { value: 'last30days', label: '30 jours' },
  { value: 'thisMonth', label: 'Ce mois' },
  { value: 'last3months', label: '3 mois' },
  { value: 'thisYear', label: 'Cette année' },
];

// ============================================
// CAISSE LIVREURS
// ============================================

/** Ligne de la vue `driver_cash_balances`. */
export interface DriverCashBalance {
  driver_id: string;
  vendor_id: string;
  driver_name: string | null;
  is_platform_driver: boolean | null;
  total_collected: number;
  total_deposited: number;
  cash_on_hand: number;
  total_pending_deposits: number;
  collection_count: number;
  last_collection_at: string | null;
}

/** Cash encaissé par un livreur sur une commande payée en espèces. */
export interface DriverCashCollection {
  id: string;
  order_id: string | null;
  driver_id: string;
  vendor_id: string;
  amount: number;
  order_subtotal: number | null;
  delivery_fee: number | null;
  collected_at: string;
}

export type DepositMethod = 'wave' | 'orange_money' | 'cash';
export type DepositStatus = 'pending' | 'confirmed' | 'rejected';

export const DEPOSIT_METHOD_LABELS: Record<DepositMethod, string> = {
  wave: 'Wave',
  orange_money: 'Orange Money',
  cash: 'Espèces',
};

export const DEPOSIT_STATUS_LABELS: Record<DepositStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  rejected: 'Rejeté',
};

export const DEPOSIT_STATUS_COLORS: Record<DepositStatus, string> = {
  pending: '#F59E0B',
  confirmed: '#10B981',
  rejected: '#EF4444',
};

/** Versement déclaré par un livreur, à valider par le vendeur. */
export interface DriverCashDeposit {
  id: string;
  driver_id: string;
  vendor_id: string | null;
  /** `platform` = versement vers Yonima : le vendeur ne le voit pas. */
  deposit_recipient: 'vendor' | 'platform';
  amount: number;
  deposit_method: DepositMethod | null;
  deposit_phone: string | null;
  transaction_reference: string | null;
  status: DepositStatus;
  driver_note: string | null;
  validator_note: string | null;
  rejection_reason: string | null;
  declared_at: string;
  validated_at: string | null;
}
