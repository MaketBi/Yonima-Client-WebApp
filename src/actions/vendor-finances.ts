'use server';

import { createServerClient } from '@/lib/supabase/server';
import { getVendorSession } from '@/actions/vendor-auth';
import type {
  VendorPaymentInfo,
  VendorPayout,
  VendorWallet,
  WalletTransaction,
} from '@/types/vendor';

const PAGE_SIZE = 20;

/**
 * Portefeuille du vendeur.
 *
 * RLS : `is_vendor_owner(vendor_id) OR is_admin()`. Nos utilisateurs sont
 * toujours `vendor_admin`, donc la lecture passe par `is_vendor_owner`.
 * ⚠️ Si ça remonte vide alors que des données existent, c'est le câblage
 * `users.vendor_id` / `vendors.owner_id` qu'il faut regarder, pas les colonnes.
 */
export async function fetchVendorWallet(): Promise<{
  wallet: VendorWallet | null;
  error?: string;
}> {
  const session = await getVendorSession();
  if (!session.ok) return { wallet: null, error: 'Session vendeur introuvable' };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('vendor_wallets')
    .select(
      'id, vendor_id, balance, pending_balance, total_earned, total_withdrawn, payout_frequency, min_payout_amount, is_active, is_blocked, blocked_reason, last_payout_at'
    )
    .eq('vendor_id', session.session.vendor.id)
    .maybeSingle();

  if (error) {
    console.error('[vendor-finances] wallet:', error.message);
    return { wallet: null, error: 'Impossible de charger votre portefeuille' };
  }

  return { wallet: (data as VendorWallet) ?? null };
}

/** Coordonnées de paiement — lecture seule en v1. */
export async function fetchVendorPaymentInfo(): Promise<VendorPaymentInfo | null> {
  const session = await getVendorSession();
  if (!session.ok) return null;

  const supabase = await createServerClient();
  const { data } = await supabase
    .from('vendor_payment_info')
    .select(
      'vendor_id, wave_phone, wave_name, wave_verified, orange_money_phone, orange_money_name, orange_money_verified, preferred_method'
    )
    .eq('vendor_id', session.session.vendor.id)
    .maybeSingle();

  return (data as VendorPaymentInfo) ?? null;
}

export async function fetchWalletTransactions(
  page = 0
): Promise<{ transactions: WalletTransaction[]; hasMore: boolean }> {
  const session = await getVendorSession();
  if (!session.ok) return { transactions: [], hasMore: false };

  const supabase = await createServerClient();
  const offset = page * PAGE_SIZE;

  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('id, reference, type, amount, direction, balance_after, description, created_at')
    .eq('vendor_id', session.session.vendor.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error('[vendor-finances] transactions:', error.message);
    return { transactions: [], hasMore: false };
  }

  const transactions = (data ?? []) as WalletTransaction[];
  return { transactions, hasMore: transactions.length === PAGE_SIZE };
}

export async function fetchVendorPayouts(
  page = 0
): Promise<{ payouts: VendorPayout[]; hasMore: boolean }> {
  const session = await getVendorSession();
  if (!session.ok) return { payouts: [], hasMore: false };

  const supabase = await createServerClient();
  const offset = page * PAGE_SIZE;

  const { data, error } = await supabase
    .from('payouts')
    .select(
      'id, payout_reference, period_start, period_end, gross_amount, total_commissions, total_adjustments, fee, net_amount, order_count, status, payout_method, payout_phone, payout_name, processed_at, created_at'
    )
    .eq('vendor_id', session.session.vendor.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error('[vendor-finances] payouts:', error.message);
    return { payouts: [], hasMore: false };
  }

  const payouts = (data ?? []) as VendorPayout[];
  return { payouts, hasMore: payouts.length === PAGE_SIZE };
}
