import type { Metadata } from 'next';
import { getVendorSession } from '@/actions/vendor-auth';
import { OpeningHoursView } from '@/components/vendor/settings/opening-hours-view';
import type { OpeningHours } from '@/types/vendor';

export const metadata: Metadata = { title: "Horaires d'ouverture" };
export const dynamic = 'force-dynamic';

export default async function VendeurHorairesPage() {
  const session = await getVendorSession();
  if (!session.ok) return null;

  const { vendor, isOwner } = session.session;

  return (
    <OpeningHoursView
      initialHours={(vendor.opening_hours as OpeningHours) ?? {}}
      initialIsOpen={vendor.is_open !== false}
      canManage={isOwner}
    />
  );
}
