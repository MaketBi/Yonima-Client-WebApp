'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Banknote } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatOrderListDate, formatVendorAmount } from '@/lib/vendor/format';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import {
  maskPayoutPhone,
  PAYOUT_METHOD_LABELS,
  PAYOUT_STATUS_COLORS,
  PAYOUT_STATUS_LABELS,
  type VendorPayout,
} from '@/types/vendor';

function formatPeriod(payout: VendorPayout): string {
  if (!payout.period_start || !payout.period_end) return '—';
  const start = new Date(payout.period_start).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });
  const end = new Date(payout.period_end).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });
  return `${start} – ${end}`;
}

export function PayoutsView({ payouts }: { payouts: VendorPayout[] }) {
  const [selected, setSelected] = useState<VendorPayout | null>(null);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href={VENDOR_ROUTES.finances}
        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Mes finances
      </Link>

      {payouts.length === 0 ? (
        <div className="flex flex-col items-center rounded-[18px] bg-white px-6 py-16 text-center shadow-card">
          <Banknote className="h-10 w-10 text-neutral-500" aria-hidden="true" />
          <h2 className="mt-4 text-[17px] font-bold">Aucun paiement</h2>
          <p className="mt-1 text-[14px] text-ink-muted">
            Vos virements apparaîtront ici dès le premier versement.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {payouts.map((payout) => {
            const color = PAYOUT_STATUS_COLORS[payout.status];

            return (
              <li key={payout.id}>
                <button
                  type="button"
                  onClick={() => setSelected(payout)}
                  className="w-full rounded-2xl bg-white p-5 text-left shadow-card transition-colors hover:bg-neutral-100/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[20px] font-bold text-green-forest">
                      {formatVendorAmount(payout.net_amount)}
                    </p>
                    <span
                      className="shrink-0 rounded-pill px-2.5 py-1 text-[12px] font-semibold"
                      style={{ color, backgroundColor: `${color}1F` }}
                    >
                      {PAYOUT_STATUS_LABELS[payout.status]}
                    </span>
                  </div>

                  <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-neutral-300 pt-3 text-[12.5px]">
                    <div>
                      <dt className="text-ink-muted">Période</dt>
                      <dd className="mt-0.5 font-semibold">{formatPeriod(payout)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">Commandes</dt>
                      <dd className="mt-0.5 font-semibold">{payout.order_count ?? 0}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">Reçu le</dt>
                      <dd className="mt-0.5 font-semibold">
                        {payout.processed_at
                          ? formatOrderListDate(payout.processed_at)
                          : '—'}
                      </dd>
                    </div>
                  </dl>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détail du paiement</DialogTitle>
            <DialogDescription>
              {selected?.payout_reference ?? 'Référence indisponible'}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 py-2">
              <dl className="space-y-2 text-[14px]">
                <Row label="Période" value={formatPeriod(selected)} />
                <Row
                  label="Nombre de commandes"
                  value={String(selected.order_count ?? 0)}
                />
                <Row
                  label="Montant brut"
                  value={formatVendorAmount(selected.gross_amount)}
                />
                {/* Seul endroit du back-office où les commissions sont affichées. */}
                <Row
                  label="Commissions"
                  value={`− ${formatVendorAmount(selected.total_commissions)}`}
                />
                <Row
                  label="Frais de transfert"
                  value={`− ${formatVendorAmount(selected.fee)}`}
                />
                {selected.total_adjustments !== 0 && (
                  <Row
                    label="Ajustements"
                    value={formatVendorAmount(selected.total_adjustments)}
                  />
                )}

                <div className="flex justify-between border-t border-neutral-300 pt-2.5 text-[16px] font-bold">
                  <dt>Montant net</dt>
                  <dd className="text-green-forest">
                    {formatVendorAmount(selected.net_amount)}
                  </dd>
                </div>
              </dl>

              <div className="space-y-2 rounded-xl bg-neutral-100 p-4 text-[13.5px]">
                <Row
                  label="Méthode"
                  value={
                    selected.payout_method
                      ? PAYOUT_METHOD_LABELS[selected.payout_method]
                      : '—'
                  }
                />
                <Row label="Numéro" value={maskPayoutPhone(selected.payout_phone)} />
                <Row label="Bénéficiaire" value={selected.payout_name ?? '—'} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}
