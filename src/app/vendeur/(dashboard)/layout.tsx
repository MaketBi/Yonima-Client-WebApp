import { redirect } from 'next/navigation';
import { getVendorSession } from '@/actions/vendor-auth';
import { countActiveOrders } from '@/actions/vendor-orders';
import { fetchVendorNotifications } from '@/actions/vendor-notifications';
import { VendorAccessDenied } from '@/components/vendor/vendor-access-denied';
import { VendorShell } from '@/components/vendor/vendor-shell';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';

/**
 * Contrôle d'accès de toutes les routes du back-office.
 *
 * Le middleware a déjà écarté les visiteurs non connectés ; ici on vérifie le
 * rôle réel en base. Un refus affiche un écran explicite plutôt qu'un
 * back-office vide — notamment pour `no_vendor_linked`, où la RLS renverrait
 * simplement des listes vides sans la moindre erreur.
 */
export default async function VendeurDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getVendorSession();

  if (!result.ok) {
    if (result.reason === 'not_authenticated') {
      redirect(VENDOR_ROUTES.connexion);
    }
    return <VendorAccessDenied reason={result.reason} />;
  }

  const [activeOrdersCount, { unreadCount }] = await Promise.all([
    result.session.permissions.can_view_orders ? countActiveOrders() : 0,
    fetchVendorNotifications(),
  ]);

  return (
    <VendorShell
      session={result.session}
      activeOrdersCount={activeOrdersCount}
      unreadNotificationsCount={unreadCount}
    >
      {children}
    </VendorShell>
  );
}
