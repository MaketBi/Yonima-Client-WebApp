import type { Metadata } from 'next';
import { getVendorSession } from '@/actions/vendor-auth';
import { fetchVendorOrders } from '@/actions/vendor-orders';
import { OrdersList } from '@/components/vendor/orders/orders-list';

export const metadata: Metadata = { title: 'Commandes' };

// Les commandes changent en permanence : jamais de cache.
export const dynamic = 'force-dynamic';

export default async function VendeurCommandesPage() {
  // Le layout a déjà validé la session ; ici on ne fait que la relire.
  const session = await getVendorSession();
  if (!session.ok) return null;

  const { orders, error } = await fetchVendorOrders();
  const { vendor, permissions } = session.session;

  return (
    <OrdersList
      orders={orders}
      vendorId={vendor.id}
      canManageOrders={permissions.can_manage_orders}
      canAssignDrivers={permissions.can_assign_drivers}
      canAssignFromThisVendor={vendor.delivery_mode !== 'pool_only'}
      loadError={error}
    />
  );
}
