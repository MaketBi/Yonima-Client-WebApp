# Yonima Web App - Specifications Techniques

> Documentation complete pour la creation de l'application web Yonima basee sur l'application iOS existante.

---

## 1. Stack Technique

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 14 (App Router) | Framework React SSR/SSG |
| **React** | 18 | Librairie UI |
| **TypeScript** | 5.x | Typage statique |
| **Tailwind CSS** | 3.x | Styling utilitaire |
| **shadcn/ui** | latest | Composants UI (Radix UI) |
| **Lucide React** | latest | Icones |

### Backend / BaaS
| Technologie | Usage |
|-------------|-------|
| **Supabase** | PostgreSQL, Auth, Storage, Real-time |
| **Server Actions** | Next.js "use server" pour mutations |

### State & Data
| Technologie | Usage |
|-------------|-------|
| **React Hooks** | useState, useEffect, useCallback |
| **Supabase Real-time** | Subscriptions pour commandes |

### UI Libraries
| Librairie | Usage |
|-----------|-------|
| **Sonner** | Toasts / Notifications |
| **Recharts** | Graphiques analytics |
| **React Hook Form** | Gestion formulaires |
| **Zod** | Validation schemas |
| **date-fns** | Manipulation dates |

### Maps
| Librairie | Usage |
|-----------|-------|
| **Leaflet** | Cartes interactives |
| **React-Leaflet** | Integration React |

### Styling Utilities
| Librairie | Usage |
|-----------|-------|
| **CVA** | Class Variance Authority - variants composants |
| **tailwind-merge** | Fusion classes Tailwind |
| **clsx** | Classes conditionnelles |

---

## 2. Structure du Projet

```
yonima-client-webapp/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Routes authentification
│   │   ├── login/
│   │   └── register/
│   ├── (main)/                   # Routes principales (avec layout)
│   │   ├── page.tsx              # Accueil
│   │   ├── epicerie/
│   │   │   ├── page.tsx          # Liste epicerie
│   │   │   └── [categoryId]/
│   │   ├── restaurants/
│   │   │   ├── page.tsx          # Liste restaurants
│   │   │   └── [slug]/
│   │   ├── commerces/
│   │   │   ├── page.tsx          # Liste commerces
│   │   │   └── [slug]/
│   │   ├── produit/[id]/
│   │   ├── pack/[id]/
│   │   ├── panier/
│   │   ├── commandes/
│   │   │   ├── page.tsx          # Liste commandes
│   │   │   └── [id]/
│   │   ├── profil/
│   │   ├── fidelite/
│   │   └── notifications/
│   ├── api/                      # API Routes (si necessaire)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Header, Footer, Navigation
│   ├── home/                     # Composants accueil
│   ├── establishment/            # Cards, listes etablissements
│   ├── product/                  # Cards produits/packs
│   ├── cart/                     # Panier, checkout
│   ├── order/                    # Commandes, suivi
│   ├── auth/                     # Login, OTP
│   ├── loyalty/                  # Programme fidelite
│   ├── review/                   # Avis clients
│   └── shared/                   # Composants partages
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Client browser
│   │   ├── server.ts             # Client server
│   │   └── middleware.ts         # Auth middleware
│   ├── utils.ts                  # cn(), formatters
│   └── constants.ts              # Constantes app
├── hooks/
│   ├── use-cart.ts               # Hook panier
│   ├── use-auth.ts               # Hook authentification
│   ├── use-location.ts           # Hook geolocalisation
│   └── use-realtime.ts           # Hook subscriptions
├── stores/
│   ├── cart-store.ts             # Zustand store panier
│   └── user-store.ts             # Zustand store user
├── types/
│   ├── database.ts               # Types Supabase generes
│   ├── models.ts                 # Types metier
│   └── api.ts                    # Types API
├── actions/                      # Server Actions
│   ├── auth.ts
│   ├── orders.ts
│   ├── promo.ts
│   └── loyalty.ts
└── public/
    ├── images/
    └── icons/
```

---

## 3. Modeles de Donnees (Types TypeScript)

### 3.1 Utilisateur

```typescript
// types/models.ts

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
```

### 3.2 Etablissements (Vendors)

```typescript
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

// Alias pour compatibilite iOS
export type Establishment = Vendor;
```

### 3.3 Produits et Packs

```typescript
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
```

### 3.4 Panier

```typescript
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
```

### 3.5 Commandes

```typescript
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

export type PaymentMethod = 'cash' | 'wave' | 'orange_money' | 'card';
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
```

