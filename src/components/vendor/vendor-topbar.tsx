'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LogOut, Store } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { storeInitials } from './vendor-store-badge';
import { VendorWordmark } from './vendor-wordmark';
import { ROUTES } from '@/lib/constants';
import { VENDOR_PAGE_TITLES, VENDOR_ROUTES } from '@/lib/vendor/constants';
import type { VendorSession } from '@/types/vendor';

interface VendorTopbarProps {
  session: VendorSession;
  unreadCount?: number;
  onSignOut: () => void;
}

/** Titre de page : on prend la route connue la plus spécifique. */
function resolveTitle(pathname: string): string {
  const match = Object.keys(VENDOR_PAGE_TITLES)
    .filter((route) => pathname === route || pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0];

  return match ? VENDOR_PAGE_TITLES[match] : 'Yonima Business';
}

export function VendorTopbar({
  session,
  unreadCount = 0,
  onSignOut,
}: VendorTopbarProps) {
  const pathname = usePathname();
  const isOpen = session.vendor.is_open !== false;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-300 bg-white px-4 md:px-[26px]">
      {/* Le wordmark remplace le titre sur mobile, où la sidebar est masquée. */}
      <VendorWordmark className="text-[19px] lg:hidden" />
      <h1 className="hidden text-[19px] font-bold tracking-[-0.03em] lg:block">
        {resolveTitle(pathname)}
      </h1>

      <div className="flex items-center gap-3 md:gap-4">
        <span
          className={cn(
            'hidden items-center gap-2 rounded-pill px-3.5 py-1.5 text-[12.5px] font-semibold sm:inline-flex',
            isOpen
              ? 'bg-green-100 text-green-deep'
              : 'bg-neutral-100 text-ink-muted'
          )}
        >
          <span
            className={cn(
              'h-[7px] w-[7px] rounded-full',
              isOpen ? 'bg-green-electric' : 'bg-neutral-500'
            )}
          />
          {isOpen ? 'Boutique ouverte' : 'Boutique fermée'}
        </span>

        <Link
          href={VENDOR_ROUTES.notifications}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 transition-colors hover:bg-neutral-200"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} non lues`
              : 'Notifications'
          }
        >
          <Bell className="h-[19px] w-[19px]" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 h-[9px] w-[9px] rounded-full border-2 border-white bg-destructive" />
          )}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-green-forest text-[13px] font-bold text-white"
              aria-label="Menu du compte"
            >
              {storeInitials(session.vendor.name)}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-semibold">{session.vendor.name}</p>
              <p className="truncate text-xs text-ink-muted">
                {session.fullName || session.phone}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={ROUTES.home}>
                <Store className="mr-2 h-4 w-4" />
                Aller sur la boutique
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onSignOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
