'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { getVendorSession } from '@/actions/vendor-auth';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import type { VendorNotification } from '@/types/vendor';

/**
 * Notifications de l'utilisateur connecté.
 *
 * ⚠️ Filtre sur `user_id`, pas `vendor_id` : la policy est
 * `user_id = auth.uid()`. Chaque membre de la boutique a ses propres notifs.
 */
export async function fetchVendorNotifications(): Promise<{
  notifications: VendorNotification[];
  unreadCount: number;
}> {
  const session = await getVendorSession();
  if (!session.ok) return { notifications: [], unreadCount: 0 };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, body, data, is_read, created_at')
    .eq('user_id', session.session.userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[vendor-notifications] fetch:', error.message);
    return { notifications: [], unreadCount: 0 };
  }

  const notifications = (data ?? []) as VendorNotification[];
  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.is_read).length,
  };
}

export async function markNotificationRead(
  notificationId: string
): Promise<{ success: boolean }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false };

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', session.session.userId);

  if (error) {
    console.error('[vendor-notifications] mark read:', error.message);
    return { success: false };
  }

  revalidatePath(VENDOR_ROUTES.notifications);
  return { success: true };
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false };

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', session.session.userId)
    .eq('is_read', false);

  if (error) {
    console.error('[vendor-notifications] mark all:', error.message);
    return { success: false };
  }

  revalidatePath(VENDOR_ROUTES.notifications);
  return { success: true };
}
