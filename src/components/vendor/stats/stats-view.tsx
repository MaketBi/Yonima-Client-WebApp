'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  Banknote,
  Loader2,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatStatsAmount } from '@/lib/vendor/format';
import type { VendorStats } from '@/actions/vendor-stats';
import { STATS_PERIODS, type StatsPeriod } from '@/types/vendor';

/** Palette cyclique des barres de catégorie (identique à l'app iOS). */
const CATEGORY_COLORS = [
  '#2E6A3B',
  '#10B981',
  '#F59E0B',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F97316',
  '#14B8A6',
];

interface StatsViewProps {
  stats: VendorStats;
  period: StatsPeriod;
  loadError?: string;
}

export function StatsView({ stats, period, loadError }: StatsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<StatsPeriod>(period);

  const changePeriod = useCallback(
    (next: StatsPeriod) => {
      setSelected(next);
      const params = new URLSearchParams(searchParams.toString());
      params.set('periode', next);
      startTransition(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  const kpis = [
    {
      label: "Chiffre d'affaires",
      value: formatStatsAmount(stats.totalRevenue),
      change: stats.revenueChange,
      icon: Banknote,
      color: '#2E6A3B',
    },
    {
      label: 'Commandes',
      value: String(stats.orderCount),
      change: stats.orderCountChange,
      icon: ShoppingBag,
      color: '#3B82F6',
    },
    {
      label: 'Panier moyen',
      value: formatStatsAmount(stats.averageOrderValue),
      change: null,
      icon: ShoppingCart,
      color: '#F59E0B',
    },
  ];

  const categoryTotal = stats.salesByCategory.reduce(
    (sum, row) => sum + row.revenue,
    0
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {STATS_PERIODS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => changePeriod(item.value)}
            aria-pressed={selected === item.value}
            className={cn(
              'rounded-pill px-4 py-2 text-[13px] font-semibold transition-colors',
              selected === item.value
                ? 'bg-green-forest text-white'
                : 'bg-white text-ink-muted hover:text-ink'
            )}
          >
            {item.label}
          </button>
        ))}
        {isPending && (
          <Loader2
            className="h-4 w-4 animate-spin text-ink-muted"
            aria-label="Chargement"
          />
        )}
      </div>

      {loadError && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isUp = (kpi.change ?? 0) >= 0;

          return (
            <section key={kpi.label} className="rounded-2xl bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${kpi.color}1A` }}
                >
                  <Icon
                    className="h-[18px] w-[18px]"
                    style={{ color: kpi.color }}
                    aria-hidden="true"
                  />
                </span>

                {kpi.change !== null && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-pill px-2 py-1 text-[11.5px] font-bold',
                      isUp
                        ? 'bg-green-100 text-green-deep'
                        : 'bg-destructive/10 text-destructive'
                    )}
                  >
                    {isUp ? (
                      <ArrowUp className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <ArrowDown className="h-3 w-3" aria-hidden="true" />
                    )}
                    {Math.abs(Math.round(kpi.change))}%
                  </span>
                )}
              </div>

              <p className="mt-3 text-[13px] text-ink-muted">{kpi.label}</p>
              <p
                className="mt-0.5 text-[24px] font-bold tracking-[-0.03em]"
                style={{ color: kpi.color }}
              >
                {kpi.value}
              </p>
            </section>
          );
        })}
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <h2 className="text-[16px] font-bold">Produits populaires</h2>

        {stats.topProducts.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Star className="h-8 w-8 text-neutral-500" aria-hidden="true" />
            <p className="mt-2 text-[14px] text-ink-muted">Aucun produit vendu</p>
          </div>
        ) : (
          <ul className="mt-3">
            {stats.topProducts.map((product) => (
              <li
                key={product.productId ?? product.name}
                className="flex items-center gap-3 border-b border-neutral-300 py-3 last:border-0 last:pb-0"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                  {product.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold">{product.name}</p>
                  <p className="text-[12px] text-ink-muted">
                    {product.quantity} vendu{product.quantity > 1 ? 's' : ''}
                  </p>
                </div>
                <p className="shrink-0 text-[14px] font-bold text-green-forest">
                  {formatStatsAmount(product.revenue)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <h2 className="text-[16px] font-bold">Ventes par catégorie</h2>

        {stats.salesByCategory.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Tag className="h-8 w-8 text-neutral-500" aria-hidden="true" />
            <p className="mt-2 text-[14px] text-ink-muted">
              Aucune vente par catégorie
            </p>
          </div>
        ) : (
          <>
            <ul className="mt-3 space-y-3.5">
              {stats.salesByCategory.map((row, index) => {
                const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

                return (
                  <li key={row.categoryId ?? row.name}>
                    <div className="flex items-center gap-2 text-[13.5px]">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {row.name}
                      </span>
                      <span className="shrink-0 font-semibold">
                        {formatStatsAmount(row.revenue)}
                      </span>
                      <span className="w-10 shrink-0 text-right text-ink-muted">
                        {Math.round(row.percentage)}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-pill bg-neutral-100">
                      <div
                        className="h-full rounded-pill"
                        style={{
                          width: `${Math.max(row.percentage, 2)}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex justify-between border-t border-neutral-300 pt-3 text-[14px] font-bold">
              <span>Total</span>
              <span className="text-green-forest">
                {formatStatsAmount(categoryTotal)}
              </span>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