### 3.6 Avis (Reviews)

```typescript
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
```

### 3.7 Programme Fidelite

```typescript
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
```

### 3.8 Codes Promo

```typescript
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
```

---

## 4. Pages et Routes

### 4.1 Pages Publiques

| Route | Page | Description |
|-------|------|-------------|
| `/` | Accueil | Hero, sections restaurants/commerces/epicerie |
| `/restaurants` | Liste restaurants | Filtres, tri, cards |
| `/restaurants/[slug]` | Detail restaurant | Menu, produits, avis, panier |
| `/commerces` | Liste commerces | Filtres, tri, cards |
| `/commerces/[slug]` | Detail commerce | Produits, panier |
| `/epicerie` | Epicerie Yonima | Categories, produits internes |
| `/epicerie/[categoryId]` | Categorie epicerie | Produits filtres |
| `/produit/[id]` | Detail produit | Description, ajout panier |
| `/pack/[id]` | Detail pack | Contenu, ajout panier |
| `/panier` | Panier | Checkout complet |
| `/login` | Connexion | OTP telephone |

### 4.2 Pages Protegees (Auth Required)

| Route | Page | Description |
|-------|------|-------------|
| `/commandes` | Mes commandes | Liste avec filtres par statut |
| `/commandes/[id]` | Detail commande | Statut, items, suivi |
| `/profil` | Mon profil | Infos, edition, deconnexion |
| `/fidelite` | Ma fidelite | Points, tier, recompenses |
| `/notifications` | Notifications | Liste, marquage lu |

---

## 5. Composants UI Principaux

### 5.1 Layout

```
components/layout/
├── header.tsx              # Navigation principale
├── mobile-nav.tsx          # Menu mobile hamburger
├── footer.tsx              # Footer avec liens
├── bottom-nav.tsx          # Navigation mobile fixe (style app)
├── smart-app-banner.tsx    # Banner "Ouvrir dans l'app"
└── page-container.tsx      # Container avec padding
```

### 5.2 Etablissements

```
components/establishment/
├── establishment-card.tsx         # Card etablissement
├── establishment-list.tsx         # Liste avec filtres
├── establishment-filters.tsx      # Filtres (type, ouvert, tri)
├── establishment-header.tsx       # Header page detail
├── establishment-info.tsx         # Infos (horaires, adresse)
├── opening-hours-badge.tsx        # Badge ouvert/ferme
├── rating-stars.tsx               # Affichage etoiles
└── delivery-info.tsx              # Temps, frais livraison
```

### 5.3 Produits

```
components/product/
├── product-card.tsx              # Card produit
├── product-grid.tsx              # Grille produits
├── product-detail.tsx            # Vue detail
├── pack-card.tsx                 # Card pack
├── pack-detail.tsx               # Vue detail pack
├── category-tabs.tsx             # Tabs categories
├── quantity-selector.tsx         # Selecteur +/-
└── add-to-cart-button.tsx        # Bouton ajout panier
```

### 5.4 Panier

```
components/cart/
├── cart-sheet.tsx                # Sheet panier (slide)
├── cart-item.tsx                 # Ligne item panier
├── cart-summary.tsx              # Resume prix
├── promo-code-input.tsx          # Saisie code promo
├── loyalty-reward-selector.tsx   # Selection recompense
├── delivery-address-form.tsx     # Formulaire adresse
├── payment-method-selector.tsx   # Selection paiement
├── checkout-button.tsx           # Bouton commander
└── order-confirmation.tsx        # Page confirmation
```

### 5.5 Commandes

```
components/order/
├── order-card.tsx               # Card commande liste
├── order-status-badge.tsx       # Badge statut
├── order-status-tabs.tsx        # Tabs filtres statut
├── order-timeline.tsx           # Timeline etapes
├── order-items-list.tsx         # Liste items
├── order-summary.tsx            # Resume commande
└── order-tracking-map.tsx       # Carte suivi (Leaflet)
```

### 5.6 Auth

```
components/auth/
├── phone-input.tsx              # Input telephone + pays
├── country-picker.tsx           # Selecteur pays
├── otp-input.tsx                # Saisie code OTP
├── otp-modal.tsx                # Modal verification
└── auth-guard.tsx               # Protection routes
```

### 5.7 Fidelite

