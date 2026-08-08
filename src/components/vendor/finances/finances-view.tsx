import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatOrderListDate, formatVendorAmount } from '@/lib/vendor/format';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import {
  maskPayoutPhone,
  PAYOUT_FREQUENCY_HINTS,
  PAYOUT_FREQUENCY_LABELS,
  PAYOUT_METHOD_LABELS,
  PAYOUT_STATUS_COLORS,
  PAYOUT_STATUS_LABELS,
  type VendorPaymentInfo,
  type VendorPayout,
  type VendorWallet,
} from '@/types/vendor';

interface FinancesViewProps {
  wallet: VendorWallet | null;
  paymentInfo: VendorPaymentInfo | null;
  recentPayouts: VendorPayout[];
  loadError?: string;
}

/**
 * Écran Finances.
 *
 * ⚠️ Deux absences volontaires, conformes à la décision produit :
 * - **aucun bouton « retirer »** — les virements sont automatiques ;
 * - **aucune carte « Commissions »** — retirée de cet écran (la ligne existe
 *   uniquement dans le détail d'un paiement).
 */
export function FinancesView({
  wallet,
  paymentInfo,
  recentPayouts,
  loadError,
}: FinancesViewProps) {
  if (loadError || !wallet) {
    return (
      <div className="flex flex-col items-center rounded-[18px] bg-white px-6 py-16 text-center shadow-card">
        <Wallet className="h-10 w-10 text-neutral-500" aria-hidden="true" />
        <h2 className="mt-4 text-[17px] font-bold">Portefeuille non disponible</h2>
        <p className="mt-1 text-[14px] text-ink-muted">
          {loadError ?? "Votre portefeuille n'est pas encore activé."}
        </p>
      </div>
    );
  }

  const frequency = wallet.payout_frequency ?? 'weekly';
  const belowMinimum =
    (wallet.min_payout_amount ?? 0) > 0 &&
    wallet.balance < (wallet.min_payout_amount ?? 0);

  const preferred = paymentInfo?.preferred_method;
  const preferredPhone =
    preferred === 'orange_money'
      ? paymentInfo?.orange_money_phone
      : paymentInfo?.wave_phone;
  const preferredVerified =
    preferred === 'orange_money'
      ? paymentInfo?.orange_money_verified
      : paymentInfo?.wave_verified;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {wallet.is_blocked && (
        <p className="flex gap-3 rounded-xl bg-destructive/10 px-4 py-3 text-[13.5px] text-destructive">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>
            Vos paiements sont suspendus.
            {wallet.blocked_reason ? ` ${wallet.blocked_reason}` : ''}
          </span>
        </p>
      )}

      <section className="rounded-[20px] bg-gradient-to-br from-green-forest to-green-deep p-6 text-white">
        <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/75">
          Solde disponible
        </p>
        <p className="mt-1.5 text-[32px] font-bold tracking-[-0.03em]">
          {formatVendorAmount(wallet.balance)}
        </p>

        {wallet.pending_balance > 0 && (
          <p className="mt-1 text-[13.5px] text-white/80">
            En attente : {formatVendorAmount(wallet.pending_balance)}
          </p>
        )}

        {preferred && (
          <p className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/20 pt-4 text-[13px] text-white/90">
            <span className="font-semibold">
              {PAYOUT_METHOD_LABELS[preferred]}
            </span>
            <span className="text-white/70">{maskPayoutPhone(preferredPhone ?? null)}</span>
            {preferredVerified && (
              <span className="inline-flex items-center gap-1 rounded-pill bg-white/20 px-2 py-0.5 text-[11.5px] font-semibold">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Vérifié
              </span>
            )}
          </p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total gagné"
          value={wallet.total_earned}
          icon={ArrowDownLeft}
          color="#2E6A3B"
        />
        <StatCard
          label="Total retiré"
          value={wallet.total_withdrawn}
          icon={ArrowUpRight}
          color="#3B82F6"
        />
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
          Prochain paiement
        </h2>
        <p className="mt-2 text-[15px] font-semibold">
          Fréquence : {PAYOUT_FREQUENCY_LABELS[frequency]}
        </p>
        <p className="text-[13px] text-ink-muted">
          {PAYOUT_FREQUENCY_HINTS[frequency]}
        </p>

        {belowMinimum && (
          <p className="mt-3 rounded-xl bg-warning-bg px-3.5 py-2.5 text-[13px] text-warning-ink">
            Minimum requis : {formatVendorAmount(wallet.min_payout_amount ?? 0)}
          </p>
        )}

        <p className="mt-3 text-[12.5px] leading-relaxed text-ink-muted">
          Les virements sont automatiques : vous n&apos;avez aucune demande à faire.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold">Derniers paiements</h2>
          {recentPayouts.length > 0 && (
            <Link
              href={VENDOR_ROUTES.paiements}
              className="text-[13px] font-semibold text-green-forest hover:text-green-deep"
            >
              Voir tout
            </Link>
          )}
        </div>

        {recentPayouts.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-ink-muted">
            Aucun paiement pour le moment.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-300">
            {recentPayouts.map((payout) => {
              const color = PAYOUT_STATUS_COLORS[payout.status];

              return (
                <li
                  key={payout.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold">
                      {formatVendorAmount(payout.net_amount)}
                    </p>
                    <p className="text-[12.5px] text-ink-muted">
                      {payout.order_count ?? 0} commande
                      {(payout.order_count ?? 0) > 1 ? 's' : ''}
                      {payout.processed_at
                        ? ` · ${formatOrderListDate(payout.processed_at)}`
                        : ''}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-pill px-2.5 py-1 text-[12px] font-semibold"
                    style={{ color, backgroundColor: `${color}1F` }}
                  >
                    {PAYOUT_STATUS_LABELS[payout.status]}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <nav className="rounded-2xl bg-white p-2 shadow-card">
        {[
          { href: VENDOR_ROUTES.transactions, label: 'Historique des transactions' },
          { href: VENDOR_ROUTES.paiements, label: 'Paiements reçus' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-xl px-3 py-3.5 transition-colors hover:bg-neutral-100"
          >
            <span className="flex-1 text-[14.5px] font-medium">{link.label}</span>
            <ChevronRight className="h-4 w-4 text-neutral-500" aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof Wallet;
  color: string;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-card">
      <span
        className={cn('flex h-9 w-9 items-center justify-center rounded-xl')}
        style={{ backgroundColor: `${color}1A` }}
      >
        <Icon className="h-[18px] w-[18px]" style={{ color }} aria-hidden="true" />
      </span>
      <p className="mt-3 text-[13px] text-ink-muted">{label}</p>
      <p className="mt-0.5 text-[20px] font-bold" style={{ color }}>
        {formatVendorAmount(value)}
      </p>
    </section>
  );
}
