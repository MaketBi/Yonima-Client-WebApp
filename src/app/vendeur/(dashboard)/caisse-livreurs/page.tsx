import type { Metadata } from 'next';
import { fetchDriverCashBalances } from '@/actions/vendor-cash';
import { CashBalancesView } from '@/components/vendor/cash/cash-balances-view';

export const metadata: Metadata = { title: 'Caisse livreurs' };
export const dynamic = 'force-dynamic';

export default async function VendeurCaissePage() {
  const { balances, error } = await fetchDriverCashBalances();

  return <CashBalancesView balances={balances} loadError={error} />;
}
