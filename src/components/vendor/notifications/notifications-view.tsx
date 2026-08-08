'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  markAllNotificationsRead,
  markNotificationRead,
} from '@/actions/vendor-notifications';
import { formatOrderListDate } from '@/lib/vendor/format';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import {
  NOTIFICATION_COLORS,
  notificationOrderId,
  type VendorNotification,
} from '@/types/vendor';

interface NotificationsViewProps {
  notifications: VendorNotification[];
  unreadCount: number;
}

export function NotificationsView({
  notifications,
  unreadCount,
}: NotificationsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleOpen = (notification: VendorNotification) => {
    if (notification.is_read) return;
    startTransition(async () => {
      await markNotificationRead(notification.id);
      router.refresh();
    });
  };

  const handleMarkAll = () => {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleMarkAll}
            disabled={isPending}
            className="h-10 rounded-xl"
          >
            Tout lire
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center rounded-[18px] bg-white px-6 py-16 text-center shadow-card">
          <BellOff className="h-10 w-10 text-neutral-500" aria-hidden="true" />
          <h2 className="mt-4 text-[17px] font-bold">Aucune notification</h2>
          <p className="mt-1 text-[14px] text-ink-muted">
            Vous serez prévenu ici des nouvelles commandes et des paiements.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {notifications.map((notification) => {
            const color =
              NOTIFICATION_COLORS[notification.type ?? 'system'] ?? '#A0A0A0';
            const unread = !notification.is_read;
            const orderId = notificationOrderId(notification);

            const content = (
              <>
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${color}1A` }}
                >
                  <Bell
                    className="h-[18px] w-[18px]"
                    style={{ color }}
                    aria-hidden="true"
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block truncate text-[14.5px]',
                      unread ? 'font-bold' : 'font-medium'
                    )}
                  >
                    {notification.title}
                  </span>
                  {notification.body && (
                    <span className="mt-0.5 line-clamp-2 block text-[13px] text-ink-muted">
                      {notification.body}
                    </span>
                  )}
                  <span className="mt-1 block text-[12px] text-ink-muted">
                    {formatOrderListDate(notification.created_at)}
                  </span>
                </span>

                {unread && (
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-green-electric" />
                )}
              </>
            );

            const className = cn(
              'flex w-full items-start gap-3 rounded-2xl p-4 text-left shadow-card transition-colors',
              unread ? 'bg-green-50' : 'bg-white hover:bg-neutral-100/50'
            );

            return (
              <li key={notification.id}>
                {orderId ? (
                  <Link
                    href={VENDOR_ROUTES.commande(orderId)}
                    onClick={() => handleOpen(notification)}
                    className={className}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpen(notification)}
                    disabled={isPending || !unread}
                    className={className}
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
