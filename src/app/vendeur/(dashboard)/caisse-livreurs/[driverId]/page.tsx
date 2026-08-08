import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getVendorSession } from '@/actions/vendor-auth';
import {
  fetchDriverCashBalances,
  fetchDriverCollections,
  fetchDriverDeposits,
} from '@/actions/vendor-cash';
import { CashDetailView } from '@/components/vendor/cash/cash-detail-view';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ driverId: string }>;
}): Promise<Metadata> {
  const { driverId } = await params;
  const { balances } = await fetchDriverCashBalances();
  const balance = balances.find((item) => item.driver_id === driverId);
  return { title: balance?.driver_name ?? 'Caisse livreur' };
}

export default async function VendeurCaisseDetailPage({
  params,
}: {
  params: Promise<{ driverId: string }>;
}) {
  const { driverId } = await params;

  const session = await getVendorSession();
  if (!session.ok) return null;

  const [{ balances }, { collections }, { deposits }] = await Promise.all([
    fetchDriverCashBalances(),
    fetchDriverCollections(driverId),
    fetchDriverDeposits(driverId),
  ]);

  const balance = balances.find((item) => item.driver_id === driverId) ?? null;

  // Un livreur sans solde ni mouvement n'appartient pas à ce vendeur.
  if (!balance && collections.length === 0 && deposits.length === 0) {
    notFound();
  }

  return (
    <CashDetailView
      driverName={balance?.driver_name ?? 'Livreur'}
      balance={balance}
      collections={collections}
      deposits={deposits}
      canReview={session.session.permissions.can_view_drivers}
    />
  );
}
