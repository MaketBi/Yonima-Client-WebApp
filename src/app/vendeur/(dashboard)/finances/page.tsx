import type { Metadata } from 'next';
import {
  fetchVendorPaymentInfo,
  fetchVendorPayouts,
  fetchVendorWallet,
} from '@/actions/vendor-finances';
import { FinancesView } from '@/components/vendor/finances/finances-view';

export const metadata: Metadata = { title: 'Mes finances' };
export const dynamic = 'force-dynamic';

export default async function VendeurFinancesPage() {
  const [{ wallet, error }, paymentInfo, { payouts }] = await Promise.all([
    fetchVendorWallet(),
    fetchVendorPaymentInfo(),
    fetchVendorPayouts(),
  ]);

  return (
    <FinancesView
      wallet={wallet}
      paymentInfo={paymentInfo}
      recentPayouts={payouts.slice(0, 3)}
      loadError={error}
    />
  );
}
