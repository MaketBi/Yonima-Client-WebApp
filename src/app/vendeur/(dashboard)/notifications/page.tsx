import type { Metadata } from 'next';
import { fetchVendorNotifications } from '@/actions/vendor-notifications';
import { NotificationsView } from '@/components/vendor/notifications/notifications-view';

export const metadata: Metadata = { title: 'Notifications' };
export const dynamic = 'force-dynamic';

export default async function VendeurNotificationsPage() {
  const { notifications, unreadCount } = await fetchVendorNotifications();

  return (
    <NotificationsView notifications={notifications} unreadCount={unreadCount} />
  );
}