```
components/loyalty/
├── loyalty-card.tsx             # Card points/tier
├── tier-progress.tsx            # Barre progression
├── rewards-list.tsx             # Liste recompenses
├── reward-card.tsx              # Card recompense
├── transactions-list.tsx        # Historique points
├── redemptions-list.tsx         # Echanges actifs
└── celebration-modal.tsx        # Modal confettis
```

### 5.8 Avis

```
components/review/
├── reviews-section.tsx          # Section avis vendeur
├── review-card.tsx              # Card avis
├── rating-summary.tsx           # Resume notes
├── submit-review-form.tsx       # Formulaire avis
├── star-rating-input.tsx        # Input etoiles
├── review-prompt-card.tsx       # Invitation noter
└── existing-review-card.tsx     # Avis deja donne
```

### 5.9 Shared

```
components/shared/
├── loading-spinner.tsx
├── empty-state.tsx
├── error-state.tsx
├── search-input.tsx
├── price-display.tsx
├── image-with-fallback.tsx
├── audio-player-button.tsx
├── location-picker.tsx
├── map-view.tsx
└── confetti-animation.tsx
```

---

## 6. Hooks Personnalises

### 6.1 useCart

```typescript
// hooks/use-cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  vendorId: string | null;
  establishment: Vendor | null;

  // Computed
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  total: number;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  clear: () => void;
  setEstablishment: (establishment: Vendor) => void;
  canAddFromEstablishment: (establishment: Vendor) => boolean;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      // ... implementation
    }),
    { name: 'yonima-cart' }
  )
);
```

### 6.2 useAuth

```typescript
// hooks/use-auth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Supabase auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch user profile
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUser(data);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, signOut };
}
```

### 6.3 useLocation

```typescript
// hooks/use-location.ts
export function useLocation() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position);
        // Reverse geocoding
        reverseGeocode(position.coords);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  return { location, address, loading, error, requestLocation };
}
```

### 6.4 useRealtimeOrders

```typescript
// hooks/use-realtime-orders.ts
export function useRealtimeOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchOrder(orderId).then(setOrder);

    // Realtime subscription
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          setOrder(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return order;
}
```

---

## 7. Server Actions

### 7.1 Auth Actions

```typescript
// actions/auth.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function requestOtp(phone: string, isRegister: boolean, fullName?: string) {
  const supabase = createServerClient();

  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/simple-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      phone,
      app_type: 'client',
      action: isRegister ? 'register' : 'login',
      full_name: fullName
    })
  });

  return response.json();
}

export async function verifyOtp(phone: string, code: string) {
  // ... similar implementation
}

export async function signOut() {
  const supabase = createServerClient();
  await supabase.auth.signOut();
}
```

### 7.2 Order Actions

```typescript
// actions/orders.ts
'use server';

export async function createOrder(data: CreateOrderData) {
  const supabase = createServerClient();
  const session = await supabase.auth.getSession();

  if (!session.data.session) {
    return { error: 'Non authentifie' };
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.data.session.access_token}`
    },
    body: JSON.stringify(data)
  });

  return response.json();
}

