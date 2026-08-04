'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Vendor } from '@/types/models';

/** One cart per restaurant. */
export interface VendorCart {
  vendor: Vendor | null;
  items: CartItem[];
  /** Timestamp of the last mutation — used to pick the active cart. */
  updatedAt: number;
}

interface CartStore {
  /** Multi-restaurant model: a separate cart per vendor, never cleared silently. */
  carts: Record<string, VendorCart>;
  /** The most recently modified cart (where new items land / what the cart page shows). */
  activeVendorId: string | null;

  // --- Materialized view of the ACTIVE cart (kept in sync on every mutation) ---
  // Real state fields (not getters) so persist rehydration works reliably and
  // existing product/cart/checkout components keep reading them unchanged.
  items: CartItem[];
  vendorId: string | null;
  establishment: Vendor | null;

  // --- Mutations ---
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }, vendor?: Vendor) => void;
  removeItem: (id: string, vendorId?: string) => void;
  updateQuantity: (id: string, quantity: number, vendorId?: string) => void;
  incrementQuantity: (id: string, vendorId?: string) => void;
  decrementQuantity: (id: string, vendorId?: string) => void;
  /** Clear a single vendor's cart (default: the active one). */
  clearVendor: (vendorId?: string) => void;
  /** Clear everything. */
  clear: () => void;
  setActiveVendor: (vendorId: string) => void;

  // --- Computed (multi-cart) ---
  getCartCount: () => number;
  getVendorIds: () => string[];
  getVendorCart: (vendorId: string) => VendorCart | null;
  getActiveCart: () => VendorCart | null;
  getVendorSubtotal: (vendorId: string) => number;
  getVendorItemCount: (vendorId: string) => number;

  // --- Computed on the active cart (mono-vendor API) ---
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
  canAddFromEstablishment: (vendorId: string) => boolean;
}

/** Resolve which vendor a given item id lives in (used when callers omit vendorId). */
function findVendorOfItem(
  carts: Record<string, VendorCart>,
  id: string,
  fallback: string | null
): string | null {
  if (fallback && carts[fallback]?.items.some((i) => i.id === id)) return fallback;
  for (const [vid, cart] of Object.entries(carts)) {
    if (cart.items.some((i) => i.id === id)) return vid;
  }
  return fallback;
}

/** After a change, pick the most recently updated non-empty cart as active. */
function recomputeActive(carts: Record<string, VendorCart>): string | null {
  let best: string | null = null;
  let bestTs = -1;
  for (const [vid, cart] of Object.entries(carts)) {
    if (cart.items.length > 0 && cart.updatedAt > bestTs) {
      best = vid;
      bestTs = cart.updatedAt;
    }
  }
  return best;
}

/**
 * Build the full persisted+materialized slice from carts + a preferred active id.
 * Keeps items/vendorId/establishment in lockstep with the active cart.
 */
