'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { getVendorSession } from '@/actions/vendor-auth';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import type {
  DriverCashBalance,
  DriverCashCollection,
  DriverCashDeposit,
} from '@/types/vendor';

const PAGE_SIZE = 20;

/** Soldes de tous les livreurs (vue `driver_cash_balances`). */
export async function fetchDriverCashBalances(): Promise<{
  balances: DriverCashBalance[];
  error?: string;
}> {
  const session = await getVendorSession();
  if (!session.ok) return { balances: [], error: 'Session vendeur introuvable' };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('driver_cash_balances')
    .select('*')
    .eq('vendor_id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-cash] balances:', error.message);
    return { balances: [], error: 'Impossible de charger les soldes livreurs' };
  }

  const balances = (data ?? []) as DriverCashBalance[];
  // La vue n'a pas d'ordre : le cash en main le plus élevé d'abord.
  balances.sort((a, b) => (b.cash_on_hand ?? 0) - (a.cash_on_hand ?? 0));

  return { balances };
}

/** Encaissements d'un livreur, enrichis du numéro de commande. */
export async function fetchDriverCollections(
  driverId: string,
  page = 0
): Promise<{
  collections: (DriverCashCollection & { order_number?: string })[];
  hasMore: boolean;
}> {
  const session = await getVendorSession();
  if (!session.ok) return { collections: [], hasMore: false };

  const supabase = await createServerClient();
  const offset = page * PAGE_SIZE;

  const { data, error } = await supabase
    .from('driver_cash_collections')
    .select('*')
    // La policy RLS impose déjà `is_platform_driver = false` — on le répète
    // explicitement pour que l'intention soit lisible dans le code.
    .eq('is_platform_driver', false)
    .eq('driver_id', driverId)
    .eq('vendor_id', session.session.vendor.id)
    .order('collected_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error('[vendor-cash] collections:', error.message);
    return { collections: [], hasMore: false };
  }

  const collections = (data ?? []) as DriverCashCollection[];

  // Les numéros de commande vivent dans `orders` : une requête groupée.
  const orderIds = [...new Set(collections.map((c) => c.order_id).filter(Boolean))];
  let numbersById: Record<string, string> = {};

  if (orderIds.length > 0) {
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number')
      .in('id', orderIds as string[]);

    numbersById = (orders ?? []).reduce<Record<string, string>>((acc, order) => {
      acc[order.id as string] = order.order_number as string;
      return acc;
    }, {});
  }

  return {
    collections: collections.map((collection) => ({
      ...collection,
      order_number: collection.order_id
        ? numbersById[collection.order_id]
        : undefined,
    })),
    hasMore: collections.length === PAGE_SIZE,
  };
}

/** Versements d'un livreur — les `pending` remontent en tête. */
export async function fetchDriverDeposits(
  driverId: string,
  page = 0
): Promise<{ deposits: DriverCashDeposit[]; hasMore: boolean }> {
  const session = await getVendorSession();
  if (!session.ok) return { deposits: [], hasMore: false };

  const supabase = await createServerClient();
  const offset = page * PAGE_SIZE;

  const { data, error } = await supabase
    .from('driver_cash_deposits')
    .select('*')
    // Un versement `platform` va du livreur vers Yonima : le vendeur n'a rien
    // à valider dessus. 4 lignes de ce type existent en prod — cas réel.
    .eq('deposit_recipient', 'vendor')
    .eq('driver_id', driverId)
    .eq('vendor_id', session.session.vendor.id)
    .order('declared_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error('[vendor-cash] deposits:', error.message);
    return { deposits: [], hasMore: false };
  }

  const deposits = (data ?? []) as DriverCashDeposit[];
  deposits.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return b.declared_at.localeCompare(a.declared_at);
  });

  return { deposits, hasMore: deposits.length === PAGE_SIZE };
}

/**
 * Valide ou rejette un versement.
 *
 * `validated_at` n'est pas envoyé : il est posé par un trigger DB.
 * Le double filtre `vendor_id` est ajouté ici alors que l'app iOS ne filtre
 * que sur `id` — on ne se repose pas uniquement sur la RLS.
 */
export async function reviewDriverDeposit(
  depositId: string,
  decision: 'confirm' | 'reject',
  options: { validatorNote?: string; rejectionReason?: string } = {}
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.permissions.can_view_drivers) {
    return { success: false, error: "Vous n'avez pas la permission de gérer la caisse" };
  }

  if (decision === 'reject' && !options.rejectionReason?.trim()) {
    return { success: false, error: 'La raison du rejet est obligatoire' };
  }

  const supabase = await createServerClient();

  const payload: Record<string, string | null> =
    decision === 'confirm'
      ? {
          status: 'confirmed',
          validator_note: options.validatorNote?.trim() || null,
        }
      : {
          status: 'rejected',
          rejection_reason: options.rejectionReason!.trim(),
          validator_note: options.validatorNote?.trim() || null,
        };

  const { error } = await supabase
    .from('driver_cash_deposits')
    .update(payload)
    .eq('id', depositId)
    .eq('vendor_id', session.session.vendor.id)
    // Garde-fou : interdit de valider un versement destiné à la plateforme,
    // même si son id fuitait dans une requête forgée.
    .eq('deposit_recipient', 'vendor');

  if (error) {
    console.error('[vendor-cash] review:', error.message);
    return {
      success: false,
      error:
        decision === 'confirm'
          ? 'Erreur lors de la confirmation du versement'
          : 'Erreur lors du rejet du versement',
    };
  }

  revalidatePath(VENDOR_ROUTES.caisse);
  return { success: true };
}
