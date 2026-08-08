'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bike, Car, ChevronRight, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { fetchAssignableDrivers } from '@/actions/vendor-orders';
import { formatVendorAmount, initialsOf } from '@/lib/vendor/format';
import { VENDOR_API } from '@/lib/vendor/constants';
import {
  driverStatusText,
  isDriverAvailable,
  isDriverOnline,
  type VendorDriver,
  type VendorOrder,
} from '@/types/vendor';

interface DriverPickerDialogProps {
  order: VendorOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: (driverName: string | null) => void;
}

/** 3 sections comme l'app iOS : seuls les livreurs disponibles sont cliquables. */
function groupDrivers(drivers: VendorDriver[]) {
  return {
    available: drivers.filter(isDriverAvailable),
    busy: drivers.filter((d) => !isDriverAvailable(d) && !!d.current_order_id),
    offline: drivers.filter(
      (d) => !isDriverAvailable(d) && !d.current_order_id && !isDriverOnline(d)
    ),
  };
}

export function DriverPickerDialog({
  order,
  open,
  onOpenChange,
  onAssigned,
}: DriverPickerDialogProps) {
  const [drivers, setDrivers] = useState<VendorDriver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchAssignableDrivers()
      .then((result) => {
        if (cancelled) return;
        if (result.error) setError(result.error);
        setDrivers(result.drivers);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleAssign = useCallback(
    async (driver: VendorDriver) => {
      if (!order || assigningId) return;

      setAssigningId(driver.id);
      setError(null);

      try {
        const response = await fetch(VENDOR_API.assignDriver, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, driverId: driver.id }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          setError(result.error || "L'assignation a échoué");
          return;
        }

        onOpenChange(false);
        onAssigned(result.driverName ?? driver.name);
      } catch {
        setError('Erreur réseau. Réessayez.');
      } finally {
        setAssigningId(null);
      }
    },
    [order, assigningId, onAssigned, onOpenChange]
  );

  const groups = groupDrivers(drivers);
  const customerName = order?.customer_name || order?.user?.full_name || 'Client';

  const sections = [
    { key: 'available', label: 'Disponibles', color: '#10B981', items: groups.available },
    { key: 'busy', label: 'En course', color: '#F59E0B', items: groups.busy },
    { key: 'offline', label: 'Hors ligne', color: '#A0A0A0', items: groups.offline },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choisir un livreur</DialogTitle>
          <DialogDescription>
            {order
              ? `${order.order_number} — ${customerName} · ${formatVendorAmount(order.total)}`
              : ''}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-green-forest" />
          </div>
        ) : drivers.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            Vous n&apos;avez pas encore de livreurs. Ajoutez-en depuis le tableau de
            bord.
          </p>
        ) : (
          <div className="space-y-5">
            {sections.map((section) =>
              section.items.length === 0 ? null : (
                <section key={section.key}>
                  <p
                    className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: section.color }}
                  >
                    {section.label}
                    <span className="rounded-pill bg-neutral-100 px-1.5 py-0.5 text-ink-muted">
                      {section.items.length}
                    </span>
                  </p>

                  <ul className="space-y-2">
                    {section.items.map((driver) => {
                      const selectable = section.key === 'available';
                      const VehicleIcon =
                        driver.vehicle_type === 'voiture' ? Car : Bike;
                      const busy = assigningId === driver.id;

                      return (
                        <li key={driver.id}>
                          <button
                            type="button"
                            onClick={() => selectable && handleAssign(driver)}
                            disabled={!selectable || !!assigningId}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-xl border border-neutral-300 p-3 text-left transition-colors',
                              selectable
                                ? 'hover:border-green-forest hover:bg-green-50'
                                : 'cursor-default opacity-60'
                            )}
                          >
                            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[13px] font-bold">
                              {initialsOf(driver.name)}
                              {isDriverOnline(driver) && (
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-electric" />
                              )}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14.5px] font-semibold">
                                {driver.name || 'Livreur'}
                              </span>
                              <span className="flex items-center gap-1.5 text-[12.5px] text-ink-muted">
                                <VehicleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                {driver.license_plate || driver.vehicle_type || '—'}
                                <span aria-hidden="true">·</span>
                                {driverStatusText(driver)}
                              </span>
                            </span>

                            {busy ? (
                              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-green-forest" />
                            ) : selectable ? (
                              <ChevronRight
                                className="h-5 w-5 shrink-0 text-neutral-500"
                                aria-hidden="true"
                              />
                            ) : (
                              <span className="shrink-0 text-[12px] text-ink-muted">
                                Indisponible
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
