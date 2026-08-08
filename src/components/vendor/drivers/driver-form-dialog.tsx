'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bike, Car, Check, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  createVendorDriver,
  updateVendorDriver,
  type DriverFormValues,
} from '@/actions/vendor-drivers';
import {
  DRIVER_VEHICLE_OPTIONS,
  type VehicleType,
  type VendorDriver,
} from '@/types/vendor';

interface DriverFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Absent = création. */
  driver?: VendorDriver;
}

const VEHICLE_ICONS = { moto: Bike, voiture: Car };

/** `+221771234567` ou `771234567` → `77 123 45 67`. */
function toLocalDigits(phone: string | null): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '').replace(/^221/, '').slice(0, 9);
}

function formatPhoneDisplay(digits: string): string {
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 7),
    digits.slice(7, 9),
  ].filter(Boolean);
  return parts.join(' ');
}

export function DriverFormDialog({
  open,
  onOpenChange,
  driver,
}: DriverFormDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!driver;

  const [name, setName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('moto');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(driver?.name ?? '');
    setPhoneDigits(toLocalDigits(driver?.phone ?? null));
    setVehicleType(
      driver?.vehicle_type === 'voiture' ? 'voiture' : 'moto'
    );
    setError(null);
  }, [open, driver]);

  const isPhoneComplete = phoneDigits.length === 9;
  const isValid = name.trim().length > 0 && isPhoneComplete;

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSaving) return;

    setIsSaving(true);
    setError(null);

    const values: DriverFormValues = {
      name,
      phone: `+221${phoneDigits}`,
      vehicleType,
    };

    try {
      const result = isEdit
        ? await updateVendorDriver(driver.id, values)
        : await createVendorDriver(values);

      if (!result.success) {
        setError(result.error ?? "L'enregistrement a échoué");
        return;
      }

      toast({
        title: isEdit ? 'Livreur modifié' : 'Livreur ajouté',
        description: name.trim(),
      });
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }, [
    isValid,
    isSaving,
    name,
    phoneDigits,
    vehicleType,
    isEdit,
    driver,
    onOpenChange,
    router,
    toast,
  ]);

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier le livreur' : 'Nouveau livreur'}
          </DialogTitle>
          <DialogDescription>
            Le livreur se connectera avec ce numéro via un code OTP.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="driverName" className="text-[13px] font-semibold">
              Nom complet *
            </Label>
            <Input
              id="driverName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Moussa Diop"
              className="h-[50px] rounded-xl"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driverPhone" className="text-[13px] font-semibold">
              Téléphone *
            </Label>
            <div className="flex gap-2">
              <span className="flex h-[50px] items-center rounded-xl bg-neutral-100 px-4 text-[15px] font-semibold">
                🇸🇳 +221
              </span>
              <div className="relative flex-1">
                <Input
                  id="driverPhone"
                  type="tel"
                  inputMode="numeric"
                  value={formatPhoneDisplay(phoneDigits)}
                  onChange={(e) =>
                    setPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, 9))
                  }
                  placeholder="77 123 45 67"
                  className="h-[50px] rounded-xl pr-12"
                  disabled={isSaving}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-semibold">
                  {isPhoneComplete ? (
                    <Check className="h-4 w-4 text-green-electric" />
                  ) : (
                    <span className="text-ink-muted">{phoneDigits.length}/9</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold">Type de véhicule</Label>
            <div className="flex gap-3">
              {DRIVER_VEHICLE_OPTIONS.map((option) => {
                const Icon = VEHICLE_ICONS[option.value];
                const isSelected = vehicleType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setVehicleType(option.value)}
                    disabled={isSaving}
                    aria-pressed={isSelected}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[14px] font-semibold transition-colors',
                      isSelected
                        ? 'border-green-forest bg-green-50 text-green-deep'
                        : 'border-neutral-200 text-ink hover:border-green-forest'
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="sm:flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSaving}
            className="sm:flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement…
              </>
            ) : isEdit ? (
              'Enregistrer'
            ) : (
              'Ajouter'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
