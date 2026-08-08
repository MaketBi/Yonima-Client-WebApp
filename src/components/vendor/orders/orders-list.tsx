'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, History, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { OrderActiveCard } from './order-active-card';
import { OrderHistoryCard } from './order-history-card';
import { DriverPickerDialog } from './driver-picker-dialog';
import { advanceOrderStatus } from '@/actions/vendor-orders';
import { useVendorOrdersRealtime } from '@/hooks/use-vendor-orders-realtime';
import {
  ACTIVE_ORDER_STATUSES,
  NEXT_ORDER_STATUS,
  ORDER_STATUS_LABELS,
  type VendorOrder,
} from '@/types/vendor';

type Tab = 'active' | 'history';

interface OrdersListProps {
  orders: VendorOrder[];
  vendorId: string;
  canManageOrders: boolean;
  canAssignDrivers: boolean;
  /** En `pool_only`, le dispatch Yonima assigne — pas le vendeur. */
  canAssignFromThisVendor: boolean;
  loadError?: string;
}

export function OrdersList({
  orders,
  vendorId,
  canManageOrders,
  canAssignDrivers,
  canAssignFromThisVendor,
  loadError,
}: OrdersListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('active');
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [pickerOrder, setPickerOrder] = useState<VendorOrder | null>(null);
  const [isRefreshing, startRefresh] = useTransition();

  const refresh = useCallback(() => {
    startRefresh(() => router.refresh());
  }, [router]);

  useVendorOrdersRealtime(vendorId, refresh);

  const { active, history } = useMemo(() => {
    const activeSet = new Set<string>(ACTIVE_ORDER_STATUSES);
    return {
      active: orders.filter((o) => activeSet.has(o.status)),
      history: orders.filter((o) => !activeSet.has(o.status)),
    };
  }, [orders]);

  const handleAction = useCallback(
    async (order: VendorOrder) => {
      // `ready` ouvre le sélecteur ; les autres avancent d'un cran.
      if (order.status === 'ready') {
        setPickerOrder(order);
        return;
      }

      setPendingOrderId(order.id);
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
        setPendingOrderId(null);
      }
    },
    [refresh, toast]
  );

  const handleAssigned = useCallback(
    (driverName: string | null) => {
      toast({
        title: 'Livreur assigné',
        description: driverName ?? undefined,
      });
      setPickerOrder(null);
      refresh();
    },
    [refresh, toast]
  );

  const showActionButton = canManageOrders;
  const canOpenPicker = canAssignDrivers && canAssignFromThisVendor;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'active', label: 'À traiter', count: active.length },
    { key: 'history', label: 'Historique', count: 0 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="flex gap-2 rounded-pill bg-white p-1 shadow-card">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              aria-current={tab === item.key ? 'true' : undefined}
              className={cn(
                'flex items-center gap-2 rounded-pill px-4 py-2 text-[13.5px] font-semibold transition-colors',
                tab === item.key
                  ? 'bg-green-forest text-white'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              {item.label}
              {item.count > 0 && (
                <span
                  className={cn(
                    'inline-flex h-5 min-w-5 items-center justify-center rounded-pill px-1.5 text-[11px] font-bold',
                    tab === item.key
                      ? 'bg-white/25 text-white'
                      : 'bg-destructive text-white'
                  )}
                >
                  {item.count > 99 ? '99+' : item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {isRefreshing && (
          <Loader2
            className="h-4 w-4 animate-spin text-ink-muted"
            aria-label="Actualisation"
          />
        )}
      </div>

      {loadError && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {!canAssignFromThisVendor && tab === 'active' && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-[13px] text-green-deep">
          Vos livraisons sont assurées par le pool Yonima : l&apos;assignation d&apos;un
          livreur est automatique.
        </p>
      )}

      {tab === 'active' ? (
        active.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="h-10 w-10 text-green-electric" />}
            title="Aucune commande en cours"
            body="Les nouvelles commandes apparaîtront ici."
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {active.map((order) => (
              <OrderActiveCard
                key={order.id}
                order={order}
                isPending={pendingOrderId === order.id}
                onAction={
                  showActionButton &&
                  (order.status === 'ready'
                    ? canOpenPicker
                    : !!NEXT_ORDER_STATUS[order.status])
                    ? handleAction
                    : undefined
                }
              />
            ))}
          </div>
        )
      ) : history.length === 0 ? (
        <EmptyState
          icon={<History className="h-10 w-10 text-neutral-500" />}
          title="Aucun historique"
          body="Les commandes livrées et annulées apparaîtront ici."
        />
      ) : (
        <div className="space-y-3">
          {history.map((order) => (
            <OrderHistoryCard key={order.id} order={order} />
          ))}
        </div>
      )}

      <DriverPickerDialog
        order={pickerOrder}
        open={!!pickerOrder}
        onOpenChange={(open) => !open && setPickerOrder(null)}
        onAssigned={handleAssigned}
      />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-[18px] bg-white px-6 py-16 text-center shadow-card">
      {icon}
      <h2 className="mt-4 text-[17px] font-bold">{title}</h2>
      <p className="mt-1 text-[14px] text-ink-muted">{body}</p>
    </div>
  );
}
