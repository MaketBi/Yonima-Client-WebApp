import type { Metadata } from 'next';
import { Suspense } from 'react';
import { fetchVendorStats } from '@/actions/vendor-stats';
import { StatsView } from '@/components/vendor/stats/stats-view';
import { STATS_PERIODS, type StatsPeriod } from '@/types/vendor';

export const metadata: Metadata = { title: 'Statistiques' };
export const dynamic = 'force-dynamic';

export default async function VendeurStatistiquesPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const { periode } = await searchParams;

  const isKnown = STATS_PERIODS.some((item) => item.value === periode);
  const period = (isKnown ? periode : 'today') as StatsPeriod;

  const { stats, error } = await fetchVendorStats(period);

  return (
    // `StatsView` lit les search params : Suspense requis pour le rendu serveur.
    <Suspense fallback={null}>
      <StatsView stats={stats} period={period} loadError={error} />
    </Suspense>
  );
}
