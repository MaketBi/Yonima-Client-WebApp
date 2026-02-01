import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';
import { getNotifications } from '@/actions/notifications';
import { NotificationsList } from '@/components/notifications/notifications-list';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'Consultez vos notifications et mises à jour',
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/notifications');
  }

  const notifications = await getNotifications();

  return <NotificationsList initialNotifications={notifications} />;
}
