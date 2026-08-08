'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Info, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  updateDeliveryMode,
  updateDeliverySettings,
} from '@/actions/vendor-settings';
import type { DeliveryMode } from '@/types/vendor';

interface DeliverySettingsViewProps {
  prepTimeMinutes: number;
  minOrder: number;
  deliveryMode: DeliveryMode;
  activeDriversCount: number;
  isOwner: boolean;
}

const MODES: { value: DeliveryMode; label: string; helper: string }[] = [
  {
    value: 'internal_only',
    label: 'Mes livreurs',
    helper:
      'Vous gérez vos propres livreurs. Yonima ne dispatch pas vos commandes au pool.',
  },
  {
    value: 'pool_only',
    label: 'Pool Yonima',
    helper:
      'Yonima dispatch automatiquement vos commandes à ses livreurs. Vous payez une commission par livraison.',
  },
];

/** Puces de la confirmation, selon le sens du changement et le nombre de livreurs. */
function confirmationPoints(
  target: DeliveryMode,
  driversCount: number
): string[] {
  if (target === 'pool_only') {
    return [
      'Vos nouvelles commandes seront dispatchées au pool de livreurs Yonima.',
      driversCount > 0
        ? `Vos ${driversCount} livreur${driversCount > 1 ? 's' : ''} maison ne recevront plus de nouvelles commandes via Yonima.`
        : 'Les commandes déjà en cours ne sont pas affectées.',
      'Yonima encaissera les frais de livraison à votre place.',
      '⚠️ Les paiements en espèces ne seront plus acceptés. Vos clients devront payer par Wave ou Max it.',
      'Vous pouvez revenir à « Mes livreurs » à tout moment.',
    ];
  }

  const points = [
    driversCount > 0
      ? `Vos nouvelles commandes seront proposées à vos ${driversCount} livreur${driversCount > 1 ? 's' : ''} maison uniquement.`
      : 'Vos nouvelles commandes seront proposées à vos livreurs maison uniquement.',
    'Les commandes déjà en cours continueront avec le pool Yonima.',
    'Vous encaisserez les frais de livraison directement.',
  ];

  if (driversCount === 0) {
    points.push(
      "⚠️ Vous n'avez pas encore de livreur configuré. Tant que vous n'en aurez pas ajouté, vos nouvelles commandes ne pourront pas être livrées."
    );
  }

  return points;
}

export function DeliverySettingsView({
  prepTimeMinutes,
  minOrder,
  deliveryMode,
  activeDriversCount,
  isOwner,
}: DeliverySettingsViewProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [prepTime, setPrepTime] = useState(String(prepTimeMinutes ?? 0));
  const [minimum, setMinimum] = useState(String(minOrder ?? 0));
  const [mode, setMode] = useState<DeliveryMode>(deliveryMode);
  const [pendingMode, setPendingMode] = useState<DeliveryMode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges =
    prepTime !== String(prepTimeMinutes ?? 0) ||
    minimum !== String(minOrder ?? 0);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const result = await updateDeliverySettings({
        prepTimeMinutes: Number(prepTime),
        minOrder: Number(minimum),
      });

      if (!result.success) {
        setError(result.error ?? "L'enregistrement a échoué");
        return;
      }
      toast({ title: 'Paramètres enregistrés' });
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, prepTime, minimum, router, toast]);

  const handleConfirmMode = useCallback(async () => {
    if (!pendingMode) return;

    setIsSwitching(true);
    try {
      const result = await updateDeliveryMode(pendingMode);
      if (!result.success) {
        toast({
          title: 'La mise à jour a échoué',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      setMode(pendingMode);
      setPendingMode(null);
      toast({ title: 'Mode de livraison mis à jour' });
      router.refresh();
    } finally {
      setIsSwitching(false);
    }
  }, [pendingMode, router, toast]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <p className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-[13.5px] leading-relaxed text-green-deep">
        <Info className="h-5 w-5 shrink-0" aria-hidden="true" />
        Prix et temps de livraison calculés par Yonima. Votre temps de préparation
        affine l&apos;estimation.
      </p>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
        <div className="space-y-2">
          <Label htmlFor="prepTime" className="text-[14px] font-semibold">
            Temps moyen de préparation
          </Label>
          <p className="text-[12.5px] text-ink-muted">
            Durée moyenne pour préparer une commande.
          </p>
          <div className="relative">
            <Input
              id="prepTime"
              type="text"
              inputMode="numeric"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value.replace(/\D/g, ''))}
              disabled={!isOwner || isSaving}
              className="h-[50px] rounded-xl pr-14"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-ink-muted">
              min
            </span>
          </div>
        </div>

        <div className="space-y-2 border-t border-neutral-300 pt-4">
          <Label htmlFor="minOrder" className="text-[14px] font-semibold">
            Commande minimum
          </Label>
          <p className="text-[12.5px] text-ink-muted">
            Montant minimum pour passer une commande.
          </p>
          <div className="relative">
            <Input
              id="minOrder"
              type="text"
              inputMode="numeric"
              value={minimum}
              onChange={(e) => setMinimum(e.target.value.replace(/\D/g, ''))}
              disabled={!isOwner || isSaving}
              className="h-[50px] rounded-xl pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-ink-muted">
              FCFA
            </span>
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {isOwner && hasChanges && (
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-12 w-full rounded-xl"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement…
            </>
          ) : (
            'Enregistrer'
          )}
        </Button>
      )}

      {isOwner && (
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
            Mode de livraison
          </h2>

          <div className="space-y-3">
            {MODES.map((item) => {
              const isSelected = mode === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => !isSelected && setPendingMode(item.value)}
                  disabled={isSwitching}
                  aria-pressed={isSelected}
                  className={cn(
                    'w-full rounded-xl border p-4 text-left transition-colors',
                    isSelected
                      ? 'border-green-forest bg-green-50'
                      : 'border-neutral-200 hover:border-green-forest'
                  )}
                >
                  <span
                    className={cn(
                      'text-[15px] font-bold',
                      isSelected && 'text-green-deep'
                    )}
                  >
                    {item.label}
                  </span>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                    {item.helper}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <AlertDialog
        open={!!pendingMode}
        onOpenChange={(open) => !open && !isSwitching && setPendingMode(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingMode === 'pool_only'
                ? 'Passer en mode Pool Yonima ?'
                : 'Reprendre vos livreurs maison ?'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <ul className="mt-2 space-y-2 text-left">
                {pendingMode &&
                  confirmationPoints(pendingMode, activeDriversCount).map((point) => (
                    <li key={point} className="flex gap-2 text-[13.5px]">
                      <span aria-hidden="true">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSwitching}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmMode();
              }}
              disabled={isSwitching}
            >
              {pendingMode === 'pool_only'
                ? 'Confirmer le passage en Pool'
                : 'Confirmer le passage en Mes livreurs'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
