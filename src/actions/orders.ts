'use server';

import { createServerClient } from '@/lib/supabase/server';
import type { Order } from '@/types/models';

/**
 * Get orders for the current user
 */
export async function getUserOrders(): Promise<Order[]> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, vendor:vendors(id, name, logo_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return data as Order[];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Get a single order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        vendor:vendors(id, name, logo_url, phone, address),
        order_items(*)
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    return data as Order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

/**
 * Get active orders for the current user (not delivered or cancelled)
 */
export async function getActiveOrders(): Promise<Order[]> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, vendor:vendors(id, name, logo_url)')
      .eq('user_id', user.id)
      .not('status', 'in', '("delivered","cancelled")')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active orders:', error);
      return [];
    }

    return data as Order[];
  } catch (error) {
    console.error('Error fetching active orders:', error);
    return [];
  }
}
