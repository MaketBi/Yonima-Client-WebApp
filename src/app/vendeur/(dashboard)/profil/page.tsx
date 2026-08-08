import type { Metadata } from 'next';
import { getVendorSession } from '@/actions/vendor-auth';
import { VendorProfileView } from '@/components/vendor/settings/vendor-profile-view';

export const metadata: Metadata = { title: 'Profil & réglages' };
export const dynamic = 'force-dynamic';

export default async function VendeurProfilPage() {
  const session = await getVendorSession();
  if (!session.ok) return null;

  const { vendor, isOwner } = session.session;

  return (
    <VendorProfileView
      vendor={vendor}
      isOwner={isOwner}
      usesOwnDrivers={vendor.delivery_mode !== 'pool_only'}
    />
  );
}
