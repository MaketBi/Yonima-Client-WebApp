import Link from 'next/link';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatOrderDetailDate, formatVendorAmount } from '@/lib/vendor/format';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import {
  TRANSACTION_TYPE_LABELS,
  type WalletTransaction,
} from '@/types/vendor';

/** Regroupe par mois (« février 2026 »), l'ordre de la requête est conservé. */
function groupByMonth(transactions: WalletTransaction[]) {
  const groups = new Map<string, WalletTransaction[]>();

  for (const transaction of transactions) {
    const label = new Date(transaction.created_at).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
    const bucket = groups.get(label);
    if (bucket) bucket.push(transaction);
    else groups.set(label, [transaction]);
  }

  return [...groups.entries()];
}

export function TransactionsView({
  transactions,
}: {
  transactions: WalletTransaction[];
}) {
  const groups = groupByMonth(transactions);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href={VENDOR_ROUTES.finances}
        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Mes finances
      </Link>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center rounded-[18px] bg-white px-6 py-16 text-center shadow-card">
          <Receipt className="h-10 w-10 text-neutral-500" aria-hidden="true" />
          <h2 className="mt-4 text-[17px] font-bold">Aucune transaction</h2>
          <p className="mt-1 text-[14px] text-ink-muted">
            Vos mouvements apparaîtront ici dès votre première commande livrée.
          </p>
        </div>
      ) : (
        groups.map(([month, rows]) => (
          <section key={month} className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
              {month}
            </h2>

            <ul className="mt-3 divide-y divide-neutral-300">
              {rows.map((transaction) => {
                const isCredit = transaction.direction === 'credit';
                const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;

                return (
                  <li
                    key={transaction.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                        isCredit ? 'bg-green-100' : 'bg-destructive/10'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-[18px] w-[18px]',
                          isCredit ? 'text-green-forest' : 'text-destructive'
                        )}
                        aria-hidden="true"
                      />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-semibold">
                        {TRANSACTION_TYPE_LABELS[transaction.type] ?? transaction.type}
                      </p>
                      <p className="truncate text-[12.5px] text-ink-muted">
                        {transaction.description ||
                          formatOrderDetailDate(transaction.created_at)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={cn(
                          'text-[14.5px] font-bold',
                          isCredit ? 'text-green-forest' : 'text-destructive'
                        )}
                      >
                        {isCredit ? '+' : '−'}
                        {formatVendorAmount(transaction.amount)}
                      </p>
                      {transaction.balance_after != null && (
                        <p className="text-[11.5px] text-ink-muted">
                          Solde : {formatVendorAmount(transaction.balance_after)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
