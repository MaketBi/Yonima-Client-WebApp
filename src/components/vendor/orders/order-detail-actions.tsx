'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Bike, CheckCircle2, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CancelOrderDialog } from './cancel-order-dialog';
import { DriverPickerDialog } from './driver-picker-dialog';
import { advanceOrderStatus } from '@/actions/vendor-orders';
import {
  CANCELLABLE_STATUSES,
  NEXT_ORDER_STATUS,
  ORDER_STATUS_LABELS,
  type VendorOrder,
} from '@/types/vendor';

const ACTION_LABELS: Record<string, { label: string; icon: typeof Play }> = {
  pending: { label: 'Commencer préparation', icon: Play },
  preparing: { label: 'Marquer prête', icon: CheckCircle2 },
  ready: { label: 'Assigner un livreur', icon: Bike },
};

interface OrderDetailActionsProps {
  order: VendorOrder;
  canManageOrders: boolean;
  canAssignDrivers: boolean;
  canAssignFromThisVendor: boolean;
  /** L'annulation est réservée au propriétaire (contrainte de l'Edge Function). */
  isOwner: boolean;
}

export function OrderDetailActions({
  order,
  canManageOrders,
  canAssignDrivers,
  canAssignFromThisVendor,
  isOwner,
}: OrderDetailActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [, startRefresh] = useTransition();

  const refresh = useCallback(() => {
    startRefresh(() => router.refresh());
  }, [router]);

  const handleAdvance = useCallback(async () => {
    setIsPending(true);
    try {
      const result = await advanceOrderStatus(order.id);
      if (!result.success) {
        toast({
          title: 'La mise à jour a échoué',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: order.order_number,
        description: ORDER_STATUS_LABELS[result.status!],
      });
      refresh();
    } finally {
      setIsPending(false);
    }
  }, [order.id, order.order_number, refresh, toast]);

  const action = ACTION_LABELS[order.status];
  const isAssignStep = order.status === 'ready';

  const showPrimary =
    canManageOrders &&
    !!action &&
    (isAssignStep
      ? canAssignDrivers && canAssignFromThisVendor
      : !!NEXT_ORDER_STATUS[order.status]);

  const showCancelButton =
    isOwner && canManageOrders && CANCELLABLE_STATUSES.includes(order.status);

  if (!showPrimary && !showCancelButton) return null;

  const ActionIcon = action?.icon;

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        {showPrimary && (
          <Button
            onClick={() => (isAssignStep ? setShowPicker(true) : handleAdvance())}
            disabled={isPending}
            className="h-12 flex-1 rounded-xl text-[15px] font-semibold"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />
            )}
            {action.label}
          </Button>
        )}

        {showCancelButton && (
          <Button
            variant="outline"
            onClick={() => setShowCancel(true)}
            disabled={isPending}
            className="h-12 rounded-xl border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive sm:flex-none"
          >
            Annuler la commande
          </Button>
        )}
      </div>

      <DriverPickerDialog
        order={showPicker ? order : null}
        open={showPicker}
        onOpenChange={setShowPicker}
        onAssigned={(driverName) => {
          toast({ title: 'Livreur assigné', description: driverName ?? undefined });
          setShowPicker(false);
          refresh();
        }}
      />

      <CancelOrderDialog
        orderId={order.id}
        orderNumber={order.order_number}
        open={showCancel}
        onOpenChange={setShowCancel}
        onCancelled={refresh}
      />
    </>
  );
}
