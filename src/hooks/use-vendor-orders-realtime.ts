'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Abonnement temps réel aux commandes du vendeur.
 *
 * Canal `vendor-orders-<vendorId>`, table `orders`, filtré sur `vendor_id` —
 * même contrat que l'app iOS.
 *
 * On ne reconstruit pas l'état depuis le payload : les lignes de `orders` ne
 * contiennent ni les articles, ni le client, ni le livreur (ce sont des
 * jointures). On déclenche donc un refetch serveur, qui repasse par le select
 * complet. `onChange` doit être stable (useCallback) pour éviter de se
 * réabonner à chaque rendu.
 */
export function useVendorOrdersRealtime(
  vendorId: string | null,
  onChange: () => void
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!vendorId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`vendor-orders-${vendorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `vendor_id=eq.${vendorId}`,
        },
        () => onChangeRef.current()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendorId]);
}
