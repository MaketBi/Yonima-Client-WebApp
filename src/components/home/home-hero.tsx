'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ChevronDown, Bell, Search } from 'lucide-react';
import { useDeliveryAddressStore } from '@/stores/delivery-address-store';
import { AddressPickerScreen } from '@/components/checkout/address-picker-screen';
import { IconButton } from '@/components/yonima/icon-button';
import { useAuth } from '@/hooks/use-auth';
import { useUnreadNotificationsCount } from '@/hooks/use-realtime';
import { ROUTES } from '@/lib/constants';

/**
 * Home hero (mobile-first): background food photo + dark gradient, a "LIVRER À"
 * location selector, notifications bell, and a search pill that routes to the
 * search screen. Out-of-zone warning shows when the chosen address isn't covered.
 */
export function HomeHero() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { user } = useAuth();
  const unread = useUnreadNotificationsCount(user?.id || null);

  const neighborhood = useDeliveryAddressStore((s) => s.neighborhood);
  const city = useDeliveryAddressStore((s) => s.city);
  const formattedAddress = useDeliveryAddressStore((s) => s.formattedAddress);
  const isZoneCovered = useDeliveryAddressStore((s) => s.isZoneCovered);
  const hasAddress = useDeliveryAddressStore((s) => s.hasAddress());

  const location =
    neighborhood || city || formattedAddress || 'Choisir une adresse';

  return (
    <>
      {/* H1 unique de la page d'accueil, masqué visuellement (le hero est purement visuel). */}
      <h1 className="sr-only">
        Yonima — Livraison rapide à Dakar : restaurants, commerces et épicerie
      </h1>
      <div className="relative h-[196px] w-full overflow-hidden bg-neutral-200 md:h-[300px]">
        <Image
          src="/hero-food.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,.42) 0%, rgba(0,0,0,.14) 45%, rgba(0,0,0,.55) 100%)',
          }}
        />

        <div className="absolute inset-0 flex flex-col justify-between px-5 py-4">
          {/* Top row: location + notifications */}
          <div className="flex items-start justify-between">
            <button
              onClick={() => setPickerOpen(true)}
              className="text-left"
              aria-label={`Adresse de livraison: ${location}. Modifier.`}
            >
              <div className="text-[11px] font-bold tracking-[0.14em] text-white/80">
                LIVRER À
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-white">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span className="text-[19px] font-bold tracking-tight max-w-[220px] truncate">
                  {location}
                </span>
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </div>
            </button>

            <Link href={ROUTES.notifications} className="relative">
              <IconButton variant="glass" size={38} aria-label="Notifications">
                <Bell className="h-[18px] w-[18px]" />
              </IconButton>
              {unread > 0 && (
                <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-[1.5px] border-white bg-green-electric" />
              )}
            </Link>
          </div>

          {/* Search pill + launcher */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="flex flex-1 items-center gap-2.5 rounded-pill bg-white px-4 py-3 text-sm text-ink-muted shadow-card"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Plat, resto, cuisine…</span>
            </Link>
            <IconButton variant="accent" size={46} aria-label="Chercher" asChild>
              <Link href="/search">
                <Search className="h-5 w-5" />
              </Link>
            </IconButton>
          </div>
        </div>
      </div>

      {/* Out-of-zone warning (non-blocking) */}
      {hasAddress && !isZoneCovered && (
        <div className="container mt-3.5">
          <div className="rounded-md bg-warning-bg px-3.5 py-3">
            <div className="text-sm font-semibold text-warning-ink">
              Zone non couverte
            </div>
            <div className="mt-0.5 text-[13px] leading-snug text-ink-muted">
              On ne livre pas encore à cette adresse. Choisis un autre quartier.
            </div>
          </div>
        </div>
      )}

      <AddressPickerScreen open={pickerOpen} onOpenChange={setPickerOpen} />
    </>
  );
}
