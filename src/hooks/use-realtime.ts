'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/types/models';

/**
 * Hook for real-time order status updates
 * Corresponds to Android's Realtime subscription pattern
 */
export function useRealtimeOrder(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    // Initial fetch
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select(`
            *,
            vendor:vendors(id, name, logo_url, phone),
            order_items(*)
          `)
          .eq('id', orderId)
          .single();

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setOrder(data as Order);
        }
      } catch (err) {
        setError('Erreur lors du chargement de la commande');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();

    // Real-time subscription
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev) =>
            prev ? { ...prev, ...payload.new } : (payload.new as Order)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return { order, isLoading, error };
}

/**
 * Hook for real-time orders list updates
 */
export function useRealtimeOrders(userId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) return;

    const supabase = createClient();
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          vendor:vendors(id, name, logo_url),
          order_items(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setOrders(data as Order[]);
      }
    } catch (err) {
      setError('Erreur lors du chargement des commandes');
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    // Initial fetch
    const fetchOrders = async () => {
      setIsLoading(true);
      await refetch();
      setIsLoading(false);
    };

    fetchOrders();

    // Real-time subscription for all user's orders
    const channel = supabase
      .channel(`orders-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders((prev) => [payload.new as Order, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) =>
              prev.filter((order) => order.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  return { orders, isLoading, error, refetch };
}

/**
 * Hook for real-time notifications count
 */
export function useUnreadNotificationsCount(userId: string | null) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    // Initial count
    const fetchCount = async () => {
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      setCount(unreadCount || 0);
    };

    fetchCount();

    // Real-time subscription
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refetch count on any change
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return count;
}
