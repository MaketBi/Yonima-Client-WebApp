'use client';

import { useCallback, useState } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { VENDOR_API } from '@/lib/vendor/constants';
import { CANCEL_REASONS, type CancelReason } from '@/types/vendor';

const MAX_DETAILS = 500;

interface CancelOrderDialogProps {
  orderId: string;
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled: () => void;
}

export function CancelOrderDialog({
  orderId,
  orderNumber,
  open,
  onOpenChange,
  onCancelled,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState<CancelReason>('out_of_stock');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  // « Autre » impose une précision — même règle que l'app iOS.
  const isValid = reason !== 'other' || details.trim().length > 0;

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(VENDOR_API.cancelOrder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reason, details: details.trim() }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "L'annulation a échoué");
        return;
      }

      setIsDone(true);
    } catch {
      setError('Erreur réseau. Réessayez.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isValid, isSubmitting, orderId, reason, details]);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (isSubmitting) return;
      onOpenChange(nextOpen);

      if (!nextOpen) {
        const wasDone = isDone;
        setReason('out_of_stock');
        setDetails('');
        setError(null);
        setIsDone(false);
        if (wasDone) onCancelled();
      }
    },
    [isSubmitting, isDone, onOpenChange, onCancelled]
  );

  // Écran de confirmation post-annulation (le remboursement est géré backend).
  if (isDone) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Commande annulée</DialogTitle>
            <DialogDescription>
              Si le client a déjà payé, notre équipe procédera au remboursement sous
              24h. Aucune action de votre part.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => handleClose(false)} className="w-full">
              Compris
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Annuler la commande {orderNumber} ?</DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Le client sera notifié.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              Raison
            </Label>
            <RadioGroup
              value={reason}
              onValueChange={(value) => setReason(value as CancelReason)}
              className="gap-2"
            >
              {CANCEL_REASONS.map((item) => (
                <div key={item.value} className="flex items-center gap-2.5">
                  <RadioGroupItem value={item.value} id={`reason-${item.value}`} />
                  <Label
                    htmlFor={`reason-${item.value}`}
                    className="cursor-pointer text-[14px] font-normal"
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancel-details" className="text-[13px] font-semibold">
              Détails{reason === 'other' ? ' *' : ' (optionnel)'}
            </Label>
            <Textarea
              id="cancel-details"
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, MAX_DETAILS))}
              placeholder="Précisez si nécessaire…"
              rows={3}
              disabled={isSubmitting}
            />
            <p className="text-right text-[12px] text-ink-muted">
              {details.length}/{MAX_DETAILS}
            </p>
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Annulation…
              </>
            ) : (
              "Confirmer l'annulation"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isSubmitting}
            className="w-full"
          >
            Garder la commande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