function materialize(
  carts: Record<string, VendorCart>,
  preferredActive: string | null
) {
  const activeVendorId =
    preferredActive && carts[preferredActive]?.items.length
      ? preferredActive
      : recomputeActive(carts);
  const active = activeVendorId ? carts[activeVendorId] : null;
  return {
    carts,
    activeVendorId,
    items: active?.items ?? [],
    vendorId: activeVendorId,
    establishment: active?.vendor ?? null,
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      carts: {},
      activeVendorId: null,
      items: [],
      vendorId: null,
      establishment: null,

      addItem: (item, vendor) => {
        const { carts } = get();
        const vid = item.vendor_id;
        const existing = carts[vid];
        const now = Date.now();

        let nextCart: VendorCart;
        if (existing) {
          const idx = existing.items.findIndex((i) => i.id === item.id && i.type === item.type);
          const items =
            idx > -1
              ? existing.items.map((i, k) =>
                  k === idx ? { ...i, quantity: i.quantity + (item.quantity ?? 1) } : i
                )
              : [...existing.items, { ...item, quantity: item.quantity ?? 1 }];
          nextCart = { vendor: vendor ?? existing.vendor, items, updatedAt: now };
        } else {
          nextCart = {
            vendor: vendor ?? null,
            items: [{ ...item, quantity: item.quantity ?? 1 }],
            updatedAt: now,
          };
        }
        set(materialize({ ...carts, [vid]: nextCart }, vid));
      },

      removeItem: (id, vendorId) => {
        const { carts, activeVendorId } = get();
        const vid = vendorId ?? findVendorOfItem(carts, id, activeVendorId);
        if (!vid || !carts[vid]) return;

        const items = carts[vid].items.filter((i) => i.id !== id);
        const next = { ...carts };
        if (items.length === 0) delete next[vid];
        else next[vid] = { ...carts[vid], items, updatedAt: Date.now() };
        set(materialize(next, activeVendorId));
      },

      updateQuantity: (id, quantity, vendorId) => {
        if (quantity <= 0) {
          get().removeItem(id, vendorId);
          return;
        }
        const { carts, activeVendorId } = get();
        const vid = vendorId ?? findVendorOfItem(carts, id, activeVendorId);
        if (!vid || !carts[vid]) return;

        const items = carts[vid].items.map((i) => (i.id === id ? { ...i, quantity } : i));
        set(materialize({ ...carts, [vid]: { ...carts[vid], items, updatedAt: Date.now() } }, activeVendorId));
      },

      incrementQuantity: (id, vendorId) => {
        const { carts, activeVendorId } = get();
        const vid = vendorId ?? findVendorOfItem(carts, id, activeVendorId);
        const item = vid ? carts[vid]?.items.find((i) => i.id === id) : undefined;
        if (item) get().updateQuantity(id, item.quantity + 1, vid ?? undefined);
      },

      decrementQuantity: (id, vendorId) => {
        const { carts, activeVendorId } = get();
        const vid = vendorId ?? findVendorOfItem(carts, id, activeVendorId);
        const item = vid ? carts[vid]?.items.find((i) => i.id === id) : undefined;
        if (item) get().updateQuantity(id, item.quantity - 1, vid ?? undefined);
      },

      clearVendor: (vendorId) => {
        const { carts, activeVendorId } = get();
        const vid = vendorId ?? activeVendorId;
        if (!vid || !carts[vid]) return;
        const next = { ...carts };
        delete next[vid];
        set(materialize(next, activeVendorId === vid ? null : activeVendorId));
      },

      clear: () => set(materialize({}, null)),

      setActiveVendor: (vendorId) => {
        const { carts } = get();
        if (carts[vendorId]) set(materialize(carts, vendorId));
      },

      // --- Computed (multi-cart) ---
      getCartCount: () => Object.keys(get().carts).length,
      getVendorIds: () => Object.keys(get().carts),
      getVendorCart: (vendorId) => get().carts[vendorId] ?? null,
      getActiveCart: () => {
        const { carts, activeVendorId } = get();
        return activeVendorId ? carts[activeVendorId] ?? null : null;
      },
      getVendorSubtotal: (vendorId) =>
        (get().carts[vendorId]?.items ?? []).reduce((t, i) => t + i.price * i.quantity, 0),
      getVendorItemCount: (vendorId) =>
        (get().carts[vendorId]?.items ?? []).reduce((t, i) => t + i.quantity, 0),

      // --- Computed on the active cart ---
      getTotalItems: () => get().items.reduce((t, i) => t + i.quantity, 0),
      getSubtotal: () => get().items.reduce((t, i) => t + i.price * i.quantity, 0),
      getDeliveryFee: () => get().establishment?.delivery_fee ?? 1000,
      getTotal: () => get().getSubtotal() + get().getDeliveryFee(),
      canAddFromEstablishment: () => true,
    }),
    {
      name: 'yonima-cart-v2',
      version: 2,
      // Only persist the source of truth; materialized fields are rebuilt on merge.
      partialize: (state) => ({
        carts: state.carts,
        activeVendorId: state.activeVendorId,
      }),
      // Rebuild items/vendorId/establishment from the persisted carts on rehydrate.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<CartStore>;
        return { ...current, ...materialize(p.carts ?? {}, p.activeVendorId ?? null) };
      },
      // Migrate the old mono-vendor shape ({ items, vendorId, establishment }) → carts.
      migrate: (persisted: unknown, version: number) => {
        if (version < 2 && persisted && typeof persisted === 'object') {
          const old = persisted as {
            items?: CartItem[];
            vendorId?: string | null;
            establishment?: Vendor | null;
          };
          if (old.items?.length && old.vendorId) {
            return {
              carts: {
                [old.vendorId]: {
                  vendor: old.establishment ?? null,
                  items: old.items,
                  updatedAt: Date.now(),
                },
              },
              activeVendorId: old.vendorId,
            } as Partial<CartStore>;
          }
        }
        return persisted as Partial<CartStore>;
      },
    }
  )
);

// --- Selectors ---

// Active-cart selectors
export const useCartItems = () => useCartStore((s) => s.items);
export const useCartSubtotal = () => useCartStore((s) => s.getSubtotal());
export const useCartTotal = () => useCartStore((s) => s.getTotal());
export const useCartEstablishment = () => useCartStore((s) => s.establishment);

/** Header/nav badge = number of distinct carts (matches the mobile design's "2"). */
export const useCartItemCount = () => useCartStore((s) => Object.keys(s.carts).length);

// Multi-cart selectors
export const useCartCount = () => useCartStore((s) => Object.keys(s.carts).length);
export const useActiveVendorId = () => useCartStore((s) => s.activeVendorId);
export const useActiveCart = () => useCartStore((s) => s.getActiveCart());
