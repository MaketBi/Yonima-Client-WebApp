import type { Metadata } from 'next';
import { getVendorSession } from '@/actions/vendor-auth';
import { fetchVendorDrivers } from '@/actions/vendor-drivers';
import { DriversView } from '@/components/vendor/drivers/drivers-view';

export const metadata: Metadata = { title: 'Mes livreurs' };
export const dynamic = 'force-dynamic';

export default async function VendeurLivreursPage() {
  const session = await getVendorSession();
  if (!session.ok) return null;

  const { drivers, error } = await fetchVendorDrivers();

  return (
    <DriversView
      drivers={drivers}
      canManage={session.session.permissions.can_view_drivers}
      isOwner={session.session.isOwner}
      loadError={error}
    />
  );
}
