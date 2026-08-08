'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { reviewDriverDeposit } from '@/actions/vendor-cash';
import {
  formatOrderDetailDate,
  formatVendorAmount,
  formatVendorPhone,
} from '@/lib/vendor/format';
import { DEPOSIT_METHOD_LABELS, type DriverCashDeposit } from '@/types/vendor';

interface DepositReviewDialogProps {
  deposit: DriverCashDeposit | null;
  onOpenChange: (open: boolean) => void;
}

export function DepositReviewDialog({
  deposit,
  onOpenChange,
}: DepositReviewDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [validatorNote, setValidatorNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deposit) return;
    setValidatorNote('');
    setRejectionReason('');
    setShowReject(false);
    setError(null);
  }, [deposit]);

  const submit = useCallback(
    async (decision: 'confirm' | 'reject') => {
      if (!deposit || isSaving) return;

      setIsSaving(true);
      setError(null);

      try {
        const result = await reviewDriverDeposit(deposit.id, decision, {
          validatorNote,
          rejectionReason,
        });

        if (!result.success) {
          setError(result.error ?? "L'opération a échoué");
          return;
        }

        toast({
          title:
            decision === 'confirm' ? 'Versement confirmé' : 'Versement rejeté',
          description: formatVendorAmount(deposit.amount),
        });
        onOpenChange(false);
        router.refresh();
      } finally {
        setIsSaving(false);
      }
    },
    [deposit, isSaving, validatorNote, rejectionReason, onOpenChange, router, toast]
  );

  if (!deposit) return null;

  const rows = [
    {
      label: 'Méthode',
      value: deposit.deposit_method
        ? DEPOSIT_METHOD_LABELS[deposit.deposit_method]
        : '—',
    },
    { label: 'Téléphone', value: formatVendorPhone(deposit.deposit_phone) || '—' },
    { label: 'Référence', value: deposit.transaction_reference || '—' },
    { label: 'Date', value: formatOrderDetailDate(deposit.declared_at) },
  ];

  return (
    <Dialog open={!!deposit} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Valider le versement</DialogTitle>
          <DialogDescription>
            Vérifiez que vous avez bien reçu ce montant avant de confirmer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-2xl bg-green-50 px-4 py-4 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-green-deep">
              Versement déclaré
            </p>
            <p className="mt-1 text-[26px] font-bold text-green-forest">
              {formatVendorAmount(deposit.amount)}
            </p>
          </div>

          <dl className="space-y-2 text-[14px]">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4">
                <dt className="text-ink-muted">{row.label}</dt>
                <dd className="truncate font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>

          {deposit.driver_note && (
            <p className="rounded-xl bg-neutral-100 px-3 py-2 text-[13.5px] italic text-ink-muted">
              {deposit.driver_note}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="validatorNote" className="text-[13px] font-semibold">
              Note (optionnelle)
            </Label>
            <Textarea
              id="validatorNote"
              value={validatorNote}
              onChange={(e) => setValidatorNote(e.target.value)}
              placeholder="Ajouter une note…"
              rows={2}
              className="rounded-xl"
              disabled={isSaving}
            />
          </div>

          {showReject && (
            <div className="space-y-2">
              <Label htmlFor="rejectionReason" className="text-[13px] font-semibold">
                Raison du rejet *
              </Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Expliquez pourquoi ce versement est rejeté…"
                rows={2}
                className="rounded-xl"
                disabled={isSaving}
              />
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {!showReject ? (
            <>
              <Button
                onClick={() => submit('confirm')}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validation…
                  </>
                ) : (
                  'Confirmer le versement'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReject(true)}
                disabled={isSaving}
                className="w-full border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive"
              >
                Rejeter le versement
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="destructive"
                onClick={() => submit('reject')}
                disabled={isSaving || !rejectionReason.trim()}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejet…
                  </>
                ) : (
                  'Confirmer le rejet'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReject(false)}
                disabled={isSaving}
                className="w-full"
              >
                Retour
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
