import type { Metadata } from 'next';
import { fetchVendorPayouts } from '@/actions/vendor-finances';
import { PayoutsView } from '@/components/vendor/finances/payouts-view';

export const metadata: Metadata = { title: 'Paiements reçus' };
export const dynamic = 'force-dynamic';

export default async function VendeurPaiementsPage() {
  const { payouts } = await fetchVendorPayouts();

  return <PayoutsView payouts={payouts} />;
}
