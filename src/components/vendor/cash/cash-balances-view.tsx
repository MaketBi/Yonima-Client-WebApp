import Link from 'next/link';
import { Banknote, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatVendorAmount, initialsOf } from '@/lib/vendor/format';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import type { DriverCashBalance } from '@/types/vendor';

interface CashBalancesViewProps {
  balances: DriverCashBalance[];
  loadError?: string;
}

/** Réconciliation du cash encaissé par les livreurs vs. ce qu'ils ont reversé. */
export function CashBalancesView({ balances, loadError }: CashBalancesViewProps) {
  const totalCash = balances.reduce((sum, b) => sum + (b.cash_on_hand ?? 0), 0);
  const totalPending = balances.reduce(
    (sum, b) => sum + (b.total_pending_deposits ?? 0),
    0
  );

  return (
    <div className="space-y-5">
      {loadError && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {balances.length === 0 ? (
        <div className="flex flex-col items-center rounded-[18px] bg-white px-6 py-16 text-center shadow-card">
          <Banknote className="h-10 w-10 text-neutral-500" aria-hidden="true" />
          <h2 className="mt-4 text-[17px] font-bold">Aucun encaissement</h2>
          <p className="mt-1 text-[14px] text-ink-muted">
            Les encaissements cash de vos livreurs apparaîtront ici.
          </p>
        </div>
      ) : (
        <>
          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
              Total cash en main
            </h2>
            <p
              className={cn(
                'mt-2 text-[28px] font-bold',
                totalCash > 0 ? 'text-warning-ink' : 'text-green-forest'
              )}
            >
              {formatVendorAmount(totalCash)}
            </p>
            {totalPending > 0 && (
              <p className="mt-1 text-[13.5px] text-ink-muted">
                {formatVendorAmount(totalPending)} en attente de validation
              </p>
            )}
          </section>

          <ul className="space-y-3">
            {balances.map((balance) => (
              <li key={`${balance.driver_id}-${balance.vendor_id}`}>
                <Link
                  href={`${VENDOR_ROUTES.caisse}/${balance.driver_id}`}
                  className="flex items-center gap-4 rounded-2xl border border-neutral-300 bg-white p-4 transition-colors hover:bg-neutral-100/50"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[14px] font-bold">
                    {initialsOf(balance.driver_name)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-bold">
                      {balance.driver_name || 'Livreur'}
                    </h3>
                    <p className="text-[12.5px] text-ink-muted">
                      {balance.collection_count ?? 0} encaissement
                      {(balance.collection_count ?? 0) > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        'text-[15px] font-bold',
                        (balance.cash_on_hand ?? 0) > 0
                          ? 'text-warning-ink'
                          : 'text-green-forest'
                      )}
                    >
                      {formatVendorAmount(balance.cash_on_hand ?? 0)}
                    </p>
                    {(balance.total_pending_deposits ?? 0) > 0 && (
                      <p className="text-[11.5px] font-semibold text-warning-ink">
                        {formatVendorAmount(balance.total_pending_deposits)} à valider
                      </p>
                    )}
                  </div>

                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-neutral-500"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
