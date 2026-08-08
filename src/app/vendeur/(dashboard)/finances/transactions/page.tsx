import type { Metadata } from 'next';
import { fetchWalletTransactions } from '@/actions/vendor-finances';
import { TransactionsView } from '@/components/vendor/finances/transactions-view';

export const metadata: Metadata = { title: 'Transactions' };
export const dynamic = 'force-dynamic';

export default async function VendeurTransactionsPage() {
  const { transactions } = await fetchWalletTransactions();

  return <TransactionsView transactions={transactions} />;
}
