'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { toggleVendorOpen, updateOpeningHours } from '@/actions/vendor-settings';
import {
  currentDayKey,
  DEFAULT_DAY_HOURS,
  isVendorCurrentlyOpen,
  WEEK_DAYS,
  type OpeningHours,
  type WeekDayKey,
} from '@/types/vendor';

interface OpeningHoursViewProps {
  initialHours: OpeningHours;
  initialIsOpen: boolean;
  canManage: boolean;
}

export function OpeningHoursView({
  initialHours,
  initialIsOpen,
  canManage,
}: OpeningHoursViewProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [hours, setHours] = useState<OpeningHours>(initialHours);
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = useMemo(
    () => JSON.stringify(hours) !== JSON.stringify(initialHours),
    [hours, initialHours]
  );

  const todayKey = currentDayKey();
  const today = hours[todayKey];
  const currentlyOpen = isVendorCurrentlyOpen(isOpen, hours);

  const toggleDay = (key: WeekDayKey, enabled: boolean) => {
    setHours((prev) => ({
      ...prev,
      [key]: enabled ? (prev[key] ?? DEFAULT_DAY_HOURS) : null,
    }));
  };

  const setDayTime = (key: WeekDayKey, field: 'open' | 'close', value: string) => {
    setHours((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? DEFAULT_DAY_HOURS), [field]: value },
    }));
  };

  /** UI optimiste : on rétablit l'état précédent si le serveur refuse. */
  const handleToggleOpen = useCallback(
    async (next: boolean) => {
      const previous = isOpen;
      setIsOpen(next);
      setIsToggling(true);

      try {
        const result = await toggleVendorOpen(next);
        if (!result.success) {
          setIsOpen(previous);
          toast({
            title: 'La mise à jour a échoué',
            description: result.error,
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: next ? 'Boutique ouverte' : 'Boutique fermée',
        });
        router.refresh();
      } finally {
        setIsToggling(false);
      }
    },
    [isOpen, router, toast]
  );

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const result = await updateOpeningHours(hours);
      if (!result.success) {
        setError(result.error ?? "L'enregistrement a échoué");
        return;
      }
      toast({ title: 'Horaires mis à jour' });
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }, [hours, isSaving, router, toast]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <section className="rounded-2xl bg-white p-5 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
              Aujourd&apos;hui
            </p>
            <p className="mt-1 text-[17px] font-bold">
              {today ? `${today.open} – ${today.close}` : 'Fermé'}
            </p>
          </div>

          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-pill px-3.5 py-1.5 text-[12.5px] font-semibold',
              currentlyOpen
                ? 'bg-green-100 text-green-deep'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            <span
              className={cn(
                'h-[7px] w-[7px] rounded-full',
                currentlyOpen ? 'bg-green-electric' : 'bg-destructive'
              )}
            />
            {currentlyOpen ? 'Ouvert' : 'Fermé'}
          </span>
        </div>
      </section>

      {canManage && (
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold">Boutique ouverte</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                Désactivez pour fermer immédiatement, peu importe les horaires.
                Réactivez manuellement pour rouvrir.
              </p>
            </div>
            <Switch
              checked={isOpen}
              onCheckedChange={handleToggleOpen}
              disabled={isToggling}
              aria-label="Boutique ouverte"
            />
          </div>
        </section>
      )}

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
          Horaires de la semaine
        </h2>

        <ul className="divide-y divide-neutral-300">
          {WEEK_DAYS.map((day) => {
            const value = hours[day.key];
            const enabled = !!value;

            return (
              <li
                key={day.key}
                className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="w-24 shrink-0 text-[14.5px] font-medium">
                  {day.label}
                </span>

                {canManage && (
                  <Switch
                    checked={enabled}
                    onCheckedChange={(next) => toggleDay(day.key, next)}
                    disabled={isSaving}
                    aria-label={`${day.label} ouvert`}
                  />
                )}

                {enabled ? (
                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      type="time"
                      value={value.open}
                      onChange={(e) => setDayTime(day.key, 'open', e.target.value)}
                      disabled={!canManage || isSaving}
                      aria-label={`Ouverture ${day.label}`}
                      className="h-10 w-[110px] rounded-xl"
                    />
                    <span className="text-ink-muted">–</span>
                    <Input
                      type="time"
                      value={value.close}
                      onChange={(e) => setDayTime(day.key, 'close', e.target.value)}
                      disabled={!canManage || isSaving}
                      aria-label={`Fermeture ${day.label}`}
                      className="h-10 w-[110px] rounded-xl"
                    />
                  </div>
                ) : (
                  <span className="flex-1 text-[14px] text-ink-muted">Fermé</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {canManage && hasChanges && (
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
            'Enregistrer les modifications'
          )}
        </Button>
      )}
    </div>
  );
}
