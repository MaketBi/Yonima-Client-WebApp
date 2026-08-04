'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SafeImage } from '@/components/shared/safe-image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Wordmark } from '@/components/yonima/wordmark';
import { useCartStore, type VendorCart } from '@/stores/cart-store';
import { cn, formatPrice, isVendorOpen } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

interface CartsListProps {
  /** Switch to the single-cart content view for this vendor. */
  onView: (vendorId: string) => void;
}

/**
 * "Paniers" screen (mobile spec §8a): one card per open cart, the active cart
 * pinned first with a green stripe + "PANIER ACTIF" badge. Cards for closed
 * vendors are dimmed with an "Indisponible" banner and a disabled CTA.
 * Shown only when there are ≥2 carts.
 */
export function CartsList({ onView }: CartsListProps) {
  const carts = useCartStore((s) => s.carts);
  const activeVendorId = useCartStore((s) => s.activeVendorId);
  const clearVendor = useCartStore((s) => s.clearVendor);

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  // Active cart first, then the rest.
  const entries = Object.entries(carts).sort(([a], [b]) => {
    if (a === activeVendorId) return -1;
    if (b === activeVendorId) return 1;
    return 0;
  });

  const cartCount = entries.length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 flex h-14 items-center gap-2.5 border-b bg-white px-4">
        <Wordmark size={20} />
        <div className="flex-1" />
        <Badge variant="soft" className="px-2.5 py-1 text-[10px] tracking-wide">
          {cartCount} PANIERS
        </Badge>
      </div>

      <div className="container pt-5">
        <div className="flex items-center justify-between">
          <h1 className="text-[30px] font-bold tracking-tight">Paniers</h1>
          <Button variant="secondary" size="sm" shape="pill" asChild>
            <Link href={ROUTES.commandes}>Commandes</Link>
          </Button>
        </div>
        <p className="mt-1.5 text-sm leading-snug text-ink-muted">
          Un panier par restaurant. Rien ne s&apos;efface quand tu changes de resto.
        </p>

        <div className="mt-4 flex flex-col gap-3.5">
          {entries.map(([vendorId, cart]) => (
            <CartCard
              key={vendorId}
              vendorId={vendorId}
              cart={cart}
              isActive={vendorId === activeVendorId}
              onView={() => onView(vendorId)}
              onRequestDelete={() => setPendingDelete(vendorId)}
            />
          ))}
        </div>
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce panier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les articles de ce restaurant seront retirés. Tes autres paniers ne
              sont pas touchés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) clearVendor(pendingDelete);
                setPendingDelete(null);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CartCard({
  cart,
  isActive,
  onView,
  onRequestDelete,
}: {
  vendorId: string;
  cart: VendorCart;
  isActive: boolean;
  onView: () => void;
  onRequestDelete: () => void;
}) {
  const vendor = cart.vendor;
  const available = !!vendor && vendor.is_open && isVendorOpen(vendor.opening_hours);
  const itemCount = cart.items.reduce((t, i) => t + i.quantity, 0);
  const subtotal = cart.items.reduce((t, i) => t + i.price * i.quantity, 0);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-white',
        isActive && 'pl-1'
      )}
    >
      {isActive && (
        <div className="absolute inset-y-0 left-0 w-1 bg-green-forest" aria-hidden="true" />
      )}

      {!available && (
        <div className="bg-neutral-100 px-4 py-2.5 text-xs font-semibold text-ink-muted">
          Indisponible pour le moment
        </div>
      )}

      <div className="p-4">
        <div className={cn('flex gap-3.5', !available && 'opacity-45')}>
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-pill bg-neutral-200">
            <SafeImage
              src={vendor?.logo_url || ''}
              alt={vendor?.name || ''}
              fill
              className="object-cover"
              fallback={<span className="text-xl">🍽️</span>}
              fallbackClassName="absolute inset-0"
            />
          </div>
          <div className="min-w-0 flex-1">
            {isActive && (
              <Badge variant="soft" className="mb-1.5 px-2.5 py-1 text-[10px]">
                ● PANIER ACTIF
              </Badge>
            )}
            <div className="truncate text-[17px] font-semibold">
              {vendor?.name || 'Restaurant'}
            </div>
            <div className="mt-0.5 text-sm text-ink-muted">
              {itemCount} article{itemCount > 1 ? 's' : ''} • {formatPrice(subtotal)}
            </div>
            {vendor?.estimated_time && (
              <div className="mt-1 flex items-center gap-1 text-[13px] text-ink-muted">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {vendor.estimated_time}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onRequestDelete}
            aria-label="Options du panier"
            className="h-fit p-1 text-neutral-500"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <Button
          variant={isActive ? 'default' : 'secondary'}
          shape="pill"
          size="sm"
          disabled={!available}
          onClick={onView}
          className="mt-3.5 w-full py-3 text-[15px]"
        >
          Voir le panier
        </Button>
      </div>
    </div>
  );
}
