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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  deleteReviewResponse,
  respondToReview,
} from '@/actions/vendor-reviews';
import {
  reviewDisplayRating,
  SUGGESTED_RESPONSES,
  type VendorReview,
} from '@/types/vendor';

const MAX_LENGTH = 500;

interface ReviewResponseDialogProps {
  review: VendorReview | null;
  onOpenChange: (open: boolean) => void;
}

export function ReviewResponseDialog({
  review,
  onOpenChange,
}: ReviewResponseDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!review) return;
    setText(review.vendor_response ?? '');
    setError(null);
  }, [review]);

  const handleSubmit = useCallback(async () => {
    if (!review || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const result = await respondToReview(review.id, text);
      if (!result.success) {
        setError(result.error ?? "L'envoi a échoué");
        return;
      }
      toast({ title: 'Réponse publiée' });
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }, [review, isSaving, text, onOpenChange, router, toast]);

  const handleDelete = useCallback(async () => {
    if (!review || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const result = await deleteReviewResponse(review.id);
      if (!result.success) {
        setError(result.error ?? 'La suppression a échoué');
        return;
      }
      toast({ title: 'Réponse supprimée' });
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }, [review, isSaving, onOpenChange, router, toast]);

  if (!review) return null;

  const hasExistingResponse = !!review.vendor_response;
  const isNegative = reviewDisplayRating(review) <= 2;
  const suggestions = isNegative
    ? SUGGESTED_RESPONSES.negative
    : SUGGESTED_RESPONSES.positive;

  const trimmed = text.trim();
  const canSave =
    trimmed.length > 0 &&
    trimmed.length <= MAX_LENGTH &&
    trimmed !== (review.vendor_response ?? '');

  return (
    <Dialog open={!!review} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {hasExistingResponse ? 'Modifier la réponse' : "Répondre à l'avis"}
          </DialogTitle>
          <DialogDescription>
            Votre réponse est publique et visible par tous les clients.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {review.comment && (
            <p className="rounded-xl bg-neutral-100 px-3.5 py-3 text-[13.5px] italic leading-relaxed text-ink-muted">
              {review.comment}
            </p>
          )}

          <div className="space-y-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Rédigez votre réponse…"
              rows={4}
              className="rounded-xl"
              disabled={isSaving}
              aria-label="Votre réponse"
            />
            <p
              className={cn(
                'text-right text-[12px]',
                trimmed.length > MAX_LENGTH ? 'text-destructive' : 'text-ink-muted'
              )}
            >
              {trimmed.length}/{MAX_LENGTH} caractères
            </p>
          </div>

          {!text && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                Réponses suggérées
              </p>
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setText(suggestion)}
                    disabled={isSaving}
                    className="w-full rounded-xl border border-neutral-200 p-3 text-left text-[13px] leading-relaxed transition-colors hover:border-green-forest hover:bg-green-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {hasExistingResponse && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isSaving}
              className="border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive sm:mr-auto"
            >
              Supprimer
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!canSave || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi…
              </>
            ) : (
              'Envoyer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
