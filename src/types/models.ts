// Types métier - Correspondance avec les modèles Android

// ============================================
// USER & AUTH
// ============================================

export interface User {
  id: string;
  phone: string;
  full_name: string | null;
  email: string | null;
  role: 'client' | 'driver' | 'vendor_admin' | 'vendor_assistant' | 'superadmin';
  vendor_id: string | null;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: string;
  name: string;
  iso_code: string;
  dial_code: string;
  flag_emoji: string;
  phone_length: number;
  phone_starts_with: string[];
  phone_regex: string | null;
  phone_pattern: string | null;
  phone_placeholder: string | null;
  display_order: number;
  is_active: boolean;
}

// ============================================
// VENDORS / ESTABLISHMENTS
// ============================================

export type VendorType = 'grocery' | 'restaurant' | 'store' | 'legacy';

export interface TimeSlot {
  open: string;  // "HH:mm"
  close: string; // "HH:mm"
}

export interface OpeningHours {
  monday?: TimeSlot;
  tuesday?: TimeSlot;
  wednesday?: TimeSlot;
  thursday?: TimeSlot;
  friday?: TimeSlot;
  saturday?: TimeSlot;
  sunday?: TimeSlot;
}

export interface Vendor {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  is_frozen: boolean;
  owner_id: string | null;

  // Dakar Delivery fields
  type: VendorType;
  slug: string | null;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  city: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  review_count: number;
  delivery_fee: number;
  min_order: number;
  estimated_time: string | null;
  is_open: boolean;
  is_featured: boolean;
  is_new: boolean;
  accepts_cash: boolean;
  accepts_card: boolean;
  tags: string[];
  whatsapp: string | null;
  sort_order: number;
  opening_hours: OpeningHours | null;
  relevance_score: number | null;

  created_at: string;
  updated_at: string;
}

// Alias pour compatibilité
export type Establishment = Vendor;

// ============================================
// PRODUCTS & PACKS
// ============================================

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number; // en FCFA
  unit: string | null;
  image_url: string | null;
  audio_description_url: string | null;
  category_id: string | null;
  vendor_category_id: string | null;
  vendor_id: string;
  is_available: boolean;
  is_active: boolean;
  is_published: boolean;
  popularity_score: number | null;
  created_at: string;
}

export interface Category {
  id: string;
  vendor_id: string;
  name: string;
  slug: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface VendorCategory {
  id: string;
  vendor_id: string;
  name: string;
  slug: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Pack {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  audio_description_url: string | null;
  is_published: boolean;
  order_count: number;
  pack_items?: PackItem[];
  created_at: string;
}

export interface PackItem {
  id: string;
  pack_id: string;
  product_id: string | null;
  name: string;
  quantity: number;
  available: boolean;
}

// ============================================
// CART
// ============================================

export type CartItemType = 'product' | 'pack';

export interface CartItem {
  id: string;
  type: CartItemType;
  name: string;
  image_url: string | null;
  price: number;
  quantity: number;
  vendor_id: string;
  establishment_id: string | null;
}

export interface CartState {
  items: CartItem[];
  vendor_id: string | null;
  establishment_id: string | null;
  establishment: Vendor | null;
}

// ============================================
// ORDERS
// ============================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'driver_assigned'
  | 'driver_on_the_way'
  | 'delivering'
  | 'arrived'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'wave' | 'orange_money' | 'cash';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  vendor_id: string;
  assigned_driver_id: string | null;
  driver_id: string | null;

  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;

  delivery_address: string;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  delivery_note: string | null;

  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  proof_photo_url: string | null;

  // Promo
  promo_id: string | null;
  promo_discount: number;

  // Loyalty
  loyalty_redemption_id: string | null;
  loyalty_discount: number;

  // Timestamps
  driver_assigned_at: string | null;
  prepared_at: string | null;
  ready_at: string | null;
  driver_on_the_way_at: string | null;
  arrived_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;

  created_at: string;
  updated_at: string;

  // Relations
  order_items?: OrderItem[];
  vendor?: Vendor;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  pack_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_name: string | null;
  item_type: string | null;
}

// ============================================
// REVIEWS
// ============================================

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type ReportReason = 'spam' | 'inappropriate' | 'fake' | 'offensive' | 'other';

export interface Review {
  id: string;
  user_id: string | null;
  order_id: string | null;
  vendor_id: string;
  driver_id: string | null;

  vendor_rating: number | null; // 1-5
  delivery_rating: number | null;
  food_rating: number | null;
  comment: string | null;

  status: ReviewStatus;
  vendor_response: string | null;
  vendor_response_at: string | null;

  is_verified_purchase: boolean;
  is_anonymous: boolean;
  helpful_count: number;
  report_count: number;

  created_at: string;
  updated_at: string;

  // Relations
  user?: { full_name: string | null };
  vendor?: { id: string; name: string; logo_url: string | null };
}

export interface ReviewReport {
  id: string;
  review_id: string;
  reported_by: string;
  reason: ReportReason;
  description: string | null;
  status: string | null;
  created_at: string;
}

// ============================================
// LOYALTY
// ============================================

export type TransactionType = 'earned' | 'spent' | 'bonus' | 'adjustment' | 'expired';
export type RewardType = 'discount_fixed' | 'discount_percent' | 'free_delivery' | 'free_product';
export type RedemptionStatus = 'pending' | 'applied' | 'cancelled';

export interface UserLoyalty {
  id: string;
  user_id: string;
  total_points: number;
  lifetime_points: number;
  current_tier_id: string | null;
  tier?: LoyaltyTier;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  min_points: number;
  points_multiplier: number;
  color: string;
  icon: string | null;
  benefits: string[];
  sort_order: number;
  is_active: boolean;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  order_id: string | null;
  reward_id: string | null;
  points: number;
  type: TransactionType;
  description: string | null;
  created_at: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  min_order_amount: number;
  reward_type: RewardType;
  reward_value: number | null;
  valid_days: number;
  is_active: boolean;
  sort_order: number;
}

export interface LoyaltyRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  order_id: string | null;
  points_spent: number;
  status: RedemptionStatus;
  reward?: LoyaltyReward;
  created_at: string;
  applied_at: string | null;
}

export interface LoyaltyConfig {
  id: string;
  points_per_amount: number;
  welcome_bonus: number;
  referral_bonus: number;
  referral_referee_bonus: number;
  is_active: boolean;
}

// ============================================
// PROMO
// ============================================

export type DiscountType = 'percentage' | 'fixed';

export interface Promo {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  usage_limit: number;
  per_user_limit: number;
  usage_count: number;
  is_active: boolean;
  vendor_id: string | null;
  vendor_type: string | null;
  created_at: string;
}

export interface PromoValidationResult {
  success: boolean;
  promo?: {
    id: string;
    code: string;
    name: string;
    discount_type: DiscountType;
    discount_value: number;
    calculated_discount: number;
  };
  error?: string;
  error_code?: 'invalid_code' | 'expired' | 'limit_reached' | 'min_amount' | 'vendor_mismatch' | 'already_used' | 'not_started';
}

// ============================================
// NOTIFICATIONS
// ============================================

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

// ============================================
// DELIVERY ADDRESS
// ============================================

export interface DeliveryAddress {
  id: string;
  user_id: string;
  label: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
}

// ============================================
// APP FEATURES (Feature Flags)
// ============================================

export interface AppFeature {
  id: string;
  feature_key: string;
  is_enabled: boolean;
  description: string | null;
}
