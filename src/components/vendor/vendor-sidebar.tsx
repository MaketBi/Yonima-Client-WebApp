'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VendorNavIcon } from './vendor-nav-icon';
import { VendorStoreBadge } from './vendor-store-badge';
import {
  VENDOR_NAV_GROUPS,
  VENDOR_ROUTES,
  type VendorNavItem,
} from '@/lib/vendor/constants';
import type { VendorSession } from '@/types/vendor';

interface VendorSidebarProps {
  session: VendorSession;
  activeOrdersCount?: number;
  onSignOut: () => void;
}

/**
 * Décide du sort d'une entrée :
 * - `hidden`  : permission absente → l'entrée n'existe pas (comportement iOS)
 * - `muted`   : accessible mais pas encore livrée → grisée, non cliquable (design)
 * - `enabled` : cliquable
 */
function resolveState(
  item: VendorNavItem,
  session: VendorSession
): 'hidden' | 'muted' | 'enabled' {
  if (item.permission && !session.permissions[item.permission]) return 'hidden';
  if (item.ownerOnly && !session.isOwner) return 'hidden';
  if (item.internalDeliveryOnly && session.vendor.delivery_mode === 'pool_only') {
    return 'hidden';
  }
  return item.comingSoon ? 'muted' : 'enabled';
}

export function VendorSidebar({
  session,
  activeOrdersCount = 0,
  onSignOut,
}: VendorSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="hidden w-[248px] shrink-0 flex-col gap-1 border-r border-neutral-300 bg-white p-[14px] pt-5 lg:flex">
      <div className="px-2 pb-4 pt-1.5">
        <VendorStoreBadge vendor={session.vendor} />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {VENDOR_NAV_GROUPS.map((group) => {
          const items = group.items
            .map((item) => ({ item, state: resolveState(item, session) }))
            .filter(({ state }) => state !== 'hidden');

          if (items.length === 0) return null;

          return (
            <div key={group.title}>
              <p className="px-2.5 pb-1.5 pt-3.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-neutral-500">
                {group.title}
              </p>

              {items.map(({ item, state }) => {
                const active = isActive(item.href);
                const badge =
                  item.href === VENDOR_ROUTES.commandes && activeOrdersCount > 0
                    ? activeOrdersCount
                    : null;

                const content = (
                  <>
                    <VendorNavIcon name={item.icon} className="h-[19px] w-[19px] shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {badge !== null && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-destructive px-1.5 text-[11px] font-bold text-white">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </>
                );

                const baseClass =
                  'flex w-full items-center gap-3 rounded-xl px-[11px] py-2.5 text-sm transition-colors';

                if (state === 'muted') {
                  return (
                    <span
                      key={item.href}
                      aria-disabled="true"
                      title="Bientôt disponible"
                      className={cn(baseClass, 'cursor-default font-medium text-[#C4C9C6]')}
                    >
                      {content}
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      baseClass,
                      active
                        ? 'bg-green-100 font-bold text-green-forest'
                        : 'font-medium text-ink hover:bg-neutral-100'
                    )}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <Link
        href={VENDOR_ROUTES.profil}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-[11px] py-2.5 text-sm transition-colors',
          isActive(VENDOR_ROUTES.profil)
            ? 'bg-green-100 font-bold text-green-forest'
            : 'font-medium text-ink hover:bg-neutral-100'
        )}
      >
        <VendorNavIcon name="User" className="h-[19px] w-[19px] shrink-0" />
        Profil &amp; réglages
      </Link>

      <button
        type="button"
        onClick={onSignOut}
        className="flex w-full items-center gap-3 rounded-xl px-[11px] py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
      >
        <LogOut className="h-[19px] w-[19px] shrink-0" aria-hidden="true" />
        Se déconnecter
      </button>
    </aside>
  );
}
