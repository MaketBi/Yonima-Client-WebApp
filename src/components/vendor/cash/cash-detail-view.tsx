'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpCircle, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DepositReviewDialog } from './deposit-review-dialog';
import {
  formatOrderListDate,
  formatVendorAmount,
} from '@/lib/vendor/format';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import {
  DEPOSIT_METHOD_LABELS,
  DEPOSIT_STATUS_COLORS,
  DEPOSIT_STATUS_LABELS,
  type DriverCashBalance,
  type DriverCashCollection,
  type DriverCashDeposit,
} from '@/types/vendor';

type Tab = 'collections' | 'deposits';

interface CashDetailViewProps {
  driverName: string;
  balance: DriverCashBalance | null;
  collections: (DriverCashCollection & { order_number?: string })[];
  deposits: DriverCashDeposit[];
  canReview: boolean;
}

export function CashDetailView({
  driverName,
  balance,
  collections,
  deposits,
  canReview,
}: CashDetailViewProps) {
  const [tab, setTab] = useState<Tab>('collections');
  const [reviewing, setReviewing] = useState<DriverCashDeposit | null>(null);

  const stats = [
    { label: 'Encaissé', value: balance?.total_collected ?? 0 },
    { label: 'Reversé', value: balance?.total_deposited ?? 0 },
    { label: 'En attente', value: balance?.total_pending_deposits ?? 0 },
  ];

  return (
    <div className="space-y-5">
      <Link
        href={VENDOR_ROUTES.caisse}
        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Caisse livreurs
      </Link>

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <h1 className="text-[17px] font-bold">{driverName}</h1>
        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
          Cash en main
        </p>
        <p
          className={cn(
            'mt-1 text-[28px] font-bold',
            (balance?.cash_on_hand ?? 0) > 0
              ? 'text-warning-ink'
              : 'text-green-forest'
          )}
        >
          {formatVendorAmount(balance?.cash_on_hand ?? 0)}
        </p>

        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-neutral-300 pt-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-[12px] text-ink-muted">{stat.label}</dt>
              <dd className="mt-0.5 text-[15px] font-bold">
                {formatVendorAmount(stat.value)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="flex gap-2 rounded-pill bg-white p-1 shadow-card">
        {(
          [
            { key: 'collections', label: 'Encaissements' },
            { key: 'deposits', label: 'Versements' },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            aria-current={tab === item.key ? 'true' : undefined}
            className={cn(
              'flex-1 rounded-pill px-4 py-2 text-[13.5px] font-semibold transition-colors',
              tab === item.key
                ? 'bg-green-forest text-white'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'collections' ? (
        collections.length === 0 ? (
          <EmptyState
            icon={<Banknote className="h-10 w-10 text-neutral-500" />}
            title="Aucun encaissement"
          />
        ) : (
          <ul className="space-y-2.5">
            {collections.map((collection) => (
              <li
                key={collection.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-300 bg-white p-4"
              >
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">
                    {collection.order_number
                      ? `N° ${collection.order_number}`
                      : 'Commande'}
                  </p>
                  <p className="text-[12.5px] text-ink-muted">
                    {formatOrderListDate(collection.collected_at)}
                  </p>
                </div>
                <p className="shrink-0 text-[15px] font-bold text-green-forest">
                  {formatVendorAmount(collection.amount)}
                </p>
              </li>
            ))}
          </ul>
        )
      ) : deposits.length === 0 ? (
        <EmptyState
          icon={<ArrowUpCircle className="h-10 w-10 text-neutral-500" />}
          title="Aucun versement"
        />
      ) : (
        <ul className="space-y-2.5">
          {deposits.map((deposit) => {
            const color = DEPOSIT_STATUS_COLORS[deposit.status];

            return (
              <li
                key={deposit.id}
                className="rounded-2xl border border-neutral-300 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold">
                      {formatVendorAmount(deposit.amount)}
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-ink-muted">
                      {deposit.deposit_method
                        ? DEPOSIT_METHOD_LABELS[deposit.deposit_method]
                        : '—'}
                      {' · '}
                      {formatOrderListDate(deposit.declared_at)}
                    </p>
                    {deposit.transaction_reference && (
                      <p className="text-[12.5px] text-ink-muted">
                        Réf. {deposit.transaction_reference}
                      </p>
                    )}
                    {deposit.driver_note && (
                      <p className="mt-1 text-[12.5px] italic text-ink-muted">
                        {deposit.driver_note}
                      </p>
                    )}
                    {deposit.rejection_reason && (
                      <p className="mt-1 text-[12.5px] text-destructive">
                        {deposit.rejection_reason}
                      </p>
                    )}
                  </div>

                  <span
                    className="shrink-0 rounded-pill px-2.5 py-1 text-[12px] font-semibold"
                    style={{ color, backgroundColor: `${color}1F` }}
                  >
                    {DEPOSIT_STATUS_LABELS[deposit.status]}
                  </span>
                </div>

                {deposit.status === 'pending' && canReview && (
                  <Button
                    onClick={() => setReviewing(deposit)}
                    className="mt-3 h-10 w-full rounded-xl"
                  >
                    Valider
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <DepositReviewDialog
        deposit={reviewing}
        onOpenChange={(open) => !open && setReviewing(null)}
      />
    </div>
  );
}

function EmptyState({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col items-center rounded-[18px] bg-white px-6 py-14 text-center shadow-card">
      {icon}
      <h2 className="mt-3 text-[16px] font-bold">{title}</h2>
    </div>
  );
}
