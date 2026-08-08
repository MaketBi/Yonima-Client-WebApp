'use server';

import { createServerClient } from '@/lib/supabase/server';
import { getVendorSession } from '@/actions/vendor-auth';
import {
  ACTIVE_ORDER_STATUSES,
  NEXT_ORDER_STATUS,
  type OrderStatus,
  type VendorDriver,
  type VendorOrder,
} from '@/types/vendor';

/**
 * Select partagé par la liste et le détail.
 *
 * ⚠️ Deux subtilités confirmées côté iOS et backend :
 * - les lignes viennent de la **vue** `order_items_detailed` (pas de la table
 *   `order_items`), aliasée `order_items` ;
 * - le livreur se joint via **`assigned_driver_id`** (`orders.driver_id` est mort).
 *   La policy `drivers_select_by_assigned_vendor` rend visibles les livreurs pool
 *   pour l'owner — aucun RPC n'est nécessaire ici.
 */
const ORDER_SELECT = `
  *,
  order_items:order_items_detailed(*),
  user:users!user_id(id, phone, full_name),
  driver:drivers!assigned_driver_id(id, name, phone)
`;

/** Les commandes du vendeur connecté. La RLS filtre déjà, on borne le volume. */
export async function fetchVendorOrders(): Promise<{
  orders: VendorOrder[];
  error?: string;
}> {
  const session = await getVendorSession();
  if (!session.ok) return { orders: [], error: 'Session vendeur introuvable' };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('vendor_id', session.session.vendor.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[vendor-orders] fetchVendorOrders:', error.message);
    return { orders: [], error: 'Impossible de charger les commandes' };
  }

  return { orders: (data ?? []) as unknown as VendorOrder[] };
}

/** Une commande, avec vérification explicite du rattachement au vendeur. */
export async function fetchVendorOrder(
  orderId: string
): Promise<{ order: VendorOrder | null; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { order: null, error: 'Session vendeur introuvable' };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('id', orderId)
    .eq('vendor_id', session.session.vendor.id)
    .maybeSingle();

  if (error) {
    console.error('[vendor-orders] fetchVendorOrder:', error.message);
    return { order: null, error: 'Impossible de charger la commande' };
  }

  return { order: (data as unknown as VendorOrder) ?? null };
}

/**
 * Fait avancer une commande : `pending → preparing → ready`.
 *
 * La policy `orders` est `FOR ALL` sans machine à états côté DB : c'est donc
 * ici qu'on interdit les transitions illégitimes. On revérifie le statut
 * courant en base plutôt que de faire confiance au client.
 */
export async function advanceOrderStatus(
  orderId: string
): Promise<{ success: boolean; status?: OrderStatus; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.permissions.can_manage_orders) {
    return { success: false, error: "Vous n'avez pas la permission de gérer les commandes" };
  }

  const supabase = await createServerClient();

  const { data: current, error: readError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .eq('vendor_id', session.session.vendor.id)
    .maybeSingle();

  if (readError || !current) {
    return { success: false, error: 'Commande introuvable' };
  }

  const nextStatus = NEXT_ORDER_STATUS[current.status as OrderStatus];
  if (!nextStatus) {
    return { success: false, error: 'Cette commande ne peut plus être modifiée' };
  }

  // Horodatage posé côté client, comme l'app iOS (pas de trigger DB dessus).
  const now = new Date().toISOString();
  const payload: Record<string, string> = { status: nextStatus };
  if (nextStatus === 'preparing') payload.prepared_at = now;
  if (nextStatus === 'ready') payload.ready_at = now;

  const { error } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', orderId)
    .eq('vendor_id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-orders] advanceOrderStatus:', error.message);
    return { success: false, error: 'La mise à jour a échoué' };
  }

  return { success: true, status: nextStatus };
}

/**
 * Livreurs disponibles pour l'assignation.
 *
 * En `pool_only`, le vendeur n'assigne pas lui-même (le dispatch s'en charge) :
 * on ne propose donc que ses livreurs internes.
 */
export async function fetchAssignableDrivers(): Promise<{
  drivers: VendorDriver[];
  error?: string;
}> {
  const session = await getVendorSession();
  if (!session.ok) return { drivers: [], error: 'Session vendeur introuvable' };

  const supabase = await createServerClient();

  // RPC SECURITY DEFINER : depuis le correctif backend, elle exige que
  // `p_vendor_id` corresponde au vendor de l'appelant.
  const { data, error } = await supabase.rpc('get_vendor_drivers', {
    p_vendor_id: session.session.vendor.id,
  });

  if (error) {
    console.error('[vendor-orders] fetchAssignableDrivers:', error.message);
    return { drivers: [], error: 'Impossible de charger les livreurs' };
  }

  return { drivers: (data ?? []) as VendorDriver[] };
}

/** Compteur du badge « À traiter » (sidebar + onglet). */
export async function countActiveOrders(): Promise<number> {
  const session = await getVendorSession();
  if (!session.ok) return 0;

  const supabase = await createServerClient();
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('vendor_id', session.session.vendor.id)
    .in('status', ACTIVE_ORDER_STATUSES);

  return count ?? 0;
}
