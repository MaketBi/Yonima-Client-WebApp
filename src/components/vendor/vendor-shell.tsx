'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/stores/user-store';
import { VendorSidebar } from './vendor-sidebar';
import { VendorTopbar } from './vendor-topbar';
import { VendorBottomNav } from './vendor-bottom-nav';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import type { VendorSession } from '@/types/vendor';

interface VendorShellProps {
  session: VendorSession;
  /** Badge « À traiter » sur l'entrée Commandes de la sidebar. */
  activeOrdersCount?: number;
  /** Pastille rouge de la cloche. */
  unreadNotificationsCount?: number;
  children: React.ReactNode;
}

/** Sidebar + topbar sur desktop, topbar + barre d'onglets sur mobile. */
export function VendorShell({
  session,
  activeOrdersCount = 0,
  unreadNotificationsCount = 0,
  children,
}: VendorShellProps) {
  const router = useRouter();
  const clearUser = useUserStore((state) => state.clear);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Le store client est persisté : sans ce clear, l'ancien profil réapparaît.
    clearUser();
    router.push(VENDOR_ROUTES.connexion);
    router.refresh();
  }, [clearUser, router]);

  return (
    <div className="flex min-h-screen bg-white">
      <VendorSidebar
        session={session}
        activeOrdersCount={activeOrdersCount}
        onSignOut={handleSignOut}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <VendorTopbar
          session={session}
          unreadCount={unreadNotificationsCount}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 overflow-x-hidden bg-[#F5F5F5] px-4 pb-24 pt-5 md:px-[30px] md:pb-10 md:pt-[26px]">
          {children}
        </main>
      </div>

      <VendorBottomNav session={session} />
    </div>
  );
}