export async function getOrders(status?: OrderStatus) {
  const supabase = createServerClient();

  let query = supabase
    .from('orders')
    .select(`
      *,
      vendor:vendors(id, name, logo_url),
      order_items(*)
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  return { data, error };
}
```

### 7.3 Promo Actions

```typescript
// actions/promo.ts
'use server';

export async function validatePromo(code: string, subtotal: number, vendorId: string, vendorType?: string) {
  const supabase = createServerClient();
  const session = await supabase.auth.getSession();

  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/validate-promo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.data.session?.access_token}`
    },
    body: JSON.stringify({ code, subtotal, vendorId, vendorType })
  });

  return response.json() as Promise<PromoValidationResult>;
}
```

---

## 8. Configuration Supabase

### 8.1 Client Browser

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 8.2 Client Server

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

### 8.3 Middleware Auth

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/commandes', '/profil', '/fidelite', '/notifications'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Check protected routes
  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 9. Variables d'Environnement

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
NEXT_PUBLIC_APP_URL=https://yonima.sn
NEXT_PUBLIC_APP_NAME=Yonima

# iOS App Store (pour Smart App Banner)
NEXT_PUBLIC_IOS_APP_ID=123456789
NEXT_PUBLIC_IOS_APP_URL=https://apps.apple.com/app/yonima/id123456789

# Analytics (optionnel)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 10. Feature Flags

La table `app_features` controle l'affichage des fonctionnalites :

| feature_key | Description |
|-------------|-------------|
| `promo_codes` | Activation codes promo |
| `loyalty_program` | Programme fidelite |
| `loyalty_rewards` | Echange recompenses |
| `reviews` | Systeme avis |

```typescript
// hooks/use-features.ts
export function useFeatures() {
  const [features, setFeatures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchFeatures = async () => {
      const { data } = await supabase
        .from('app_features')
        .select('feature_key, is_enabled');

      const featuresMap = data?.reduce((acc, f) => {
        acc[f.feature_key] = f.is_enabled;
        return acc;
      }, {} as Record<string, boolean>) || {};

      setFeatures(featuresMap);
    };

    fetchFeatures();
  }, []);

  return {
    promoCodesEnabled: features.promo_codes ?? false,
    loyaltyProgramEnabled: features.loyalty_program ?? false,
    loyaltyRewardsEnabled: features.loyalty_rewards ?? false,
    reviewsEnabled: features.reviews ?? false,
  };
}
```

---

## 11. Smart App Banner

Pour rediriger vers l'app mobile :

```typescript
// components/layout/smart-app-banner.tsx
'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function SmartAppBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detecter iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Ne pas afficher si deja ferme ou si dans l'app
    const dismissed = localStorage.getItem('app-banner-dismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (!dismissed && !isStandalone && iOS) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b z-50 p-3">
      <div className="flex items-center gap-3">
        <img src="/app-icon.png" alt="Yonima" className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <p className="font-semibold text-sm">Yonima</p>
          <p className="text-xs text-gray-500">Ouvrir dans l'application</p>
        </div>
        <a
          href={`https://apps.apple.com/app/yonima/id${process.env.NEXT_PUBLIC_IOS_APP_ID}`}
          className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium"
        >
          Ouvrir
        </a>
        <button onClick={() => {
          setShow(false);
          localStorage.setItem('app-banner-dismissed', 'true');
        }}>
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
```

---

## 12. SEO et Partage

### Meta Tags Dynamiques

```typescript
// app/restaurants/[slug]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const restaurant = await getRestaurant(params.slug);

  return {
    title: `${restaurant.name} | Yonima`,
    description: restaurant.description || `Commander chez ${restaurant.name} sur Yonima`,
    openGraph: {
      title: restaurant.name,
      description: restaurant.description,
      images: [restaurant.cover_image_url || '/og-default.jpg'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: restaurant.name,
      description: restaurant.description,
      images: [restaurant.cover_image_url],
    },
  };
}
```

### Deep Links vers App

```typescript
// Pour les URLs de produits partages
// Exemple: https://yonima.sn/produit/abc123

// Dans la page produit, ajouter un lien universel
<a href={`yonima://produit/${product.id}`}>
  Ouvrir dans l'app
</a>
```

---

## 13. Checklist Implementation

### Phase 1 - Setup
- [ ] Initialiser projet Next.js 14
- [ ] Configurer Tailwind + shadcn/ui
- [ ] Setup Supabase client
- [ ] Configurer middleware auth
- [ ] Creer layout de base

### Phase 2 - Auth
- [ ] Page login avec telephone
- [ ] Selecteur pays
- [ ] Modal OTP
- [ ] Protection routes

### Phase 3 - Catalogue
- [ ] Page accueil
- [ ] Liste restaurants
- [ ] Liste commerces
- [ ] Detail etablissement
- [ ] Liste produits
- [ ] Detail produit/pack
- [ ] Epicerie interne

### Phase 4 - Panier
- [ ] Cart store (Zustand)
- [ ] Sheet panier
- [ ] Formulaire livraison
- [ ] Code promo
- [ ] Selection paiement
- [ ] Creation commande

### Phase 5 - Commandes
- [ ] Liste commandes avec filtres
- [ ] Detail commande
- [ ] Suivi realtime
- [ ] Timeline statut

### Phase 6 - Profil
- [ ] Page profil
- [ ] Edition profil
- [ ] Upload photo

### Phase 7 - Fidelite
- [ ] Affichage points/tier
- [ ] Liste recompenses
- [ ] Historique
- [ ] Echange points

### Phase 8 - Avis
- [ ] Section avis etablissement
- [ ] Formulaire soumission
- [ ] Affichage avis existant

### Phase 9 - Finitions
- [ ] Smart App Banner
- [ ] SEO meta tags
- [ ] PWA manifest
- [ ] Analytics
- [ ] Tests

---

## 14. Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [Leaflet Maps](https://leafletjs.com)

---

> Document genere le 10 Janvier 2026
> Base sur l'application iOS Yonima v1.x
