'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { VendorNavIcon } from './vendor-nav-icon';
import { VENDOR_MOBILE_TABS } from '@/lib/vendor/constants';
import type { VendorSession } from '@/types/vendor';

/**
 * Barre d'onglets mobile — 4 entrées, comme le TabView iOS.
 * Un onglet dont la permission manque n'est pas affiché du tout.
 */
export function VendorBottomNav({ session }: { session: VendorSession }) {
  const pathname = usePathname();

  const tabs = VENDOR_MOBILE_TABS.filter(
    (tab) => !tab.permission || session.permissions[tab.permission]
  );

  if (tabs.length === 0) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-neutral-300 bg-white lg:hidden">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        const content = (
          <>
            <VendorNavIcon name={tab.icon} className="h-[22px] w-[22px]" />
            <span className="text-[11px]">{tab.label}</span>
          </>
        );

        const baseClass =
          'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]';

        if (tab.comingSoon) {
          return (
            <span
              key={tab.href}
              aria-disabled="true"
              className={cn(baseClass, 'font-medium text-[#C4C9C6]')}
            >
              {content}
            </span>
          );
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              baseClass,
              active ? 'font-bold text-green-forest' : 'font-medium text-neutral-500'
            )}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
