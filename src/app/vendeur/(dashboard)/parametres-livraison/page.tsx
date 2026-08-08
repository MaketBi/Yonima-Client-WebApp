import type { Metadata } from 'next';
import { getVendorSession } from '@/actions/vendor-auth';
import { countActiveDrivers } from '@/actions/vendor-settings';
import { DeliverySettingsView } from '@/components/vendor/settings/delivery-settings-view';

export const metadata: Metadata = { title: 'Paramètres de livraison' };
export const dynamic = 'force-dynamic';

export default async function VendeurLivraisonPage() {
  const session = await getVendorSession();
  if (!session.ok) return null;

  const { vendor, isOwner } = session.session;
  const activeDriversCount = await countActiveDrivers();

  return (
    <DeliverySettingsView
      prepTimeMinutes={vendor.prep_time_minutes ?? 0}
      minOrder={vendor.min_order ?? 0}
      deliveryMode={vendor.delivery_mode ?? 'internal_only'}
      activeDriversCount={activeDriversCount}
      isOwner={isOwner}
    />
  );
}
