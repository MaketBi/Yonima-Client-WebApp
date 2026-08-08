'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Banknote,
  Bike,
  Car,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Power,
  Trash2,
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { DriverFormDialog } from './driver-form-dialog';
import {
  deleteVendorDriver,
  toggleDriverActive,
} from '@/actions/vendor-drivers';
import { formatVendorPhone, initialsOf } from '@/lib/vendor/format';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import {
  driverStatusText,
  isDriverOnline,
  type VendorDriver,
} from '@/types/vendor';

interface DriversViewProps {
  drivers: VendorDriver[];
  canManage: boolean;
  isOwner: boolean;
  loadError?: string;
}

/** Couleur de la pastille de statut, alignée sur l'app iOS. */
function statusColor(driver: VendorDriver): string {
  if (driver.is_active === false) return '#A0A0A0';
  if (driver.current_order_id) return '#F59E0B';
  if (isDriverOnline(driver)) return '#10B981';
  return '#A0A0A0';
}

/** Normalise pour wa.me : sans `+`, avec l'indicatif pays. */
function whatsappHref(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.startsWith('221') ? digits : `221${digits}`;
  return `https://wa.me/${normalized}`;
}

export function DriversView({
  drivers,
  canManage,
  isOwner,
  loadError,
}: DriversViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<VendorDriver | undefined>();
  const [pendingDelete, setPendingDelete] = useState<VendorDriver | null>(null);
  const [isPending, startTransition] = useTransition();

  const openCreate = () => {
    setEditing(undefined);
    setShowForm(true);
  };

  const handleToggle = (driver: VendorDriver) => {
    const nextActive = driver.is_active === false;

    startTransition(async () => {
      const result = await toggleDriverActive(driver.id, nextActive);
      if (!result.success) {
        toast({
          title: 'La mise à jour a échoué',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: nextActive ? 'Livreur réactivé' : 'Livreur désactivé',
        description: driver.name ?? undefined,
      });
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!pendingDelete) return;

    startTransition(async () => {
      const result = await deleteVendorDriver(pendingDelete.id);
      if (!result.success) {
        toast({
          title: 'La suppression a échoué',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Livreur supprimé', description: pendingDelete.name ?? undefined });
      setPendingDelete(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button asChild variant="outline" className="h-11 rounded-xl">
          <Link href={VENDOR_ROUTES.caisse}>
            <Banknote className="mr-2 h-4 w-4" />
            Caisse livreurs
          </Link>
        </Button>

        {isOwner && (
          <Button onClick={openCreate} className="h-11 rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un livreur
          </Button>
        )}
      </div>

      {loadError && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {drivers.length === 0 ? (
        <div className="flex flex-col items-center rounded-[18px] bg-white px-6 py-16 text-center shadow-card">
          <Bike className="h-10 w-10 text-neutral-500" aria-hidden="true" />
          <h2 className="mt-4 text-[17px] font-bold">Aucun livreur</h2>
          <p className="mt-1 text-[14px] text-ink-muted">
            Ajoutez vos livreurs pour gérer vos livraisons.
          </p>
          {isOwner && (
            <Button onClick={openCreate} className="mt-5 rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un livreur
            </Button>
          )}
        </div>
      ) : (
        <ul className="grid gap-3 xl:grid-cols-2">
          {drivers.map((driver) => {
            const VehicleIcon = driver.vehicle_type === 'voiture' ? Car : Bike;
            const inactive = driver.is_active === false;
            const waHref = whatsappHref(driver.phone);

            return (
              <li
                key={driver.id}
                className={cn(
                  'flex items-center gap-4 rounded-2xl border border-neutral-300 bg-white p-4',
                  inactive && 'opacity-60'
                )}
              >
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[15px] font-bold">
                  {initialsOf(driver.name)}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white"
                    style={{ backgroundColor: statusColor(driver) }}
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[15.5px] font-bold">
                      {driver.name || 'Livreur'}
                    </h3>
                    {inactive && (
                      <span className="shrink-0 rounded-pill bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-ink-muted">
                        Inactif
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-ink-muted">
                    {formatVendorPhone(driver.phone)}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-ink-muted">
                    <VehicleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {driver.license_plate || (driver.vehicle_type ?? '—')}
                    <span aria-hidden="true">·</span>
                    <span style={{ color: statusColor(driver) }} className="font-semibold">
                      {driverStatusText(driver)}
                    </span>
                  </p>
                </div>

                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="rounded-lg p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-ink"
                        aria-label={`Actions pour ${driver.name ?? 'ce livreur'}`}
                        disabled={isPending}
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => {
                          setEditing(driver);
                          setShowForm(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>

                      {driver.phone && (
                        <DropdownMenuItem asChild>
                          <a href={`tel:${driver.phone.replace(/\s/g, '')}`}>
                            <Phone className="mr-2 h-4 w-4" />
                            Appeler
                          </a>
                        </DropdownMenuItem>
                      )}

                      {waHref && (
                        <DropdownMenuItem asChild>
                          <a href={waHref} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            WhatsApp
                          </a>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onSelect={() => handleToggle(driver)}>
                        <Power className="mr-2 h-4 w-4" />
                        {inactive ? 'Réactiver' : 'Désactiver'}
                      </DropdownMenuItem>

                      {isOwner && (
                        <DropdownMenuItem
                          onSelect={() => setPendingDelete(driver)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <DriverFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        driver={editing}
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce livreur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. {pendingDelete?.name ?? 'Ce livreur'}{' '}
              sera supprimé définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
